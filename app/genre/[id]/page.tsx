'use client';

import Navigation from '../../components/Navigation';
import Link from 'next/link';

type GenreData = {
  [key: string]: {
    name: string;
    description: string;
  };
};

export default function GenreDetailPage({ params }: { params: { id: string } }) {
  // In a real app, this would be fetched from an API
  const genreData: GenreData = {
    '1': { name: 'Classical', description: 'Timeless compositions for reflection' },
    '2': { name: 'Jazz', description: 'Smooth rhythms for relaxation' },
    '3': { name: 'Rock', description: 'Energetic beats for motivation' },
    '4': { name: 'Electronic', description: 'Modern sounds for focus' },
    '5': { name: 'Hip Hop', description: 'Rhythmic flows for confidence' },
    '6': { name: 'Pop', description: 'Catchy tunes for happiness' },
  };

  const genre = genreData[params.id] || { name: 'Unknown Genre', description: 'No description available' };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-grow py-16 px-6 bg-gradient-to-b from-fresh-green-50 to-sky-blue">
        <div className="container mx-auto max-w-4xl">
          <Link href="/genres-page" className="inline-block mb-6 text-fresh-purple-600 hover:text-fresh-purple-800 font-medium">
            ← Back to Genres
          </Link>
          
          <h1 className="text-4xl font-bold mb-4 text-fresh-green-800">{genre.name} in FreyaAI</h1>
          <p className="text-xl mb-10 text-fresh-green-700">{genre.description}</p>
          
          <div className="bg-white rounded-xl shadow-lg p-8 border border-fresh-green-100">
            <h2 className="text-2xl font-bold mb-6 text-fresh-green-800">Featured Tracks</h2>
            
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((track) => (
                <div key={track} className="flex items-center p-4 border border-fresh-green-200 rounded-lg hover:bg-fresh-green-50 transition-colors">
                  <div className="flex-shrink-0 w-16 h-16 bg-fresh-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-8 h-8 text-fresh-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-fresh-green-800">Track Title {track}</h3>
                    <p className="text-fresh-green-600">Artist Name</p>
                  </div>
                  <button className="text-fresh-purple-600 hover:text-fresh-purple-800 font-medium">
                    Play
                  </button>
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