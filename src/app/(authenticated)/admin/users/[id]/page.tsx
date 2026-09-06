import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppShell } from '@/components/layouts/app-shell';
import { UserDetailClient } from './user-detail-client';

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/sign-in');

  const userWithRoles = await db.user.findUnique({
    where: { id: session.user.id },
    include: { roles: { include: { role: true } } },
  });

  const roleNames = userWithRoles?.roles.map((ur) => ur.role.name) ?? [];
  if (!roleNames.includes('PLATFORM_ADMIN')) redirect('/dashboard');

  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user) notFound();

  const allRoles = await db.role.findMany({
    select: { id: true, name: true, description: true },
    orderBy: { name: 'asc' },
  });

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-3xl">
        <Link href="/admin/users" className="inline-flex items-center text-sm text-gray-500 hover:text-navy-500 transition-colors mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to users
        </Link>

        <UserDetailClient
          userId={user.id}
          userName={user.name}
          userEmail={user.email}
          userRoles={user.roles}
          allRoles={allRoles}
        />
      </div>
    </AppShell>
  );
}
