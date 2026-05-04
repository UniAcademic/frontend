import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/admin');
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated user from student route to login', async ({ page }) => {
    await page.goto('/student');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated user from professor route to login', async ({ page }) => {
    await page.goto('/professor');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page should be accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=UniAcademic')).toBeVisible();
  });
});
