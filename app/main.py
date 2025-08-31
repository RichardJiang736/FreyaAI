from flask import Blueprint, request, jsonify, current_app, redirect, session, url_for, render_template, send_from_directory
from .utils import get_selected_tracks, get_top_recommended_tracks, create_spotify_playlist, get_embedded_playlist_code, get_embedded_track_code, get_spotify_client
from .models import User, UserGenre
from .yolo_detector import YOLOEmotionDetector
from spotipy.oauth2 import SpotifyOAuth
from flask_cors import CORS
from .extensions import db
import time
import os
from dotenv import load_dotenv
import logging

PERMISSION_ERROR = "Spotify client not authenticated"

load_dotenv()
main = Blueprint('main', __name__)
# CORS is now configured at the app level, so we don't need to configure it here again

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize YOLO emotion detector
yolo_detector = YOLOEmotionDetector()

#* DEBUGGING
@main.before_request
def log_request_info():
    current_app.logger.info(f"Flask received request: {request.method} {request.url}")
    current_app.logger.info(f"Request headers: {dict(request.headers)}")
    if request.is_json:
        current_app.logger.info(f"Request body: {request.get_json()}")

@main.route('/debug-env')
def debug_env():
    return jsonify({
        'SPOTIFY_SCOPES': current_app.config.get('SPOTIFY_SCOPES'),
        'OTHER_VARIABLE': current_app.config.get('OTHER_VARIABLE')
    })

#* Login, Authentication, Get Token, Signout
@main.route('/callback')
def callback():
    # Initialize Spotify OAuth
    sp_oauth = SpotifyOAuth(
        client_id=current_app.config['SPOTIFY_CLIENT_ID'],
        client_secret=current_app.config['SPOTIFY_CLIENT_SECRET'],
        redirect_uri=current_app.config['SPOTIFY_REDIRECT_URI'],
        scope=current_app.config['SPOTIFY_SCOPES'],
    )
    
    # Retrieve authorization code from the request
    code = request.args.get('code')
    if not code:
        return jsonify({'error': 'Authorization code not found'}), 400
    try:
        token_info = sp_oauth.get_access_token(code, check_cache=False)
        session['token_info'] = token_info
        current_app.logger.info("Token retrieved and stored in session.")
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve access token: {e}")
        return jsonify({'error': f'Failed to retrieve access token: {str(e)}'}), 500
    
    access_token = token_info.get('access_token')
    if not access_token:
        return jsonify({'error': 'Access token not found in token info'}), 500

    sp = get_spotify_client(access_token)
    try:
        user_profile = sp.current_user()  # type: ignore
        display_name = user_profile.get('display_name', 'Unknown User')  # type: ignore
        user_id = user_profile.get('id')  # type: ignore
        if not user_id:
            raise ValueError('Failed to retrieve Spotify user ID')
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve user profile: {e}")
        return jsonify({'error': f'Failed to retrieve user profile: {str(e)}'}), 500

    session['display_name'] = display_name
    session['user_id'] = user_id
    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        new_user = User(user_id=user_id, display_name=display_name)
        db.session.add(new_user)
        db.session.commit()
    
    # Redirect back to Next.js app with a success parameter
    nextjs_url = os.environ.get('NEXTJS_FRONTEND_URL', 'http://localhost:3000')
    return redirect(f'{nextjs_url}/?auth=success')

def check_auth():
    if 'token_info' not in session:
        return redirect(url_for('main.login'))
    return None

def get_token():
    token_info = session.get('token_info')
    if not token_info:
        return None
    now = int(time.time())
    is_expired = token_info['expires_at'] - now < 1440
    
    if is_expired:
        sp_oauth = SpotifyOAuth(
            client_id=current_app.config['SPOTIFY_CLIENT_ID'],
            client_secret=current_app.config['SPOTIFY_CLIENT_SECRET'],
            redirect_uri=current_app.config['SPOTIFY_REDIRECT_URI'],
            scope=current_app.config['SPOTIFY_SCOPES'],
            cache_handler=None
        )
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        session['token_info'] = token_info
    return token_info['access_token']

@main.route('/login')
def login():
    sp_oauth = SpotifyOAuth(
        client_id=current_app.config['SPOTIFY_CLIENT_ID'],
        client_secret=current_app.config['SPOTIFY_CLIENT_SECRET'],
        redirect_uri=current_app.config['SPOTIFY_REDIRECT_URI'],
        scope=current_app.config['SPOTIFY_SCOPES'],
        cache_handler=None
    )
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@main.route('/signout', methods=['POST'])
def signout():
    session.clear()
    return jsonify({'success': True}), 200

