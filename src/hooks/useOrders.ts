import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/services'

// The signed-in client's extra-service orders, live.
export function useOrders(userId: string) {
  const [orders, setOrders] = useState<Order[]>([])
  useEffect(() => {
    const load = () =>
      supabase.from('orders').select('*').eq('client_id', userId).order('created_at', { ascending: false })
        .then(({ data }) => setOrders((data as Order[]) ?? []))
    load()
    const ch = supabase.channel('client-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [userId])
  return orders
}
