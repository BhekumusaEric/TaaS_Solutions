import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkPermission, hasAnyPermission, hasAllPermissions } from './permissions';
import { requirePermission } from './middleware';
import { usePermission, withPermission } from './hooks';
import { NextResponse } from 'next/server';
import React from 'react';

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

vi.mock('@/modules/roles/queries', () => ({
  getUserPermissions: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => {
  const jsonMock = vi.fn((data, options) => ({ data, options }));
  return {
    NextRequest: vi.fn(),
    NextResponse: {
      json: jsonMock,
    },
  };
});

describe('RBAC Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPermissions = [
    { resource: 'document', action: 'read' },
    { resource: 'document', action: 'write' },
  ];

  describe('permissions util', () => {
    it('checkPermission returns true when permission exists', () => {
      expect(checkPermission(mockPermissions, 'document', 'read')).toBe(true);
    });

    it('checkPermission returns false when permission is missing', () => {
      expect(checkPermission(mockPermissions, 'document', 'delete')).toBe(false);
      expect(checkPermission(mockPermissions, 'user', 'read')).toBe(false);
    });

    it('hasAnyPermission returns true when user has at least one permission', () => {
      expect(hasAnyPermission(mockPermissions, [
        { resource: 'document', action: 'read' },
        { resource: 'user', action: 'delete' },
      ])).toBe(true);
    });

    it('hasAnyPermission returns false when user has none of the permissions', () => {
      expect(hasAnyPermission(mockPermissions, [
        { resource: 'user', action: 'read' },
        { resource: 'user', action: 'delete' },
      ])).toBe(false);
    });

    it('hasAllPermissions returns true when user has all permissions', () => {
      expect(hasAllPermissions(mockPermissions, [
        { resource: 'document', action: 'read' },
        { resource: 'document', action: 'write' },
      ])).toBe(true);
    });

    it('hasAllPermissions returns false when user misses a permission', () => {
      expect(hasAllPermissions(mockPermissions, [
        { resource: 'document', action: 'read' },
        { resource: 'document', action: 'delete' },
      ])).toBe(false);
    });
  });

  describe('requirePermission middleware', () => {
    it('returns 401 if no token exists', async () => {
      const { getToken } = await import('next-auth/jwt');
      vi.mocked(getToken).mockResolvedValue(null);
      
      const req = {} as any;
      const result = await requirePermission(req, 'document', 'read');
      
      expect(result).toMatchObject({ data: { error: 'Unauthorized' }, options: { status: 401 } });
    });

    it('returns 403 if user lacks permission', async () => {
      const { getToken } = await import('next-auth/jwt');
      const { getUserPermissions } = await import('@/modules/roles/queries');
      vi.mocked(getToken).mockResolvedValue({ sub: 'user-1' } as any);
      vi.mocked(getUserPermissions).mockResolvedValue([{ resource: 'document', action: 'read' }] as any);
      
      const req = {} as any;
      const result = await requirePermission(req, 'document', 'write');
      
      expect(result).toMatchObject({ data: { error: 'Forbidden' }, options: { status: 403 } });
    });

    it('returns null if user is authorized', async () => {
      const { getToken } = await import('next-auth/jwt');
      const { getUserPermissions } = await import('@/modules/roles/queries');
      vi.mocked(getToken).mockResolvedValue({ sub: 'user-1' } as any);
      vi.mocked(getUserPermissions).mockResolvedValue([{ resource: 'document', action: 'write' }] as any);
      
      const req = {} as any;
      const result = await requirePermission(req, 'document', 'write');
      
      expect(result).toBeNull();
    });
  });

  describe('React hooks', () => {
    it('usePermission evaluates correctly', () => {
      expect(usePermission(mockPermissions, 'document', 'write')).toBe(true);
      expect(usePermission(mockPermissions, 'document', 'delete')).toBe(false);
    });

    it('withPermission HOC wraps component correctly', () => {
      const DummyComponent = () => React.createElement('div', null, 'Hello');
      const Wrapped = withPermission(DummyComponent, 'document', 'read');
      
      // Since it evaluates to true, it should return a React element
      const result = Wrapped({ userPermissions: mockPermissions });
      expect(result).not.toBeNull();
      expect(result?.type).toBe(DummyComponent);
    });

    it('withPermission HOC returns null if permission is denied', () => {
      const DummyComponent = () => React.createElement('div', null, 'Hello');
      const Wrapped = withPermission(DummyComponent, 'document', 'delete');
      
      const result = Wrapped({ userPermissions: mockPermissions });
      expect(result).toBeNull();
    });
  });
});
