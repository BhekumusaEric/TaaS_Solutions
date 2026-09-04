# Seed Script Idempotency Documentation

## Overview

The TaaS Solutions seed script (`prisma/seed.ts`) is **idempotent**, meaning it can be run multiple times safely without creating duplicate data or causing errors. This is a critical feature for:

- Development environments (reset data without errors)
- Testing environments (consistent test data)
- CI/CD pipelines (automated setup)
- Collaborative development (team members syncing data)

## How Idempotency Works

### 1. Upsert Operations

The seed script uses Prisma's `upsert` operation throughout instead of `create`. Upsert combines "update or insert":

```typescript
// Instead of create (which fails on duplicate):
await prisma.user.create({ data: { email: 'user@example.com', ... } });

// We use upsert (which updates if exists, creates if not):
await prisma.user.upsert({
  where: { email: 'user@example.com' },  // Find by unique field
  update: { name: 'Updated Name' },       // Update if found
  create: { email: 'user@example.com', name: 'New User', ... }  // Create if not found
});
```

### 2. Unique Constraints in Schema

The database schema enforces uniqueness at the database level:

```prisma
model User {
  email String @unique  // Prevents duplicate emails
}

model Role {
  name String @unique   // Prevents duplicate role names
}

model Permission {
  name String @unique   // Prevents duplicate permission names
}

model Organisation {
  name String @unique   // Prevents duplicate organisation names
}
```

### 3. Composite Unique Constraints

For junction tables (many-to-many relationships), composite unique constraints prevent duplicate associations:

```prisma
model UserRole {
  userId String
  roleId String
  
  @@unique([userId, roleId])  // Same user cannot have same role twice
}

model RolePermission {
  roleId       String
  permissionId String
  
  @@unique([roleId, permissionId])  // Same role cannot have same permission twice
}

model OrganisationMember {
  userId         String
  organisationId String
  
  @@unique([userId, organisationId])  // Same user cannot be in same org twice
}
```

### 4. Upsert Strategy Per Entity Type

#### Permissions
```typescript
await prisma.permission.upsert({
  where: { name: perm.name },  // Match by unique name
  update: {},                   // No updates needed (permissions are static)
  create: perm,                 // Create if doesn't exist
});
```

#### Roles
```typescript
await prisma.role.upsert({
  where: { name: role.name },
  update: { description: role.description },  // Update description if changed
  create: role,
});
```

#### Users
```typescript
await prisma.user.upsert({
  where: { email: userData.email },
  update: { password: userData.password, name: userData.name },  // Update password/name
  create: userData,
});
```

#### Organisations
```typescript
await prisma.organisation.upsert({
  where: { name: org.name },
  update: { description: org.description },  // Update description
  create: org,
});
```

#### Associations (UserRole, RolePermission, OrganisationMember)
```typescript
await prisma.userRole.upsert({
  where: {
    userId_roleId: { userId, roleId }  // Composite unique constraint
  },
  update: {},  // No updates needed
  create: { userId, roleId },
});
```

## Testing Idempotency

The seed script includes comprehensive tests (`prisma/seed.test.ts`) that verify:

### 1. First Run Success
- Script executes without errors
- All expected data created
- Correct counts for each entity type

### 2. Multiple Run Success
- Second run doesn't create duplicates
- Third run doesn't create duplicates
- Entity counts remain stable

### 3. Unique Constraint Enforcement
- Attempting to create duplicates fails
- Tests verify each unique constraint works
- Ensures database-level protection

### 4. Data Integrity
- Relationships maintained correctly
- No orphaned records
- Foreign keys respected

## Running the Tests

```bash
# Run all seed idempotency tests
npm run test prisma/seed.test.ts

# Run seed script manually
npm run db:seed

# Run seed script multiple times (safe!)
npm run db:seed && npm run db:seed && npm run db:seed
```

## What Gets Updated vs Created

### Always Created (Never Updated)
- **Permissions**: Static list, no updates
- **Associations**: UserRole, RolePermission, OrganisationMember (no fields to update)

### Can Be Updated
- **Roles**: Description field can be updated
- **Users**: Name and password can be updated
- **Organisations**: Description field can be updated

This design allows:
- Role descriptions to evolve without recreating roles
- Demo user passwords to be reset
- Organisation descriptions to be refined

## Production Safety

The seed script **will not run in production**:

```typescript
if (process.env.NODE_ENV === 'production') {
  console.error('❌ ERROR: Cannot seed database in production environment');
  process.exit(1);
}
```

This prevents:
- Accidental demo data in production
- Overwriting production data
- Security vulnerabilities from known demo passwords

## Common Use Cases

