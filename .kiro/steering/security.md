# Security Steering: TaaS Solutions

## Security Principles

1. **Defense in Depth** – Multiple layers of security controls
2. **Least Privilege** – Users get minimum necessary access
3. **Server-Side Everything** – All security checks on server
4. **Assume Breach** – Design for when (not if) breach occurs
5. **Audit Everything Sensitive** – Immutable audit trail
6. **Encrypt in Transit and at Rest** – Protect data everywhere
7. **Validate All Input** – Never trust user input
8. **Fail Securely** – Errors should not expose information

## Authentication Security

### Managed Provider Required

Use a proven authentication provider (Auth0, Clerk, Supabase Auth, NextAuth.js).

**Do Not Build:**

- Custom password hashing
- Custom session management
- Custom email verification
- Custom password reset

### Password Requirements

If handling passwords directly (not recommended):

- Minimum 12 characters
- Require mix of uppercase, lowercase, numbers
- Check against common password lists
- Use bcrypt or Argon2 (never MD5, SHA1, or plain text)

### Session Security

- **Storage:** HTTP-only, Secure, SameSite cookies
- **Duration:** 7 days default (configurable)
- **Renewal:** Automatic before expiry
- **Invalidation:** On logout, password change, suspicious activity

```typescript
// Example secure cookie configuration
const cookieOptions = {
  httpOnly: true, // JavaScript cannot access
  secure: true, // HTTPS only
  sameSite: 'lax', // CSRF protection
  maxAge: 7 * 24 * 60 * 60, // 7 days
};
```

### Multi-Factor Authentication (MFA)

- **MVP:** MFA capability (using auth provider)
- **Future:** Enforce MFA for admin roles
- **Methods:** TOTP (Google Authenticator), SMS (backup)

### Account Security Events

Log and alert on:

- Failed login attempts (rate limit after 5 failures)
- Successful login from new device/location
- Password changes
- Email changes
- MFA enable/disable
- Role changes

## Authorization Security

### Server-Side Only

**Critical Rule:** All authorization must happen on server.

```typescript
// BAD: Client-side hiding
{user.role === 'ADMIN' && <DeleteButton />}

// GOOD: Server-side enforcement
async function deleteUser(userId: string) {
  const session = await requireAuth();
  if (!canDeleteUser(session.user, userId)) {
    throw new UnauthorizedError();
  }
  // ... proceed
}
```

### Permission Checks

Every protected operation must:

1. Verify user is authenticated
2. Check user has required role/permission
3. Validate user has access to specific resource

```typescript
// Template for protected operations
async function updateProject(projectId: string, data: unknown) {
  // 1. Authentication
  const session = await requireAuth();

  // 2. Input validation
  const validated = updateProjectSchema.parse(data);

  // 3. Authorization
  const canUpdate = await canUpdateProject(session.user.id, projectId);
  if (!canUpdate) {
    throw new UnauthorizedError('Cannot update this project');
  }

  // 4. Business logic
  const project = await db.project.update({
    where: { id: projectId },
    data: validated,
  });

  // 5. Audit
  await createAuditEvent({
    userId: session.user.id,
    action: 'PROJECT_UPDATED',
    resourceType: 'Project',
    resourceId: projectId,
  });

  return project;
}
```

### Organisation Isolation

Users must only access data from their authorised organisations.

**Query Pattern:**

```typescript
// BAD: No organisation filter
const projects = await db.project.findMany();

// GOOD: Filtered by organisation
const userOrgs = await getUserOrganisations(userId);
const projects = await db.project.findMany({
  where: {
    organisationId: { in: userOrgs.map((o) => o.id) },
  },
});
```

### Role-Based Access Control (RBAC)

**Role Hierarchy (from least to most privileged):**

1. Public Visitor (no authentication)
2. Talent Applicant
3. Verified Talent
4. Client Member
5. Client Approver
6. Delivery Lead
7. Talent Operations Administrator
8. Project Operations Administrator
9. Quality Reviewer
10. Finance Administrator
11. Platform Administrator

**Permission Model:**

- Permissions are granular (`project:create`, `project:update`, `project:delete`)
- Roles are collections of permissions
- Users are assigned roles
- Check permission, not role, in code

