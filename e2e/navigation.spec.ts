import { test, expect } from '@playwright/test';

test.describe('Navigation Flow', () => {
  test('page loads with stage content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    // Framework landing page renders
    await expect(page.locator('h1')).toContainText('EasyDeck');
  });

  test('skip link is first focusable element', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveText(/skip/i);
  });

  test('keyboard navigation works', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    // The page should respond to keyboard without errors
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    // No console errors
    expect(errors).toHaveLength(0);
  });
});
