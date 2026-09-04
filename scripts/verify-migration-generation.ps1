# Migration Generation Verification Script (PowerShell)
# This script verifies that Prisma can generate migrations from the schema without errors

$ErrorActionPreference = "Stop"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Migration Generation Verification" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if npx is available
try {
    $null = Get-Command npx -ErrorAction Stop
    Write-Host "✓ npx available" -ForegroundColor Green
} catch {
    Write-Host "✗ npx command not found" -ForegroundColor Red
    Write-Host "Please install Node.js and npm"
    exit 1
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "✗ package.json not found" -ForegroundColor Red
    Write-Host "Please run this script from the project root"
    exit 1
}
Write-Host "✓ package.json found" -ForegroundColor Green

# Check if schema exists
if (-not (Test-Path "prisma/schema.prisma")) {
    Write-Host "✗ prisma/schema.prisma not found" -ForegroundColor Red
    exit 1
}
Write-Host "✓ schema.prisma found" -ForegroundColor Green

# Check if dependencies are installed
if (-not (Test-Path "node_modules/prisma")) {
    Write-Host "! Prisma not installed" -ForegroundColor Yellow
    Write-Host "Installing dependencies..."
    npm install
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Validate schema syntax
Write-Host ""
Write-Host "Validating schema syntax..."
try {
    npx prisma validate
    Write-Host "✓ Schema syntax valid" -ForegroundColor Green
} catch {
    Write-Host "✗ Schema syntax validation failed" -ForegroundColor Red
    exit 1
}

# Format schema (also validates)
Write-Host ""
Write-Host "Formatting schema..."
try {
    npx prisma format
    Write-Host "✓ Schema formatted successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Schema formatting failed" -ForegroundColor Red
    exit 1
}

# Generate Prisma Client (tests schema parsing)
Write-Host ""
Write-Host "Generating Prisma Client..."
try {
    npx prisma generate
    Write-Host "✓ Prisma Client generated successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Prisma Client generation failed" -ForegroundColor Red
    exit 1
}

# Check if DATABASE_URL is set
$databaseUrl = $env:DATABASE_URL
if ([string]::IsNullOrEmpty($databaseUrl)) {
    Write-Host ""
    Write-Host "! DATABASE_URL not set" -ForegroundColor Yellow
    Write-Host "Migration generation requires a database connection."
    Write-Host ""
    Write-Host "To generate migration, set DATABASE_URL and run:"
    Write-Host "  npx prisma migrate dev --name init --create-only"
    Write-Host ""
    Write-Host "✓ Schema validation complete (database not required)" -ForegroundColor Green
    exit 0
}
Write-Host "✓ DATABASE_URL configured" -ForegroundColor Green

# Try to generate migration (create-only, no database changes)
Write-Host ""
Write-Host "Generating initial migration..."
try {
    npx prisma migrate dev --name init --create-only
    Write-Host "✓ Migration generated successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "Migration files created in prisma/migrations/"
    Get-ChildItem prisma/migrations/ -Recurse
} catch {
    Write-Host "✗ Migration generation failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✓ All verification checks passed" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Review migration SQL in prisma/migrations/"
Write-Host "2. Apply migration: npx prisma migrate dev"
Write-Host "3. Verify database tables created"
Write-Host ""
