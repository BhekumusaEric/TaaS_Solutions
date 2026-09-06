import { z } from 'zod';
import { OrganisationType } from '@prisma/client';

export const createOrganisationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  type: z.nativeEnum(OrganisationType),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
});

export const updateOrganisationSchema = createOrganisationSchema.partial();

export const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  organisationId: z.string().uuid('Invalid organisation ID'),
});

export type CreateOrganisationInput = z.infer<typeof createOrganisationSchema>;
export type UpdateOrganisationInput = z.infer<typeof updateOrganisationSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
