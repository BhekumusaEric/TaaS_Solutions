import React from 'react';
import { checkPermission, PermissionObject } from './permissions';

export function usePermission(
  userPermissions: PermissionObject[],
  resource: string,
  action: string
) {
  return checkPermission(userPermissions, resource, action);
}

export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  resource: string,
  action: string
) {
  return function WithPermissionWrapper(
    props: P & { userPermissions?: PermissionObject[] }
  ) {
    const permissions = props.userPermissions || [];
    const hasPermission = checkPermission(permissions, resource, action);

    if (!hasPermission) {
      return null;
    }

    return React.createElement(WrappedComponent, props);
  };
}
