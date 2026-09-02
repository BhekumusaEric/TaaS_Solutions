# Testing Infrastructure

This directory contains the testing infrastructure for the TaaS Solutions platform.

## Overview

We follow the **Test Pyramid** approach:

- **Unit Tests (60%)**: Testing individual functions and components in isolation
- **Integration Tests (30%)**: Testing interactions between modules and database operations
- **E2E Tests (10%)**: Testing critical user journeys through the UI

## Test Coverage Targets

| Module           | Target Coverage | Priority                 |
| ---------------- | --------------- | ------------------------ |
| `identity/`      | 80%+            | Security-critical        |
| `roles/`         | 80%+            | Authorization foundation |
| `organisations/` | 80%+            | Data isolation critical  |
| `audit/`         | 70%+            | Compliance critical      |
| `lib/`           | 70%+            | Shared utilities         |
| `components/`    | 50%+            | UI components            |

## Running Tests

```bash
# Unit and integration tests (Vitest)
npm test                 # Run all tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report

# End-to-end tests (Playwright)
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:debug   # Debug E2E tests
```

## File Structure

```
src/tests/
├── README.md           # This file
├── setup.ts            # Global test setup
├── helpers.ts          # Test utilities and helpers
└── factories.ts        # Test data factories

e2e/
├── homepage.spec.ts    # Example E2E test
└── ...                 # More E2E tests

**/*.test.ts            # Unit tests (co-located with source files)
**/*.spec.ts            # Integration tests (co-located with source files)
```

## Test Files

### `setup.ts`

Global setup executed before all tests. Includes:

- Testing Library configuration
- Next.js router mocks
- Next.js Image component mock
- Browser API mocks (ResizeObserver, matchMedia)

### `helpers.ts`

Shared test utilities:

- `renderWithProviders()`: Render components with context providers
- `waitFor()`: Wait for async conditions
- `delay()`: Create delays for testing
- `mockApiSuccess()` / `mockApiError()`: Mock API responses

### `factories.ts`

Test data factories for creating mock data:

- `generateId()`: Generate test UUIDs
- `generateEmail()`: Generate test emails
- `createMockUser()`: Create mock user objects
- `createMockOrganisation()`: Create mock organisation objects
- `createMockAuditEvent()`: Create mock audit events

## Writing Tests

### Unit Tests

Co-locate unit tests with source files using `.test.ts` extension:

```typescript
// src/lib/utils.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { capitalize } from './utils';

describe('capitalize', () => {
  it('should capitalize the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
});
```

### Integration Tests

Use `.spec.ts` extension for integration tests:

```typescript
// src/modules/organisations/queries.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getOrganisationById } from './queries';
import { createMockOrganisation } from '@/tests/factories';

describe('getOrganisationById', () => {
  beforeEach(async () => {
    // Setup test database
  });

  it('should return organisation when found', async () => {
    const mock = createMockOrganisation();
    // ... test implementation
  });
});
```

### E2E Tests

Place E2E tests in the `e2e/` directory:

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }) => {
  await page.goto('/sign-in');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## Best Practices

### 1. Test Behaviour, Not Implementation

❌ Bad:

```typescript
expect(component.state.isLoading).toBe(false);
```

✅ Good:

```typescript
expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
```

### 2. Use Descriptive Test Names

❌ Bad:

```typescript
it('works', () => { ... });
```

✅ Good:

```typescript
it('should reject when user is not authenticated', () => { ... });
```

### 3. Follow Arrange-Act-Assert Pattern

```typescript
it('should create organisation when user has permission', async () => {
  // Arrange
  const user = createMockUser({ role: 'ADMIN' });
  const orgData = { name: 'Test Org' };

  // Act
  const result = await createOrganisation(user, orgData);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.name).toBe('Test Org');
});
```

### 4. Clean Up After Tests

```typescript
import { afterEach } from 'vitest';

afterEach(async () => {
  // Clean up database
  // Reset mocks
  // Clear state
});
```

### 5. Mock External Dependencies

```typescript
import { vi } from 'vitest';

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));
```

## Critical Test Scenarios

### Authentication

- ✅ Valid credentials → authenticated session
- ✅ Invalid credentials → error message
- ✅ Expired session → redirect to sign-in

### Authorization

- ✅ User with permission → operation succeeds
- ✅ User without permission → forbidden error
- ✅ Permission denial creates audit event

### Organisation Isolation

- ✅ User in Org A → cannot access Org B resources
- ✅ User in multiple orgs → sees all their org resources
- ✅ Unauthenticated user → cannot access any org resources

## CI/CD Integration

Tests run automatically on:

- Every commit (unit + integration tests)
- Pull requests (all tests)
- Pre-deployment (E2E tests)

Quality gates require:

- ✅ All tests passing
- ✅ Coverage thresholds met
- ✅ No ESLint errors
- ✅ No TypeScript errors

## Troubleshooting

### Tests timing out

Increase timeout in test file:

```typescript
import { test } from 'vitest';
test('slow operation', async () => { ... }, 10000); // 10 second timeout
```

### Database tests failing

Ensure test database is reset between runs:

```typescript
beforeEach(async () => {
  await db.$executeRaw`TRUNCATE TABLE users CASCADE`;
});
```

### E2E tests failing locally

Ensure dev server is running:

```bash
npm run dev  # In one terminal
npm run test:e2e  # In another terminal
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
