import { NextResponse } from 'next/server';
import { getSession } from '@/config/withSession';

export async function POST(request) {
  try {
    const { brainId } = await request.json();
    console.log('Received brainId:', brainId);
    
    if (!brainId) {
      return NextResponse.json(
        { 
          status: 400,
          code: 'BRAIN_ID_REQUIRED',
          message: 'Brain ID is required',
          data: {}
        },
        { status: 400 }
      );
    }

    const session = await getSession();
    console.log('Session user exists:', !!session.user);
    
    if (!session.user) {
      return NextResponse.json(
        { 
          status: 401,
          code: 'TOKEN_NOT_FOUND',
          message: 'You are not allowed to access this platform',
          data: {}
        },
        { status: 401 }
      );
    }

    const jwtToken = session.user.access_token;
    console.log('JWT Token found:', !!jwtToken);

    if (!jwtToken) {
      return NextResponse.json(
        { 
          status: 401,
          code: 'TOKEN_NOT_FOUND',
          message: 'You are not allowed to access this platform',
          data: {}
        },
        { status: 401 }
      );
    }

    const response = await fetch(`http://nodejs:4050/napi/v1/web/brain/${brainId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `jwt ${jwtToken}`,
      },
    });

    console.log('📡 Backend response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Backend error:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('Backend success:', data);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { 
        status: 500,
        code: 'INTERNAL_ERROR',
        message: 'Internal server error: ' + error.message,
        data: {}
      },
      { status: 500 }
    );
  }
}