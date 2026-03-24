import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/db', () => ({
  db: {
    unduhan: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ user: { id: '1', role: 'EDITOR' }, response: null }),
  requireAdmin: vi.fn().mockResolvedValue({ user: { id: '1', role: 'ADMIN' }, response: null }),
}))

vi.mock('@/lib/storage', () => ({
  deleteFile: vi.fn().mockResolvedValue(undefined),
  getPathFromUrl: vi.fn().mockReturnValue('documents/some-file.pdf'),
}))

const mockRecord = {
  id: 'cuid-1',
  judul: 'Tata Ibadah Minggu',
  tipe: 'TAIB',
  tanggal: new Date('2025-03-16'),
  fileUrl: 'https://example.com/file.pdf',
  fileSize: 1024,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const makeGet = (url: string) =>
  new NextRequest(url, { method: 'GET' })

const makePost = (body: unknown) =>
  new NextRequest('http://localhost:3000/api/unduhan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

// ---------------------------------------------------------------------------
// GET /api/unduhan
// ---------------------------------------------------------------------------
describe('GET /api/unduhan', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with data array', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.unduhan.findMany).mockResolvedValue([mockRecord])

    const { GET } = await import('@/app/api/unduhan/route')
    const req = makeGet('http://localhost:3000/api/unduhan')
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)
  })

  it('passes tipe=TAIB filter to db query', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.unduhan.findMany).mockResolvedValue([mockRecord])

    const { GET } = await import('@/app/api/unduhan/route')
    const req = makeGet('http://localhost:3000/api/unduhan?tipe=TAIB')
    await GET(req)

    expect(db.unduhan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tipe: 'TAIB' } })
    )
  })

  it('passes tipe=WARTA filter to db query', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.unduhan.findMany).mockResolvedValue([])

    const { GET } = await import('@/app/api/unduhan/route')
    const req = makeGet('http://localhost:3000/api/unduhan?tipe=WARTA')
    await GET(req)

    expect(db.unduhan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tipe: 'WARTA' } })
    )
  })

  it('does not filter when no tipe param', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.unduhan.findMany).mockResolvedValue([mockRecord])

    const { GET } = await import('@/app/api/unduhan/route')
    const req = makeGet('http://localhost:3000/api/unduhan')
    await GET(req)

    expect(db.unduhan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined })
    )
  })
})

// ---------------------------------------------------------------------------
// POST /api/unduhan
// ---------------------------------------------------------------------------
describe('POST /api/unduhan', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 201 on valid input with fileUrl', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.unduhan.create).mockResolvedValue(mockRecord)

    const { POST } = await import('@/app/api/unduhan/route')
    const req = makePost({
      judul: 'Tata Ibadah',
      tipe: 'TAIB',
      tanggal: '2025-03-16',
      fileUrl: 'https://example.com/file.pdf',
    })
    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.success).toBe(true)
  })

  it('returns 400 when fileUrl is missing', async () => {
    const { POST } = await import('@/app/api/unduhan/route')
    const req = makePost({
      judul: 'Tata Ibadah',
      tipe: 'TAIB',
      tanggal: '2025-03-16',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('returns 400 on invalid tipe', async () => {
    const { POST } = await import('@/app/api/unduhan/route')
    const req = makePost({
      judul: 'Judul',
      tipe: 'INVALID',
      tanggal: '2025-03-16',
      fileUrl: 'https://example.com/file.pdf',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/unduhan/[id]
// ---------------------------------------------------------------------------
describe('DELETE /api/unduhan/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with success message', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.unduhan.findUnique).mockResolvedValue(mockRecord)
    vi.mocked(db.unduhan.delete).mockResolvedValue(mockRecord)

    const { DELETE } = await import('@/app/api/unduhan/[id]/route')
    const req = new NextRequest('http://localhost:3000/api/unduhan/cuid-1', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'cuid-1' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.message).toContain('berhasil dihapus')
  })

  it('returns 404 when record not found', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.unduhan.findUnique).mockResolvedValue(null)

    const { DELETE } = await import('@/app/api/unduhan/[id]/route')
    const req = new NextRequest('http://localhost:3000/api/unduhan/nonexistent', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'nonexistent' }) })
    expect(res.status).toBe(404)
  })
})
