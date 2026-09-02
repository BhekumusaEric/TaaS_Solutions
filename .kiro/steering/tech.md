# Technology Steering: TaaS Solutions

## Technology Stack

### Frontend

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **UI Library:** React 18+
- **Styling:** Tailwind CSS 3+
- **Component System:** Accessible, reusable components (Radix UI primitives or Headless UI)
- **Forms:** React Hook Form + Zod validation
- **State Management:** React Context + Server Components (avoid unnecessary client state)

### Backend

- **Runtime:** Node.js (Next.js API Routes / Server Actions)
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Authentication:** Managed provider (Auth0, Clerk, Supabase Auth, or NextAuth.js)
- **File Storage:** S3-compatible object storage (AWS S3, Cloudflare R2, or Supabase Storage)
- **Email:** Transactional email service (SendGrid, Resend, or Postmark)

### Development Tools

- **Package Manager:** pnpm (or npm/yarn if established)
- **Linting:** ESLint with TypeScript rules
- **Formatting:** Prettier
- **Type Checking:** TypeScript compiler (tsc)
- **Testing:** Vitest (unit/integration), Playwright (E2E)
- **Git Hooks:** Husky + lint-staged (optional, but recommended)

### Infrastructure

- **Hosting:** Managed platform (Vercel, Railway, or Azure App Service)
- **Database Hosting:** Managed PostgreSQL (Supabase, Neon, Railway, or Azure)
- **CI/CD:** GitHub Actions
- **Monitoring:** Error tracking (Sentry) + logging (structured JSON)
- **Environment Management:** Development, Staging, Production

## Architectural Style

### Modular Monolith

**Decision:** Start with a modular monolith, not microservices.

**Rationale:**

- Simpler deployment
- Easier debugging
- Shared database transactions
- Lower operational complexity
- Can be split later if growth demands it

**Module Boundaries:**

- Each bounded module has clear responsibility
- Modules communicate through well-defined interfaces
- No circular dependencies between modules
- Shared utilities live in lib/ or shared/

### Module Structure

```
src/
├── modules/
│   ├── identity/          # Authentication, users, roles, permissions
│   ├── organisations/     # Organisations, membership
│   ├── talent/            # Talent profiles, skills, verification
│   ├── opportunities/     # Client opportunities, discovery
│   ├── proposals/         # Proposals, contracts, estimates
│   ├── projects/          # Projects, pods, delivery
│   ├── quality/           # Quality reviews, acceptance
│   ├── commercial/        # Invoices, payments, payouts
│   ├── experience/        # Experience records, progression
│   ├── audit/             # Audit events, compliance
│   └── notifications/     # Notification templates, sending
```

Each module contains:

```
module-name/
├── types.ts               # TypeScript types
├── schema.ts              # Zod validation schemas
├── queries.ts             # Database read operations
├── mutations.ts           # Database write operations
├── permissions.ts         # Authorization logic
├── utils.ts               # Module-specific utilities
└── tests/                 # Module tests
```

## Database Approach

### Schema Management

- **Migrations:** Prisma Migrate
- **Seeding:** Prisma seed script with clearly labelled demo data
- **Schema Location:** prisma/schema.prisma
- **Migration Strategy:** Never edit applied migrations, create new ones

### Data Integrity

- **Foreign Keys:** Enforce referential integrity
- **Constraints:** Use database constraints (NOT NULL, UNIQUE, CHECK)
- **Indexes:** Index foreign keys and frequently queried fields
- **Soft Deletes:** Use deletedAt timestamp where audit trail required
- **Timestamps:** createdAt and updatedAt on all entities

### Query Patterns

- **Reads:** Use Prisma queries with proper includes/selects
- **Writes:** Use Prisma transactions for multi-step operations
- **Performance:** Use select to fetch only needed fields
- **N+1:** Avoid N+1 queries (use include or nested queries)

## Authentication Approach

### Provider Selection

Use a **managed authentication provider** to avoid building auth from scratch.

**Options:**

- Auth0 (enterprise-grade, RBAC, MFA)
- Clerk (developer-friendly, React-native)
- Supabase Auth (open-source, integrated with Supabase)
- NextAuth.js (self-hosted, flexible)

**Requirements:**

- Email/password authentication
- MFA capability (future)
- Session management
- Password reset flow
- Account verification flow

### Session Strategy

- **Session Storage:** HTTP-only secure cookies
- **Session Duration:** 7 days (configurable)
- **Session Refresh:** Automatic refresh before expiry
- **Session Invalidation:** On logout, password change, or security event

### Integration Points

```typescript
// Example: Middleware checks authentication
export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.redirect('/sign-in');
  }
  return NextResponse.next();
}
```

## Authorization Approach

### Server-Side Only

**Critical Rule:** All authorization checks must happen on the server.

UI hiding is **not** authorization. Every protected API route, Server Action, and data query must validate permissions.

### Permission Model

