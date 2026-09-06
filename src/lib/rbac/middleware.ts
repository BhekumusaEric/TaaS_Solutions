import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { checkPermission } from './permissions';
import { getUserPermissions } from '@/modules/roles/queries';

export async function requirePermission(
  req: NextRequest,
  resource: string,
  action: string
) {
  const token = await getToken({ req });
  
  if (!token || !token.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userPermissions = await getUserPermissions(token.sub);
  
  const hasPermission = checkPermission(userPermissions, resource, action);
  
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null; // Return null if authorized, allowing the handler to proceed
}
