import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    // Get cookies from the request
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    
    // Prepare headers with cookies
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Include session cookie if it exists
    if (sessionCookie) {
      headers['Cookie'] = `${sessionCookie.name}=${sessionCookie.value}`;
    }
    
    // Forward the request to Flask backend
    const flaskResponse = await fetch(`${process.env.FLASK_API_BASE_URL || 'http://localhost:5000'}/api/generate-music`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt }),
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
    console.error('Error in Suno API route:', error);
    return NextResponse.json({ error: `Failed to generate music: ${error.message}` }, { status: 500 });
  }
}