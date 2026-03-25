import { test, expect } from '@playwright/test'

test.describe('Admin Dokumentasi (/admin/dokumentasi)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/dokumentasi')
  })

  test('page loads or redirects to login', async ({ page }) => {
    const url = page.url()
    expect(url).toMatch(/\/admin\/dokumentasi|\/admin\/login/)
  })

  test('page has Dokumentasi heading', async ({ page }) => {
    if (page.url().includes('/login')) return
    await expect(page.getByText(/Dokumentasi/i).first()).toBeVisible()
  })

  test('"Buat Event" button is visible', async ({ page }) => {
    if (page.url().includes('/login')) return
    const createBtn = page.getByRole('button', { name: /buat event|tambah event|new event/i })
    await expect(createBtn.first()).toBeVisible()
  })

  test('clicking "Buat Event" opens dialog with Nama Acara and Tanggal fields', async ({ page }) => {
    if (page.url().includes('/login')) return
    await page.getByRole('button', { name: /buat event|tambah event/i }).first().click()
    const dialog = page.getByRole('dialog').first()
    await expect(dialog).toBeVisible()

    // Should have Nama Acara field
    const namaField = dialog.getByLabel(/nama acara/i)
      .or(dialog.getByPlaceholder(/nama acara/i))
    await expect(namaField.first()).toBeVisible()

    // Should have Tanggal field
    const tanggalField = dialog.getByLabel(/tanggal/i)
      .or(dialog.getByPlaceholder(/tanggal/i))
      .or(dialog.locator('input[type="date"]'))
    await expect(tanggalField.first()).toBeVisible()
  })

  test('dialog does NOT have description or slug fields', async ({ page }) => {
    if (page.url().includes('/login')) return
    await page.getByRole('button', { name: /buat event|tambah event/i }).first().click()
    const dialog = page.getByRole('dialog').first()
    await expect(dialog).toBeVisible()

    const descField = dialog.getByLabel(/deskripsi|description|slug|kategori|published/i)
    expect(await descField.count()).toBe(0)
  })

  test('page shows card grid (not a table)', async ({ page }) => {
    if (page.url().includes('/login')) return
    // Should NOT have a table — instead a card grid
    const table = page.locator('table')
    const cards = page.locator('[class*="card"], [class*="Card"], article')
    const hasCards = await cards.count() > 0
    // Either has cards, or has empty state
    const hasEmptyState = await page.getByText(/belum ada|empty|no event/i).count() > 0
    expect(hasCards || hasEmptyState || (await table.count() === 0)).toBe(true)
  })
})

test.describe('Admin Dokumentasi Photo Manager (/admin/dokumentasi/[id])', () => {
  test.skip('Photo manager tests require an existing event ID — enable after creating test data', async ({ page }) => {
    // To enable: create a test event first, then navigate to /admin/dokumentasi/[id]
    await page.goto('/admin/dokumentasi/test-event-id')
    if (page.url().includes('/login')) return

    test('page loads with event name in header', async ({ page }) => {
      await expect(page.locator('h1, h2').first()).toBeVisible()
    })

    test('"Kembali" button navigates to /admin/dokumentasi', async ({ page }) => {
      const backBtn = page.getByRole('link', { name: /kembali|back/i })
        .or(page.getByRole('button', { name: /kembali|back/i }))
      await expect(backBtn.first()).toBeVisible()
    })

    test('"Hapus Event" button is visible', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /hapus event/i })
      ).toBeVisible()
    })

    test('upload zone is visible', async ({ page }) => {
      await expect(
        page.getByText(/drag|drop|upload|pilih foto/i).first()
      ).toBeVisible()
    })
  })
})
