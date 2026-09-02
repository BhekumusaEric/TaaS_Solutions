# Testing Steering: TaaS Solutions

## Testing Philosophy

**Quality is built in, not tested in.**

Testing is an integral part of development, not an afterthought. Every feature includes tests before being considered complete.

## Test Pyramid

```
       /\
      /  \     E2E Tests (10%)
     /____\    Critical user journeys
    /      \
   /        \  Integration Tests (30%)
  /__________\ API routes, Server Actions, DB
 /            \
/______________\ Unit Tests (60%)
                 Functions, utilities, logic
```

### Unit Tests (60%)

Test individual functions and components in isolation.

**What to test:**

- Pure functions
- Utility methods
- Business logic
- Permission checks
- Validation logic
- Data transformations

**What to skip:**

- Trivial functions (getters/setters)
- Third-party library wrappers (test your usage, not the library)

### Integration Tests (30%)

Test how parts work together.

**What to test:**

- API routes
- Server Actions
- Database queries
- Module interactions
- Authentication flows
- Authorization flows

### E2E Tests (10%)

Test complete user journeys through the UI.

**What to test:**

- Critical paths (sign in, submit opportunity, create project)
- Multi-step workflows
- Role-specific journeys

## Testing Tools

### Unit and Integration Tests

**Framework:** Vitest

**Rationale:**

- Fast (parallelized, cached)
- Jest-compatible API
- Native TypeScript support
- Vite integration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './src/tests/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### E2E Tests

**Framework:** Playwright

**Rationale:**

- Multi-browser support (Chrome, Firefox, Safari)
- Built-in test runner
- Network interception
- Screenshot/video capture

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### Accessibility Testing

**Framework:** jest-axe (unit), axe-playwright (E2E)

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('Button has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Test Organization

### File Naming

```
module/
├── queries.ts
├── queries.test.ts          # Unit tests
├── mutations.ts
├── mutations.test.ts
├── permissions.ts
├── permissions.test.ts
```

### Test Suite Structure

```typescript
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should do something when condition is met', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should throw error when condition is not met', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Unit Testing Patterns

### Pure Function Testing

```typescript
// src/lib/utils.ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
}

// src/lib/utils.test.ts
describe('formatCurrency', () => {
  it('should format positive numbers', () => {
    expect(formatCurrency(1000)).toBe('R 1 000,00');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('R 0,00');
  });

  it('should format negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-R 500,00');
  });
});
```

### Validation Testing

```typescript
// src/modules/opportunities/schema.ts
import { z } from 'zod';

export const createOpportunitySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20),
  organisationId: z.string().uuid(),
});

// src/modules/opportunities/schema.test.ts
describe('createOpportunitySchema', () => {
  it('should validate correct data', () => {
    const data = {
      title: 'Build new website',
      description: 'We need a responsive website for our business',
      organisationId: '123e4567-e89b-12d3-a456-426614174000',
    };

    expect(() => createOpportunitySchema.parse(data)).not.toThrow();
  });

  it('should reject title shorter than 5 characters', () => {
    const data = {
      title: 'Test',
      description: 'We need a responsive website for our business',
      organisationId: '123e4567-e89b-12d3-a456-426614174000',
    };

    expect(() => createOpportunitySchema.parse(data)).toThrow();
  });

  it('should reject invalid UUID', () => {
    const data = {
      title: 'Build new website',
      description: 'We need a responsive website for our business',
      organisationId: 'not-a-uuid',
    };

    expect(() => createOpportunitySchema.parse(data)).toThrow();
  });
});
```

## Integration Testing Patterns

### Database Query Testing

```typescript
// src/modules/opportunities/queries.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { getOpportunityById } from './queries';
import { createTestUser, createTestOpportunity, cleanupDatabase } from '@/tests/factories';

describe('getOpportunityById', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  it('should return opportunity when it exists', async () => {
    const user = await createTestUser();
    const opportunity = await createTestOpportunity({ userId: user.id });

    const result = await getOpportunityById(opportunity.id);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(opportunity.id);
  });

  it('should return null when opportunity does not exist', async () => {
    const result = await getOpportunityById('00000000-0000-0000-0000-000000000000');

    expect(result).toBeNull();
  });
});
```

### Server Action Testing

```typescript
// src/app/actions/create-opportunity.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOpportunity } from './create-opportunity';
import { getSession } from '@/lib/auth';
import { createTestUser, createTestOrganisation } from '@/tests/factories';

vi.mock('@/lib/auth');

