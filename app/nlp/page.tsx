'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import Link from 'next/link';
import { useAuth } from '../context/auth';

export default function NLPPage() {
  const [emotionDetail, setEmotionDetail] = useState('');
  const [mainEmotion, setMainEmotion] = useState('');
  const [refinedEmotion, setRefinedEmotion] = useState('');
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

  const handleAnalyzeEmotion = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/api/nlp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ mainEmotion, emotionDetail }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze emotion');
      }
      
      setRefinedEmotion(data.refinedEmotion || data.emotion);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      const response = await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/api/create_playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ emotion: refinedEmotion || mainEmotion }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create playlist');
      }
      
      // Redirect to recommendations page with playlist data
      router.push('/recommendations');
    } catch (err: any) {
      setError(err.message);
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
          <h1 className="text-4xl font-bold mb-8 text-center text-fresh-green-800">Natural Language Processing with FreyaAI</h1>
          
          <div className="bg-white rounded-xl shadow-lg p-8 mb-10 border border-fresh-green-100">
            <h2 className="text-2xl font-bold mb-4 text-fresh-green-800">Describe Your Emotion</h2>
            <p className="text-fresh-green-700 mb-6">
              Tell us how you're feeling in your own words. Our AI will analyze your text and recommend music that matches your emotional state.
            </p>
            
            <div className="mb-4">
              <label className="block text-fresh-green-700 font-medium mb-2">Main Emotion</label>
              <input
                type="text"
                value={mainEmotion}
                onChange={(e) => setMainEmotion(e.target.value)}
                className="w-full p-4 border border-fresh-green-200 rounded-lg mb-4 focus:ring-2 focus:ring-fresh-purple-500 focus:border-fresh-purple-500"
                placeholder="e.g., Joy, Sadness, Anger..."
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-fresh-green-700 font-medium mb-2">Detailed Description</label>
              <textarea 
                value={emotionDetail}
                onChange={(e) => setEmotionDetail(e.target.value)}
                className="w-full h-40 p-4 border border-fresh-green-200 rounded-lg mb-6 focus:ring-2 focus:ring-fresh-purple-500 focus:border-fresh-purple-500"
                placeholder="Describe your feelings in more detail..."
              ></textarea>
            </div>
            
            <button 
              onClick={handleAnalyzeEmotion}
              disabled={isLoading}
              className="bg-fresh-purple-500 hover:bg-fresh-purple-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Emotion'}
            </button>
            
            {refinedEmotion && (
              <div className="mt-6 p-4 bg-fresh-green-50 rounded-lg">
                <h3 className="text-lg font-bold text-fresh-green-800">Refined Emotion:</h3>
                <p className="text-fresh-green-700">{refinedEmotion}</p>
                <button 
                  onClick={handleCreatePlaylist}
                  className="mt-4 bg-fresh-green-500 hover:bg-fresh-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Create Playlist
                </button>
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
              <h3 className="text-xl font-bold mb-4 text-fresh-green-800">How It Works</h3>
              <ul className="list-disc pl-5 text-fresh-green-700 space-y-2">
                <li>Advanced NLP processes your emotional description</li>
                <li>Identifies specific emotions from Darwin's taxonomy</li>
                <li>Matches emotions to appropriate music genres</li>
                <li>Generates a personalized playlist</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-fresh-green-100">
              <h3 className="text-xl font-bold mb-4 text-fresh-green-800">Why Darwin's Taxonomy?</h3>
              <p className="text-fresh-green-700">
                FreyaAI uses Charles Darwin's foundational work on emotional expression to provide more nuanced 
                emotion recognition than traditional models, resulting in more accurate music recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-fresh-green-900 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <p className="text-fresh-green-200">© 2025 Richard Jiang, All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}