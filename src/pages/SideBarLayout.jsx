import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/dashboard/AppSidebar";
import Topbar from "../components/dashboard/Topbar";
import { SiteHeader } from "@/components/site-header"
// import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import data from '../data.json'

export function SideBarLayout() {
  return (
    // <SidebarProvider>
    //   <AppSidebar />
    //   <SidebarInset>
    //     <Topbar />
    //     <main className="flex-1 p-4 md:p-6">
    //       <Outlet /> {/* This is where Dashboard, Members, etc. will render */}
    //     </main>
    //   </SidebarInset>
    // </SidebarProvider>

    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar/>
      <SidebarInset>
        <SiteHeader />
        {/* <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div> */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet /> {/* This is where Dashboard, Members, etc. will render */}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
