import { useCallback, useEffect, useState } from 'react'
import type { OrderRow, ReviewRow, Row } from '@/components/admin/parts'
import { supabase } from '@/lib/supabase'
import type { Briefing, ProjectUpdate } from '@/lib/stages'

export type ActivityRow = ProjectUpdate & { projects: { profiles: { email: string } | null } | null }

// Everything the admin screens need, loaded together and refreshed after any change.
export function useAdminData() {
  const [rows, setRows] = useState<Row[]>([])
  const [briefings, setBriefings] = useState<Record<string, Briefing>>({})
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [activity, setActivity] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [p, b, o, r, a] = await Promise.all([
      supabase.from('projects').select('*, profiles(email, subscription_status, current_period_end)').order('created_at', { ascending: false }),
      supabase.from('briefings').select('*'),
      supabase.from('orders').select('*, profiles(email)').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*, profiles(email)').order('created_at', { ascending: false }),
      supabase.from('project_updates').select('*, projects(profiles(email))').order('created_at', { ascending: false }).limit(8),
    ])
    setRows((p.data as Row[]) ?? [])
    setBriefings(Object.fromEntries(((b.data as Briefing[]) ?? []).map((x) => [x.project_id, x])))
    setOrders((o.data as OrderRow[]) ?? [])
    setReviews((r.data as ReviewRow[]) ?? [])
    setActivity((a.data as unknown as ActivityRow[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const ch = supabase
      .channel('admin-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, load)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [load])

  return { rows, briefings, orders, reviews, activity, loading, reload: load }
}
