import { test, expect } from '@playwright/test';

test.describe('Organisation List Page', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as admin
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', 'DEMO_ADMIN@example.com');
    await page.fill('input[name="password"]', 'DemoPassword123!');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL(/.*dashboard.*/);
  });

  test('admin can view organisations list', async ({ page }) => {
    await page.goto('/admin/organisations');
    await expect(page.locator('text=Organisations')).toBeVisible();
    await expect(page.locator('text=Manage client and partner organisations')).toBeVisible();
  });

  test('search filters the organisation list', async ({ page }) => {
    await page.goto('/admin/organisations');

    // Type a search query
    await page.fill('input[name="search"]', 'NonExistentOrg');
    await page.click('button:has-text("Search")');

    // Should show "No organisations found"
    await expect(page.locator('text=No organisations found')).toBeVisible();
  });

  test('new organisation button links to creation form', async ({ page }) => {
    await page.goto('/admin/organisations');
    await page.click('text=New Organisation');
    await expect(page).toHaveURL(/.*organisations\/new.*/);
  });
});

test.describe('Organisation Access Control', () => {
  test('non-admin user is redirected away', async ({ page }) => {
    // Sign in as talent user (not admin)
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', 'DEMO_TALENT@example.com');
    await page.fill('input[name="password"]', 'DemoPassword123!');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL(/.*dashboard.*/);

    // Try to access admin page
    await page.goto('/admin/organisations');
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
  });
});
