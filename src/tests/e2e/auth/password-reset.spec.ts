import { test, expect } from '@playwright/test';

test.describe('Password Reset Flow', () => {
  test.describe('Request Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/reset-password');
    });

    test('should render the reset request form', async ({ page }) => {
      await expect(page.locator('text=Reset your password')).toBeVisible();
      await expect(page.locator('label:has-text("Email")')).toBeVisible();
      await expect(page.locator('button:has-text("Send reset link")')).toBeVisible();
    });

    test('should validate empty email', async ({ page }) => {
      await page.click('button:has-text("Send reset link")');
      await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    });

    test('should show confirmation after submitting valid email', async ({ page }) => {
      await page.fill('input[name="email"]', 'test@example.com');
      await page.click('button:has-text("Send reset link")');

      // The page should show the success state regardless of whether the email exists
      await expect(page.locator('text=Check your email')).toBeVisible();
      await expect(page.locator('text=The link will expire in 1 hour')).toBeVisible();
    });
  });

  test.describe('Reset Completion Page', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate using an invalid token — the form should still render
      await page.goto('/auth/reset-password/test-invalid-token');
    });

    test('should render the new password form', async ({ page }) => {
      await expect(page.locator('text=Set new password')).toBeVisible();
      await expect(page.locator('label:has-text("New Password")')).toBeVisible();
      await expect(page.locator('label:has-text("Confirm Password")')).toBeVisible();
      await expect(page.locator('button:has-text("Reset password")')).toBeVisible();
    });

    test('should validate weak passwords', async ({ page }) => {
      await page.fill('input[name="password"]', 'weak');
      await page.fill('input[name="confirmPassword"]', 'weak');
      await page.click('button:has-text("Reset password")');
      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    });

    test('should validate password mismatch', async ({ page }) => {
      await page.fill('input[name="password"]', 'ValidPass123');
      await page.fill('input[name="confirmPassword"]', 'DifferentPass123');
      await page.click('button:has-text("Reset password")');
      await expect(page.locator('text=Passwords do not match')).toBeVisible();
    });

    test('should show error for invalid/expired token', async ({ page }) => {
      await page.fill('input[name="password"]', 'ValidPass123');
      await page.fill('input[name="confirmPassword"]', 'ValidPass123');
      await page.click('button:has-text("Reset password")');

      // The server action will reject invalid tokens
      await expect(page.locator('text=Invalid or expired reset link')).toBeVisible();
    });
  });
});
