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

export function SectionCards({ members, payments }) {
  function normalizeDate(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const today = normalizeDate(new Date());

  const startOfThisMonth = normalizeDate(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const startOfLastMonth = normalizeDate(
    new Date(today.getFullYear(), today.getMonth() - 1, 1),
  );
  const endOfLastMonth = normalizeDate(
    new Date(today.getFullYear(), today.getMonth(), 0),
  );

  // ---------- REVENUE ----------
  const thisMonthRevenue = payments
    .filter(
      (p) =>
        p.status === "Success" && normalizeDate(p.date) >= startOfThisMonth,
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const lastMonthRevenue = payments
    .filter(
      (p) =>
        p.status === "Success" &&
        normalizeDate(p.date) >= startOfLastMonth &&
        normalizeDate(p.date) <= endOfLastMonth,
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const revenueGrowth =
    lastMonthRevenue === 0
      ? 100
      : (
          ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
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
    newMembersLastMonth === 0
      ? 100
      : (
          ((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) *
          100
        ).toFixed(1);

  const difference = newMembersThisMonth - newMembersLastMonth;

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
    activeMembers3MonthsAgo === 0
      ? 100
      : (
          ((activeMembers - activeMembers3MonthsAgo) /
            activeMembers3MonthsAgo) *
          100
        ).toFixed(1);

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Revenue */}
      <Card>
        <CardHeader>
          <CardDescription>Total Revenue (This Month)</CardDescription>
          <CardTitle className="text-3xl font-semibold">
            ₹{thisMonthRevenue}
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
            {newMembersThisMonth}
          </CardTitle>

          <CardAction >
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
            {activeMembers}
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
            {expiringSoon}
          </CardTitle>
        </CardHeader>

        <CardFooter className="mt-auto text-sm text-muted-foreground">
          Follow up for renewals
        </CardFooter>
      </Card>
    </div>
  );
}
