import db from '@/lib/db';
import { checkPermission } from '@/lib/rbac/permissions';
import { getUserPermissions } from '@/modules/roles/queries';

/**
 * Checks if a user has access to a specific organisation.
 * An administrator (has organisation:read_all overall) or a direct member can access it.
 */
export async function canAccessOrganisation(userId: string, organisationId: string): Promise<boolean> {
  // Check global permissions first
  const userPermissions = await getUserPermissions(userId);
  const isGlobalAdmin = checkPermission(userPermissions, 'organisation', 'read_all');
  
  if (isGlobalAdmin) return true;

  // Fallback to checking direct membership
  const membership = await db.organisationMember.findUnique({
    where: {
      userId_organisationId: { userId, organisationId },
    },
  });

  return !!membership;
}
