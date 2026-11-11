import { admin, cors, getUser, json } from '../_shared/common.ts'
import { sendEmail, templates } from '../_shared/email.ts'

const STAGES: Record<string, string> = {
  pagamento: 'Pagamento',
  briefing: 'Briefing',
  design: 'Design',
  desenvolvimento: 'Desenvolvimento',
  revisao: 'Revisão',
  online: 'Online',
}

// "www.exemplo.pt" or "https://www.exemplo.pt" -> a clean http(s) address, or null when invalid.
function normalizeUrl(input?: string | null): string | null {
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

// Admin only: updates the project, logs the update (Realtime pushes it to the client) and emails the client.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const user = await getUser(req)
  if (!user || user.email?.toLowerCase() !== Deno.env.get('ADMIN_EMAIL')!.toLowerCase()) {
    return json({ error: 'forbidden' }, 403)
  }

  const { project_id, stage, note, preview_url, live_url } = await req.json()
  if (!STAGES[stage]) return json({ error: 'invalid stage' }, 400)
  const preview = normalizeUrl(preview_url)
  const live = normalizeUrl(live_url)
  if (preview_url && !preview) return json({ error: 'invalid preview_url' }, 400)
  if (live_url && !live) return json({ error: 'invalid live_url' }, 400)
  // The last stage needs the final website address.
  if (stage === 'online' && !live) return json({ error: 'live_url required' }, 400)

  const { data: project, error } = await admin
    .from('projects')
    .update({ stage, preview_url: preview, ...(live ? { live_url: live } : {}) })
    .eq('id', project_id)
    .select('preview_url, live_url, profiles(email)')
    .single()
  if (error || !project) return json({ error: 'project not found' }, 404)

  await admin.from('project_updates').insert({ project_id, stage, note: note || null })

  // deno-lint-ignore no-explicit-any
  const to = (project as any).profiles?.email as string | undefined
  if (to) {
    await sendEmail(to, stage === 'online' ? templates.live(project.live_url) : templates.stage(STAGES[stage], note))
  }
  return json({ ok: true })
})
