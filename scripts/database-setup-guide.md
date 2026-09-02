# TaaS Solutions - Database Setup Guide

## Overview

This guide provides instructions for setting up the PostgreSQL database for the TaaS Solutions platform.

## Prerequisites

- PostgreSQL 15+ installed locally or access to a managed PostgreSQL service
- Node.js 18+ and npm installed
- Git repository cloned locally

## Configuration Status

### ✅ Completed Setup

1. **DATABASE_URL in .env.example** - Configured with PostgreSQL connection string format
2. **Prisma Client Singleton** - `src/lib/db.ts` exports the Prisma client with:
   - Singleton pattern to prevent connection exhaustion
   - Development logging (query, error, warn)
   - Production logging (error only)
   - Connection pooling via Prisma
   - Type exports for all models

3. **Prisma Schema** - `prisma/schema.prisma` includes:
   - All identity and access models (User, Role, Permission)
   - Organisation models (Organisation, OrganisationMember)
   - Audit event model (AuditEvent)
   - NextAuth.js models (Account, Session, VerificationToken)
   - Proper indexes for performance
   - Foreign key relationships with cascade deletes

## Database Setup Instructions

### Option 1: Local PostgreSQL

#### 1. Install PostgreSQL

**Windows:**
```powershell
# Using Chocolatey
choco install postgresql

# Or download from https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE taas_dev;

# Create user (optional, for non-postgres user)
CREATE USER taas_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE taas_dev TO taas_user;

# Exit
\q
```

#### 3. Configure Environment

Create `.env.local` file (this file is gitignored):

```bash
# For postgres superuser
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/taas_dev"

# Or for dedicated user
DATABASE_URL="postgresql://taas_user:your_password@localhost:5432/taas_dev"
```

#### 4. Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Verify database
npx prisma studio
```

### Option 2: Managed PostgreSQL Service

#### Supabase (Recommended for MVP)

1. Create account at https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string (URI mode)
5. Add to `.env.local`:

```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

#### Railway

1. Create account at https://railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy connection string from "Connect" tab
5. Add to `.env.local`

#### Neon

1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Add to `.env.local`

#### Azure Database for PostgreSQL

1. Create Azure account
2. Create Azure Database for PostgreSQL server
3. Get connection string from portal
4. Add to `.env.local`

### Option 3: Docker PostgreSQL (Development)

#### 1. Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: taas_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: taas_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

#### 2. Start Container

```bash
docker-compose up -d
```

#### 3. Configure Environment

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taas_dev"
```

## Testing Database Connection

### Manual Test

```bash
# Test connection using Prisma
npx prisma db push

# Open Prisma Studio (visual database browser)
npx prisma studio
```

### Programmatic Test

Create a test script `scripts/test-db-connection.ts`:

```typescript
import { testDatabaseConnection } from '../src/lib/db';

async function main() {
  console.log('Testing database connection...');
  const success = await testDatabaseConnection();
  process.exit(success ? 0 : 1);
}

main();
```

Run with:
```bash
npx tsx scripts/test-db-connection.ts
```

### Unit Test

The existing test in `src/lib/db.test.ts` verifies:
- Prisma client exports correctly
- `testDatabaseConnection` function exists
- Type exports are available

Run tests:
```bash
npm run test src/lib/db.test.ts
```

## Connection Pooling

Prisma automatically handles connection pooling with sensible defaults:

- **Development**: Pool size adapts to activity
- **Production**: Recommended to set explicit connection limit

For production, configure in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 10
  pool_timeout = 2
}
```

Or via DATABASE_URL query parameters:

```bash
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=10&pool_timeout=2"
```

## Environment-Specific Configuration

### Development (.env.local)
- Local PostgreSQL or Docker
- Verbose logging enabled
- No connection limits

### Staging (.env.staging)
- Managed PostgreSQL service
- Error logging only
- Connection pooling configured
- Separate database from production

### Production (.env.production)
- Managed PostgreSQL service (high availability)
- Error logging only
- Connection pooling and limits
- Automated backups enabled
- SSL/TLS required

## Security Considerations

1. **Never commit .env.local** - Contains actual credentials
2. **Use strong passwords** - Minimum 16 characters, random
3. **Enable SSL/TLS** - For production databases
4. **Restrict network access** - Allow only application IPs
5. **Regular backups** - Automated daily backups minimum
6. **Rotate credentials** - Quarterly in production

## Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

Example with SSL:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

## Troubleshooting

### Connection Refused
- Check PostgreSQL is running: `pg_isready` or `systemctl status postgresql`
- Verify port 5432 is not blocked by firewall
- Check connection string has correct host/port

### Authentication Failed
- Verify username and password are correct
- Check pg_hba.conf allows connections from your IP
- Ensure user has database access: `GRANT ALL ON DATABASE db TO user;`

### SSL/TLS Errors
- Add `?sslmode=require` to connection string
- Or `?sslmode=disable` for local development only

### Too Many Connections
- Reduce connection pool size
- Check for connection leaks (not calling `$disconnect`)
- Increase PostgreSQL `max_connections` setting

### Slow Queries
- Check indexes are created: `npx prisma migrate dev`
- Use `EXPLAIN ANALYZE` on slow queries
- Consider connection pooling via PgBouncer for large scale

## Migrations

### Create Migration
```bash
npx prisma migrate dev --name descriptive_name
```

### Apply Migrations (Production)
```bash
npx prisma migrate deploy
```

### Reset Database (Development Only!)
```bash
npx prisma migrate reset
```

### Check Migration Status
```bash
npx prisma migrate status
```

## Prisma Studio

Visual database browser:

```bash
npx prisma studio
```

Opens browser at http://localhost:5555 with:
- Browse all tables
- Add/edit/delete records
- Visual relationships
- Query playground

## Database Backup

### Local PostgreSQL
```bash
pg_dump -U postgres taas_dev > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
psql -U postgres taas_dev < backup_20260901.sql
```

### Managed Services
- Use provider's automated backup features
- Set retention period (minimum 7 days)
- Test restore procedure quarterly

## Next Steps

Once database is configured:

1. ✅ Run migrations: `npx prisma migrate dev`
2. ✅ Generate Prisma Client: `npx prisma generate`
3. ✅ Test connection: `npx prisma db push`
4. ✅ Seed demo data: `npx prisma db seed` (when seed script created)
5. ✅ Verify in Prisma Studio: `npx prisma studio`

## Support

For issues:
1. Check this guide's troubleshooting section
2. Review Prisma documentation: https://www.prisma.io/docs
3. Check PostgreSQL logs
4. Contact platform administrator

## References

- Prisma Documentation: https://www.prisma.io/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs
- NextAuth.js Database Setup: https://next-auth.js.org/adapters/prisma
- TaaS Solutions Architecture: `docs/architecture/Solution-Architecture.md`
