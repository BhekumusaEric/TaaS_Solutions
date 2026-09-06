import { test, expect, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Critical user journeys', () => {
  async function signIn(page: Page, email: string, password: string) {
    await page.goto('/auth/sign-in');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Sign in")');
    await page.waitForURL(/\/dashboard(?:\/.*)?$/);
  }

  async function registerUser(page: Page, name: string, email: string, password: string) {
    await page.goto('/auth/register');
    await page.fill('input[name="name"]', name);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Register")');
    await expect(page).toHaveURL(/\/auth\/sign-in\?registered=true/);
  }

  test('complete sign-up → sign-in → dashboard flow', async ({ page }) => {
    const timestamp = Date.now();
    const email = `e2e-signup-${timestamp}@example.com`;
    const password = 'TestPass123!';

    await registerUser(page, 'E2E Sign Up User', email, password);
    await signIn(page, email, password);

    await expect(page).toHaveURL(/\/dashboard(?:\/.*)?$/);
    await expect(page.getByText(/dashboard/i).first()).toBeVisible();
  });

  test('admin creates an organisation, adds a member, and the member appears in the org details', async ({ page }) => {
    const timestamp = Date.now();
    const orgName = `E2E Org ${timestamp}`;
    const targetEmail = 'DEMO_TALENT@example.com';

    await signIn(page, 'DEMO_ADMIN@example.com', 'DemoPassword123!');

    await page.goto('/admin/organisations/new');
    await page.fill('input[id="name"]', orgName);
    await page.selectOption('select[id="type"]', 'CLIENT');
    await page.fill('textarea[id="description"]', 'Created by the E2E critical path suite');
    await page.click('button:has-text("Create Organisation")');

    await page.waitForURL(/\/admin\/organisations$/);
    await expect(page.getByRole('link', { name: orgName }).first()).toBeVisible();

    const organisation = await prisma.organisation.findUnique({
      where: { name: orgName },
      select: { id: true },
    });

    expect(organisation?.id).toBeTruthy();

    await page.goto(`/admin/organisations/${organisation!.id}`);
    await page.getByRole('button', { name: 'Add Member' }).click();
    await page.fill('input[placeholder="user@example.com"]', targetEmail);
    await page.getByRole('button', { name: 'Add to Organisation' }).click();

    await expect(page.getByText('DEMO Verified Talent User')).toBeVisible();
    await expect(page.getByText(targetEmail)).toBeVisible();
  });

  test('admin can assign a role to a new user and the role appears on the user detail page', async ({ page }) => {
    const timestamp = Date.now();
    const email = `e2e-role-${timestamp}@example.com`;

    await registerUser(page, 'E2E Role User', email, 'TestPass123!');

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    expect(user?.id).toBeTruthy();

    await signIn(page, 'DEMO_ADMIN@example.com', 'DemoPassword123!');
    await page.goto(`/admin/users/${user!.id}`);

    await page.getByRole('button', { name: 'Open role form' }).click();
    await page.selectOption('select', 'CLIENT_MEMBER');
    await page.getByRole('button', { name: 'Assign role' }).click();

    await expect(page.getByText('CLIENT_MEMBER')).toBeVisible();
  });

  test('admin can view the audit log and filter by action', async ({ page }) => {
    await signIn(page, 'DEMO_ADMIN@example.com', 'DemoPassword123!');
    await page.goto('/admin/audit');

    await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();
    await page.fill('input[name="action"]', 'USER_REGISTERED');
    await page.getByRole('button', { name: 'Apply filters' }).click();

    await expect(page.getByText('USER_REGISTERED')).toBeVisible();
  });
});
