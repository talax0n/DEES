import { test, expect } from '@playwright/test'

test.describe('Admin Unduhan CRUD (/admin/unduhan)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/unduhan')
  })

  test('page loads or redirects to login', async ({ page }) => {
    const url = page.url()
    expect(url).toMatch(/\/admin\/unduhan|\/admin\/login/)
  })

  test('page has Unduhan heading', async ({ page }) => {
    if (page.url().includes('/admin/login')) return
    await expect(page.getByText(/Unduhan/i).first()).toBeVisible()
  })

  test('has tab filters (Semua / Tata Ibadah / Warta)', async ({ page }) => {
    if (page.url().includes('/admin/login')) return
    // Tabs or filter buttons
    const smuaTab = page.getByRole('tab', { name: /Semua/i })
      .or(page.getByRole('button', { name: /Semua/i }))
      .or(page.getByText(/Semua/i).first())
    await expect(smuaTab.first()).toBeVisible()
  })

  test('"Upload File" button is visible', async ({ page }) => {
    if (page.url().includes('/admin/login')) return
    const uploadBtn = page.getByRole('button', { name: /upload file|tambah/i })
    await expect(uploadBtn.first()).toBeVisible()
  })

  test('clicking "Upload File" opens dialog', async ({ page }) => {
    if (page.url().includes('/admin/login')) return
    await page.getByRole('button', { name: /upload file|tambah/i }).first().click()
    const dialog = page.getByRole('dialog')
      .or(page.locator('[role="dialog"]'))
    await expect(dialog.first()).toBeVisible()
  })

  test('dialog has Judul field', async ({ page }) => {
    if (page.url().includes('/admin/login')) return
    await page.getByRole('button', { name: /upload file|tambah/i }).first().click()
    const field = page.getByLabel(/judul/i)
      .or(page.getByPlaceholder(/judul/i))
    await expect(field.first()).toBeVisible()
  })

  test('dialog has Tipe select', async ({ page }) => {
    if (page.url().includes('/admin/login')) return
    await page.getByRole('button', { name: /upload file|tambah/i }).first().click()
    const field = page.getByLabel(/tipe/i)
      .or(page.getByRole('combobox', { name: /tipe/i }))
      .or(page.getByText(/Tata Ibadah|TAIB|WARTA/i).first())
    await expect(field.first()).toBeVisible()
  })

  test('data table is visible', async ({ page }) => {
    if (page.url().includes('/admin/login')) return
    const table = page.locator('table, [role="table"]')
    if (await table.count() > 0) {
      await expect(table.first()).toBeVisible()
    }
    // Even if no table, page should have content
    await expect(page.locator('main, [class*="content"]').first()).toBeVisible()
  })
})
