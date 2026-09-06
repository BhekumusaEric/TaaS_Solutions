import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppShell } from '@/components/layouts/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Search } from 'lucide-react';

interface SearchParams {
  search?: string;
  page?: string;
}

const PAGE_SIZE = 10;

export default async function OrganisationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  // Check admin role
  const userWithRoles = await db.user.findUnique({
    where: { id: session.user.id },
    include: { roles: { include: { role: true } } },
  });

  const roleNames = userWithRoles?.roles.map((ur) => ur.role.name) ?? [];
  if (!roleNames.includes('PLATFORM_ADMIN')) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const search = params.search ?? '';
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = search
    ? { name: { contains: search, mode: 'insensitive' as const } }
    : {};

  const [organisations, total] = await Promise.all([
    db.organisation.findMany({
      where,
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { name: 'asc' },
      skip,
      take: PAGE_SIZE,
    }),
    db.organisation.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-500">Organisations</h1>
            <p className="text-gray-500 mt-1">Manage client and partner organisations.</p>
          </div>
          <Link href="/admin/organisations/new">
            <Button className="bg-teal-500 text-white hover:bg-teal-600">
              <Plus className="mr-2 h-4 w-4" />
              New Organisation
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form method="GET" className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  name="search"
                  type="text"
                  defaultValue={search}
                  placeholder="Search organisations..."
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:border-transparent"
                />
              </div>
              <Button type="submit" variant="outline">Search</Button>
            </form>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {total} organisation{total !== 1 ? 's' : ''} found
            </CardTitle>
          </CardHeader>
          <CardContent>
            {organisations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No organisations found</p>
                <p className="text-sm">Create your first organisation to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Members</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organisations.map((org) => (
                      <tr key={org.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-dark-text">
                          <Link href={`/admin/organisations/${org.id}`} className="hover:text-teal-500 transition-colors">
                            {org.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            org.type === 'CLIENT'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {org.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{org._count.members}</td>
                        <td className="py-3 px-4 text-gray-500">{new Date(org.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/admin/organisations/${org.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link href={`/admin/organisations?page=${page - 1}${search ? `&search=${search}` : ''}`}>
                      <Button variant="outline" size="sm">Previous</Button>
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link href={`/admin/organisations?page=${page + 1}${search ? `&search=${search}` : ''}`}>
                      <Button variant="outline" size="sm">Next</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
