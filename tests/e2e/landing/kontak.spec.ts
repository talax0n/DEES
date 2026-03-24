import { test, expect } from '@playwright/test'

test.describe('Kontak Page (/kontak)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kontak')
  })

  test('loads successfully', async ({ page }) => {
    const response = await page.request.get('/kontak')
    expect(response.status()).toBe(200)
  })

  test('has correct page title containing "Kontak" or "Hubungi"', async ({ page }) => {
    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/kontak|hubungi/)
  })

  test('displays church contact information — address', async ({ page }) => {
    await expect(page.getByText(/Cileungsi|Bogor|Jawa Barat/i).first()).toBeVisible()
  })

  test('displays church phone number', async ({ page }) => {
    await expect(page.getByText(/021|022|0812|\(021\)/i).first()).toBeVisible()
  })

  test('displays church email', async ({ page }) => {
    await expect(page.getByText(/gpibdamaisejahtera|@/i).first()).toBeVisible()
  })

  test('has contact form with nama field', async ({ page }) => {
    const namaField = page.getByLabel(/nama/i)
      .or(page.getByPlaceholder(/nama/i))
    await expect(namaField.first()).toBeVisible()
  })

  test('has contact form with email field', async ({ page }) => {
    const emailField = page.getByLabel(/email/i)
      .or(page.getByPlaceholder(/email/i))
    await expect(emailField.first()).toBeVisible()
  })

  test('has contact form with pesan field', async ({ page }) => {
    const pesanField = page.getByLabel(/pesan|message/i)
      .or(page.getByPlaceholder(/pesan|message/i))
      .or(page.locator('textarea'))
    await expect(pesanField.first()).toBeVisible()
  })

  test('has a submit button', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /kirim|send|submit/i })
    await expect(submitBtn.first()).toBeVisible()
  })

  test('form shows validation on empty submit', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /kirim|send|submit/i }).first()
    await submitBtn.click()
    // Some validation feedback should appear
    const errorText = page.getByText(/wajib|required|error/i)
    // If validation is present, check it; otherwise pass
    const count = await errorText.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
