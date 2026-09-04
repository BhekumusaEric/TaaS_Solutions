# Migration Application Guide

**Task:** TASK-007 - Create Initial Database Migration  
**Status:** Ready for Application (Pending PostgreSQL Installation)  
**Date:** 2026-09-01

---

## Overview

This guide documents the process to apply the Prisma database migration for the TaaS Solutions Platform. The migration creates all required tables, indexes, foreign keys, and constraints as defined in `prisma/schema.prisma`.

---

## Prerequisites

Before applying the migration, ensure:

1. ✅ **PostgreSQL 15+ Installed**
   - Download from: https://www.postgresql.org/download/
   - Windows: Use the installer (includes pgAdmin)
   - MacOS: `brew install postgresql@15`
   - Linux: `sudo apt install postgresql-15`

2. ✅ **PostgreSQL Service Running**
   ```bash
   # Windows: Service starts automatically
   # MacOS: brew services start postgresql@15
   # Linux: sudo systemctl start postgresql
   ```

3. ✅ **Database Created**
   ```bash
   # Create the development database
   createdb taas_dev -U postgres
   ```

4. ✅ **Environment Configured**
   - Copy `.env.example` to `.env.local`
   - Update `DATABASE_URL` with actual credentials:
     ```
     DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/taas_dev"
     ```

5. ✅ **Dependencies Installed**
   ```bash
   npm install
   ```

---

## Migration Generation and Application Process

### Step 1: Verify Schema Validity

Before generating the migration, validate the schema:

```bash
npx prisma validate
```

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

The schema.prisma file is valid. ✓
```

### Step 2: Generate the Initial Migration

Generate the migration without applying it (review first):

```bash
npx prisma migrate dev --create-only --name init
```

**What This Does:**
- Creates a new directory: `prisma/migrations/[timestamp]_init/`
- Generates SQL file: `migration.sql` with all CREATE statements
- Does NOT apply the migration yet
- Allows you to review the SQL before application

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "taas_dev" at "localhost:5432"

Prisma Migrate created the following migration without applying it [timestamp]_init

You can now edit it and apply it by running prisma migrate dev.
```

### Step 3: Review the Generated Migration

**Location:** `prisma/migrations/[timestamp]_init/migration.sql`

**Review Checklist:**

- [ ] All 11 tables defined:
  - `User`
  - `Role`
  - `Permission`
  - `UserRole`
  - `RolePermission`
  - `Organisation`
  - `OrganisationMember`
  - `AuditEvent`
  - `Account` (NextAuth)
  - `Session` (NextAuth)
  - `VerificationToken` (NextAuth)

- [ ] Enum type created:
  - `OrganisationType` (CLIENT, PARTNER)

- [ ] All indexes created:
  - User: email
  - Role: name
  - Permission: name, (resource, action)
  - UserRole: userId, roleId, (userId, roleId)
  - RolePermission: roleId, permissionId, (roleId, permissionId)
  - Organisation: name, type
  - OrganisationMember: userId, organisationId, (userId, organisationId)
  - AuditEvent: userId, action, (resourceType, resourceId), timestamp, organisationId
  - Account: userId, (provider, providerAccountId)
  - Session: userId, sessionToken
  - VerificationToken: token, (identifier, token)

- [ ] All foreign keys defined:
  - UserRole → User, Role
  - RolePermission → Role, Permission
  - OrganisationMember → User, Organisation
  - AuditEvent → User
  - Account → User
  - Session → User

- [ ] Cascade deletes configured:
  - User deletion cascades to UserRole, OrganisationMember, AuditEvent, Account, Session

- [ ] Unique constraints:
  - User.email
  - Role.name
  - Permission.name
  - Organisation.name
  - UserRole(userId, roleId)
  - RolePermission(roleId, permissionId)
  - OrganisationMember(userId, organisationId)
  - Account(provider, providerAccountId)
  - Session.sessionToken
  - VerificationToken.token
  - VerificationToken(identifier, token)

### Step 4: Apply the Migration

