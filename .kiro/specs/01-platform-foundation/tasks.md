# Platform Foundation Tasks

## Specification 01: Platform Foundation

**Version:** 1.0  
**Status:** Draft  
**Created:** 2026-09-01  
**Owner:** Platform Architecture Team

---

## Task Execution Order

Tasks must be completed in the order specified below. Each task includes:

- **Objective:** What needs to be accomplished
- **Requirements:** User stories satisfied
- **Files:** Files to create/modify
- **Tests:** Required test coverage
- **Completion Criteria:** How to verify task is done

---

## Phase 1: Project Setup and Infrastructure

### TASK-001: Initialize Next.js Project with TypeScript

**Objective:** Create Next.js 14+ project with TypeScript, Tailwind CSS, and base configuration.

**Requirements:** Infrastructure foundation for all user stories

**Steps:**

1. Initialize Next.js with App Router:
   ```bash
   npx create-next-app@latest taas-solutions --typescript --tailwind --app --src-dir --import-alias "@/*"
   ```
2. Configure TypeScript with strict mode
3. Configure Tailwind with brand colors
4. Set up folder structure per structure.md
5. Configure path aliases in tsconfig.json

**Files Created:**

- `package.json`
- `tsconfig.json`
- `next.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/styles/globals.css`
- `.gitignore`
- `.env.example`

**Tests:** N/A (setup task)

**Completion Criteria:**

