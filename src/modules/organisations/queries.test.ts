import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOrganisations, getOrganisationById, getOrganisationWithMembers, getUserOrganisations } from './queries';
import db from '@/lib/db';

vi.mock('@/lib/db', () => ({
  default: {
    organisation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    organisationMember: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    }
  },
}));

describe('Organisations Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockOrg = {
    id: 'org-1',
    name: 'Test Org',
    type: 'CLIENT',
    description: 'A test org',
  };

  describe('getOrganisations', () => {
    it('returns all organisations when no userId provided (admin)', async () => {
      vi.mocked(db.organisation.findMany).mockResolvedValue([mockOrg] as any);
      const result = await getOrganisations();
      expect(db.organisation.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('returns only user organisations when userId is provided', async () => {
      vi.mocked(db.organisationMember.findMany).mockResolvedValue([
        { organisation: mockOrg }
      ] as any);
      
      const result = await getOrganisations('user-1');
      expect(db.organisationMember.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { organisation: true },
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Org');
    });
  });

  describe('getOrganisationById', () => {
    it('returns org without access check if currentUserId is not provided', async () => {
      vi.mocked(db.organisation.findUnique).mockResolvedValue(mockOrg as any);
      const result = await getOrganisationById('org-1');
      expect(result).not.toBeNull();
    });

    it('returns null if user does not have access', async () => {
      vi.mocked(db.organisation.findUnique).mockResolvedValue(mockOrg as any);
      vi.mocked(db.organisationMember.findUnique).mockResolvedValue(null as any);
      
      const result = await getOrganisationById('org-1', 'unauthorized-user');
      expect(result).toBeNull();
    });

    it('returns org if user has access', async () => {
      vi.mocked(db.organisation.findUnique).mockResolvedValue(mockOrg as any);
      vi.mocked(db.organisationMember.findUnique).mockResolvedValue({ id: 'membership-1' } as any);
      
      const result = await getOrganisationById('org-1', 'authorized-user');
      expect(result).not.toBeNull();
    });
  });
});
