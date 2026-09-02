# Database Setup Guide

## Overview

TaaS Solutions uses **PostgreSQL 15+** as the database and **Prisma ORM** for database access. This guide covers initial setup, connection configuration, and troubleshooting.

---

## Prerequisites

### Required Software

1. **PostgreSQL 15 or higher**
   - Windows: Download from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql@15`
   - Linux: `sudo apt install postgresql-15` (Ubuntu/Debian)

2. **Node.js 18+** (already required for the application)

3. **Database Client** (optional but recommended)
   - pgAdmin: [https://www.pgadmin.org/](https://www.pgadmin.org/)
   - DBeaver: [https://dbeaver.io/](https://dbeaver.io/)
   - Or command-line: `psql`

---

## Quick Start

### 1. Start PostgreSQL Service

**Windows:**
```bash
# PostgreSQL should start automatically after installation
# To start manually: Services → PostgreSQL → Start
```

**macOS:**
```bash
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Start on boot
```

### 2. Create Database

**Using psql:**
```bash
# Connect to PostgreSQL (default user: postgres)
psql -U postgres

# In psql prompt:
CREATE DATABASE taas_dev;
\q
```

**Or using createdb command:**
```bash
createdb taas_dev -U postgres
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and update the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/taas_dev"
```

**Connection String Format:**
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=public
```

**Common Configurations:**

- **Local development:** `postgresql://postgres:password@localhost:5432/taas_dev`
- **Docker:** `postgresql://postgres:password@db:5432/taas_dev`
- **Remote (example):** `postgresql://user:pass@taas-db.example.com:5432/taas_prod?sslmode=require`

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the TypeScript types and Prisma Client based on `prisma/schema.prisma`.

### 5. Run Database Migrations

```bash
npm run prisma:migrate
```

This applies all database migrations and creates the required tables.

### 6. Test Database Connection

```bash
npx tsx scripts/test-db-connection.ts
```

Expected output:
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

### 7. Seed Demo Data (Optional)

For development and testing:

```bash
npm run prisma:seed
```

This creates:
- Demo users for each role
- Demo organisations (CLIENT and PARTNER types)
- Initial roles and permissions
- Organisation memberships

---

## Database Schema Overview

### Core Tables

| Table                | Purpose                                    |
|----------------------|--------------------------------------------|
| `User`               | User accounts and credentials              |
| `Role`               | System roles (e.g., VERIFIED_TALENT)       |
| `Permission`         | Granular permissions (e.g., user:create)   |
| `UserRole`           | User-to-role assignments                   |
| `RolePermission`     | Role-to-permission grants                  |
| `Organisation`       | Client and partner organisations           |
| `OrganisationMember` | User-to-organisation memberships           |
| `AuditEvent`         | Immutable audit trail for compliance       |
| `Account`            | NextAuth.js OAuth provider accounts        |
| `Session`            | NextAuth.js session management             |
| `VerificationToken`  | NextAuth.js password reset tokens          |

### Entity Relationships

```
User
├─ has many → UserRole → Role
├─ has many → OrganisationMember → Organisation
├─ has many → AuditEvent (actions performed)
└─ has many → Account (OAuth providers)

Organisation
└─ has many → OrganisationMember → User

Role
└─ has many → RolePermission → Permission
```

---

## Available NPM Scripts

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create a new migration
npm run prisma:migrate:dev

# Apply migrations (production)
npm run prisma:migrate

# Reset database (WARNING: Deletes all data)
npm run prisma:reset

# Open Prisma Studio (GUI for data browsing)
npm run prisma:studio

# Seed database with demo data
npm run prisma:seed
```

---

## Configuration Details

### Environment Variables

| Variable              | Purpose                          | Required | Example                                  |
|-----------------------|----------------------------------|----------|------------------------------------------|
| `DATABASE_URL`        | PostgreSQL connection string     | Yes      | `postgresql://user:pass@host:5432/db`    |
| `NEXTAUTH_URL`        | Application base URL             | Yes      | `http://localhost:3000`                  |
| `NEXTAUTH_SECRET`     | NextAuth.js session secret       | Yes      | `openssl rand -base64 32`                |

### Connection Pool Configuration

The Prisma Client is configured with sensible defaults:

```typescript
// src/lib/db.ts
new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']  // Verbose in dev
    : ['error'],                   // Errors only in prod
});
```

For custom connection pool settings, add to `DATABASE_URL`:

```
postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
```

---

## Troubleshooting

### Issue: "Connection refused" or "ECONNREFUSED"

**Cause:** PostgreSQL is not running or wrong host/port.

**Solutions:**
1. Check PostgreSQL is running: `pg_isready -h localhost -p 5432`
2. Verify port (default: 5432): `SHOW port;` in psql
3. Check firewall allows port 5432
4. Verify host in DATABASE_URL (usually `localhost` for local dev)

---

### Issue: "password authentication failed for user"

**Cause:** Incorrect username or password.

**Solutions:**
1. Verify username in DATABASE_URL matches PostgreSQL user
2. Reset password:
   ```sql
   ALTER USER postgres WITH PASSWORD 'new_password';
   ```
3. Check `pg_hba.conf` authentication method (should be `md5` or `scram-sha-256`)