Once reviewed and confirmed, apply the migration:

```bash
npx prisma migrate dev
```

**What This Does:**
- Applies any pending migrations
- Generates Prisma Client
- Updates the `_prisma_migrations` table

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "taas_dev" at "localhost:5432"

Applying migration `[timestamp]_init`

The following migration(s) have been applied:

migrations/
  └─ [timestamp]_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v5.x.x) to .\node_modules\@prisma\client in Xms
```

### Step 5: Verify Migration Application

#### 5.1 Check Prisma Migration Status

```bash
npx prisma migrate status
```

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "taas_dev" at "localhost:5432"

Status
1 migration found in prisma/migrations

Database schema is up to date!
```

#### 5.2 Verify Tables Created

Connect to the database and check:

```bash
# Using psql
psql -U postgres -d taas_dev -c "\dt"

# Using Prisma Studio (GUI)
npx prisma studio
```

**Expected Tables:**
```
                 List of relations
 Schema |         Name          | Type  |  Owner
--------+-----------------------+-------+----------
 public | Account               | table | postgres
 public | AuditEvent            | table | postgres
 public | Organisation          | table | postgres
 public | OrganisationMember    | table | postgres
 public | Permission            | table | postgres
 public | Role                  | table | postgres
 public | RolePermission        | table | postgres
 public | Session               | table | postgres
 public | User                  | table | postgres
 public | UserRole              | table | postgres
 public | VerificationToken     | table | postgres
 public | _prisma_migrations    | table | postgres
(12 rows)
```

#### 5.3 Verify Indexes Created

```bash
psql -U postgres -d taas_dev -c "\di"
```

**Should Show:**
- All indexes from the schema
- Minimum 20+ indexes (including primary keys)

#### 5.4 Verify Foreign Keys

```bash
psql -U postgres -d taas_dev -c "
  SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
  ORDER BY tc.table_name;
"
```

**Expected Foreign Keys:**
- UserRole.userId → User.id
- UserRole.roleId → Role.id
- RolePermission.roleId → Role.id
- RolePermission.permissionId → Permission.id
- OrganisationMember.userId → User.id
- OrganisationMember.organisationId → Organisation.id
- AuditEvent.userId → User.id
- Account.userId → User.id
- Session.userId → User.id

#### 5.5 Verify Enum Type

```bash
psql -U postgres -d taas_dev -c "\dT+ OrganisationType"
```

**Expected Output:**
```
                                    List of data types
 Schema |        Name        | Internal name | Size | Elements | Access privileges
--------+--------------------+---------------+------+----------+-------------------
 public | OrganisationType   | enum          | 4    | CLIENT  +|
        |                    |               |      | PARTNER |
```

#### 5.6 Test Database Connection

```bash
npm run db:test
```

**Expected Output:**
```
🔍 Testing database connection...

✅ Database connection successful!
📊 Connection Details:
   - Provider: PostgreSQL
   - Using DATABASE_URL from environment

✅ Database query successful!
📋 PostgreSQL Version: PostgreSQL 15.x on ...

✨ All database connectivity checks passed!
```

---

## Migration Verification Checklist

### Structure Verification

- [ ] Migration file exists at `prisma/migrations/[timestamp]_init/migration.sql`
- [ ] Migration contains 11 CREATE TABLE statements
- [ ] Migration contains 1 CREATE TYPE statement (OrganisationType)
- [ ] Migration contains 20+ CREATE INDEX statements
- [ ] Migration contains 9 ALTER TABLE statements for foreign keys
- [ ] No SQL syntax errors

### Database Verification

- [ ] `npx prisma migrate status` shows "Database schema is up to date"
- [ ] All 11 application tables exist
- [ ] `_prisma_migrations` table exists
- [ ] All indexes created (check with `\di` in psql)
- [ ] All foreign keys established
- [ ] Enum type `OrganisationType` exists
- [ ] Unique constraints enforced
- [ ] Cascade deletes configured

### Functional Verification

