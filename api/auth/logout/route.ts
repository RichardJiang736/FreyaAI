import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Logout user by clearing session
export async function POST() {
  try {
    // Clear session cookie
    const cookieStore = cookies();
    const response = NextResponse.json({ success: true });
    
    // Clear the session cookie
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });
    
    return response;
  } catch (error: any) {
    console.error('Error in logout API route:', error);
    return NextResponse.json({ error: `Failed to logout: ${error.message}` }, { status: 500 });
  }
}