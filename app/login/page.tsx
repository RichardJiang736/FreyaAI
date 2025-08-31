'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Redirect authenticated users to the home page
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  // Function to initiate Spotify login
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to Flask login endpoint which will handle Spotify OAuth
      window.location.href = `${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/login`;
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return null; // Will redirect immediately
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fresh-green-50 to-sky-blue">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-green-600 mx-auto mb-4"></div>
        <p className="text-fresh-green-700">Redirecting to Spotify for authentication...</p>
      </div>
    </div>
  );
}