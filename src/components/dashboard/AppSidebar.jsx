import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Package,
  Currency,
  History,
  FileSpreadsheet,
  FileSpreadsheetIcon,
  Route,
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
import ExportReportDialog from "../../pages/ExportReportDialog";

import { LogOut, UserPen, LayoutTemplate } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronsUpDown, Dumbbell } from "lucide-react";
import { useProfile } from "../../contexts/ProfileContext";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { exportMembers, exportPayments } from "../../apis/backend_apis";
import { useEffect, useState } from "react";
import ExportSubscriptionData from "../../pages/ExportSubscriptionData";

export function AppSidebar() {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [openSubscription, setOpenSubscription] = useState(false);
  const [reportType, setReportType] = useState("members");

  const [exporting, setExporting] = useState(false);

  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      act: "overview",
    },
    {
      title: "Sources",
      url: "/sources",
      icon: Route,
      act: "overview",
    },
    { title: "Members", url: "/members", icon: Users, act: "members" },
    {
      title: "Invoice Templates",
      url: "/invoice-templates",
      icon: LayoutTemplate,
      act: "members",
    },
    { title: "Payments", url: "/payments", icon: CreditCard, act: "members" },
    { title: "Plans", url: "/plans", icon: Package, act: "members" },
    { title: "Settings", url: "/settings", icon: Settings, act: "Owner" },
    { title: "Pricing", url: "/pricing", icon: Currency, act: "Owner" },
    {
      title: "Billing History",
      url: "/paymentHistory",
      icon: History,
      act: "Owner",
    },
    {
      title: "Data Exports",
      icon: FileSpreadsheetIcon,
      act: "members",
    },
    {
      title: "Export Billing Reports",
      icon: FileSpreadsheetIcon,
      act: "Owner",
    },
  ];

  const getInitials = (name) => {
    if (!name) return "GY";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const location = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();
  const { profile } = useProfile();

  const handleMobileClose = () => {
    if (isMobile) {
      setOpenMobile(false); // ✅ Closes the mobile sidebar
    }
  };

  const handleExport = async (payload) => {
    const { reportType, filters } = payload;
    console.log(filters);
    setExporting(true);
    let res = null;
    try {
      if (reportType === "members") {
        res = await exportMembers(profile?.ownerId, filters);
      } else if (reportType === "payments") {
        res = await exportPayments(profile?.ownerId, filters);
      }

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const fileName = `${reportType === "members" ? "members" : "payments"}-report.xlsx`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);

      // IMPORTANT: do NOT trigger download here
      alert("Export failed: Unauthorized or session expired");
    } finally {
      setExporting(false);
    }
  };

  const { logout } = useAuth();
  useEffect(() => {
    console.log("exportDialogOpen changed:", exportDialogOpen);
  }, [exportDialogOpen]);

  return (
    <>
      <Sidebar variant="inset" collapsible="icon" className="md:w-60 w-[240px]">
        <SidebarHeader className="h-13 border-b flex justify-center px-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="hover:bg-transparent">
                {/* Company Logo Container */}
                <div className="aspect-square size-11 rounded-xl overflow-hidden bg-muted">
                  <img
                    src={profile.gymLogo}
                    alt="Heloo"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
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
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items
                  .filter((item) => item.act === "overview")
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                        className="transition-colors data-[active=true]:bg-black data-[active=true]:text-white dark:data-[active=true]:bg-white dark:data-[active=true]:text-black"
                      >
                        <Link
                          to={item.url}
                          onClick={() => {
                            console.log("Clicked Sources", performance.now());
                            setOpenMobile(false);
                          }}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
            <SidebarGroupLabel>Operations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items
                  .filter((item) => item.act === "members")
                  .map((item) => {
                    const isExport = item.title === "Data Exports";
                    const isPremiumLocked =
                      isExport && profile?.planName !== "Max Pro";

                    // FIXED: Fallback to regular item title if feature is NOT premium locked
                    const tooltipContent = isPremiumLocked
                      ? "Upgrade to Max Pro to unlock Data Exports"
                      : item.title;
                    return (
                      <SidebarMenuItem key={item.title}>
                        {isExport ? (
                          <span
                            title={isPremiumLocked ? tooltipContent : undefined}
                            className={
                              isPremiumLocked
                                ? "w-full block cursor-not-allowed"
                                : "w-full block"
                            }
                          >
                            <SidebarMenuButton
                              tooltip={tooltipContent}
                              disabled={isPremiumLocked}
                              onClick={() => {
                                if (isPremiumLocked) return;
                                handleMobileClose();
                                // setOpenSubscription(true);
                                setExportDialogOpen(true);
                              }}
                              /* FIXED pointer-events: forced pointer-events-auto so Shadcn/Radix tooltip can track mouse position */
                              className="w-full transition-colors pointer-events-auto data-[disabled=true]:opacity-50 data-[disabled=true]:hover:bg-transparent"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <item.icon
                                    className={
                                      isPremiumLocked
                                        ? "text-muted-foreground/70"
                                        : ""
                                    }
                                  />
                                  <span
                                    className={
                                      isPremiumLocked
                                        ? "text-muted-foreground/70"
                                        : ""
                                    }
                                  >
                                    {item.title}
                                  </span>
                                </div>
                                {isPremiumLocked && (
                                  <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500 text-black dark:bg-amber-400">
                                    Max Pro
                                  </span>
                                )}
                              </div>
                            </SidebarMenuButton>
                          </span>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            isActive={location.pathname === item.url}
                            tooltip={item.title}
                            className="transition-colors data-[active=true]:bg-black data-[active=true]:text-white dark:data-[active=true]:bg-white dark:data-[active=true]:text-black"
                          >
                            <Link
                              to={item.url}
                              onClick={() => setOpenMobile(false)}
                            >
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
            <SidebarGroupLabel>Accounts</SidebarGroupLabel>
            <SidebarGroupContent>
              {/* <SidebarMenu>
                {items
                  .filter((item) => item.act === "Owner")
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                        className="transition-colors data-[active=true]:bg-black data-[active=true]:text-white dark:data-[active=true]:bg-white dark:data-[active=true]:text-black"
                      >
                        <Link
                          to={item.url}
                          onClick={() => setOpenMobile(false)}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu> */}
              <SidebarMenu>
                {items
                  .filter((item) => item.act === "Owner")
                  .map((item) => {
                    const isExport = item.title === "Export Billing Reports";
                    const isPremiumLocked =
                      isExport && profile?.planName !== "Max Pro";

                    // FIXED: Fallback to regular item title if feature is NOT premium locked
                    const tooltipContent = isPremiumLocked
                      ? "Upgrade to Max Pro to unlock Data Exports"
                      : item.title;
                    return (
                      <SidebarMenuItem key={item.title}>
                        {isExport ? (
                          <span
                            title={isPremiumLocked ? tooltipContent : undefined}
                            className={
                              isPremiumLocked
                                ? "w-full block cursor-not-allowed"
                                : "w-full block"
                            }
                          >
                            <SidebarMenuButton
                              tooltip={tooltipContent}
                              disabled={isPremiumLocked}
                              onClick={() => {
                                if (isPremiumLocked) return;
                                handleMobileClose();
                                setOpenSubscription(true);
                              }}
                              className="w-full transition-colors pointer-events-auto data-[disabled=true]:opacity-50 data-[disabled=true]:hover:bg-transparent"
                            >
                              <div className="flex items-center justify-between w-full gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <item.icon
                                    className={`h-4 w-4 shrink-0 ${
                                      isPremiumLocked
                                        ? "text-muted-foreground/70"
                                        : ""
                                    }`}
                                  />

                                  <span
                                    className={`truncate ${
                                      isPremiumLocked
                                        ? "text-muted-foreground/70"
                                        : ""
                                    }`}
                                  >
                                    {item.title}
                                  </span>
                                </div>

                                {isPremiumLocked && (
                                  <span className="shrink-0 text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500 text-black dark:bg-amber-400">
                                    Max Pro
                                  </span>
                                )}
                              </div>
                            </SidebarMenuButton>
                          </span>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            isActive={location.pathname === item.url}
                            tooltip={item.title}
                            className="transition-colors data-[active=true]:bg-black data-[active=true]:text-white dark:data-[active=true]:bg-white dark:data-[active=true]:text-black"
                          >
                            <Link
                              to={item.url}
                              onClick={() => setOpenMobile(false)}
                            >
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
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
                    <Avatar className="h-12 w-12 rounded-sm">
                      <AvatarImage
                        src={profile.ownerLogo}
                        alt="ABC"
                        referrerPolicy={
                          profile.ownerLogo?.includes("google")
                            ? "no-referrer"
                            : "strict-origin-when-cross-origin"
                        }
                      />
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                        {getInitials(profile.owner)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold">
                        {profile.owner}
                      </span>
                      <span className="truncate text-xs opacity-60">
                        {profile?.planName} Plan
                      </span>
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
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer"
                      onSelect={() => handleMobileClose()}
                    >
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
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault(); // Prevents the menu from closing before logic runs if needed
                        logout();
                        handleMobileClose();
                      }}
                      className="text-red-500 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950"
                    >
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

      <ExportReportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        reportType={reportType}
        setReportType={setReportType}
        exporting={exporting}
        onExport={handleExport}
      />

      <ExportSubscriptionData
        open={openSubscription}
        onOpenChange={setOpenSubscription}
      />
    </>
  );
}
