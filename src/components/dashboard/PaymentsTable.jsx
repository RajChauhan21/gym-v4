import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/Loader"
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TrendingUp, AlertCircle, CheckCircle2, Search } from "lucide-react";
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

export default function PaymentsTable() {
  const payments = [
    {
      name: "Rahul Sharma",
      amount: 1500,
      plan: "Gold",
      date: "2026-03-17",
      time: "10:30 AM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Priya Singh",
      amount: 2000,
      plan: "Platinum",
      date: "2026-03-15",
      time: "8:15 AM",
      status: "Failed",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-04-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-05-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-05-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-05-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
    {
      name: "Amit Verma",
      amount: 1200,
      plan: "Silver",
      date: "2026-03-16",
      time: "6:00 PM",
      status: "Success",
    },
  ];

  const totalRevenue = payments
    .filter((p) => p.status === "Success")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const failedCount = payments.filter((p) => p.status === "Failed").length;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    // Reset to Page 1 whenever filters change to prevent "Empty Page" bugs
    setCurrentPage(1);
  }, [searchTerm, filterPlan, filterStatus, dateFrom, dateTo]);

  const filteredPayments = payments.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || p.plan === filterPlan;
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;

    // Date Range Logic
    const pDate = new Date(p.date);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    const matchesDate = (!from || pDate >= from) && (!to || pDate <= to);

    return matchesName && matchesPlan && matchesStatus && matchesDate;
  });

  // 1. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 2. Calculation Logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  // To keep height fixed, calculate how many empty rows to fill
  const emptyRows = itemsPerPage - currentData.length;

  const resetFilters = () => {
    setSearchTerm("");
    setFilterPlan("all");
    setFilterStatus("all");
    setDateFrom(null);
    setDateTo(null);
    setCurrentPage(1);
    setIsFilterOpen(false)
  };

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200)
  }, [])

  if (loading) {
    return (
      <Loader text="Loading Payments...." />
    )
  }


  return (
    <div className="p-3">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Payments</h2>
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
            <p className="text-xl font-bold dark:text-white">₹{totalRevenue}</p>
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
            <p className="text-xl font-bold text-red-600">{failedCount}</p>
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
            <p className="text-xl font-bold dark:text-white">{payments.length}</p>
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
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
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
            <Button
              onClick={resetFilters}
              className="w-full rounded-full"
            >
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
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger>
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
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
            <Button
              onClick={resetFilters}
              className="w-full rounded-full"
            >
              Clear Filters
            </Button>
          </div>

        </div>
      </Card>

      {/* <div className="bg-white dark:bg-white-900 rounded-2xl shadow p-4"> */}
      {/* <div className="bg-card text-card-foreground rounded-xl shadow border dark:border-gray-800 p-3 md:p-8">
        <div className="overflow-auto h-[490px]">
          <Table>
            <TableHeader className="sticky top-0 z-30 bg-card">
              <TableRow>
                <TableHead className="sticky left-0 top-0 z-30 bg-card min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] dark:text-gray-500">
                  Name
                </TableHead>
                <TableHead className="dark:text-gray-500">Plan</TableHead>
                <TableHead className="dark:text-gray-500">Amount</TableHead>
                <TableHead className="dark:text-gray-500">Date</TableHead>
                <TableHead className="dark:text-gray-500">Time</TableHead>
                <TableHead className="dark:text-gray-500">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredPayments.map((payment, index) => (
                <TableRow key={index} className="bg-red-50 hover:bg-yellow-50">
                  <TableCell
                    className={cn(
                      "sticky left-0 z-10 font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] bg-card min-w-[40px] max-w-[40px]",
                      // Use standard bg for the sticky cell so it's opaque
                    )}
                  >
                    {payment.name}
                  </TableCell>
                  <TableCell>{payment.plan}</TableCell>
                  <TableCell>₹{payment.amount}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.time}</TableCell>

                  <TableCell>
                    <Badge
                      className={
                        payment.status === "Success"
                          ? "bg-green-500 rounded-lg"
                          : "bg-red-500 rounded-lg"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div> */}
      <div className="bg-card text-card-foreground rounded-xl shadow border dark:border-gray-800 p-3 md:p-8">
        <div className="overflow-auto h-[450px]"> {/* Fixed height to prevent jumping */}
          <Table>
            <TableHeader className="sticky top-0 z-30 bg-card">
              <TableRow>
                <TableHead className="sticky left-0 top-0 z-30 bg-card min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] dark:text-gray-500 text-center">
                  Name
                </TableHead>
                <TableHead className="dark:text-gray-500 text-center">Plan</TableHead>
                <TableHead className="dark:text-gray-500 text-center">Amount</TableHead>
                <TableHead className="dark:text-gray-500 text-center">Date</TableHead>
                <TableHead className="dark:text-gray-500 text-center">Time</TableHead>
                <TableHead className="dark:text-gray-500 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentData.map((payment, index) => (
                <TableRow key={index} className="bg-red-50 hover:bg-yellow-50">
                  <TableCell
                    className={cn(
                      "sticky left-0 z-10 font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] bg-card min-w-[150px] text-center",
                    )}
                  >
                    {payment.name}
                  </TableCell>
                  <TableCell className="text-center">{payment.plan}</TableCell>
                  <TableCell className="text-center">₹{payment.amount}</TableCell>
                  <TableCell className="text-center">{payment.date}</TableCell>
                  <TableCell className="text-center">{payment.time}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={cn(
                        "rounded-lg text-white",
                        payment.status === "Success" ? "bg-green-500" : "bg-red-500"
                      )}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {/* Placeholder Rows to maintain fixed height */}
              {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, i) => (
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
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
        </p>

        <div className="order-1 sm:order-2">
          <Pagination className="w-auto mx-0 justify-end">
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(v => v - 1) }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                  onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(v => v + 1) }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