- [ ] Can insert into User table
- [ ] Can insert into Role table
- [ ] Can create UserRole relationship
- [ ] Foreign key constraints work (reject invalid IDs)
- [ ] Unique constraints work (reject duplicates)
- [ ] Cascade delete works (delete user removes related records)
- [ ] Enum constraint works (only CLIENT/PARTNER accepted)

---

## Common Issues and Troubleshooting

### Issue 1: "Can't reach database server"

**Error:**
```
Error: P1001: Can't reach database server at `localhost:5432`
```

**Solutions:**
1. Check PostgreSQL is running:
   ```bash
   # Windows: Check Services
   # MacOS: brew services list
   # Linux: sudo systemctl status postgresql
   ```

2. Verify DATABASE_URL is correct in `.env.local`

3. Check firewall allows port 5432

4. Try connecting with psql:
   ```bash
   psql -U postgres -d taas_dev
   ```

### Issue 2: "Database does not exist"

**Error:**
```
Error: P1003: Database `taas_dev` does not exist on the database server
```

**Solution:**
```bash
createdb taas_dev -U postgres
```

### Issue 3: "Authentication failed"

**Error:**
```
Error: P1001: Authentication failed against database server
```

**Solutions:**
1. Check password is correct in DATABASE_URL
2. Check user exists and has permissions
3. Check pg_hba.conf allows local connections

### Issue 4: Migration Fails Partway

**Error:**
```
Error: Migration failed to apply cleanly to the shadow database
```

**Solutions:**
1. Check migration SQL for syntax errors
2. Reset and retry:
   ```bash
   npx prisma migrate reset
   npx prisma migrate dev
   ```
3. Check database permissions

### Issue 5: "Schema drift detected"

**Warning:**
```
Warning: Your database schema is not in sync with your migration history
```

**Solutions:**
1. Review drift:
   ```bash
   npx prisma migrate status
   ```
2. If safe, create a new migration:
   ```bash
   npx prisma migrate dev --name fix_drift
   ```
3. Or reset (WARNING: deletes data):
   ```bash
   npx prisma migrate reset
   ```

---

## Expected Migration SQL Structure

The generated `migration.sql` should follow this structure:

```sql
-- CreateEnum
CREATE TYPE "OrganisationType" AS ENUM ('CLIENT', 'PARTNER');

-- CreateTable (11 tables)
CREATE TABLE "User" (...);
CREATE TABLE "Role" (...);
CREATE TABLE "Permission" (...);
CREATE TABLE "UserRole" (...);
CREATE TABLE "RolePermission" (...);
CREATE TABLE "Organisation" (...);
CREATE TABLE "OrganisationMember" (...);
CREATE TABLE "AuditEvent" (...);
CREATE TABLE "Account" (...);
CREATE TABLE "Session" (...);
CREATE TABLE "VerificationToken" (...);

-- CreateIndex (20+ indexes)
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
-- ... more indexes

-- AddForeignKey (9 foreign keys)
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ... more foreign keys
```

---

## Production Deployment Notes

### For Production Migration:

1. **Backup First**
   ```bash
   pg_dump taas_prod > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Use Deploy Command** (not `migrate dev`)
   ```bash
   npx prisma migrate deploy
   ```

3. **Test on Staging First**
   - Apply migration to staging
   - Verify all tables created
   - Test application functionality
   - Monitor for issues

4. **Monitor Migration**
   - Run during low-traffic window
   - Watch for lock timeouts
   - Check application logs
   - Verify no errors

5. **Rollback Plan**
   - Have backup ready
   - Document rollback steps
   - Test restore procedure

---

## Post-Migration Steps

### 1. Generate Prisma Client

If not auto-generated during migration:

```bash
npx prisma generate
```

### 2. Seed Demo Data (Optional)

```bash
npm run db:seed
```

This will create:
- Demo users for each role (DEMO_TALENT@example.com, etc.)
- Demo organisations (DEMO Client Org, DEMO Partner Org)
- Roles and permissions
- Organisation memberships

### 3. Verify Application Connectivity

Test the application can connect:

```bash
npm run dev
```

Navigate to http://localhost:3000 and verify:
- [ ] Homepage loads
- [ ] Sign-in page accessible
- [ ] No database connection errors in logs

### 4. Run Tests

Verify database integration:

```bash
npm run test
```

Expect all tests to pass if database is properly configured.

---

## Success Criteria (from TASK-007)

### ✅ Completion Criteria:

- [ ] Migration generates without errors (`npx prisma validate`)
- [ ] Migration applies successfully (`npx prisma migrate dev`)
- [ ] All 11 tables exist in database
- [ ] Prisma Client regenerates successfully
- [ ] Can query tables via Prisma (`db.user.findMany()` works)

### ✅ Verification Commands:

```bash
# 1. Validate schema
npx prisma validate

