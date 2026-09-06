import { test, expect } from '@playwright/test';

test.describe('Create Organisation', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as admin
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', 'DEMO_ADMIN@example.com');
    await page.fill('input[name="password"]', 'DemoPassword123!');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL(/.*dashboard.*/);
    await page.goto('/admin/organisations/new');
  });

  test('should render the creation form', async ({ page }) => {
    await expect(page.locator('text=Create Organisation')).toBeVisible();
    await expect(page.locator('label:has-text("Organisation Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Type")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Organisation")')).toBeVisible();
  });

  test('should validate empty name', async ({ page }) => {
    await page.click('button:has-text("Create Organisation")');
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible();
  });

  test('should create a new organisation', async ({ page }) => {
    const orgName = `Test Org ${Date.now()}`;
    await page.fill('input[name="name"]', orgName);
    await page.selectOption('select[id="type"]', 'CLIENT');
    await page.fill('textarea[id="description"]', 'A test organisation');
    await page.click('button:has-text("Create Organisation")');

    // Should redirect back to list
    await expect(page).toHaveURL(/.*admin\/organisations$/);
  });

  test('should prevent duplicate organisation names', async ({ page }) => {
    // Use a name that exists from seed data
    await page.fill('input[name="name"]', 'DEMO Client Organisation');
    await page.selectOption('select[id="type"]', 'CLIENT');
    await page.click('button:has-text("Create Organisation")');

    await expect(page.locator('text=An organisation with this name already exists')).toBeVisible();
  });
});
