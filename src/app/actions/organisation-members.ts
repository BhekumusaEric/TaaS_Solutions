'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import * as z from 'zod';

// ─── Schemas ──────────────────────────────────────────────────

const addMemberSchema = z.object({
  organisationId: z.string().uuid(),
  email: z.string().email('Please enter a valid email address'),
});

const removeMemberSchema = z.object({
  organisationId: z.string().uuid(),
  userId: z.string().uuid(),
});

// ─── Helpers ──────────────────────────────────────────────────

async function verifyAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  return user?.roles.some((ur) => ur.role.name === 'PLATFORM_ADMIN') ?? false;
}

// ─── Server Actions ───────────────────────────────────────────

export async function addOrganisationMember(values: z.infer<typeof addMemberSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: 'Not authenticated' };
  if (!(await verifyAdmin(session.user.id))) return { error: 'Insufficient permissions' };

  const validated = addMemberSchema.safeParse(values);
  if (!validated.success) return { error: 'Invalid input' };

  const { organisationId, email } = validated.data;

  try {
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { error: 'No user found with this email address' };

    const existing = await db.organisationMember.findUnique({
      where: { userId_organisationId: { userId: user.id, organisationId } },
    });
    if (existing) return { error: 'User is already a member of this organisation' };

    await db.$transaction(async (tx) => {
      await tx.organisationMember.create({
        data: { userId: user.id, organisationId },
      });

      await tx.auditEvent.create({
        data: {
          userId: session.user.id,
          action: 'ORGANISATION_MEMBER_ADDED',
          resourceType: 'OrganisationMember',
          resourceId: organisationId,
          organisationId,
          metadata: { memberEmail: email, memberId: user.id },
        },
      });
    });

    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function removeOrganisationMember(values: z.infer<typeof removeMemberSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: 'Not authenticated' };
  if (!(await verifyAdmin(session.user.id))) return { error: 'Insufficient permissions' };

  const validated = removeMemberSchema.safeParse(values);
  if (!validated.success) return { error: 'Invalid input' };

  const { organisationId, userId } = validated.data;

  try {
    const membership = await db.organisationMember.findUnique({
      where: { userId_organisationId: { userId, organisationId } },
    });
    if (!membership) return { error: 'User is not a member of this organisation' };

    await db.$transaction(async (tx) => {
      await tx.organisationMember.delete({
        where: { id: membership.id },
      });

      await tx.auditEvent.create({
        data: {
          userId: session.user.id,
          action: 'ORGANISATION_MEMBER_REMOVED',
          resourceType: 'OrganisationMember',
          resourceId: organisationId,
          organisationId,
          metadata: { removedUserId: userId },
        },
      });
    });

    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
