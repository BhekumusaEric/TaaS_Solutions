# Foreign Key Constraints Verification Report

**Spec:** 01-platform-foundation  
**Task:** Foreign key constraints correct  
**Date:** 2026-09-01  
**Status:** ✅ VERIFIED

---

## Executive Summary

All foreign key relationships in the Prisma schema have been verified and are correctly defined with appropriate `onDelete` behavior. All tests passed successfully.

- **Total Foreign Key Relationships Verified:** 9
- **Test Coverage:** 15 comprehensive tests
- **Result:** ✅ All foreign keys correctly configured
- **Referential Integrity:** ✅ Maintained across all relationships

---

## Verified Foreign Key Constraints

### 1. UserRole Foreign Keys

#### UserRole → User
- **Status:** ✅ VERIFIED
- **onDelete Behavior:** Cascade
- **Field:** `userId`
- **References:** `User.id`
- **Rationale:** When a user is deleted, all their role assignments should be automatically removed
- **Index:** ✅ Present on `userId`

#### UserRole → Role
- **Status:** ✅ VERIFIED
- **onDelete Behavior:** Cascade
- **Field:** `roleId`
- **References:** `Role.id`
- **Rationale:** When a role is deleted, all user assignments to that role should be automatically removed
- **Index:** ✅ Present on `roleId`

---

### 2. RolePermission Foreign Keys

#### RolePermission → Role
- **Status:** ✅ VERIFIED
- **onDelete Behavior:** Cascade
- **Field:** `roleId`
- **References:** `Role.id`
- **Rationale:** When a role is deleted, all permission assignments for that role should be automatically removed
- **Index:** ✅ Present on `roleId`

#### RolePermission → Permission
- **Status:** ✅ VERIFIED
- **onDelete Behavior:** Cascade
- **Field:** `permissionId`
- **References:** `Permission.id`
- **Rationale:** When a permission is deleted, all role assignments for that permission should be automatically removed
- **Index:** ✅ Present on `permissionId`

---

### 3. OrganisationMember Foreign Keys

#### OrganisationMember → User
- **Status:** ✅ VERIFIED
- **onDelete Behavior:** Cascade
- **Field:** `userId`
- **References:** `User.id`
- **Rationale:** When a user is deleted, all their organisation memberships should be automatically removed
- **Index:** ✅ Present on `userId`

#### OrganisationMember → Organisation
- **Status:** ✅ VERIFIED
- **onDelete Behavior:** Cascade
- **Field:** `organisationId`
- **References:** `Organisation.id`
- **Rationale:** When an organisation is deleted, all memberships should be automatically removed
- **Index:** ✅ Present on `organisationId`

---

### 4. AuditEvent Foreign Keys

#### AuditEvent → User
- **Status:** ✅ VERIFIED
- **onDelete Behavior:** Cascade
- **Field:** `userId`
- **References:** `User.id`
- **Rationale:** When a user is deleted, their audit events should be removed (for MVP; in production, consider SetNull for compliance)
- **Index:** ✅ Present on `userId`
- **Note:** This maintains audit trail association but allows cleanup when users are removed

---

### 5. Account Foreign Keys (NextAuth.js)

#### Account → User
- **Status:** ✅ VERIFIED
- **onDelete Behavior:** Cascade
- **Field:** `userId`
- **References:** `User.id`
- **Rationale:** When a user is deleted, all their OAuth accounts should be automatically removed
- **Index:** ✅ Present on `userId`
- **Purpose:** Maintains NextAuth.js integration requirements

---

### 6. Session Foreign Keys (NextAuth.js)

#### Session → User
- **Status:** ✅ VERIFIED
- **onDelete Behavior:** Cascade
- **Field:** `userId`
- **References:** `User.id`
- **Rationale:** When a user is deleted, all their sessions should be automatically invalidated and removed
- **Index:** ✅ Present on `userId`
- **Purpose:** Maintains NextAuth.js integration requirements

---

## Verification Method

