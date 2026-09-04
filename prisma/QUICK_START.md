# Prisma Client - Quick Start

## 🚀 Generate Client

```bash
npx prisma generate
```

## ✅ Verify Generation

```bash
# Run verification script
npm run prisma:verify

# Or run test suite
npm run test prisma/client-verification.test.ts
```

## 📦 What You Get

**11 Models:**
- User, Role, Permission, UserRole, RolePermission
- Organisation, OrganisationMember
- AuditEvent
- Account, Session, VerificationToken

**Type Safety:**
- Full TypeScript support
- Auto-completion in IDE
- Compile-time type checking

**Enums:**
- OrganisationType (CLIENT, PARTNER)

## 💻 Usage Example

```typescript
import { db } from '@/lib/db';

// Create a user
const user = await db.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: 'hashed...',
  },
});

// Query with relations
const userWithRoles = await db.user.findUnique({
  where: { email: 'user@example.com' },
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

// Type-safe enum usage
import { OrganisationType } from '@prisma/client';

const org = await db.organisation.create({
  data: {
    name: 'Acme Corp',
    type: OrganisationType.CLIENT,
  },
});
```

## 🔄 After Schema Changes

Always regenerate the client:

```bash
npx prisma generate
```

## 📚 More Information

- **Full Guide:** `prisma/GENERATION_GUIDE.md`
- **Status:** `prisma/CLIENT_GENERATION_STATUS.md`
- **Tests:** `prisma/client-verification.test.ts`
- **Verification Script:** `scripts/verify-prisma-client.ts`

## ⚡ CI/CD

Client generates automatically:
- After `npm install` (postinstall hook)
- Before `npm run build` (prebuild hook)

## 🆘 Troubleshooting

**Error: Cannot find module '@prisma/client'**
```bash
npx prisma generate
```

**Types not updating after schema change**
```bash
npx prisma generate
npm run type-check
```

**Want to see all available models?**
```bash
npm run prisma:verify
```