```typescript
// Example permission check
async function canViewProject(userId: string, projectId: string): Promise<boolean> {
  // Check user role and project access
  const access = await db.projectAccess.findFirst({
    where: { userId, projectId },
  });
  return access !== null;
}
```

### Role-Based Access Control (RBAC)

- Roles defined in database (not hardcoded)
- Permissions assigned to roles
- Users assigned to roles
- Check user -> role -> permissions server-side

### Organisation Isolation

- Every query for organisation-specific data must filter by organisationId
- Users belong to organisations
- Projects belong to organisations
- Talent cannot access other organisations' data

## File Storage Approach

### Storage Provider

Use S3-compatible object storage:

- AWS S3
- Cloudflare R2
- Supabase Storage
- Azure Blob Storage (S3-compatible API)

### File Security

- **Upload Restrictions:**
  - Max file size: 10MB (MVP)
  - Allowed types: PDF, DOCX, PNG, JPG, JPEG (configured per context)
  - Filename sanitization
  - Virus scanning integration point (future)

- **Access Control:**
  - Signed URLs for private files
  - Short expiry (15 minutes)
  - User permission check before generating signed URL

- **Storage Structure:**

```
bucket/
├── organisations/{orgId}/
│   ├── opportunities/{opportunityId}/
│   ├── projects/{projectId}/
│   └── proposals/{proposalId}/
├── talent/{talentId}/
│   ├── portfolio/
│   ├── certifications/
│   └── verification/
└── public/
    └── case-studies/
```

## Email Approach

### Transactional Email Service

Use managed email service:

- SendGrid
- Resend
- Postmark
- Amazon SES

### Email Templates

- **Stored:** In code (not database for MVP)
- **Variables:** Use template variables for personalization
- **Preview:** Support email preview in development
- **Plain Text:** Always include plain-text version

### Email Types

- Welcome email (talent, client)
- Verification email
- Password reset
- Opportunity submission confirmation
- Proposal sent notification
- Project assignment notification
- Deliverable submitted notification
- Invoice issued notification
- Payout processed notification

## Validation Strategy

### Input Validation

**All user input must be validated server-side.**

- **Client-side:** Zod schemas for form validation (fast feedback)
- **Server-side:** Same Zod schemas for API/Server Action validation (security)

### Validation Layers

```typescript
// 1. Define schema
const createOpportunitySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  organisationId: z.string().uuid(),
});

// 2. Validate in form
const form = useForm({
  resolver: zodResolver(createOpportunitySchema),
});

// 3. Validate in server action
export async function createOpportunity(data: unknown) {
  const validated = createOpportunitySchema.parse(data); // throws if invalid
  // ... proceed with validated data
}
```

### Error Messages

- User-friendly messages (not "Invalid input")
- Specific field errors ("Title must be at least 5 characters")
- No technical stack traces to users

## Error Handling Strategy

### Error Classification

1. **User Errors** – Invalid input, unauthorized access (4xx)
2. **System Errors** – Database failures, external API failures (5xx)
3. **Business Rule Violations** – "Cannot delete project with active assignments"

### Error Boundaries

- React Error Boundaries for UI crashes
- Try-catch in Server Actions
- Global error handler for unhandled exceptions

### Error Logging

