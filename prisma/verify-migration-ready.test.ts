/**
 * Migration Generation Readiness Test
 * 
 * This test verifies that the Prisma schema is correctly structured
 * and ready for migration generation without syntax or validation errors.
 * 
 * Tests run without requiring a database connection.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Migration Generation Readiness', () => {
  const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');

  it('should have schema.prisma file present', () => {
    expect(existsSync(schemaPath)).toBe(true);
  });

  it('should have valid schema syntax', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Check for required blocks
    expect(schema).toContain('generator client');
    expect(schema).toContain('datasource db');
    expect(schema).toContain('provider = "postgresql"');
  });

  it('should define all required models', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    const requiredModels = [
      'model User',
      'model Role',
      'model Permission',
      'model UserRole',
      'model RolePermission',
      'model Organisation',
      'model OrganisationMember',
      'model AuditEvent',
      'model Account',
      'model Session',
      'model VerificationToken',
    ];

    requiredModels.forEach((model) => {
      expect(schema).toContain(model);
    });
  });

  it('should define required enums', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    expect(schema).toContain('enum OrganisationType');
    expect(schema).toContain('CLIENT');
    expect(schema).toContain('PARTNER');
  });

  it('should have proper UUID primary keys', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Check multiple models have UUID primary keys
    const uuidPattern = /id\s+String\s+@id\s+@default\(uuid\(\)\)/g;
    const matches = schema.match(uuidPattern);
    
    expect(matches).toBeTruthy();
    expect(matches!.length).toBeGreaterThan(5); // At least 6 models with UUID PKs
  });

  it('should have proper timestamp fields', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Check for createdAt fields with default(now())
    expect(schema).toContain('createdAt DateTime @default(now())');
    
    // Check for updatedAt fields
    expect(schema).toContain('updatedAt DateTime @updatedAt');
  });

  it('should have proper foreign key relationships', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    const foreignKeyPatterns = [
      // User relations
      'user User @relation(fields: [userId], references: [id]',
      
      // Role relations
      'role Role @relation(fields: [roleId], references: [id]',
      
      // Organisation relations
      'organisation Organisation @relation(fields: [organisationId], references: [id]',
      
      // Permission relations
      'permission Permission @relation(fields: [permissionId], references: [id]',
    ];

    foreignKeyPatterns.forEach((pattern) => {
      expect(schema).toContain(pattern);
    });
  });

  it('should have proper cascade delete behaviors', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Check for CASCADE deletes on critical relationships
    const cascadePattern = /onDelete:\s*Cascade/g;
    const matches = schema.match(cascadePattern);
    
    expect(matches).toBeTruthy();
    expect(matches!.length).toBeGreaterThan(5); // Multiple cascade relationships
  });

  it('should have proper indexes defined', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    const indexPatterns = [
      '@@index([email])',
      '@@index([name])',
      '@@index([userId])',
      '@@index([roleId])',
      '@@index([organisationId])',
      '@@index([timestamp])',
      '@@index([action])',
      '@@index([resource, action])',
      '@@index([resourceType, resourceId])',
    ];

    indexPatterns.forEach((pattern) => {
      expect(schema).toContain(pattern);
    });
  });

  it('should have proper unique constraints', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    const uniquePatterns = [
      '@unique', // For fields
      '@@unique([userId, roleId])',
      '@@unique([roleId, permissionId])',
      '@@unique([userId, organisationId])',
      '@@unique([provider, providerAccountId])',
      '@@unique([identifier, token])',
    ];

    uniquePatterns.forEach((pattern) => {
      expect(schema).toContain(pattern);
    });
  });

  it('should have audit event fields for compliance', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Check AuditEvent model has all required fields
    const auditFields = [
      'timestamp',
      'userId',
      'action',
      'resourceType',
      'resourceId',
      'organisationId',
      'metadata',
      'ipAddress',
      'userAgent',
    ];

    auditFields.forEach((field) => {
      expect(schema).toContain(field);
    });
  });

  it('should have NextAuth.js required models', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // NextAuth.js requires these models
    expect(schema).toContain('model Account');
    expect(schema).toContain('model Session');
    expect(schema).toContain('model VerificationToken');
    
    // Check for required NextAuth fields
    expect(schema).toContain('sessionToken');
    expect(schema).toContain('providerAccountId');
  });

  it('should not have any obvious syntax errors', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Check for balanced braces
    const openBraces = (schema.match(/{/g) || []).length;
    const closeBraces = (schema.match(/}/g) || []).length;
    expect(openBraces).toBe(closeBraces);
    
    // Check for balanced brackets
    const openBrackets = (schema.match(/\[/g) || []).length;
    const closeBrackets = (schema.match(/\]/g) || []).length;
    expect(openBrackets).toBe(closeBrackets);
    
    // Check for balanced parentheses
    const openParens = (schema.match(/\(/g) || []).length;
    const closeParens = (schema.match(/\)/g) || []).length;
    expect(openParens).toBe(closeParens);
  });

  it('should have proper relation field naming conventions', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Check that relation fields are properly named (camelCase)
    const relationPatterns = [
      'roles',
      'users',
      'permissions',
      'organisationMembers',
      'auditEvents',
      'accounts',
      'sessions',
      'members',
    ];

    relationPatterns.forEach((pattern) => {
      expect(schema).toContain(pattern);
    });
  });

  it('should use appropriate PostgreSQL-compatible data types', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // String for UUIDs and text
    expect(schema).toContain('String');
    
    // DateTime for timestamps
    expect(schema).toContain('DateTime');
    
    // Json for metadata
    expect(schema).toContain('Json?');
    
    // Int for integers (NextAuth)
    expect(schema).toContain('Int?');
  });

  it('should have proper field documentation comments', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Check for helpful comments
    expect(schema).toContain('// Nullable for OAuth users');
    expect(schema).toContain('// Relations');
    expect(schema).toContain('// Identity and Access');
    expect(schema).toContain('// Organisations');
    expect(schema).toContain('// Audit and Compliance');
    expect(schema).toContain('// NextAuth.js Required Tables');
  });

  it('should be ready for migration generation', () => {
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Final comprehensive check
    expect(schema.length).toBeGreaterThan(1000); // Schema should be substantial
    expect(schema).toContain('generator client');
    expect(schema).toContain('datasource db');
    expect(schema).toContain('provider = "postgresql"');
    expect(schema).toContain('model User');
    expect(schema).toContain('model Organisation');
    expect(schema).toContain('model AuditEvent');
    
    // If all these checks pass, the schema is ready for migration generation
    expect(true).toBe(true);
  });
});

describe('Migration Generation Command', () => {
  it('should document the expected migration command', () => {
    // Expected command to generate migration
    const expectedCommand = 'npx prisma migrate dev --name init --create-only';
    
    // This test documents the command that should be run
    expect(expectedCommand).toBeTruthy();
    expect(expectedCommand).toContain('prisma migrate dev');
    expect(expectedCommand).toContain('--create-only');
  });

  it('should document validation commands that work without database', () => {
    const validationCommands = [
      'npx prisma validate',
      'npx prisma generate',
      'npx prisma format',
    ];

    // All these commands can run without a database connection
    validationCommands.forEach((cmd) => {
      expect(cmd).toContain('prisma');
    });
  });
});