---

### Issue: "database does not exist"

**Cause:** Database not created yet.

**Solution:**
```bash
createdb taas_dev -U postgres
```

Or in psql:
```sql
CREATE DATABASE taas_dev;
```

---

### Issue: "Prisma schema not found"

**Cause:** Running Prisma commands from wrong directory.

**Solution:**
Always run from project root where `prisma/schema.prisma` exists.

---

### Issue: "Migration failed" or "P3009: migrate found failed migration"

**Cause:** Previous migration failed or was interrupted.

**Solution:**
```bash
# Mark migration as rolled back
npm run prisma:migrate resolve -- --rolled-back "MIGRATION_NAME"

# Or reset (WARNING: deletes all data)
npm run prisma:reset
```

---

### Issue: "Prisma Client not generated"

**Cause:** Prisma Client needs regeneration after schema changes.

**Solution:**
```bash
npm run prisma:generate
```

---

### Issue: Connection works but queries are slow

**Possible causes:**
1. Missing database indexes
2. Large dataset without pagination
3. N+1 query problems

**Solutions:**
1. Check indexes in `schema.prisma` (already defined for core tables)
2. Use `select` to fetch only needed fields
3. Use `include` carefully (eager loading)
4. Enable query logging: `log: ['query']` in db.ts

---

### Issue: "Too many clients already"

**Cause:** Connection pool exhausted.

**Solutions:**
1. Ensure `db.$disconnect()` is called when done
2. Use the singleton pattern (already implemented in `src/lib/db.ts`)
3. Increase connection limit: `?connection_limit=20` in DATABASE_URL

---

## Security Best Practices

### ✅ DO

- Use environment variables for credentials (never commit to git)
- Use strong, unique passwords for database users
- Enable SSL/TLS for remote connections (`?sslmode=require`)
- Restrict database user permissions (principle of least privilege)
- Keep PostgreSQL updated with security patches
- Back up database regularly
- Use parameterized queries (Prisma handles this automatically)

### ❌ DON'T

- Commit `.env.local` or any file with real credentials
- Use default passwords (e.g., `postgres:postgres`)
- Expose database ports to the internet without firewall
- Use root/superuser credentials in application
- Store sensitive data unencrypted (use `@db.VarChar` with encryption layer if needed)

---

## Production Deployment

### Managed Database Providers

For production, use a managed PostgreSQL service:

1. **Supabase** (Recommended for MVP)
   - Includes authentication, storage, and database
   - Free tier available
   - Automatic backups

2. **Neon**
   - Serverless PostgreSQL
   - Generous free tier
   - Instant branching for dev/staging

3. **Railway**
   - Simple deployment
   - Includes database and hosting
   - Pay-as-you-go pricing

4. **Azure Database for PostgreSQL**
   - Enterprise-grade
   - High availability options
   - Integrated with Azure ecosystem

### Migration Strategy

1. **Never modify applied migrations** - create new ones instead
2. **Test migrations on staging** before production
3. **Backup before migration** (automated by managed providers)
4. **Use migration locking** to prevent concurrent migrations
5. **Monitor migration duration** and plan maintenance windows

### Connection in Production

Production `DATABASE_URL` should include:
- SSL mode: `?sslmode=require`
- Connection pooling (if using serverless): Consider PgBouncer
- Shorter timeout: `?connect_timeout=10`

Example:
```
postgresql://user:pass@prod-db.example.com:5432/taas_prod?sslmode=require&connect_timeout=10&pool_timeout=15
```

---

## Useful SQL Queries

### Check active connections
```sql
SELECT count(*) FROM pg_stat_activity 
WHERE datname = 'taas_dev';
```

### See table sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### View all users
```sql
SELECT * FROM "User" LIMIT 10;
```

### Count records by table
```sql
SELECT 
  'User' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Organisation', COUNT(*) FROM "Organisation"
UNION ALL
SELECT 'AuditEvent', COUNT(*) FROM "AuditEvent";
```

---

## Prisma Studio

Visual database browser:

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555` with GUI for:
- Browsing all tables
- Creating/editing/deleting records
- Running queries
- Viewing relationships

**Warning:** Be careful in production - changes are immediate!

---

## Resources

- **Prisma Docs:** [https://www.prisma.io/docs](https://www.prisma.io/docs)
- **PostgreSQL Docs:** [https://www.postgresql.org/docs/15/](https://www.postgresql.org/docs/15/)
- **NextAuth.js + Prisma:** [https://next-auth.js.org/adapters/prisma](https://next-auth.js.org/adapters/prisma)
- **Database Security:** [https://www.prisma.io/docs/guides/database/production-best-practices](https://www.prisma.io/docs/guides/database/production-best-practices)

---

## Support

If you encounter issues not covered here:

1. Check Prisma logs: Enable `log: ['query', 'error', 'warn']` in `src/lib/db.ts`
2. Check PostgreSQL logs: Location varies by OS (usually in data directory)
3. Test connection: `npx tsx scripts/test-db-connection.ts`
4. Verify schema: `npm run prisma:validate`

---

**Last Updated:** 2026-09-01  
**Schema Version:** See `prisma/schema.prisma`