### 1. Reset Development Data
```bash
# Drop database, recreate, and seed (development only)
npx prisma migrate reset

# Or just reseed without dropping
npm run db:seed
```

### 2. Update Demo User Passwords
```bash
# Edit DEMO_PASSWORD in seed.ts
# Run seed script to update passwords
npm run db:seed
```

### 3. Add New Permissions
```typescript
// Edit permissionData array in seed.ts
const permissionData = [
  // Existing permissions...
  { name: 'newresource:action', resource: 'newresource', action: 'action' },
];

// Run seed script - new permission added, existing ones unchanged
npm run db:seed
```

### 4. Update Role Descriptions
```typescript
// Edit roleData in seed.ts
const roleData = [
  {
    name: 'PLATFORM_ADMIN',
    description: 'Updated description',  // Changed
  },
  // ...
];

// Run seed script - descriptions updated
npm run db:seed
```

## Troubleshooting

### "Unique constraint failed" Error

If you see this error, it means:
1. You're using `create` instead of `upsert` somewhere
2. Unique constraint missing in schema
3. Database state inconsistent with schema

**Solution**: Ensure all create operations use upsert:
```typescript
// ❌ Wrong
await prisma.user.create({ data: { ... } });

// ✅ Right
await prisma.user.upsert({
  where: { email: userData.email },
  update: { ... },
  create: { ... }
});
```

### Script Runs But Creates Duplicates

This shouldn't happen if using upsert correctly. If it does:

1. Check unique constraints exist in schema:
   ```bash
   npx prisma format
   npx prisma validate
   ```

2. Verify migrations applied:
   ```bash
   npx prisma migrate status
   npx prisma migrate deploy
   ```

3. Check upsert `where` clause matches unique field:
   ```typescript
   // Must match @@unique or @unique in schema
   where: { userId_roleId: { userId, roleId } }
   ```

### Production Check Failing

If you need to run seed in a non-production environment that has `NODE_ENV=production`:

1. **Don't do this in actual production!**
2. Temporarily override for legitimate staging:
   ```bash
   NODE_ENV=staging npm run db:seed
   ```

## Best Practices

### 1. Always Use Upsert for Seeding
```typescript
// Do this
const entity = await prisma.model.upsert({
  where: { uniqueField: value },
  update: { /* updatable fields */ },
  create: { /* all fields */ }
});

// Not this
const entity = await prisma.model.create({ data: { ... } });
```

### 2. Match Upsert Where Clause to Unique Constraints
```typescript
// Schema has @unique on email
model User {
  email String @unique
}

// Upsert must use email in where clause
await prisma.user.upsert({
  where: { email: userData.email },  // ✅ Matches @unique
  // where: { id: userData.id },     // ❌ Won't work for new records
  update: { ... },
  create: { ... }
});
```

### 3. Use Composite Keys for Junction Tables
```typescript
// Schema has composite unique
@@unique([userId, roleId])

// Upsert must use composite key
where: {
  userId_roleId: { userId, roleId }  // ✅ Correct
}
// Not: where: { userId: userId }    // ❌ Incomplete
```

### 4. Test Idempotency
After modifying seed script:
```bash
# Run tests
npm run test prisma/seed.test.ts

# Manual verification
npm run db:seed  # First run
npm run db:seed  # Second run - should be identical
```

### 5. Document What Gets Updated
When adding new entities, document whether fields get updated on subsequent runs:
```typescript
/**
 * Seed example entities
 * 
 * Idempotency:
 * - Creates if doesn't exist
 * - Updates description field if exists
 * - Name field is immutable (used in where clause)
 */
async function seedExamples() {
  // ...
}
```

## Migration Strategy

When migrating to a new environment:

1. **Apply migrations first**:
   ```bash
   npx prisma migrate deploy
   ```

2. **Then run seed**:
   ```bash
   npm run db:seed
   ```

3. **Verify idempotency**:
   ```bash
   npm run db:seed  # Second run should be no-op
   ```

## Summary

The seed script achieves idempotency through:

✅ **Upsert operations** instead of create  
✅ **Unique constraints** in database schema  
✅ **Composite unique keys** for junction tables  
✅ **Comprehensive testing** of multiple runs  
✅ **Production safety** checks  
✅ **Clear documentation** of behavior  

This design ensures:
- Safe to run multiple times
- No duplicate data created
- Development environment consistency
- Test environment reliability
- Team collaboration simplicity

## References

- **Seed Script**: `prisma/seed.ts`
- **Test Suite**: `prisma/seed.test.ts`
- **Schema**: `prisma/schema.prisma`
- **Prisma Upsert Docs**: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#upsert
