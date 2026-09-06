import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Dashboard root — detects the authenticated user's primary role
 * and redirects to the appropriate role-specific dashboard.
 *
 * Role priority (highest wins):
 *  1. PLATFORM_ADMIN  → /dashboard/admin
 *  2. CLIENT_MEMBER   → /dashboard/client
 *  3. VERIFIED_TALENT  → /dashboard/talent
 *  4. (fallback)       → /dashboard/talent
 */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  // Fetch user roles from DB
  const userWithRoles = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  const roleNames = userWithRoles?.roles.map((ur) => ur.role.name) ?? [];

  if (roleNames.includes('PLATFORM_ADMIN')) {
    redirect('/dashboard/admin');
  }

  if (roleNames.includes('CLIENT_MEMBER')) {
    redirect('/dashboard/client');
  }

  // Default: talent dashboard (covers VERIFIED_TALENT, TALENT_APPLICANT, etc.)
  redirect('/dashboard/talent');
}
