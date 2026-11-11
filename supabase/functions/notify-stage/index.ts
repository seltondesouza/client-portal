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

// Admin only: updates the project, logs the update (Realtime pushes it to the client) and emails the client.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const user = await getUser(req)
  if (!user || user.email?.toLowerCase() !== Deno.env.get('ADMIN_EMAIL')!.toLowerCase()) {
    return json({ error: 'forbidden' }, 403)
  }

  const { project_id, stage, note, preview_url, live_url } = await req.json()
  if (!STAGES[stage]) return json({ error: 'invalid stage' }, 400)
  // The last stage needs the final website address.
  if (stage === 'online' && !/^https?:\/\/\S+\.\S+/.test(live_url ?? '')) return json({ error: 'live_url required' }, 400)

  const { data: project, error } = await admin
    .from('projects')
    .update({ stage, preview_url: preview_url || null, ...(live_url ? { live_url } : {}) })
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
