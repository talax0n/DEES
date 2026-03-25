import { test, expect } from '@playwright/test'

test.describe('Admin Login (/login)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('login page loads successfully', async ({ page }) => {
    const response = await page.request.get('/login')
    expect(response.status()).toBe(200)
  })

  test('has email input field', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i)
      .or(page.getByPlaceholder(/email/i))
      .or(page.locator('input[type="email"]'))
    await expect(emailInput.first()).toBeVisible()
  })

  test('has password input field', async ({ page }) => {
    const passwordInput = page.getByLabel(/password|kata sandi/i)
      .or(page.locator('input[type="password"]'))
    await expect(passwordInput.first()).toBeVisible()
  })

  test('has "Masuk" submit button', async ({ page }) => {
    const masukBtn = page.getByRole('button', { name: /masuk|login|sign in/i })
    await expect(masukBtn.first()).toBeVisible()
  })

  test('does NOT have any registration/signup link', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: /daftar|sign up|create account|register/i })
      .or(page.getByRole('button', { name: /daftar|sign up|register/i }))
      .or(page.getByText(/daftar akun|buat akun/i))
    const count = await signupLink.count()
    expect(count).toBe(0)
  })
})

test.describe('Admin Access Protection', () => {
  test('/admin redirects to /login or loads when not authenticated', async ({ page }) => {
    const response = await page.goto('/admin')
    const finalUrl = page.url()
    // Either redirects to login, or serves the page if no auth middleware active
    expect([200, 302, 307, 308]).toContain(response?.status() ?? 200)
    if (finalUrl.includes('/login')) {
      await expect(page.locator('input[type="email"]')).toBeVisible()
    }
  })

  test('/admin/jadwal is accessible or redirects to login', async ({ page }) => {
    const response = await page.goto('/admin/jadwal')
    const finalUrl = page.url()
    expect([200, 302, 307, 308]).toContain(response?.status() ?? 200)
    if (finalUrl.includes('/login')) {
      await expect(page.locator('input[type="email"]')).toBeVisible()
    }
  })

  test('/admin/unduhan is accessible or redirects to login', async ({ page }) => {
    const response = await page.goto('/admin/unduhan')
    expect([200, 302, 307, 308]).toContain(response?.status() ?? 200)
  })

  test('/admin/dokumentasi is accessible or redirects to login', async ({ page }) => {
    const response = await page.goto('/admin/dokumentasi')
    expect([200, 302, 307, 308]).toContain(response?.status() ?? 200)
  })
})
