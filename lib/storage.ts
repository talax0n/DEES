import { createServerSupabaseClient } from './supabase'

export async function uploadFile(
  bucket: 'documents' | 'images',
  path: string,
  file: File
): Promise<string> {
  const supabase = createServerSupabaseClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicUrl
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

/** Extract storage path from a Supabase public URL */
export function getPathFromUrl(url: string, bucket: string): string {
  const marker = `/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return url
  return decodeURIComponent(url.substring(idx + marker.length))
}
