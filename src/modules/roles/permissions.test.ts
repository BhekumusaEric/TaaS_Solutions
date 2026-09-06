import { describe, it, expect } from 'vitest';
import { checkPermission, hasAnyPermission, hasAllPermissions } from '@/lib/rbac/permissions';

describe('RBAC permission checks', () => {
  it('supports exact, wildcard, and legacy alias permission matches', () => {
    const permissions = [
      { resource: 'organisation', action: 'read:all' },
      { resource: '*', action: '*' },
      { resource: 'project', action: 'read_all' },
    ];

    expect(checkPermission(permissions, 'organisation', 'read:all')).toBe(true);
    expect(checkPermission(permissions, 'user', 'delete')).toBe(true);
    expect(checkPermission(permissions, 'project', 'read:all')).toBe(true);

    const restrictedPermissions = [
      { resource: 'organisation', action: 'read:all' },
      { resource: 'project', action: 'read_all' },
    ];

    expect(checkPermission(restrictedPermissions, 'account', 'delete')).toBe(false);
  });

  it('combines permissions across multiple roles using any/all helpers', () => {
    const permissions = [
      { resource: 'user', action: 'read' },
      { resource: 'project', action: 'read:assigned' },
    ];

    expect(hasAnyPermission(permissions, [
      { resource: 'user', action: 'read' },
      { resource: 'opportunity', action: 'create' },
    ])).toBe(true);

    expect(hasAllPermissions(permissions, [
      { resource: 'user', action: 'read' },
      { resource: 'project', action: 'read:assigned' },
    ])).toBe(true);

    expect(hasAllPermissions(permissions, [
      { resource: 'user', action: 'read' },
      { resource: 'opportunity', action: 'create' },
    ])).toBe(false);
  });
});
