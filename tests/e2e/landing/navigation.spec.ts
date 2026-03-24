import { test, expect } from '@playwright/test'

test.describe('Desktop Navigation', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Navbar header is visible at top of page', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible()
  })

  test('Navbar has "Tentang Gereja" navigation link (desktop visible)', async ({ page }) => {
    // Desktop nav links are inside hidden lg:flex — visible at 1280px (lg=1024px)
    const link = page.locator('header a').filter({ hasText: /Tentang Gereja/i })
    await expect(link.first()).toBeVisible()
  })

  test('Navbar has "Pelayanan" navigation link (desktop visible)', async ({ page }) => {
    const link = page.locator('header a').filter({ hasText: /^Pelayanan$/i })
    await expect(link.first()).toBeVisible()
  })

  test('Navbar has "Hubungi Kami" button', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Hubungi Kami/i })
    await expect(btn.first()).toBeVisible()
  })

  test('Navbar header is positioned fixed at top', async ({ page }) => {
    const header = page.locator('header').first()
    const position = await header.evaluate((el) => window.getComputedStyle(el).position)
    expect(['fixed', 'sticky']).toContain(position)
  })

  test('Logo link is in header', async ({ page }) => {
    const logoLink = page.locator('header a').first()
    await expect(logoLink).toBeVisible()
  })
})

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Hamburger menu button is visible on mobile viewport', async ({ page }) => {
    // The hamburger button is inside SheetTrigger with asChild lg:hidden
    // At 375px, lg:hidden does NOT apply (lg = 1024px+), so it IS visible
    // Find any visible button in header
    const visibleHeaderBtn = page.locator('header').getByRole('button').filter({ visible: true }).first()
    await expect(visibleHeaderBtn).toBeVisible()
  })

  test('Desktop nav links are not visible on mobile viewport', async ({ page }) => {
    // Desktop nav is hidden lg:flex — hidden at 375px
    const desktopNavDiv = page.locator('header .hidden.lg\\:flex')
    if (await desktopNavDiv.count() > 0) {
      await expect(desktopNavDiv.first()).toBeHidden()
    }
  })

  test('Clicking hamburger shows mobile menu content', async ({ page }) => {
    // Click the visible button in header (hamburger)
    const headerBtn = page.locator('header').getByRole('button').filter({ visible: true }).first()
    await headerBtn.click()
    await page.waitForTimeout(400)
    // After clicking, "Tentang Gereja" nav link should appear in the sheet
    const tentangLink = page.getByRole('link').filter({ hasText: /Tentang Gereja/i })
    await expect(tentangLink.first()).toBeVisible({ timeout: 5000 })
  })
})
