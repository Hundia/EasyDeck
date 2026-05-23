import { test, expect } from '@playwright/test';

test.describe('Transition Modes', () => {
  test('landing page renders architecture section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#architecture')).toBeVisible();
  });

  test('page is scrollable', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });
});
