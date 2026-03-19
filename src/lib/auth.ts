import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple API Key authentication middleware.
 * - GET requests are public (no auth required)
 * - POST/PUT/DELETE require: Authorization: Bearer <API_SECRET_KEY>
 */
export function authenticate(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase();

  // GET requests are public
  if (method === 'GET') {
    return null; // No error, proceed
  }

  const apiKey = process.env.API_SECRET_KEY;

  // If no API_SECRET_KEY is configured, block all write operations
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server configuration error: API_SECRET_KEY not set' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return NextResponse.json(
      { error: 'Missing Authorization header' },
      { status: 401 }
    );
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return NextResponse.json(
      { error: 'Invalid Authorization format. Expected: Bearer <token>' },
      { status: 401 }
    );
  }

  const token = match[1];
  if (token !== apiKey) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }

  return null; // Authenticated
}

/**
 * Validate admin access via URL query parameter ?key=xxx
 */
export function validateAdminKey(key: string | null): boolean {
  const apiKey = process.env.API_SECRET_KEY;
  if (!apiKey) return false;
  return key === apiKey;
}
