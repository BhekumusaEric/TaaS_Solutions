/**
 * Simple validation test to ensure auth configuration files can be imported
 * without errors and have the expected structure.
 */

import { describe, it, expect } from 'vitest';

describe('NextAuth Configuration Validation', () => {
  it('should import auth configuration without errors', async () => {
    const authModule = await import('./auth');
    expect(authModule.authOptions).toBeDefined();
  });

  it('should import auth utilities without errors', async () => {
    const authUtilsModule = await import('./auth-utils');
    expect(authUtilsModule.getSession).toBeDefined();
    expect(authUtilsModule.requireAuth).toBeDefined();
    expect(authUtilsModule.isAuth).toBeDefined();
    expect(authUtilsModule.getCurrentUserId).toBeDefined();
    expect(authUtilsModule.requireUserId).toBeDefined();
    expect(authUtilsModule.isResourceOwner).toBeDefined();
    expect(authUtilsModule.requireResourceOwnership).toBeDefined();
  });

  it('should have all required authOptions properties', async () => {
    const { authOptions } = await import('./auth');
    
    // Core configuration
    expect(authOptions.adapter).toBeDefined();
    expect(authOptions.providers).toBeDefined();
    expect(authOptions.session).toBeDefined();
    expect(authOptions.pages).toBeDefined();
    expect(authOptions.callbacks).toBeDefined();
    expect(authOptions.cookies).toBeDefined();
    
    // Session configuration
    expect(authOptions.session?.strategy).toBe('jwt');
    expect(authOptions.session?.maxAge).toBe(7 * 24 * 60 * 60);
    
    // Pages configuration
    expect(authOptions.pages?.signIn).toBe('/sign-in');
    expect(authOptions.pages?.signOut).toBe('/sign-out');
    expect(authOptions.pages?.error).toBe('/auth/error');
  });

  it('should have secure cookie configuration', async () => {
    const { authOptions } = await import('./auth');
    
    expect(authOptions.cookies?.sessionToken?.options.httpOnly).toBe(true);
    expect(authOptions.cookies?.sessionToken?.options.sameSite).toBe('lax');
    expect(authOptions.cookies?.sessionToken?.options.path).toBe('/');
  });

  it('should have environment variables documented', () => {
    // NEXTAUTH_URL and NEXTAUTH_SECRET should be used in configuration
    expect(process.env.NEXTAUTH_SECRET).toBeDefined();
  });
});
