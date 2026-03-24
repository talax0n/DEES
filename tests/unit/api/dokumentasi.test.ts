import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({
  db: {
    dokumentasiEvent: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    dokumentasiPhoto: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ user: { id: '1', role: 'EDITOR' }, response: null }),
  requireAdmin: vi.fn().mockResolvedValue({ user: { id: '1', role: 'ADMIN' }, response: null }),
}))

vi.mock('@/lib/storage', () => ({
  deleteFile: vi.fn().mockResolvedValue(undefined),
  getPathFromUrl: vi.fn().mockReturnValue('images/kegiatan/some-file.jpg'),
  uploadFile: vi.fn().mockResolvedValue('https://example.com/images/photo.jpg'),
}))

const mockEvent = {
  id: 'event-1',
  namaAcara: 'Ibadah Natal 2025',
  tanggal: new Date('2025-12-25'),
  coverPhoto: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  photos: [],
  _count: { photos: 0 },
}

const mockPhoto = {
  id: 'photo-1',
  eventId: 'event-1',
  imageUrl: 'https://example.com/photo.jpg',
  caption: null,
  order: 0,
  createdAt: new Date(),
}

// ---------------------------------------------------------------------------
// GET /api/dokumentasi
// ---------------------------------------------------------------------------
describe('GET /api/dokumentasi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with data array', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.dokumentasiEvent.findMany).mockResolvedValue([mockEvent])

    const { GET } = await import('@/app/api/dokumentasi/route')
    const res = await GET()
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
  })

  it('maps _count.photos to totalFoto', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.dokumentasiEvent.findMany).mockResolvedValue([{ ...mockEvent, _count: { photos: 5 } }])

    const { GET } = await import('@/app/api/dokumentasi/route')
    const res = await GET()
    const json = await res.json()

    expect(json.data[0].totalFoto).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// POST /api/dokumentasi
// ---------------------------------------------------------------------------
describe('POST /api/dokumentasi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 201 on valid input', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.dokumentasiEvent.create).mockResolvedValue(mockEvent)

    const { POST } = await import('@/app/api/dokumentasi/route')
    const req = new NextRequest('http://localhost:3000/api/dokumentasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namaAcara: 'Natal', tanggal: '2025-12-25' }),
    })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.success).toBe(true)
  })

  it('returns 400 on empty namaAcara', async () => {
    const { POST } = await import('@/app/api/dokumentasi/route')
    const req = new NextRequest('http://localhost:3000/api/dokumentasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namaAcara: '', tanggal: '2025-12-25' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// GET /api/dokumentasi/[id]
// ---------------------------------------------------------------------------
describe('GET /api/dokumentasi/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns single event with photos', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.dokumentasiEvent.findUnique).mockResolvedValue({
      ...mockEvent,
      photos: [mockPhoto],
    })

    const { GET } = await import('@/app/api/dokumentasi/[id]/route')
    const req = new NextRequest('http://localhost:3000/api/dokumentasi/event-1')
    const res = await GET(req, { params: Promise.resolve({ id: 'event-1' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data.id).toBe('event-1')
  })

  it('returns 404 when event not found', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.dokumentasiEvent.findUnique).mockResolvedValue(null)

    const { GET } = await import('@/app/api/dokumentasi/[id]/route')
    const req = new NextRequest('http://localhost:3000/api/dokumentasi/nonexistent')
    const res = await GET(req, { params: Promise.resolve({ id: 'nonexistent' }) })
    expect(res.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/dokumentasi/[id]
// ---------------------------------------------------------------------------
describe('DELETE /api/dokumentasi/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with success message', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.dokumentasiEvent.findUnique).mockResolvedValue({ ...mockEvent, photos: [] })
    vi.mocked(db.dokumentasiEvent.delete).mockResolvedValue(mockEvent)

    const { DELETE } = await import('@/app/api/dokumentasi/[id]/route')
    const req = new NextRequest('http://localhost:3000/api/dokumentasi/event-1', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'event-1' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.message).toContain('berhasil dihapus')
  })

  it('returns 404 when event not found', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.dokumentasiEvent.findUnique).mockResolvedValue(null)

    const { DELETE } = await import('@/app/api/dokumentasi/[id]/route')
    const req = new NextRequest('http://localhost:3000/api/dokumentasi/nonexistent', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'nonexistent' }) })
    expect(res.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// GET /api/dokumentasi/[id]/photos
// ---------------------------------------------------------------------------
describe('GET /api/dokumentasi/[id]/photos', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns photos array (possibly empty)', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.dokumentasiPhoto.findMany).mockResolvedValue([mockPhoto])

    const { GET } = await import('@/app/api/dokumentasi/[id]/photos/route')
    const req = new NextRequest('http://localhost:3000/api/dokumentasi/event-1/photos')
    const res = await GET(req, { params: Promise.resolve({ id: 'event-1' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
  })

  it('returns empty array when no photos', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.dokumentasiPhoto.findMany).mockResolvedValue([])

    const { GET } = await import('@/app/api/dokumentasi/[id]/photos/route')
    const req = new NextRequest('http://localhost:3000/api/dokumentasi/event-1/photos')
    const res = await GET(req, { params: Promise.resolve({ id: 'event-1' }) })
    const json = await res.json()

    expect(json.data).toHaveLength(0)
  })
})
