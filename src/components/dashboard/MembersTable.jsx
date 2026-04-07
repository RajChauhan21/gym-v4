import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreVertical,
  Pencil,
  Trash2,
  MessageCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import Loader from "@/components/ui/Loader";
import { Badge } from "@/components/ui/badge";
import React from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useGymStore } from "../../store/gymStore";
import { MemberDetailsModal } from "./MemberDetailsModal";
import { useProfile } from "../../contexts/ProfileContext";
import { deleteMemberById, getAllDuesOfMembers, getAllMembers, getAllMembersCount } from "../../apis/backend_apis";
import { toast } from "sonner";
export default function MembersTable() {
  const [currentPage, setCurrentPage] = useState(0); // backend uses 0-based
  const [dateToOpen, setDateToOpen] = useState(false);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("expiry"); // Default column
  const [sortDir, setSortDir] = useState("desc"); // Default direction
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    name: "",
    dueAmount: "",
    fromDate: "", // Matches @Param "joinedFrom"
    toDate: "", // Matches @Param "joinedTo"
    plan: "",
  });

  const sendWhatsAppReminder = (member) => {
    const message = `Hello ${member.name}, your gym payment of ₹${member.dueAmount} is pending. Please pay before ${member.expiry}.`;

    const url = `https://wa.me/${member.phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };
  const [filterPlan, setFilterPlan] = useState("all");
  const [dateType, setDateType] = useState("expiry"); // "expiry" or "joined"
  const { profile } = useProfile();
  const [totalDues, setTotalDues] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTotalDues = async () => {
    try {
      const response = await getAllDuesOfMembers(profile.ownerId);
      setTotalDues(response);
    } catch (error) {
      console.error("failed to get dues", error)
    }
  }

  const getAllCount = async () => {
    try {
      const response = await getAllMembersCount(profile.ownerId);
      setTotalCount(response);
    } catch (error) {
      console.error("failed to get count", error)
    }
  }

  useEffect(()=>{
    getAllCount();
  },[])

  useEffect(() => {
    const fetchAndPopulate = async (retries = 3) => {
      const apiFilters = {
        name: filters.name || null,
        dueAmount: filters.dueAmount || null,
        joinedFrom: dateType === "joined" ? filters.fromDate : null,
        joinedTo: dateType === "joined" ? filters.toDate : null,
        expiryFrom: dateType === "expiry" ? filters.fromDate : null,
        expiryTo: dateType === "expiry" ? filters.toDate : null,
        plan: filters.plan
      };
      try {
        const response = await getAllMembers(
          profile.ownerId,
          currentPage,
          pageSize,
          sortBy,
          sortDir,
          apiFilters,
        );
        setMembers(
          Array.isArray(response.data.content) ? response.data.content : [],
        );
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
        console.log("Fetched members:", response.data);
      } catch (err) {
        // If it's a rate limit (429) and we have retries left
        if (err.response?.status === 429 && retries > 0) {
          toast.error(
            `Rate limited. Retrying in 2 seconds... (${retries} left)`,
          );
          setTimeout(() => fetchAndPopulate(retries - 1), 2000);
        } else {
          setMembers([]); // Give up and set empty to stop the crash
        }
      }
    };
    fetchAndPopulate();
    fetchPlans();
    fetchTotalDues();
    // Empty array [] ensures this runs exactly once on mount
  }, [
    currentPage,
    pageSize,
    sortBy,
    sortDir,
    profile?.ownerId,
    filters,
    dateType,
  ]);

  // useEffect(() => {
  //   // Reset to Page 1 whenever filters change to prevent "Empty Page" bugs
  //   setCurrentPage(1);
  // }, [searchTerm, filterPlan, status, expiryFrom, expiryTo]);

  const [open, setOpen] = useState(false);
  const members = useGymStore((state) => state.members);
  const plans = useGymStore((state) => state.plans);
  const setMembers = useGymStore((state) => state.setMembers);
  // setMembers(membersObject);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const totalMembers = totalCount;
  const pendingPayments = members.filter((m) => m.dueAmount > 0).length;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const fetchPlans = useGymStore((state) => state.fetchPlans);

  const safeTotal = totalElements || 0;
  const safeSize = pageSize || 10;
  const safePage = currentPage || 0;

  const displayStart = safeTotal === 0 ? 0 : safePage * safeSize + 1;
  const displayEnd = Math.min((safePage + 1) * safeSize, safeTotal);

  const resetFilters = () => {
    setFilterPlan("all");
    setFilters({
      name: "",
      dueAmount: "",
      fromDate: "",
      toDate: "",
      plan: "",
    });
    setIsFilterOpen(false);
    setCurrentPage(0);
  };

  function getExpiryText(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);

      // Shortened labels to ensure text fits within the original sizing
      if (absDays < 30) {
        return `Exp. ${absDays}d ago`;
      } else if (absDays < 365) {
        const months = Math.round(absDays / 30.44);
        return `Exp. ${months}mo ago`;
      } else {
        const years = Math.round(absDays / 365.25);
        return `Exp. ${years} ${years === 1 ? "yr" : "yrs"} ago`;
      }
    }

    if (diffDays === 0) return "Exp. Today";
    if (diffDays <= 7) return `Exp. in ${diffDays}d`;

    return "Active";
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

  const [loading, setLoading] = useState(true);


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

  const handleDelete = async (member) => {
    try {
      const response = await deleteMemberById(member.id);
      if (response.status === 202) {
        toast.success(response.data || "Member deleted");
        const data = await getAllMembers(profile.ownerId);
        setMembers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error(error.response?.data || "Failed to delete member");
    }
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  if (loading) {
    return <Loader text="Loading Members...." />;
  }

  return (
    <div className="p-3">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Members</h2>
      <AddMemberDialog
        open={isModalOpen}
        setOpen={setIsModalOpen}
        editingMember={selectedMember}
        setEditingMember={setSelectedMember}
      />
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
            Pending Dues
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
            ₹{(Number(totalDues) || 0).toLocaleString('en-IN')}
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
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
              />
            </div>

            {/* 2. Plan Select */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Plan
              </Label>
              <Select
                onValueChange={setFilterPlan}
                value={filterPlan}
                className="w-full"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans.map((plan, idx) => (
                    <SelectItem key={idx} value={plan.name}> {/* Match the plan name */}
                      {plan.name}
                    </SelectItem>
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
            {/* <div className="grid grid-cols-2 gap-4"> */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">From</Label>
              <Popover> {/* Changed Dialog to Popover */}
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal px-3",
                      !filters.fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {filters.fromDate ? format(parseISO(filters.fromDate), "PPP") : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.fromDate ? parseISO(filters.fromDate) : undefined}
                    onSelect={(date) => {
                      setFilters((prev) => ({
                        ...prev,
                        fromDate: date ? format(date, "yyyy-MM-dd") : "",
                      }));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">To</Label>
              <Popover> {/* Changed Dialog to Popover */}
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal px-3",
                      !filters.toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {filters.toDate ? format(parseISO(filters.toDate), "PPP") : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.toDate ? parseISO(filters.toDate) : undefined}
                    onSelect={(date) => {
                      setFilters((prev) => ({
                        ...prev,
                        toDate: date ? format(date, "yyyy-MM-dd") : "",
                      }));
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* </div> */}
          </div>

          <DialogFooter>
            {/* <Button
              onClick={() => setIsFilterOpen(false)}
              className="w-full rounded-full"
            >
              Apply Filters
            </Button> */}
            <Button onClick={resetFilters} className="w-full rounded-full">
              Clear Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pc Filter logic */}
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

          {/* 4. Date Type Selector */}
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
        <div className="overflow-auto h-[450px]">
          <Table>
            <TableHeader className="sticky top-0 z-40 bg-card backdrop-blur-md">
              <TableRow className="hover:bg-transparent">
                {/* STICKY NAME HEADER */}
                <TableHead
                  onClick={() => handleSort("name")}
                  className="sticky left-0 top-0 z-50 bg-card min-w-[150px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] cursor-pointer dark:text-gray-500 text-left pl-6"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm tracking-wider">Name</span>
                    <div className="flex flex-row -space-y-2 opacity-40">
                      <ArrowUp className="size-3" />
                      <ArrowDown className="size-3" />
                    </div>
                  </div>
                </TableHead>

                {/* OTHER HEADERS */}
                {[
                  { label: "Phone", key: "phone" },
                  { label: "Plan", key: "plan" },
                  { label: "Joined", key: "joined" },
                  { label: "Expiry", key: "expiry" },
                  { label: "Due", key: "dueAmount" },
                ].map((col) => (
                  <TableHead
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="top-0 z-30  text-center px-4 min-w-[90px]"
                  >
                    <div className="inline-flex items-center justify-center gap-2">
                      <span className="text-sm dark:text-gray-500 tracking-wider">
                        {col.label}
                      </span>
                      <div className="flex flex-row -space-y-2 opacity-40">
                        <ArrowUp className="size-3" />
                        <ArrowDown className="size-3" />
                      </div>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="top-0 z-30 text-center dark:text-gray-500 text-sm tracking-wider min-w-[90px]">
                  Status
                </TableHead>
                <TableHead className="top-0 z-30 text-center dark:text-gray-500 text-sm tracking-wider w-[90px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.isArray(members) && members.length > 0 ? (
                members.map((member, index) => (
                  <TableRow
                    key={index}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    {/* STICKY NAME CELL */}
                    <TableCell
                      onClick={() => setViewingMember(member)}
                      className="sticky left-0 z-10 cursor-pointer font-bold bg-card shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-left pl-6"
                    >
                      {member.name}
                    </TableCell>

                    <TableCell className="text-center font-mono text-sm">
                      {member.phone}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs font-medium px-2 py-1 rounded bg-muted">
                        {member.plan || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground whitespace-nowrap">
                      {member.joined}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {member.expiry}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      ₹{member.dueAmount}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={getExpiryColor(member.expiry)}>
                        {getExpiryText(member.expiry)}
                      </span>
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
                              setSelectedMember(member); // Set the member to edit
                              setIsModalOpen(true); // Open the modal
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil className="size-4 text-blue-500" />
                            <span>Update</span>
                          </DropdownMenuItem>

                          {member.dueAmount > 0 && (
                            <DropdownMenuItem
                              onClick={() => sendWhatsAppReminder(member)}
                              className="gap-2 cursor-pointer"
                            >
                              <MessageCircle className="size-4 text-green-500" />
                              <span>Remind</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleDelete(member)}
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
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <p className="text-lg font-medium">No members found</p>
                      <p className="text-sm">
                        Try adding a new member or check your connection.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 3. Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
        {/* Left Side: Info Text */}
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing {totalElements > 0 ? displayStart : 0} to {displayEnd} of{" "}
          {totalElements} members
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
                    if (currentPage > 0) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 0
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                {/* Using a span instead of PaginationLink to prevent "button-like" hover styles on text */}
                <span className="flex h-9 items-center justify-center px-3 text-sm whitespace-nowrap">
                  Page {(currentPage || 0) + 1} of {totalPages || 0}
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
      <MemberDetailsModal
        member={viewingMember}
        open={!!viewingMember}
        onOpenChange={() => setViewingMember(null)}
      />
    </div>
  );
}
