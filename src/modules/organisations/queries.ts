import db from '@/lib/db';
import { Organisation } from '@prisma/client';
import { OrganisationWithMembers, UserWithOrganisations } from './types';

export async function getOrganisations(userId?: string): Promise<Organisation[]> {
  if (userId) {
    // Return only orgs this user is a member of
    const userOrgs = await db.organisationMember.findMany({
      where: { userId },
      include: { organisation: true },
    });
    return userOrgs.map(om => om.organisation);
  }

  // Admin access - return all orgs
  return db.organisation.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getOrganisationById(id: string, currentUserId?: string): Promise<Organisation | null> {
  const org = await db.organisation.findUnique({
    where: { id },
  });

  if (!org) return null;

  if (currentUserId) {
    // Check if user has access to this organisation
    const isMember = await db.organisationMember.findUnique({
      where: {
        userId_organisationId: { userId: currentUserId, organisationId: id },
      },
    });

    if (!isMember) return null;
  }

  return org;
}

export async function getOrganisationWithMembers(id: string, currentUserId?: string): Promise<OrganisationWithMembers | null> {
  // First verify access using the standard query
  const org = await getOrganisationById(id, currentUserId);
  if (!org) return null;

  const orgWithMembers = await db.organisation.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!orgWithMembers) return null;

  // Omit password from members
  const sanitizedMembers = orgWithMembers.members.map(member => {
    const { password, ...userWithoutPassword } = member.user;
    return {
      ...member,
      user: userWithoutPassword,
    };
  });

  return {
    ...orgWithMembers,
    members: sanitizedMembers,
  };
}

export async function getUserOrganisations(userId: string): Promise<UserWithOrganisations | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      organisationMembers: {
        include: {
          organisation: true,
        },
      },
    },
  });

  if (!user) return null;

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as UserWithOrganisations;
}
