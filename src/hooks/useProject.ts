import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Profile, Project, ProjectUpdate } from '@/lib/stages'

// Loads the signed-in client's profile, project and updates, and refetches live
// whenever Supabase Realtime reports a change (RLS limits events to their own rows).
export function useProject(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [updates, setUpdates] = useState<ProjectUpdate[]>([])
  const [loading, setLoading] = useState(true)

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
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('client-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, load)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_updates' }, () => {
        toast('Nova atualização no seu projeto')
        load()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [load])

  return { profile, project, updates, loading }
}
