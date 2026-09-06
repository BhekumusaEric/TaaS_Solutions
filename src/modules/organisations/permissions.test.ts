import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canAccessOrganisation } from './permissions';
import { getUserPermissions } from '@/modules/roles/queries';
import db from '@/lib/db';

vi.mock('@/modules/roles/queries', () => ({
  getUserPermissions: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  default: {
    organisationMember: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Organisation Permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows access if user has global organisation:read:all permission', async () => {
    vi.mocked(getUserPermissions).mockResolvedValue([
      { resource: 'organisation', action: 'read:all' }
    ] as any);
    
    const result = await canAccessOrganisation('admin-id', 'org-1');
    
    expect(result).toBe(true);
    // Should not need to check direct membership
    expect(db.organisationMember.findUnique).not.toHaveBeenCalled();
  });

  it('allows access if user is a direct member of the org', async () => {
    vi.mocked(getUserPermissions).mockResolvedValue([] as any);
    vi.mocked(db.organisationMember.findUnique).mockResolvedValue({ id: 'membership' } as any);
    
    const result = await canAccessOrganisation('user-id', 'org-1');
    
    expect(result).toBe(true);
    expect(db.organisationMember.findUnique).toHaveBeenCalled();
  });

  it('denies access if user has no global permission and is not a member', async () => {
    vi.mocked(getUserPermissions).mockResolvedValue([] as any);
    vi.mocked(db.organisationMember.findUnique).mockResolvedValue(null as any);
    
    const result = await canAccessOrganisation('user-id', 'org-1');
    
    expect(result).toBe(false);
  });
});
