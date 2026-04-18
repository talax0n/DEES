import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Mocks — must be hoisted before any imports that use them
// ---------------------------------------------------------------------------
vi.mock('@/lib/db', () => ({
  db: {
    jadwalIbadah: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ user: { id: '1', role: 'EDITOR' }, response: null }),
  requireAdmin: vi.fn().mockResolvedValue({ user: { id: '1', role: 'ADMIN' }, response: null }),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeRequest = (body?: unknown, method = 'GET') =>
  new NextRequest('http://localhost:3000/api/jadwal', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

const validJadwal = {
  namaIbadah: 'Ibadah Minggu',
  hari: 'Minggu',
  waktu: '09:00',
  lokasi: 'Gedung Gereja',
  metode: 'offline',
}

const mockRecord = { id: 'cuid-1', ...validJadwal, linkStreaming: null, isActive: true, createdAt: new Date(), updatedAt: new Date() }

// ---------------------------------------------------------------------------
// GET /api/jadwal
// ---------------------------------------------------------------------------
describe('GET /api/jadwal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with data array', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.jadwalIbadah.findMany).mockResolvedValue([mockRecord])

    const { GET } = await import('@/app/api/jadwal/route')
    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
  })

  it('response has { success, data } shape', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.jadwalIbadah.findMany).mockResolvedValue([mockRecord])

    const { GET } = await import('@/app/api/jadwal/route')
    const res = await GET()
    const json = await res.json()

    expect(json).toHaveProperty('success')
    expect(json).toHaveProperty('data')
  })

  it('returns 500 when db throws', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.jadwalIbadah.findMany).mockRejectedValue(new Error('DB error'))

    const { GET } = await import('@/app/api/jadwal/route')
    const res = await GET()
    expect(res.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
// POST /api/jadwal
// ---------------------------------------------------------------------------
describe('POST /api/jadwal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 201 with created item on valid input', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.jadwalIbadah.create).mockResolvedValue(mockRecord)

    const { POST } = await import('@/app/api/jadwal/route')
    const req = makeRequest(validJadwal, 'POST')
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.success).toBe(true)
    expect(json.data).toBeDefined()
  })

  it('returns 400 on invalid input (empty namaIbadah)', async () => {
    const { POST } = await import('@/app/api/jadwal/route')
    const req = makeRequest({ ...validJadwal, namaIbadah: '' }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('returns 400 on invalid metode', async () => {
    const { POST } = await import('@/app/api/jadwal/route')
    const req = makeRequest({ ...validJadwal, metode: 'invalid' }, 'POST')
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// PUT /api/jadwal/[id]
// ---------------------------------------------------------------------------
describe('PUT /api/jadwal/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with updated item on valid input', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.jadwalIbadah.update).mockResolvedValue({ ...mockRecord, namaIbadah: 'Updated' })

    const { PUT } = await import('@/app/api/jadwal/[id]/route')
    const req = new NextRequest('http://localhost:3000/api/jadwal/cuid-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validJadwal, namaIbadah: 'Updated' }),
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'cuid-1' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('returns 400 on invalid body', async () => {
    const { PUT } = await import('@/app/api/jadwal/[id]/route')
    const req = new NextRequest('http://localhost:3000/api/jadwal/cuid-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validJadwal, namaIbadah: '' }),
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'cuid-1' }) })
    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/jadwal/[id]
// ---------------------------------------------------------------------------
describe('DELETE /api/jadwal/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with success message', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.jadwalIbadah.delete).mockResolvedValue(mockRecord)

    const { DELETE } = await import('@/app/api/jadwal/[id]/route')
    const req = new NextRequest('http://localhost:3000/api/jadwal/cuid-1', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'cuid-1' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.message).toContain('berhasil dihapus')
  })
})
