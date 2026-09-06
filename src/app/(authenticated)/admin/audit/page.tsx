import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppShell } from '@/components/layouts/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditFilterParams {
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
}

const PAGE_SIZE = 20;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<AuditFilterParams>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/sign-in');

  const userWithRoles = await db.user.findUnique({
    where: { id: session.user.id },
    include: { roles: { include: { role: true } } },
  });

  const roleNames = userWithRoles?.roles.map((ur) => ur.role.name) ?? [];
  if (!roleNames.includes('PLATFORM_ADMIN')) redirect('/dashboard');

  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = {};

  if (params.userId) where.userId = params.userId;
  if (params.action) where.action = params.action;
  if (params.startDate || params.endDate) {
    where.timestamp = {};
    if (params.startDate) {
      where.timestamp = {
        ...where.timestamp,
        gte: new Date(params.startDate),
      };
    }
    if (params.endDate) {
      where.timestamp = {
        ...where.timestamp,
        lte: new Date(`${params.endDate}T23:59:59.999Z`),
      };
    }
  }

  const [events, total] = await Promise.all([
    db.auditEvent.findMany({
      where,
      include: { user: true },
      orderBy: { timestamp: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    db.auditEvent.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildQueryString = (nextPage: number) => {
    const search = new URLSearchParams();
    if (params.userId) search.set('userId', params.userId);
    if (params.action) search.set('action', params.action);
    if (params.startDate) search.set('startDate', params.startDate);
    if (params.endDate) search.set('endDate', params.endDate);
    search.set('page', String(nextPage));
    return `?${search.toString()}`;
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-500">Audit Log</h1>
          <p className="text-gray-500 mt-1">Security and activity history for the platform.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-teal-500" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form method="GET" className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">User ID</label>
                <input
                  name="userId"
                  defaultValue={params.userId ?? ''}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                  placeholder="user id"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Action</label>
                <input
                  name="action"
                  defaultValue={params.action ?? ''}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                  placeholder="ROLE_ASSIGNED"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Start date</label>
                <input
                  name="startDate"
                  type="date"
                  defaultValue={params.startDate ?? ''}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">End date</label>
                <input
                  name="endDate"
                  type="date"
                  defaultValue={params.endDate ?? ''}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                />
              </div>

              <div className="md:col-span-4 flex justify-end gap-2">
                <Button type="submit" className="bg-teal-500 text-white hover:bg-teal-600">
                  Apply filters
                </Button>
                <Link href="/admin/audit">
                  <Button type="button" variant="outline">Clear</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-500" />
              Events ({total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No audit events match the current filters.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="py-3 px-2 font-medium text-gray-500">Timestamp</th>
                        <th className="py-3 px-2 font-medium text-gray-500">User</th>
                        <th className="py-3 px-2 font-medium text-gray-500">Action</th>
                        <th className="py-3 px-2 font-medium text-gray-500">Resource</th>
                        <th className="py-3 px-2 font-medium text-gray-500">Resource ID</th>
                        <th className="py-3 px-2 font-medium text-gray-500">Metadata</th>
                        <th className="py-3 px-2 font-medium text-gray-500">IP</th>
                        <th className="py-3 px-2 font-medium text-gray-500">User Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event.id} className="border-b border-gray-100 align-top">
                          <td className="py-3 px-2 text-gray-600">
                            {new Date(event.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-medium text-dark-text">{event.user?.name ?? 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{event.user?.email ?? event.userId}</div>
                          </td>
                          <td className="py-3 px-2 font-medium text-teal-700">{event.action}</td>
                          <td className="py-3 px-2 text-gray-700">{event.resourceType}</td>
                          <td className="py-3 px-2 text-gray-500 break-all">{event.resourceId}</td>
                          <td className="py-3 px-2 text-gray-600 max-w-xs break-words">
                            {event.metadata ? JSON.stringify(event.metadata) : '—'}
                          </td>
                          <td className="py-3 px-2 text-gray-500">{event.ipAddress ?? '—'}</td>
                          <td className="py-3 px-2 text-gray-500 max-w-xs break-words">
                            {event.userAgent ?? '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      {page > 1 && (
                        <Link href={`/admin/audit${buildQueryString(page - 1)}`}>
                          <Button variant="outline" size="sm">
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Previous
                          </Button>
                        </Link>
                      )}
                      {page < totalPages && (
                        <Link href={`/admin/audit${buildQueryString(page + 1)}`}>
                          <Button variant="outline" size="sm">
                            Next
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
