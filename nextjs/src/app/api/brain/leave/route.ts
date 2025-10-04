import { NextResponse } from 'next/server';
import { getSession } from '@/config/withSession';

/**
 * Handle POST requests to remove the current user from a brain session by validating the request body and session, then proxying the leave action to the backend.
 *
 * Valid observable behaviors:
 * - If the request JSON does not include `brainId`, responds with status 400 and code `BRAIN_ID_REQUIRED`.
 * - If there is no authenticated session user or no JWT in the session, responds with status 401 and code `TOKEN_NOT_FOUND`.
 * - Forwards a POST to the backend endpoint for leaving the specified brain; if the backend responds with a non-ok status, returns the backend error JSON with the same HTTP status.
 * - On unexpected errors, responds with status 500 and code `INTERNAL_ERROR`.
 *
 * @param request - Incoming HTTP request whose JSON body must contain a `brainId` property.
 * @returns The backend success JSON on success, or an error JSON object containing `status`, `code`, `message`, and `data` on validation, backend failure, or internal error.
 */
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