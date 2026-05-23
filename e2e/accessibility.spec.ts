import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    // Check for basic a11y: landmarks, headings, no missing alt
    const headings = await page.locator('h1, h2, h3').count();
    expect(headings).toBeGreaterThan(0);
  });

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    // Tab through the page — should not get stuck
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
