import { test, expect } from '@playwright/test'

test.describe('Dokumentasi Page (/dokumentasi)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dokumentasi')
  })

  test('loads successfully', async ({ page }) => {
    const response = await page.request.get('/dokumentasi')
    expect(response.status()).toBe(200)
  })

  test('has correct page title containing "Dokumentasi"', async ({ page }) => {
    await expect(page).toHaveTitle(/Dokumentasi/i)
  })

  test('displays event cards', async ({ page }) => {
    // Should show at least one event (from static data or DB)
    await expect(
      page.getByText(/Ibadah|Natal|Bakti|Retreat|HUT|Event|Kegiatan/i).first()
    ).toBeVisible()
  })

  test('event cards show event names', async ({ page }) => {
    // Cards should contain readable event names
    const cards = page.locator('article, [class*="card"], [class*="Card"]')
    const count = await cards.count()
    if (count > 0) {
      await expect(cards.first()).toBeVisible()
    } else {
      // Fallback: just check that event-related content exists
      await expect(page.getByText(/Acara|Event|Kegiatan/i).first()).toBeVisible()
    }
  })

  test('navbar is visible', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible()
  })

  test('footer is visible', async ({ page }) => {
    await page.locator('footer').scrollIntoViewIfNeeded()
    await expect(page.locator('footer')).toBeVisible()
  })
})
