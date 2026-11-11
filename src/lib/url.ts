// Accepts "www.exemplo.pt" or "https://www.exemplo.pt" and returns a clean https/http address, or null if it isn't valid.
export function normalizeUrl(input: string | null | undefined): string | null {
  const v = (input ?? '').trim()
  if (!v) return null
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`)
    if (!/^https?:$/.test(u.protocol) || !/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(u.hostname) || /\s/.test(v)) return null
    return u.toString()
  } catch {
    return null
  }
}
