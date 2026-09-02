# Database Setup Guide

This guide will help you set up PostgreSQL and initialize the TaaS Solutions database.

## Quick Start

### 1. Install PostgreSQL

Choose one method based on your system:

**Option A: Windows (using installer)**

1. Download from https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember your postgres password
4. Default port: 5432

**Option B: Windows (using Chocolatey)**

```powershell
choco install postgresql
```

**Option C: macOS (using Homebrew)**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Option D: Linux (Ubuntu/Debian)**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

**Windows (PowerShell):**

```powershell
# Set password if needed
$env:PGPASSWORD = "your_postgres_password"

# Create database
psql -U postgres -c "CREATE DATABASE taas_dev;"

# Optional: Create dedicated user
psql -U postgres -c "CREATE USER taas_user WITH PASSWORD 'secure_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE taas_dev TO taas_user;"
```

**macOS/Linux (Bash):**

```bash
# Create database
psql -U postgres -c "CREATE DATABASE taas_dev;"

# Optional: Create dedicated user
psql -U postgres -c "CREATE USER taas_user WITH PASSWORD 'secure_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE taas_dev TO taas_user;"
```

### 3. Configure Environment

1. Copy environment template:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` with your database credentials:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/taas_dev"
```

3. Generate authentication secret:

```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# macOS/Linux
openssl rand -base64 32
```

4. Add the secret to `.env.local`:

```env
NEXTAUTH_SECRET="generated_secret_here"
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create tables
npx prisma migrate dev --name init

# Verify connection
npx prisma studio
```

## Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

**Examples:**

Default PostgreSQL user:

```
postgresql://postgres:password@localhost:5432/taas_dev
```

Dedicated user:

```
postgresql://taas_user:secure_pass@localhost:5432/taas_dev
```

With SSL (production):

```
postgresql://user:pass@host:5432/db?sslmode=require
```

## Verification Checklist

- [ ] PostgreSQL is installed and running
- [ ] `taas_dev` database exists
- [ ] `.env.local` file created with DATABASE_URL
- [ ] NEXTAUTH_SECRET generated and added
- [ ] `npx prisma generate` completed successfully
- [ ] `npx prisma migrate dev` completed successfully
- [ ] Prisma Studio opens (`npx prisma studio`)
- [ ] Tables visible in Prisma Studio

## Troubleshooting

### "psql: command not found"

Add PostgreSQL to PATH:

**Windows:**

```powershell
# Add to PATH (adjust version number)
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"
```

**macOS:**

```bash
echo 'export PATH="/usr/local/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### "Connection refused"

PostgreSQL might not be running:

**Windows:**

```powershell
# Check service
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-15
```

**macOS:**

```bash
brew services start postgresql@15
```

**Linux:**

```bash
sudo systemctl start postgresql
```

### "Role 'postgres' does not exist"

Create the postgres user:

```bash
createuser -s postgres
```

### "Database already exists"

No problem - skip database creation and proceed to migrations.

### Port 5432 in use

Another service is using the PostgreSQL port:

```powershell
# Windows - find process using port 5432
netstat -ano | findstr :5432

# Kill process (replace PID)
taskkill /PID <process_id> /F
```

## Next Steps

Once database is set up:

1. Continue with TASK-005: Create Shared Utility Libraries
2. Seed initial data (future task)
3. Run tests to verify setup

## Production Deployment

For production deployments, use managed PostgreSQL services:

- **Azure**: Azure Database for PostgreSQL
- **AWS**: RDS PostgreSQL
- **Vercel**: Neon, Supabase, or Railway
- **Others**: Heroku Postgres, Digital Ocean Managed Databases

Update `DATABASE_URL` in production environment variables with the provided connection string.

## Resources

- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [Prisma Database Guide](https://www.prisma.io/docs/guides/database)
- [TaaS Platform Docs](../docs/)
