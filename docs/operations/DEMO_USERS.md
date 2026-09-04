# Demo User Accounts - TaaS Solutions Platform

**Purpose:** This document provides comprehensive documentation of all demo user accounts created by the database seed script for development and testing purposes.

**Status:** All demo users properly labeled with "DEMO" prefix as required by US-023  
**Last Updated:** 2026-09-01  
**Seed Script Location:** `prisma/seed.ts`

---

## Overview

The TaaS Solutions platform includes **9 demo user accounts** covering all major user roles. These accounts are designed for:

- Local development and testing
- Feature demonstrations
- Integration testing
- User role verification
- Training and onboarding

**Security Note:** Demo users are clearly labeled and prevented from being created in production environments through environment checks in the seed script.

---

## Demo User Accounts

### 1. DEMO Verified Talent User

**Email:** `DEMO_TALENT@example.com`  
**Name:** `DEMO Verified Talent User`  
**Password:** `DemoPassword123!`  
**Role:** `VERIFIED_TALENT`  
**Organisation Membership:** None (available for pod assignments)

**Purpose:** Represents a verified emerging technology professional available for Talent Pod assignments.

**Permissions:**
- `profile:read:own` - View own profile
- `profile:update:own` - Update own profile  
- `project:read:assigned` - View assigned projects
- `deliverable:submit` - Submit deliverables

**Use Cases:**
- Testing talent dashboard
- Simulating project assignment workflows
- Testing deliverable submission
- Verifying talent-scoped permissions

---

### 2. DEMO Client Member

**Email:** `DEMO_CLIENT@example.com`  
**Name:** `DEMO Client Member`  
**Password:** `DemoPassword123!`  
**Role:** `CLIENT_MEMBER`  
**Organisation Membership:** `DEMO Client Organisation`

**Purpose:** Represents a standard client organisation member who can submit opportunities and view projects.

**Permissions:**
- `profile:read:own` - View own profile
- `profile:update:own` - Update own profile
- `opportunity:create` - Create opportunities
- `opportunity:read:org` - View organisation opportunities
- `project:read:org` - View organisation projects

**Use Cases:**
- Testing opportunity submission
- Testing client dashboard
- Verifying organisation-scoped permissions
- Testing opportunity workflow

---

### 3. DEMO Client Approver

**Email:** `DEMO_CLIENT_APPROVER@example.com`  
**Name:** `DEMO Client Approver`  
**Password:** `DemoPassword123!`  
**Role:** `CLIENT_APPROVER`  
**Organisation Membership:** `DEMO Client Organisation`

**Purpose:** Represents a client organisation member with approval authority for proposals and deliverables.

**Permissions:**
- `profile:read:own` - View own profile
- `profile:update:own` - Update own profile
- `opportunity:create` - Create opportunities
- `opportunity:read:org` - View organisation opportunities
- `project:read:org` - View organisation projects
- `deliverable:accept` - Accept deliverables

**Use Cases:**
- Testing proposal approval workflow
- Testing deliverable acceptance
- Verifying approval permissions
- Testing client acceptance workflow

---

### 4. DEMO Delivery Lead

**Email:** `DEMO_DELIVERY_LEAD@example.com`  
**Name:** `DEMO Delivery Lead`  
**Password:** `DemoPassword123!`  
**Role:** `DELIVERY_LEAD`  
**Organisation Membership:** `DEMO Client Organisation`

**Purpose:** Represents the accountable person for a Talent Pod and project delivery.

**Permissions:**
- `profile:read:own` - View own profile
- `profile:update:own` - Update own profile
- `project:read:assigned` - View assigned projects
- `project:update:assigned` - Update assigned projects
- `deliverable:review` - Review deliverables

**Use Cases:**
- Testing delivery dashboard
- Testing project management workflows
- Testing deliverable review process
- Verifying delivery lead permissions

---

### 5. DEMO Talent Ops Admin

**Email:** `DEMO_TALENT_OPS@example.com`  
**Name:** `DEMO Talent Ops Admin`  
**Password:** `DemoPassword123!`  
**Role:** `TALENT_OPS_ADMIN`  
**Organisation Membership:** None (internal TaaS staff)

**Purpose:** Represents internal TaaS staff responsible for talent verification and progression.

**Permissions:**
- `profile:read:own` - View own profile
- `profile:update:own` - Update own profile
- `user:read` - View user information
- `organisation:read:all` - View all organisations
- `audit:read:all` - View all audit events

**Use Cases:**
- Testing talent verification workflows
- Testing talent progression
- Testing talent operations dashboard
- Verifying admin-level read permissions

---

### 6. DEMO Project Ops Admin

**Email:** `DEMO_PROJECT_OPS@example.com`  
**Name:** `DEMO Project Ops Admin`  
**Password:** `DemoPassword123!`  
**Role:** `PROJECT_OPS_ADMIN`  
**Organisation Membership:** None (internal TaaS staff)

