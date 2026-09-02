# End-to-End (E2E) Testing

## Overview

This directory contains Playwright E2E tests for the TaaS Solutions platform. These tests verify that the application works correctly from a user's perspective by simulating real browser interactions.

## Configuration Status

✅ **Playwright Configuration Complete**

The Playwright configuration is properly set up in `playwright.config.ts` with:

- Test directory: `src/tests/e2e/`
- Base URL: `http://localhost:3000`
- Multi-browser support (Chromium, Firefox, WebKit)
- Mobile browser emulation (Mobile Chrome, Mobile Safari)
- Automatic dev server startup before tests
- Trace capture on first retry
- Screenshot capture on failure
- Appropriate retry logic for CI environments

## Sample Test Status

✅ **Sample Test Created**

A sample E2E test has been created in `src/tests/e2e/homepage.spec.ts` that verifies:

1. **Homepage Display**: Checks that the TaaS Solutions homepage displays correctly
   - Main heading: "TaaS Solutions"
   - Tagline: "Talent as a Service"
   - Description: "Youth-powered ICT solutions. Governed for real-world delivery."

2. **Page Title**: Verifies the browser tab title includes "TaaS Solutions"

3. **Platform Status**: Confirms the development status message displays

4. **Accessibility**: Validates proper HTML structure
   - `<main>` element is present
   - `lang="en"` attribute on `<html>` element

5. **Brand Colors**: Checks that brand color classes (e.g., `text-navy`) are applied

## Required Manual Step: Install Playwright Browsers

⚠️ **IMPORTANT: Browsers Not Yet Installed**

Due to network constraints, Playwright browsers need to be installed manually before the tests can run.

### Installation Command

```bash
npx playwright install
```

This command will download the following browser binaries:

- Chromium (for Chrome-based testing)
- Firefox
- WebKit (for Safari-based testing)

### Alternative: Install Only Chromium (Faster)

If you want to test with just one browser initially:

```bash
npx playwright install chromium
```

### Verification

After installing browsers, verify the test passes:

```bash
npm run test:e2e
```

## Test Configuration Details

### Test Environment

The Playwright configuration (`playwright.config.ts`) includes:

- **Web Server Auto-Start**: Automatically starts `npm run dev` before tests
- **Timeout**: 120 seconds for dev server to start
- **Reuse Server**: Reuses existing dev server when not in CI
- **Parallel Execution**: Tests run in parallel for faster execution
- **CI Optimizations**: 
  - Forbids `.only` in CI
  - 2 retries on failure in CI
  - Sequential execution in CI (1 worker)

### Browser Projects

The configuration tests across multiple browsers:

1. **Chromium** (Desktop Chrome)
2. **Firefox** (Desktop Firefox)
3. **WebKit** (Desktop Safari)
4. **Mobile Chrome** (Pixel 5 emulation)
5. **Mobile Safari** (iPhone 12 emulation)

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

This opens an interactive UI where you can:
- See all tests
- Run specific tests
- Watch tests run in real-time
- Inspect test results

### Run Tests in Debug Mode

```bash
npm run test:e2e:debug
```

This allows you to:
- Step through tests
- Pause execution
- Inspect page state
- Use browser DevTools

### Run Specific Test File

```bash
npx playwright test src/tests/e2e/homepage.spec.ts
```

### Run Specific Browser

```bash
# Run only in Chromium
npx playwright test --project=chromium

# Run only in Firefox
npx playwright test --project=firefox

# Run only in WebKit
npx playwright test --project=webkit
```

## Writing E2E Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Navigate
    await page.goto('/some-path');

    // Interact
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use Semantic Locators**
   - Prefer `page.getByRole('button', { name: 'Submit' })`
   - Over `page.locator('button.submit-btn')`

2. **Use Auto-Waiting**
   - Playwright automatically waits for elements to be actionable
   - No need for manual `sleep()` or `waitFor()`

3. **Test User Journeys**
   - E2E tests should test complete user workflows
   - Not every edge case (that's for unit/integration tests)

4. **Keep Tests Independent**
   - Each test should be able to run in isolation
   - Don't depend on test execution order

5. **Use Page Object Pattern** (for complex pages)
   - Encapsulate page interactions in reusable classes
   - Makes tests more maintainable

## Accessibility Testing

Playwright can be extended with accessibility testing using `@axe-core/playwright`:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

*(Note: `@axe-core/playwright` needs to be installed separately)*

## CI/CD Integration

The E2E tests are designed to run in CI/CD pipelines. The GitHub Actions workflow should include:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### "Executable doesn't exist" Error

**Solution**: Run `npx playwright install` to download browser binaries.

### Dev Server Not Starting

**Solution**: 
- Ensure the dev server starts successfully: `npm run dev`
- Check that port 3000 is not already in use
- Increase `webServer.timeout` in `playwright.config.ts` if needed

### Tests Timing Out

**Solution**:
- Check that assertions are correct
- Verify elements exist on the page
- Use `test.setTimeout(60000)` for slow tests
- Check network requests aren't blocking

### Tests Flaking (Passing/Failing Intermittently)

**Solution**:
- Use Playwright's auto-waiting features
- Avoid race conditions
- Use `page.waitForLoadState('networkidle')` if needed
- Ensure test data is consistent

## Further Reading

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## Task Status Summary

**TASK-003: Set Up Testing Infrastructure**

- ✅ Vitest configured for unit/integration tests
- ✅ Playwright configured for E2E tests
- ✅ Sample E2E test created (`homepage.spec.ts`)
- ✅ Test scripts added to `package.json`
- ⚠️ **Manual Step Required**: Install Playwright browsers with `npx playwright install`

Once browsers are installed, all 5 tests in the sample test suite should pass, verifying:
- Proper Playwright configuration
- Basic homepage functionality
- Accessibility compliance (HTML structure, language attribute)
- Brand color application
