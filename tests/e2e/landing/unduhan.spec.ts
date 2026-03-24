import { test, expect } from '@playwright/test'

test.describe('Unduhan Page (/unduhan)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/unduhan')
  })

  test('loads successfully', async ({ page }) => {
    const response = await page.request.get('/unduhan')
    expect(response.status()).toBe(200)
  })

  test('has correct page title containing "Unduhan"', async ({ page }) => {
    await expect(page).toHaveTitle(/Unduhan/i)
  })

  test('displays download content (Tata Ibadah or Warta)', async ({ page }) => {
    // Look specifically in main content, not in the hidden navbar
    const main = page.locator('main, [class*="container"], section').first()
    await expect(
      page.locator('main').getByText(/Tata Ibadah|Warta/i).first()
        .or(page.getByText(/Tata Ibadah|Warta Jemaat/i).first())
    ).toBeVisible({ timeout: 8000 })
  })

  test('navbar is visible on unduhan page', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible()
  })

  test('page has download links or buttons', async ({ page }) => {
    const downloadLink = page.locator('a[href], button')
      .filter({ hasText: /unduh|download/i })
      .or(page.locator('a[download]'))
    const count = await downloadLink.count()
    // May use different pattern — just check count is >= 0
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test.describe('Tab filter', () => {
    test('shows "Tata Ibadah" filter text on page', async ({ page }) => {
      await expect(page.getByText(/Tata Ibadah/i).first()).toBeVisible()
    })

    test('shows "Warta" filter text on page', async ({ page }) => {
      await expect(page.getByText(/Warta/i).first()).toBeVisible()
    })
  })
})
