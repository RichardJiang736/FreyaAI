'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import Link from 'next/link';
import { useAuth } from '../context/auth';

type Genre = {
  id: number;
  name: string;
  description: string;
};

export default function GenresPage() {
  // Sample genres data
  const allGenres: Genre[] = [
    { id: 1, name: 'Classical', description: 'Timeless compositions for reflection' },
    { id: 2, name: 'Jazz', description: 'Smooth rhythms for relaxation' },
    { id: 3, name: 'Rock', description: 'Energetic beats for motivation' },
    { id: 4, name: 'Electronic', description: 'Modern sounds for focus' },
    { id: 5, name: 'Hip Hop', description: 'Rhythmic flows for confidence' },
    { id: 6, name: 'Pop', description: 'Catchy tunes for happiness' },
    { id: 7, name: 'Blues', description: 'Soulful melodies for contemplation' },
    { id: 8, name: 'Country', description: 'Heartfelt stories for connection' },
    { id: 9, name: 'R&B', description: 'Smooth vocals for romance' },
    { id: 10, name: 'Folk', description: 'Traditional sounds for nostalgia' },
  ];

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
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

  // Load user's selected genres on component mount
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadUserGenres = async () => {
      try {
        const response = await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/genres`, {
          credentials: 'include',
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load genres');
        }
        
        setSelectedGenres(data.genres || []);
      } catch (err: any) {
        console.error('Error loading user genres:', err);
      }
    };

    loadUserGenres();
  }, [isAuthenticated]);

  const handleGenreToggle = (genreName: string) => {
    if (selectedGenres.includes(genreName)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genreName));
    } else {
      setSelectedGenres([...selectedGenres, genreName]);
    }
  };

  const handleSaveGenres = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/update-genres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ genres: selectedGenres }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save genres');
      }
      
      alert('Genres saved successfully!');
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
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 text-center text-fresh-green-800">Music Genres in FreyaAI</h1>
          
          <p className="text-xl text-center mb-12 text-fresh-green-700 max-w-3xl mx-auto">
            Explore our collection of genres, each carefully selected to match specific emotional states.
            Our intelligent randomization prevents music taste cocooning.
          </p>
          
          <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-fresh-green-100">
            <h2 className="text-2xl font-bold mb-4 text-fresh-green-800">Your Selected Genres</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedGenres.length > 0 ? (
                selectedGenres.map(genre => (
                  <span 
                    key={genre} 
                    className="bg-fresh-purple-100 text-fresh-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))
              ) : (
                <p className="text-fresh-green-700">No genres selected yet</p>
              )}
            </div>
            <button 
              onClick={handleSaveGenres}
              disabled={isLoading}
              className="bg-fresh-purple-500 hover:bg-fresh-purple-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Genres'}
            </button>
            {error && (
              <div className="mt-2 p-2 bg-red-50 text-red-700 rounded">
                Error: {error}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {allGenres.map((genre) => (
              <div 
                key={genre.id} 
                className={`rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 border-2 ${
                  selectedGenres.includes(genre.name) 
                    ? 'border-fresh-purple-500 bg-fresh-purple-50' 
                    : 'border-fresh-green-100 bg-white'
                }`}
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-fresh-green-800">{genre.name}</h3>
                  <p className="text-fresh-green-700 mb-4">{genre.description}</p>
                  <button
                    onClick={() => handleGenreToggle(genre.name)}
                    className={`font-semibold py-2 px-4 rounded-lg transition duration-300 ${
                      selectedGenres.includes(genre.name)
                        ? 'bg-fresh-purple-500 text-white hover:bg-fresh-purple-600'
                        : 'bg-fresh-green-100 text-fresh-green-800 hover:bg-fresh-green-200'
                    }`}
                  >
                    {selectedGenres.includes(genre.name) ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
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