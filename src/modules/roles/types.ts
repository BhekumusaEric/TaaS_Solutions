import { Role, Permission, UserRole, RolePermission } from '@prisma/client';

export interface RoleWithPermissions extends Role {
  permissions: {
    permission: Permission;
  }[];
}

export interface UserRoleWithDetails extends UserRole {
  role: Role;
}
