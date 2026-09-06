'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Shield, Lock } from 'lucide-react';
import { assignRole, removeRole } from '@/app/actions/user-roles';

interface UserRole {
  id: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    description: string | null;
    permissions: { permission: { name: string; resource: string; action: string } }[];
  };
}

interface UserDetailClientProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRoles: UserRole[];
  allRoles: { id: string; name: string; description: string | null }[];
}

export function UserDetailClient({ userId, userName, userEmail, userRoles, allRoles }: UserDetailClientProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const assignedRoleNames = userRoles.map((ur) => ur.role.name);
  const availableRoles = allRoles.filter((r) => !assignedRoleNames.includes(r.name));

  // Collect effective permissions from all assigned roles
  const effectivePermissions = new Map<string, { resource: string; action: string }>();
  for (const ur of userRoles) {
    for (const rp of ur.role.permissions) {
      effectivePermissions.set(rp.permission.name, {
        resource: rp.permission.resource,
        action: rp.permission.action,
      });
    }
  }

  const handleAssignRole = async () => {
    if (!selectedRole) return;
    setAssignError(null);
    startTransition(async () => {
      const result = await assignRole({ userId, roleName: selectedRole });
      if (result.error) {
        setAssignError(result.error);
      } else {
        setSelectedRole('');
        setDialogOpen(false);
        router.refresh();
      }
    });
  };

  const handleRemoveRole = async (roleId: string) => {
    setRemoveError(null);
    startTransition(async () => {
      const result = await removeRole({ userId, roleId });
      if (result.error) {
        setRemoveError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <>
      {/* User Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl text-navy-500">{userName}</CardTitle>
          <CardDescription>{userEmail}</CardDescription>
        </CardHeader>
      </Card>

      {/* Assigned Roles */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-500" />
              Assigned Roles ({userRoles.length})
            </CardTitle>
            {availableRoles.length > 0 && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-teal-500 text-white hover:bg-teal-600"
                    aria-label="Open role form"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Assign Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Role</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    {assignError && (
                      <div className="rounded-md bg-red-50 p-3" role="alert">
                        <p className="text-sm font-medium text-red-800">{assignError}</p>
                      </div>
                    )}
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                    >
                      <option value="">Select a role...</option>
                      {availableRoles.map((role) => (
                        <option key={role.id} value={role.name}>
                          {role.name}{role.description ? ` — ${role.description}` : ''}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={handleAssignRole}
                      isLoading={isPending}
                      className="w-full"
                      disabled={!selectedRole}
                      aria-label="Assign role"
                    >
                      Assign Role
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {removeError && (
            <div className="mb-4 rounded-md bg-red-50 p-3" role="alert">
              <p className="text-sm font-medium text-red-800">{removeError}</p>
            </div>
          )}
          {userRoles.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No roles assigned yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {userRoles.map((ur) => (
                <div key={ur.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-dark-text">{ur.role.name}</p>
                    {ur.role.description && (
                      <p className="text-xs text-gray-500">{ur.role.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveRole(ur.roleId)}
                    disabled={isPending}
                    aria-label={`Remove role ${ur.role.name}`}
                    title={`Remove role ${ur.role.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Effective Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-gold" />
            Effective Permissions ({effectivePermissions.size})
          </CardTitle>
          <CardDescription>Aggregated from all assigned roles.</CardDescription>
        </CardHeader>
        <CardContent>
          {effectivePermissions.size === 0 ? (
            <p className="text-center py-8 text-gray-500">No permissions. Assign a role to grant permissions.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from(effectivePermissions.entries()).map(([name, perm]) => (
                <div key={name} className="rounded-md border border-gray-200 px-3 py-2 text-xs">
                  <span className="font-medium text-dark-text">{perm.resource}</span>
                  <span className="text-gray-400 mx-1">:</span>
                  <span className="text-teal-600">{perm.action}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