### Automated Testing

A comprehensive test suite was created and executed to verify:

1. **Foreign Key Existence:** All expected foreign key relationships are defined
2. **onDelete Behavior:** All CASCADE behaviors are correctly specified
3. **Referential Integrity:** All foreign keys reference valid tables and fields
4. **Inverse Relations:** All parent models have proper inverse relation fields
5. **Indexing:** All foreign key fields have appropriate indexes
6. **Primary Keys:** All models use UUID primary keys with proper defaults

### Test Results

```
✓ Foreign Key Constraints Verification (15 tests) 12ms
  ✓ UserRole Foreign Keys
    ✓ should have CASCADE onDelete for User relationship
    ✓ should have CASCADE onDelete for Role relationship
  ✓ RolePermission Foreign Keys
    ✓ should have CASCADE onDelete for Role relationship
    ✓ should have CASCADE onDelete for Permission relationship
  ✓ OrganisationMember Foreign Keys
    ✓ should have CASCADE onDelete for User relationship
    ✓ should have CASCADE onDelete for Organisation relationship
  ✓ AuditEvent Foreign Keys
    ✓ should have CASCADE onDelete for User relationship
  ✓ Account Foreign Keys (NextAuth)
    ✓ should have CASCADE onDelete for User relationship
  ✓ Session Foreign Keys (NextAuth)
    ✓ should have CASCADE onDelete for User relationship
  ✓ Schema Completeness
    ✓ should define all required foreign key relationships
    ✓ should use Cascade onDelete for all specified relationships
  ✓ Referential Integrity
    ✓ should maintain referential integrity through proper foreign keys
    ✓ should define inverse relations for all foreign keys
  ✓ Schema Best Practices
    ✓ should use uuid() as default for all primary keys
    ✓ should have appropriate indexes on foreign key fields

Test Files  1 passed (1)
Tests       15 passed (15)
```

---

## Relationship Diagram

```
User (Parent Entity)
├─── UserRole (CASCADE) ───────> Role
├─── OrganisationMember (CASCADE) ───> Organisation
├─── AuditEvent (CASCADE)
├─── Account (CASCADE) [NextAuth]
└─── Session (CASCADE) [NextAuth]

Role (Parent Entity)
├─── UserRole (CASCADE) ───────> User
└─── RolePermission (CASCADE) ──> Permission

Permission (Parent Entity)
└─── RolePermission (CASCADE) ──> Role

Organisation (Parent Entity)
└─── OrganisationMember (CASCADE) ─> User
```

---

## Referential Integrity Analysis

### ✅ Data Consistency
All foreign key constraints ensure data consistency by:
- Preventing orphaned records
- Automatically cleaning up dependent records
- Maintaining referential integrity at the database level

### ✅ Cascade Behavior Appropriateness

All CASCADE behaviors are appropriate for the following reasons:

1. **UserRole:** Role assignments are meaningless without the user or role existing
2. **RolePermission:** Permission grants are meaningless without the role or permission existing
3. **OrganisationMember:** Memberships are meaningless without the user or organisation existing
4. **AuditEvent:** Audit events should be tied to the user who performed them
5. **Account/Session:** OAuth accounts and sessions should be cleaned up with user deletion

### ✅ Alternative Behaviors Considered

For production environments, the following alternatives may be considered:

- **AuditEvent → User:** Could use `SetNull` instead of `CASCADE` to preserve audit history even after user deletion (with nullable userId field)
- However, for MVP, CASCADE is acceptable and maintains clean data

---

## Index Verification

All foreign key fields have appropriate indexes for optimal query performance:

| Table                 | Indexed Fields                        | Purpose                       |
| --------------------- | ------------------------------------- | ----------------------------- |
| UserRole              | userId, roleId                        | Fast role membership lookups  |
| RolePermission        | roleId, permissionId                  | Fast permission checks        |
| OrganisationMember    | userId, organisationId                | Fast org access verification  |
| AuditEvent            | userId, action, timestamp, resourceId | Fast audit queries            |
| Account               | userId                                | Fast OAuth account lookups    |
| Session               | userId                                | Fast session validation       |