describe('createOpportunity (Server Action)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create opportunity when user is authenticated', async () => {
    const user = await createTestUser();
    const org = await createTestOrganisation();
    vi.mocked(getSession).mockResolvedValue({ user });

    const data = {
      title: 'Build new website',
      description: 'We need a responsive website',
      organisationId: org.id,
    };

    const result = await createOpportunity(data);

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe(data.title);
  });

  it('should reject when user is not authenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const data = {
      title: 'Build new website',
      description: 'We need a responsive website',
      organisationId: '123e4567-e89b-12d3-a456-426614174000',
    };

    await expect(createOpportunity(data)).rejects.toThrow('Unauthorized');
  });

  it('should validate input data', async () => {
    const user = await createTestUser();
    vi.mocked(getSession).mockResolvedValue({ user });

    const data = {
      title: 'Test', // Too short
      description: 'We need a responsive website',
      organisationId: '123e4567-e89b-12d3-a456-426614174000',
    };

    await expect(createOpportunity(data)).rejects.toThrow();
  });
});
```

### Permission Testing

```typescript
// src/modules/projects/permissions.test.ts
import { describe, it, expect } from 'vitest';
import { canUpdateProject } from './permissions';
import { createTestUser, createTestProject } from '@/tests/factories';

describe('canUpdateProject', () => {
  it('should allow project member to update project', async () => {
    const user = await createTestUser({ role: 'DELIVERY_LEAD' });
    const project = await createTestProject({ deliveryLeadId: user.id });

    const result = await canUpdateProject(user.id, project.id);

    expect(result).toBe(true);
  });

  it('should prevent non-member from updating project', async () => {
    const user = await createTestUser();
    const project = await createTestProject();

    const result = await canUpdateProject(user.id, project.id);

    expect(result).toBe(false);
  });

  it('should allow admin to update any project', async () => {
    const admin = await createTestUser({ role: 'PLATFORM_ADMIN' });
    const project = await createTestProject();

    const result = await canUpdateProject(admin.id, project.id);

    expect(result).toBe(true);
  });
});
```

## E2E Testing Patterns

### Authentication Flow

```typescript
// src/tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should sign in with valid credentials', async ({ page }) => {
    await page.goto('/sign-in');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/sign-in');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should redirect unauthenticated user to sign in', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/sign-in');
  });
});
```

### Critical User Journey

```typescript
// src/tests/e2e/opportunity-submission.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Opportunity Submission', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as client member
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'client@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should submit opportunity successfully', async ({ page }) => {
    // Navigate to submission form
    await page.click('text=Request a Solution');

    // Fill form
    await page.fill('input[name="title"]', 'Build responsive website');
    await page.fill(
      'textarea[name="description"]',
      'We need a modern responsive website for our business with e-commerce capabilities'
    );
    await page.selectOption('select[name="serviceCategory"]', 'SOFTWARE_ENGINEERING');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Opportunity submitted successfully')).toBeVisible();
    await expect(page).toHaveURL(/\/opportunities\/[a-f0-9-]+/);
  });

  test('should show validation errors for incomplete form', async ({ page }) => {
    await page.click('text=Request a Solution');

    // Submit without filling
    await page.click('button[type="submit"]');

    // Verify errors
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
  });
});
```

## Test Data Management

### Test Factories

```typescript
// src/tests/factories.ts
import { db } from '@/lib/db';
import { faker } from '@faker-js/faker';

export async function createTestUser(overrides = {}) {
  return await db.user.create({
    data: {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: 'VERIFIED_TALENT',
      ...overrides,
    },
  });
}

export async function createTestOrganisation(overrides = {}) {
  return await db.organisation.create({
    data: {
      name: faker.company.name(),
      type: 'CLIENT',
      ...overrides,
    },
  });
}

export async function createTestOpportunity(overrides = {}) {
  const user = overrides.userId ? { id: overrides.userId } : await createTestUser();
  const org = overrides.organisationId
    ? { id: overrides.organisationId }
    : await createTestOrganisation();

  return await db.opportunity.create({
    data: {
      title: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      status: 'DRAFT',
      userId: user.id,
      organisationId: org.id,
      ...overrides,
    },
  });
}

export async function cleanupDatabase() {
  // Delete in order to respect foreign keys
  await db.auditEvent.deleteMany();
  await db.opportunity.deleteMany();
  await db.organisationMember.deleteMany();
  await db.organisation.deleteMany();
  await db.user.deleteMany();
}
```

### Test Database

Use separate test database:

```bash
# .env.test
DATABASE_URL=postgresql://user:password@localhost:5432/taas_test
```

```typescript
// src/tests/setup.ts
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '@/lib/db';

beforeAll(async () => {
  // Ensure test database is clean
  await cleanupDatabase();
});

afterAll(async () => {
  await db.$disconnect();
});

beforeEach(async () => {
  // Reset between tests
  await cleanupDatabase();
});
```

## Mocking

### Mocking External Services

```typescript
// Mock auth provider
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

