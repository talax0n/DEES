import { test, expect } from '@playwright/test'

test.describe('Admin Jadwal CRUD (/admin/jadwal)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/jadwal')
  })

  test('page loads or redirects to login', async ({ page }) => {
    const url = page.url()
    expect(url).toMatch(/\/admin\/jadwal|\/admin\/login/)
  })

  test('page has Jadwal heading', async ({ page }) => {
    if (page.url().includes('/login')) return
    await expect(page.getByText(/Jadwal/i).first()).toBeVisible()
  })

  test('"Tambah Jadwal" button is visible', async ({ page }) => {
    if (page.url().includes('/login')) return
    const addBtn = page.getByRole('button', { name: /tambah jadwal/i })
    await expect(addBtn.first()).toBeVisible()
  })

  test('clicking "Tambah Jadwal" opens a dialog or form', async ({ page }) => {
    if (page.url().includes('/login')) return
    const addBtn = page.getByRole('button', { name: /tambah jadwal/i }).first()
    await addBtn.click()
    // A dialog/modal should appear
    const dialog = page.getByRole('dialog')
      .or(page.locator('[role="dialog"]'))
      .or(page.locator('[class*="dialog"], [class*="modal"]'))
    await expect(dialog.first()).toBeVisible()
  })

  test('dialog has Jenis Ibadah field', async ({ page }) => {
    if (page.url().includes('/login')) return
    await page.getByRole('button', { name: /tambah jadwal/i }).first().click()
    const field = page.getByLabel(/jenis ibadah|nama ibadah/i)
      .or(page.getByPlaceholder(/jenis ibadah|nama ibadah/i))
    await expect(field.first()).toBeVisible()
  })

  test('dialog has Metode select', async ({ page }) => {
    if (page.url().includes('/login')) return
    await page.getByRole('button', { name: /tambah jadwal/i }).first().click()
    // Metode can be a select, combobox, or radio group
    const metodeField = page.getByLabel(/metode/i)
      .or(page.getByRole('combobox', { name: /metode/i }))
      .or(page.getByText(/offline|online|hybrid/i).first())
    await expect(metodeField.first()).toBeVisible()
  })

  test('"Batal" button in dialog closes it', async ({ page }) => {
    if (page.url().includes('/login')) return
    await page.getByRole('button', { name: /tambah jadwal/i }).first().click()
    const dialog = page.getByRole('dialog').first()
    await expect(dialog).toBeVisible()
    const batalBtn = page.getByRole('button', { name: /batal|cancel/i })
    if (await batalBtn.count() > 0) {
      await batalBtn.first().click()
      await expect(dialog).not.toBeVisible()
    }
  })

  test('table shows existing data columns', async ({ page }) => {
    if (page.url().includes('/login')) return
    // Check for table or data display
    const table = page.locator('table, [role="table"]')
    if (await table.count() > 0) {
      await expect(table.first()).toBeVisible()
    } else {
      // Could be a card/list layout
      await expect(page.getByText(/Ibadah|Metode|Waktu/i).first()).toBeVisible()
    }
  })
})
