"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon, Stars } from "lucide-react";
import { useProfile } from "../contexts/ProfileContext";
import { useEffect, useState } from "react";
import { getStatsOfMember } from "../apis/backend_apis";
import { Skeleton } from "./ui/skeleton";

export function SectionCards() {
  interface RevenueStats {
    totalRevenue: number;
    lastMonthRevenue: number;
    currentMonthRevenue: number;
    activeMemberCount: number;
    activeMembersThreeMonthsAgo: number;
    newMembersThisMonth: number;
    newMembersLastMonth: number;
    expiringSoonCount: number;
  }

  function normalizeDate(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const [loading, setLoading] = useState(false);
  const today = normalizeDate(new Date());
  const { profile } = useProfile();
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const startOfThisMonth = normalizeDate(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const startOfLastMonth = normalizeDate(
    new Date(today.getFullYear(), today.getMonth() - 1, 1),
  );
  const endOfLastMonth = normalizeDate(
    new Date(today.getFullYear(), today.getMonth(), 0),
  );

  const getRevenueStats = async () => {
    setLoading(true);
    try {
      // Replace with your actual endpoint
      const response = await getStatsOfMember(profile.ownerId);
      // Populate result into the interface-typed state
      setStats(response.data);
      console.log(stats.currentMonthRevenue);
    } catch (error) {
      console.error("Unable to fetch revenue stats", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRevenueStats();
  }, [profile?.ownerId]);

  // ---------- REVENUE ----------
  const revenueGrowth =
    stats?.lastMonthRevenue === 0
      ? 100
      : (
          ((stats?.currentMonthRevenue - stats?.lastMonthRevenue) /
            stats?.lastMonthRevenue) *
          100
        ).toFixed(1);

  const difference = stats?.newMembersThisMonth - stats?.newMembersLastMonth;

  // ---------- EXPIRING SOON ----------
  const next7Days = normalizeDate(new Date());
  next7Days.setDate(today.getDate() + 7);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const activeGrowth =
    stats?.activeMembersThreeMonthsAgo === 0
      ? 100
      : (
          ((stats?.activeMemberCount - stats?.activeMembersThreeMonthsAgo) /
            stats?.activeMembersThreeMonthsAgo) *
          100
        ).toFixed(1);

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Revenue */}
      <Card className="flex flex-col h-full shadow-lg">
        <CardHeader>
          <CardDescription>Total Revenue (This Month)</CardDescription>
          <CardTitle className="text-3xl font-semibold">
            {loading ? (
              <Skeleton className="h-8 w-24 mt-1 bg-slate-200 dark:bg-slate-800 rounded" />
            ) : (
              `₹${stats?.currentMonthRevenue?.toLocaleString()}`
            )}
          </CardTitle>

          <CardAction>
            {loading ? (
              <Skeleton className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
            ) : (
              <Badge variant="outline">
                {revenueGrowth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                {revenueGrowth}%
              </Badge>
            )}
          </CardAction>
        </CardHeader>

        <CardFooter className=" mt-auto text-sm text-muted-foreground">
          Compared to last month
        </CardFooter>
      </Card>

      {/* New Members */}
      <Card className="flex flex-col h-full shadow-lg">
        <CardHeader>
          <CardDescription>New Members (This Month)</CardDescription>

          <CardTitle className="text-3xl font-semibold">
            {loading ? (
              <Skeleton className="h-8 w-24 mt-1 bg-slate-200 dark:bg-slate-800 rounded" />
            ) : (
              stats?.newMembersThisMonth
            )}
          </CardTitle>

          <CardAction>
            {loading ? (
              <Skeleton className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
            ) : (
              <Badge variant="outline">
                <span>+{difference} from last month</span>
              </Badge>
            )}
          </CardAction>
        </CardHeader>

        <CardFooter className="mt-auto text-sm text-muted-foreground">
          Compared to last month
        </CardFooter>
      </Card>

      {/* Active Members */}
      <Card className="flex flex-col h-full shadow-lg">
        <CardHeader>
          <CardDescription >Active Members (This Month)</CardDescription>

          <CardTitle className="text-3xl font-semibold">
            {loading ? (
              <Skeleton className="h-8 w-24 mt-1 bg-slate-200 dark:bg-slate-800 rounded" />
            ) : (
              stats?.activeMemberCount
            )}
          </CardTitle>

          <CardAction>
            {loading ? (
              <Skeleton className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
            ) : (
              <Badge variant="outline">
                {activeGrowth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                {activeGrowth}%
              </Badge>
            )}
          </CardAction>
        </CardHeader>

        <CardFooter className="mt-auto text-sm text-muted-foreground">
          Compared to 3 months ago
        </CardFooter>
      </Card>

      {/* Expiring Soon */}
      <Card className="flex flex-col h-full shadow-lg">
        <CardHeader>
          <CardDescription className="lg:mb-4 mb-3">Members Expiring in 7 Days</CardDescription>

          <CardTitle className="text-3xl font-semibold">
            {loading ? (
              <Skeleton className="h-8 w-24 mt-1 bg-slate-200 dark:bg-slate-800 rounded" />
            ) : (
              stats?.expiringSoonCount
            )}
            {/* {stats?.expiringSoonCount} */}
          </CardTitle>
        </CardHeader>

        <CardFooter className="mt-auto text-sm text-muted-foreground">
          Follow up for renewals
        </CardFooter>
      </Card>
    </div>
  );
}
