# Seed Script Documentation

## Overview

The seed script (`prisma/seed.ts`) populates the database with demo data for development and testing. This document describes the user role and organisation assignment logic.

---

## Security Notice

**IMPORTANT:** The seed script will NOT run in production environments. It checks `NODE_ENV` and exits with an error if set to `production`.

All demo accounts use the password: `DemoPassword123!` (properly hashed with bcrypt)

---

## User Role Assignments

The seed script creates **9 demo users**, each assigned to **exactly 1 role**.

### Role Assignment Logic

| Email                              | Assigned Role          | Description                                      |
| ---------------------------------- | ---------------------- | ------------------------------------------------ |
| `DEMO_TALENT@example.com`          | `VERIFIED_TALENT`      | Approved talent available for pod assignments    |
| `DEMO_CLIENT@example.com`          | `CLIENT_MEMBER`        | Client organisation member                       |
| `DEMO_CLIENT_APPROVER@example.com` | `CLIENT_APPROVER`      | Client with approval authority                   |
| `DEMO_DELIVERY_LEAD@example.com`   | `DELIVERY_LEAD`        | Accountable for pod and project delivery         |
| `DEMO_TALENT_OPS@example.com`      | `TALENT_OPS_ADMIN`     | Internal staff managing talent verification      |
| `DEMO_PROJECT_OPS@example.com`     | `PROJECT_OPS_ADMIN`    | Internal staff managing opportunity pipeline     |
| `DEMO_QUALITY@example.com`         | `QUALITY_REVIEWER`     | Internal staff performing QA                     |
| `DEMO_FINANCE@example.com`         | `FINANCE_ADMIN`        | Internal staff managing invoices and payouts     |
| `DEMO_ADMIN@example.com`           | `PLATFORM_ADMIN`       | System administrator with full permissions       |

### Implementation

The `assignRolesToUsers()` function creates `UserRole` records linking each user to their designated role:

```typescript
await prisma.userRole.upsert({
  where: {
    userId_roleId: { userId, roleId },
  },
  update: {},
  create: { userId, roleId },
});
```

**Characteristics:**
- Each user has exactly 1 role (1:1 relationship in seed data)
- All role assignments are unique (no two users share the same role in demo data)
- Assignments are idempotent (can be run multiple times safely)

---

## Organisation Assignments

The seed script creates **2 demo organisations** and assigns **3 users** to the client organisation.

### Organisation Structure

| Organisation Name              | Type       | Description                            |
| ------------------------------ | ---------- | -------------------------------------- |
| `DEMO Client Organisation`     | `CLIENT`   | Demo client org for testing client workflows |
| `DEMO Partner Organisation`    | `PARTNER`  | Demo partner org (no users assigned in MVP) |

### User-Organisation Assignment Logic

| Email                              | Assigned Organisation        | Rationale                                        |
| ---------------------------------- | ---------------------------- | ------------------------------------------------ |
| `DEMO_CLIENT@example.com`          | `DEMO Client Organisation`   | Client member belongs to their client org        |
| `DEMO_CLIENT_APPROVER@example.com` | `DEMO Client Organisation`   | Client approver belongs to their client org      |
| `DEMO_DELIVERY_LEAD@example.com`   | `DEMO Client Organisation`   | Delivery lead assigned to active client project  |

### Users NOT Assigned to Organisations (6 users)

The following users are **NOT assigned to any organisation** because they are internal TaaS staff or talent:

- `DEMO_TALENT@example.com` - Talent is assigned to projects/pods, not permanently to orgs
- `DEMO_TALENT_OPS@example.com` - Internal admin (not org-specific)
- `DEMO_PROJECT_OPS@example.com` - Internal admin (not org-specific)
- `DEMO_QUALITY@example.com` - Internal admin (not org-specific)
- `DEMO_FINANCE@example.com` - Internal admin (not org-specific)
- `DEMO_ADMIN@example.com` - Platform admin (not org-specific)

### Implementation

The `assignUsersToOrganisations()` function creates `OrganisationMember` records:

```typescript
await prisma.organisationMember.upsert({
  where: {
    userId_organisationId: { userId, organisationId },
  },
  update: {},
  create: { userId, organisationId },
});
```

**Characteristics:**
- Only client-facing users are assigned to organisations
- Internal admin roles have no organisation assignments (platform-wide access)
- Talent can be assigned to organisations dynamically when joining projects (not in seed)
- Assignments are idempotent

---

## Domain Logic Summary

### Role Assignment Rules

1. **Each demo user has exactly 1 role** for simplicity in MVP seed data
2. **Real users can have multiple roles** (supported by schema, not demonstrated in seed)
3. **Role assignments are explicit** - no automatic role assignments based on other factors

### Organisation Assignment Rules

1. **Client members must belong to their organisation** to access org-scoped resources
2. **Internal admin roles are NOT org-scoped** - they have platform-wide access
3. **Talent assignment to orgs is dynamic** - happens when assigned to projects/pods
4. **Users can belong to multiple organisations** (supported by schema, not demonstrated in seed)

### Security Implications

1. **Organisation Isolation:** Only users who are members of an organisation can access that organisation's resources
2. **Role-Based Permissions:** Each role grants specific permissions via `RolePermission` mappings
3. **Server-Side Enforcement:** All authorization checks happen server-side (client UI hiding is not security)

---

## Testing User Assignments