# 2. Check migration status
npx prisma migrate status

# 3. List tables
psql -U postgres -d taas_dev -c "\dt"

# 4. Test connection
npm run db:test

# 5. Open Prisma Studio
npx prisma studio
```

---

## Migration File Details

### Expected Migration Components

When the migration is generated, it will include:

1. **Enum Creation**
   ```sql
   CREATE TYPE "OrganisationType" AS ENUM ('CLIENT', 'PARTNER');
   ```

2. **Table Definitions**
   - 11 application tables
   - All columns with appropriate types
   - Default values (uuid(), now())
   - Nullable/not-nullable constraints

3. **Indexes**
   - Primary key indexes (automatic)
   - Foreign key indexes
   - Query optimization indexes
   - Unique constraint indexes

4. **Foreign Key Constraints**
   - ON DELETE CASCADE where appropriate
   - ON UPDATE CASCADE
   - Referential integrity enforcement

5. **Unique Constraints**
   - Email uniqueness
   - Role name uniqueness
   - Composite unique constraints

---

## Alternative: Using Prisma Studio

For a GUI-based approach to verify the migration:

```bash
npx prisma studio
```

This opens a web interface at http://localhost:5555 where you can:
- Browse all tables
- View data
- Add test records
- Verify relationships
- Check constraints

---

## Next Steps After Successful Migration

1. ✅ **TASK-007 Complete**: Migration applied successfully

2. **Proceed to TASK-008**: Create Database Seed Script
   - Seed script is likely already created
   - Run: `npm run db:seed`
   - Verify demo data created

3. **Continue with Authentication Setup** (TASK-009+)
   - Configure NextAuth.js
   - Test user registration
   - Test sign-in flow

---

## Quick Reference Commands

```bash
# Validate schema
npx prisma validate

# Generate migration (create only, no apply)
npx prisma migrate dev --create-only --name init

# Apply migration
npx prisma migrate dev

# Check migration status
npx prisma migrate status

# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Test connection
npm run db:test

# Seed demo data
npm run db:seed
```

---

## Support and Documentation

### Prisma Documentation
- Migration Guide: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Schema Reference: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- Troubleshooting: https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/troubleshooting-development

### PostgreSQL Documentation
- Installation: https://www.postgresql.org/download/
- Getting Started: https://www.postgresql.org/docs/15/tutorial.html

### Project Documentation
- DATABASE_SETUP.md - Complete PostgreSQL setup guide
- DATABASE_STATUS.md - Current configuration status
- README.md - Project overview and setup

---

## Task Status

**Task:** TASK-007 - Create Initial Database Migration  
**Status:** ⏳ **READY FOR APPLICATION**

**What's Complete:**
- ✅ Schema validated and correct
- ✅ Documentation created
- ✅ Verification procedures defined
- ✅ Troubleshooting guide prepared

**What's Required:**
- ⏳ PostgreSQL installation
- ⏳ Database creation
- ⏳ Environment configuration
- ⏳ Migration generation and application
- ⏳ Verification of successful application

**Estimated Time to Complete:** 15-30 minutes (once PostgreSQL is installed)

---

**Documentation Created by:** Kiro Task Execution Agent  
**Date:** 2026-09-01  
**Last Updated:** 2026-09-01
