import db from '@/lib/db';
import { Organisation, OrganisationMember } from '@prisma/client';
import { CreateOrganisationInput, UpdateOrganisationInput, createOrganisationSchema, updateOrganisationSchema } from './schema';
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors';

export async function createOrganisation(data: CreateOrganisationInput): Promise<Organisation> {
  const validatedData = createOrganisationSchema.safeParse(data);
  if (!validatedData.success) {
    const firstIssue = validatedData.error.issues[0];
    const field = firstIssue?.path[0]?.toString() || 'input';
    throw new ValidationError('Invalid organisation data', field);
  }

  const { name, type, description } = validatedData.data;

  const existingOrg = await db.organisation.findUnique({ where: { name } });
  if (existingOrg) {
    throw new ConflictError('Organisation with this name already exists');
  }

  return db.organisation.create({
    data: {
      name,
      type,
      description,
    },
  });
}

export async function updateOrganisation(id: string, data: UpdateOrganisationInput): Promise<Organisation> {
  const validatedData = updateOrganisationSchema.safeParse(data);
  if (!validatedData.success) {
    const firstIssue = validatedData.error.issues[0];
    const field = firstIssue?.path[0]?.toString() || 'input';
    throw new ValidationError('Invalid update data', field);
  }

  const org = await db.organisation.findUnique({ where: { id } });
  if (!org) {
    throw new NotFoundError('Organisation not found');
  }

  if (validatedData.data.name && validatedData.data.name !== org.name) {
    const existingOrg = await db.organisation.findUnique({ where: { name: validatedData.data.name } });
    if (existingOrg) {
      throw new ConflictError('Organisation with this name already exists');
    }
  }

  return db.organisation.update({
    where: { id },
    data: validatedData.data,
  });
}

export async function addMemberToOrganisation(userId: string, organisationId: string): Promise<OrganisationMember> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const org = await db.organisation.findUnique({ where: { id: organisationId } });
  if (!org) {
    throw new NotFoundError('Organisation not found');
  }

  const existingMembership = await db.organisationMember.findUnique({
    where: {
      userId_organisationId: { userId, organisationId },
    },
  });

  if (existingMembership) {
    throw new ConflictError('User is already a member of this organisation');
  }

  return db.organisationMember.create({
    data: {
      userId,
      organisationId,
    },
  });
}

export async function removeMemberFromOrganisation(userId: string, organisationId: string): Promise<void> {
  const existingMembership = await db.organisationMember.findUnique({
    where: {
      userId_organisationId: { userId, organisationId },
    },
  });

  if (!existingMembership) {
    throw new NotFoundError('User is not a member of this organisation');
  }

  await db.organisationMember.delete({
    where: {
      id: existingMembership.id,
    },
  });
}
