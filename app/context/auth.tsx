'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  display_name: string;
  user_id: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status with backend
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/api/auth-status`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = () => {
    // Redirect to Flask login endpoint
    window.location.href = `${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/login`;
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/signout`, {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      setUser(null);
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Handle authentication success from callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      // Remove the auth parameter from URL
      urlParams.delete('auth');
      const newUrl = 
        window.location.pathname + 
        (urlParams.toString() ? '?' + urlParams.toString() : '') + 
        window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      
      // Re-check auth status
      const checkAuthStatus = async () => {
        try {
          const response = await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/api/auth-status`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            setIsAuthenticated(data.isAuthenticated);
            setUser(data.user);
          }
        } catch (error) {
          console.error('Error checking auth status after callback:', error);
        }
      };
      
      checkAuthStatus();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-green-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}