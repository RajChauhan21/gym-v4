"use client"

import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"
import { useSidebar } from "@/components/ui/sidebar"
export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { isMobile, setOpenMobile } = useSidebar()
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            // 🔥 FIX: Extract Icon as a Capitalized Component
            const Icon = item.icon

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild size="sm">
                  <Link to={item.url} onClick={() => {
                    if (isMobile) setOpenMobile(false)
                  }}>
                    {/* 🔥 FIX: Render as <Icon /> tag */}
                    {Icon && <Icon className="size-4!" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
