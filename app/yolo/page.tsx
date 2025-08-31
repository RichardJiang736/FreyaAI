'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/auth';

export default function YOLOPage() {
  const [emotion, setEmotion] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err: any) {
      setError('Could not access camera: ' + err.message);
      console.error('Camera error:', err);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    
    // Clear detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  // Capture frame and send to backend for emotion detection
  const captureAndAnalyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const base64Data = imageData.split(',')[1]; // Remove data URL prefix
    
    try {
      const response = await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/api/detect-emotion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ image: base64Data }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze frame');
      }
      
      if (data.emotion) {
        setEmotion(data.emotion);
        setConfidence(data.confidence || 0);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Frame analysis error:', err);
    }
  };

  // Start real-time emotion detection
  const startDetection = () => {
    if (!isCameraActive) {
      setError('Please start the camera first');
      return;
    }
    
    setIsDetecting(true);
    setError('');
    
    // Capture and analyze frame every 1000ms (1 frame per second)
    detectionIntervalRef.current = setInterval(captureAndAnalyzeFrame, 1000);
  };

  // Stop real-time emotion detection
  const stopDetection = () => {
    setIsDetecting(false);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  // Handle create playlist
  const handleCreatePlaylist = async () => {
    if (!emotion) {
      setError('No emotion detected yet');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/api/create_playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ emotion }),
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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopDetection();
    };
  }, []);

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
          <h1 className="text-4xl font-bold mb-8 text-center text-fresh-green-800">YOLO Object Detection with FreyaAI</h1>
          
          <div className="bg-white rounded-xl shadow-lg p-8 mb-10 border border-fresh-green-100">
            <h2 className="text-2xl font-bold mb-4 text-fresh-green-800">Real-time Emotion Detection</h2>
            <p className="text-fresh-green-700 mb-6">
              Use your camera for real-time emotion detection. Our YOLO model will analyze your facial expressions 
              and body language to detect your emotional state.
            </p>
            
            {/* Video and Canvas elements for camera feed */}
            <div className="relative mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full rounded-lg ${isCameraActive ? 'block' : 'hidden'}`}
              />
              <canvas 
                ref={canvasRef} 
                className="hidden"
              />
              {!isCameraActive && (
                <div className="border-2 border-dashed border-fresh-green-300 rounded-lg p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-fresh-green-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-4 text-fresh-green-700">
                    Camera will appear here once activated
                  </p>
                </div>
              )}
            </div>
            
            {/* Camera controls */}
            <div className="flex flex-wrap gap-4 mb-6">
              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  className="bg-fresh-green-500 hover:bg-fresh-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md"
                >
                  Start Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={stopCamera}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md"
                  >
                    Stop Camera
                  </button>
                  
                  {!isDetecting ? (
                    <button
                      onClick={startDetection}
                      disabled={!isCameraActive}
                      className="bg-fresh-purple-500 hover:bg-fresh-purple-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md disabled:opacity-50"
                    >
                      Start Detection
                    </button>
                  ) : (
                    <button
                      onClick={stopDetection}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md"
                    >
                      Stop Detection
                    </button>
                  )}
                </>
              )}
            </div>
            
            {/* Emotion display */}
            {emotion && (
              <div className="mt-6 p-4 bg-fresh-green-50 rounded-lg">
                <h3 className="text-lg font-bold text-fresh-green-800">Detected Emotion:</h3>
                <p className="text-fresh-green-700">{emotion} (Confidence: {(confidence * 100).toFixed(2)}%)</p>
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
          
          <div className="bg-white rounded-xl shadow-lg p-8 border border-fresh-green-100">
            <h3 className="text-xl font-bold mb-4 text-fresh-green-800">How Real-time YOLO Works</h3>
            <p className="text-fresh-green-700 mb-4">
              Our YOLO (You Only Look Once) model can detect emotions through visual cues like facial expressions, 
              body posture, and other non-verbal indicators in real-time.
            </p>
            <p className="text-fresh-green-700">
              This technology allows you to discover music that matches your emotional state without having to 
              explicitly describe how you feel. Simply start your camera and begin the detection process.
            </p>
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