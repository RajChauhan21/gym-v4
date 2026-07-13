import { useEffect, useMemo, useState } from "react";
import {
  Route,
  Trophy,
  Users,
  IndianRupee,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  BarChart3,
  Database,
  MoreVertical,
} from "lucide-react";
// import Chart from "react-apexcharts";
import { lazy, Suspense } from "react";

const Chart = lazy(() => import("react-apexcharts"));
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AddSourceModal } from "./AddSourceModal";
import {
  deleteSource,
  getAllSources,
  getSourceAnalytics,
  saveSourceDetails,
  updateSourceDetails,
} from "../apis/backend_apis";
import { useProfile } from "../contexts/ProfileContext";
import { toast } from "sonner";
import { useGymStore } from "../store/gymStore";
import { useTheme } from "../contexts/ThemeContext";
import { DeleteSourceModal } from "./DeleteSourceModal";

const mockSources = [
  {
    id: 1,
    name: "Instagram",
    members: 52,
    revenue: 125000,
    status: "Active",
  },
  {
    id: 2,
    name: "Referral",
    members: 31,
    revenue: 98000,
    status: "Active",
  },
  {
    id: 3,
    name: "Google Search",
    members: 22,
    revenue: 76000,
    status: "Active",
  },
  {
    id: 4,
    name: "Walk-In",
    members: 15,
    revenue: 42000,
    status: "Active",
  },
  {
    id: 5,
    name: "Facebook",
    members: 8,
    revenue: 18000,
    status: "Inactive",
  },
];

