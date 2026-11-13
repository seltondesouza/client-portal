// Password helpers: a simple strength score and a secure generator (browser crypto, never sent anywhere).
const COMMON = ['password', 'palavra', 'passe', '12345678', '123456789', 'qwerty', 'abcdefgh', 'iloveyou', 'admin', 'letmein', 'benfica', 'sporting', 'portugal']

export type Strength = { score: 0 | 1 | 2 | 3 | 4; label: string; tips: string[] }

export function strength(pw: string): Strength {
  const tips: string[] = []
  if (!pw) return { score: 0, label: '', tips }
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length
  const lower = pw.toLowerCase()
  let pts = 0
  if (pw.length >= 8) pts++
  if (pw.length >= 12) pts++
  if (pw.length >= 16) pts++
  if (classes >= 3) pts++
  if (COMMON.some((c) => lower.includes(c)) || /^(.)\1+$/.test(pw) || /(0123|1234|2345|abcd|qwer)/i.test(pw)) pts = Math.min(pts, 1)
  if (pw.length < 8) tips.push('Use pelo menos 8 caracteres (ideal: 12 ou mais)')
  else if (pw.length < 12) tips.push('Quanto mais longa, mais segura: tente 12 ou mais')
  if (classes < 3) tips.push('Misture maiúsculas, minúsculas, números e símbolos')
  if (pts <= 1 && pw.length >= 8) tips.push('Evite palavras comuns e sequências como 1234')
  const score = Math.max(0, Math.min(4, pts)) as Strength['score']
  return { score, label: ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'][score], tips }
}

// 16 characters from an alphabet without look-alikes (no l/1/I, O/0). Always includes every class.
export function generatePassword(length = 16): string {
  const sets = ['abcdefghjkmnpqrstuvwxyz', 'ABCDEFGHJKLMNPQRSTUVWXYZ', '23456789', '!@#$%&*?+-=']
  const all = sets.join('')
  const rand = (n: number) => {
    const max = Math.floor(0x100000000 / n) * n // avoid modulo bias
    const buf = new Uint32Array(1)
    do crypto.getRandomValues(buf)
    while (buf[0] >= max)
    return buf[0] % n
  }
  const chars = sets.map((s) => s[rand(s.length)])
  while (chars.length < length) chars.push(all[rand(all.length)])
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}
