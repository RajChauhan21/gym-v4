import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Loader from "@/components/ui/Loader";
import { Badge } from "@/components/ui/badge";
import AddMemberDialog from "./AddMemberDialog";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
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
import { useGymStore } from "../../store/gymStore";

export default function MembersTable() {
  const sendWhatsAppReminder = (member) => {
    const message = `Hello ${member.name}, your gym payment of ₹${member.due} is pending. Please pay before ${member.expiry}.`;

    const url = `https://wa.me/${member.phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  const members = useGymStore((state) => state.members);
  const plans = useGymStore((state) => state.plans);
  const setMembers = useGymStore((state) => state.setMembers);
  // setMembers(membersObject);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [status, setStatus] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const totalMembers = members.length;
  const pendingPayments = members.filter((m) => m.due > 0).length;
  const totalDue = members.reduce((acc, curr) => acc + curr.due, 0);
  const [expiryFrom, setexpiryFrom] = useState("");
  const [expiryTo, setexpiryTo] = useState("");
  const [dateType, setDateType] = useState("expiry"); // "expiry" or "joined"

  useEffect(() => {
    // Reset to Page 1 whenever filters change to prevent "Empty Page" bugs
    setCurrentPage(1);
  }, [searchTerm, filterPlan, status, expiryFrom, expiryTo]);

  const filteredMembers = members.filter((m) => {
    // 1. Normalize Inputs (Safety First)
    // "||" acts as the bypass. If term is empty, match becomes TRUE for everyone.
    const term = searchTerm?.toLowerCase().trim() || "";
    const matchesName = !term || m.name.toLowerCase().includes(term);

    // 2. Exact Matches (Dropdowns)
    // If filter is "all", we return TRUE (ignoring this specific check)
    const matchesPlan = filterPlan === "all" || m.plan === filterPlan;

    // Generic Date logic
    const start = expiryFrom ? new Date(expiryFrom) : null;
    const end = expiryTo ? new Date(expiryTo) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    // Pick the target field based on dateType
    const targetDateString = dateType === "expiry" ? m.expiry : m.joined;
    const compareDate = new Date(targetDateString);
    compareDate.setHours(0, 0, 0, 0);

    const matchesDate =
      (!start || compareDate >= start) && (!end || compareDate <= end);

    // 4. The "AND" Gate
    // All active filters must match. Inactive filters are TRUE, so they don't block.
    return matchesName && matchesPlan && matchesDate;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 2. Calculate Sliced Data
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredMembers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const emptyRows = itemsPerPage - currentData.length;

  const resetFilters = () => {
    setSearchTerm("");
    setFilterPlan("all");
    setStatus("all");
    setexpiryFrom(null);
    setexpiryTo(null);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  function getExpiryText(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);

    // Normalize both dates
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} ago`;
    }

    if (diffDays === 0) {
      return "Expiring Today";
    }

    if (diffDays <= 7) {
      return `Expires in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
    }

    return expiry.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getExpiryColor(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return "text-red-500";
    if (diffDays === 0) return "text-orange-500 font-semibold";
    if (diffDays <= 7) return "text-yellow-500";
    return "text-blue-500";
  }

  const activeFilterCount = [
    searchTerm !== "",
    filterPlan !== "all",
    status !== "all",
  ].filter(Boolean).length;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  if (loading) {
    return <Loader text="Loading Members...." />;
  }

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
          <p className="text-2xl font-bold dark:text-white">{totalMembers}</p>
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
            className="md:hidden flex gap-2 rounded-full shadow-sm w-full mb-2 mt-2"
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
              <Select onValueChange={setFilterPlan} value={filterPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans.map((plan, idx) => (
                    <SelectItem key={idx} value={plan.name}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date type selector */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Filter Date By
              </Label>
              <Select value={dateType} onValueChange={setDateType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expiry">Expiry Date</SelectItem>
                  <SelectItem value="joined">Joining Date</SelectItem>
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
            <Button onClick={resetFilters} className="w-full rounded-full">
              Clear Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pc Filter logic */}
      <Card className="hidden md:block p-4 bg-card border shadow-sm mb-2 mt-2">
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
            <Select value={filterPlan} onValueChange={setFilterPlan} >
              <SelectTrigger>
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {plans.map((plan, idx) => (
                  <SelectItem key={idx} value={plan.name}>{plan.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Date Type Selector (NEW) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Filter Date By
            </Label>
            <Select value={dateType} onValueChange={setDateType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expiry">Expiry Date</SelectItem>
                <SelectItem value="joined">Joining Date</SelectItem>
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

          <Button onClick={resetFilters} className="w-full rounded-full">
            Clear Filters
          </Button>
        </div>
      </Card>

      <div className="bg-card text-card-foreground rounded-xl shadow border dark:border-gray-800 p-3 md:p-8">
        <div className="overflow-auto h-[450px]">
          <Table>
            <TableHeader className="sticky top-0 z-30 bg-card">
              <TableRow>
                {/* STICKY NAME COLUMN */}
                <TableHead className="sticky left-0 top-0 z-30 bg-card min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] dark:text-gray-500 text-center">
                  Name
                </TableHead>
                <TableHead className="dark:text-gray-500 text-center">
                  Plan
                </TableHead>
                <TableHead className="dark:text-gray-500 text-center">
                  Joined
                </TableHead>
                {/* <TableHead className="dark:text-gray-500 text-center">
                  Status
                </TableHead> */}
                <TableHead className="dark:text-gray-500 text-center">
                  Due Amount
                </TableHead>
                <TableHead className="dark:text-gray-500 text-center">
                  Expiry
                </TableHead>
                <TableHead className="dark:text-gray-500 text-center">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentData.map((member, index) => (
                <TableRow key={index} className="">
                  <TableCell
                    className={cn(
                      "sticky left-0 z-10 font-bold bg-card shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] text-center",
                    )}
                  >
                    {member.name}
                  </TableCell>
                  <TableCell className="text-center">{member.plan}</TableCell>
                  <TableCell className="text-center">{member.joined}</TableCell>
                  {/* <TableCell className="text-center">
                    <span
                     className= {getStatusColor(member.expiry)}
                    >
                      {member.status}
                    </span>
                  </TableCell> */}
                  <TableCell className="text-center">₹{member.due}</TableCell>
                  <TableCell className="text-center">
                    <span className={getExpiryColor(member.expiry)}>
                      {getExpiryText(member.expiry)}
                    </span>
                  </TableCell>
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

              {emptyRows > 0 &&
                Array.from({ length: emptyRows }).map((_, index) => (
                  <TableRow
                    key={`empty-${index}`}
                    className="border-transparent"
                  >
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
        {/* Left Side: Info Text */}
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing {startIndex + 1} to{" "}
          {Math.min(startIndex + itemsPerPage, filteredMembers.length)} of{" "}
          {filteredMembers.length} members
        </p>

        {/* Right Side: Pagination Controls */}
        <div className="order-1 sm:order-2">
          <Pagination className="w-auto mx-0 justify-end">
            {" "}
            {/* Added w-auto and mx-0 */}
            <PaginationContent className="gap-0 sm:gap-1">
              {" "}
              {/* Tighten gaps for mobile */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                {/* Using a span instead of PaginationLink to prevent "button-like" hover styles on text */}
                <span className="flex h-9 items-center justify-center px-3 text-sm whitespace-nowrap">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
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
