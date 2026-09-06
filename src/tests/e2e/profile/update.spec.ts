import { test, expect } from '@playwright/test';

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as talent user before each test
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', 'DEMO_TALENT@example.com');
    await page.fill('input[name="password"]', 'DemoPassword123!');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL(/.*dashboard.*/);
  });

  test('should render profile page with user data', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Manage your account settings')).toBeVisible();
    // Email should be displayed but disabled
    const emailInput = page.locator('input[id="email"]');
    await expect(emailInput).toBeDisabled();
  });

  test('should display email as read-only', async ({ page }) => {
    await page.goto('/profile');
    
    const emailInput = page.locator('input[id="email"]');
    await expect(emailInput).toBeDisabled();
    await expect(page.locator('text=Email address cannot be changed')).toBeVisible();
  });

  test('should validate name field', async ({ page }) => {
    await page.goto('/profile');
    
    // Clear name and submit
    await page.fill('input[id="name"]', 'A'); // too short
    await page.click('button:has-text("Save changes")');
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible();
  });

  test('should successfully update name', async ({ page }) => {
    await page.goto('/profile');
    
    const newName = `Updated Name ${Date.now()}`;
    await page.fill('input[id="name"]', newName);
    await page.click('button:has-text("Save changes")');
    
    // Should show success message
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });
});
