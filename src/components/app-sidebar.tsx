import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboardIcon, UsersIcon } from 'lucide-react'
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

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const { session, isAdmin } = useSession()
  const items = [
    { title: 'O meu projeto', url: '/painel', icon: <LayoutDashboardIcon /> },
    ...(isAdmin ? [{ title: 'Clientes (admin)', url: '/admin', icon: <UsersIcon /> }] : []),
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
                  <SidebarMenuButton isActive={pathname === item.url} tooltip={item.title} render={<Link to={item.url} />}>
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser email={session?.user.email ?? ''} />
      </SidebarFooter>
    </Sidebar>
  )
}
