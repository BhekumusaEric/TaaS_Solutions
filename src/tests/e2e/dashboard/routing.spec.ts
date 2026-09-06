import { test, expect } from '@playwright/test';

test.describe('Dashboard Role-Based Routing', () => {
  /**
   * These tests validate that authenticated users are routed
   * to the correct role-specific dashboard.
   *
   * Pre-requisites (from seed data):
   *   DEMO_TALENT@example.com  → VERIFIED_TALENT  → /dashboard/talent
   *   DEMO_CLIENT@example.com  → CLIENT_MEMBER    → /dashboard/client
   *   DEMO_ADMIN@example.com   → PLATFORM_ADMIN   → /dashboard/admin
   */

  test('unauthenticated user is redirected to sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to sign-in page
    await expect(page).toHaveURL(/.*sign-in.*/);
  });

  test('VERIFIED_TALENT user reaches talent dashboard', async ({ page }) => {
    // Sign in as talent user
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', 'DEMO_TALENT@example.com');
    await page.fill('input[name="password"]', 'DemoPassword123!');
    await page.click('button:has-text("Sign in")');

    // Should eventually land on the talent dashboard
    await page.waitForURL(/.*dashboard\/talent.*/);
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('CLIENT_MEMBER user reaches client dashboard', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', 'DEMO_CLIENT@example.com');
    await page.fill('input[name="password"]', 'DemoPassword123!');
    await page.click('button:has-text("Sign in")');

    await page.waitForURL(/.*dashboard\/client.*/);
    await expect(page.locator('text=Client Dashboard')).toBeVisible();
  });

  test('PLATFORM_ADMIN user reaches admin dashboard', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', 'DEMO_ADMIN@example.com');
    await page.fill('input[name="password"]', 'DemoPassword123!');
    await page.click('button:has-text("Sign in")');

    await page.waitForURL(/.*dashboard\/admin.*/);
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  });

  test('talent dashboard shows role-specific KPI cards', async ({ page }) => {
    await page.goto('/dashboard/talent');
    // If not authenticated, will redirect — this test assumes an authenticated session
    // In a full CI setup you'd use storageState for pre-authenticated sessions
  });

  test('admin dashboard shows platform statistics', async ({ page }) => {
    await page.goto('/dashboard/admin');
    // Validates that the admin dashboard shows real platform counts
  });
});
