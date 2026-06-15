import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import html2pdf from "html2pdf.js";
import { InvoiceTemplate } from "./InvoiceTemplate";
import { format, parseISO } from "date-fns";
import { createRoot } from "react-dom/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  DownloadCloud,
  FileDown,
  FolderDown,
  HardDriveDownload,
  Search,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProfile } from "../contexts/ProfileContext";
import { getAllPaymentsOfOwner } from "../apis/backend_apis";
import { toast } from "sonner";

const mockData = [
  { id: "INV001", date: "2026-04-01", amount: 999, status: "Success" },
  { id: "INV002", date: "2026-03-01", amount: 999, status: "Success" },
  { id: "INV003", date: "2026-02-01", amount: 999, status: "Failed" },
];

export default function PaymentHistoryTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt"); // Default column
  const [sortDir, setSortDir] = useState("desc"); // Default direction
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;
  const { profile } = useProfile();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [payments, setPayments] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [filters, setFilters] = useState({
    amount: "",
    status: "",
    method: "",
    startDate: "", // Matches @Param "joinedFrom"
    endDate: "", // Matches @Param "joinedTo"
  });

  const filteredData = useMemo(() => {
    return mockData.filter((item) =>
      item.id.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  useEffect(() => {
    fetchPaymentsHistory();
  }, [currentPage, pageSize, sortBy, sortDir, profile?.ownerId, filters]);

  async function fetchPaymentsHistory() {
    setLoading(true);
    if (!profile?.ownerId) {
      setLoading(false);
      return;
    }
    const apiFilters = {
      amount: filters.amount || "",
      status: filters.status ? filters.status : "",
      startDate: filters.startDate ? filters.startDate : "",
      endDate: filters.endDate ? filters.endDate : "",
    };
    try {
      const response = await getAllPaymentsOfOwner(
        profile.ownerId,
        currentPage,
        pageSize,
        sortBy,
        sortDir,
        apiFilters,
      );
      console.log(currentPage);
      if (response.status === 202 || response.data.statusCodeValue === 202) {
        setPayments(response.data.content || []);
        setTotalPages(response?.data?.page?.totalPages ?? 0);
        setTotalElements(response?.data?.page?.totalElements ?? 0);
        setPageSize(response.data.page.size);
        if (
          currentPage >= response.data.totalPages &&
          response.data.totalPages > 0
        ) {
          setCurrentPage(0);
        } else {
          setCurrentPage(response?.data?.page?.number ?? 0);
        }
      } else if (response.status === 404) {
        if (
          response.data &&
          response.data.message &&
          response.data.message !== "100"
        ) {
          toast.error(
            "Something went wrong while fetching payments. Please try again",
          );
          // Member already exists with the name
        }
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
      toast.error(
        "Something went wrong while fetching payment history. Please try again later.",
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  const emptyRows = pageSize - payments.length;
  const safeTotalPages = totalPages === 0 ? 1 : totalPages;
  const displayStart = totalElements === 0 ? 0 : currentPage * pageSize + 1;

  const displayEnd =
    totalElements === 0
      ? 0
      : Math.min((currentPage + 1) * pageSize, totalElements);

  const formatDate = (rawDate) => {
    if (!rawDate) return "N/A"; // Handle empty dates

    const dateObj = new Date(rawDate);

    // Return the formatted string
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const resetFilters = () => {
    if (profile.planName === "No Active Plan") {
      // 1. Show the error toast
      toast.error(
        "You need an active plan to use this functionality. Please subscribe to a plan first.",
      );
      setLoading(false);
      return;
    }
    setFilters({
      amount: "",
      status: "",
      method: "",
      startDate: "",
      endDate: "",
    });
    setIsFilterOpen(false);
    setCurrentPage(0);
  };

  function getExpiryBg(status) {
    // Constant backgrounds: Red for expired/today, Blue for future
    if (status == "FAILED") return "bg-red-500";
    return "bg-blue-500";
  }

  const handleDownload = (payment) => {
    if (!payment.invoiceUrl) return;

    const link = document.createElement("a");
    link.href = payment.invoiceUrl;
    link.target = "_blank"; // Razorpay forces this anyway
    link.rel = "noopener noreferrer";
    link.click();
  };

  const handleSort = (columnName) => {
    if (sortBy === columnName) {
      // If same column clicked, toggle direction
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      // If new column clicked, set it and default to asc
      setSortBy(columnName);
      setSortDir("asc");
    }
    // Reset to first page when sorting changes
    setCurrentPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Payment History</h3>
          <p className="text-sm text-muted-foreground">
            Track payments and download invoices
          </p>
        </div>
      </div>

      {/* Table */}
      {/* <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length ? (
              paginatedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.id}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {item.date}
                  </TableCell>

                  <TableCell className="text-right font-medium">
                    ₹{item.amount}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        item.status === "Success"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(item)}
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No payment history found
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div> */}

      {/* Mobile Filters */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="md:hidden flex gap-2 rounded-full shadow-sm w-full mb-2 mt-2"
          >
            <Search className="size-4" />
            <span>Search & Filter</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[92%] max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Search Payment History</DialogTitle>
            <h6 className="text-red-600 font-semibold">
              Filter works automatically, just select the values
            </h6>
            <DialogDescription className="sr-only">
              Filter and search through your payment history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 1. Amount Input */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Amount
              </Label>
              <Input
                placeholder="Enter an amount..."
                value={filters.amount}
                onChange={(e) =>
                  setFilters({ ...filters, amount: e.target.value })
                }
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Status
              </Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                  {/* Optional: Add a 'Clear' or 'All' option if your enum allows null/empty */}
                  <SelectItem value="all">All Statuses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 4. Date Range */}
            {/* <div className="grid grid-cols-2 gap-4"> */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                From
              </Label>
              <Popover>
                {" "}
                {/* Changed Dialog to Popover */}
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal px-3",
                      !filters.startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {filters.startDate
                        ? format(parseISO(filters.startDate), "PPP")
                        : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    defaultMonth={
                      filters.startDate
                        ? parseISO(filters.startDate)
                        : new Date()
                    }
                    selected={
                      filters.startDate
                        ? parseISO(filters.startDate)
                        : undefined
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

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                To
              </Label>
              <Popover>
                {" "}
                {/* Changed Dialog to Popover */}
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal px-3",
                      !filters.endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {filters.endDate
                        ? format(parseISO(filters.endDate), "PPP")
                        : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    defaultMonth={
                      filters.endDate ? parseISO(filters.endDate) : new Date()
                    }
                    selected={
                      filters.endDate ? parseISO(filters.endDate) : undefined
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
            {/* </div> */}
          </div>

          <DialogFooter>
            <Button onClick={resetFilters} className="w-full rounded-full">
              Clear Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pc Filter logic */}
      <Card className="hidden md:block p-4 bg-card border shadow-sm mb-2 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
          {/* 1. Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Amount
            </Label>
            <Input
              type="number"
              placeholder="Amount..."
              value={filters.amount}
              onChange={(e) =>
                setFilters({ ...filters, amount: e.target.value })
              }
            />
          </div>

          {/* 2. Plan Filter */}
          <div className="space-y-1.5 min-w-0">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                <SelectItem value="FAILED">FAILED</SelectItem>
                {/* Optional: Add a 'Clear' or 'All' option if your enum allows null/empty */}
                <SelectItem value="all">All Statuses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. Date From */}

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
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    filters.startDate ? parseISO(filters.startDate) : undefined
                  }
                  defaultMonth={
                    filters.startDate ? parseISO(filters.startDate) : new Date()
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

          {/* 4. Date To */}
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
              <PopoverContent className="w-auto p-0" align="start">
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

          {/* 7. Actions */}
          <Button
            onClick={resetFilters}
            variant="outline"
            className="w-full rounded-md"
          >
            Clear
          </Button>
        </div>
      </Card>

      <div className="bg-card dark:bg-zinc-950 text-card-foreground rounded-xl shadow border dark:border-gray-800 p-3 md:p-8">
        <div className="relative overflow-auto h-[408px] no-scrollbar border rounded-lg">
          {" "}
          {/* Fixed height to prevent jumping */}
          <Table>
            <TableHeader className="sticky top-0 z-40">
              <TableRow>
                <TableHead
                  onClick={() => handleSort("amount")} // Matches SQL alias 'AS memberName'
                  className="sticky left-0 top-0 z-50 min-w-[150px] text-white bg-zinc-950 select-none text-center border-b shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Amount</span>
                    <div className="flex flex-row space-y-1  cursor-pointer">
                      {/* Highlight ArrowUp if sorting by memberName and order is asc */}
                      <ArrowUp
                        className={`size-3 ${sortBy === "amount" && sortDir === "asc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                      {/* Highlight ArrowDown if sorting by memberName and order is desc */}
                      <ArrowDown
                        className={`size-3 ${sortBy === "amount" && sortDir === "desc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                    </div>
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort("method")}
                  className="sticky top-0 z-40 bg-zinc-950 text-white text-center border-b cursor-pointer select-none"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Method</span>
                    <div className="flex flex-row -space-y-1 cursor-pointer">
                      <ArrowUp
                        className={`size-3 ${sortBy === "method" && sortDir === "asc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                      <ArrowDown
                        className={`size-3 ${sortBy === "method" && sortDir === "desc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                    </div>
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort("status")}
                  className="sticky top-0 z-40 bg-zinc-950 text-white text-center border-b cursor-pointer select-none"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Status</span>
                    <div className="flex flex-row -space-y-1  cursor-pointer">
                      <ArrowUp
                        className={`size-3 ${sortBy === "status" && sortDir === "asc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                      <ArrowDown
                        className={`size-3 ${sortBy === "status" && sortDir === "desc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                    </div>
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort("createdAt")}
                  className="sticky top-0 z-40 bg-zinc-950 text-white text-center border-b cursor-pointer select-none"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Date</span>
                    <div className="flex flex-row -space-y-1  cursor-pointer">
                      <ArrowUp
                        className={`size-3 ${sortBy === "createdAt" && sortDir === "asc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                      <ArrowDown
                        className={`size-3 ${sortBy === "createdAt" && sortDir === "desc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                    </div>
                  </div>
                </TableHead>
                <TableHead className="sticky top-0 z-40 bg-zinc-950 text-white text-center border-b cursor-pointer select-none">
                  Download
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                /* LOADING STATE: Skeleton Rows */
                Array.from({ length: 10 }).map((_, i) => (
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
              ) : Array.isArray(payments) && payments.length > 0 ? (
                payments.map((payment, index) => (
                  <TableRow
                    key={index}
                    className="dark:bg-card dark:text-white"
                  >
                    <TableCell
                      className={cn(
                        "sticky left-0 z-10 font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] bg-card min-w-[150px] text-center",
                      )}
                    >
                      ₹{payment.amount}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex w-18 h-6  items-center justify-center rounded-md bg-black dark:bg-white px-2 shadow-2xl">
                        <span className="block w-full text-center truncate text-xs font-medium text-white dark:text-black uppercase">
                          {payment.method || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className={`inline-flex w-24 h-6 items-center justify-center rounded-md px-2 shadow-2xl ${getExpiryBg(payment.status)}`}
                      >
                        <span className="block w-full text-center truncate text-[10px] font-bold text-white dark:text-black uppercase">
                          {/* {getExpiryText(member.expiry)} */}
                          {payment.status == "CAPTURED"
                            ? "SUCCESS"
                            : payment.status || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {/* {payment.status} */}
                      {formatDate(payment.createdAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      {payment.invoiceUrl ? (
                        <a
                          href={payment.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-8 h-8 items-center justify-center rounded-md bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4 text-white dark:text-black" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                /* EMPTY STATE MESSAGE */
                <TableRow>
                  <TableCell colSpan={8} className="h-22 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <p className="text-lg font-medium">
                        No payment history found
                      </p>
                      <p className="text-sm">
                        Try making a payment or check your connection.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Placeholder Rows to maintain fixed height */}
              {/* {emptyRows > 0 &&
                Array.from({ length: emptyRows }).map((_, i) => (
                  <TableRow key={`empty-${i}`} className="border-transparent">
                    <TableCell className="sticky left-0 bg-card py-6 border-transparent" />
                    <TableCell className="py-6 border-transparent" />
                    <TableCell className="py-6 border-transparent" />
                    <TableCell className="py-6 border-transparent" />
                    <TableCell className="py-6 border-transparent" />
                    <TableCell className="py-6 border-transparent" />
                    <TableCell className="py-6 border-transparent" />
                    <TableCell className="py-6 border-transparent" />
                    <TableCell className="py-6 border-transparent" />
                  </TableRow>
                ))} */}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {/* <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div> */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing {totalElements === 0 ? 0 : displayStart} to {displayEnd} of{" "}
          {totalElements} payments
        </p>

        <div className="order-1 sm:order-2">
          <Pagination className="w-auto mx-0 justify-end">
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 0) setCurrentPage((v) => v - 1);
                  }}
                  className={
                    currentPage === 0
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              <PaginationItem>
                <span className="flex h-9 items-center justify-center px-3 text-sm font-medium whitespace-nowrap">
                  {/* Page {(currentPage || 0) + 1} of {totalPages || 0} */}
                  Page {totalElements === 0 ? 0 : currentPage + 1} of{" "}
                  {safeTotalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages - 1)
                      setCurrentPage((v) => v + 1);
                  }}
                  className={
                    currentPage >= totalPages - 1 || totalElements === 0
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
