import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrganisation, updateOrganisation, addMemberToOrganisation, removeMemberFromOrganisation } from './mutations';
import db from '@/lib/db';
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors';

vi.mock('@/lib/db', () => ({
  default: {
    organisation: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    organisationMember: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Organisations Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrganisation', () => {
    it('creates an org when data is valid', async () => {
      vi.mocked(db.organisation.findUnique).mockResolvedValue(null as any);
      vi.mocked(db.organisation.create).mockResolvedValue({ id: 'org-1', name: 'New Org', type: 'CLIENT' } as any);

      const result = await createOrganisation({ name: 'New Org', type: 'CLIENT' });
      expect(db.organisation.create).toHaveBeenCalled();
      expect(result.id).toBe('org-1');
    });

    it('throws ConflictError if org name already exists', async () => {
      vi.mocked(db.organisation.findUnique).mockResolvedValue({ id: 'org-1' } as any);
      await expect(createOrganisation({ name: 'Existing Org', type: 'CLIENT' })).rejects.toThrow(ConflictError);
    });
  });

  describe('addMemberToOrganisation', () => {
    it('adds a user to an org', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'u1' } as any);
      vi.mocked(db.organisation.findUnique).mockResolvedValue({ id: 'o1' } as any);
      vi.mocked(db.organisationMember.findUnique).mockResolvedValue(null as any);
      vi.mocked(db.organisationMember.create).mockResolvedValue({ id: 'm1' } as any);

      await addMemberToOrganisation('u1', 'o1');
      expect(db.organisationMember.create).toHaveBeenCalled();
    });

    it('throws ConflictError if already a member', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'u1' } as any);
      vi.mocked(db.organisation.findUnique).mockResolvedValue({ id: 'o1' } as any);
      vi.mocked(db.organisationMember.findUnique).mockResolvedValue({ id: 'm1' } as any);

      await expect(addMemberToOrganisation('u1', 'o1')).rejects.toThrow(ConflictError);
    });
  });
});
