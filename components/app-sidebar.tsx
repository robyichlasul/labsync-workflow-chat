"use client"

import * as React from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import {
  MessageCircle,
  Bot,
  Users,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  Search,
  BarChart3,
  Shield,
  Upload,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const labsyncNavData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: MessageCircle,
    },
    {
      title: "AI Assistant",
      url: "/dashboard/ai-chat",
      icon: Bot,
    },
    {
      title: "Status Updates",
      url: "/dashboard/status",
      icon: Users,
    },
    {
      title: "Jadwal Lab",
      url: "/dashboard/schedule",
      icon: Calendar,
    },
    {
      title: "File Sharing",
      url: "/dashboard/files",
      icon: Upload,
    },
    {
      title: "Manajemen User",
      url: "/dashboard/users",
      icon: Shield,
      items: [
        {
          title: "Daftar User",
          url: "/dashboard/users",
        },
        {
          title: "Role Management",
          url: "/dashboard/users/roles",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
    {
      title: "Help",
      url: "/dashboard/help",
      icon: HelpCircle,
    },
    {
      title: "Search",
      url: "/dashboard/search",
      icon: Search,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()

  const userData = user ? {
    name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.emailAddresses[0]?.emailAddress || "User",
    email: user.emailAddresses[0]?.emailAddress || "",
    avatar: user.imageUrl,
  } : {
    name: "Guest",
    email: "guest@example.com",
    avatar: undefined,
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-base font-semibold">Labsync</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={labsyncNavData.navMain} />
        <NavSecondary items={labsyncNavData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