export default function SourcesPage() {
  const [editingSource, setEditingSource] = useState(null);

  const [sourceName, setSourceName] = useState("");

  const [openSourceDialog, setOpenSourceDialog] = useState(false);

  const [selectedSource, setSelectedSource] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const filteredSources = useMemo(() => {
    return mockSources.filter((source) =>
      source.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  // const chartTextColor = theme === "dark" ? "#ffffff" : "#000000";
  const chartTextColor = theme === "dark" ? "#ffffff" : "#000000";

  const { profile } = useProfile();

  const [sourceAnalytics, setSourceAnalytics] = useState([]);

  const [addSourceOpen, setAddSourceOpen] = useState(false);

  const setSources = useGymStore((state) => state.setSources);

  const addSources = useGymStore((state) => state.addSources);

  const sources = useGymStore((state) => state.sources);

  const { dark } = useTheme();

  const totalMembers = sourceAnalytics.reduce(
    (sum, item) => sum + item.totalMembers,
    0,
  );

  const totalRevenue = sourceAnalytics.reduce(
    (sum, item) => sum + item.totalRevenue,
    0,
  );

  const topSource = [...sourceAnalytics].sort(
    (a, b) => b.totalMembers - a.totalMembers,
  )[0];

  const activeSources = mockSources.filter((s) => s.status === "Active").length;

  const addSource = async (sourceName) => {
    setLoading(true);
    const payload = {
      ownerId: profile?.ownerId,
      name: sourceName,
    };
    try {
      const response = await saveSourceDetails(payload);
      if (response.status === 202 || response.data.statusCodeValue === 202) {
        if (response.data == 202) {
          toast.success("Source created successfully");
          getSources();
          getAnalytics();
        }
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      } else if (response.status === 404) {
        // toast.error("Someting went wrong");
        if (
          response.data &&
          response.data.message &&
          response.data.message == "duplicate"
        ) {
          toast.error("You already added this source, try another one");
          // Member already exists with the name
        }

        if (
          response.data &&
          response.data.message &&
          response.data.message == "300"
        ) {
          toast.error("You current plan does'nt support this feature");
          // Member already exists with the name
        }
      }

      if (
        response.data &&
        response.data.message &&
        response.data.message == "limit"
      ) {
        toast.error(
          "You’ve reached the maximum limit of 7 sources. Delete an existing source to add a new one.",
        );
        // Member already exists with the name
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const updateSource = async (source) => {
    setLoading(true);
    const payload = {
      id: source?.id,
      ownerId: profile?.ownerId,
      name: source.name,
    };
    try {
      const response = await updateSourceDetails(payload);
      if (response.status === 202 || response.data.statusCodeValue === 202) {
        if (response.data == 202) {
          toast.success("Source updated successfully");
          getSources();
          getAnalytics();
        }
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      } else if (response.status === 404) {
        if (
          response.data &&
          response.data.message &&
          response.data.message == "duplicate"
        ) {
          toast.error("A source with this name, already exists");
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getSources = async () => {
    try {
      const response = await getAllSources(profile?.ownerId);
      if (response.status === 202 || response.data.statusCodeValue === 202) {
        setSources(response?.data);
      } else if (response.status === 429) {
        // toast.error(
        //   "You are performing actions too quickly. Please wait a few seconds and try again.",
        // );
      }
    } catch (error) {
      toast.error(
        "Something went wrong while fetching sources. Please try again",
      );
    }
  };

  const getAnalytics = async () => {
    setLoading(true);
    try {
      const response = await getSourceAnalytics(profile?.ownerId);
      if (response.status === 202 || response.data.statusCodeValue === 202) {
        setSourceAnalytics(response?.data || []);
      } else if (response.status === 404) {
      } else if (response.status === 429) {
        // toast.error(
        //   "You are performing actions too quickly. Please wait a few seconds and try again.",
        // );
      }
    } catch (error) {
    } finally {
      setLoading(false);
      console.log(sourceAnalytics);
    }
  };

  const series = useMemo(
    () => [
      {
        name: "Members",
        data: sourceAnalytics.map((source) => source.totalMembers || 0),
      },
    ],
    [sourceAnalytics],
  );

  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem("theme") || "light";

      console.log("Theme changed:", currentTheme);

      setTheme(currentTheme);
    };

    window.addEventListener("themeChange", handleThemeChange);

    return () => {
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  useEffect(() => {
    getAnalytics();
    getSources();
  }, []);

  const options = useMemo(
    () => ({
      chart: {
        toolbar: {
          show: false,
        },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 1000,
        },
      },

      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 8,
          borderRadiusApplication: "end",
          barHeight: "55%",
          distributed: true,
        },
      },

      colors: [
        "#3b82f6",
        "#8b5cf6",
        "#06b6d4",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#ec4899",
        "#6366f1",
      ],

      dataLabels: {
        enabled: true,
        formatter: (value) => `${value}`,
        style: {
          fontSize: "12px",
          fontWeight: 600,
        },
      },

      xaxis: {
        categories: sourceAnalytics.map((source) => source.name),
        labels: {
          style: {
            fontSize: "12px",
            fontWeight: 600,
            colors: dark ? "#ffffff" : "#000000",
          },
        },
      },

      yaxis: {
        labels: {
          style: {
            fontSize: "13px",
            fontWeight: 600,
            colors: dark ? "#ffffff" : "#000000",
          },
        },
      },

      grid: {
        borderColor: dark ? "#374151" : "#e5e7eb",
        strokeDashArray: 4,
      },

      tooltip: {
        theme: dark ? "dark" : "light",
        y: {
          formatter: (value) => `${value} Members`,
        },
      },

      legend: {
        show: false,
      },
    }),
    [dark, sourceAnalytics],
  );

  const handleEditSource = (source) => {
    setEditingSource(source);
    setSourceName(source.name);
    setAddSourceOpen(true);
  };

  const handleDeleteSource = (source) => {
    setSelectedSource(source);
    setDeleteDialogOpen(true);
  };

  const deleteSourceById = async (sourceId) => {
    setLoading(true);
    try {
      const response = await deleteSource(sourceId);
      if (response.status === 202 || response.data.statusCodeValue === 202) {
        if (response.data == 202) {
          toast.success("Source deleted successfully");
          getSources();
          getAnalytics();
        }
      } else if (response.status === 404) {
        toast.error("Something went wrong, please try again later");
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Sources mounted:", performance.now());
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Route className="h-7 w-7 text-primary" />
            Sources
          </h1>

          <p className="text-muted-foreground mt-1">
            Track where your members are discovering your gym.
          </p>
        </div>

        <Button onClick={() => setAddSourceOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Source
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sources</p>
                <p className="text-3xl font-bold mt-1">
                  {loading ? (
                    <Skeleton className="h-8 w-24 mt-1 bg-slate-200 dark:bg-slate-800 rounded" />
                  ) : (
                    sources.length
                  )}
                </p>
              </div>

              <Route className="h-10 w-10 text-primary/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Source</p>

                <p className="font-semibold text-lg mt-1">
                  {loading ? (
                    <Skeleton className="h-8 w-24 mt-1 bg-slate-200 dark:bg-slate-800 rounded" />
                  ) : (
                    sources.name
                  )}
                </p>

                <p className="text-sm text-bold-foreground">
                  {loading ? (
                    <Skeleton className="h-8 w-24 mt-1 bg-slate-200 dark:bg-slate-800 rounded" />
                  ) : topSource ? (
                    topSource?.name
                  ) : (
                    "No Sources"
                  )}
                </p>
              </div>

              <Trophy className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Revenue Generated
                </p>

                <p className="text-3xl font-bold mt-1">
                  {loading ? (
                    <Skeleton className="h-8 w-24 mt-1 bg-slate-200 dark:bg-slate-800 rounded" />
                  ) : (
                    `₹${totalRevenue.toLocaleString()}`
                  )}
                </p>
              </div>

              <IndianRupee className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sources</p>

                <p className="text-3xl font-bold mt-1">
                  {loading ? (
                    <Skeleton className="h-8 w-24 mt-1 bg-slate-200 dark:bg-slate-800 rounded" />
                  ) : (
                    activeSources
                  )}
                </p>
              </div>

              <Users className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Source Performance
              </CardTitle>

              <CardDescription>
                Member acquisition breakdown by source.
              </CardDescription>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold">{totalMembers}</p>
              <p className="text-xs text-muted-foreground">Total Members</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <>
              {/* Chart Skeleton */}
              <div className="space-y-5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  </div>
                ))}
              </div>

              {/* Summary Cards Skeleton */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-lg border p-3 space-y-3">
                    <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-7 w-12 bg-slate-200 dark:bg-slate-800" />
                    <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Chart OR Empty State Conditional */}
              {profile?.planName === "Max Pro" && sourceAnalytics.length > 0 ? (
                <Suspense
                  fallback={
                    <div className="space-y-5">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                          <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-800" />
                          <Skeleton className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  }
                >
                  <Chart
                    key={dark ? "dark" : "light"}
                    type="bar"
                    height={380}
                    series={series}
                    options={options}
                  />
                </Suspense>
              ) : (
                <div className="h-[380px] flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/10">
                  No source data available
                </div>
              )}

              {/* Actual Summary Cards Render */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 shadow-lg">
                {[...(sourceAnalytics || [])]
                  .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
                  .slice(0, 4)
                  .map((source) => {
                    const revenuePercentage = totalRevenue
                      ? Math.round(
                          ((source.totalRevenue || 0) / totalRevenue) * 100,
                        )
                      : 0;
                    return (
                      <div
                        key={source.id}
                        className="rounded-lg border bg-muted/30 p-3"
                      >
                        <p className="text-xs text-muted-foreground truncate">
                          {source.name}
                        </p>
                        <p className="text-xl font-bold mt-1">
                          ₹{source.totalRevenue?.toLocaleString("en-IN") || 0}
                        </p>
                        <p className="text-xs text-primary font-medium">
                          {revenuePercentage}% of total revenue
                        </p>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Management */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Source Management
              </CardTitle>

              <CardDescription>
                Manage customer acquisition sources used by your members.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Container 1: Handles the mobile horizontal scrollbar */}
          <div className="bg-card dark:bg-zinc-950 text-card-foreground rounded-xl shadow border dark:border-gray-800 p-3 md:p-8">
            <div className="relative overflow-auto h-[383px] no-scrollbar border rounded-lg">
              {" "}
              {/* Fixed height to prevent jumping */}
              <Table className="w-auto lg:table-fixed lg:w-full">
                {/* <TableHeader className="sticky top-0 z-30 bg-card"> */}
                <TableHeader className="sticky top-0 z-40">
                  <TableRow className="hover:bg-transparent">
                    {" "}
                    {/* Prevents the row-level hover effect on headers */}
                    <TableHead className="sticky left-0 top-0 z-50 px-2 md:px-4 min-w-[80px] md:min-w-[150px] text-white bg-zinc-950 select-none text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        <span className="text-xs md:text-sm">Source</span>
                      </div>
                    </TableHead>
                    {/* Apply the same bg and sticky top to ALL other headers */}
                    {[
                      { label: "Members", key: "membershipName" },
                      { label: "Revenue", key: "amount" },
                      // { label: "Action", key: "due" },
                    ].map((header) => (
                      <TableHead
                        key={header.key}
                        className="sticky top-0 z-40 px-4 bg-zinc-950 text-white text-center border-b select-none"
                      >
                        <div className="inline-flex items-center justify-center gap-1">
                          <span>{header.label}</span>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="sticky top-0 z-40 text-white bg-zinc-950 text-center border-b select-none">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    /* LOADING STATE: Skeleton Rows */
                    Array.from({ length: 7 }).map((_, i) => (
                      <TableRow key={i}>
                        {/* Skeleton for Sticky Name */}
                        <TableCell className="sticky left-0 bg-card pl-6">
                          <Skeleton className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                        </TableCell>
                        {/* Skeletons for other 7 columns */}
                        {Array.from({ length: 4 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="mx-auto h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : Array.isArray(sourceAnalytics) &&
                    sourceAnalytics.length > 0 ? (
                    sourceAnalytics.map((source, index) => (
                      <TableRow
                        key={index}
                        className="dark:bg-card dark:text-white"
                      >
                        <TableCell
                          className={cn(
                            "sticky left-0 z-10 font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] bg-card min-w-[150px] text-center",
                          )}
                        >
                          {source.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {source.totalMembers}
                        </TableCell>
                        <TableCell className="text-center">
                          ₹{(source.totalRevenue || 0).toLocaleString("en-IN")}
                        </TableCell>
                        {/* ACTION DROPDOWN */}
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-40 rounded-xl"
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  console.log("Edit clicked", source);
                                  handleEditSource(source);
                                }}
                                className="gap-2 cursor-pointer"
                              >
                                <Pencil className="size-4 text-blue-500" />
                                <span>Update</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteSource(source)}
                                className="gap-2 cursor-pointer text-white-600"
                              >
                                <Trash2 className="size-4 text-red-500" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    /* EMPTY STATE MESSAGE */
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <p className="text-lg font-medium">No Source found</p>
                          <p className="text-sm">
                            Try adding a new source or check your connection.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddSourceModal
        open={addSourceOpen}
        onOpenChange={setAddSourceOpen}
        onSubmit={(sourceName) => {
          if (editingSource) {
            updateSource({
              id: editingSource.id,
              name: sourceName,
            });
          } else {
            addSource(sourceName);
          }

          setAddSourceOpen(false);
          setEditingSource(null);
        }}
        loading={loading}
        editingSource={editingSource}
      />

      <DeleteSourceModal
        open={!!deleteDialogOpen}
        onOpenChange={(isOpen) => !isOpen && setDeleteDialogOpen(null)}
        sourceName={selectedSource?.name}
        sourceId={selectedSource?.id}
        onConfirm={() => {
          deleteSourceById(selectedSource?.id);
          setSelectedSource(null);
        }}
      />
    </div>
  );
}
