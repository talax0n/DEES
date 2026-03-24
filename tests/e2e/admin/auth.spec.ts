import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Auth & RBAC tests — skip until Phase 5 (Supabase Auth + RBAC) is complete
// ---------------------------------------------------------------------------

test.describe.skip('Auth — enable after Phase 5 (Supabase Auth + RBAC)', () => {
  // Helper credentials (set via env vars in real test runs)
  const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? 'admin@test.com'
  const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'password'
  const EDITOR_EMAIL = process.env.TEST_EDITOR_EMAIL ?? 'editor@test.com'
  const EDITOR_PASSWORD = process.env.TEST_EDITOR_PASSWORD ?? 'password'

  async function loginAs(page: any, email: string, password: string) {
    await page.goto('/admin/login')
    await page.getByLabel(/email/i).fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: /masuk/i }).click()
    await page.waitForURL(/\/admin(?!\/login)/)
  }

  test.describe('Authentication Flow', () => {
    test('/admin redirects to /admin/login when not logged in', async ({ page }) => {
      await page.goto('/admin')
      await expect(page).toHaveURL(/\/admin\/login/)
    })

    test('/admin/jadwal redirects to /admin/login when not logged in', async ({ page }) => {
      await page.goto('/admin/jadwal')
      await expect(page).toHaveURL(/\/admin\/login/)
    })

    test('login with wrong credentials shows error', async ({ page }) => {
      await page.goto('/admin/login')
      await page.getByLabel(/email/i).fill('wrong@wrong.com')
      await page.locator('input[type="password"]').fill('wrongpassword')
      await page.getByRole('button', { name: /masuk/i }).click()
      // Should show error toast or inline error
      await expect(page.getByText(/gagal|invalid|salah|error/i)).toBeVisible()
    })

    test('login page has NO registration link or button', async ({ page }) => {
      await page.goto('/admin/login')
      const signupEls = page.getByRole('link', { name: /daftar|register|sign up/i })
        .or(page.getByRole('button', { name: /daftar|register/i }))
      expect(await signupEls.count()).toBe(0)
    })

    test('successful login redirects to /admin dashboard', async ({ page }) => {
      await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await expect(page).toHaveURL(/\/admin(?!\/login)/)
    })

    test('sidebar shows user email after login', async ({ page }) => {
      await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await expect(page.getByText(ADMIN_EMAIL)).toBeVisible()
    })

    test('logout redirects to /admin/login', async ({ page }) => {
      await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      const logoutBtn = page.getByRole('button', { name: /keluar|logout|sign out/i })
      await logoutBtn.click()
      await expect(page).toHaveURL(/\/admin\/login/)
    })

    test('after logout, /admin redirects to login', async ({ page }) => {
      await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD)
      await page.getByRole('button', { name: /keluar|logout/i }).click()
      await page.goto('/admin')
      await expect(page).toHaveURL(/\/admin\/login/)
    })
  })

  test.describe('RBAC — ADMIN role', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD)
    })

    test('ADMIN sees delete buttons on jadwal page', async ({ page }) => {
      await page.goto('/admin/jadwal')
      await expect(page.getByRole('button', { name: /hapus/i }).first()).toBeVisible()
    })

    test('ADMIN sees delete buttons on unduhan page', async ({ page }) => {
      await page.goto('/admin/unduhan')
      await expect(page.getByRole('button', { name: /hapus/i }).first()).toBeVisible()
    })

    test('ADMIN sees "Pengguna" nav item in sidebar', async ({ page }) => {
      await expect(page.getByText(/Pengguna|Users/i).first()).toBeVisible()
    })

    test('ADMIN can access /admin/users page', async ({ page }) => {
      await page.goto('/admin/users')
      await expect(page).toHaveURL(/\/admin\/users/)
      await expect(page.locator('main')).toBeVisible()
    })
  })

  test.describe('RBAC — EDITOR role', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, EDITOR_EMAIL, EDITOR_PASSWORD)
    })

    test('EDITOR does NOT see delete buttons on jadwal page', async ({ page }) => {
      await page.goto('/admin/jadwal')
      const deleteBtn = page.getByRole('button', { name: /hapus/i })
      expect(await deleteBtn.count()).toBe(0)
    })

    test('EDITOR does NOT see delete buttons on unduhan page', async ({ page }) => {
      await page.goto('/admin/unduhan')
      const deleteBtn = page.getByRole('button', { name: /hapus/i })
      expect(await deleteBtn.count()).toBe(0)
    })

    test('EDITOR does NOT see "Pengguna" nav item', async ({ page }) => {
      const penggunaLink = page.getByText(/Pengguna|Users/i)
      expect(await penggunaLink.count()).toBe(0)
    })

    test('EDITOR can create jadwal', async ({ page }) => {
      await page.goto('/admin/jadwal')
      await expect(page.getByRole('button', { name: /tambah jadwal/i })).toBeVisible()
    })

    test('EDITOR can upload photos', async ({ page }) => {
      await page.goto('/admin/dokumentasi')
      await expect(page.getByRole('button', { name: /buat event/i })).toBeVisible()
    })
  })

  test.describe.skip('User Management (/admin/users) — enable after Phase 5', () => {
    test('page shows user list table', async ({ page }) => {
      await page.goto('/admin/users')
      const table = page.locator('table, [role="table"]')
      await expect(table.first()).toBeVisible()
    })

    test('"Tambah Pengguna" button opens form', async ({ page }) => {
      await page.goto('/admin/users')
      await page.getByRole('button', { name: /tambah pengguna/i }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
    })

    test('form has email, password, nama, role fields', async ({ page }) => {
      await page.goto('/admin/users')
      await page.getByRole('button', { name: /tambah pengguna/i }).click()
      const dialog = page.getByRole('dialog')
      await expect(dialog.getByLabel(/email/i)).toBeVisible()
      await expect(dialog.locator('input[type="password"]')).toBeVisible()
      await expect(dialog.getByLabel(/nama/i)).toBeVisible()
      await expect(dialog.getByLabel(/role/i)).toBeVisible()
    })
  })
})
