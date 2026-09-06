import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AppShell } from '@/components/layouts/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Building2, Activity } from 'lucide-react';
import { db } from '@/lib/db';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  // Fetch quick stats
  const [userCount, orgCount, roleCount, recentAuditCount] = await Promise.all([
    db.user.count(),
    db.organisation.count(),
    db.role.count(),
    db.auditEvent.count({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24h
        },
      },
    }),
  ]);

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-500">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Platform overview and system administration.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-navy-500">{userCount}</div>
              <p className="text-xs text-gray-500">Registered platform users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organisations</CardTitle>
              <Building2 className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-navy-500">{orgCount}</div>
              <p className="text-xs text-gray-500">Client and partner orgs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roles</CardTitle>
              <Shield className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-navy-500">{roleCount}</div>
              <p className="text-xs text-gray-500">Configured RBAC roles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audit Events (24h)</CardTitle>
              <Activity className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-navy-500">{recentAuditCount}</div>
              <p className="text-xs text-gray-500">Actions in last 24 hours</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
