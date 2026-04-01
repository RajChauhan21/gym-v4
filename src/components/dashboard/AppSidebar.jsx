import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Package,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

import { LogOut, UserPen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronsUpDown, Dumbbell } from "lucide-react";
import { useProfile } from "../../contexts/ProfileContext";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Members", url: "/members", icon: Users },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Plans", url: "/plans", icon: Package },
  { title: "Settings", url: "/settings", icon: Settings },
];

const getInitials = (name) => {
  if (!name) return "GY";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export function AppSidebar() {
  const location = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();
  const { profile } = useProfile();
  const handleMobileClose = () => {
    if (isMobile) {
      setOpenMobile(false); // ✅ Closes the mobile sidebar
    }
  };

  const { logout } = useAuth();


  return (
    <Sidebar variant="inset" collapsible="icon" className="md:w-60 w-[240px]">
      <SidebarHeader className="h-13 border-b flex justify-center px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent">
              {/* Company Logo Container */}
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {/* <Dumbbell className="size-5" /> */}
                <img src={profile.gymLogo} alt="Logo" className="rounded-sm" />
              </div>

              {/* Company Name & Tagline */}
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold text-sidebar-foreground">
                  {profile.gymName}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  Fitness Data manager
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url} onClick={() => setOpenMobile(false)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              {/* The Trigger remains the same */}
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={profile.ownerLogo} alt="Rahul" referrerPolicy={profile.ownerLogo?.includes("google") ? "no-referrer" : "strict-origin-when-cross-origin"} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {getInitials(profile.owner)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">{profile.owner}</span>
                    <span className="truncate text-xs opacity-60">Admin Area</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              {/* 🔥 THE FIX: Wrap the content in DropdownMenuPortal */}
              <DropdownMenuPortal>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg z-50"
                  side="top"
                  align="end"
                  sideOffset={8} // Slightly more gap to clear the sidebar edge
                >

                  {/* Edit Profile Link */}
                  <DropdownMenuItem asChild className="cursor-pointer" onSelect={() => handleMobileClose()}>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 w-full"
                    // onClick={handleMobileClose}
                    >
                      <UserPen className="size-4" />
                      <span>Edit Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Logout Button */}
                  <DropdownMenuItem onSelect={(e) => {
                    e.preventDefault(); // Prevents the menu from closing before logic runs if needed
                    logout();
                    handleMobileClose();
                  }} className="text-red-500 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950">
                    <LogOut className="size-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Important: This adds the resize/collapse handle */}
      <SidebarRail />
    </Sidebar>
  );
}