@main.route('/api/auth-status')
def auth_status():
    if 'token_info' in session:
        return jsonify({
            'isAuthenticated': True,
            'user': {
                'display_name': session.get('display_name'),
                'user_id': session.get('user_id')
            }
        })
    return jsonify({'isAuthenticated': False}), 401

#* Routes for each page of the website
@main.route('/')
def index():
    return send_from_directory(current_app.static_folder, 'index.html')  # type: ignore

@main.route('/nlp')
def nlp():
    auth_check = check_auth()
    if auth_check:
        return auth_check
    return send_from_directory(current_app.static_folder, 'nlp.html')  # type: ignore

@main.route('/yolo')
def yolo():
    auth_check = check_auth()
    if auth_check:
        return auth_check
    return send_from_directory(current_app.static_folder, 'yolo.html')  # type: ignore

@main.route('/suno')
def suno():
    auth_check = check_auth()
    if auth_check:
        return auth_check
    return send_from_directory(current_app.static_folder, 'suno.html')  # type: ignore

@main.route('/recommendations')
def recommendations():
    auth_check = check_auth()
    if auth_check:
        return auth_check
    return send_from_directory(current_app.static_folder, 'recommendations.html')  # type: ignore

@main.route('/genres-page', methods=['GET'])
def genres_page():
    auth_check = check_auth()
    if auth_check:
        return auth_check
    return send_from_directory(current_app.static_folder, 'genre.html')  # type: ignore

#* Functions for creating tailored playlist
@main.route('/api/create_playlist', methods=['POST'])
def create_playlist():
    auth_check = check_auth()
    if auth_check:
        return auth_check  # Redirect to login if not authenticated

    # Get Access Token for Spotify Access
    current_app.logger.info("create_playlist called")
    access_token = get_token()
    current_app.logger.info(f"Access token: {access_token}")

    if not access_token:
        current_app.logger.warning("No access token found")
        return redirect(url_for('main.login'))
        
    # Get Spotify client
    sp = get_spotify_client(access_token)
    if not sp:
        raise PermissionError(PERMISSION_ERROR)
    
    try:
        # Retrieve emotion from request
        data = request.json
        emotion = data.get('emotion')  # type: ignore
        # Only capitalize the emotion if it exists, otherwise leave it as None
        emotion = emotion[0].upper() + emotion[1:] if emotion else emotion
        current_app.logger.info(f'Received emotion: {emotion}')

        # Get random tracks based on emotion
        tracks = get_selected_tracks(emotion)
        if not tracks:
            return jsonify({'error': f'No tracks found for emotion: {emotion}'}), 404

        # Create Spotify playlist
        spotify_playlist_id = create_spotify_playlist(emotion, tracks)
        if not spotify_playlist_id:
            return jsonify({'error': 'Failed to create Spotify playlist'}), 500
        
        # Get embedded playlist code
        embedded_playlist_code = get_embedded_playlist_code(spotify_playlist_id)
        current_app.logger.info(f"Embedded playlist code: {embedded_playlist_code}")
        
        # Get top recommended tracks
        top_tracks = get_top_recommended_tracks(emotion, spotify_playlist_id)
        if not top_tracks:
            top_tracks = []
        top_tracks_embedded = [get_embedded_track_code(track.spotify_id) for track in top_tracks]

        return jsonify({
            'embedded_playlist_code': embedded_playlist_code,
            'top_tracks_embedded': top_tracks_embedded
        })
    
    except Exception as e:
        error_msg = f"Error in create_playlist: {str(e)}"
        current_app.logger.error(error_msg)
        return jsonify({'error': error_msg}), 500

#* Function for recommending tailored top 5 tracks to the users
@main.route('/api/recommend_top_tracks/<string:playlist_id>', methods=['GET'])
def recommend_top_tracks(playlist_id):
    try:
        data = request.json
        emotion = data.get('emotion') if data else None  # type: ignore
        # Only capitalize the emotion if it exists, otherwise leave it as None
        emotion = emotion[0].upper() + emotion[1:] if emotion else emotion
        current_app.logger.info(f'Received emotion: {emotion}')
        
        top_tracks = get_top_recommended_tracks(emotion, playlist_id)
        tracks_data = [{
            'id': track.spotify_id,
            'title': track.title,
            'artist': track.artist,
            'album': track.album,
            'score': track.score,
            'embedded_track_code': get_embedded_track_code(track.spotify_id)
        } for track in top_tracks]
        return jsonify({'top_tracks': tracks_data}), 200
    
    except Exception as e:
        error_msg = f"Error in recommend_top_tracks: {str(e)}"
        current_app.logger.error(error_msg)
        print(error_msg)
        return jsonify({'error': error_msg}), 500

