import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock Next.js and NextAuth middleware
vi.mock('next/server', () => ({
  NextResponse: {
    redirect: vi.fn((url) => ({ status: 307, headers: { get: () => url.toString() } })),
    next: vi.fn(() => ({ status: 200 })),
  }
}));

const { middlewareFn } = vi.hoisted(() => ({ middlewareFn: { current: null as any } }));
vi.mock('next-auth/middleware', () => ({
  withAuth: vi.fn((fn, config) => {
    middlewareFn.current = fn;
    return fn;
  })
}));

// Import middleware after mocking
import './middleware';

describe('Authentication Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (pathname: string, token: any = null) => {
    return {
      nextUrl: {
        pathname,
        search: '',
        clone: vi.fn().mockReturnThis(),
      },
      url: `http://localhost:3000${pathname}`,
      nextauth: { token }
    } as unknown as NextRequest & { nextauth: { token: any } };
  };

  it('redirects unauthenticated user from protected route to /sign-in', () => {
    const req = createMockRequest('/dashboard');
    const res = middlewareFn.current(req);
    
    expect(NextResponse.redirect).toHaveBeenCalled();
    const callArgs = (NextResponse.redirect as any).mock.calls[0][0];
    expect(callArgs.toString()).toContain('/sign-in?from=%2Fdashboard');
  });

  it('allows authenticated user to access protected route', () => {
    const req = createMockRequest('/dashboard', { id: 'user1' });
    const res = middlewareFn.current(req);
    
    // Should not redirect, should implicitly return undefined (which NextAuth middleware handles)
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(res).toBeUndefined();
  });

  it('redirects authenticated user away from /sign-in to /dashboard', () => {
    const req = createMockRequest('/sign-in', { id: 'user1' });
    const res = middlewareFn.current(req);
    
    expect(NextResponse.redirect).toHaveBeenCalled();
    const callArgs = (NextResponse.redirect as any).mock.calls[0][0];
    expect(callArgs.toString()).toContain('/dashboard');
  });

  it('allows unauthenticated user to access /sign-in', () => {
    const req = createMockRequest('/sign-in');
    const res = middlewareFn.current(req);
    
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(res).toBeNull(); // based on our implementation returning null for auth pages when not auth'd
  });
});
