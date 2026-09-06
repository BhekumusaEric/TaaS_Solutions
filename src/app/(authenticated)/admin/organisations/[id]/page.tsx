import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppShell } from '@/components/layouts/app-shell';
import { ArrowLeft } from 'lucide-react';
import { OrgDetailClient } from './org-detail-client';

export default async function OrganisationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/sign-in');

  // Admin check
  const userWithRoles = await db.user.findUnique({
    where: { id: session.user.id },
    include: { roles: { include: { role: true } } },
  });
  const roleNames = userWithRoles?.roles.map((ur) => ur.role.name) ?? [];
  if (!roleNames.includes('PLATFORM_ADMIN')) redirect('/dashboard');

  const { id } = await params;

  const organisation = await db.organisation.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!organisation) notFound();

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 md:px-6 max-w-3xl">
        <Link href="/admin/organisations" className="inline-flex items-center text-sm text-gray-500 hover:text-navy-500 transition-colors mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to organisations
        </Link>

        <OrgDetailClient
          orgId={organisation.id}
          orgName={organisation.name}
          orgType={organisation.type}
          orgDescription={organisation.description}
          members={organisation.members}
        />
      </div>
    </AppShell>
  );
}
