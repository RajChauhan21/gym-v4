import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import AddMemberDialog from "./AddMemberDialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function MembersTable() {
  const sendWhatsAppReminder = (member) => {
    const message = `Hello ${member.name}, your gym payment of ₹${member.due} is pending. Please pay before ${member.expiry}.`;

    const url = `https://wa.me/${member.phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  const members = [
    {
      name: "Rahul Sharma",
      plan: "Gold",
      status: "Paid",
      due: 0,
      expiry: "2026-04-10",
      phone: "919876543210",
    },
    {
      name: "Amit Verma",
      plan: "Silver",
      status: "Pending",
      due: 1500,
      expiry: "2026-04-10",
      phone: "919876543210",
    },
    {
      name: "Priya Singh",
      plan: "Platinum",
      status: "Paid",
      due: 2000,
      expiry: "2026-01-20",
      phone: "919876543210",
    },
    {
      name: "Priya Singh",
      plan: "Platinum",
      status: "Paid",
      due: 2000,
      expiry: "2026-01-20",
      phone: "919876543210",
    },
    {
      name: "Priya Singh",
      plan: "Platinum",
      status: "Paid",
      due: 2000,
      expiry: "2026-01-20",
      phone: "919876543210",
    },
    {
      name: "Priya Singh",
      plan: "Platinum",
      status: "Paid",
      due: 2000,
      expiry: "2026-01-20",
      phone: "919876543210",
    },
    {
      name: "Priya Singh",
      plan: "Platinum",
      status: "Paid",
      due: 2000,
      expiry: "2026-01-20",
      phone: "919876543210",
    },
    {
      name: "Priya Singh",
      plan: "Platinum",
      status: "Paid",
      due: 2000,
      expiry: "2026-01-20",
      phone: "919876543210",
    },
    {
      name: "Priya Singh",
      plan: "Platinum",
      status: "Paid",
      due: 2000,
      expiry: "2026-01-20",
      phone: "919876543210",
    },
    {
      name: "Priya Singh",
      plan: "Platinum",
      status: "Paid",
      due: 2000,
      expiry: "2026-01-20",
      phone: "919876543210",
    },
    {
      name: "Priya Singh",
      plan: "Platinum",
      status: "Paid",
      due: 2000,
      expiry: "2026-01-20",
      phone: "919876543210",
    },
    {
      name: "Priya Singh",
      plan: "Platinum",
      status: "Paid",
      due: 2000,
      expiry: "2026-01-20",
      phone: "919876543210",
    },
    {
      name: "Priya Singh",
      plan: "Platinum",
      status: "Pending",
      due: 2000,
      expiry: "2026-01-20",
      phone: "919876543210",
    },
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [status, setStatus] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const totalMembers = members.length;
  const pendingPayments = members.filter((m) => m.due > 0).length;
  const totalDue = members.reduce((acc, curr) => acc + curr.due, 0);
  const [expiryFrom, setexpiryFrom] = useState("");
  const [expiryTo, setexpiryTo] = useState("");

  const filteredMembers = members.filter((m) => {
    const matchesName = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || m.plan === filterPlan;
    const matchesStatus = status === "all" || m.status === status;

    // Date Range Logic
    const memberExpiry = new Date(m.expiry);
    const fromDate = expiryFrom ? new Date(expiryFrom) : null;
    const toDate = expiryTo ? new Date(expiryTo) : null;

    // Check if member's expiry falls within the selected range (inclusive)
    const matchesExpiryRange =
      (!fromDate || memberExpiry >= fromDate) &&
      (!toDate || memberExpiry <= toDate);
    return matchesName && matchesPlan && matchesStatus && matchesExpiryRange;
  });

  // 1. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 2. Calculate Sliced Data
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  const emptyRows = itemsPerPage - currentData.length;

  const resetFilters = () => {
    setSearchTerm("");
    setFilterPlan("all");
    setStatus("all");
  };

  const activeFilterCount = [
    searchTerm !== "",
    filterPlan !== "all",
    status !== "all",
  ].filter(Boolean).length;

  return (
    <div className="p-3">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Members</h2>
      <AddMemberDialog />
      {/* <div className="bg-white rounded-xl shadow p-6 md:p-8"> */}

      {/* --- QUICK STATS CARDS --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 m-1">
        <div className="p-4 rounded-2xl bg-card border shadow-sm">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
            Total Members
          </p>
          <p className="text-2xl font-bold dark:text-black">{totalMembers}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border shadow-sm">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
            Pending
          </p>
          <p className="text-2xl font-bold text-orange-500">
            {pendingPayments}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-card border shadow-sm col-span-2 md:col-span-1">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
            Total Due Amount
          </p>
          <p className="text-2xl font-bold text-red-500">
            ₹{totalDue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Mobile Search filters */}
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
            <DialogTitle>Search Members</DialogTitle>
            <DialogDescription className="sr-only">
              Filter and search through your gym members.
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
                Plan
              </Label>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Silver">Platinum</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Status Select */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Success">Paid</SelectItem>
                  <SelectItem value="Failed">Pending</SelectItem>
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
                  value={expiryFrom}
                  onChange={(e) => setexpiryFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">
                  To
                </Label>
                <Input
                  type="date"
                  value={expiryTo}
                  onChange={(e) => setexpiryTo(e.target.value)}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
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
              value={expiryFrom}
              onChange={(e) => setexpiryFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              To Date
            </Label>
            <Input
              type="date"
              value={expiryTo}
              onChange={(e) => setexpiryTo(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="bg-card text-card-foreground rounded-xl shadow border dark:border-gray-800 p-2 md:p-8">
        <div className="overflow-auto h-[490px]">
          <Table>
            <TableHeader>
              <TableRow>
                {/* STICKY NAME COLUMN */}
                <TableHead className="sticky left-0 z-20 bg-card min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] dark:text-gray-500">
                  Name
                </TableHead>
                <TableHead className="dark:text-gray-500 text-center">Plan</TableHead>
                <TableHead className="dark:text-gray-500 text-center">Status</TableHead>
                <TableHead className="dark:text-gray-500 text-center">Due Amount</TableHead>
                <TableHead className="dark:text-gray-500 text-center">Expiry</TableHead>
                <TableHead className="dark:text-gray-500 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentData.map((member, index) => (
                <TableRow
                  key={index}
                  className={member.due > 0 ? "bg-red-50/30" : "bg-green-50/30"}
                >
                  <TableCell
                    className={cn(
                      "sticky left-0 z-10 font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] text-center",
                      member.due > 0 ? "bg-[#fff5f5]" : "bg-card"
                    )}
                  >
                    {member.name}
                  </TableCell>
                  <TableCell className="text-center">{member.plan}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={member.due === 0 ? "success" : "destructive"}
                      className={cn(
                        "rounded-full",
                        member.due === 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      )}
                    >
                      {member.due === 0 ? "Paid" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">₹{member.due}</TableCell>
                  <TableCell className="text-center">{member.expiry}</TableCell>
                  <TableCell className="text-center">
                    {member.due > 0 && (
                      <button
                        onClick={() => sendWhatsAppReminder(member)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                      >
                        Remind
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {emptyRows > 0 && Array.from({ length: emptyRows }).map((_, index) => (
                <TableRow key={`empty-${index}`} className="border-transparent">
                  {/* We must match the number of columns (6) so the layout doesn't break */}
                  <TableCell className="sticky left-0 bg-card py-6 border-transparent"></TableCell>
                  <TableCell className="py-6 border-transparent"></TableCell>
                  <TableCell className="py-6 border-transparent"></TableCell>
                  <TableCell className="py-6 border-transparent"></TableCell>
                  <TableCell className="py-6 border-transparent"></TableCell>
                  <TableCell className="py-6 border-transparent"></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 3. Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
        </p>
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1) }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink className="cursor-default border-none">
                Page {currentPage} of {totalPages}
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1) }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

    </div>
  );
}
