import type { CSSProperties } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

// dashboard-01 shell: sidebar + header + content area.
export function AppLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{ '--sidebar-width': 'calc(var(--spacing) * 64)', '--header-height': 'calc(var(--spacing) * 12)' } as CSSProperties}
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 lg:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
