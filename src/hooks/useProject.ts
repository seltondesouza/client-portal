import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { LiveStatus } from '@/components/LiveIndicator'
import type { Briefing, Profile, Project, ProjectUpdate } from '@/lib/stages'

// Loads the signed-in client's profile, project and updates, and refetches live
// whenever Supabase Realtime reports a change (RLS limits events to their own rows).
export function useProject(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [updates, setUpdates] = useState<ProjectUpdate[]>([])
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [loading, setLoading] = useState(true)
  // Realtime state: channel status, time of the last change we received, and updates that arrived during this visit.
  const [status, setStatus] = useState<LiveStatus>('connecting')
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set())
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const load = useCallback(async () => {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    const { data: pr } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setProfile(p)
    setProject(pr)
    if (pr) {
      const { data: u } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', pr.id)
        .order('created_at', { ascending: false })
      setUpdates(u ?? [])
      const { data: b } = await supabase.from('briefings').select('*').eq('project_id', pr.id).maybeSingle()
      setBriefing(b)
    }
    setUpdatedAt(Date.now())
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('client-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, load)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_updates' }, (payload) => {
        const id = (payload.new as { id?: string }).id
        if (id) {
          setFreshIds((prev) => new Set(prev).add(id))
          // The "Novo" highlight fades after ~10 s.
          timers.current.push(
            setTimeout(() => setFreshIds((prev) => { const n = new Set(prev); n.delete(id); return n }), 10000),
          )
        }
        toast('Nova atualização no seu projeto')
        load()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'briefings' }, load)
      .subscribe((s) => setStatus(s === 'SUBSCRIBED' ? 'live' : s === 'CLOSED' ? 'offline' : 'connecting'))
    const pending = timers.current
    return () => {
      pending.forEach(clearTimeout)
      supabase.removeChannel(channel)
    }
  }, [load])

  return { profile, project, updates, briefing, loading, status, updatedAt, freshIds }
}