- **Log Level:**
  - User errors: INFO (not developer's fault)
  - System errors: ERROR
  - Business rule violations: WARN

- **Structured Logging:**

```typescript
logger.error('Failed to create opportunity', {
  userId,
  organisationId,
  error: error.message,
  stack: error.stack,
});
```

- **PII Protection:** Never log passwords, tokens, or sensitive personal data

### Error Responses

```typescript
// Consistent error response structure
{
  error: {
    code: 'UNAUTHORIZED',
    message: 'You do not have permission to view this project',
    field: 'projectId', // optional, for field-specific errors
  }
}
```

## Test Strategy

### Test Pyramid

1. **Unit Tests (60%)** – Pure functions, utility methods
2. **Integration Tests (30%)** – API routes, Server Actions, database interactions
3. **E2E Tests (10%)** – Critical user journeys

### Testing Tools

- **Unit/Integration:** Vitest
- **E2E:** Playwright
- **Coverage Target:** 80% for critical modules (identity, authorization, commercial)

### Test Database

- Separate test database (never test against dev/prod)
- Reset between test runs
- Seed with minimal test data

### What to Test

**Must Test:**

- Authentication flows
- Authorization checks
- State transitions
- Permission rules
- Organisation isolation
- Input validation
- Audit event creation

**Can Skip in MVP:**

- UI component unit tests (integration tests cover these)
- Every utility function (focus on critical logic)

### Test Naming

```typescript
describe('createOpportunity', () => {
  it('should create opportunity when user is client member', async () => {
    // ...
  });

  it('should reject when user is not authenticated', async () => {
    // ...
  });

  it('should reject when user is not member of organisation', async () => {
    // ...
  });
});
```

## Logging Strategy

### Structured Logging

Use JSON structured logs (not plain text).

```typescript
logger.info('Opportunity created', {
  opportunityId,
  organisationId,
  createdBy: userId,
  timestamp: new Date().toISOString(),
});
```

### Log Levels

- **DEBUG:** Verbose development information (disabled in production)
- **INFO:** Normal operations (user actions, state changes)
- **WARN:** Recoverable issues (validation failures, retries)
- **ERROR:** Unrecoverable errors (exceptions, system failures)

### What to Log

**Do Log:**

- User authentication events (login, logout, failures)
- State transitions (opportunity submitted, project mobilised)
- Authorization failures (useful for security monitoring)
- External API calls (for debugging)
- Performance metrics (slow queries)

**Do Not Log:**

- Passwords
- Tokens or API keys
- Full credit card numbers (if handling payments)
- Sensitive personal data (ID numbers, addresses)

## Observability

### Error Tracking

- **Tool:** Sentry (or similar)
- **Scope:** Capture unhandled exceptions and user-reported issues
- **PII:** Filter sensitive data before sending

### Performance Monitoring

- **Metrics:** API response times, database query times
- **Alerts:** Slow queries (>1s), high error rates (>5%)

### Audit Trail

- All audit events stored in database (AuditEvent table)
- Immutable records (no updates or deletes)
- Queryable by administrators

## CI/CD Strategy

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

### Quality Gates

**All PRs must pass:**

- Linting (no errors)
- Type checking (no errors)
- Unit tests (all passing)
- Integration tests (all passing)
- Build (successful)

### Deployment Pipeline

**Environments:**

- **Development:** Auto-deploy from `develop` branch
- **Staging:** Auto-deploy from `main` branch
- **Production:** Manual approval + deploy from `main` branch

## Environment Management

### Environment Variables

```bash
# .env.example
DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_PROVIDER_ID=...
AUTH_PROVIDER_SECRET=...
STORAGE_BUCKET=...
STORAGE_ACCESS_KEY=...
EMAIL_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Environment Separation

- **Development:** Local database, local file storage
- **Staging:** Separate database, separate storage bucket
- **Production:** Separate database, separate storage bucket, monitoring enabled

### Secrets Management

- **Never commit secrets to git**
- Use environment variables
- Use secret management service (GitHub Secrets, Azure Key Vault, etc.)

## Security Tooling

### Dependency Scanning

- **Tool:** npm audit, Snyk, or Dependabot
- **Frequency:** On every PR
- **Action:** Fix high/critical vulnerabilities before merging

### Static Analysis

- **Tool:** ESLint with security rules
- **Rules:** No eval(), no dangerouslySetInnerHTML without sanitization

### Database Security

- **Parameterized Queries:** Prisma prevents SQL injection
- **Least Privilege:** Database user has minimal required permissions
- **Encryption:** TLS for database connections

## Architecture Decision Records (ADR)

All significant architectural decisions must be documented.

**Location:** `docs/architecture/decisions/`

**Format:**

```markdown
# ADR-001: Use Modular Monolith Architecture

## Status

Accepted

## Context

[Why this decision was needed]

## Decision

[What was decided]

## Consequences

[Positive and negative impacts]

## Alternatives Considered

[Other options and why they were rejected]
```

## Technology Constraints

### Must Use

- TypeScript (no plain JavaScript)
- Server-side validation (no client-only validation)
- Managed authentication (no custom auth)
- Structured logging (no console.log in production)

### Must Not Use (MVP)

- Microservices architecture
- GraphQL (REST/Server Actions sufficient for MVP)
- Real-time websockets (polling acceptable for MVP)
- Complex state management (Redux, MobX) unless proven necessary
- Client-side routing (use Next.js App Router)

### Defer Until Needed

- Message queues (RabbitMQ, Redis)
- Caching layer (Redis)
- CDN (built-in with Vercel/hosting)
- Advanced monitoring (APM tools)
- Feature flags

## Performance Targets (MVP)

- **Page Load:** < 2s (initial load)
- **Navigation:** < 500ms (client-side navigation)
- **API Response:** < 500ms (p95)
- **Database Query:** < 100ms (p95)

## Scalability Considerations

**Current Target:** 1,000 users, 100 concurrent users

**Future Scaling:**

- Horizontal scaling (multiple app instances)
- Database read replicas (if read-heavy)
- CDN for static assets
- Object storage is inherently scalable

## Technology Review Cadence

- **Dependencies:** Review and update quarterly
- **Security Patches:** Apply within 7 days of release
- **Framework Upgrades:** Evaluate major versions, upgrade when stable
- **Technology Choices:** Revisit annually or when constraints change

## Developer Experience

### Local Development

- Fast feedback loops (HMR, fast refresh)
- Clear error messages
- Documented setup process (README)
- Seeded demo data for testing

### Code Quality

- Pre-commit hooks (linting, formatting)
- Consistent code style (Prettier)
- Type safety (strict TypeScript)
- Clear naming conventions

### Documentation

- README with setup instructions
- API documentation (inline comments, JSDoc where useful)
- Architecture diagrams (in docs/)
- Module responsibility documented in steering files