---

## Schema Best Practices Compliance

### ✅ UUID Primary Keys
All models use `String @id @default(uuid())` for primary keys, providing:
- Globally unique identifiers
- No sequential ID enumeration attacks
- Distributed database compatibility

### ✅ Unique Constraints
Composite unique constraints prevent duplicate relationships:
- `UserRole: @@unique([userId, roleId])`
- `RolePermission: @@unique([roleId, permissionId])`
- `OrganisationMember: @@unique([userId, organisationId])`

### ✅ Inverse Relations
All foreign keys have proper inverse relations defined on parent models:
- `User.roles` (UserRole[])
- `User.organisationMembers` (OrganisationMember[])
- `User.auditEvents` (AuditEvent[])
- `Role.users` (UserRole[])
- `Role.permissions` (RolePermission[])
- `Organisation.members` (OrganisationMember[])

---

## Compliance with Requirements

### Requirements Coverage

| Requirement                   | Status      | Evidence                          |
| ----------------------------- | ----------- | --------------------------------- |
| UserRole → User, Role         | ✅ VERIFIED | Both CASCADE, tests passed        |
| RolePermission → Role, Perm   | ✅ VERIFIED | Both CASCADE, tests passed        |
| OrganisationMember → User, Org| ✅ VERIFIED | Both CASCADE, tests passed        |
| AuditEvent → User             | ✅ VERIFIED | CASCADE, test passed              |
| Account → User                | ✅ VERIFIED | CASCADE, test passed              |
| Session → User                | ✅ VERIFIED | CASCADE, test passed              |
| Proper indexing               | ✅ VERIFIED | All FK fields indexed             |
| Inverse relations             | ✅ VERIFIED | All parent models have inverses   |

### Design Document Alignment

The implemented schema aligns perfectly with Section 3.4.1 of the Design Document:
- ✅ All models defined as specified
- ✅ All relationships match design
- ✅ All onDelete behaviors match requirements
- ✅ All indexes match recommendations

---

## Recommendations

### For MVP
No changes required. All foreign key constraints are correctly implemented and appropriate for the MVP scope.

### For Production
Consider the following enhancements:

1. **AuditEvent Cascade Behavior**
   - Current: CASCADE (removes audit events when user deleted)
   - Consider: SetNull (preserves audit history, makes userId nullable)
   - Reason: Compliance requirements may mandate audit trail preservation

2. **Soft Deletes**
   - Consider implementing soft delete pattern (deletedAt timestamp)
   - Maintains data integrity while appearing deleted
   - Useful for User, Organisation, and other entities

3. **Archive Strategy**
   - Before user deletion, archive audit events to separate table
   - Implement retention policies per compliance requirements

---

## Files Created

1. **prisma/verify-schema-fk.test.ts**
   - Comprehensive test suite for foreign key verification
   - 15 tests covering all aspects of foreign key relationships
   - Can be run in CI/CD pipeline: `npm run test -- prisma/verify-schema-fk.test.ts`

2. **prisma/verify-foreign-keys.ts**
   - Runtime database constraint verification script
   - Queries actual database constraints (requires running database)
   - Can be used for production verification

---

## Conclusion

✅ **All foreign key constraints are correctly defined and verified.**

The Prisma schema demonstrates excellent database design practices:
- Appropriate use of CASCADE for all relationships
- Proper indexing on all foreign key fields
- Complete inverse relation definitions
- UUID primary keys throughout
- Composite unique constraints preventing duplicates

**Referential integrity will be maintained** through the database-enforced foreign key constraints, ensuring data consistency across all operations.

---

**Verified By:** Database Schema Verification Suite  
**Test Suite:** prisma/verify-schema-fk.test.ts  
**Test Status:** 15/15 tests passed  
**Date:** 2026-09-01  
**Result:** ✅ TASK COMPLETE
