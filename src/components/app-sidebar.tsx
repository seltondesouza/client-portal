import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FileTextIcon, InboxIcon, LayoutDashboardIcon, LifeBuoyIcon, SparklesIcon, StarIcon, UsersIcon } from 'lucide-react'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useSession } from '@/hooks/useSession'
import { CONTACT_EMAIL } from '@/lib/site'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const { session, isAdmin } = useSession()
  const items = isAdmin
    ? [
        { title: 'Visão geral', url: '/admin', icon: <LayoutDashboardIcon /> },
        { title: 'Clientes', url: '/admin/clientes', icon: <UsersIcon /> },
        { title: 'Pedidos', url: '/admin/pedidos', icon: <InboxIcon /> },
        { title: 'Reviews', url: '/admin/reviews', icon: <StarIcon /> },
      ]
    : [
        { title: 'O meu projeto', url: '/painel', icon: <LayoutDashboardIcon /> },
        { title: 'Serviços e domínio', url: '/servicos', icon: <SparklesIcon /> },
        { title: 'Briefing', url: '/briefing', icon: <FileTextIcon /> },
      ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link to="/" />}>
              <span className="text-base font-semibold">Selton de Souza</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton isActive={item.url === '/admin' || item.url === '/painel' ? pathname === item.url : pathname.startsWith(item.url)} tooltip={item.title} render={<Link to={item.url} />}>
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {!isAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Ajuda" render={<a href={`mailto:${CONTACT_EMAIL}`} />}>
                    <LifeBuoyIcon />
                    <span>Ajuda</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser email={session?.user.email ?? ''} />
      </SidebarFooter>
    </Sidebar>
  )
}
