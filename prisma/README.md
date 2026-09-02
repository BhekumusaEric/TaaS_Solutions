# Prisma Database Configuration

This directory contains the Prisma schema and migration files for the TaaS Solutions platform.

## Prerequisites

- PostgreSQL 15+ installed and running
- Node.js and npm installed
- Database credentials configured in `.env.local`

## Initial Setup

### 1. Install PostgreSQL

**Windows:**

```powershell
# Using Chocolatey
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
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

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE taas_dev;

# Create user (optional - for better security)
CREATE USER taas_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE taas_dev TO taas_user;

# Exit psql
\q
```

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and update with your database credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/taas_dev"
NEXTAUTH_SECRET="generated-secret-here"
```

Generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

This creates the Prisma Client based on your schema.

### 5. Run Initial Migration

```bash
npx prisma migrate dev --name init
```

This creates the database tables based on the schema.

### 6. Verify Connection

Run the connection test:

```bash
npm run db:test
```

Or in Node.js:

```typescript
import { testDatabaseConnection } from '@/lib/db';
await testDatabaseConnection();
```

## Common Commands

### Generate Prisma Client

```bash
npx prisma generate
```

### Create Migration

```bash
npx prisma migrate dev --name <migration_name>
```

### Apply Migrations (Production)

```bash
npx prisma migrate deploy
```

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

⚠️ **Warning:** This deletes all data!

### Open Prisma Studio (Database GUI)

```bash
npx prisma studio
```

### Validate Schema

```bash
npx prisma validate
```

### Format Schema

```bash
npx prisma format
```

## Schema Structure

The schema includes:

### Identity & Access

- `User` - User accounts
- `Role` - User roles (Admin, Client, Talent, etc.)
- `Permission` - Granular permissions
- `UserRole` - User-role assignments
- `RolePermission` - Role-permission assignments

### Organisations

- `Organisation` - Client and partner organizations
- `OrganisationMember` - Organisation membership
- `OrganisationType` - Enum: CLIENT, PARTNER

### Audit & Compliance

- `AuditEvent` - Immutable audit log

### Authentication (NextAuth.js)

- `Account` - OAuth provider accounts
- `Session` - User sessions
- `VerificationToken` - Email verification tokens

## Migration Strategy

### Development

1. Make schema changes in `schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Commit both schema and migration files
4. Prisma Client is regenerated automatically

### Staging/Production

1. Pull latest code with migrations
2. Run `npx prisma migrate deploy`
3. Prisma Client should already be generated in build

## Best Practices

### DO

✅ Always use migrations (never manual SQL changes)  
✅ Name migrations descriptively (`add_user_avatar`, not `migration_1`)  
✅ Test migrations in development first  
✅ Commit schema.prisma and migration files together  
✅ Use transactions for multi-step operations  
✅ Add indexes for frequently queried fields

### DON'T

❌ Edit applied migrations  
❌ Delete migration files  
❌ Share database between environments  
❌ Commit `.env.local` files  
❌ Use `prisma db push` in production  
❌ Forget to run `prisma generate` after schema changes

## Troubleshooting

### "Can't reach database server"

- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL is correct
- Check firewall allows port 5432

### "Table already exists" errors

```bash
npx prisma migrate reset  # Development only
```

### "Prisma Client not found"

```bash
npx prisma generate
```

### Migration conflicts

```bash
# Development: reset and re-apply
npx prisma migrate reset

# Production: resolve manually or rollback
```

### Slow queries

- Check indexes with Prisma Studio
- Enable query logging: `log: ['query']` in `db.ts`
- Use `prisma.$queryRaw` for complex queries

## Seeding (Future Task)

Seed data will be added in a future task:

```bash
npx prisma db seed
```

Seed file location: `prisma/seed.ts`

## Environment-Specific Databases

### Development

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/taas_dev"
```

### Test

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/taas_test"
```

### Staging

```env
DATABASE_URL="postgresql://user:pass@staging-host:5432/taas_staging"
```

### Production

```env
DATABASE_URL="postgresql://user:pass@prod-host:5432/taas_prod"
```

## Security Notes

🔒 **Never commit:**

- `.env.local` (contains secrets)
- Database credentials
- Production connection strings

🔒 **Always:**

- Use environment variables for credentials
- Use strong passwords
- Restrict database user permissions
- Enable SSL/TLS for production connections
- Regularly update dependencies

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For TaaS-specific database questions, refer to:

- `.kiro/specs/01-platform-foundation/design.md` (schema design)
- `.kiro/steering/tech.md` (technology decisions)
