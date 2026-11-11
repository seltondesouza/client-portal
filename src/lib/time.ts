// "agora mesmo", "há 12 s", "há 3 min", "há 2 h", then a short pt-PT date.
const dateTimeFmt = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeStyle: 'short' })

export function relTime(at: number | string | Date, now: number): string {
  const t = new Date(at).getTime()
  const s = Math.max(0, Math.round((now - t) / 1000))
  if (s < 5) return 'agora mesmo'
  if (s < 60) return `há ${s} s`
  const m = Math.round(s / 60)
  if (m < 60) return `há ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `há ${h} h`
  return dateTimeFmt.format(t)
}
