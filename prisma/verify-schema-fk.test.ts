/**
 * Foreign Key Schema Verification Test
 * 
 * This test verifies that all foreign key constraints in the Prisma schema
 * are correctly defined with appropriate onDelete behavior by parsing the schema file.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Foreign Key Constraints Verification', () => {
  const schemaPath = join(__dirname, 'schema.prisma');
  const schemaContent = readFileSync(schemaPath, 'utf-8');

  /**
   * Helper function to extract foreign key relations from schema
   */
  function extractRelation(modelName: string, fieldName: string): {
    found: boolean;
    onDelete?: string;
    referencesTable?: string;
    referencesField?: string;
  } {
    // Find the model definition
    const modelRegex = new RegExp(`model\\s+${modelName}\\s*{[^}]+}`, 's');
    const modelMatch = schemaContent.match(modelRegex);
    
    if (!modelMatch) {
      return { found: false };
    }

    const modelContent = modelMatch[0];
    
    // Find the field definition with @relation
    const fieldRegex = new RegExp(
      `${fieldName}\\s+\\w+\\s+@relation\\([^)]+\\)`,
      's'
    );
    const fieldMatch = modelContent.match(fieldRegex);
    
    if (!fieldMatch) {
      return { found: false };
    }

    const relationContent = fieldMatch[0];
    
    // Extract onDelete behavior
    const onDeleteMatch = relationContent.match(/onDelete:\s*(\w+)/);
    const onDelete = onDeleteMatch ? onDeleteMatch[1] : undefined;
    
    // Extract references
    const referencesMatch = relationContent.match(/references:\s*\[(\w+)\]/);
    const referencesField = referencesMatch ? referencesMatch[1] : undefined;
    
    // Extract fields to determine referenced table
    const fieldsMatch = relationContent.match(/fields:\s*\[(\w+)\]/);
    const fieldNameInRelation = fieldsMatch ? fieldsMatch[1] : undefined;
    
    // Find the referenced model from the field type
    const fieldTypeRegex = new RegExp(`${fieldName}\\s+(\\w+)\\s+@relation`);
    const fieldTypeMatch = modelContent.match(fieldTypeRegex);
    const referencesTable = fieldTypeMatch ? fieldTypeMatch[1] : undefined;

    return {
      found: true,
      onDelete,
      referencesTable,
      referencesField,
    };
  }

  describe('UserRole Foreign Keys', () => {
    it('should have CASCADE onDelete for User relationship', () => {
      const relation = extractRelation('UserRole', 'user');
      
      expect(relation.found).toBe(true);
      expect(relation.referencesTable).toBe('User');
      expect(relation.onDelete).toBe('Cascade');
    });

    it('should have CASCADE onDelete for Role relationship', () => {
      const relation = extractRelation('UserRole', 'role');
      
      expect(relation.found).toBe(true);
      expect(relation.referencesTable).toBe('Role');
      expect(relation.onDelete).toBe('Cascade');
    });
  });

  describe('RolePermission Foreign Keys', () => {
    it('should have CASCADE onDelete for Role relationship', () => {
      const relation = extractRelation('RolePermission', 'role');
      
      expect(relation.found).toBe(true);
      expect(relation.referencesTable).toBe('Role');
      expect(relation.onDelete).toBe('Cascade');
    });

    it('should have CASCADE onDelete for Permission relationship', () => {
      const relation = extractRelation('RolePermission', 'permission');
      
      expect(relation.found).toBe(true);
      expect(relation.referencesTable).toBe('Permission');
      expect(relation.onDelete).toBe('Cascade');
    });
  });

  describe('OrganisationMember Foreign Keys', () => {
    it('should have CASCADE onDelete for User relationship', () => {
      const relation = extractRelation('OrganisationMember', 'user');
      
      expect(relation.found).toBe(true);
      expect(relation.referencesTable).toBe('User');
      expect(relation.onDelete).toBe('Cascade');
    });

    it('should have CASCADE onDelete for Organisation relationship', () => {
      const relation = extractRelation('OrganisationMember', 'organisation');
      
      expect(relation.found).toBe(true);
      expect(relation.referencesTable).toBe('Organisation');
      expect(relation.onDelete).toBe('Cascade');
    });
  });

  describe('AuditEvent Foreign Keys', () => {
    it('should have CASCADE onDelete for User relationship', () => {
      const relation = extractRelation('AuditEvent', 'user');
      
      expect(relation.found).toBe(true);
      expect(relation.referencesTable).toBe('User');
      expect(relation.onDelete).toBe('Cascade');
    });
  });

  describe('Account Foreign Keys (NextAuth)', () => {
    it('should have CASCADE onDelete for User relationship', () => {
      const relation = extractRelation('Account', 'user');
      
      expect(relation.found).toBe(true);
      expect(relation.referencesTable).toBe('User');
      expect(relation.onDelete).toBe('Cascade');
    });
  });

  describe('Session Foreign Keys (NextAuth)', () => {
    it('should have CASCADE onDelete for User relationship', () => {
      const relation = extractRelation('Session', 'user');
      
      expect(relation.found).toBe(true);
      expect(relation.referencesTable).toBe('User');
      expect(relation.onDelete).toBe('Cascade');
    });
  });

  describe('Schema Completeness', () => {
    it('should define all required foreign key relationships', () => {
      const requiredRelationships = [
        { model: 'UserRole', field: 'user', referencesTable: 'User' },
        { model: 'UserRole', field: 'role', referencesTable: 'Role' },
        { model: 'RolePermission', field: 'role', referencesTable: 'Role' },
        { model: 'RolePermission', field: 'permission', referencesTable: 'Permission' },
        { model: 'OrganisationMember', field: 'user', referencesTable: 'User' },
        { model: 'OrganisationMember', field: 'organisation', referencesTable: 'Organisation' },
        { model: 'AuditEvent', field: 'user', referencesTable: 'User' },
        { model: 'Account', field: 'user', referencesTable: 'User' },
        { model: 'Session', field: 'user', referencesTable: 'User' },
      ];

      for (const rel of requiredRelationships) {
        const relation = extractRelation(rel.model, rel.field);
        
        expect(relation.found, 
          `${rel.model}.${rel.field} → ${rel.referencesTable} relationship should exist`
        ).toBe(true);
        
        expect(relation.referencesTable, 
          `${rel.model}.${rel.field} should reference ${rel.referencesTable}`
        ).toBe(rel.referencesTable);
      }
    });

    it('should use Cascade onDelete for all specified relationships', () => {
      const cascadeRelationships = [
        { model: 'UserRole', field: 'user' },
        { model: 'UserRole', field: 'role' },
        { model: 'RolePermission', field: 'role' },
        { model: 'RolePermission', field: 'permission' },
        { model: 'OrganisationMember', field: 'user' },
        { model: 'OrganisationMember', field: 'organisation' },
        { model: 'AuditEvent', field: 'user' },
        { model: 'Account', field: 'user' },
        { model: 'Session', field: 'user' },
      ];

      for (const rel of cascadeRelationships) {
        const relation = extractRelation(rel.model, rel.field);
        
        expect(relation.onDelete, 
          `${rel.model}.${rel.field} should have CASCADE onDelete behavior`
        ).toBe('Cascade');
      }
    });
  });

  describe('Referential Integrity', () => {
    it('should maintain referential integrity through proper foreign keys', () => {
      // Verify that all foreign key fields reference valid tables
      const foreignKeyChecks = [
        { model: 'UserRole', field: 'userId', referencesModel: 'User' },
        { model: 'UserRole', field: 'roleId', referencesModel: 'Role' },
        { model: 'RolePermission', field: 'roleId', referencesModel: 'Role' },
        { model: 'RolePermission', field: 'permissionId', referencesModel: 'Permission' },
        { model: 'OrganisationMember', field: 'userId', referencesModel: 'User' },
        { model: 'OrganisationMember', field: 'organisationId', referencesModel: 'Organisation' },
        { model: 'AuditEvent', field: 'userId', referencesModel: 'User' },
        { model: 'Account', field: 'userId', referencesModel: 'User' },
        { model: 'Session', field: 'userId', referencesModel: 'User' },
      ];

      for (const check of foreignKeyChecks) {
        // Check that the foreign key field exists in the model
        const modelRegex = new RegExp(`model\\s+${check.model}\\s*{[^}]+${check.field}\\s+String[^}]+}`, 's');
        const hasField = modelRegex.test(schemaContent);
        
        expect(hasField, 
          `${check.model} should have ${check.field} field`
        ).toBe(true);

        // Check that the referenced model exists
        const referencedModelRegex = new RegExp(`model\\s+${check.referencesModel}\\s*{`, 's');
        const referencedModelExists = referencedModelRegex.test(schemaContent);
        
        expect(referencedModelExists, 
          `Referenced model ${check.referencesModel} should exist`
        ).toBe(true);
      }
    });

    it('should define inverse relations for all foreign keys', () => {
      // Verify that inverse relations exist
      const inverseRelations = [
        { parentModel: 'User', childModel: 'UserRole', relationField: 'roles' },
        { parentModel: 'Role', childModel: 'UserRole', relationField: 'users' },
        { parentModel: 'Role', childModel: 'RolePermission', relationField: 'permissions' },
        { parentModel: 'Permission', childModel: 'RolePermission', relationField: 'roles' },
        { parentModel: 'User', childModel: 'OrganisationMember', relationField: 'organisationMembers' },
        { parentModel: 'Organisation', childModel: 'OrganisationMember', relationField: 'members' },
        { parentModel: 'User', childModel: 'AuditEvent', relationField: 'auditEvents' },
        { parentModel: 'User', childModel: 'Account', relationField: 'accounts' },
        { parentModel: 'User', childModel: 'Session', relationField: 'sessions' },
      ];

      for (const inverse of inverseRelations) {
        const modelRegex = new RegExp(
          `model\\s+${inverse.parentModel}\\s*{[^}]+${inverse.relationField}\\s+${inverse.childModel}\\[\\][^}]+}`,
          's'
        );
        const hasInverseRelation = modelRegex.test(schemaContent);
        
        expect(hasInverseRelation, 
          `${inverse.parentModel} should have inverse relation field '${inverse.relationField}' to ${inverse.childModel}[]`
        ).toBe(true);
      }
    });
  });

  describe('Schema Best Practices', () => {
    it('should use uuid() as default for all primary keys', () => {
      const models = [
        'User', 'Role', 'Permission', 'UserRole', 'RolePermission',
        'Organisation', 'OrganisationMember', 'AuditEvent', 'Account', 'Session'
      ];

      for (const model of models) {
        const idRegex = new RegExp(
          `model\\s+${model}\\s*{[^}]*id\\s+String\\s+@id\\s+@default\\(uuid\\(\\)\\)`,
          's'
        );
        const hasUuidPrimaryKey = idRegex.test(schemaContent);
        
        expect(hasUuidPrimaryKey, 
          `${model} should use String id with @default(uuid())`
        ).toBe(true);
      }
    });

    it('should have appropriate indexes on foreign key fields', () => {
      const indexChecks = [
        { model: 'UserRole', field: 'userId' },
        { model: 'UserRole', field: 'roleId' },
        { model: 'RolePermission', field: 'roleId' },
        { model: 'RolePermission', field: 'permissionId' },
        { model: 'OrganisationMember', field: 'userId' },
        { model: 'OrganisationMember', field: 'organisationId' },
        { model: 'AuditEvent', field: 'userId' },
        { model: 'Account', field: 'userId' },
        { model: 'Session', field: 'userId' },
      ];

      for (const check of indexChecks) {
        const modelRegex = new RegExp(`model\\s+${check.model}\\s*{[^}]+}`, 's');
        const modelMatch = schemaContent.match(modelRegex);
        
        if (modelMatch) {
          const modelContent = modelMatch[0];
          const indexRegex = new RegExp(`@@index\\(\\[${check.field}\\]\\)`);
          const hasIndex = indexRegex.test(modelContent);
          
          expect(hasIndex, 
            `${check.model} should have index on ${check.field}`
          ).toBe(true);
        }
      }
    });
  });
});
