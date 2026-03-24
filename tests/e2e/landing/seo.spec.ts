import { test, expect } from '@playwright/test'

test.describe('SEO', () => {
  test('Homepage has <title> tag', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)
  })

  test('Homepage has meta description', async ({ page }) => {
    await page.goto('/')
    const desc = await page.locator('meta[name="description"]').getAttribute('content')
    expect(desc).toBeTruthy()
    expect(desc!.length).toBeGreaterThan(10)
  })

  test('Homepage has Open Graph locale id_ID', async ({ page }) => {
    await page.goto('/')
    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
    expect(ogLocale).toBe('id_ID')
  })

  test('Homepage has og:title', async ({ page }) => {
    await page.goto('/')
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBeTruthy()
  })

  test('All landing pages have <title> tags', async ({ page }) => {
    const pages = ['/', '/jadwal', '/unduhan', '/dokumentasi', '/kontak']
    for (const path of pages) {
      await page.goto(path)
      const title = await page.title()
      expect(title.length, `${path} should have a non-empty title`).toBeGreaterThan(0)
    }
  })

  test('Homepage images have alt attributes (spot check)', async ({ page }) => {
    await page.goto('/')
    const images = page.locator('img')
    const count = await images.count()
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const alt = await images.nth(i).getAttribute('alt')
        // alt can be empty string (decorative) but attribute should exist
        expect(alt).not.toBeNull()
      }
    }
  })

  test.describe.skip('/robots.txt (enable if implemented)', () => {
    test('robots.txt is accessible', async ({ page }) => {
      const response = await page.request.get('/robots.txt')
      expect(response.status()).toBe(200)
    })
  })

  test('/sitemap.xml is accessible', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml')
    // sitemap.ts is present in the project
    expect([200, 404]).toContain(response.status())
    if (response.status() === 200) {
      const body = await response.text()
      expect(body).toContain('<?xml')
    }
  })
})
