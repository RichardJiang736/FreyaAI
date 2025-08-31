'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from './components/Navigation';
import Link from 'next/link';
import { useAuth } from './context/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || isLoading) {
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
      {/* Navigation */}
      <Navigation />

      {/* Hero Section with fresh green gradient */}
      <div className="flex-grow bg-gradient-to-b from-fresh-green-50 to-sky-blue py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-fresh-green-800">
            <span className="text-fresh-purple-600">Discover Your Emotional Soundtrack</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-fresh-green-700 max-w-3xl mx-auto">
            Let your feelings guide you to the perfect melody. Experience music that resonates with your soul.
          </p>
          <div className="mb-16">
            <button 
              onClick={() => {
                if (isAuthenticated) {
                  router.push('/nlp');
                } else {
                  router.push('/login');
                }
              }}
              className="inline-block bg-fresh-purple-500 hover:bg-fresh-purple-600 text-white font-bold py-4 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Explore your emotions
            </button>
          </div>
        </div>
      </div>

      {/* Features Section with technical details */}
      <div className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-fresh-green-800">
            🎵 FreyaAI: Advanced Emotion-Driven Music Experience
          </h2>
          <p className="text-lg text-center mb-12 text-fresh-green-600">
            Our AI-powered system combines multiple cutting-edge technologies to deliver personalized music experiences
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Genres Selection Feature */}
            <div className="bg-gradient-to-br from-fresh-green-50 to-soft-mint rounded-xl p-8 shadow-lg border border-fresh-green-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-fresh-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <h3 className="text-2xl font-bold text-fresh-green-800">Genres Selection & Randomization</h3>
              </div>
              <p className="text-fresh-green-700 mb-4">
                Users can select preferred genres, but our system intelligently randomizes selections to prevent music taste cocooning.
              </p>
              <ul className="list-disc pl-5 text-fresh-green-700 space-y-2">
                <li>Personalized genre preferences with weighted randomization</li>
                <li>Algorithmic injection of diverse musical styles</li>
                <li>Temporal shifting to suggest "opposite" emotions</li>
                <li>Exploratory mode for avant-garde and cross-cultural genres</li>
              </ul>
            </div>
            
            {/* NLP Feature */}
            <div className="bg-gradient-to-br from-fresh-purple-50 to-soft-lavender rounded-xl p-8 shadow-lg border border-fresh-purple-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w.w3.org/2000/svg" className="h-8 w-8 text-fresh-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-2xl font-bold text-fresh-purple-800">Natural Language Processing</h3>
              </div>
              <p className="text-fresh-purple-700 mb-4">
                Advanced NLP processes emotional descriptions using Darwin's taxonomy for nuanced emotion recognition.
              </p>
              <ul className="list-disc pl-5 text-fresh-purple-700 space-y-2">
                <li>30+ emotions derived from Darwin's foundational work</li>
                <li>Keyword extraction and contextual analysis</li>
                <li>Mixed emotion detection (e.g., "nervous excitement")</li>
                <li>Integration with OpenAI API for sophisticated parsing</li>
              </ul>
            </div>
            
            {/* YOLO Feature */}
            <div className="bg-gradient-to-br from-sky-blue to-soft-mint rounded-xl p-8 shadow-lg border border-sky-blue transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-2xl font-bold text-sky-blue-800">YOLO Object Detection</h3>
              </div>
              <p className="text-sky-blue-700 mb-4">
                Visual emotion detection through facial expressions and body language analysis.
              </p>
              <ul className="list-disc pl-5 text-sky-blue-700 space-y-2">
                <li>Real-time emotion recognition from uploaded images</li>
                <li>Analysis of facial expressions and body posture</li>
                <li>Non-verbal emotional state detection</li>
                <li>Integration with YOLOv8 for accurate object detection</li>
              </ul>
            </div>
            
            {/* Suno Feature */}
            <div className="bg-gradient-to-br from-pale-yellow to-soft-lavender rounded-xl p-8 shadow-lg border border-pale-yellow transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pale-yellow-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <h3 className="text-2xl font-bold text-pale-yellow-800">Suno AI Integration</h3>
              </div>
              <p className="text-pale-yellow-700 mb-4">
                AI-powered music generation tailored to your emotional state.
              </p>
              <ul className="list-disc pl-5 text-pale-yellow-700 space-y-2">
                <li>Custom composition generation based on emotional descriptions</li>
                <li>No copyright restrictions on AI-generated music</li>
                <li>Instant generation with personalized musical elements</li>
                <li>Integration with Suno API for high-quality output</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with natural colors */}
      <footer className="bg-fresh-green-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <Link href="/" className="block mb-4 text-2xl font-bold text-white">
                FreyaAI
              </Link>
              <p className="text-fresh-green-200">© 2025 FreyaAI, All rights reserved.</p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <div className="flex space-x-6 mb-6">
                <a href="https://x.com/rj12186" target="_blank" rel="noopener noreferrer" className="text-fresh-green-200 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.105 4.105 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.108 4.108 0 001.27 5.477c-.21.052-.412.078-.606.078-.25 0-.479-.028-.696-.084a4.107 4.107 0 003.834 2.85 8.25 8.25 0 01-5.05.17 11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="https://github.com/RichardJiang736" target="_blank" rel="noopener noreferrer" className="text-fresh-green-200 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/richardjiang736/" target="_blank" rel="noopener noreferrer" className="text-fresh-green-200 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
              
              <div className="flex space-x-6">
                <Link href="/" className="text-fresh-green-200 hover:text-white transition-colors">About</Link>
                <Link href="/nlp" className="text-fresh-green-200 hover:text-white transition-colors">Emotions</Link>
                <Link href="/" className="text-fresh-green-200 hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}