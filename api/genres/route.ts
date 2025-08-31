import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Get user's selected genres
export async function GET() {
  try {
    // Get all cookies from the request
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Prepare headers with all cookies (no Content-Type for GET requests)
    const headers: Record<string, string> = {};
    
    // Include all cookies
    if (allCookies.length > 0) {
      headers['Cookie'] = allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    }
    
    // Forward the request to Flask backend
    const flaskResponse = await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/genres`, {
      method: 'GET',
      headers,
      credentials: 'include', // Include cookies for session
    });

    // Check if response is ok
    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      console.error('Flask API error response:', errorText);
      return NextResponse.json({ error: `Flask API error: ${errorText}` }, { status: flaskResponse.status });
    }

    // Check if response has content
    const contentType = flaskResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await flaskResponse.text();
      console.error('Flask API returned non-JSON response:', text);
      return NextResponse.json({ error: 'Flask API returned invalid response format' }, { status: 500 });
    }

    const data = await flaskResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in Genres API route:', error);
    return NextResponse.json({ error: `Failed to fetch genres: ${error.message}` }, { status: 500 });
  }
}

// Update user's selected genres
export async function POST(request: Request) {
  try {
    const { genres } = await request.json();
    
    // Get all cookies from the request
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Prepare headers with all cookies
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Include all cookies
    if (allCookies.length > 0) {
      headers['Cookie'] = allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    }
    
    // Forward the request to Flask backend
    const flaskResponse = await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/update-genres`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ genres }),
      credentials: 'include', // Include cookies for session
    });

    // Check if response is ok
    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      console.error('Flask API error response:', errorText);
      return NextResponse.json({ error: `Flask API error: ${errorText}` }, { status: flaskResponse.status });
    }

    // Check if response has content
    const contentType = flaskResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await flaskResponse.text();
      console.error('Flask API returned non-JSON response:', text);
      return NextResponse.json({ error: 'Flask API returned invalid response format' }, { status: 500 });
    }

    const data = await flaskResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in Genres API route:', error);
    return NextResponse.json({ error: `Failed to update genres: ${error.message}` }, { status: 500 });
  }
}