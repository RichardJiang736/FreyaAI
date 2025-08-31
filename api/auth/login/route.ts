import { NextResponse } from 'next/server';

// Redirect to Flask login endpoint
export async function GET() {
  const flaskLoginUrl = `${process.env.FLASK_API_BASE_URL || 'http://localhost:8000'}/login`;
  return NextResponse.redirect(flaskLoginUrl);
}