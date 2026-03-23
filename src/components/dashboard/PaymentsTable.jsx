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

export default function PaymentsTable() {
  const payments = useGymStore((state) => state.payments) ?? [];
  const addPayment = useGymStore((state) => state.addPayment);
  const plans = useGymStore((state) => state.plans);
  const [errors, setErrors] = useState({});

  // const totalRevenue = payments
  //   .filter((p) => p.status === "Success")
  //   .reduce((acc, curr) => acc + curr.amount, 0);
  const totalRevenue = Array.isArray(payments)
    ? payments
        .filter((p) => p.status === "Success")
        .reduce((acc, curr) => acc + curr.amount, 0)
    : 0;
  const failedCount = payments.filter((p) => p.status === "Failed").length;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [method, setMethod] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    // Reset to Page 1 whenever filters change to prevent "Empty Page" bugs
    setCurrentPage(1);
  }, [searchTerm, filterPlan, filterStatus, dateFrom, dateTo]);

  const filteredPayments = payments.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || p.plan === filterPlan;
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesMethod = method === "all" || p.method === method;
    // Date Range Logic
    const pDate = new Date(p.date);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    const matchesDate = (!from || pDate >= from) && (!to || pDate <= to);

    return (
      matchesName &&
      matchesPlan &&
      matchesStatus &&
      matchesDate &&
      matchesMethod
    );
  });

  // 1. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 2. Calculation Logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredPayments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // To keep height fixed, calculate how many empty rows to fill
  const emptyRows = itemsPerPage - currentData.length;

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
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [newPayment, setNewPayment] = useState({
    name: "",
    plan: "",
    amount: "",
    method: "",
    date: "",
    status: "Success",
  });

  const validate = () => {
    let newErrors = {};
    const textRegex = /^[a-zA-Z\s'.-]+$/;

    if (!newPayment.name.trim()) {
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
      name: "",
      plan: "",
      amount: "",
      method: "",
      date: "",
      status: "Success",
    });
    toast.success("Payement recorded successfully");
  };

  const sortedPayments = React.useMemo(() => {
    if (!sortConfig.key) return currentData;

    const sorted = [...currentData].sort((a, b) => {
      let valueA = a[sortConfig.key];
      let valueB = b[sortConfig.key];

      // handle numbers
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortConfig.direction === "asc"
          ? valueA - valueB
          : valueB - valueA;
      }

      // handle strings
      return sortConfig.direction === "asc"
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });

    return sorted;
  }, [currentData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
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
        <Dialog open={openPayment} onOpenChange={setOpenPayment}>
          <DialogTrigger asChild>
            <Button className="rounded-md flex gap-2">+ Record Payment</Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Member Name */}
              <div>
                <Label className="mb-1">Member</Label>
                <Input
                  placeholder="Enter member name"
                  value={newPayment.name}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, name: e.target.value })
                  }
                />
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
                  <SelectTrigger>
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

      {/* --- FILTER SECTION --- */}
      <Card className="hidden md:block p-4 bg-card border shadow-sm mb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          {/* Search by Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Member Name
            </Label>
            <Input
              placeholder="Search name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Plan Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Plan
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

          {/* Status Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Status
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

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Method
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

          {/* Date From */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              From Date
            </Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              To Date
            </Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Button onClick={resetFilters} className="w-full rounded-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <div className="bg-card text-card-foreground rounded-xl shadow border dark:border-gray-800 p-3 md:p-8">
        <div className="overflow-auto h-[450px]">
          {" "}
          {/* Fixed height to prevent jumping */}
          <Table>
            <TableHeader className="sticky top-0 z-30 bg-card">
              <TableRow>
                <TableHead
                  onClick={() => handleSort("name")}
                  className="sticky left-0 top-0 z-30 bg-card min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] dark:text-gray-500 text-center cursor-pointer"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Name</span>
                    <div className="flex flex-row -space-y-1">
                      <ArrowUp className="size-3" />
                      <ArrowDown className="size-3" />
                    </div>
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort("plan")}
                  className="dark:text-gray-500 text-center cursor-pointer"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Plan</span>
                    <div className="flex flex-row -space-y-1">
                      <ArrowUp className="size-3" />
                      <ArrowDown className="size-3" />
                    </div>
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort("amount")}
                  className="dark:text-gray-500 text-center cursor-pointer"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Amount</span>
                    <div className="flex flex-row -space-y-1">
                      <ArrowUp className="size-3" />
                      <ArrowDown className="size-3" />
                    </div>
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort("date")}
                  className="dark:text-gray-500 text-center cursor-pointer"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Date</span>
                    <div className="flex flex-row -space-y-1">
                      <ArrowUp className="size-3" />
                      <ArrowDown className="size-3" />
                    </div>
                  </div>
                </TableHead>

                <TableHead className="dark:text-gray-500 text-center">
                  Time
                </TableHead>
                <TableHead className="dark:text-gray-500 text-center">
                  Method
                </TableHead>
                <TableHead className="dark:text-gray-500 text-center">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedPayments.map((payment, index) => (
                <TableRow key={index} className="dark:bg-card dark:text-white">
                  <TableCell
                    className={cn(
                      "sticky left-0 z-10 font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] bg-card min-w-[150px] text-center",
                    )}
                  >
                    {payment.name}
                  </TableCell>
                  <TableCell className="text-center">{payment.plan}</TableCell>
                  <TableCell className="text-center">
                    ₹{payment.amount}
                  </TableCell>
                  <TableCell className="text-center">{payment.date}</TableCell>
                  <TableCell className="text-center">{payment.time}</TableCell>
                  <TableCell className="text-center">
                    {payment.method}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      className={cn(
                        "rounded-lg text-white",
                        payment.status === "Success"
                          ? "font-bold text-green-500 bg-dark"
                          : "font-bold dark:bg-card text-red-500 bg-white",
                      )}
                    >
                      {payment.status}
                    </Badge>
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
          Showing {startIndex + 1} to{" "}
          {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of{" "}
          {filteredPayments.length} payments
        </p>

        <div className="order-1 sm:order-2">
          <Pagination className="w-auto mx-0 justify-end">
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage((v) => v - 1);
                  }}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              <PaginationItem>
                <span className="flex h-9 items-center justify-center px-3 text-sm font-medium whitespace-nowrap">
                  Page {currentPage} of {totalPages}
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
                    currentPage === totalPages
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
