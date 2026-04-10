"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProfile } from "../contexts/ProfileContext";
import { getRevenueOverview } from "../apis/backend_apis"

export const description = "An interactive area chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({ payments }) {
  const isMobile = useIsMobile();
  const { profile } = useProfile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartData, setChartData] = React.useState([]);
  function normalizeDate(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  function fillMissingDates(apiData, days) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (days - 1));

    const map = new Map(
      apiData.map((item) => [
        new Date(item.date).toISOString().split("T")[0],
        item.revenue,
      ])
    );

    const result = [];

    for (
      let d = new Date(startDate);
      d <= today;
      d.setDate(d.getDate() + 1)
    ) {
      const key = d.toISOString().split("T")[0];

      result.push({
        date: key,
        revenue: map.get(key) || 0,
      });
    }

    return result;
  }

  // const chartData = React.useMemo(() => {
  //   const revenueByDate = {};

  //   payments
  //     .filter((p) => p.status === "Success")
  //     .forEach((p) => {
  //       const date = normalizeDate(p.date).toISOString().split("T")[0];

  //       if (!revenueByDate[date]) {
  //         revenueByDate[date] = 0;
  //       }

  //       revenueByDate[date] += p.amount;
  //     });

  //   return Object.keys(revenueByDate).map((date) => ({
  //     date,
  //     revenue: revenueByDate[date],
  //   }));
  // }, [payments]);

  // const chartData = React.useMemo(() => {
  //   const revenueByDate = {};

  //   payments
  //     .filter((p) => p.status === "Success")
  //     .forEach((p) => {
  //       const date = normalizeDate(p.date);

  //       if (!revenueByDate[date]) {
  //         revenueByDate[date] = 0;
  //       }

  //       revenueByDate[date] += p.amount;
  //     });

  //   return Object.keys(revenueByDate).map((date) => ({
  //     date,
  //     revenue: revenueByDate[date],
  //   }));
  // }, [payments]);

  React.useEffect(() => {
    const days =
      timeRange === "7d"
        ? 7
        : timeRange === "30d"
          ? 30
          : 90;

    async function loadRevenue() {
      console.log('ownerId', profile.ownerId);
      const response = await getRevenueOverview(profile.ownerId, days);

      const filled = fillMissingDates(response.data, days);
      setChartData(filled);
    }

    loadRevenue();
  }, [timeRange, profile?.ownerId]);

  const filteredData = chartData.sort((a, b) => new Date(a.date) - new Date(b.date)).filter((item) => {
    const date = normalizeDate(item.date);
    const today = normalizeDate(new Date());
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 29;
    } else if (timeRange === "7d") {
      daysToSubtract = 6;
    }
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate && date <= today;
  });

  // return (
  //   <Card className="@container/card">
  //     <CardHeader>
  //       <CardTitle>Revenue Overview</CardTitle>
  //       <CardDescription>
  //         <span className="hidden @[540px]/card:block">
  //           Total for the last 3 months
  //         </span>
  //         <span className="@[540px]/card:hidden">Last 3 months</span>
  //       </CardDescription>
  //       <CardAction>
  //         <ToggleGroup
  //           type="single"
  //           value={timeRange}
  //           onValueChange={setTimeRange}
  //           variant="outline"
  //           className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
  //         >
  //           <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
  //           <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
  //           <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
  //         </ToggleGroup>
  //         <Select value={timeRange} onValueChange={setTimeRange}>
  //           <SelectTrigger
  //             className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
  //             size="sm"
  //             aria-label="Select a value"
  //           >
  //             <SelectValue placeholder="Last 3 months" />
  //           </SelectTrigger>
  //           <SelectContent className="rounded-xl">
  //             <SelectItem value="90d" className="rounded-lg">
  //               Last 3 months
  //             </SelectItem>
  //             <SelectItem value="30d" className="rounded-lg">
  //               Last 30 days
  //             </SelectItem>
  //             <SelectItem value="7d" className="rounded-lg">
  //               Last 7 days
  //             </SelectItem>
  //           </SelectContent>
  //         </Select>
  //       </CardAction>
  //     </CardHeader>
  //     <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
  //       <ChartContainer
  //         config={chartConfig}
  //         className="aspect-auto h-[250px] w-full"
  //       >
  //         <AreaChart data={chartData} margin={{
  //           top: 10,
  //           right: 10,
  //           left: 0,
  //           bottom: 5,
  //         }}>
  //           <defs>
  //             <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
  //               <stop
  //                 offset="5%"
  //                 stopColor="var(--color-revenue)"
  //                 stopOpacity={0.8}
  //               />
  //               <stop
  //                 offset="95%"
  //                 stopColor="var(--color-revenue)"
  //                 stopOpacity={0.1}
  //               />
  //             </linearGradient>
  //             {/* NEW: Clip path to hide anything that dips below the chart area */}
  //             <clipPath id="clipBelow">
  //               {/* By setting height to 90%, we ensure the curve never touches the labels */}
  //               <rect x="0" y="0" width="100%" height="88%" />
  //             </clipPath>
  //           </defs>
  //           <CartesianGrid vertical={false} />
  //           {/* <XAxis
  //             dataKey="date"
  //             tickLine={false}
  //             axisLine={false}
  //             tickCount={7}
  //             interval="preserveStartEnd"
  //             tickMargin={8}
  //             minTickGap={32}
  //             tickFormatter={(value) => {
  //               const date = new Date(value);
  //               return date.toLocaleDateString("en-US", {
  //                 month: "short",
  //                 day: "numeric",
  //               });
  //             }}
  //           /> */}
  //           <XAxis
  //             dataKey="date"
  //             tickLine={false}
  //             height={40}
  //             axisLine={false}
  //             tickMargin={8}
  //             interval={timeRange === "90d"
  //               ? 10
  //               : timeRange === "30d"
  //                 ? 3
  //                 : 0}
  //             minTickGap={50}
  //             tickFormatter={(value) => {
  //               const date = new Date(value);
  //               return date.toLocaleDateString("en-US", {
  //                 month: "short",
  //                 day: "numeric",
  //               });
  //             }}
  //           />
  //           <YAxis domain={["0", "auto"]} hide />
  //           <ChartTooltip
  //             cursor={false}
  //             content={
  //               <ChartTooltipContent
  //                 labelFormatter={(value) => {
  //                   return new Date(value).toLocaleDateString("en-US", {
  //                     month: "short",
  //                     day: "numeric",
  //                   });
  //                 }}
  //                 indicator="dot"
  //               />
  //             }
  //           />
  //           <Area
  //             dataKey="revenue"
  //             type="natural"
  //             fill="url(#fillRevenue)"
  //             stroke="var(--color-revenue)"
  //             strokeWidth={1}
  //             clipPath="url(#clipBelow)"
  //           />
  //         </AreaChart>
  //       </ChartContainer>
  //     </CardContent>
  //   </Card>
  // );

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Visitors</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            {/* <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            /> */}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