```typescript
// BAD: Check role
if (user.role === 'ADMIN') { ... }

// GOOD: Check permission
if (await hasPermission(user.id, 'project:delete')) { ... }
```

### Cross-Organisation Access Prevention

**Horizontal Privilege Escalation Prevention:**

```typescript
// User tries to access project from different organisation
async function getProject(userId: string, projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { organisation: true },
  });

  if (!project) {
    throw new NotFoundError();
  }

  // Check user is member of project's organisation
  const isMember = await isOrganisationMember(userId, project.organisationId);
  if (!isMember) {
    throw new UnauthorizedError(); // Don't reveal project exists
  }

  return project;
}
```

## Input Validation Security

### Server-Side Validation Required

**Never trust client-side validation alone.**

```typescript
// Client-side (fast feedback)
const form = useForm({
  resolver: zodResolver(schema),
});

// Server-side (security boundary)
export async function createOpportunity(data: unknown) {
  const validated = schema.parse(data); // Throws if invalid
  // ... proceed
}
```

### Validation Rules

- **String length:** Min/max constraints
- **Email format:** Use Zod email validator
- **UUIDs:** Use Zod UUID validator
- **Enums:** Validate against allowed values
- **Numbers:** Min/max constraints
- **Dates:** Valid date ranges
- **URLs:** Use Zod URL validator
- **File uploads:** Type, size, name sanitization

### SQL Injection Prevention

**Use Prisma parameterized queries (safe by default).**

```typescript
// SAFE: Prisma parameterized query
const user = await db.user.findUnique({
  where: { email: userInput },
});

// UNSAFE: Raw SQL with interpolation (DON'T DO THIS)
await db.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;
```

If raw SQL is absolutely necessary:

```typescript
// Use Prisma's parameterized raw queries
await db.$queryRaw`SELECT * FROM users WHERE email = ${Prisma.raw(email)}`;
```

### XSS Prevention

React escapes content by default, but:

**NEVER use dangerouslySetInnerHTML without sanitization:**

```typescript
// BAD
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// GOOD (if HTML is needed)
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### Command Injection Prevention

**Never execute shell commands with user input.**

If shell commands are unavoidable:

- Use parameterized APIs
- Validate and sanitize input heavily
- Run with least privilege
- Audit command execution

## File Upload Security

### File Type Restrictions

```typescript
const ALLOWED_MIME_TYPES = {
  documents: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  images: ['image/png', 'image/jpeg', 'image/jpg'],
};

function validateFileType(file: File, category: 'documents' | 'images') {
  if (!ALLOWED_MIME_TYPES[category].includes(file.type)) {
    throw new ValidationError('Invalid file type');
  }
}
```

### File Size Limits

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFileSize(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError('File too large (max 10MB)');
  }
}
```

### Filename Sanitization

```typescript
function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  return filename
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 255);
}
```

### Malware Scanning

**MVP:** Integration point defined (future implementation)
**Production:** Use ClamAV, VirusTotal API, or cloud provider scanning

### Secure File Storage

- **Private files:** Generate signed URLs (short expiry: 15 minutes)
- **Public files:** Separate bucket with public read
- **File paths:** UUID-based, not user-controlled
- **Access control:** Check permissions before generating signed URL

```typescript
async function getFileUrl(userId: string, fileId: string): Promise<string> {
  const file = await db.file.findUnique({ where: { id: fileId } });
  if (!file) throw new NotFoundError();

  // Check permission
  const canAccess = await canAccessFile(userId, fileId);
  if (!canAccess) throw new UnauthorizedError();

  // Generate short-lived signed URL
  return await generateSignedUrl(file.storagePath, { expiresIn: 900 }); // 15 min
}
```

## Data Protection

### Encryption in Transit

