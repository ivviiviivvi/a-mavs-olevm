/**
 * Visual Home E2E smoke
 * Verifies the new image-first front door actually boots, renders the
 * data-driven works grid, and the lightbox opens/closes.
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Home front door', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('boots to #visual-home and renders the works grid', async ({ page }) => {
    await expect(page.locator('#visual-home')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#works-grid .gallery-item').first()).toBeVisible(
      { timeout: 15000 }
    );
    const count = await page.locator('#works-grid .gallery-item').count();
    // Seeded manifest has 227 works; assert a healthy floor.
    expect(count).toBeGreaterThan(50);
  });

  test('opens and closes the lightbox', async ({ page }) => {
    const firstItem = page.locator('#works-grid .gallery-item').first();
    await firstItem.waitFor({ state: 'visible', timeout: 15000 });
    await firstItem.click();
    await expect(page.locator('#visual-home .lightbox')).toHaveClass(/active/);
    await expect(page.locator('.lightbox-counter')).toContainText('/');
    await page.keyboard.press('Escape');
    await expect(page.locator('#visual-home .lightbox')).not.toHaveClass(
      /active/
    );
  });

  test('hero exposes Studies and Instagram links', async ({ page }) => {
    await expect(page.locator('#visual-home')).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator('#visual-home .works-hero-link[href="#akademia"]')
    ).toBeVisible();
    await expect(page.locator('#works-ig-link')).toHaveAttribute(
      'href',
      /instagram\.com/
    );
  });
});