#* Retrieve and Update user's choosen genres
@main.route('/genres', methods=['GET'])
def get_user_genres():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not logged in'}), 403

    genres = UserGenre.query.filter_by(user_id=user_id).all()
    genre_list = [genre.genre for genre in genres]
    return jsonify({'genres': genre_list})

@main.route('/update-genres', methods=['POST'])
def update_genres():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not logged in'}), 403
    
    data = request.get_json()
    selected_genres = data.get('genres', [])
    UserGenre.query.filter_by(user_id=user_id).delete()  # Delete old genres for the user

    # Add new genres
    for genre in selected_genres:
        print(genre)
        new_genre = UserGenre(user_id=user_id, genre=genre)
        db.session.add(new_genre)
    db.session.commit()
    
    # Keep session cache in sync so downstream code can read it quickly
    session['selectedGenres'] = selected_genres
    return jsonify({"success": True}), 200

#* YOLO Emotion Detection
@main.route('/api/detect-emotion', methods=['POST'])
def detect_emotion():
    """
    Detect emotion using YOLO model from a base64 encoded image.
    """
    try:
        # Get the image data from the request
        data = request.get_json()
        image_data = data.get('image')

        if not image_data:
            return jsonify({
                'success': False,
                'error': 'No image data provided'
            }), 400

        # Detect emotion from the image
        result = yolo_detector.detect_emotion_from_base64(image_data)

        # Always return the detected emotion in the JSON response for downstream processing
        if result.get('emotion'):
            return jsonify({
                'success': True,
                'emotion': result['emotion'],
                'confidence': result.get('confidence'),
                'annotated_image': result.get('annotated_image')
            }), 200
        else:
            # Still return 'emotion' as None for consistency
            return jsonify({
                'success': False,
                'emotion': None,
                'error': result.get('error', 'No emotion detected')
            }), 400

    except Exception as e:
        error_msg = f"Error in detect_emotion: {str(e)}"
        current_app.logger.error(error_msg)
        return jsonify({'error': error_msg, 'emotion': None}), 500

#* Suno Music Generation
@main.route('/api/generate-music', methods=['POST'])
def generate_music():
    """
    Generate music using Suno API based on a text prompt.
    """
    try:
        # Get the prompt from the request
        data = request.get_json()
        prompt = data.get('prompt')
        
        if not prompt:
            current_app.logger.warning("No prompt provided in request")
            return jsonify({
                'success': False,
                'error': 'No prompt provided'
            }), 400
            
        current_app.logger.info(f"Received music generation request with prompt: {prompt}")
            
        # Import the suno module
        from .suno import generate_music, check_status, get_audio_url
        import os
        import time
        
        # Get API key from environment
        api_key = os.environ.get('SUNO_API_KEY')
        if not api_key:
            current_app.logger.error("SUNO_API_KEY not configured")
            return jsonify({
                'success': False,
                'error': 'SUNO_API_KEY not configured'
            }), 500
            
        # Generate music using Suno API
        current_app.logger.info("Initiating music generation with Suno API")
        task_data = generate_music(api_key=api_key, prompt=prompt)
        task_id = task_data.get('taskId') if task_data else None
        
        if not task_id:
            current_app.logger.error("Failed to get task ID from Suno API response")
            return jsonify({
                'success': False,
                'error': 'Failed to initiate music generation'
            }), 500
            
        current_app.logger.info(f"Music generation initiated with task ID: {task_id}")
            
        # Wait for completion (with a timeout) and send status updates
        current_app.logger.info("Waiting for music generation to complete")
        start_time = time.time()
        max_wait_time = 300  # 5 minutes
        last_status = None
        
        while time.time() - start_time < max_wait_time:
            try:
                status = check_status(api_key, task_id)
                if status and status != last_status:
                    current_app.logger.info(f"Task status updated: {status}")
                    last_status = status
                    
                if status == "SUCCESS":
                    current_app.logger.info("Music generation completed successfully")
                    break
                elif status == "FAILED":
                    raise ValueError("Music generation failed")
                time.sleep(5)  # Wait 5 seconds before checking again
            except Exception as e:
                current_app.logger.error(f"Error while waiting for completion: {str(e)}")
                raise
        
        # Get the audio URL
        current_app.logger.info("Retrieving audio URL")
        audio_url = get_audio_url(api_key, task_id)
        
        if not audio_url:
            current_app.logger.error("Failed to retrieve audio URL")
            return jsonify({
                'success': False,
                'error': 'Failed to retrieve audio URL'
            }), 500
        
        # Return success response with audio URL
        return jsonify({
            'success': True,
            'message': 'Music generation completed',
            'task_id': task_id,
            'audio_url': audio_url
        }), 200
        
    except Exception as e:
        error_msg = f"Error in generate_music: {str(e)}"
        current_app.logger.error(error_msg)
        return jsonify({'error': error_msg}), 500