- **HTTPS only:** Redirect HTTP to HTTPS
- **TLS 1.2+:** Disable older protocols
- **HSTS header:** Enforce HTTPS in browsers
- **Secure cookies:** Set Secure flag

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};
```

### Encryption at Rest

- **Database:** Use provider's encryption at rest (Azure, AWS, Supabase)
- **File storage:** Use provider's encryption
- **Backups:** Encrypted backups
- **Environment variables:** Never commit secrets

### Sensitive Data Handling

**Never log:**

- Passwords (even hashed)
- Tokens or API keys
- Full credit card numbers
- ID numbers
- Private keys

**Redaction in logs:**

```typescript
logger.info('User updated', {
  userId,
  email: redactEmail(email), // jo**@example.com
  // Do not log: password, token, idNumber
});
```

### Data Minimization

- **Collect only necessary data**
- **Delete when no longer needed**
- **Anonymize where possible**

## Audit Logging

### What to Audit

**Must audit:**

- Authentication events (login, logout, failures)
- Authorization failures (access denied)
- State transitions (opportunity submitted, project mobilised)
- Data modifications (create, update, delete) for sensitive entities
- Permission changes (role granted, permission revoked)
- Configuration changes (system settings)
- Export of sensitive data

### Audit Event Structure

```typescript
interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  action: string; // 'USER_CREATED', 'PROJECT_UPDATED'
  resourceType: string; // 'User', 'Project'
  resourceId: string; // UUID of resource
  organisationId?: string; // If org-scoped
  metadata?: Record<string, any>; // Additional context
  ipAddress?: string;
  userAgent?: string;
}
```

### Audit Event Immutability

- **No updates:** Audit events cannot be modified
- **No deletes:** Audit events cannot be deleted (retention policy only)
- **Append-only:** Only INSERT operations

```prisma
model AuditEvent {
  id              String   @id @default(uuid())
  timestamp       DateTime @default(now())
  userId          String
  action          String
  resourceType    String
  resourceId      String
  organisationId  String?
  metadata        Json?
  ipAddress       String?
  userAgent       String?

  user            User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([resourceType, resourceId])
  @@index([timestamp])
}
```

### Audit Query Access

- **Platform Administrators:** Can query all audit events
- **Organisation Administrators:** Can query org-scoped events
- **Users:** Can query their own actions
- **Compliance:** Audit event export for legal/compliance

## Rate Limiting

### Authentication Endpoints

```typescript
// Example: 5 failed login attempts = 15-minute lockout
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
```

### API Endpoints

```typescript
// Example: 100 requests per minute per user
const API_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  max: 100,
};
```

### Implementation

Use middleware or managed service (Vercel Edge Config, Upstash Rate Limit, etc.)

## Security Headers

### Required Headers

```typescript
// next.config.js
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ];
}
```

### Content Security Policy (CSP)

```typescript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co", // Adjust for your APIs
  ].join('; '),
}
```

## Secrets Management

### Environment Variables

**Never commit secrets:**

- `.env.local` is gitignored
- `.env.example` contains placeholders only
- Production secrets in secure vault (GitHub Secrets, Azure Key Vault)

### Secret Rotation

- Rotate database passwords quarterly
- Rotate API keys quarterly
- Rotate auth secrets on breach

### Least Privilege for Secrets

- Database user has minimal required permissions
- API keys have minimal required scopes
- Service accounts have least privilege

## Dependency Security

### Vulnerability Scanning

```bash
# Run on every PR
npm audit
```

### Automated Scanning

Use Dependabot or Snyk:

- Scan dependencies daily
- Create PR for security patches
- Review and merge within 7 days

### Allowed Licenses

- MIT
- Apache 2.0
- BSD
- ISC

### Prohibited Licenses

- GPL (without legal review)
- AGPL
- Custom restrictive licenses

## Error Handling Security

### Error Responses

**Never expose:**

- Stack traces to users
- Database error details
- File system paths
- Internal implementation details

```typescript
// BAD
catch (error) {
  res.status(500).json({ error: error.message }); // May expose internals
}