To verify the seed script worked correctly, you can:

### Using Prisma Studio

```bash
npm run prisma:studio
```

Navigate to:
- **User** table → Check 9 demo users exist
- **UserRole** table → Check 9 role assignments (1 per user)
- **OrganisationMember** table → Check 3 organisation assignments

### Using SQL Queries

```sql
-- Check all demo users and their roles
SELECT 
  u.email,
  u.name,
  r.name as role
FROM "User" u
LEFT JOIN "UserRole" ur ON u.id = ur."userId"
LEFT JOIN "Role" r ON ur."roleId" = r.id
WHERE u.email LIKE 'DEMO_%'
ORDER BY u.email;

-- Check organisation memberships
SELECT 
  u.email,
  o.name as organisation,
  o.type
FROM "User" u
LEFT JOIN "OrganisationMember" om ON u.id = om."userId"
LEFT JOIN "Organisation" o ON om."organisationId" = o.id
WHERE u.email LIKE 'DEMO_%'
ORDER BY u.email;
```

### Using Automated Tests

Run the comprehensive test suite:

```bash
npm run test -- prisma/seed.test.ts
```

This test suite verifies:
- All 9 demo users are created
- Each user has exactly 1 role
- Role assignments match specifications
- 3 users are assigned to DEMO Client Organisation
- 6 users have no organisation assignments
- All relationships are properly created in the database

---

## Modifying Seed Data

### Adding a New Demo User

1. Add user to `seedDemoUsers()`:
```typescript
{
  email: 'DEMO_NEW_USER@example.com',
  name: 'DEMO New User',
  password: hashedPassword,
}
```

2. Add role assignment to `assignRolesToUsers()`:
```typescript
{ email: 'DEMO_NEW_USER@example.com', role: 'SOME_ROLE' }
```

3. (Optional) Add organisation assignment to `assignUsersToOrganisations()`:
```typescript
{ email: 'DEMO_NEW_USER@example.com', org: 'DEMO Client Organisation' }
```

### Adding a New Organisation

Add to `seedDemoOrganisations()`:
```typescript
{
  name: 'DEMO New Organisation',
  type: OrganisationType.CLIENT,
  description: 'Description here',
}
```

---

## Permissions by Role

Each role is assigned specific permissions via `assignPermissionsToRoles()`. See the mapping in the seed script for detailed permission grants.

### Example: VERIFIED_TALENT Permissions

- `profile:read:own` - Can read their own profile
- `profile:update:own` - Can update their own profile
- `project:read:assigned` - Can read projects they're assigned to
- `deliverable:submit` - Can submit deliverables

### Example: CLIENT_MEMBER Permissions

- `profile:read:own` - Can read their own profile
- `profile:update:own` - Can update their own profile
- `opportunity:create` - Can create opportunities
- `opportunity:read:org` - Can read their organisation's opportunities
- `project:read:org` - Can read their organisation's projects

### Example: PLATFORM_ADMIN Permissions

Platform administrators have extensive permissions including:
- All user management permissions
- All organisation management permissions
- All role management permissions
- All audit log access
- Access to read all opportunities and projects

---

## Running the Seed Script

### Prerequisites

1. PostgreSQL database running
2. `DATABASE_URL` configured in `.env.local`
3. Database migrations applied (`npm run prisma:migrate`)

### Command

```bash
npm run prisma:seed
```

### Expected Output

```
🌱 Starting database seed...

✅ Demo password hashed

📋 Seeding permissions...
✅ Created 33 permissions

👥 Seeding roles...
✅ Created 10 roles

🔐 Assigning permissions to roles...
✅ Permissions assigned to roles

👤 Seeding demo users...
✅ Created 9 demo users

🎭 Assigning roles to users...
✅ Roles assigned to users

🏢 Seeding demo organisations...
✅ Created 2 demo organisations

🔗 Assigning users to organisations...
✅ Users assigned to organisations

✨ Database seeding completed successfully!

📝 Demo Accounts:
   Email: DEMO_TALENT@example.com
   Email: DEMO_CLIENT@example.com
   Email: DEMO_DELIVERY_LEAD@example.com
   Email: DEMO_ADMIN@example.com
   Password (all): DemoPassword123!
```

---

## Troubleshooting

### Seed Script Fails with "Cannot seed in production"

**Cause:** `NODE_ENV=production` is set.

**Solution:** This is intentional. Never seed production databases with demo data. For production, use proper data migration and onboarding workflows.

### Seed Script Fails with "Unique constraint violation"

**Cause:** Seed script already ran and demo data exists.

**Solution:** The script is idempotent and uses `upsert`. This error shouldn't occur. If it does, check for manual data modifications conflicting with demo data.

### Demo Users Can't Sign In

**Cause:** Password hashing mismatch or seed didn't complete.

**Solutions:**
1. Verify seed script completed successfully
2. Check User table has password hashes (start with `$2a$`, `$2b$`, or `$2y$`)
3. Verify NextAuth.js is configured for credentials provider
4. Check password verification uses bcrypt compare

---

## Related Documentation

- **Database Setup:** See `DATABASE_SETUP.md`
- **Schema Definition:** See `prisma/schema.prisma`
- **Authorization Design:** See `.kiro/specs/01-platform-foundation/design.md`
- **Security Requirements:** See `.kiro/steering/security.md`

---

**Last Updated:** 2026-09-01  
**Seed Script Version:** 1.0
