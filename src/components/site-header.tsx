import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "../contexts/ThemeContext";
// import { Button } from "@/components/ui/button"; https://tqtjpmd0-5173.inc1.devtunnels.ms/
import { Moon, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const categoryLabels: Record<string, string> = {
  overview: "Overview",
  members: "Members",
  Owner: "Owner",
};

export function SiteHeader() {
  const { dark, toggleDark } = useTheme();
  const location = useLocation();

  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      act: "overview",
    },
    { title: "Members", url: "/members", act: "members" },
    { title: "Payments", url: "/payments", act: "members" },
    { title: "Plans", url: "/plans", act: "members" },
    { title: "Settings", url: "/settings", act: "Owner" },
    { title: "Pricing", url: "/pricing", act: "Owner" },
    {
      title: "History & Invoices",
      url: "/paymentHistory",
      act: "Owner",
    },
  ];

  // Find the exact active sidebar item based on the path
  const currentItem = items.find((item) => item.url === location.pathname);

  // Fallback defaults if the path doesn't match any item
  const parentLabel = currentItem
    ? categoryLabels[currentItem.act] || currentItem.act
    : "Overview";
  const pageTitle = currentItem ? currentItem.title : "Dashboard";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <span className="text-muted-foreground font-medium text-sm md:text-base">
                {parentLabel}
              </span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm md:text-base font-semibold text-foreground">
                {pageTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side */}
      <Button className="m-3" variant="ghost" size="icon" onClick={toggleDark}>
        {dark ? (
          <Sun className="w-5 h-5 text-white" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </Button>
    </header>
  );
}