**Purpose:** Represents internal TaaS staff responsible for opportunity qualification and project mobilization.

**Permissions:**
- `profile:read:own` - View own profile
- `profile:update:own` - Update own profile
- `opportunity:read:all` - View all opportunities
- `organisation:read:all` - View all organisations
- `audit:read:all` - View all audit events

**Use Cases:**
- Testing opportunity triage workflows
- Testing proposal creation
- Testing project mobilization
- Testing pod assembly

---

### 7. DEMO Quality Reviewer

**Email:** `DEMO_QUALITY@example.com`  
**Name:** `DEMO Quality Reviewer`  
**Password:** `DemoPassword123!`  
**Role:** `QUALITY_REVIEWER`  
**Organisation Membership:** None (internal TaaS staff)

**Purpose:** Represents internal TaaS staff responsible for internal quality assurance.

**Permissions:**
- `profile:read:own` - View own profile
- `profile:update:own` - Update own profile
- `deliverable:review` - Review deliverables
- `audit:read:all` - View all audit events

**Use Cases:**
- Testing quality review workflows
- Testing deliverable review process
- Verifying quality gates
- Testing rework workflows

---

### 8. DEMO Finance Admin

**Email:** `DEMO_FINANCE@example.com`  
**Name:** `DEMO Finance Admin`  
**Password:** `DemoPassword123!`  
**Role:** `FINANCE_ADMIN`  
**Organisation Membership:** None (internal TaaS staff)

**Purpose:** Represents internal TaaS staff responsible for invoices and payouts.

**Permissions:**
- `profile:read:own` - View own profile
- `profile:update:own` - Update own profile
- `organisation:read:all` - View all organisations
- `audit:read:all` - View all audit events

**Use Cases:**
- Testing invoice creation
- Testing payout processing
- Testing financial dashboards
- Verifying financial audit trail

---

### 9. DEMO Platform Administrator

**Email:** `DEMO_ADMIN@example.com`  
**Name:** `DEMO Platform Administrator`  
**Password:** `DemoPassword123!`  
**Role:** `PLATFORM_ADMIN`  
**Organisation Membership:** None (system-wide access)

**Purpose:** Represents internal TaaS staff with system-wide configuration and support responsibilities.

**Permissions:** Full system access including:
- All user management permissions
- All organisation management permissions
- All role and permission management
- All audit log access
- System configuration

**Use Cases:**
- Testing admin dashboard
- Testing user management
- Testing role assignments
- Testing organisation management
- System configuration testing

---

## Demo Organisations

### DEMO Client Organisation

**Name:** `DEMO Client Organisation`  
**Type:** `CLIENT`  
**Description:** Demo client organisation for testing and development

**Members:**
- DEMO_CLIENT@example.com
- DEMO_CLIENT_APPROVER@example.com
- DEMO_DELIVERY_LEAD@example.com

**Purpose:** Represents a client organisation for testing client workflows, organisation isolation, and project delivery.

---

### DEMO Partner Organisation

**Name:** `DEMO Partner Organisation`  
**Type:** `PARTNER`  
**Description:** Demo partner organisation for testing and development

**Members:** None (reserved for future partner workflow testing)

**Purpose:** Represents a partner organisation for testing partner collaboration features.

---

## Security and Labeling

### DEMO Prefix Requirements (US-023)

All demo users meet the following requirements from User Story US-023:

✅ **Email Prefix:** All demo user emails start with `DEMO_`  
✅ **Name Identification:** All demo user names contain "DEMO" for clear identification  
✅ **Distinguishable:** Demo users are easily identifiable and filterable  
✅ **Documented:** This comprehensive documentation exists  
✅ **Production Protection:** Seed script prevents demo data in production

### Password Security

- **Hashing:** All passwords are hashed using bcrypt with 10 salt rounds
- **Known Password:** Demo password is `DemoPassword123!` for development convenience
- **Production Safety:** Demo users cannot be created in production (enforced by seed script)

### Identification Methods

Demo users can be identified through:

1. **Email Query:**
   ```typescript
   const demoUsers = await db.user.findMany({
     where: {
       email: { startsWith: 'DEMO_' }
     }
   });
   ```

2. **Name Query:**
   ```typescript
   const demoUsers = await db.user.findMany({
     where: {
       name: { contains: 'DEMO' }
     }
   });
   ```

3. **Exclusion Filter:**
   ```typescript
   const realUsers = await db.user.findMany({
     where: {
       email: { not: { startsWith: 'DEMO_' } }
     }
   });
   ```

---

## Testing with Demo Users

### Integration Testing

Demo users are ideal for integration tests that require authenticated users:

```typescript
import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db';

describe('Opportunity Creation', () => {
  it('should allow CLIENT_MEMBER to create opportunity', async () => {
    const clientUser = await db.user.findUnique({
      where: { email: 'DEMO_CLIENT@example.com' },
    });
    
    // Test opportunity creation with demo user
    // ...
  });
});
```

