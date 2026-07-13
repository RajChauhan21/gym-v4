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
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React from "react";
import AddMemberDialog from "./AddMemberDialog";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import { Search, SlidersHorizontal, X, UserCheck, UserX } from "lucide-react";
import { useGymStore } from "../../store/gymStore";
import { MemberDetailsModal } from "./MemberDetailsModal";
import { useProfile } from "../../contexts/ProfileContext";
import {
  changeMemberActiveStatus,
  deleteMemberById,
  getActiveMembers,
  getAllDuesOfMembers,
  getAllMembers,
  getAllMembersCount,
  renewMemberShip,
} from "../../apis/backend_apis";
import { toast } from "sonner";
import RenewMembershipDialog from "./RenewMembershipDialog";
export default function MembersTable() {
  const [currentPage, setCurrentPage] = useState(0); // backend uses 0-based
  const [dateToOpen, setDateToOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [mobileDateFromOpen, setMobileDateFromOpen] = useState(false);
  const [mobileDateToOpen, setMobileDateToOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("expiry"); // Default column
  const [sortDir, setSortDir] = useState("desc"); // Default direction
  const [totalElements, setTotalElements] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMembersCount, setActiveMembersCount] = useState(0);
  const [renewOpen, setRenewOpen] = useState(false);
  const [selectedRenewalMember, setSelectedRenewalMember] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);
  const fetchSources = useGymStore((state) => state.fetchSources);
  const sources = useGymStore((state) => state.sources);

  const [filters, setFilters] = useState({
    name: "",
    dueAmount: "",
    fromDate: "", // Matches @Param "joinedFrom"
    toDate: "", // Matches @Param "joinedTo"
    plan: "",
    source: null,
    isActive: null,
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
  const [dueMembersCount, setDueMembersCount] = useState(0);

  const getActiveMembersCount = async () => {
    try {
      const response = await getActiveMembers(profile.ownerId, 1);
      if (response.status === 202 || response.data.statusCodeValue === 202) {
        setActiveMembersCount(response.data || 0);
      } else if (response.status === 404) {
      } else if (response.status === 429) {
      }
    } catch (error) {
    } finally {
    }
  };

  const fetchTotalDues = async () => {
    try {
      const response = await getAllDuesOfMembers(profile.ownerId);

      if (response.status === 202 || response.data.statusCodeValue === 200) {
        setTotalDues(response.data.dueAmount);
        setDueMembersCount(response.data.dueMembersCount);
      } else if (response.status === 404) {
        // setTotalDues(0);
        // setDueMembersCount(0);
      } else if (response.status === 429) {
        // setTotalDues(0);
        // setDueMembersCount(0);
      }
    } catch (error) {
      console.error("failed to get dues", error);
    }
  };

  const getAllCount = async () => {
    try {
      const response = await getAllMembersCount(profile.ownerId);

      if (response.status === 202 || response.data.statusCodeValue === 200) {
        setTotalCount(response.data);
      } else if (response.status === 404) {
        // toast.error(
        //   "Something went wrong while fetching plans. Please try again later.",
        // );
      } else if (response.status === 429) {
        // toast.error(
        //   "You are performing actions too quickly. Please wait a few seconds and try again.",
        // );
      }
    } catch (error) {
      console.error("failed to get count", error);
    }
  };

  const changeMemberStatus = async (action, memberId, ownerId) => {
    setIsUpdating(true);
    try {
      const response = await changeMemberActiveStatus(
        action,
        memberId,
        ownerId,
      );
      if (response.status === 202 || response.data.statusCodeValue === 202) {
        if (response.data == "active") {
          toast.success("Member activated successfully");
        } else if (response.data == "inactive") {
          toast.success("Member deactivated successfully");
        }
      } else if (response.status === 404) {
        if (
          response.data &&
          response.data.message &&
          response.data.message == "limit"
        ) {
          toast.error(
            "You've reached your plan's member limit. Please upgrade your plan or deactivate existing members.",
          );
        }
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
      console.error("failed to change member status", error);
    } finally {
      setIsUpdating(false);
      fetchAndPopulate();
      getActiveMembersCount();
    }
  };

  const fetchAndPopulate = async (retries = 3) => {
    setLoading(true);
    const activeFilter =
      filters.isActive === "all" ? null : filters.isActive == "1" ? 1 : 0;
    const apiFilters = {
      name: filters.name || null,
      dueAmount: filters.dueAmount || null,
      joinedFrom: dateType === "joined" ? filters.fromDate : null,
      joinedTo: dateType === "joined" ? filters.toDate : null,
      expiryFrom: dateType === "expiry" ? filters.fromDate : null,
      expiryTo: dateType === "expiry" ? filters.toDate : null,
      startFrom: dateType === "start" ? filters.fromDate : null,
      startTo: dateType === "start" ? filters.toDate : null,
      plan: filters.plan,
      source: filters.source,
      isActive: filters.isActive !== null ? activeFilter : null,
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
      if (response.status === 202 || response.data.statusCodeValue === 200) {
        console.log("API Response:", response);
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
        getAllCount();
        fetchTotalDues();
        console.log("Fetched members:", response.data);
      } else if (response.status === 404) {
        if (
          response.data &&
          response.data.message &&
          response.data.message !== "100"
        ) {
          toast.error(
            "Something went wrong while fetching members. Please try again later.",
          );
        }
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (err) {
      // If it's a rate limit (429) and we have retries left
      if (err.response?.status === 429 && retries > 0) {
        toast.error(`Rate limited. Retrying in 2 seconds... (${retries} left)`);
        setTimeout(() => fetchAndPopulate(retries - 1), 2000);
      } else {
        setMembers([]); // Give up and set empty to stop the crash
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCount();
    getActiveMembersCount();
    fetchSources(profile?.ownerId);
  }, []);

  useEffect(() => {
    fetchAndPopulate();
    fetchPlans(profile.gymId);
    // Empty array [] ensures this runs exactly once on mount
  }, [
    currentPage,
    pageSize,
    sortBy,
    sortDir,
    profile?.ownerId,
    profile.gymId,
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
  const [totalMemberLoading, setTotalMemberLoading] = useState(false);
  const [pendingDuesLoading, setPendingDuesLoading] = useState(false);
  const [totalDueAmountLoading, setTotalDueAmountLoading] = useState(false);
  // setMembers(membersObject);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const totalMembers = totalCount;
  const pendingPayments = dueMembersCount;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const fetchPlans = useGymStore((state) => state.fetchPlans);

  // const displayStart = safeTotal === 0 ? 0 : safePage * safeSize + 1;
  // const displayEnd = Math.min((safePage + 1) * safeSize, safeTotal);

  const safeTotalPages = totalPages === 0 ? 1 : totalPages;
  const displayStart = totalElements === 0 ? 0 : currentPage * pageSize + 1;

  const displayEnd =
    totalElements === 0
      ? 0
      : Math.min((currentPage + 1) * pageSize, totalElements);

  const resetFilters = () => {
    if (profile.planName === "No Active Plan") {
      // 1. Show the error toast
      toast.error(
        "You need an active plan to use this functionality. Please subscribe to a plan first.",
      );
      setLoading(false);
      return;
    }
    setFilterPlan("");
    setFilters({
      name: "",
      dueAmount: "",
      fromDate: "",
      toDate: "",
      source: null,
      plan: "",
      isActive: null,
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

    // 1. Expired in the past
    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);

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

    // 2. Exact same day
    if (diffDays === 0) return "Exp. Today";

    // 3. NEW/UPDATED: Expiring within 1 to 7 days from today (inclusive)
    if (diffDays > 0 && diffDays <= 7) {
      return `Expring. in ${diffDays}d`;
    }

    // 4. More than 7 days in the future
    return expiryDate;
  }

  function getExpiryTextColor(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    // Use Math.ceil to match the day-rounding of your text function
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    // 1. Expired or expires today -> Red
    if (diffDays <= 0) return "text-red-500";

    // 2. Expiring within 1 to 7 days -> Blue
    if (diffDays > 0 && diffDays <= 7) return "text-blue-500";

    // 3. More than 7 days left -> Default / No extra class
    return "";
  }

  function getExpiryBg(isActive) {
    // Constant backgrounds: Red for expired/today, Blue for future
    if (isActive == 0) return "bg-red-500";
    return "bg-sky-500";
  }

  const [loading, setLoading] = useState(true);

  const handleSort = (columnName) => {
    if (profile.planName === "No Active Plan") {
      toast.error(
        "You need an active plan to use this functionality. Please subscribe to a plan first.",
      );
      setLoading(false);
      return;
    }

    // 1. Calculate new values immediately
    const newDir =
      sortBy === columnName ? (sortDir === "asc" ? "desc" : "asc") : "asc";
    const newBy = columnName;

    // 2. Update the React state for the UI
    setSortBy(newBy);
    setSortDir(newDir);
    setCurrentPage(0);

    // 3. Call your API/fetch function using the new local variables
    // fetchSortedData(newBy, newDir, 0);
  };

  const handleDelete = async (member) => {
    setLoading(true);
    if (profile.planName === "No Active Plan") {
      // 1. Show the error toast
      toast.error(
        "You need an active plan to use this functionality. Please subscribe to a plan first.",
      );
      setLoading(false);
      return;
    }
    try {
      const response = await deleteMemberById(member.id);
      if (response.status === 202) {
        toast.success(response.data || "Member deleted");
        fetchAndPopulate();
      } else if (response.status === 404) {
        toast.error(
          "Something went wrong while deleting a member. Please try again later.",
        );
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
      toast.error(error.response?.data || "Failed to delete member");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  const activePercentage =
    totalMembers > 0
      ? Math.round((activeMembersCount / profile.memberLimitCount) * 100)
      : 0;

  const activePercent =
    profile.memberLimitCount > 0
      ? Math.round((activeMembersCount / profile.memberLimitCount) * 100)
      : 0;
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (activePercent / 100) * circumference;

  const radius = 22;

  const pendingPercent =
    totalMembers > 0 ? Math.round((pendingPayments / totalMembers) * 100) : 0;

  const pendingDashOffset =
    circumference - (pendingPercent / 100) * circumference;

  const handleRenew = async (form) => {
    setRenewLoading(true);
    try {
      const planId = plans.find((p) => p.name === form.plan)?.id;
      const payload = {
        memberId: selectedRenewalMember.id,
        planId: planId,
        ownerId: profile.ownerId,
        dueAmount: form.totalPayable,
        startDate: form.startDate,
        joiningDate: form.joinedDate,
        expiryDate: form.expiryDate,
      };

      // await api.post("/members/renew", payload);
      const response = await renewMemberShip(payload);
      if (response.status === 202 || response.statusCodeValue === 202) {
        if (response.data == "OK") {
          toast.success("Membership renewed successfully");
        } else if (response.data == "404") {
          toast.error("Something went wrong");
        }
      }
      fetchAndPopulate();
      // refresh table
    } catch (err) {
      toast.error("Failed to renew membership");
    } finally {
      setRenewLoading(false);
    }
  };

  // if (loading) {
  //   return <Loader text="Loading Members...." />;
  // }

  return (
    <div className="p-3">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Members</h2>
      <AddMemberDialog
        open={isModalOpen}
        setOpen={setIsModalOpen}
        editingMember={selectedMember}
        setEditingMember={setSelectedMember}
        setActiveMembersCount={setActiveMembersCount}
      />
      <RenewMembershipDialog
        open={renewOpen}
        setOpen={setRenewOpen}
        member={selectedRenewalMember}
        plans={plans} // if you have plans list
        onRenew={handleRenew}
        loading={renewLoading}
      />

      {/* --- QUICK STATS CARDS --- */}
      {profile?.planName === "Max Pro" ? (
        /* --- RENDERED IF PLAN IS MAX PRO --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 m-1 items-stretch">
          {/* Total Members */}
          <div className="lg:col-span-2">
            <div className="p-4 rounded-2xl bg-card border shadow-sm w-full relative">
              {/* Title */}
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-4">
                Member Limit
              </p>

              <div className="flex items-center justify-between gap-6">
                {/* LEFT SIDE - RING */}
                <div className="flex items-center justify-center w-1/2 relative">
                  {loading ? (
                    <Skeleton className="h-[80px] w-[80px] rounded-full bg-slate-200 dark:bg-slate-800" />
                  ) : (
                    <>
                      <svg
                        width={100}
                        height={100}
                        className="shrink-0 -rotate-90"
                      >
                        <circle
                          cx={50}
                          cy={50}
                          r={r}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={8}
                          className="text-slate-200 dark:text-slate-700"
                        />
                        <circle
                          cx={50}
                          cy={50}
                          r={r}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={8}
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                          className="text-sky-500 transition-all duration-700 ease-in-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-sm font-bold text-sky-500 font-semibold">
                          {activePercent}%
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* RIGHT SIDE - STATS */}
                <div className="w-1/2 flex flex-col items-start justify-center">
                  {loading ? (
                    <>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </>
                  ) : (
                    <>
                      <p className="text-3xl font-bold leading-none text-sky-500">
                        {profile.memberLimitCount}
                      </p>

                      <p className="text-xm text-muted-foreground mt-2">
                        <span className="text-sky-500 font-semibold">
                          {activeMembersCount}
                        </span>{" "}
                        {activeMembersCount === 1
                          ? "active member"
                          : "active members"}
                      </p>

                      <p className="text-[14px] text-muted-foreground mt-1">
                        {activePercent}% utilization
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pending Dues */}
          <div className="lg:col-span-2">
            <div className="p-4 rounded-2xl bg-card border shadow-sm w-full relative">
              {/* Title */}
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-4">
                Pending Dues
              </p>

              <div className="flex items-center justify-between gap-6">
                {/* LEFT SIDE - RING */}
                <div className="flex items-center justify-center w-1/2 relative">
                  {loading ? (
                    <Skeleton className="h-[80px] w-[80px] rounded-full bg-slate-200 dark:bg-slate-800" />
                  ) : (
                    <>
                      <svg
                        width={100}
                        height={100}
                        className="shrink-0 -rotate-90"
                      >
                        <circle
                          cx={50}
                          cy={50}
                          r={r}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={8}
                          className="text-slate-200 dark:text-slate-700"
                        />
                        <circle
                          cx={50}
                          cy={50}
                          r={r}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={8}
                          strokeDasharray={circumference}
                          strokeDashoffset={pendingDashOffset}
                          strokeLinecap="round"
                          className="text-orange-500 transition-all duration-700 ease-in-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-sm font-bold text-orange-500 font-semibold">
                          {pendingPercent}%
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* RIGHT SIDE - STATS */}
                <div className="w-1/2 flex flex-col items-start justify-center">
                  {loading ? (
                    <>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </>
                  ) : (
                    <>
                      {/* Kept font-bold and leading-none, swapped color back to match text style if desired, or left orange here */}
                      <p className="text-3xl font-bold leading-none text-orange-500">
                        {pendingPayments}
                      </p>

                      <p className="text-xm text-muted-foreground mt-2">
                        <span className="text-orange-500 font-semibold">
                          {pendingPayments}
                        </span>{" "}
                        {pendingPayments === 1
                          ? "pending member"
                          : "pending members"}
                      </p>

                      <p className="text-[14px] text-muted-foreground mt-1">
                        {pendingPercent}% of total members
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Total Due Amount */}
          <div className="lg:col-span-1 h-full">
            <div className="p-4 rounded-2xl bg-card border shadow-sm flex flex-col items-center justify-center text-center h-full w-full relative">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">
                Total Due Amount
              </p>
              <p className="text-2xl font-bold text-red-500">
                {loading ? (
                  <Skeleton className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                ) : (
                  <span>
                    ₹{(Number(totalDues) || 0).toLocaleString("en-IN")}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* --- OPTIONAL: RENDERED FOR ALL OTHER PLANS (FALLBACK) --- */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 m-1">
          <div className="p-4 rounded-2xl bg-card border shadow-sm">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
              Total / Active Members
            </p>

            <div className="text-2xl font-bold dark:text-white flex items-baseline gap-1">
              {loading ? (
                <Skeleton className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              ) : (
                <>
                  <span>{totalMembers}</span>
                  <span className="text-muted-foreground text-xl font-medium">
                    /
                  </span>
                  <span className="text-sky-500">{activeMembersCount}</span>
                </>
              )}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-card border shadow-sm">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              Pending Dues
            </p>
            <p className="text-2xl font-bold text-orange-500">
              {loading ? (
                <Skeleton className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              ) : (
                pendingPayments
              )}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-card border shadow-sm col-span-2 md:col-span-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
              Total Due Amount
            </p>
            <p className="text-2xl font-bold text-red-500">
              {loading ? (
                <Skeleton className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              ) : (
                <span>₹{(Number(totalDues) || 0).toLocaleString("en-IN")}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Mobile Search filters */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="md:hidden flex gap-2 rounded-full shadow-sm w-full mb-2 mt-3"
          >
            <Search className="size-4" />
            <span>Search & Filter</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[92%] max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Search Members</DialogTitle>
            <h6 className="text-red-600 font-semibold">
              Filter works automatically, just select the values
            </h6>
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
            {/* Date type selector */}
            <div className="space-y-2">
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

            {/* 4. Date Range */}
            {/* <div className="grid grid-cols-2 gap-4"> */}
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                From
              </Label>
              <Popover
                open={mobileDateFromOpen}
                onOpenChange={setMobileDateFromOpen}
              >
                {" "}
                {/* Changed Dialog to Popover */}
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal px-3",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {filters.fromDate
                        ? format(parseISO(filters.fromDate), "PPP")
                        : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    defaultMonth={
                      filters.fromDate ? parseISO(filters.fromDate) : new Date()
                    }
                    selected={
                      filters.fromDate ? parseISO(filters.fromDate) : undefined
                    }
                    onSelect={(date) => {
                      setFilters((prev) => ({
                        ...prev,
                        fromDate: date ? format(date, "yyyy-MM-dd") : "",
                      }));
                      setMobileDateFromOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                To
              </Label>
              <Popover
                open={mobileDateToOpen}
                onOpenChange={setMobileDateToOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal px-3",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {filters.to
                        ? format(parseISO(filters.to), "PPP")
                        : "Pick a date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                {/* MATCHED FIX: Removed side="top" to let it anchor naturally from the top edge */}
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    defaultMonth={
                      filters.to ? parseISO(filters.to) : new Date()
                    }
                    selected={filters.to ? parseISO(filters.to) : undefined}
                    onSelect={(date) => {
                      setFilters((prev) => ({
                        ...prev,
                        to: date ? format(date, "yyyy-MM-dd") : "",
                      }));
                      setMobileDateToOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Active Members
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

            {/* 2. Plan Select */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Plan
              </Label>
              <Select
                value={filters.plan || "all"}
                onValueChange={(val) =>
                  setFilters({ ...filters, plan: val === "all" ? "" : val })
                }
                className="w-full"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans.map((plan, idx) => (
                    <SelectItem key={idx} value={plan.name}>
                      {" "}
                      {/* Match the plan name */}
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 3. Source Filter */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Sources
            </Label>
            <Select
              // 1. Fallback to "all" string so the dropdown shows the correct active item
              value={filters.source ? String(filters.source) : "all"}
              onValueChange={(val) =>
                // 2. Map "all" to null, and convert numbers-as-strings back to numbers for your backend
                setFilters({
                  ...filters,
                  source: val === "all" ? null : Number(val),
                })
              }
            >
              <SelectTrigger className="w-full">
                {/* 3. Removed hardcoded span. Let SelectValue naturally show the chosen item name */}
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent className="max-w-[250px]">
                <SelectItem value="all">All Sources</SelectItem>
                {sources &&
                  sources.map((s) => (
                    // 4. Converted s.id to String. Used s.id as the key instead of array index.
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end"> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {/* 1. Member Name */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Member Name
            </Label>
            <Input
              className="w-full dark:text-white text-black placeholder:text-black/50 dark:placeholder:text-white/50"
              placeholder="Search name..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          {/* 2. Plan Filter */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Plan
            </Label>
            <Select
              value={filters.plan || "all"}
              onValueChange={(val) =>
                setFilters({ ...filters, plan: val === "all" ? "" : val })
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
                {plans &&
                  plans.map((p, idx) => (
                    <SelectItem key={idx} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Source Filter */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Sources
            </Label>
            <Select
              // 1. Fallback to "all" string so the dropdown shows the correct active item
              value={filters.source ? String(filters.source) : "all"}
              onValueChange={(val) =>
                // 2. Map "all" to null, and convert numbers-as-strings back to numbers for your backend
                setFilters({
                  ...filters,
                  source: val === "all" ? null : Number(val),
                })
              }
            >
              <SelectTrigger className="w-full">
                {/* 3. Removed hardcoded span. Let SelectValue naturally show the chosen item name */}
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent className="max-w-[250px]">
                <SelectItem value="all">All Sources</SelectItem>
                {sources &&
                  sources.map((s) => (
                    // 4. Converted s.id to String. Used s.id as the key instead of array index.
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* 4. Due Amount */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Due Amount
            </Label>
            <Input
              className="w-full"
              type="number"
              placeholder="Amount..."
              value={filters.dueAmount}
              onChange={(e) =>
                setFilters({ ...filters, dueAmount: e.target.value })
              }
            />
          </div>

          {/* 4. Date Type Selector */}
          <div className="space-y-1.5 w-full">
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

          {/* 5.Is Active filter */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Active Members
            </Label>
            <Select
              value={
                filters.isActive === null ? "all" : filters.isActive.toString()
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

          {/* 6. Date From */}

          <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Date From
            </Label>
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
                  defaultMonth={
                    filters.fromDate ? parseISO(filters.fromDate) : new Date()
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

          {/* 7. Date To */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Date To
            </Label>
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

          {/* 8. Actions */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              Clear Filters
            </Label>
            <Button
              onClick={resetFilters}
              variant="outline"
              className="w-full rounded-md"
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <div className="bg-card dark:bg-zinc-950 text-card-foreground rounded-xl shadow border dark:border-gray-800 p-3 md:p-8">
        <div className="relative overflow-auto h-[450px] no-scrollbar border rounded-lg">
          <Table className="w-auto lg:table-fixed lg:w-full">
            <TableHeader className="sticky top-0 z-40">
              <TableRow className="hover:bg-transparent">
                {/* STICKY NAME HEADER */}
                <TableHead
                  onClick={() => handleSort("name")}
                  className="sticky left-0 top-0 z-50 min-w-[150px] px-4 text-white bg-zinc-950 select-none border-b shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm tracking-wider">Name</span>
                    <div className="flex flex-row -space-y-2">
                      <ArrowUp
                        className={`size-3 ${sortBy === "name" && sortDir === "asc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                      <ArrowDown
                        className={`size-3 ${sortBy === "name" && sortDir === "desc" ? "text-primary fill-current" : "text-gray-300"}`}
                      />
                    </div>
                  </div>
                </TableHead>

                {/* OTHER HEADERS */}
                {[
                  { label: "Plan", key: "plan" },
                  { label: "Source", key: "source" },
                  { label: "Joined", key: "joined" },
                  { label: "Start Date", key: "startDate" },
                  { label: "Expiry Date", key: "expiry" },
                  { label: "Due", key: "dueAmount" },
                ].map((col) => (
                  <TableHead
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="top-0 z-40 text-center px-4 bg-zinc-950 text-white text-sm tracking-wider min-w-[90px]"
                  >
                    <div className="inline-flex items-center justify-center gap-2">
                      <span className="text-sm  tracking-wider">
                        {col.label}
                      </span>
                      <div className="flex flex-row -space-y-2">
                        <ArrowUp
                          className={`size-3 ${sortBy === col.key && sortDir === "asc" ? "text-primary fill-current" : "text-gray-300"}`}
                        />
                        <ArrowDown
                          className={`size-3 ${sortBy === col.key && sortDir === "desc" ? "text-primary fill-current" : "text-gray-300"}`}
                        />
                      </div>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="top-0 z-40 text-center px-4 bg-zinc-950 text-white text-sm tracking-wider min-w-[90px]">
                  Status
                </TableHead>
                <TableHead className="top-0 z-40 text-center bg-zinc-950 text-white text-sm tracking-wider w-[90px]">
                  Actions
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
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="mx-auto h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : Array.isArray(members) && members.length > 0 ? (
                members.map((member, index) => (
                  <TableRow
                    key={index}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    {/* STICKY NAME CELL */}
                    <TableCell
                      onClick={() => setViewingMember(member)}
                      className="sticky left-0 z-10 text-center px-4 cursor-pointer font-bold bg-card shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                    >
                      {member.name}
                    </TableCell>
                    <TableCell className="text-center px-4 bg-card">
                      <div className="inline-flex w-18 h-6 items-center justify-center rounded-md bg-black dark:bg-white px-2 shadow-sm">
                        <span className="block w-full text-center truncate text-xs font-medium text-white dark:text-black">
                          {member.plan || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center px-4 font-bold text-sm bg-card">
                      {member.source || "N/A"}
                    </TableCell>
                    <TableCell className="text-center px-4 text-muted-foreground bg-card whitespace-nowrap">
                      {member.joined}
                    </TableCell>
                    <TableCell
                      className={`text-center px-4 whitespace-nowrap bg-card`}
                    >
                      {/* {member.expiry} */}
                      {member.startDate || "N/A"}
                    </TableCell>
                    <TableCell
                      className={`text-center px-4 whitespace-nowrap bg-card ${getExpiryTextColor(member.expiry)}`}
                    >
                      {/* {member.expiry} */}
                      {getExpiryText(member.expiry)}
                    </TableCell>
                    <TableCell
                      className={`text-center px-4 font-semibold bg-card ${member.dueAmount > 0 ? "text-orange-500" : ""}`}
                    >
                      ₹{member.dueAmount}
                    </TableCell>

                    <TableCell className="text-center px-4 bg-card">
                      {/* <span className={getExpiryColor(member.expiry)}>
                        {getExpiryText(member.expiry)}
                      </span> */}
                      <div
                        className={`inline-flex w-24 h-6 items-center justify-center rounded-md px-2 shadow-sm ${getExpiryBg(member.isActive)}`}
                      >
                        <span className="block w-full text-center truncate text-[10px] font-bold text-white dark:text-black uppercase">
                          {member.isActive == 1 ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>

                    {/* ACTION DROPDOWN */}
                    <TableCell className="text-center px-4 bg-card">
                      <DropdownMenu
                        open={openDropdownId === member.id}
                        onOpenChange={(open) => {
                          setOpenDropdownId(open ? member.id : null);
                        }}
                      >
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
                              if (member.isActive === 1) {
                                setSelectedMember(member); // Set the member to edit
                                setIsModalOpen(true); // Open the modal
                                // setIsMenuOpen(false); // Manually close
                              } else {
                                toast.error(
                                  "You can only update active members",
                                );
                              }
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil className="size-4 text-blue-500" />
                            <span>Update</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => {
                              if (member.isActive === 1) {
                                setSelectedRenewalMember(member);
                                setRenewOpen(true);
                              } else {
                                toast.error(
                                  "You can only renew  active members",
                                );
                              }
                            }}
                          >
                            <CalendarClock className="size-4 text-blue-500" />
                            <span>Renew</span>
                          </DropdownMenuItem>

                          {member.dueAmount > 0 && (
                            <DropdownMenuItem
                              onClick={() => {
                                sendWhatsAppReminder(member);
                                // setIsMenuOpen(false); // Manually close
                              }}
                              className="gap-2 cursor-pointer"
                            >
                              <MessageCircle className="size-4 text-green-500" />
                              <span>Remind</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                            onSelect={(e) => {
                              e.preventDefault();

                              changeMemberStatus(
                                member.isActive === 1 ? "inactive" : "active",
                                member.id,
                                profile.ownerId,
                              );
                            }}
                          >
                            {/* <Trash2 className="size-4" /> */}
                            {isUpdating ? (
                              <>
                                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Updating...
                                </span>
                              </>
                            ) : (
                              <>
                                {member.isActive === 1 ? (
                                  <UserX className="text-red-600 size-4" />
                                ) : (
                                  <UserCheck className="text-green-600 size-4" />
                                )}
                                <span
                                  className={
                                    member.isActive === 1
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }
                                >
                                  {member.isActive === 1
                                    ? "InActive"
                                    : "Active"}
                                </span>
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* DELETE DIALOG */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                onSelect={(e) => e.preventDefault()} // Keep dropdown stable while dialog opens
                              >
                                <Trash2 className="size-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>

                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <AlertTriangle className="size-5 text-red-600" />
                                  </div>
                                  <AlertDialogTitle>
                                    Permanently Delete Member?
                                  </AlertDialogTitle>
                                </div>
                                <AlertDialogDescription>
                                  This will permanently delete{" "}
                                  <span className="font-bold text-foreground">
                                    "{member.name}"
                                  </span>{" "}
                                  and remove all their data, including{" "}
                                  <span className="font-bold text-foreground">
                                    payment history
                                  </span>{" "}
                                  from our servers. Alternatively, you can
                                  temporarily deactivate their account. This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter className="gap-2 mt-4">
                                <AlertDialogCancel className="rounded-xl border-zinc-200">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    handleDelete(member);
                                  }}
                                  disabled={loading}
                                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                                >
                                  {loading ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Yes, Delete Member"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
          Showing {totalElements === 0 ? 0 : displayStart} to {displayEnd} of{" "}
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
                {/* Using a span instead of PaginationLink to prevent "button-like" hover styles on text */}
                <span className="flex h-9 items-center justify-center px-3 text-sm whitespace-nowrap">
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
      <MemberDetailsModal
        member={viewingMember}
        open={!!viewingMember}
        onOpenChange={() => setViewingMember(null)}
      />
    </div>
  );
}
