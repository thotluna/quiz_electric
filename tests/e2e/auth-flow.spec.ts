import { test, expect } from '@playwright/test';

test.describe('Authentication Flow (E2E Mocks)', () => {

  test('should redirect unauthenticated user to login page', async ({ page }) => {
    // Navigate without any session cookies
    await page.goto('/');

    // Should be redirected to /login by the verifySession helper
    await expect(page).toHaveURL(/.*login/);

    // Verify we are on the login page
    const loginHeading = page.getByText('Bienvenido')
    await expect(loginHeading).toBeVisible();
  });

  test('should allow access to home page when mock session cookie is present', async ({ page, context }) => {

    await context.addCookies([{
      name: 'x-test-session',
      value: 'true',
      url: 'http://localhost:3000',
    }]);

    // Navigate to protected home page
    await page.goto('/');

    // Should stay on home page and see the mock user info
    await expect(page).toHaveURL(/\/$/);

    // Verify the UI shows the "Expert Test User" from our mock
    await expect(page.getByText(/Quiz Electric/i)).toBeVisible();

    // The Header or UserMenu should show the mock user name
    await expect(page.getByText(/Expert Test User/i)).toBeVisible();
  });

});
