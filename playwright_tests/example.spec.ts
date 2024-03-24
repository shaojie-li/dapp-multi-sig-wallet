import { test, expect } from '@playwright/test';

test.describe("测试 Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('http://localhost:3000/user');
  });

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/My user page/);
  });
  
})
