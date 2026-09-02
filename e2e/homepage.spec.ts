import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the TaaS Solutions homepage', async ({ page }) => {
    await page.goto('/');

    // Check for main heading
    await expect(page.getByRole('heading', { name: 'TaaS Solutions' })).toBeVisible();

    // Check for tagline
    await expect(page.getByText('Talent as a Service')).toBeVisible();

    // Check for description
    await expect(
      page.getByText('Youth-powered ICT solutions. Governed for real-world delivery.')
    ).toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/TaaS Solutions/);
  });

  test('should display platform status', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Platform Foundation - In Development')).toBeVisible();
  });

  test('should have accessible content', async ({ page }) => {
    await page.goto('/');

    // Check that the page has proper HTML structure
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check language attribute
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('should render with brand colors', async ({ page }) => {
    await page.goto('/');

    // Check that brand color classes are applied
    const heading = page.getByRole('heading', { name: 'TaaS Solutions' });
    const headingClasses = await heading.getAttribute('class');

    expect(headingClasses).toContain('text-navy');
  });
});
