#!/bin/bash

# Migration Generation Verification Script
# This script verifies that Prisma can generate migrations from the schema without errors

set -e  # Exit on error

echo "=================================="
echo "Migration Generation Verification"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Prisma is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}✗ npx command not found${NC}"
    echo "Please install Node.js and npm"
    exit 1
fi

echo -e "${GREEN}✓ npx available${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ package.json not found${NC}"
    echo "Please run this script from the project root"
    exit 1
fi

echo -e "${GREEN}✓ package.json found${NC}"

# Check if schema exists
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}✗ prisma/schema.prisma not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ schema.prisma found${NC}"

# Check if dependencies are installed
if [ ! -d "node_modules/prisma" ]; then
    echo -e "${YELLOW}! Prisma not installed${NC}"
    echo "Installing dependencies..."
    npm install
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Validate schema syntax
echo ""
echo "Validating schema syntax..."
if npx prisma validate; then
    echo -e "${GREEN}✓ Schema syntax valid${NC}"
else
    echo -e "${RED}✗ Schema syntax validation failed${NC}"
    exit 1
fi

# Format schema (also validates)
echo ""
echo "Formatting schema..."
if npx prisma format; then
    echo -e "${GREEN}✓ Schema formatted successfully${NC}"
else
    echo -e "${RED}✗ Schema formatting failed${NC}"
    exit 1
fi

# Generate Prisma Client (tests schema parsing)
echo ""
echo "Generating Prisma Client..."
if npx prisma generate; then
    echo -e "${GREEN}✓ Prisma Client generated successfully${NC}"
else
    echo -e "${RED}✗ Prisma Client generation failed${NC}"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo ""
    echo -e "${YELLOW}! DATABASE_URL not set${NC}"
    echo "Migration generation requires a database connection."
    echo ""
    echo "To generate migration, set DATABASE_URL and run:"
    echo "  npx prisma migrate dev --name init --create-only"
    echo ""
    echo -e "${GREEN}✓ Schema validation complete (database not required)${NC}"
    exit 0
fi

echo -e "${GREEN}✓ DATABASE_URL configured${NC}"

# Try to generate migration (create-only, no database changes)
echo ""
echo "Generating initial migration..."
if npx prisma migrate dev --name init --create-only; then
    echo -e "${GREEN}✓ Migration generated successfully${NC}"
    echo ""
    echo "Migration files created in prisma/migrations/"
    ls -la prisma/migrations/
else
    echo -e "${RED}✗ Migration generation failed${NC}"
    exit 1
fi

echo ""
echo "=================================="
echo -e "${GREEN}✓ All verification checks passed${NC}"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Review migration SQL in prisma/migrations/"
echo "2. Apply migration: npx prisma migrate dev"
echo "3. Verify database tables created"
echo ""