// Mock email service
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock file storage
vi.mock('@/lib/storage', () => ({
  uploadFile: vi.fn().mockResolvedValue({ url: 'https://example.com/file.pdf' }),
}));
```

### Partial Mocking

```typescript
// Mock only specific functions
vi.mock('@/modules/identity/queries', async () => {
  const actual = await vi.importActual('@/modules/identity/queries');
  return {
    ...actual,
    getUserById: vi.fn(), // Mock this one
    // Other functions use real implementation
  };
});
```

## Coverage

### Coverage Target

- **Critical modules (identity, authorization, commercial):** 80%+
- **Business logic:** 70%+
- **UI components:** 50%+
- **Overall:** 60%+

### Run Coverage

```bash
npm run test:coverage
```

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/', '**/*.test.ts', '**/*.spec.ts', '**/*.config.ts'],
    },
  },
});
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:coverage

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Quality

### Good Test Characteristics

- **Fast:** Runs quickly (unit tests <1s, integration <5s)
- **Isolated:** No dependencies between tests
- **Repeatable:** Same result every time
- **Self-checking:** Automated assertions
- **Timely:** Written alongside code

### Test Naming

Use descriptive test names:

```typescript
// GOOD
it('should reject opportunity when user is not member of organisation', async () => {
  // ...
});

// BAD
it('works', async () => {
  // ...
});
```

### Arrange-Act-Assert Pattern

```typescript
it('should create audit event when opportunity is submitted', async () => {
  // Arrange: Setup test data
  const user = await createTestUser();
  const org = await createTestOrganisation();
  const opportunity = await createTestOpportunity({
    userId: user.id,
    organisationId: org.id,
    status: 'DRAFT',
  });

  // Act: Perform the action
  await submitOpportunity(opportunity.id, user.id);

  // Assert: Verify results
  const auditEvents = await getAuditEvents({ resourceId: opportunity.id });
  expect(auditEvents).toHaveLength(1);
  expect(auditEvents[0].action).toBe('OPPORTUNITY_SUBMITTED');
});
```

## What to Test

### Must Test

- **Authentication:** Sign in, sign out, session management
- **Authorization:** Permission checks, role checks, org isolation
- **State Transitions:** Opportunity submitted → triage, project mobilising → active
- **Validation:** Input validation schemas
- **Business Logic:** Calculations, rules, workflows
- **Audit Events:** Sensitive actions create audit events
- **Error Handling:** Errors are caught and handled gracefully

### Can Skip (MVP)

- UI component snapshots (high maintenance, low value)
- Trivial getters/setters
- Third-party library functionality
- Generated code (Prisma client)

## Debugging Tests

### Run Single Test

```bash
npm run test -- queries.test.ts
```

### Run in Watch Mode

```bash
npm run test -- --watch
```

### Debug in VS Code

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test", "--", "--run"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Playwright Debug Mode

```bash
npx playwright test --debug
```

## Accessibility Testing

### jest-axe (Unit Tests)

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('Form has no accessibility violations', async () => {
  const { container } = render(<OpportunityForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### axe-playwright (E2E Tests)

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Homepage should not have accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Performance Testing

### Response Time Expectations

```typescript
test('should fetch opportunities in under 500ms', async () => {
  const start = Date.now();
  await getOpportunities(userId);
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(500);
});
```

## Security Testing

### SQL Injection Testing

```typescript
test('should prevent SQL injection in search', async () => {
  const maliciousInput = "'; DROP TABLE users; --";

  // Should not throw, should return safe results
  const result = await searchOpportunities(maliciousInput);

  expect(result).toBeDefined();
  // Verify users table still exists
  const users = await db.user.findMany();
  expect(users).toBeDefined();
});
```

### Authorization Bypass Testing

```typescript
test('should prevent horizontal privilege escalation', async () => {
  const user1 = await createTestUser();
  const user2 = await createTestUser();
  const project = await createTestProject({ userId: user2.id });

  // User1 tries to access User2's project
  await expect(getProject(user1.id, project.id)).rejects.toThrow('Unauthorized');
});
```

## Test Maintenance

### Keep Tests Up to Date

- Update tests when requirements change
- Refactor tests alongside code
- Remove obsolete tests
- Keep test factories in sync with schema

### Review Test Quality

- Are tests failing for the right reasons?
- Are tests easy to understand?
- Are tests fast enough?
- Is coverage adequate?

## Testing Checklist

Before merging code:

- [ ] Unit tests written for new functions
- [ ] Integration tests for new API routes/Server Actions
- [ ] Permission tests for protected operations
- [ ] State transition tests for workflow changes
- [ ] Input validation tested
- [ ] Audit event creation tested
- [ ] Error handling tested
- [ ] All tests passing locally
- [ ] All tests passing in CI
- [ ] Coverage meets targets
- [ ] No skipped tests without justification
- [ ] E2E tests for critical paths (if applicable)
- [ ] Accessibility tests passing

## Resources

- Vitest Documentation: https://vitest.dev/
- Playwright Documentation: https://playwright.dev/
- Testing Library: https://testing-library.com/
- jest-axe: https://github.com/nickcolley/jest-axe
