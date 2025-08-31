'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/auth';

export default function RecommendationsPage() {
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // In a real implementation, you would fetch the playlist data from your backend
    // For now, we'll simulate with mock data
    const fetchPlaylistData = async () => {
      try {
        // This would be replaced with an actual API call to get playlist data
        // const response = await fetch('/api/playlist/data');
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockData = {
          embedded_playlist_code: '<iframe src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator" width="100%" height="808" frameborder="0" allowtransparency="true" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
          top_tracks_embedded: [
            '<iframe src="https://open.spotify.com/embed/track/450pIumGxo4gf8bVXj4NKN" width="300" height="380" frameborder="0" allowfullscreen="" allowtransparency="true" allow="encrypted-media"></iframe>',
            '<iframe src="https://open.spotify.com/embed/track/2Fxmhks0bxGSBdJ92vM42m" width="300" height="380" frameborder="0" allowfullscreen="" allowtransparency="true" allow="encrypted-media"></iframe>',
            '<iframe src="https://open.spotify.com/embed/track/3VqHuw0wFlIHcIPWkhIbdQ" width="300" height="380" frameborder="0" allowfullscreen="" allowtransparency="true" allow="encrypted-media"></iframe>',
            '<iframe src="https://open.spotify.com/embed/track/63OQupATfueTdZMWTxZa5u" width="300" height="380" frameborder="0" allowfullscreen="" allowtransparency="true" allow="encrypted-media"></iframe>',
            '<iframe src="https://open.spotify.com/embed/track/23x6WgYKq9Ena7DWUlYWa7" width="300" height="380" frameborder="0" allowfullscreen="" allowtransparency="true" allow="encrypted-media"></iframe>'
          ]
        };
        
        setPlaylistData(mockData);
        setTopTracks(mockData.top_tracks_embedded);
      } catch (err) {
        setError('Failed to load playlist data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistData();
  }, [isAuthenticated]);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-2xl text-fresh-green-800">Loading your personalized playlist...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-2xl text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-grow py-16 px-6 bg-gradient-to-b from-fresh-green-50 to-sky-blue">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 text-center text-fresh-green-800">Your Personalized Playlist</h1>
          
          {playlistData && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-fresh-green-800">Full Playlist</h2>
              <div className="bg-white rounded-xl shadow-lg p-4 border border-fresh-green-100">
                <div dangerouslySetInnerHTML={{ __html: playlistData.embedded_playlist_code }} />
              </div>
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-bold mb-4 text-fresh-green-800">Top Recommended Tracks</h2>
            <div className="space-y-4">
              {topTracks.map((track, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-4 border border-fresh-green-100">
                  {/* Convert the iframe to compact mode by modifying the height and width */}
                  <div dangerouslySetInnerHTML={{ 
                    __html: track.replace('height="380"', 'height="152"').replace('width="300"', 'width="100%"') 
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-fresh-green-900 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <p className="text-fresh-green-200">© 2025 FreyaAI, All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}