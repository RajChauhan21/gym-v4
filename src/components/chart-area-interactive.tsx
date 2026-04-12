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
import { getRevenueOverview } from "../apis/backend_apis";
import { Skeleton } from "./ui/skeleton";

export const description = "An interactive area chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    theme: {
      light: "#000000", // Your dark navy for light mode
      dark: "#ffffff", // Pure white for dark mode
    },
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const { profile } = useProfile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartData, setChartData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

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
      ]),
    );

    const result = [];

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];

      result.push({
        date: key,
        revenue: map.get(key) || 0,
      });
    }

    return result;
  }

  React.useEffect(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

    async function loadRevenue() {
      setLoading(true);
      const response = await getRevenueOverview(profile.ownerId, days);

      const filled = fillMissingDates(response.data, days);
      setChartData(filled);
      setLoading(false);
    }

    loadRevenue();
  }, [timeRange, profile?.ownerId]);

  return (
    <Card className="@container/card shadow-lg">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
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
        <div
          className={`w-full ${isMobile ? "aspect-[4/3] h-auto" : "h-[250px]"} relative`}
        >
          {loading ? (
            /* 1. LOADING STATE */
            <div className="flex h-full w-full flex-col justify-between pt-4">
              <div className="flex h-full w-full items-end gap-2 pb-6">
                {/* Mock Area Chart Skeletons */}
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <Skeleton
                    key={i}
                    className="flex-1 rounded-t-sm bg-slate-200 dark:bg-slate-800"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              {/* Mock X-Axis labels */}
              <div className="flex justify-between px-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                ))}
              </div>
            </div>
          ) : !chartData || chartData.length === 0 ? (
            /* 2. EMPTY STATE */
            <div className="flex h-full w-full flex-col items-center justify-center space-y-2 border-2 border-dashed border-muted rounded-xl">
              <p className="text-sm font-medium text-muted-foreground">
                No data available
              </p>
              <p className="text-xs text-muted-foreground/60">
                Try changing the time range.
              </p>
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className={`w-full ${isMobile ? "aspect-[4/3] h-auto" : "h-[250px]"}`}
            >
              <AreaChart accessibilityLayer data={chartData}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.9} // Darker at the top
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.4} // Increased from 0.1 to 0.4 for a richer "glow"
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke={isMobile ? "transparent" : "var(--border)"}
                />
                <XAxis
                  dataKey="date"
                  interval={isMobile ? "preserveEnd" : "preserveStartEnd"}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickCount={isMobile ? 3 : 7}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  cursor={{ strokeWidth: 2 }}
                  wrapperStyle={{ pointerEvents: "none", outline: "none" }}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      isAnimationActive={false}
                      labelClassName="font-bold" // Makes the date easier to read
                    />
                  }
                />
                <Area
                  dataKey="revenue"
                  type={isMobile ? "linear" : "natural"}
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"
                  strokeWidth={0.3}
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
