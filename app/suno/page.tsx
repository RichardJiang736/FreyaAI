'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import Link from 'next/link';
import { useAuth } from '../context/auth';

export default function SunoPage() {
  const [prompt, setPrompt] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleGenerateMusic = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for the music you want');
      return;
    }

    setIsLoading(true);
    setError('');
    setAudioUrl('');
    
    try {
      const response = await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/api/generate-music`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate music');
      }
      
      setAudioUrl(data.audio_url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-fresh-green-50 to-sky-blue">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-green-600 mx-auto mb-4"></div>
          <p className="text-fresh-green-700">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-grow py-16 px-6 bg-gradient-to-b from-fresh-green-50 to-sky-blue">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center text-fresh-green-800">Suno AI Integration with FreyaAI</h1>
          
          <div className="bg-white rounded-xl shadow-lg p-8 mb-10 border border-fresh-green-100">
            <h2 className="text-2xl font-bold mb-4 text-fresh-green-800">AI-Powered Music Generation</h2>
            <p className="text-fresh-green-700 mb-6">
              Describe the kind of music you want, and our integration with Suno AI will generate custom songs 
              tailored to your emotional state.
            </p>
            
            <div className="mb-6">
              <label className="block text-fresh-green-700 font-medium mb-2">Describe your desired music:</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 p-4 border border-fresh-green-200 rounded-lg focus:ring-2 focus:ring-fresh-purple-500 focus:border-fresh-purple-500"
                placeholder="e.g., A calming piano piece for reflection..."
              ></textarea>
            </div>
            
            <button 
              onClick={handleGenerateMusic}
              disabled={isLoading}
              className="bg-fresh-purple-500 hover:bg-fresh-purple-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Music'}
            </button>
            
            {audioUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-fresh-green-800 mb-2">Generated Music:</h3>
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <a 
                  href={audioUrl} 
                  download="generated-music.mp3"
                  className="mt-2 inline-block bg-fresh-green-500 hover:bg-fresh-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Download
                </a>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                Error: {error}
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-fresh-green-100">
              <h3 className="text-xl font-bold mb-4 text-fresh-green-800">Benefits of AI-Generated Music</h3>
              <ul className="list-disc pl-5 text-fresh-green-700 space-y-2">
                <li>Completely personalized to your emotional needs</li>
                <li>No copyright restrictions on generated music</li>
                <li>Unique compositions for every emotional state</li>
                <li>Instant generation based on your description</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-fresh-green-100">
              <h3 className="text-xl font-bold mb-4 text-fresh-green-800">How It Works</h3>
              <ol className="list-decimal pl-5 text-fresh-green-700 space-y-2">
                <li>Describe the music you want in natural language</li>
                <li>Our system analyzes your emotional state</li>
                <li>Suno AI generates a custom composition</li>
                <li>Listen and download your personalized track</li>
              </ol>
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