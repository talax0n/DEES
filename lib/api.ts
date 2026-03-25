import { toast } from "sonner"

export async function fetchApi(url: string, options?: RequestInit) {
  const res = await fetch(url, options)
  if (res.status === 401) {
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  if (res.status === 403) {
    toast.error("Anda tidak memiliki akses untuk tindakan ini")
    throw new Error('Forbidden')
  }
  return res.json()
}