- [x] `npm run dev` starts development server
- [x] `npm run build` completes without errors
- [x] TypeScript strict mode enabled
- [-] Tailwind classes render correctly
- [x] Brand colors (#092B5A, #00A7A7, #E2A72E) configured in Tailwind

**Estimated Effort:** 2 hours

---

### TASK-002: Configure ESLint and Prettier

**Objective:** Set up code quality tools for consistent code style and error detection.

**Requirements:** NFR-018, NFR-019 (Code quality standards)

**Steps:**

1. Install ESLint and Prettier dependencies
2. Configure ESLint with TypeScript rules
3. Configure Prettier
4. Add lint and format scripts to package.json
5. Create .prettierignore

**Files Created/Modified:**

- `.eslintrc.json`
- `.prettierrc`
- `.prettierignore`
- `package.json` (scripts)

**Tests:** N/A (tooling task)

**Completion Criteria:**

- [x] `npm run lint` executes without errors
- [x] `npm run format` formats code consistently
- [x] TypeScript errors caught by ESLint
- [x] No ESLint or Prettier errors in existing code

**Estimated Effort:** 1 hour

---

### TASK-003: Set Up Testing Infrastructure

**Objective:** Configure Vitest for unit/integration tests and Playwright for E2E tests.

**Requirements:** US-025 (Automated Testing)

**Steps:**

1. Install Vitest and testing utilities
2. Create vitest.config.ts
3. Install Playwright
4. Create playwright.config.ts
5. Create test setup files
6. Add test scripts to package.json

**Files Created:**

- `vitest.config.ts`
- `playwright.config.ts`
- `src/tests/setup.ts`
- `src/tests/factories.ts`
- `src/tests/helpers.ts`
- `package.json` (test scripts)

**Tests:** Create sample test to verify setup

**Completion Criteria:**

- [x] `npm run test` executes Vitest
- [x] `npm run test:e2e` executes Playwright
- [x] Sample unit test passes
- [x] Sample E2E test passes
- [x] Test coverage report generates

**Estimated Effort:** 3 hours

---

### TASK-004: Set Up PostgreSQL Database and Prisma

**Objective:** Configure PostgreSQL connection and Prisma ORM.

**Requirements:** INT-004, INT-005 (Database requirements)

**Steps:**

1. Install Prisma and PostgreSQL client
2. Initialize Prisma
3. Configure database connection in .env
4. Create initial Prisma schema structure
5. Test database connection

**Files Created:**

- `prisma/schema.prisma` (initial structure)
- `.env.local` (local database connection)
- `.env.example` (updated with DATABASE_URL)
- `src/lib/db.ts` (Prisma client singleton)

**Tests:** Connection test

**Completion Criteria:**

- [x] Prisma schema valid (`npx prisma validate`)
- [-] Database connection successful
- [-] Prisma client generates without errors
- [x] `db.ts` exports singleton client

**Estimated Effort:** 2 hours

---

### TASK-005: Create Shared Utility Libraries

**Objective:** Create shared utility functions for logging, errors, and validation.

**Requirements:** US-021, US-022 (Error handling, logging)

**Steps:**

1. Create error classes (AppError, ValidationError, etc.)
2. Create structured logger (using pino or winston)
3. Create validation helpers
4. Create test utilities

**Files Created:**

- `src/lib/errors.ts`
- `src/lib/logger.ts`
- `src/lib/utils.ts`
- `src/lib/errors.test.ts`
- `src/lib/logger.test.ts`

**Tests:**

- Error class instantiation
- Logger output format
- Utility function behavior

**Completion Criteria:**

- [x] Error classes throw correctly
- [x] Logger outputs structured JSON
- [x] Sensitive data redacted from logs
- [x] All utility tests pass

**Estimated Effort:** 3 hours

---

## Phase 2: Database Schema and Migrations

### TASK-006: Define Core Database Schema

**Objective:** Create complete Prisma schema for identity, organizations, roles, permissions, and audit.

**Requirements:** All data model requirements from design.md Section 3.4.1

**Steps:**

1. Define User model with relations
2. Define Role, Permission, UserRole, RolePermission models
3. Define Organisation, OrganisationMember models
4. Define AuditEvent model
5. Define NextAuth.js models (Account, Session, VerificationToken)
6. Add indexes per design.md
7. Validate schema

**Files Created/Modified:**

- `prisma/schema.prisma` (complete schema)

**Tests:** Schema validation

**Completion Criteria:**

- [x] Schema validates (`npx prisma validate`)
- [x] All indexes defined
- [x] Foreign key constraints correct
- [x] Enums defined (OrganisationType)
- [-] No Prisma warnings

**Estimated Effort:** 4 hours

---

### TASK-007: Create Initial Database Migration

**Objective:** Generate and apply initial database migration.

**Requirements:** Data model requirements

**Steps:**

1. Generate initial migration
2. Review migration SQL
3. Apply migration to development database
4. Verify tables created
5. Generate Prisma Client

**Files Created:**

- `prisma/migrations/[timestamp]_init/migration.sql`

**Tests:** Migration application

**Completion Criteria:**

- [x] Migration generates without errors
- [x] Migration applies successfully
- [x] All tables exist in database
- [x] Prisma Client regenerates
- [x] Can query tables via Prisma

**Estimated Effort:** 2 hours

---

### TASK-008: Create Database Seed Script

**Objective:** Create seed script to populate demo data for development.

**Requirements:** US-023 (Demo Data Seeding)

**Steps:**

1. Create seed script with demo users for each role
2. Create demo organisations (CLIENT, PARTNER types)
3. Create demo organisation memberships
4. Create roles and permissions
5. Assign roles to demo users
6. Add safeguard to prevent production seeding

**Files Created:**

- `prisma/seed.ts`
- `package.json` (prisma.seed configuration)

**Tests:** Seed execution test

**Completion Criteria:**

- [x] Seed script runs (`npx prisma db seed`)
- [x] Demo users created with "DEMO" prefix
- [x] Demo organisations created
- [x] Roles and permissions created
- [x] Users assigned to roles and organisations
- [x] Script rejects production environment
- [-] Idempotent (can run multiple times)

**Estimated Effort:** 4 hours

---

## Phase 3: Authentication Foundation

### TASK-009: Set Up NextAuth.js Configuration

**Objective:** Configure NextAuth.js with credentials provider and database adapter.

**Requirements:** US-001, US-002, US-003, INT-001 (Authentication)

**Steps:**

1. Install NextAuth.js and Prisma adapter
2. Create auth configuration in src/lib/auth.ts
3. Create API route handler at app/api/auth/[...nextauth]/route.ts
4. Configure session strategy (JWT)
5. Configure callbacks
6. Create authentication utilities (requireAuth, getSession)

**Files Created:**

- `src/lib/auth.ts` (NextAuth configuration)
- `src/lib/auth-utils.ts` (helper functions)
- `src/app/api/auth/[...nextauth]/route.ts`
- `.env.example` (add NEXTAUTH_URL, NEXTAUTH_SECRET)

**Tests:**

- getSession returns session when authenticated
- requireAuth throws when unauthenticated
- Session includes user ID

**Completion Criteria:**

- [x] NextAuth.js configuration valid
- [x] Session creation works
- [x] JWT signed correctly
- [x] Helper functions tested
- [x] Environment variables documented

**Estimated Effort:** 4 hours

---

### TASK-010: Create Password Hashing Utilities

**Objective:** Create secure password hashing and verification functions.

**Requirements:** DR-003 (Password hashing)

**Steps:**

1. Install bcrypt
2. Create hashPassword function
3. Create verifyPassword function
4. Add tests for hashing and verification

**Files Created:**

- `src/lib/password.ts`
- `src/lib/password.test.ts`

**Tests:**

- Password hashes correctly
- Verification succeeds with correct password
- Verification fails with incorrect password
- Hash is different each time

**Completion Criteria:**

- [-] bcrypt configured with appropriate rounds (10-12)
- [~] hashPassword returns valid bcrypt hash
- [~] verifyPassword correctly validates
- [~] All tests pass

**Estimated Effort:** 2 hours

---

### TASK-011: Create Authentication Middleware

**Objective:** Create Next.js middleware to protect routes requiring authentication.

**Requirements:** US-006 (Protected Route Access)

**Steps:**

1. Create middleware.ts at project root
2. Implement authentication check using NextAuth
3. Define protected route patterns
4. Configure redirects for unauthenticated users
5. Test middleware with protected and public routes

**Files Created:**

- `middleware.ts`
- `middleware.test.ts` (integration test)

**Tests:**

- Unauthenticated user redirected from /dashboard
- Authenticated user accesses /dashboard
- Public routes accessible without auth
- Auth routes (/sign-in) accessible without auth

**Completion Criteria:**

- [~] Middleware checks authentication
- [~] Protected routes redirect to /sign-in
- [~] Public routes accessible
- [~] Authenticated users not redirected
- [~] Tests pass

**Estimated Effort:** 3 hours

---

## Phase 4: Authorization Foundation

### TASK-012: Create Identity Module (User Queries)

**Objective:** Create identity module with user query functions.

**Requirements:** US-019 (View Own Profile)

**Steps:**

1. Create src/modules/identity/ folder structure
2. Define TypeScript types
3. Create getUserById query
4. Create getUserByEmail query
5. Create getUserWithRoles query
6. Add unit tests

**Files Created:**

- `src/modules/identity/types.ts`
- `src/modules/identity/queries.ts`
- `src/modules/identity/queries.test.ts`

**Tests:**

- getUserById returns user when exists
- getUserById returns null when not exists
- getUserByEmail finds by email
- getUserWithRoles includes role relations

**Completion Criteria:**

- [~] All query functions implemented
- [~] Type safety enforced
- [~] Tests pass with 80%+ coverage
- [~] Functions handle missing data gracefully

**Estimated Effort:** 3 hours

---

### TASK-013: Create Identity Module (User Mutations)

**Objective:** Create user mutation functions (create, update).

**Requirements:** US-001, US-020 (Registration, Update Profile)

**Steps:**

1. Define Zod validation schemas
2. Create createUser mutation
3. Create updateUser mutation
4. Add password hashing integration
5. Add unit tests

**Files Created:**

- `src/modules/identity/schema.ts`
- `src/modules/identity/mutations.ts`
- `src/modules/identity/mutations.test.ts`

**Tests:**

- createUser creates with hashed password
- createUser validates input
- updateUser updates allowed fields
- updateUser prevents email changes

**Completion Criteria:**

- [~] Validation schemas complete
- [~] Mutations create/update correctly
- [~] Password hashed on creation
- [ ] Tests pass with 80%+ coverage

**Estimated Effort:** 4 hours

---

### TASK-014: Create Roles Module

**Objective:** Create roles module with role and permission management.

**Requirements:** US-014, US-015, US-016 (Role Management)

**Steps:**

1. Create src/modules/roles/ folder structure
2. Create role queries (getRoles, getRoleById, getRoleWithPermissions)
3. Create permission queries (getPermissions, getPermissionsByRole)
4. Create role mutations (createRole, assignPermissionToRole)
5. Create user-role mutations (assignRoleToUser, removeRoleFromUser)
6. Add tests

**Files Created:**

- `src/modules/roles/types.ts`
- `src/modules/roles/schema.ts`
- `src/modules/roles/queries.ts`
- `src/modules/roles/mutations.ts`
- `src/modules/roles/queries.test.ts`
- `src/modules/roles/mutations.test.ts`

**Tests:**

- Role CRUD operations
- Permission queries
- Role-user assignment
- Role-permission assignment

**Completion Criteria:**

- [~] All CRUD operations work
- [~] Relations queried correctly
- [~] Duplicate assignments prevented
- [ ] Tests pass with 80%+ coverage

**Estimated Effort:** 6 hours

---

### TASK-015: Create Permission Checking System

**Objective:** Create server-side permission checking utilities.

**Requirements:** US-008 (Permission Checking)

**Steps:**

1. Create hasPermission function
2. Create hasAnyPermission function
3. Create hasAllPermissions function
4. Create requirePermission utility
5. Add caching for performance (optional)
6. Add comprehensive tests

**Files Created:**

- `src/modules/roles/permissions.ts`
- `src/modules/roles/permissions.test.ts`

**Tests:**

- hasPermission returns true when user has permission
- hasPermission returns false when user lacks permission
- hasPermission works with multiple roles
- Permission check creates audit event on denial

**Completion Criteria:**

- [~] Permission checking functions work correctly
- [~] Multiple roles handled (union of permissions)
- [~] Platform Admin has all permissions
- [ ] Tests pass with 80%+ coverage

**Estimated Effort:** 4 hours

---

### TASK-016: Create Organisations Module

**Objective:** Create organisations module with CRUD and membership management.

**Requirements:** US-009 to US-013 (Organisation Management, Organisation Isolation)

**Steps:**

1. Create src/modules/organisations/ folder structure
2. Create organisation queries (with user filter)
3. Create organisation mutations
4. Create membership queries
5. Create membership mutations (add/remove member)
6. Implement organisation isolation in queries
7. Add comprehensive tests including isolation tests

**Files Created:**

- `src/modules/organisations/types.ts`
- `src/modules/organisations/schema.ts`
- `src/modules/organisations/queries.ts`
- `src/modules/organisations/mutations.ts`
- `src/modules/organisations/permissions.ts`
- `src/modules/organisations/queries.test.ts`
- `src/modules/organisations/mutations.test.ts`
- `src/modules/organisations/permissions.test.ts`

**Tests:**

- Organisation CRUD operations
- Membership add/remove
- User in Org A cannot see Org B resources
- User in multiple orgs sees all their orgs
- Organisation isolation tests (security-critical)

**Completion Criteria:**

- [ ] All CRUD operations work
- [~] Membership management works
- [~] Organisation isolation enforced
- [~] Isolation tests pass (critical)
- [ ] Tests pass with 80%+ coverage

**Estimated Effort:** 8 hours

---

### TASK-017: Create Audit Module

**Objective:** Create audit event logging and querying functionality.

**Requirements:** US-017, US-018 (Audit Logging)

**Steps:**

1. Create src/modules/audit/ folder structure
2. Create createAuditEvent mutation
3. Create audit event queries (with filters)
4. Create helper for extracting request metadata
5. Ensure immutability (no update/delete operations)
6. Add tests

**Files Created:**

- `src/modules/audit/types.ts`
- `src/modules/audit/queries.ts`
- `src/modules/audit/mutations.ts`
- `src/modules/audit/mutations.test.ts`
- `src/modules/audit/queries.test.ts`

**Tests:**

- createAuditEvent creates record
- Audit events include IP and user agent
- Audit event queries filter correctly
- Immutability enforced (no update function exists)

**Completion Criteria:**

- [~] Audit events created correctly
- [~] Metadata captured (IP, user agent)
- [~] Query filters work (user, action, date range)
- [~] No update or delete functions exist
- [~] Tests pass with 70%+ coverage

**Estimated Effort:** 4 hours

---

## Phase 5: UI Foundation and Design System

### TASK-018: Configure Tailwind with Brand Colors

**Objective:** Extend Tailwind config with TaaS Solutions brand colors and typography.

**Requirements:** Brand requirements from brand.md

**Steps:**

1. Add brand colors to Tailwind config
2. Configure typography scale
3. Add custom utilities if needed
4. Test color application
5. Document color usage

**Files Modified:**

- `tailwind.config.js`
- `src/styles/globals.css` (custom utilities)

**Tests:** Visual verification

**Completion Criteria:**

- [~] Deep Navy (#092B5A) configured as `navy`
- [~] Vivid Teal (#00A7A7) configured as `teal`
- [~] Warm Gold (#E2A72E) configured as `gold`
- [~] Other brand colors configured
- [~] Typography scale defined
- [~] Colors render in browser

**Estimated Effort:** 2 hours

---

### TASK-019: Create Base UI Components (Button, Input, Card)

**Objective:** Create accessible, reusable UI components.

**Requirements:** US-024 (Reusable UI Components), NFR-009 to NFR-012 (Accessibility)

**Steps:**

1. Create Button component with variants
2. Create Input component with label and error handling
3. Create Card component
4. Ensure WCAG 2.1 AA compliance
5. Add accessibility tests

**Files Created:**

- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/button.test.tsx`
- `src/components/ui/input.test.tsx`

**Tests:**

- Button has accessible name
- Button keyboard accessible
- Input has associated label
- Input error announced to screen readers
- Accessibility tests pass (jest-axe)

**Completion Criteria:**

- [~] Components render correctly
- [~] Keyboard accessible
- [~] ARIA attributes correct
- [~] Focus indicators visible
- [~] jest-axe tests pass
- [~] Visual variants work

**Estimated Effort:** 6 hours

---

### TASK-020: Create Modal/Dialog Component

**Objective:** Create accessible modal component with focus trapping.

**Requirements:** US-024, Accessibility requirements

**Steps:**

1. Create Dialog component (or integrate Radix UI Dialog)
2. Implement focus trap
3. Implement focus return on close
4. Add Escape key handler
5. Add accessibility tests

**Files Created:**

- `src/components/ui/dialog.tsx`
- `src/components/ui/dialog.test.tsx`

**Tests:**

- Focus traps within modal
- Focus returns to trigger on close
- Escape closes modal
- Accessibility tests pass

**Completion Criteria:**

- [~] Modal opens and closes
- [~] Focus management works
- [ ] Keyboard accessible
- [~] Background scroll prevented
- [ ] jest-axe tests pass

**Estimated Effort:** 4 hours

---

### TASK-021: Create Form Components (Form, Field, Error)

**Objective:** Create form component system with validation display.

**Requirements:** US-024, Accessibility requirements

**Steps:**

1. Create FormField component
2. Create FormError component
3. Create FormLabel component
4. Integrate with React Hook Form
5. Add Zod validation integration
6. Add tests

**Files Created:**

- `src/components/forms/form-field.tsx`
- `src/components/forms/form-error.tsx`
- `src/components/forms/form-label.tsx`
- `src/components/forms/form.test.tsx`

**Tests:**

- Form fields associate labels
- Errors display and announce
- Validation state visible
- Required fields indicated

**Completion Criteria:**

- [~] Form components render
- [~] React Hook Form integration works
- [~] Zod validation displays errors
- [~] Accessibility compliant
- [ ] Tests pass

**Estimated Effort:** 4 hours

---

### TASK-022: Create Layout Components (Header, Footer, AppShell)

**Objective:** Create application shell and navigation components.

**Requirements:** US-007 (Role-Based Dashboard Access)

**Steps:**

1. Create Header component with navigation
2. Create Footer component
3. Create AppShell layout component
4. Add user menu with sign-out
5. Implement skip links
6. Add responsive behavior

**Files Created:**

- `src/components/layouts/header.tsx`
- `src/components/layouts/footer.tsx`
- `src/components/layouts/app-shell.tsx`
- `src/components/layouts/skip-links.tsx`

**Tests:** Component rendering and navigation

**Completion Criteria:**

- [~] Header displays navigation
- [~] Footer displays correctly
- [~] AppShell wraps content
- [~] User menu shows for authenticated users
- [~] Skip link to main content works
- [~] Responsive on mobile

**Estimated Effort:** 5 hours

---

## Phase 6: Authentication UI

### TASK-023: Create Sign-In Page

**Objective:** Create sign-in page with form and validation.

**Requirements:** US-002 (User Sign In)

**Steps:**

1. Create sign-in page at app/(auth)/sign-in/page.tsx
2. Create sign-in form with email and password fields
3. Integrate with NextAuth signIn function
4. Add client-side validation
5. Add error handling and display
6. Add "Forgot password?" link
7. Add E2E test

**Files Created:**

- `src/app/(auth)/sign-in/page.tsx`
- `src/tests/e2e/auth/sign-in.spec.ts`

**Tests:**

- E2E: Valid credentials → redirect to dashboard
- E2E: Invalid credentials → error message
- E2E: Form validation works

**Completion Criteria:**

- [~] Sign-in form renders
- [~] Valid credentials authenticate
- [~] Invalid credentials show error
- [~] Password hidden
- [~] Accessible (keyboard, screen reader)
- [~] E2E test passes

**Estimated Effort:** 4 hours

---

### TASK-024: Create Registration Page

**Objective:** Create registration page with form and validation.

**Requirements:** US-001 (User Registration)

**Steps:**

1. Create registration page at app/(auth)/register/page.tsx
2. Create registration form
3. Create Server Action for registration
4. Add input validation (Zod)
5. Hash password before saving
6. Create audit event
7. Add E2E test

**Files Created:**

- `src/app/(auth)/register/page.tsx`
- `src/app/actions/register.ts`
- `src/tests/e2e/auth/register.spec.ts`

**Tests:**

- E2E: Valid registration creates user
- E2E: Duplicate email shows error
- E2E: Weak password shows error
- Unit: Server Action validates input
- Unit: Audit event created

**Completion Criteria:**

- [~] Registration form renders
- [~] Valid registration creates user
- [~] Password hashed
- [~] Duplicate email prevented
- [~] Audit event created
- [ ] E2E test passes

**Estimated Effort:** 5 hours

---

### TASK-025: Create Password Reset Flow

**Objective:** Create password reset request and completion pages.

**Requirements:** US-004, US-005 (Password Reset)

**Steps:**

1. Create reset request page
2. Create Server Action to generate token
3. Create reset completion page
4. Create Server Action to reset password
5. Implement token expiry (1 hour)
6. Invalidate sessions on password change
7. Create audit events
8. Add tests

**Files Created:**

- `src/app/(auth)/reset-password/page.tsx`
- `src/app/(auth)/reset-password/[token]/page.tsx`
- `src/app/actions/password-reset.ts`
- `src/tests/e2e/auth/password-reset.spec.ts`

**Tests:**

- E2E: Reset request flow
- E2E: Expired token shows error
- Unit: Token generation and validation
- Unit: Sessions invalidated
- Unit: Audit events created

**Completion Criteria:**

- [~] Reset request page works
- [~] Token generated and stored
- [~] Reset completion page works
- [~] Password updated
- [~] Sessions invalidated
- [~] Tokens expire after 1 hour
- [~] Audit events created
- [ ] Tests pass

**Estimated Effort:** 6 hours

---

## Phase 7: Dashboard and Profile UI

### TASK-026: Create Role-Based Dashboard Routing

**Objective:** Implement role-based dashboard redirect logic.

**Requirements:** US-007 (Role-Based Dashboard Access)

**Steps:**

1. Create dashboard route at app/(authenticated)/dashboard/page.tsx
2. Implement role detection
3. Create role-specific dashboard components
4. Implement redirect logic
5. Add tests

**Files Created:**

- `src/app/(authenticated)/dashboard/page.tsx`
- `src/app/(authenticated)/dashboard/talent/page.tsx`
- `src/app/(authenticated)/dashboard/client/page.tsx`
- `src/app/(authenticated)/dashboard/admin/page.tsx`
- `src/tests/e2e/dashboard/routing.spec.ts`

**Tests:**

- E2E: VERIFIED_TALENT → talent dashboard
- E2E: CLIENT_MEMBER → client dashboard
- E2E: PLATFORM_ADMIN → admin dashboard

**Completion Criteria:**

- [~] Dashboard detects user role
- [~] Users redirected to appropriate dashboard
- [~] Each dashboard displays role-specific content
- [~] E2E tests pass

**Estimated Effort:** 5 hours

---

### TASK-027: Create User Profile Page

**Objective:** Create user profile view and edit functionality.

**Requirements:** US-019, US-020 (View/Update Profile)

**Steps:**

1. Create profile page at app/(authenticated)/profile/page.tsx
2. Display user information
3. Create edit form for name
4. Create Server Action to update profile
5. Add audit event
6. Add tests

**Files Created:**

- `src/app/(authenticated)/profile/page.tsx`
- `src/app/actions/update-profile.ts`
- `src/tests/e2e/profile/update.spec.ts`

**Tests:**

- E2E: Profile displays user info
- E2E: Name update works
- Unit: Profile update Server Action
- Unit: Audit event created

**Completion Criteria:**

- [~] Profile page displays user data
- [~] Name can be updated
- [~] Audit event created on update
- [~] Email cannot be changed
- [ ] Tests pass

**Estimated Effort:** 4 hours

---

## Phase 8: Admin UI (Organisation and Role Management)

### TASK-028: Create Organisation List Page

**Objective:** Create admin page to view all organisations.

**Requirements:** US-010 (View Organisation List)

**Steps:**

1. Create organisations page at app/(authenticated)/admin/organisations/page.tsx
2. Fetch organisations with Server Component
3. Display in table with name, type, member count
4. Add pagination
5. Add search filter
6. Protect with PLATFORM_ADMIN permission
7. Add tests

**Files Created:**

- `src/app/(authenticated)/admin/organisations/page.tsx`
- `src/tests/e2e/admin/organisations.spec.ts`

**Tests:**

- E2E: Admin can view organisations
- E2E: Non-admin cannot access (403)
- E2E: Search filters list
- E2E: Pagination works

**Completion Criteria:**

- [~] Organisation list displays
- [~] Search works
- [~] Pagination works
- [~] Non-admins denied access
- [ ] Tests pass

**Estimated Effort:** 5 hours

---

### TASK-029: Create Organisation Creation Form

**Objective:** Create form to create new organisations.

**Requirements:** US-009 (Create Organisation)

**Steps:**

1. Create organisation create page
2. Create form with name, type, description
3. Create Server Action
4. Add validation
5. Create audit event
6. Add tests

**Files Created:**

- `src/app/(authenticated)/admin/organisations/new/page.tsx`
- `src/app/actions/organisations.ts`
- `src/tests/e2e/admin/create-organisation.spec.ts`

**Tests:**

- E2E: Admin can create organisation
- E2E: Validation prevents duplicate name
- Unit: Server Action validates
- Unit: Audit event created

**Completion Criteria:**

- [~] Form renders
- [~] Valid submission creates organisation
- [~] Duplicate name prevented
- [ ] Audit event created
- [ ] Tests pass

**Estimated Effort:** 4 hours

---

### TASK-030: Create Organisation Membership Management

**Objective:** Create UI to add/remove users from organisations.

**Requirements:** US-011, US-012 (Add/Remove Organisation Members)

**Steps:**

1. Create organisation detail page
2. Display current members
3. Create add member form/modal
4. Create remove member button
5. Create Server Actions
6. Create audit events
7. Add tests

**Files Created:**

- `src/app/(authenticated)/admin/organisations/[id]/page.tsx`
- `src/app/actions/organisation-members.ts`
- `src/tests/e2e/admin/organisation-members.spec.ts`

**Tests:**

- E2E: Add member to organisation
- E2E: Remove member from organisation
- E2E: Cannot add duplicate member
- Unit: Audit events created

**Completion Criteria:**

- [~] Member list displays
- [~] Add member works
- [~] Remove member works
- [~] Duplicate prevented
- [ ] Audit events created
- [ ] Tests pass

**Estimated Effort:** 6 hours

---

### TASK-031: Create Role Assignment UI

**Objective:** Create UI to assign/remove roles from users.

**Requirements:** US-014, US-015, US-016 (Role Management)

**Steps:**

1. Create user detail page (or extend profile page for admins)
2. Display current roles
3. Create assign role form
4. Create remove role button
5. Create Server Actions
6. Display effective permissions
7. Create audit events
8. Add tests

**Files Created:**

- `src/app/(authenticated)/admin/users/[id]/page.tsx`
- `src/app/actions/user-roles.ts`
- `src/tests/e2e/admin/user-roles.spec.ts`

**Tests:**

- E2E: Assign role to user
- E2E: Remove role from user
- E2E: View effective permissions
- Unit: Audit events created

**Completion Criteria:**

- [~] Role list displays
- [~] Assign role works
- [~] Remove role works
- [~] Effective permissions shown
- [ ] Audit events created
- [ ] Tests pass

**Estimated Effort:** 6 hours

---

## Phase 9: Audit Log UI

### TASK-032: Create Audit Log Viewer

**Objective:** Create admin page to view and filter audit events.

**Requirements:** US-018 (View Audit Log)

**Steps:**

1. Create audit log page at app/(authenticated)/admin/audit/page.tsx
2. Fetch audit events with Server Component
3. Display in table with all fields
4. Add filters (user, action, date range)
5. Add pagination
6. Protect with appropriate permission
7. Ensure immutability (no edit/delete buttons)
8. Add tests

**Files Created:**

- `src/app/(authenticated)/admin/audit/page.tsx`
- `src/tests/e2e/admin/audit-log.spec.ts`

**Tests:**

- E2E: Admin can view audit log
- E2E: Filters work
- E2E: Pagination works
- E2E: No edit/delete options visible

**Completion Criteria:**

- [~] Audit log displays
- [~] All event fields shown
- [~] Filters work (user, action, date)
- [ ] Pagination works
- [~] No edit/delete functionality
- [ ] Tests pass

**Estimated Effort:** 5 hours

---

## Phase 10: Testing and Quality Assurance

### TASK-033: Write Comprehensive Permission Tests

**Objective:** Create thorough test suite for permission checking.

**Requirements:** US-008 (Permission Checking)

**Steps:**

1. Test each role's permissions
2. Test permission inheritance (multiple roles)
3. Test Platform Admin all-permissions
4. Test permission denial creates audit event
5. Test cross-organisation permission isolation

**Files Created:**

- `src/modules/roles/permissions.test.ts` (expanded)
- `src/tests/integration/permissions.test.ts`

**Tests:**

- Each role has correct permissions
- Multiple roles combine permissions (union)
- Platform Admin bypasses checks
- Permission denial audited
- Organisation isolation enforced

**Completion Criteria:**

- [~] All roles tested
- [~] Permission combinations tested
- [~] Audit event tests pass
- [~] Coverage >80% for permissions module

**Estimated Effort:** 4 hours

---

### TASK-034: Write Organisation Isolation Tests

**Objective:** Comprehensive tests to prevent cross-organisation data leakage.

**Requirements:** US-013 (Organisation Isolation) - Security Critical

**Steps:**

1. Test user in Org A cannot query Org B resources
2. Test user in multiple orgs sees all their resources
3. Test direct resource access bypasses prevented
4. Test SQL injection attempts blocked
5. Test permission checks respect organisation boundaries

**Files Created:**

- `src/tests/integration/organisation-isolation.test.ts`

**Tests:**

- User A cannot access User B's organisation
- User in Orgs A+B sees both
- Direct ID access blocked
- SQL injection prevented
- All isolation scenarios covered

**Completion Criteria:**

- [~] All isolation tests pass
- [~] Security vulnerabilities not found
- [~] Coverage complete for isolation scenarios

**Estimated Effort:** 5 hours

---

### TASK-035: Write E2E Tests for Critical Paths

**Objective:** Create end-to-end tests for complete user journeys.

**Requirements:** US-025 (Automated Testing)

**Steps:**

1. Write complete authentication flow test
2. Write organisation creation and membership test
3. Write role assignment test
4. Write audit log access test
5. Ensure all tests run in CI

**Files Created:**

- `src/tests/e2e/critical-paths.spec.ts`

**Tests:**

- Complete sign-up → sign-in → dashboard flow
- Admin creates org → adds member → verifies access
- Admin assigns role → user gains permissions
- Admin views audit log with filters

**Completion Criteria:**

- [~] All E2E tests pass
- [~] Tests run in CI
- [~] Tests cover critical security paths
- [~] Test data cleanup works

**Estimated Effort:** 6 hours

---

### TASK-036: Accessibility Audit and Fixes

**Objective:** Run accessibility tools and fix violations.

**Requirements:** NFR-009 to NFR-012 (Accessibility)

**Steps:**

1. Run Lighthouse accessibility audit
2. Run jest-axe on all components
3. Manual keyboard navigation test
4. Manual screen reader test (NVDA or VoiceOver)
5. Fix all WCAG 2.1 AA violations
6. Document any deferred issues

**Files Modified:** Various component files

**Tests:**

- Lighthouse score >90
- jest-axe reports zero violations
- Keyboard navigation works
- Screen reader announces correctly

**Completion Criteria:**

- [~] Lighthouse accessibility >90
- [~] jest-axe zero violations
- [~] Keyboard navigation works on all pages
- [~] Screen reader tested on key flows
- [~] All fixes tested

**Estimated Effort:** 8 hours

---

## Phase 11: CI/CD and Documentation

### TASK-037: Set Up GitHub Actions CI Pipeline

**Objective:** Create automated CI pipeline for quality checks.

**Requirements:** US-025, NFR-018, NFR-019 (Testing, Code Quality)

**Steps:**

1. Create .github/workflows/ci.yml
2. Configure PostgreSQL service
3. Add lint step
4. Add type-check step
5. Add unit test step
6. Add integration test step
7. Add build step
8. Add E2E test step
9. Configure test database
10. Test pipeline on PR

**Files Created:**

- `.github/workflows/ci.yml`

**Tests:** CI pipeline execution

**Completion Criteria:**

- [~] Pipeline runs on push/PR
- [~] All steps execute
- [~] Tests run with PostgreSQL service
- [~] Pipeline fails if any step fails
- [~] PR cannot merge if CI fails

**Estimated Effort:** 4 hours

---

### TASK-038: Create README and Setup Documentation

**Objective:** Document project setup and development workflow.

**Requirements:** Developer experience

**Steps:**

1. Update README.md with project overview
2. Document prerequisites
3. Document setup instructions
4. Document available scripts
5. Document environment variables
6. Document testing approach
7. Document deployment process

**Files Created/Modified:**

- `README.md`
- `CONTRIBUTING.md` (optional)

**Tests:** Follow docs to set up project

**Completion Criteria:**

- [~] README complete and accurate
- [~] New developer can follow setup docs
- [~] All environment variables documented
- [~] Testing instructions clear
- [~] Deployment process documented

**Estimated Effort:** 3 hours

---

### TASK-039: Security Review and Hardening

**Objective:** Conduct security review and address findings.

**Requirements:** All security requirements (NFR-004 to NFR-008)

**Steps:**

1. Run npm audit and fix vulnerabilities
2. Review all Server Actions for authorization
3. Review all database queries for organisation filtering
4. Review error messages for information leakage
5. Review audit event coverage
6. Test rate limiting
7. Verify HTTPS enforcement
8. Verify security headers

**Files Modified:** Various files based on findings

**Tests:**

- npm audit shows no high/critical vulnerabilities
- All protected operations have auth checks
- All queries filter by organisation
- No sensitive data in error messages

**Completion Criteria:**

- [~] npm audit clean (or documented exceptions)
- [~] All Server Actions have auth checks
- [~] All queries have organisation filtering
- [~] Error messages safe
- [~] Audit coverage complete
- [~] Security headers configured

**Estimated Effort:** 6 hours

---

### TASK-040: Final Integration Testing and Bug Fixes

**Objective:** Run complete test suite, identify and fix remaining issues.

**Requirements:** All requirements

**Steps:**

1. Run complete test suite (unit, integration, E2E)
2. Manually test all user flows
3. Identify and document bugs
4. Prioritize and fix critical bugs
5. Retest fixed issues
6. Update documentation with known issues

**Files Modified:** Various files based on bugs found

**Tests:** All tests pass

**Completion Criteria:**

- [~] All automated tests pass
- [~] Manual testing complete
- [~] Critical bugs fixed
- [~] Known issues documented
- [~] Test coverage meets targets

**Estimated Effort:** 8 hours

---

## Summary

**Total Tasks:** 40  
**Estimated Total Effort:** 190 hours (~4-5 weeks for 1 developer, ~2-3 weeks for 2 developers)

**Phase Breakdown:**

- Phase 1 (Setup): 5 tasks, 15 hours
- Phase 2 (Database): 3 tasks, 10 hours
- Phase 3 (Authentication): 3 tasks, 9 hours
- Phase 4 (Authorization): 6 tasks, 29 hours
- Phase 5 (UI Foundation): 5 tasks, 21 hours
- Phase 6 (Auth UI): 3 tasks, 15 hours
- Phase 7 (Dashboard): 2 tasks, 9 hours
- Phase 8 (Admin UI): 4 tasks, 21 hours
- Phase 9 (Audit UI): 1 task, 5 hours
- Phase 10 (Testing): 4 tasks, 23 hours
- Phase 11 (CI/CD): 4 tasks, 33 hours

**Critical Path:**
Setup → Database → Authentication → Authorization → UI Foundation → Auth UI → Testing → CI/CD

**Parallel Work Opportunities:**

- UI components (Phase 5) can be built in parallel with authorization (Phase 4)
- Admin UI (Phase 8) and Audit UI (Phase 9) can be built in parallel
- Documentation (TASK-038) can be written throughout

**Quality Gates:**

- After Phase 4: Authorization tests must pass (security-critical)
- After Phase 10: All tests must pass, accessibility audit complete
- After Phase 11: CI pipeline must pass, security review complete

---

## Task Tracking

**Recommended:**

- Track tasks in GitHub Issues or Project Board
- Link PRs to task numbers
- Mark tasks complete only when all completion criteria met
- Document any deviations from tasks in PR descriptions

---

**End of Tasks Document**
