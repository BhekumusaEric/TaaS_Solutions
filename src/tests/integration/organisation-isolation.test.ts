import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getOrganisationById, getOrganisations } from '@/modules/organisations/queries';
import { canAccessOrganisation } from '@/modules/organisations/permissions';
import db from '@/lib/db';

vi.mock('@/lib/db', () => ({
  default: {
    organisation: {
      findUnique: vi.fn(),
    },
    organisationMember: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    userRole: {
      findMany: vi.fn(),
    },
  },
}));

describe('Organisation isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents a user in Org A from accessing Org B by ID', async () => {
    const orgB = { id: 'org-b', name: 'Org B', type: 'CLIENT' };

    vi.mocked(db.organisation.findUnique).mockResolvedValue(orgB as any);
    vi.mocked(db.organisationMember.findUnique).mockResolvedValue(null as any);

    const result = await getOrganisationById('org-b', 'user-in-org-a');

    expect(result).toBeNull();
    expect(db.organisationMember.findUnique).toHaveBeenCalledWith({
      where: { userId_organisationId: { userId: 'user-in-org-a', organisationId: 'org-b' } },
    });
  });

  it('returns only the organisations a user belongs to', async () => {
    const orgA = { id: 'org-a', name: 'Org A', type: 'CLIENT' };
    const orgB = { id: 'org-b', name: 'Org B', type: 'PARTNER' };

    vi.mocked(db.organisationMember.findMany).mockResolvedValue([
      { organisation: orgA },
      { organisation: orgB },
    ] as any);

    const result = await getOrganisations('user-in-both-orgs');

    expect(result).toHaveLength(2);
    expect(result.map(org => org.id)).toEqual(['org-a', 'org-b']);
  });

  it('blocks direct access when the user is not a member of the organisation', async () => {
    vi.mocked(db.userRole.findMany).mockResolvedValue([] as any);
    vi.mocked(db.organisationMember.findUnique).mockResolvedValue(null as any);

    const result = await canAccessOrganisation('user-outside-org', 'org-b');

    expect(result).toBe(false);
  });

  it('allows organisation access when the membership exists', async () => {
    vi.mocked(db.userRole.findMany).mockResolvedValue([] as any);
    vi.mocked(db.organisationMember.findUnique).mockResolvedValue({ id: 'membership-1' } as any);

    const result = await canAccessOrganisation('user-in-org', 'org-a');

    expect(result).toBe(true);
  });
});
