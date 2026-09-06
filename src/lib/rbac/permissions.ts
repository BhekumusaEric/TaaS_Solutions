export interface PermissionObject {
  resource: string;
  action: string;
}

export function checkPermission(
  userPermissions: PermissionObject[],
  requiredResource: string,
  requiredAction: string
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;

  return userPermissions.some(
    p => p.resource === requiredResource && p.action === requiredAction
  );
}

export function hasAnyPermission(
  userPermissions: PermissionObject[],
  requiredPermissions: PermissionObject[]
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions) || !requiredPermissions || requiredPermissions.length === 0) return false;

  return requiredPermissions.some(rp =>
    checkPermission(userPermissions, rp.resource, rp.action)
  );
}

export function hasAllPermissions(
  userPermissions: PermissionObject[],
  requiredPermissions: PermissionObject[]
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions) || !requiredPermissions || requiredPermissions.length === 0) return false;

  return requiredPermissions.every(rp =>
    checkPermission(userPermissions, rp.resource, rp.action)
  );
}
