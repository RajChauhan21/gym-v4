import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  CreditCard,
  Download,
  FileSpreadsheet,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGymStore } from "../store/gymStore";
import {
  getAllMembersCount,
  getAllMembersCountByFilters,
  getAllPaymentsCountByFilters,
} from "../apis/backend_apis";
import { useProfile } from "../contexts/ProfileContext";
import { toast } from "sonner";

const DEFAULT_FILTERS = {
  name: "",
  plan: "",
  dueAmount: "",
  fromDate: "",
  toDate: "",
  isActive: null,
};

/**
 * ExportReportDialog
 *
 * Props:
 *   open           – boolean
 *   onOpenChange   – (open: boolean) => void
 *   onExport       – ({ reportType, filters }) => void  ← now receives filters too
 *   exporting      – boolean
 *   reportType     – "members" | "payments"
 *   setReportType  – (type: string) => void
 *   plans          – Array<{ name: string }>  (for the Plan dropdown)
 */
export default function ExportReportDialog({
  open,
  onOpenChange,
  onExport,
  exporting,
  reportType,
  setReportType,
}) {
  const [filters, setFilters] = useState({
    dueAmount: "",
    amount: "",
    method: "",
    fromDate: "", // Matches @Param "joinedFrom"
    toDate: "", // Matches @Param "joinedTo"
    plan: "",
    isActive: "all",
  });
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);
  const plans = useGymStore((state) => state.plans);
  const { profile } = useProfile();
  const [dateType, setDateType] = useState("expiry");
  const [count, setCount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchPlans = useGymStore((state) => state.fetchPlans);

  // Standalone utility to convert raw state into API-ready parameters
  const formatApiFilters = (filters, dateType) => {
    if (filters.method === "all") {
      filters.method = "";
    }
    return {
      dueAmount: filters.dueAmount || null,
      fromDate: dateType == null ? filters.fromDate : null,
      toDate: dateType == null ? filters.toDate : null,
      method: filters.method,
      amount: filters.amount || null,
      joinedFrom: dateType === "joined" ? filters.fromDate : null,
      joinedTo: dateType === "joined" ? filters.toDate : null,
      expiryFrom: dateType === "expiry" ? filters.fromDate : null,
      expiryTo: dateType === "expiry" ? filters.toDate : null,
      startFrom: dateType === "start" ? filters.fromDate : null,
      startTo: dateType === "start" ? filters.toDate : null,
      plan: filters.plan,
      isActive:
        filters.isActive === "all" ? null : filters.isActive == "1" ? 1 : 0,
    };
  };

  useEffect(() => {
    if (reportType === "members") {
      getMembersCountFilter();
    } else if (reportType === "payments") {
      getPaymentsCount();
    }
  }, [filters, reportType]);

  const resetFilters = () => {
    console.log("reset filters");
    setFilters({
      dueAmount: "",
      amount: "",
      method: "",
      fromDate: "",
      toDate: "",
      plan: "",
      isActive: "all",
    });
    setDateType("joined");
  };

  const handleExport = () => {
    const processedFilters =
      reportType === "members"
        ? formatApiFilters(filters, dateType)
        : reportType === "payments"
          ? formatApiFilters(filters, null)
          : {};

    onExport({
      reportType: reportType,
      filters: processedFilters,
    });
  };

  useEffect(() => {
    setFilters((prev) => ({
      ...prev, // Keeps dueAmount, plan, and isActive intact
      fromDate: "", // Clears out the 'From' input state
      toDate: "", // Clears out the 'To' input state
    }));
  }, [dateType]);

  const hasActiveFilters =
    filters.name ||
    filters.plan ||
    filters.dueAmount ||
    filters.fromDate ||
    filters.toDate ||
    filters.isActive !== null ||
    filters.amount !== null;
  filters.method;

  const getMembersCountFilter = async () => {
    try {
      const apiFilters = formatApiFilters(filters, dateType);
      const response = await getAllMembersCountByFilters(
        profile?.ownerId,
        apiFilters,
      );
      if (response.status == 202) {
        if (response.data > 0) {
          setCount(response.data);
        } else {
          setCount(0);
        }
      }
    } catch (error) {
      toast.error(
        "Something went wrong while fetching count, please try again a while later",
      );
    } finally {
    }
  };

  const getPaymentsCount = async () => {
    try {
      const apiFilters = formatApiFilters(filters, null);
      const response = await getAllPaymentsCountByFilters(
        profile?.ownerId,
        apiFilters,
      );
      if (response.status == 202) {
        if (response.data > 0) {
          setPaymentCount(response.data);
        } else {
          setPaymentCount(0);
        }
      }
    } catch (error) {
      toast.error(
        "Something went wrong while fetching count, please try exporting a while later",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans(profile?.gymId);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full sm:max-w-2xl rounded-2xl p-0 overflow-hidden flex flex-col max-h-[90dvh]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onCloseAutoFocus={() => {
          resetFilters(); // Fires immediately after the modal closes and returns focus
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <DialogHeader className="border-b px-6 py-5 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="h-5 w-5" />
            Export Gym Data
          </DialogTitle>
          <DialogPrimitive.Close asChild>
            <button
              type="button"
              className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity outline-none"
              onClick={resetFilters}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogPrimitive.Close>

          <DialogDescription>
            Download your gym data reports, including members, payments, and
            other business records for easy tracking and analysis.
          </DialogDescription>
        </DialogHeader>

        {/* ── Scrollable body ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 no-scrollbar">
          {/* Report Type */}
          <div>
            <h3 className="font-medium mb-3">Report Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Members Button */}
              <button
                onClick={() => {
                  if (reportType !== "members") {
                    setReportType("members");
                    resetFilters(); // Resets filters only when switching to members
                  }
                }}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  reportType === "members"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex gap-3">
                  <Users className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Members</p>
                    <p className="text-sm text-muted-foreground">
                      Active and inactive members.
                    </p>
                  </div>
                </div>
              </button>
              {/* Payments Button */}
              <button
                onClick={() => {
                  if (reportType !== "payments") {
                    setReportType("payments");
                    resetFilters(); // Resets filters only when switching to payments
                  }
                }}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  reportType === "payments"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex gap-3">
                  <CreditCard className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Payments</p>
                    <p className="text-sm text-muted-foreground">
                      Payment history and revenue.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ── Member Filters (only when Members is selected) ───────── */}
          {/* {reportType === "members" && ( */}
          <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {reportType === "members"
                    ? "Member Filters"
                    : "Payment Filters"}
                </span>

                {hasActiveFilters && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0 ml-auto sm:ml-0">
                    Active
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="hidden sm:flex h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 shrink-0"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Basic Filters – 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Paid Amount */}
              {reportType === "payments" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">
                    Paid Amount
                  </Label>
                  <Input
                    placeholder="Paid..."
                    value={filters.amount}
                    onChange={(e) =>
                      setFilters({ ...filters, amount: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Due Amount */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  Due Amount
                </Label>
                <Input
                  type="number"
                  placeholder="Dues..."
                  value={filters.dueAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, dueAmount: e.target.value })
                  }
                />
              </div>

              {/* Plan */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  Plan
                </Label>
                <Select
                  value={filters.plan || "all"}
                  onValueChange={(val) =>
                    setFilters({
                      ...filters,
                      plan: val === "all" ? "" : val,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Plans">
                      <span className="truncate block text-left">
                        {filters.plan || "All Plans"}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-w-[250px]">
                    <SelectItem value="all">All Plans</SelectItem>
                    {plans.map((p, idx) => (
                      <SelectItem key={idx} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              {reportType === "members" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">
                    Status
                  </Label>
                  <Select
                    value={
                      filters.isActive === null
                        ? "all"
                        : filters.isActive.toString()
                    }
                    onValueChange={(val) =>
                      setFilters({
                        ...filters,
                        isActive: val === "all" ? null : Number(val),
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {reportType === "members" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">
                    Filter Date By
                  </Label>
                  <Select value={dateType} onValueChange={setDateType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joined">Joining Date</SelectItem>
                      <SelectItem value="start">Start Date</SelectItem>
                      <SelectItem value="expiry">Expiry Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {reportType === "payments" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">
                    Method
                  </Label>
                  <Select
                    value={filters.method || ""}
                    onValueChange={(val) =>
                      setFilters({ ...filters, method: val })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Date Filters – 3-col grid on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Filter Date By */}
              {/* Date From */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  From
                </Label>
                <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal px-3",
                        !filters.fromDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {filters.fromDate
                          ? format(parseISO(filters.fromDate), "dd MMM yyyy")
                          : "Pick a date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  {/* FIXED LAYOUT: Added a strict min/max height wrapper framework class */}
                  <PopoverContent
                    className="w-auto p-0 h-[300px] overflow-hidden flex flex-col justify-start"
                    align="end"
                  >
                    <Calendar
                      mode="single"
                      selected={
                        filters.fromDate
                          ? parseISO(filters.fromDate)
                          : undefined
                      }
                      defaultMonth={
                        filters.fromDate
                          ? parseISO(filters.fromDate)
                          : new Date()
                      }
                      onSelect={(date) => {
                        setFilters((prev) => ({
                          ...prev,
                          fromDate: date ? format(date, "yyyy-MM-dd") : "",
                        }));
                        setDateFromOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  To
                </Label>
                <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal px-3",
                        !filters.toDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {filters.toDate
                          ? format(parseISO(filters.toDate), "dd MMM yyyy")
                          : "Pick a date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 h-[300px] overflow-hidden flex flex-col justify-start"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={
                        filters.toDate ? parseISO(filters.toDate) : undefined
                      }
                      defaultMonth={
                        filters.toDate ? parseISO(filters.toDate) : new Date()
                      }
                      onSelect={(date) => {
                        setFilters((prev) => ({
                          ...prev,
                          toDate: date ? format(date, "yyyy-MM-dd") : "",
                        }));
                        setDateToOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Total search record count - FIXED LAYOUT */}
              <div className="flex flex-col items-center justify-start gap-1.5 w-full">
                <Label className="text-xs font-bold uppercase text-center text-muted-foreground block w-full">
                  Records Found
                </Label>
                <div className="text-2xl font-bold dark:text-white flex justify-center items-center gap-4 h-10 w-full">
                  {/* Only the dynamic Count is affected by loading state */}
                  {loading ? (
                    <Skeleton className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  ) : (
                    <span className="text-black dark:text-white">
                      {reportType === "members" ? count : paymentCount}
                    </span>
                  )}

                  {/* Vertical Separator - Independent and Mobile Only */}
                  {hasActiveFilters && (
                    <div className="h-5 w-[1px] bg-border sm:hidden shrink-0" />
                  )}

                  {/* Clear Button - Independent and Mobile Only */}
                  {hasActiveFilters && (
                    <Button
                      // variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 sm:hidden shrink-0 dark:bg-white bg-black dark:text-black text-white"
                    >
                      {/* <X className="h-3 w-3" /> */}
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Export Format */}
          <div className="rounded-xl border bg-muted/30 p-4 flex items-start gap-3">
            <FileSpreadsheet className="h-9 w-9 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-sm leading-none">Export Format</p>
              <p className="text-sm text-muted-foreground mt-1">
                Microsoft Excel (.xlsx)
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="border-t px-4 py-3 flex flex-col sm:flex-row justify-end gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={
              exporting ||
              (reportType === "payments" ? paymentCount : count) <= 0
            }
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {exporting
              ? "Preparing…"
              : (reportType === "payments" ? paymentCount : count) <= 0
                ? "No Data Available to Export"
                : "Export Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
