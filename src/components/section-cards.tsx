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
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { useProfile } from "../contexts/ProfileContext";
import {
  login,
  getAllOwners,
  saveGym,
  loginByGoogle,
} from "../apis/backend_apis";
import { useEffect, useState } from "react";
import {
  getRevenue,
  getActiveMembers,
  getMembersJoinedCurrentMonth,
  getMembersExpiringSoon,
  getStatsOfMember,
} from "../apis/backend_apis";

import { constant } from "../apis/constant";

export function SectionCards({ members, payments }) {
  interface RevenueResponse {
    totalRevenue: number;
    currentMonthRevenue: number;
    activeMembers: number;
  }

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
  const today = normalizeDate(new Date());
  const { profile } = useProfile();
  const [thisMonthRevenue, sethisMonthRevenue] = useState<number>(0);
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
    try {
      // Replace with your actual endpoint
      const response = await getStatsOfMember(profile.ownerId);
      // Populate result into the interface-typed state
      setStats(response.data);
      console.log(stats.currentMonthRevenue);
    } catch (error) {
      console.error("Unable to fetch revenue stats", (error as Error).message);
    } finally {
    }
  };

  const getRevenues = async (): Promise<void> => {
    try {
      if (!profile?.ownerId) return;
      const response: RevenueResponse = await getRevenue(profile.ownerId);
      sethisMonthRevenue(response.currentMonthRevenue);
    } catch (error) {
      console.error("unable to fetch revenue", (error as Error).message);
    }
  };

  const getActiveMembersCount = async (): Promise<void> => {
    try {
      if (!profile?.ownerId) return;
      const response = await getActiveMembers(profile.ownerId);
      setActiveMembersCount(response);
    } catch (error) {
      console.error("unable to fetch count", (error as Error).message);
    }
  };

  const getMembersJoinedCurrentMonthCount = async (): Promise<void> => {
    try {
      if (!profile?.ownerId) return;
      const response = await getMembersJoinedCurrentMonth(profile.ownerId);
      setNewMembersCurrentMonth(response);
    } catch (error) {
      console.error("unable to fetch count", (error as Error).message);
    }
  };

  const getMembersExpiringSoonCount = async (): Promise<void> => {
    try {
      if (!profile?.ownerId) return;
      const response = await getMembersExpiringSoon(profile.ownerId);
      setExpiringMembersin7Days(response);
    } catch (error) {
      console.error("unable to fetch count", (error as Error).message);
    }
  };

  useEffect(() => {
    getRevenueStats();
  }, [profile?.ownerId]);

  // ---------- REVENUE ----------
  // const thisMonthRevenue = payments
  //   .filter(
  //     (p) =>
  //       normalizeDate(p.paymentDate) >= startOfThisMonth,
  //   )
  //   .reduce((sum, p) => sum + p.amount, 0);

  // const lastMonthRevenue = payments
  //   .filter(
  //     (p) =>
  //       normalizeDate(p.paymentDate) >= startOfLastMonth &&
  //       normalizeDate(p.paymentDate) <= endOfLastMonth,
  //   )
  //   .reduce((sum, p) => sum + p.amount, 0);

  const revenueGrowth =
    stats?.lastMonthRevenue === 0
      ? 100
      : (
          ((stats?.currentMonthRevenue - stats?.lastMonthRevenue) / stats?.lastMonthRevenue) *
          100
        ).toFixed(1);

  // ---------- NEW MEMBERS ----------
  const newMembersThisMonth = members.filter(
    (m) => normalizeDate(m.joined) >= startOfThisMonth,
  ).length;

  const newMembersLastMonth = members.filter(
    (m) =>
      normalizeDate(m.joined) >= startOfLastMonth &&
      normalizeDate(m.joined) <= endOfLastMonth,
  ).length;

  const memberGrowth =
    stats?.newMembersLastMonth === 0
      ? 100
      : (
          ((stats?.newMembersThisMonth - stats?.newMembersLastMonth) / stats?.newMembersLastMonth) *
          100
        ).toFixed(1);

  const difference = stats?.newMembersThisMonth - stats?.newMembersLastMonth;

  // ---------- ACTIVE MEMBERS ----------
  const activeMembers = members.filter(
    (m) => normalizeDate(m.expiry) >= today,
  ).length;

  // ---------- EXPIRING SOON ----------
  const next7Days = normalizeDate(new Date());
  next7Days.setDate(today.getDate() + 7);

  const expiringSoon = members.filter((m) => {
    const expiry = normalizeDate(m.expiry);
    return expiry >= today && expiry <= next7Days;
  }).length;

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  // Active Members 3 months ago
  const activeMembers3MonthsAgo = members.filter((m) => {
    const joined = normalizeDate(m.joined);
    const expiry = normalizeDate(m.expiry);

    return joined <= threeMonthsAgo && expiry >= threeMonthsAgo;
  }).length;

  const activeGrowth =
    stats?.activeMembersThreeMonthsAgo === 0
      ? 100
      : (
          ((activeMembers - stats?.activeMembersThreeMonthsAgo) /
            stats?.activeMembersThreeMonthsAgo) *
          100
        ).toFixed(1);

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Revenue */}
      <Card>
        <CardHeader>
          <CardDescription>Total Revenue (This Month)</CardDescription>
          <CardTitle className="text-3xl font-semibold">
            ₹{stats?.currentMonthRevenue?.toLocaleString()}
          </CardTitle>

          <CardAction>
            <Badge variant="outline">
              {revenueGrowth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {revenueGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="text-sm text-muted-foreground">
          Compared to last month
        </CardFooter>
      </Card>

      {/* New Members */}
      <Card>
        <CardHeader>
          <CardDescription>New Members (This Month)</CardDescription>

          <CardTitle className="text-3xl font-semibold">
            {stats?.newMembersThisMonth}
          </CardTitle>

          <CardAction>
            {/* <Badge variant="outline" className="mb-1">
              {memberGrowth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {memberGrowth}%
            </Badge> */}
            {/* <span>+{difference} from last month</span> */}
            <Badge variant="outline">
              <span>+{difference} from last month</span>
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="text-sm text-muted-foreground">
          Compared to last month
        </CardFooter>
      </Card>

      {/* Active Members */}
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardDescription>Active Members</CardDescription>

          <CardTitle className="text-3xl font-semibold">
            {stats?.activeMemberCount}
          </CardTitle>

          <CardAction>
            <Badge variant="outline">
              {activeGrowth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {activeGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="mt-auto text-sm text-muted-foreground">
          Compared to 3 months ago
        </CardFooter>
      </Card>

      {/* Expiring Soon */}
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardDescription>Expiring in 7 Days</CardDescription>

          <CardTitle className="text-3xl font-semibold">
            {stats?.expiringSoonCount}
          </CardTitle>
        </CardHeader>

        <CardFooter className="mt-auto text-sm text-muted-foreground">
          Follow up for renewals
        </CardFooter>
      </Card>
    </div>
  );
}
