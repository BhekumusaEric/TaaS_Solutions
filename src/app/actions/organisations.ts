'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import * as z from 'zod';

const createOrganisationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name must be less than 200 characters'),
  type: z.enum(['CLIENT', 'PARTNER'], { required_error: 'Type is required' }),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type CreateOrganisationValues = z.infer<typeof createOrganisationSchema>;

export async function createOrganisation(values: CreateOrganisationValues) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  // Verify admin role
  const userWithRoles = await db.user.findUnique({
    where: { id: session.user.id },
    include: { roles: { include: { role: true } } },
  });

  const roleNames = userWithRoles?.roles.map((ur) => ur.role.name) ?? [];
  if (!roleNames.includes('PLATFORM_ADMIN')) {
    return { error: 'Insufficient permissions' };
  }

  const validated = createOrganisationSchema.safeParse(values);
  if (!validated.success) {
    return { error: 'Invalid input' };
  }

  const { name, type, description } = validated.data;

  try {
    const existing = await db.organisation.findUnique({ where: { name } });
    if (existing) {
      return { error: 'An organisation with this name already exists' };
    }

    const org = await db.$transaction(async (tx) => {
      const newOrg = await tx.organisation.create({
        data: { name, type, description: description ?? null },
      });

      await tx.auditEvent.create({
        data: {
          userId: session.user.id,
          action: 'ORGANISATION_CREATED',
          resourceType: 'Organisation',
          resourceId: newOrg.id,
          metadata: { name, type },
        },
      });

      return newOrg;
    });

    return { success: true, id: org.id };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
