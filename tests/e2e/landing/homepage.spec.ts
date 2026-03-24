import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads successfully with 200 status', async ({ page }) => {
    const response = await page.request.get('/')
    expect(response.status()).toBe(200)
  })

  test('has correct page title containing "GPIB Damai Sejahtera"', async ({ page }) => {
    await expect(page).toHaveTitle(/GPIB Damai Sejahtera/i)
  })

  test('html has lang="id"', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBe('id')
  })

  test('renders header/Navbar', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible()
  })

  test('renders Hero section with content', async ({ page }) => {
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
  })

  test('page has About / Tentang content (after scroll)', async ({ page }) => {
    // Scroll to trigger AnimatedSection for the About section
    await page.locator('#about').scrollIntoViewIfNeeded().catch(async () => {
      await page.evaluate(() => window.scrollBy(0, 500))
    })
    await page.waitForTimeout(500)
    // The About section has "Tentang Gereja" as a badge or heading
    const aboutContent = page.getByText(/Tentang Gereja|Tentang Kami|Gereja Kami/i).first()
    await expect(aboutContent).toBeAttached()
  })

  test('page has Programs / Pelayanan content (after scroll)', async ({ page }) => {
    await page.locator('#programs').scrollIntoViewIfNeeded().catch(async () => {
      await page.evaluate(() => window.scrollBy(0, 1000))
    })
    await page.waitForTimeout(500)
    await expect(page.getByText(/Pelayanan Kategorial|Jadwal Ibadah|Program/i).first()).toBeAttached()
  })

  test('page has Downloads / Unduhan content (after scroll)', async ({ page }) => {
    await page.locator('#downloads').scrollIntoViewIfNeeded().catch(async () => {
      await page.evaluate(() => window.scrollBy(0, 2000))
    })
    await page.waitForTimeout(500)
    await expect(page.getByText(/Tata Ibadah|Warta Jemaat|Unduhan/i).first()).toBeAttached()
  })

  test('page has Dokumentasi / Kegiatan content', async ({ page }) => {
    await page.evaluate(() => window.scrollBy(0, 3000))
    await page.waitForTimeout(500)
    await expect(page.getByText(/Dokumentasi|Kegiatan|Foto|Acara/i).first()).toBeAttached()
  })

  test('page has Contact section', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded().catch(async () => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1000))
    })
    await page.waitForTimeout(500)
    await expect(page.getByText(/Kontak|Hubungi|Contact/i).first()).toBeAttached()
  })

  test('renders Footer with church name', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    // Footer has church name in a span (text-white, so just check attached)
    await expect(footer.getByText(/GPIB Damai Sejahtera/i).first()).toBeAttached()
  })

  test('Footer has copyright text', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)
    const footer = page.locator('footer')
    await expect(footer.getByText(/©|Hak cipta/i).first()).toBeAttached()
  })

  test('page has no horizontal scroll', async ({ page }) => {
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 10)
  })
})