// GOOD
catch (error) {
  logger.error('Failed to create opportunity', { error });
  res.status(500).json({ error: 'An unexpected error occurred' });
}
```

### Error Codes

Use semantic error codes:

```typescript
{
  error: {
    code: 'UNAUTHORIZED',
    message: 'You do not have permission to perform this action',
  }
}
```

**Do not expose:**

- Whether a user/email exists (prevents enumeration)
- Which validation rule failed (prevents probing)
- Internal error codes (use generic codes externally)

## Database Security

### Connection Security

- **TLS:** Enforce encrypted connections
- **Least Privilege:** Database user has minimal permissions
- **No root:** Never use root/admin user in application

### Query Security

- **Parameterized Queries:** Use Prisma (safe by default)
- **No dynamic table/column names:** Use static queries
- **Row-Level Security:** Filter by organisationId in every query

### Backup Security

- **Encrypted Backups:** At rest and in transit
- **Access Control:** Limit who can restore
- **Retention:** Define retention policy (e.g., 30 days)
- **Test Restores:** Monthly restore tests

## Third-Party Integrations

### API Key Security

- Store in environment variables
- Rotate regularly
- Use least privilege scopes
- Audit API calls

### Webhook Security

- Verify webhook signatures
- Use HTTPS endpoints only
- Validate payload structure
- Rate limit webhook endpoints

### OAuth Integration

- Use state parameter (CSRF protection)
- Validate redirect URIs
- Store tokens encrypted
- Use short-lived access tokens

## Incident Response

### Detection

- Monitor audit logs for anomalies
- Alert on failed authentication spikes
- Alert on authorization failures
- Monitor error rates

### Response Plan

1. **Identify:** Confirm security incident
2. **Contain:** Disable compromised accounts/API keys
3. **Investigate:** Review audit logs, identify scope
4. **Remediate:** Patch vulnerability, restore from backup if needed
5. **Communicate:** Notify affected users (if required)
6. **Learn:** Post-incident review, update procedures

### Communication

- Prepare incident response templates
- Define notification thresholds
- Legal review for breach notification requirements

## Compliance

### POPIA (Protection of Personal Information Act)

**This is not legal advice. Consult a qualified attorney.**

**Technical controls to support compliance:**

- Consent recording
- Data access (user can view their data)
- Data correction (user can update their data)
- Data deletion (user can request deletion)
- Data export (user can download their data)
- Retention policies
- Audit trail

### Implementation

```typescript
// Example: Data export
async function exportUserData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      opportunities: true,
      projects: true,
      // ... all related data
    },
  });

  return JSON.stringify(user, null, 2);
}
```

## Security Testing

### Required Tests

- Authentication bypass attempts
- Authorization bypass attempts (horizontal/vertical privilege escalation)
- Cross-organisation data leakage
- Input validation (SQL injection, XSS)
- File upload restrictions
- Rate limiting
- CSRF protection

### Test Examples

```typescript
describe('Authorization', () => {
  it('should prevent user from accessing other org projects', async () => {
    const user = await createUser({ orgId: 'org-1' });
    const project = await createProject({ orgId: 'org-2' });

    await expect(getProject(user.id, project.id)).rejects.toThrow(UnauthorizedError);
  });
});
```

## Security Checklist

Before deploying to production:

- [ ] HTTPS enforced (no HTTP)
- [ ] Authentication required for protected routes
- [ ] Authorization checked server-side for all operations
- [ ] Input validation on all user input
- [ ] SQL injection prevented (using Prisma)
- [ ] XSS prevented (React escaping + no dangerouslySetInnerHTML)
- [ ] CSRF protection (SameSite cookies + tokens where needed)
- [ ] File upload restrictions (type, size, sanitization)
- [ ] Secrets not committed to git
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Audit logging for sensitive actions
- [ ] Error messages don't expose internals
- [ ] Organisation isolation tested
- [ ] Dependency vulnerabilities addressed
- [ ] Backups encrypted and tested
- [ ] Incident response plan documented
- [ ] Security tests passing

## Prohibited Practices

**Never:**

- Store passwords in plain text
- Use MD5 or SHA1 for passwords
- Trust client-side validation alone
- Expose stack traces to users
- Log passwords or tokens
- Use `eval()` or `Function()` with user input
- Disable CORS without understanding implications
- Use `dangerouslySetInnerHTML` without sanitization
- Skip authorization checks "for convenience"
- Commit secrets to git
- Use production data in development
- Share credentials between team members
- Use admin credentials in application code
- Implement custom encryption (use proven libraries)

## Security Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP Cheat Sheets: https://cheatsheetseries.owasp.org/
- Next.js Security: https://nextjs.org/docs/app/building-your-application/security
- Prisma Security: https://www.prisma.io/docs/guides/database/advanced-database-tasks/sql-injection
