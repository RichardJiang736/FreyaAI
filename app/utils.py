from flask import current_app, session
from .models import UserGenre
from dataclasses import dataclass
import spotipy, random, os
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
from .cache import cache_get, cache_set

random.seed(42)
ALL_GENRES = []
PERMISSION_ERROR = "Spotify client not authenticated"

URL = 'https://api.reccobeats.com/v1/audio-features'
HEADERS = {'Accept': 'application/json'}

POSITIVE_EMOTIONS_DESC = [
    "Joy", "Love", "Devotion", "Tender feelings", "High spirits", "Pride", "Patience", "Affirmation",
    "Surprise", "Self-attention", "Modesty", "Reflection", "Meditation", "Determination"
]
NEGATIVE_EMOTIONS_ASC = [
    "Suffering", "Weeping", "Low spirits", "Anxiety", "Fear", "Grief", "Dejection", 
    "Despair", "Anger", "Hatred", "Disdain", "Contempt", "Disgust", "Guilt", "Helplessness", "Ill-temper", "Sulkiness"
]
RANDOM_EMOTIONS = [
    "Negation", "Shyness", "Blushing"
]

def init_app(app):
    genres_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'GENRES.md'))
    app.config['GENRES_PATH'] = genres_path
    
    # Initialize cache for genres
    try:
        with open(genres_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            all_genres = [line.strip() for line in lines if line.strip()]
            cache_set('all_genres', all_genres)
    except Exception as e:
        current_app.logger.error(f"Error caching genres: {e}")
    
    return genres_path

# Lightweight DTO for tracks gathered from Spotify (not persisted in DB)
@dataclass
class TrackDTO:
    spotify_id: str
    title: str
    artist: str
    album: str
    score: int
    emotion: str

#* Check if the user have access token or not for Spotify Access
def get_spotify_client(access_token=None):
    if not access_token:
        if 'token_info' not in session:
            current_app.logger.error("No token info in session")
            return None
        access_token = session['token_info']['access_token']
    return spotipy.Spotify(auth=access_token)

#* Fetch audio features for multiple tracks in batch
def fetch_audio_features_batch(track_ids):
    # Check cache first
    uncached_ids = []
    cached_features = {}
    
    for tid in track_ids:
        cached = cache_get(f"audio_features_{tid}")
        if cached is not None:
            cached_features[tid] = cached
        else:
            uncached_ids.append(tid)
    
    if not uncached_ids:
        # All tracks are cached
        return cached_features
    
    # Fetch uncached tracks in batches
    batch_size = 50  # API limit
    features_dict = {}
    
    for i in range(0, len(uncached_ids), batch_size):
        batch_ids = uncached_ids[i:i+batch_size]
        params = {'ids': ','.join(batch_ids)}
        
        try:
            response = requests.get(URL, headers=HEADERS, params=params, timeout=10)
            response.raise_for_status()
            
            music_features = response.json().get('content', [])
            if music_features and isinstance(music_features, list):
                for feature in music_features:
                    if feature and 'id' in feature:
                        track_id = feature['id']
                        features_dict[track_id] = feature
                        # Cache the result
                        cache_set(f"audio_features_{track_id}", feature)
        except Exception as e:
            current_app.logger.error(f"Error fetching audio features for batch: {e}")
            # Return empty features for failed tracks
            for track_id in batch_ids:
                features_dict[track_id] = {}
    
    # Combine cached and newly fetched features
    result = cached_features.copy()
    result.update(features_dict)
    
    return result

#* Process tracks in parallel to get audio features
def process_tracks_parallel(tracks_data, emotion):
    track_objects = []
    
    # Extract track IDs
    track_ids = [track_data['id'] for track_data in tracks_data if track_data.get('id')]
    
    # Fetch audio features in batch
    features_dict = fetch_audio_features_batch(track_ids)
    
    # Process tracks with their features
    for track_data in tracks_data:
        track_id = track_data.get('id')
        if not track_id:
            continue
            
        try:
            features = features_dict.get(track_id, {})
            score = calculate_composite_score(features) if features else 0
            
            track_objects.append(TrackDTO(
                spotify_id=track_id,
                title=track_data.get('name', ''),
                artist=track_data.get('artists', [{}])[0].get('name', ''),
                album=track_data.get('album', {}).get('name', ''),
                score=score,
                emotion=emotion
            ))
        except Exception as e:
            current_app.logger.error(f"Error processing track '{track_id}': {e}")
            continue
    
    return track_objects

#* Get tracks from Spotify based on the user's selected genres and the emotion
def get_selected_tracks(emotion, max_count=20):
    sp = get_spotify_client()
    if not sp:
        raise PermissionError(PERMISSION_ERROR)

    # Load genres (optimized with caching)
    GENRES_PATH = current_app.config['GENRES_PATH']
    ALL_GENRES = cache_get('all_genres')
    
    if ALL_GENRES is None:
        if not GENRES_PATH or not os.path.exists(GENRES_PATH):
            current_app.logger.error(f"GENRES.md not found or path not set. GENRES_PATH={GENRES_PATH}")
            return []
        with open(GENRES_PATH, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            ALL_GENRES = [line.strip() for line in lines if line.strip()]
            cache_set('all_genres', ALL_GENRES)
    
    # Combine user and random genres
    # Prefer session cache, fall back to DB if not present
    user_genres = session.get('selectedGenres')
    if not user_genres:
        uid = session.get('user_id')
        if uid:
            try:
                user_genres = [g.genre for g in UserGenre.query.filter_by(user_id=uid).all()]
                # Cache in session for downstream usage in this request and next
                session['selectedGenres'] = user_genres
            except Exception as e:
                current_app.logger.error(f"Error loading user genres from DB: {e}")
                user_genres = []
        else:
            user_genres = []
    print(f"These are your genres: {user_genres}")
    if len(user_genres) > 2:
        user_genres = random.sample(user_genres, k=2)
    
    random_genres = random.sample(ALL_GENRES, k=5-len(user_genres))
    combined_genres = list(set(user_genres + random_genres))
    print(f"These are all of your genres: {combined_genres}")

    # Map emotion to keyword
    print(f"Emotion to Process: {emotion}")
    # Distribute track selection equally across all combined genres
    num_genres = len(combined_genres)
    per_genre = max_count // num_genres if num_genres else 0
    
    # Collect all tracks first
    all_tracks_data = []
    
    """
    Feature Input: Track ID
    
    Retrieve IDs (Total Tracks)
    
    Features to Analyse:
    ['acousticness', 'danceability', 'energy', 'instrumentalness', 'key', 
    'liveness', 'loudness', 'mode', 'speechiness', 'tempo', 'valence']
    """
    for genre in combined_genres:
        print(f"Currently Processing: {genre}")
        try:
            # Search for playlists by emotion and genre
            query = f"{emotion} {genre}"
            results = sp.search(q=query, type='playlist', limit=5)
            if not results or not results['playlists']['items']:
                continue
            
            # Fetch tracks from the first playlist
            playlist_id = results['playlists']['items'][0]['id']
            total_tracks = sp.playlist_tracks(playlist_id)
            if not total_tracks or not total_tracks['items']:
                continue
            all_tracks = total_tracks['items']
            if len(all_tracks) < per_genre:
                continue
            
            # Select a subset of tracks for this genre
            if emotion in POSITIVE_EMOTIONS_DESC:
                selected_tracks = sorted(all_tracks, key=lambda t: t.get('track', {}).get('popularity', 0), reverse=False)[:per_genre]
            elif emotion in NEGATIVE_EMOTIONS_ASC:
                selected_tracks = sorted(all_tracks, key=lambda t: t.get('track', {}).get('popularity', 0), reverse=True)[:per_genre]
            else:
                selected_tracks = random.sample(all_tracks, k=per_genre)
            
            # Extract track data
            for item in selected_tracks:
                track_data = item.get('track') if item else None
                if track_data and track_data.get('id'):
                    all_tracks_data.append(track_data)
        except Exception as e:
            current_app.logger.error(f"Error fetching tracks for genre '{genre}': {e}")
            continue
    
    # Process all tracks in parallel to get audio features
    song_objects = process_tracks_parallel(all_tracks_data, emotion)
    
    # Sort by score based on emotion
    if emotion in POSITIVE_EMOTIONS_DESC:
        song_objects.sort(key=lambda t: t.score, reverse=False)
    elif emotion in NEGATIVE_EMOTIONS_ASC:
        song_objects.sort(key=lambda t: t.score, reverse=True)
    
    return song_objects[:max_count]

#* Function for creating a Spotify playlist
def create_spotify_playlist(emotion, tracks):
    sp = get_spotify_client()
    if not sp:
        raise PermissionError(PERMISSION_ERROR)
    if not tracks:
        print("No tracks provided to create a playlist")
        return None

    try:
        profile = sp.me() or {}
        user_id = profile.get('id')
        if not user_id:
            current_app.logger.error("Failed to retrieve Spotify user ID")
            return None
        
        emotion = emotion[0].upper() + emotion[1:]  # correctly capitalised
        playlist = sp.user_playlist_create(user_id, f"Your {emotion} Playlist", public=False)
        if not playlist or 'id' not in playlist:
            print("Failed to create playlist or missing playlist ID")
            return None
        track_uris = [f"spotify:track:{track.spotify_id}" for track in tracks]
        sp.playlist_add_items(playlist['id'], track_uris)
    except Exception as e:
        current_app.logger.error(f"Error creating playlist: {e}")
        return None

    return playlist['id']

#* Create Embedded Codes for the curated playlist and the top 5 tracks
def get_embedded_playlist_code(playlist_id):
    return f'<iframe src="https://open.spotify.com/embed/playlist/{playlist_id}?utm_source=generator" width="100%" height="808" frameborder="0" allowtransparency="true" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>'
def get_embedded_track_code(track_id):
    return f'<iframe src="https://open.spotify.com/embed/track/{track_id}" width="300" height="380" frameborder="0" allowfullscreen="" allowtransparency="true" allow="encrypted-media"></iframe>'

#* Defining each metric's weight in the overall recommendation of the song
def calculate_composite_score(track):
    """Composite score emphasizing emotion-defining attributes.
    Higher weights for valence (positivity), energy (arousal), danceability, and tempo.
    Lower weights for popularity and ancillary acoustic traits.
    Note: loudness/tempo are assumed pre-normalized upstream.
    """
    return (
        track['valence'] * 0.35 +
        track['energy'] * 0.20 +
        track['danceability'] * 0.15 +
        track['tempo'] * 0.10 +
        track['loudness'] * 0.08 +
        track['liveness'] * 0.08 +
        track['instrumentalness'] * 0.02 +
        track['speechiness'] * 0.02
    )

#* Recommend top 5 tracks
def get_top_recommended_tracks(emotion, playlist_id, limit=5):
    sp = get_spotify_client()
    if not sp:
        raise PermissionError("Spotify client not authenticated")

    try:
        data = sp.playlist_tracks(playlist_id) or {}
        items = data.get('items') or []
        
        # Extract all track data first
        tracks_data = []
        for item in items:
            track_data = item.get('track') if item else None
            if track_data and track_data.get('id'):
                tracks_data.append(track_data)
        
        # Process all tracks in parallel
        tracks = process_tracks_parallel(tracks_data, emotion)
        
        # Sort and limit based on emotion
        if emotion in POSITIVE_EMOTIONS_DESC:
            return sorted(tracks, key=lambda t: t.score, reverse=False)[:limit]
        elif emotion in NEGATIVE_EMOTIONS_ASC:
            return sorted(tracks, key=lambda t: t.score, reverse=True)[:limit]
        else:
            return random.sample(tracks, k=min(limit, len(tracks)))
        
    except Exception as e:
        current_app.logger.error(f"Error fetching playlist tracks for '{playlist_id}': {e}")
        return []