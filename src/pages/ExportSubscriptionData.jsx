import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  ReceiptIndianRupee,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  Loader2,
  Download,
  X,
  SlidersHorizontal,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useGymStore } from "../store/gymStore";
import { exportSubcriptions, getPaymentHistory } from "../apis/backend_apis";
import { toast } from "sonner";
import { useProfile } from "../contexts/ProfileContext";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadExcel } from "../utils/downloadExcel";

export default function ExportSubscriptionData({
  open,
  onOpenChange,
  //   filters,
  //   setFilters,
  paymentCount,
  exporting,
  handleExport,
  reportType,
  setReportType,
}) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const plans = useGymStore((state) => state.plans);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const { profile } = useProfile();

  const [filters, setFilters] = useState({
    amount: "",
    method: "",
    fromDate: "", // Matches @Param "joinedFrom"
    toDate: "", // Matches @Param "joinedTo"
    status: "",
  });

  const getPaymentHistoryCount = async () => {
    if (filters.method === "all") {
      filters.method = "";
    }
    const apiFilters = {
      amount: filters.amount || "",
      status: filters.status ? filters.status : "",
      startDate: filters.startDate ? filters.startDate : "",
      endDate: filters.endDate ? filters.endDate : "",
      method: filters.method ? filters.method : "",
    };
    try {
      const response = await getPaymentHistory(profile.ownerId, apiFilters);
      console.log(response);
      if (response.status == 202) {
        if (response.data > 0) {
          setCount(response.data);
        } else {
          setCount(0);
        }
      }
    } catch (error) {
      toast.error(
        "Something went wrong while fetching count, please try exporting a while later",
      );
    } finally {
    }
  };

  const getSubscriptionReport = async () => {
    setLoading(true);
    if (filters.method === "all") {
      filters.method = "";
    }

    if (filters.status === "all") {
      filters.status = "";
    }
    const apiFilters = {
      amount: filters.amount || "",
      status: filters.status ? filters.status : "",
      startDate: filters.startDate ? filters.startDate : "",
      endDate: filters.endDate ? filters.endDate : "",
      method: filters.method ? filters.method : "",
    };
    try {
      const res = await exportSubcriptions(profile?.ownerId, apiFilters);
      downloadExcel(res.data, "subscriptions-report.xlsx");
    } catch (error) {
      toast.error("Something went wong");
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters =
    filters.fromDate ||
    filters.toDate ||
    filters.amount !== null ||
    filters.method ||
    filters.status;

  const resetFilters = () => {
    console.log("reset filters");
    setFilters({
      amount: "",
      method: "",
      fromDate: "",
      toDate: "",
      method: "all",
      status: "all",
    });
  };

  useEffect(() => {
    getPaymentHistoryCount();
  }, [filters]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className=" w-[calc(100vw-1rem)]
    max-w-[95vw]
    sm:max-w-2xl
    rounded-xl sm:rounded-2xl
    p-0
    overflow-hidden
    flex
    flex-col
    max-h-[95dvh]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onCloseAutoFocus={() => {
          resetFilters(); // Fires immediately after the modal closes and returns focus
        }}
      >
        {/* ── Fixed Header ─────────────────────────────────────────── */}
        <DialogHeader className="border-b px-4 sm:px-6 py-4 sm:py-5 shrink-0 relative text-left">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold pr-8">
            <ReceiptIndianRupee className="h-5 w-5 text-primary shrink-0" />
            <span className="leading-none">
              Export Subscription Billing Report
            </span>
          </DialogTitle>

          <DialogPrimitive.Close
            className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity outline-none"
            disabled={loading}
            onClick={() => {
              if (resetFilters) resetFilters();
              onOpenChange(false);
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          <DialogDescription className="text-left mt-2">
            Export your subscription billing history with payment details,
            transaction status, and receipts.
          </DialogDescription>
        </DialogHeader>

        {/* ── Scrollable Body ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 no-scrollbar">
          {/* Summary Metric Component */}

          {/* Filters Container Wrapper Card */}

          <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap">
                  Subscription Filters
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
              {/* Due Amount */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  Amount
                </Label>
                <Input
                  disabled={loading}
                  type="number"
                  placeholder="amount..."
                  value={filters.amount}
                  onChange={(e) =>
                    setFilters({ ...filters, amount: e.target.value })
                  }
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  Status
                </Label>
                <Select
                  disabled={loading}
                  value={filters.status}
                  onValueChange={(val) =>
                    setFilters({
                      ...filters,
                      status: val,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  Method
                </Label>
                <Select
                  disabled={loading}
                  value={filters.method || ""}
                  onValueChange={(val) =>
                    setFilters({ ...filters, method: val })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Date Filters – 3-col grid on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Filter Date By */}
              {/* Date From */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  Date From
                </Label>
                <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal px-3", // Added padding
                        !filters.startDate && "text-muted-foreground",
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />{" "}
                      {/* shrink-0 prevents icon squashing */}
                      <span className="truncate">
                        {" "}
                        {/* truncate prevents text going out of the field */}
                        {filters.startDate
                          ? format(parseISO(filters.startDate), "PPP")
                          : "Pick a date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 h-[300px] overflow-hidden flex flex-col justify-start"
                    align="end"
                  >
                    <Calendar
                      mode="single"
                      selected={
                        filters.startDate
                          ? parseISO(filters.startDate)
                          : undefined
                      }
                      defaultMonth={
                        filters.startDate
                          ? parseISO(filters.startDate)
                          : new Date()
                      }
                      onSelect={(date) => {
                        if (date) {
                          // Set to 00:00:00 for the beginning of the start date
                          date.setHours(0, 0, 0, 0);
                          const localDateTime = format(
                            date,
                            "yyyy-MM-dd'T'HH:mm:ss",
                          );
                          setFilters((prev) => ({
                            ...prev,
                            startDate: localDateTime,
                          }));
                        } else {
                          setFilters((prev) => ({ ...prev, startDate: "" }));
                        }
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
                  Date To
                </Label>
                <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal px-3", // Added padding
                        !filters.endDate && "text-muted-foreground",
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />{" "}
                      {/* shrink-0 prevents icon squashing */}
                      <span className="truncate">
                        {" "}
                        {/* truncate prevents text going out of the field */}
                        {filters.endDate
                          ? format(parseISO(filters.endDate), "PPP")
                          : "Pick a date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 h-[300px] overflow-hidden flex flex-col justify-start"
                    align="end"
                  >
                    <Calendar
                      mode="single"
                      selected={
                        filters.endDate ? parseISO(filters.endDate) : undefined
                      }
                      defaultMonth={
                        filters.endDate ? parseISO(filters.endDate) : new Date()
                      }
                      onSelect={(date) => {
                        if (date) {
                          // Set to 23:59:59 so we include transactions from the entire selected day
                          date.setHours(23, 59, 59, 999);
                          const localDateTime = format(
                            date,
                            "yyyy-MM-dd'T'HH:mm:ss",
                          );

                          setFilters((prev) => ({
                            ...prev,
                            endDate: localDateTime,
                          }));
                        } else {
                          setFilters((prev) => ({ ...prev, endDate: "" }));
                        }
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
                  {/* Only the Count is affected by loading state */}
                  {loading ? (
                    <Skeleton className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  ) : (
                    <span className="text-black dark:text-white">{count}</span>
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
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Export targeting format summary layout container */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4 h-15">
              <FileSpreadsheet className="h-9 w-9 text-green-600 shrink-0" />
              <div className="space-y-0.5">
                <p className="font-medium text-sm text-card-foreground">
                  Microsoft Excel
                </p>
                <p className="text-xs text-muted-foreground leading-normal">
                  Export as optimized .xlsx spreadsheet
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Fixed Footer ─────────────────────────────────────────── */}
        {/* <DialogFooter className="border-t px-6 py-4 flex justify-end gap-2 shrink-0 bg-background sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="min-w-[180px]"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing Report...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Revenue Report
              </>
            )}
          </Button>
        </DialogFooter> */}
        {/* ── Fixed Footer ─────────────────────────────────────────── */}
        <div className="border-t px-6 py-4 bg-background shrink-0">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button
              disabled={loading}
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>

            <Button
              onClick={getSubscriptionReport}
              disabled={loading || count <= 0}
              className="sm:w-auto w-full min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Preparing Report...
                </>
              ) : count <= 0 ? (
                <>
                  {/* No icon needed here, or keep a muted download icon */}
                  No Data Available to Export
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Revenue Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
