import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mainEmotion, emotionDetail } = await request.json();
    
    // Forward the request to Node.js backend (Express server)
    const nodeResponse = await fetch(`${process.env.NODE_API_BASE_URL || 'http://localhost:3001'}/refineEmotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mainEmotion, emotionDetail }),
    });

    // Check if response is ok
    if (!nodeResponse.ok) {
      const errorText = await nodeResponse.text();
      console.error('Node API error response:', errorText);
      return NextResponse.json({ error: `Node API error: ${errorText}` }, { status: nodeResponse.status });
    }

    // Check if response has content
    const contentType = nodeResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await nodeResponse.text();
      console.error('Node API returned non-JSON response:', text);
      return NextResponse.json({ error: 'Node API returned invalid response format' }, { status: 500 });
    }

    const data = await nodeResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in NLP API route:', error);
    return NextResponse.json({ error: `Failed to process emotion: ${error.message}` }, { status: 500 });
  }
}