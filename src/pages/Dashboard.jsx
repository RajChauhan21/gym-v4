import { useEffect, useState } from "react";
import StatsCards from "../components/dashboard/Statscard";
import Loader from "@/components/ui/Loader";
import { AppSidebar } from "../components/dashboard/AppSidebar";
import data from "../data.json";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { useGymStore } from "@/store/gymStore";
import ExpiringMembers from "../components/dashboard/ExpiringMembers";
import RecentPayments from "../components/dashboard/RecentPayments";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  const members = useGymStore((state) => state.members);
  const payments = useGymStore((state) => state.payments);
  const plans = useGymStore((state) => state.plans);

  if (loading) {
    return <Loader text="Loading dashboard...." />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards members={members} payments={payments} plans={plans} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive payments={payments} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentPayments />

            <ExpiringMembers />
          </div>
        </div>
      </div>
    </div>
  );
}
