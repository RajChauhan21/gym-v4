import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import React from "react";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Search,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useGymStore } from "../../store/gymStore";
import { toast } from "sonner";
import { getAllPayments } from "../../apis/backend_apis";
import { useProfile } from "../../contexts/ProfileContext";

export default function PaymentsTable() {
  const [currentPage, setCurrentPage] = useState(0); // backend uses 0-based
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const payments = useGymStore((state) => state.payments) ?? [];
  const addPayment = useGymStore((state) => state.addPayment);
  const setPayments = useGymStore((state) => state.setPayments);
  const [totalElements, setTotalElements] = useState(0);
  const plans = useGymStore((state) => state.plans);
  const [errors, setErrors] = useState({});
  const members = useGymStore((state) => state.members);
  const { profile } = useProfile();

  const totalRevenue = Array.isArray(payments)
    ? payments.reduce((acc, curr) => acc + curr.amount, 0)
    : 0;
  const failedCount = payments.filter((p) => p.status === "Failed").length;
  const [dateToOpen, setDateToOpen] = useState(false);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [method, setMethod] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("paymentDate"); // Default column
  const [sortDir, setSortDir] = useState("desc"); // Default direction
  const [filters, setFilters] = useState({
    name: "",
    amount: "",
    plan: "",
    method: "",
    from: "",
    to: "",
  });

  useEffect(() => {
    async function fetchPayments() {
      if (!profile?.ownerId) return;

      try {
        const response = await getAllPayments(
          profile.ownerId,
          currentPage,
          pageSize,
          sortBy,
          sortDir,
        );
        setPayments(response.data.content);
        setTotalPages(response.data.page.totalPages);
        setTotalElements(response.data.page.totalElements);
        setPageSize(response.data.page.size);
        if (
          currentPage >= response.data.totalPages &&
          response.data.totalPages > 0
        ) {
          setCurrentPage(0);
        } else {
          setCurrentPage(response.data.page.number);
        }
        console.log(currentPage);
        console.log({
          page: response.data.number,
          totalPages: response.data.totalPages,
          size: response.data.size,
          totalElements: response.data.totalElements,
        });

      } catch (error) {
        console.log(error);
      }
    }

    fetchPayments();
  }, [currentPage, pageSize, sortBy, sortDir, profile?.ownerId]);

  {
    /* Calculate values with safe fallbacks */
  }
  const safeTotal = totalElements || 0;
  const safeSize = pageSize || 10;
  const safePage = currentPage || 0;

  const displayStart = safeTotal === 0 ? 0 : safePage * safeSize + 1;
  const displayEnd = Math.min((safePage + 1) * safeSize, safeTotal);

  // To keep height fixed, calculate how many empty rows to fill
  const emptyRows = pageSize - payments.length;

  const resetFilters = () => {
    setSearchTerm("");
    setFilterPlan("all");
    setFilterStatus("all");
    setDateFrom(null);
    setDateTo(null);
    setCurrentPage(1);
    setIsFilterOpen(false);
    setMethod("all");
  };

  const [loading, setLoading] = useState(true);
  const [openPayment, setOpenPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    name: undefined,
    plan: "",
    amount: "",
    method: "",
    date: "",
    status: "Success",
  });

  const validate = () => {
    let newErrors = {};
    const textRegex = /^[a-zA-Z\s'.-]+$/;

    if (newPayment.name != null) {
      newErrors.name = "member name required";
    } else if (!textRegex.test(newPayment.name)) {
      newErrors.name = "Member name should only contain letters";
    }

    if (!newPayment.amount.trim()) {
      newErrors.amount = "Amount required";
    }

    if (!newPayment.plan.trim()) {
      newErrors.plan = "Plan required";
    }

    if (!newPayment.method.trim()) {
      newErrors.method = "Method required";
    }

    if (!newPayment.date) {
      newErrors.date = "Date required";
    }
    return newErrors;
  };

  const handleAddPayment = () => {
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setLoading(false);
      return;
    }
    const payment = {
      ...newPayment,
      time: new Date().toLocaleTimeString(),
      amount: Number(newPayment.amount),
    };

    addPayment(payment);
    setOpenPayment(false);

    setNewPayment({
      name: null,
      plan: "",
      amount: "",
      method: "",
      date: "",
      status: "Success",
    });

    setErrors({});
    toast.success("Payement recorded successfully");
  };

  const resetForm = () => {
    setNewPayment({
      name: null,
      plan: "",
      amount: "",
      method: "",
      date: "",
      status: "Success",
    });
    setErrors({});
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

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  if (loading) {
    return <Loader text="Loading Payments...." />;
  }

  return (
    <div className="p-3">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Payments</h2>
      <div className="flex items-center justify-between mb-4">
        <Dialog
          open={openPayment}
          onOpenChange={(openPayment) => {
            setOpenPayment(openPayment);
            if (!openPayment) resetForm(); // ✅ Clears data & errors on close
          }}
        >
          <DialogTrigger asChild>
            <Button className="rounded-md flex gap-2">+ Record Payment</Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment</DialogTitle>
              <DialogPrimitive.Close
                className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity outline-none"
                onClick={resetForm} // Also clear form if they just close the modal
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </DialogHeader>

            <div className="space-y-4">
              {/* Member Name */}
              <div>
                <Label className="mb-1">Member</Label>
                <Select
                  value={newPayment.name}
                  onValueChange={(value) =>
                    setNewPayment({ ...newPayment, name: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member, i) => (
                      <SelectItem key={i} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="min-h-[20px]">
                  {errors?.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
              </div>

              {/* Plan */}
              <div>
                <Label className="mb-1">Plan</Label>
                <Select
                  value={newPayment.plan}
                  onValueChange={(value) =>
                    setNewPayment({ ...newPayment, plan: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan, i) => (
                      <SelectItem key={i} value={plan.name}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="min-h-[20px]">
                  {errors?.plan && (
                    <p className="text-red-500 text-sm">{errors.plan}</p>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <Label className="mb-1">Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={newPayment.amount}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, amount: e.target.value })
                  }
                />
                <div className="min-h-[20px]">
                  {errors?.amount && (
                    <p className="text-red-500 text-sm">{errors.amount}</p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="mb-1">Payment Method</Label>
                <Select
                  value={newPayment.method}
                  onValueChange={(value) =>
                    setNewPayment({ ...newPayment, method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <div className="min-h-[20px]">
                  {errors?.method && (
                    <p className="text-red-500 text-sm">{errors.method}</p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div>
                <Label className="mb-1">Date</Label>
                <Input
                  type="date"
                  value={newPayment.date}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, date: e.target.value })
                  }
                />
                <div className="min-h-[20px]">
                  {errors?.date && (
                    <p className="text-red-500 text-sm">{errors.date}</p>
                  )}
                </div>
              </div>

              <Button className="w-full" onClick={handleAddPayment}>
                Save Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- QUICK STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Card className="p-4 flex items-center gap-4 bg-green-500/5 border-green-500/20">
          <div className="p-2 bg-green-500 rounded-lg text-white">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">
              Total Collected
            </p>
            <p className="text-xl font-bold text-center dark:text-white">
              ₹{totalRevenue}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-red-500/5 border-red-500/20">
          <div className="p-2 bg-red-500 rounded-lg text-white">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">
              Failed Attempts
            </p>
            <p className="text-xl font-bold text-center text-red-600">
              {failedCount}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-blue-500/5 border-blue-500/20">
          <div className="p-2 bg-blue-500 rounded-lg text-white">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">
              Transactions
            </p>
            <p className="text-xl font-bold dark:text-white text-center">
              {payments.length}
            </p>
          </div>
        </Card>
      </div>

      {/* --- MOBILE FILTER BUTTON --- */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="md:hidden flex gap-2 rounded-full shadow-sm w-full mb-2"
          >
            <Search className="size-4" />
            <span>Search & Filter</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[92%] max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Search Payments</DialogTitle>
            <DialogDescription className="sr-only">
              Filter and search through your gym's payment history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 1. Name Input */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Member Name
              </Label>
              <Input
                placeholder="Type a name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 2. Plan Select */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Plan Type
              </Label>
              <Select onValueChange={setFilterPlan} value={filterPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans.map((plan, idx) => (
                    <SelectItem key={idx} value={plan.name}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Status Select */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Payment Status
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Payment Method
              </Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 4. Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  From
                </Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  To
                </Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsFilterOpen(false)}
              className="w-full rounded-full"
            >
              Apply Filters
            </Button>
            <Button onClick={resetFilters} className="w-full rounded-full">
              Clear Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- PC FILTER SECTION --- */}
      <Card className="hidden md:block p-4 bg-card border shadow-sm mb-2 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end">
          {/* 1. Member Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Member Name
            </Label>
            <Input
              placeholder="Search name..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          {/* 2. Plan Filter */}
          <div className="space-y-1.5 min-w-0">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Plan
            </Label>
            <Select
              value={filters.plan || "all"}
              onValueChange={(val) =>
                setFilters({ ...filters, plan: val === "all" ? "" : val })
              }
            >
              <SelectTrigger className="w-full max-w-[180px] overflow-hidden">
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

          {/* 3. Due Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Due Amount
            </Label>
            <Input
              type="number"
              placeholder="Amount..."
              value={filters.dueAmount}
              onChange={(e) =>
                setFilters({ ...filters, dueAmount: e.target.value })
              }
            />
          </div>

          {/* 5. Date From */}

          <div className="space-y-1.5">
            <Label>Date from</Label>
            <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal px-3", // Added padding
                    !filters.fromDate && "text-muted-foreground",
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />{" "}
                  {/* shrink-0 prevents icon squashing */}
                  <span className="truncate">
                    {" "}
                    {/* truncate prevents text going out of the field */}
                    {filters.fromDate
                      ? format(parseISO(filters.fromDate), "PPP")
                      : "Pick a date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    filters.fromDate ? parseISO(filters.fromDate) : undefined
                  }
                  defaultMonth={filters.fromDate ? parseISO(filters.fromDate) : new Date()}
                  onSelect={(date) => {
                    setFilters((prev) => ({
                      ...prev,
                      fromDate: date ? format(date, "yyyy-MM-dd") : "",
                    }));
                    setDateToOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 6. Date To */}
          <div className="space-y-1.5">
            <Label>Date to</Label>
            <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal px-3", // Added padding
                    !filters.toDate && "text-muted-foreground",
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />{" "}
                  {/* shrink-0 prevents icon squashing */}
                  <span className="truncate">
                    {" "}
                    {/* truncate prevents text going out of the field */}
                    {filters.toDate
                      ? format(parseISO(filters.toDate), "PPP")
                      : "Pick a date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    filters.toDate ? parseISO(filters.toDate) : undefined
                  }
                  defaultMonth={filters.toDate ? parseISO(filters.toDate) : new Date()}
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

      <div className="bg-card text-card-foreground rounded-xl shadow border dark:border-gray-800 p-3 md:p-8">
        <div className="overflow-auto h-[408px]">
          {" "}
          {/* Fixed height to prevent jumping */}
          <Table>
            {/* <TableHeader className="sticky top-0 z-30 bg-card"> */}
            <TableHeader className="sticky top-0 z-40 backdrop-blur-md">
              <TableRow>
                <TableHead
                  onClick={() => handleSort("memberName")} // Matches SQL alias 'AS memberName'
                  className="sticky left-0 top-0 z-30 min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] dark:text-gray-500 select-none  text-center"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Name</span>
                    <div className="flex flex-row space-y-1  cursor-pointer">
                      {/* Highlight ArrowUp if sorting by memberName and order is asc */}
                      <ArrowUp
                        className={`size-3 ${sortBy === "memberName" && sortDir === "asc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                      {/* Highlight ArrowDown if sorting by memberName and order is desc */}
                      <ArrowDown
                        className={`size-3 ${sortBy === "memberName" && sortDir === "desc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                    </div>
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort("membershipName")}
                  className="dark:text-gray-500 text-center"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Plan</span>
                    <div className="flex flex-row -space-y-1 cursor-pointer">
                      <ArrowUp
                        className={`size-3 ${sortBy === "membershipName" && sortDir === "asc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                      <ArrowDown
                        className={`size-3 ${sortBy === "membershipName" && sortDir === "desc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                    </div>
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort("amount")}
                  className="dark:text-gray-500 text-center"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Amount</span>
                    <div className="flex flex-row -space-y-1  cursor-pointer">
                      <ArrowUp
                        className={`size-3 ${sortBy === "amount" && sortDir === "asc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                      <ArrowDown
                        className={`size-3 ${sortBy === "amount" && sortDir === "desc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                    </div>
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort("paymentDate")}
                  className="dark:text-gray-500 text-center"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Date</span>
                    <div className="flex flex-row -space-y-1  cursor-pointer">
                      <ArrowUp
                        className={`size-3 ${sortBy === "paymentDate" && sortDir === "asc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                      <ArrowDown
                        className={`size-3 ${sortBy === "paymentDate" && sortDir === "desc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                    </div>
                  </div>
                </TableHead>
                <TableHead className="dark:text-gray-500 text-center">
                  Method
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {payments.map((payment, index) => (
                <TableRow key={index} className="dark:bg-card dark:text-white">
                  <TableCell
                    className={cn(
                      "sticky left-0 z-10 font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] bg-card min-w-[150px] text-center",
                    )}
                  >
                    {payment.memberName}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-muted">
                      {payment.membershipName || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    ₹{payment.amount}
                  </TableCell>
                  <TableCell className="text-center">
                    {payment.paymentDate}
                  </TableCell>
                  {/* <TableCell className="text-center">{payment.time}</TableCell> */}
                  <TableCell className="text-center">
                    {payment.method}
                  </TableCell>
                </TableRow>
              ))}

              {/* Placeholder Rows to maintain fixed height */}
              {emptyRows > 0 &&
                Array.from({ length: emptyRows }).map((_, i) => (
                  <TableRow key={`empty-${i}`} className="border-transparent">
                    <TableCell className="sticky left-0 bg-card py-6 border-transparent" />
                    <TableCell className="py-6 border-transparent" />
                    <TableCell className="py-6 border-transparent" />
                    <TableCell className="py-6 border-transparent" />
                    <TableCell className="py-6 border-transparent" />
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 3. Improved Pagination Controls (No overlap) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing {totalElements > 0 ? displayStart : 0} to {displayEnd} of{" "}
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
                  Page {(currentPage || 0) + 1} of {totalPages || 0}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage((v) => v + 1);
                  }}
                  className={
                    currentPage === totalPages - 1
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
