'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-fresh-green-50 py-4 px-6 shadow-md border-b border-fresh-green-100">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-fresh-purple-700">
          FreyaAI
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link href="#about" className="font-semibold text-fresh-green-800 hover:text-fresh-purple-600 transition-colors">About</Link>
          <button 
            onClick={() => {
              if (isAuthenticated) {
                router.push('/nlp');
              } else {
                router.push('/login');
              }
            }}
            className="font-semibold text-fresh-green-800 hover:text-fresh-purple-600 transition-colors bg-transparent border-0 cursor-pointer"
          >
            NLP
          </button>
          <button 
            onClick={() => {
              if (isAuthenticated) {
                router.push('/yolo');
              } else {
                router.push('/login');
              }
            }}
            className="font-semibold text-fresh-green-800 hover:text-fresh-purple-600 transition-colors bg-transparent border-0 cursor-pointer"
          >
            YOLO
          </button>
          <button 
            onClick={() => {
              if (isAuthenticated) {
                router.push('/suno');
              } else {
                router.push('/login');
              }
            }}
            className="font-semibold text-fresh-green-800 hover:text-fresh-purple-600 transition-colors bg-transparent border-0 cursor-pointer"
          >
            Suno
          </button>
          <button 
            onClick={() => {
              if (isAuthenticated) {
                router.push('/recommendations');
              } else {
                router.push('/login');
              }
            }}
            className="font-semibold text-fresh-green-800 hover:text-fresh-purple-600 transition-colors bg-transparent border-0 cursor-pointer"
          >
            Recommendations
          </button>
        </nav>
        
        {/* Auth buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className="bg-fresh-green-500 hover:bg-fresh-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Logout
            </button>
          ) : (
            <Link 
              href="/login" 
              className="bg-fresh-green-500 hover:bg-fresh-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Login
            </Link>
          )}
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-fresh-green-800 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-fresh-green-50 py-4 px-6 shadow-lg rounded-b-lg border-t border-fresh-green-100">
          <div className="flex flex-col space-y-4">
            <Link href="#about" className="font-semibold text-fresh-green-800 hover:text-fresh-purple-600 transition-colors" onClick={() => setIsMenuOpen(false)}>About</Link>
            <button 
              onClick={() => { 
                if (isAuthenticated) {
                  router.push('/nlp');
                } else {
                  router.push('/login');
                }
                setIsMenuOpen(false);
              }}
              className="font-semibold text-fresh-green-800 hover:text-fresh-purple-600 transition-colors bg-transparent border-0 cursor-pointer text-left"
            >
              NLP
            </button>
            <button 
              onClick={() => { 
                if (isAuthenticated) {
                  router.push('/yolo');
                } else {
                  router.push('/login');
                }
                setIsMenuOpen(false);
              }}
              className="font-semibold text-fresh-green-800 hover:text-fresh-purple-600 transition-colors bg-transparent border-0 cursor-pointer text-left"
            >
              YOLO
            </button>
            <button 
              onClick={() => { 
                if (isAuthenticated) {
                  router.push('/suno');
                } else {
                  router.push('/login');
                }
                setIsMenuOpen(false);
              }}
              className="font-semibold text-fresh-green-800 hover:text-fresh-purple-600 transition-colors bg-transparent border-0 cursor-pointer text-left"
            >
              Suno
            </button>
            <button 
              onClick={() => { 
                if (isAuthenticated) {
                  router.push('/recommendations');
                } else {
                  router.push('/login');
                }
                setIsMenuOpen(false);
              }}
              className="font-semibold text-fresh-green-800 hover:text-fresh-purple-600 transition-colors bg-transparent border-0 cursor-pointer text-left"
            >
              Recommendations
            </button>
            
            {/* Mobile auth buttons */}
            <div className="pt-4 border-t border-fresh-green-100">
              {isAuthenticated ? (
                <button 
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full bg-fresh-green-500 hover:bg-fresh-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Logout
                </button>
              ) : (
                <Link 
                  href="/login" 
                  className="block w-full bg-fresh-green-500 hover:bg-fresh-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}