### Manual Testing

Use demo accounts for manual feature testing:

1. Sign in with appropriate demo account
2. Test role-specific features
3. Verify permissions are enforced
4. Test workflows end-to-end

### E2E Testing

Demo users are pre-seeded and reliable for E2E tests:

```typescript
import { test, expect } from '@playwright/test';

test('Client member can submit opportunity', async ({ page }) => {
  await page.goto('/sign-in');
  await page.fill('[name=email]', 'DEMO_CLIENT@example.com');
  await page.fill('[name=password]', 'DemoPassword123!');
  await page.click('button[type=submit]');
  
  // Continue with test...
});
```

---

## Seeding Demo Users

### Running the Seed Script

```bash
# Generate Prisma Client (if not already done)
npm run db:generate

# Run migrations (first time)
npm run db:migrate

# Seed demo data
npm run db:seed
```

### Seed Script Features

The seed script (`prisma/seed.ts`) is:

- **Idempotent:** Can be run multiple times safely
- **Production-Safe:** Exits with error if NODE_ENV=production
- **Comprehensive:** Creates users, roles, permissions, organisations, memberships
- **Documented:** Includes clear console output showing progress

### Expected Output

```
🌱 Starting database seed...

✅ Demo password hashed
📋 Seeding permissions...
✅ Created 30 permissions
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

### Demo Users Not Found

**Problem:** Tests or manual login cannot find demo users.

**Solution:**
1. Verify database connection: `npm run db:test`
2. Check seed script was run: `npm run db:seed`
3. Check environment is not production

### Authentication Fails

**Problem:** Cannot sign in with demo credentials.

**Solution:**
1. Verify password: `DemoPassword123!`
2. Check authentication provider configuration
3. Verify user exists in database
4. Check password hashing is configured correctly

### Organisation Access Issues

**Problem:** Demo users cannot access organisation resources.

**Solution:**
1. Verify organisation membership was created
2. Check organisation isolation logic
3. Verify role permissions include org-scoped access

---

## Maintenance

### Adding New Demo Users

To add new demo users:

1. Edit `prisma/seed.ts`
2. Add user to `demoUsers` array with `DEMO_` prefix
3. Add role assignment to `assignments` array
4. Add organisation membership if needed
5. Run `npm run db:seed`
6. Update this documentation

### Updating Demo User Roles

To update demo user roles:

1. Edit role-permission mappings in `assignPermissionsToRoles()`
2. Run `npm run db:seed` (idempotent)
3. Verify changes with test

### Removing Demo Users

**Development:**
```bash
npm run db:reset  # WARNING: Deletes all data
npm run db:migrate
npm run db:seed
```

**Production:** Demo users cannot exist in production.

---

## Compliance and Best Practices

### Development Best Practices

✅ **Use Demo Accounts Only for Development**  
✅ **Never Share Demo Passwords Outside Development Team**  
✅ **Reset Demo Passwords if Shared Publicly**  
✅ **Document Any Changes to Demo Users**  

### Production Requirements

⚠️ **Demo Users Must NOT Exist in Production**

The seed script enforces this with:

```typescript
if (process.env.NODE_ENV === 'production') {
  console.error('❌ ERROR: Cannot seed database in production environment');
  process.exit(1);
}
```

### Audit Trail

All actions performed by demo users are logged in the audit_event table and can be queried:

```typescript
// Query all actions by demo users
const demoActions = await db.auditEvent.findMany({
  where: {
    user: {
      email: { startsWith: 'DEMO_' }
    }
  },
  include: {
    user: true
  }
});
```

---

## Summary

### Verification Checklist ✅

- [x] All 9 demo users have `DEMO_` prefix in email
- [x] All demo user names contain "DEMO" for identification
- [x] Demo users can be filtered by email or name
- [x] Each demo user represents a distinct role
- [x] Demo users have appropriate role assignments
- [x] Demo users have appropriate organisation memberships
- [x] Demo organisations exist with "DEMO" prefix
- [x] Passwords are securely hashed
- [x] Production protection is enforced
- [x] Comprehensive documentation provided

### Test Coverage

Integration tests verify:
- Email prefix validation
- Name identification
- Filtering capabilities
- Role assignments
- Organisation memberships
- Password hashing
- Production safety

**Test Location:** `src/tests/integration/demo-users.test.ts`

---

**Document Owner:** Platform Operations Team  
**Last Review:** 2026-09-01  
**Next Review:** When adding new demo users or roles

**References:**
- Seed Script: `prisma/seed.ts`
- Integration Tests: `src/tests/integration/demo-users.test.ts`
- Requirements: `.kiro/specs/01-platform-foundation/requirements.md` (US-023)
- Domain Language: `.kiro/steering/domain-language.md`

