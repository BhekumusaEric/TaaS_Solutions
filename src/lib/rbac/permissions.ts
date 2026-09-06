export interface PermissionObject {
  resource: string;
  action: string;
}

function normalizePermissionValue(value: string): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, ':');
}

export function checkPermission(
  userPermissions: PermissionObject[],
  requiredResource: string,
  requiredAction: string
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;

  const normalizedRequiredResource = normalizePermissionValue(requiredResource);
  const normalizedRequiredAction = normalizePermissionValue(requiredAction);

  return userPermissions.some((permission) => {
    const permissionResource = normalizePermissionValue(permission.resource);
    const permissionAction = normalizePermissionValue(permission.action);

    const exactMatch = permissionResource === normalizedRequiredResource && permissionAction === normalizedRequiredAction;
    const wildcardResourceMatch = permissionResource === '*' && permissionAction === '*';
    const wildcardActionMatch = permissionResource === normalizedRequiredResource && permissionAction === '*';
    const wildcardResourceOnlyMatch = permissionResource === '*' && permissionAction === normalizedRequiredAction;

    return exactMatch || wildcardResourceMatch || wildcardActionMatch || wildcardResourceOnlyMatch;
  });
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
