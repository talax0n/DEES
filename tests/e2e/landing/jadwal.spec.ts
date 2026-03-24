import { test, expect } from '@playwright/test'

test.describe('Jadwal Page (/jadwal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jadwal')
  })

  test('loads successfully', async ({ page }) => {
    const response = await page.request.get('/jadwal')
    expect(response.status()).toBe(200)
  })

  test('has correct page title containing "Jadwal"', async ({ page }) => {
    await expect(page).toHaveTitle(/Jadwal/i)
  })

  test('displays jadwal ibadah information', async ({ page }) => {
    // Page shows "Jadwal Ibadah & Pelayanan" heading
    await expect(page.getByRole('heading', { name: /Jadwal Ibadah/i }).first()).toBeVisible()
  })

  test('shows Pelayanan Kategorial section heading', async ({ page }) => {
    // Scroll to the pelkat section which is below the fold
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    await expect(
      page.getByRole('heading', { name: /Pelayanan Kategorial/i }).first()
    ).toBeVisible({ timeout: 8000 })
  })

  test('navbar header is visible on jadwal page', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible()
  })

  test('footer is visible on jadwal page', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)
    await expect(page.locator('footer')).toBeVisible()
  })

  test('content is not hidden behind fixed navbar', async ({ page }) => {
    const firstHeading = page.getByRole('heading').first()
    if (await firstHeading.isVisible()) {
      const headingBox = await firstHeading.boundingBox()
      const headerBox = await page.locator('header').boundingBox()
      if (headingBox && headerBox) {
        expect(headingBox.y).toBeGreaterThanOrEqual(headerBox.height - 10)
      }
    }
  })
})
