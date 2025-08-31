// Utility functions for API calls

export async function callFlaskAPI(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.FLASK_API_BASE_URL || 'http://localhost:5000';
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling Flask API ${endpoint}:`, error);
    throw error;
  }
}