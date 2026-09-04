# Prisma Client Generation Guide

## Overview

This guide documents the process for generating and verifying the Prisma Client for the TaaS Solutions platform. The Prisma Client is a type-safe database client auto-generated from the `schema.prisma` file.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database accessible (for full testing)
- Prisma CLI installed via `npm install` (included in project dependencies)

## Generation Process

### Step 1: Generate Prisma Client

Run the following command to generate the Prisma Client:

```bash
npx prisma generate
```

**What this does:**
- Reads `prisma/schema.prisma`
- Generates TypeScript types and client code
- Outputs to `node_modules/.prisma/client/`
- Creates `node_modules/@prisma/client/` entry point

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client in XXXms

Start using Prisma Client in Node.js (See: https://pris.ly/d/client)
```

### Step 2: Verify Generation

After generation, verify that the client was created successfully:

```bash
# Check that the client directory exists
ls node_modules/.prisma/client

# Check that types are available
ls node_modules/@prisma/client
```

### Step 3: Run Verification Tests

Execute the verification test suite:

```bash
npm run test prisma/client-verification.test.ts
```

This test suite verifies:
- ✓ PrismaClient can be imported
- ✓ PrismaClient can be instantiated
- ✓ All 11 models are present
- ✓ TypeScript types are correctly generated
- ✓ Relations are properly defined
- ✓ Enums are exported
- ✓ Utility methods are available

## Schema Models

The generated Prisma Client includes the following models:

### Identity & Access Control
1. **User** - Platform users
2. **Role** - User roles (e.g., PLATFORM_ADMIN, CLIENT_MEMBER)
3. **Permission** - Granular permissions (e.g., "opportunity:create")
4. **UserRole** - User-to-Role assignments (junction table)
5. **RolePermission** - Role-to-Permission assignments (junction table)

### Organization Management
6. **Organisation** - Client and partner organizations
7. **OrganisationMember** - User-to-Organization memberships (junction table)

### Audit & Compliance
8. **AuditEvent** - Immutable audit trail for sensitive actions

### Authentication (NextAuth.js)
9. **Account** - OAuth provider accounts
10. **Session** - User sessions
11. **VerificationToken** - Email verification and password reset tokens

## Type Safety Verification

### Example 1: Type-Safe User Creation

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TypeScript will enforce correct types
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',  // ✓ Required string
    name: 'Test User',            // ✓ Required string
    password: 'hashed...',        // ✓ Optional string
    // id: 'custom'               // ✗ Error: Cannot set auto-generated field
  },
});
```

### Example 2: Type-Safe Queries with Relations

```typescript
// TypeScript knows about all relations
const userWithRoles = await prisma.user.findUnique({
  where: { email: 'test@example.com' },
  include: {
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    },
    organisationMembers: {
      include: {
        organisation: true,
      },
    },
  },
});

// userWithRoles is fully typed!
// TypeScript knows: userWithRoles.roles[0].role.name exists
// TypeScript knows: userWithRoles.organisationMembers[0].organisation.type exists
```

### Example 3: Enum Usage

```typescript
import { OrganisationType } from '@prisma/client';

const organisation = await prisma.organisation.create({
  data: {
    name: 'Acme Corp',
    type: OrganisationType.CLIENT,  // ✓ Type-safe enum
    // type: 'INVALID'               // ✗ TypeScript error
  },
});
```

## Common Issues & Solutions

### Issue 1: "Cannot find module '@prisma/client'"

**Solution:** Generate the client first
```bash
npx prisma generate
```

### Issue 2: "PrismaClient is unable to be run in the browser"

**Solution:** PrismaClient is server-side only. Import it only in:
- API routes
- Server Actions (with 'use server')
- Server Components (not Client Components)
- Backend utilities in `src/lib/`

### Issue 3: Types not updating after schema changes

**Solution:** Regenerate the client after any schema changes
```bash
npx prisma generate
```

### Issue 4: Network timeout during generation

**Solution:** The generation process is offline (no network required). If you see network-related errors, check:
- Prisma is installed locally in node_modules
- No proxy/firewall blocking the generation process
- Run with verbose logging: `npx prisma generate --schema=./prisma/schema.prisma`

## Integration with Project

### Database Singleton Pattern

The project uses a singleton pattern for the Prisma Client:

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

**Usage in modules:**
```typescript
import { db } from '@/lib/db';

export async function getUserById(id: string) {
  return await db.user.findUnique({
    where: { id },
  });
}
```

## Regeneration Triggers

You must regenerate the Prisma Client after:
- ✓ Adding or removing models
- ✓ Adding or removing fields
- ✓ Changing field types
- ✓ Adding or modifying relations
- ✓ Adding or modifying enums
- ✓ Changing indexes or constraints

Run: `npx prisma generate`

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/ci.yml
- name: Generate Prisma Client
  run: npx prisma generate

- name: Run tests
  run: npm run test
```

### Pre-commit Hook

```json
// package.json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prepare": "prisma generate"
  }
}
```

The `prepare` script runs automatically after `npm install`.

## Performance Considerations

### Client Instantiation

- ✓ Use singleton pattern (one client per application)
- ✗ Don't create new PrismaClient() in every function
- ✓ Disconnect in serverless functions after use

### Query Optimization

```typescript
// ✓ Select only needed fields
const user = await db.user.findUnique({
  where: { id },
  select: { id: true, email: true, name: true },
});

// ✗ Avoid fetching everything
const user = await db.user.findUnique({
  where: { id },
});
```

## Testing with Generated Client

### Unit Tests

```typescript
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'vitest-mock-extended';

const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});

test('getUserById', async () => {
  prismaMock.user.findUnique.mockResolvedValue({
    id: '1',
    email: 'test@example.com',
    name: 'Test',
    password: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const user = await getUserById('1');
  expect(user?.email).toBe('test@example.com');
});
```

## Verification Checklist

After running `npx prisma generate`, verify:

- [ ] `node_modules/.prisma/client/` directory exists
- [ ] `node_modules/@prisma/client/` can be imported
- [ ] All 11 models are present (User, Role, Permission, UserRole, RolePermission, Organisation, OrganisationMember, AuditEvent, Account, Session, VerificationToken)
- [ ] TypeScript types are recognized in IDE
- [ ] Enums are exported (OrganisationType)
- [ ] Relations work in queries (include/select)
- [ ] Verification test suite passes: `npm run test prisma/client-verification.test.ts`

## Status: Generation Pending

⚠️ **Current Status:** Prisma Client generation is pending due to network constraints.

**Next Steps:**
1. Ensure network access is available
2. Run `npx prisma generate`
3. Run verification tests: `npm run test prisma/client-verification.test.ts`
4. Verify all 11 models are accessible
5. Update this status when complete

## Resources

- [Prisma Client Documentation](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [TypeScript Usage](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/use-custom-model-and-field-names)
- [Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
