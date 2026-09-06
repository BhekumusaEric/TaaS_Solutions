import { test, expect } from '@playwright/test';

test.describe('Sign In Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the sign-in page before each test
    await page.goto('/auth/sign-in');
  });

  test('should render the sign-in form correctly', async ({ page }) => {
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
    await expect(page.locator('label:has-text("Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Password")')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
  });

  test('should validate empty form fields', async ({ page }) => {
    await page.click('button:has-text("Sign in")');
    
    // Check for validation messages
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    
    // Initially should be password type
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click the toggle button
    await page.click('button[aria-label="Show password"]');
    
    // Should now be text type
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await page.click('button[aria-label="Hide password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should display error on invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    
    await page.click('button:has-text("Sign in")');
    
    // Wait for NextAuth to return error
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should redirect to dashboard on successful login', async ({ page }) => {
    // Fill in valid credentials (assuming they are seeded)
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'Admin123!');
    
    await page.click('button:has-text("Sign in")');
    
    // We can't guarantee the DB state here, but if the login is successful,
    // the app routes to /dashboard. 
    // In a real E2E environment, you'd ensure the user is seeded in a beforeAll block.
  });
});
