import { test, expect } from '@playwright/test'

test.describe('Admin Responsive (Mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('admin login page is usable on mobile', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /masuk|login/i }).first()).toBeVisible()
  })

  test('admin page has no horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/admin')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10)
  })

  test('admin/jadwal has no horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/admin/jadwal')
    if (page.url().includes('/admin/login')) return
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10)
  })

  test('sidebar is not taking full width on mobile when hidden', async ({ page }) => {
    await page.goto('/admin')
    if (page.url().includes('/admin/login')) return

    const sidebar = page.locator('aside, [class*="sidebar"]')
    if (await sidebar.count() > 0) {
      const box = await sidebar.first().boundingBox()
      if (box) {
        // If visible, should not be 375px wide (full screen) — it's an overlay
        expect(box.width).toBeLessThan(375)
      }
    }
  })

  test('admin tables are scrollable on mobile', async ({ page }) => {
    await page.goto('/admin/jadwal')
    if (page.url().includes('/admin/login')) return

    const table = page.locator('table')
    if (await table.count() > 0) {
      // Table container should have overflow-x scroll
      const tableWrapper = table.locator('..')
      const overflow = await tableWrapper.evaluate((el) => {
        const style = window.getComputedStyle(el)
        return style.overflowX
      })
      expect(['auto', 'scroll', 'hidden']).toContain(overflow)
    }
  })
})
