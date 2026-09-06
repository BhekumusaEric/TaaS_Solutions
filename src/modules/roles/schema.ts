import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(255, 'Description must be less than 255 characters').optional().nullable(),
});

export const assignPermissionSchema = z.object({
  roleId: z.string().uuid('Invalid role ID'),
  permissionId: z.string().uuid('Invalid permission ID'),
});

export const assignRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  roleId: z.string().uuid('Invalid role ID'),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type AssignPermissionInput = z.infer<typeof assignPermissionSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
