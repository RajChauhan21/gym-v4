import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/Loader";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import EditProfileModal from "../components/dashboard/EditProfileModal";
import EditPaymentModal from "../components/dashboard/EditPaymentModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Globe,
  MapPin,
  Phone,
  User,
  Building2,
  Mail,
  Camera,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Navigation,
  Loader2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  CalendarDays,
  Download,
  Receipt,
  CreditCard,
  Landmark,
  QrCode,
  UserCircle,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "../contexts/ThemeContext";
import { useProfile } from "../contexts/ProfileContext";
import { ChangePasswordModal } from "../components/dashboard/ChangePasswordModal";
import { LogoutModal } from "../components/dashboard/LogoutModal";
import { DeleteAccountModal } from "../components/dashboard/DeleteAccoutModal";
import { UpgradeModal } from "./UpgradeModal";
import { useNavigate } from "react-router-dom";
import { ManagePlanModal } from "./ManagePlanModal";
import VerifyOtpModal from "./VerfiyOtpModal";
import { toast } from "sonner";
import {
  getActiveSubscriptionOfOwner,
  uploadImageForGym,
  uploadImageForOwner,
} from "../apis/backend_apis";
import { ImagePreviewModal } from "./ImagePreviewModal";

export default function Settings() {
  const { dark, toggleDark } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { profile, setProfile } = useProfile();
  const [verifyOtpOpen, setVerifyOtpOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [ownerImage, setOwnerImage] = useState(null);
  const [gymImage, setGymImage] = useState(null);
  const [isUploadingOwner, setIsUploadingOwner] = useState(false);
  const [isUploadingGym, setIsUploadingGym] = useState(false);
  const [ownerPreviewOpen, setOwnerPreviewOpen] = useState(false);
  const [gymPreviewOpen, setGymPreviewOpen] = useState(false);
  const [loadActiveSubs, setLoadActiveSubs] = useState(false);
  const [editType, setEditType] = useState("gym"); // "gym" or "owner"
  const [payments, setPayments] = useState({
    upiId: "paramount@okupi",
    bankAccount: "1234567890",
    ifscCode: "HDFC0001234",
    holderName: profile.owner,
  });
  const [openUpgrade, setOpenUpgrade] = useState(false);
  const [notifications, setNotifications] = useState({
    reminders: true,
    expiry: true,
    newMember: false,
    reminderDays: "3", // Default: 3 days before
  });
  const [preferences, setPreferences] = useState({
    darkMode: false,
    currency: "INR", // 👈 MUST be a string, not { INR: true }
  });

  // Mock data - replace with your API response variables later
  const subscription = {
    planName: "Pro Gym Plan",
    price: "$99/mo",
    status: "active",
    nextBillingDate: "2026-05-25",
    currentMembers: 120,
    maxMembers: 200,
  };

  // Helper to calculate cycle stats
  const getCycleStats = (startDate, endDate) => {
    // 1. Guard against null, undefined, or missing profile dates
    if (!startDate || !endDate) {
      return { percentage: 0, daysLeft: 0 };
    }
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { percentage: 0, daysLeft: 0 };
    }

    // Total duration of this specific billing cycle
    const total = end.getTime() - start.getTime();
    // Time that has passed from the start until right now
    const elapsed = now.getTime() - start.getTime();

    // Guard against division by zero if start and end dates are identical
    const percentage = total > 0 ? (elapsed / total) * 100 : 0;

    const daysLeft = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      // Clamps the value safely between 0% and 100%
      percentage: Math.round(Math.min(Math.max(percentage, 0), 100)),
      daysLeft: Math.max(0, daysLeft), // Never show negative days
    };
  };

  const { percentage, daysLeft } = getCycleStats(
    profile.startDate,
    profile.endDate,
  );
  const memberUsagePercent =
    (profile.currentMemberCount / profile.memberLimitCount) * 100;

  const handleGymImageUpload = async (e) => {
    setIsUploadingGym(true);
    const file = e.target.files[0];
    if (!file) return;

    // 1. Basic Validation: Only images
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, etc.)");
      setIsUploadingGym(false);
      return;
    }

    // 2. Size Validation: Max 2MB for SaaS performance
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      setIsUploadingGym(false);
      return;
    }

    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(
        `Unsupported file extension: .${fileExtension}. Please use JPG, JPEG, PNG.`,
      );
      setIsUploadingGym(false);
      return;
    }

    // 3. Create Preview URL
    const url = URL.createObjectURL(file);

    try {
      const gymId = Number(profile.gymId);
      const response = await uploadImageForGym(gymId, file);
      if (response.status === 201 || response.status === 200) {
        const newImageUrl = response.data; // The URL string from backend

        // 1. Update Context State for immediate UI change
        setProfile((prev) => {
          const updatedProfile = { ...prev, gymLogo: newImageUrl };

          // 2. Update LocalStorage so it persists after refresh
          const storedUser = localStorage.getItem("userProfile"); // Use your actual key name
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            parsedUser.gymLogo = newImageUrl;
            localStorage.setItem("userProfile", JSON.stringify(parsedUser));
          }
          console.log("Updated profile with new gym logo:", updatedProfile);
          return updatedProfile;
        });

        toast.success("Gym logo uploaded successfully");
      } else if (response.status === 404) {
        toast.error(
          "Something went wrong while uploading image. Please try again later.",
        );
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
      toast.error(
        "Something went wrong while uploading image. Please try again later.",
      );
    } finally {
      setIsUploadingGym(false);
    }
  };

  const handleOwnerImageUpload = async (e) => {
    setIsUploadingOwner(true);
    const file = e.target.files[0];
    if (!file) return;

    // 1. Basic Validation: Only images
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, etc.)");
      setIsUploadingOwner(false);
      return;
    }

    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(
        `Unsupported file extension: .${fileExtension}. Please use JPG, JPEG, PNG.`,
      );
      setIsUploadingOwner(false);
      return;
    }

    // 2. Size Validation: Max 2MB for SaaS performance
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      setIsUploadingOwner(false);
      return;
    }

    // 3. Create Preview URL
    const url = URL.createObjectURL(file);

    try {
      const response = await uploadImageForOwner(profile.ownerId, file);
      if (response.status === 201 || response.status === 200) {
        const newImageUrl = response.data; // The URL string from backend

        // 1. Update Context State for immediate UI change
        setProfile((prev) => {
          const updatedProfile = { ...prev, ownerLogo: newImageUrl };

          // 2. Update LocalStorage so it persists after refresh
          const storedUser = localStorage.getItem("userProfile"); // Use your actual key name
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            parsedUser.ownerLogo = newImageUrl;
            localStorage.setItem("userProfile", JSON.stringify(parsedUser));
          }
          return updatedProfile;
        });

        toast.success("Owner image uploaded successfully");
      } else if (response.status === 404) {
        toast.error(
          "Something went wrong while uploading image. Please try again later.",
        );
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
      toast.error(
        "Something went wrong while uploading image. Please try again later",
      );
    } finally {
      setIsUploadingOwner(false);
    }
  };

  const activeSubscription = async () => {
    setLoadActiveSubs(true);
    try {
      const response = await getActiveSubscriptionOfOwner(profile.ownerId);
      if (response.status === 201 || response.status === 202) {
        setProfile((prev) => {
          // 1. Map backend fields to the correct local state keys
          const updatedProfile = {
            ...prev,
            planName: response.data.name,
            price: response.data.price,
            startDate: response.data.startDate,
            endDate: response.data.endDate,
            status: response.data.subscriptionStatus,
          };

          // 2. Update LocalStorage so it persists after refresh
          const storedUser = localStorage.getItem("userProfile");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            // Map backend fields to the correct localStorage keys
            parsedUser.planName = response.data.name;
            parsedUser.price = response.data.price;
            parsedUser.startDate = response.data.startDate;
            parsedUser.endDate = response.data.endDate;
            parsedUser.status = response.data.subscriptionStatus;

            localStorage.setItem("userProfile", JSON.stringify(parsedUser));
          }
          console.log('updated localstorage', localStorage.getItem("userProfile"));
          return updatedProfile;
        });

        console.log("Active subscription details:", response.data);
      } else if (response.status === 404) {
        toast.error(
          "Something went wrong while uploading image. Please try again later.",
        );
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
      console.error(
        "API Error in active subscription:",
        error.response || error,
      );
    } finally {
      setLoadActiveSubs(false);
    }
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  // if (loading) {
  //   return <Loader text="Loading Settings...." />;
  // }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* GYM */}

      <Card className="overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="p-6 lg:p-8">
          {/* TOP HEADER */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-5">
              {/* LOGO */}
              <div className="relative">
                {/* Preview Click */}
                <button
                  type="button"
                  onClick={() => setGymPreviewOpen(true)}
                  className="group relative"
                >
                  <div className="size-24 overflow-hidden rounded-2xl ring-4 ring-background shadow-xl">
                    <img
                      src={`${profile.gymLogo}${
                        profile.gymLogo?.includes("?") ? "&" : "?"
                      }t=${Date.now()}`}
                      alt="Gym Logo"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </button>

                {/* Upload Button */}
                {/* <label className="absolute -right-2 -bottom-2 cursor-pointer">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary text-white dark:text-black shadow-lg">
                    {isUploadingGym ? (
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Camera className="size-4" />
                    )}
                  </div>

                  <input
                    type="file"
                    className="hidden"
                    disabled={isUploadingGym}
                    onChange={handleGymImageUpload}
                    accept="image/*"
                  />
                </label> */}
                <label
                  onClick={(e) => {
                    if (profile.planName === "No Active Plan") {
                      // 1. Stop the browser from opening the file selector window
                      e.preventDefault();
                      // 2. Show the error toast
                      toast.error(
                        "You need an active plan to upload images. Please subscribe to a plan first.",
                      );
                    }
                  }}
                  className={`absolute -right-2 -bottom-2 ${
                    profile.planName === "No Active Plan"
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  }`}
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary text-white dark:text-black shadow-lg">
                    {isUploadingGym ? (
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Camera className="size-4" />
                    )}
                  </div>

                  <input
                    type="file"
                    className="hidden"
                    // Block input selection if uploading OR if there is no active plan
                    disabled={
                      isUploadingGym || profile.planName === "No Active Plan"
                    }
                    onChange={handleGymImageUpload}
                    accept="image/*"
                  />
                </label>
              </div>

              {/* GYM INFO */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {profile.gymName}
                  </h2>
                  <ShieldCheck className="size-5 text-primary" />
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Professional Gym Profile
                </p>

                <Badge variant="secondary" className="mt-3 rounded-full px-3">
                  Active
                </Badge>
              </div>
            </div>

            {/* RIGHT ACTION */}
            <Button
              onClick={() => {
                if (profile.planName === "No Active Plan") {
                  // 1. Show the error toast
                  toast.error(
                    "You need an active plan to mange gym profile. Please subscribe to a plan first.",
                  );
                } else {
                  // 2. Open modal and set type if they have a plan
                  setOpen(true);
                  setEditType("gym");
                }
              }}
              className="rounded-xl"
            >
              Edit Gym Profile
            </Button>

            <EditProfileModal
              open={open}
              setOpen={setOpen}
              profile={profile}
              setProfile={setProfile}
              editType={editType}
            />
          </div>

          {/* INFO GRID */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {/* ADDRESS */}
            <div className="rounded-2xl border bg-muted/30 p-5 duration-500 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Location
                </p>
              </div>

              <p className="text-sm font-medium leading-relaxed">
                {profile.address || "Not provided"}
              </p>
            </div>

            {/* MAPS */}
            <div className="rounded-2xl border bg-muted/30 p-5 duration-500 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <Navigation className="size-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Google Maps
                </p>
              </div>

              {profile.googleMapUrl ? (
                <a
                  href={profile.googleMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Open in Maps
                  <ExternalLink className="size-3" />
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Not provided</p>
              )}
            </div>

            {/* WEBSITE */}
            <div className="rounded-2xl border bg-muted/30 p-5 duration-500 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Website
                </p>
              </div>

              {profile.website ? (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Visit Website
                  <ExternalLink className="size-3" />
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Not provided</p>
              )}
            </div>
          </div>
        </div>

        {/* IMAGE PREVIEW MODAL */}
        <ImagePreviewModal
          open={gymPreviewOpen}
          onOpenChange={setGymPreviewOpen}
          image={`${profile.gymLogo}${
            profile.gymLogo?.includes("?") ? "&" : "?"
          }t=${Date.now()}`}
          title={profile.gymName || "Gym"}
          subtitle="Gym Profile Photo"
        />
      </Card>

      {/* PROFILE */}
      <Card className="overflow-hidden rounded-3xl border bg-card shadow-sm mt-8">
        <div className="p-6 lg:p-8">
          {/* TOP HEADER */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-5">
              {/* PROFILE IMAGE */}
              <div className="relative">
                {/* PREVIEW BUTTON */}
                <button
                  type="button"
                  onClick={() => setOwnerPreviewOpen(true)}
                  className="group relative"
                >
                  <div className="size-24 overflow-hidden rounded-full ring-4 ring-background shadow-xl">
                    <img
                      key={profile.ownerLogo}
                      src={
                        profile.ownerLogo?.includes("googleusercontent.com")
                          ? profile.ownerLogo
                          : `${profile.ownerLogo}${
                              profile.ownerLogo?.includes("?") ? "&" : "?"
                            }t=${Date.now()}`
                      }
                      alt="Owner"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* VIEW OVERLAY */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300">
                      <span className="text-xs font-bold text-white">View</span>
                    </div>
                  </div>
                </button>

                {/* UPLOAD BUTTON */}
                <label
                  onClick={(e) => {
                    if (profile.planName === "No Active Plan") {
                      // 1. Prevent the file explorer from opening
                      e.preventDefault();
                      // 2. Show the error toast
                      toast.error(
                        "You need an active plan to upload images. Please subscribe to a plan first.",
                      );
                    }
                  }}
                  className={`absolute -right-2 -bottom-2 ${
                    profile.planName === "No Active Plan"
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  }`}
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary text-white dark:text-black shadow-lg transition-transform hover:scale-105">
                    {isUploadingOwner ? (
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Camera className="size-4" />
                    )}
                  </div>

                  <input
                    type="file"
                    className="hidden"
                    // Also disable the input field entirely as a backup safety measure
                    disabled={
                      isUploadingOwner || profile.planName === "No Active Plan"
                    }
                    onChange={handleOwnerImageUpload}
                    accept="image/*"
                  />
                </label>
              </div>

              {/* OWNER INFO */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    {profile.owner || "Owner Name"}
                  </h2>

                  <ShieldCheck className="size-5 text-primary" />
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Gym Management Profile
                </p>

                <Badge variant="secondary" className="mt-3 rounded-full px-3">
                  Private Account
                </Badge>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <Button
              onClick={() => {
                if (profile.planName === "No Active Plan") {
                  // 1. Show the error toast
                  toast.error(
                    "You need an active plan to manage your profile. Please subscribe to a plan first.",
                  );
                } else {
                  // 2. Open modal and set type if they have a plan
                  setOpen(true);
                  setEditType("owner");
                }
              }}
              className="rounded-xl"
            >
              Edit Owner Profile
            </Button>
          </div>

          {/* INFO GRID */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {/* FULL NAME */}
            <div className="rounded-2xl border bg-muted/30 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <User className="size-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Full Name
                </p>
              </div>

              <p className="text-sm font-medium leading-relaxed">
                {profile.owner || "Not provided"}
              </p>
            </div>

            {/* PHONE */}
            <div className="rounded-2xl border bg-muted/30 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Phone Line
                </p>
              </div>

              <p className="text-sm font-medium leading-relaxed">
                {profile.phone || "Not provided"}
              </p>
            </div>

            {/* EMAIL */}
            <div className="rounded-2xl border bg-muted/30 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Management Email
                </p>
              </div>

              <p className="text-sm font-medium break-all">
                {profile.email || "Not provided"}
              </p>
            </div>
          </div>

          {/* IMAGE PREVIEW MODAL */}
          <ImagePreviewModal
            open={ownerPreviewOpen}
            onOpenChange={setOwnerPreviewOpen}
            image={
              profile.ownerLogo?.includes("googleusercontent.com")
                ? profile.ownerLogo
                : `${profile.ownerLogo}${
                    profile.ownerLogo?.includes("?") ? "&" : "?"
                  }t=${Date.now()}`
            }
            title={profile.owner || "Owner"}
            subtitle="Owner Profile Photo"
          />
        </div>
      </Card>

      {/* Billing Details */}
      <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold tracking-tight">
                Subscription
              </CardTitle>
              {/* <CardDescription className="flex items-center gap-1.5 text-xs">
                <Badge
                  className={`text-xs px-3 py-1 border-0 shadow-sm ${
                    profile.planName === "Max Pro"
                      ? "bg-gradient-to-r from-orange-100 to-amber-200 text-orange-900"
                      : "bg-gradient-to-r from-violet-100 to-purple-200 text-purple-900"
                  }`}
                >
                  {profile.planName}
                </Badge>

                <span className="text-sm font-semibold text-black dark:text-white">
                  ₹{profile.price}
                </span>
              </CardDescription> */}
              <CardDescription className="flex flex-col items-start gap-3 text-xs">
                {/* PLAN BADGE + PRICE */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={`text-xs px-3 py-1 border-0 shadow-sm ${
                      profile.planName === "Max Pro"
                        ? "bg-gradient-to-r from-orange-100 to-amber-200 text-orange-900"
                        : "bg-gradient-to-r from-violet-100 to-purple-200 text-purple-900"
                    }`}
                  >
                    {profile.planName}
                  </Badge>

                  <span className="text-sm font-semibold text-black dark:text-white">
                    ₹{profile.price}
                  </span>
                </div>

                {/* YOUR EXISTING STATUS BADGE HERE */}

                {/* BUTTON + TOOLTIP BELOW STATUS */}
              </CardDescription>
            </div>

            <div className="flex flex-col items-center gap-4">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
  ${
    profile.status === "Active" || profile.status === "ACTIVE"
      ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
      : "bg-red-600 text-white line-through" // Changed to line-through
  }`}
              >
                {profile.status || "Active"}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      disabled={
                        loadActiveSubs
                      }
                      onClick={async () => {
                        activeSubscription();
                      }}
                      className="rounded-xl h-6"
                    >
                      {loadActiveSubs ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        "Refresh"
                      )}
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>
                      Not seeing the correct subscription status? Click here to refresh and fetch the latest details from our servers.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Active Members */}
            <div className="space-y-3 rounded-xl border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Members
                </p>
                <Users className="size-3 text-muted-foreground" />
              </div>
              {/* <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">
                  {profile.currentMemberCount}
                </span>
                <span className="text-xs text-muted-foreground">
                  / {profile.memberLimitCount}
                </span>
              </div> */}
              <div>
                {profile?.planName === "No Active Plan" ? (
                  // 1. Case: User has no active membership plan - Show status message
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xl font-bold italic text-neutral-500 dark:text-neutral-400">
                      Inactive
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      No active subscription plan found
                    </span>
                  </div>
                ) : (
                  // 2. Case: User has an active plan - Show normal progress stats
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">
                        {profile?.currentMemberCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {profile?.memberLimitCount}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden mt-2">
                      <div
                        className="h-full bg-primary transition-all duration-700"
                        style={{ width: `${memberUsagePercent}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-primary  transition-all duration-700"
                  style={{ width: `${memberUsagePercent}%` }}
                />
              </div> */}
            </div>

            {/* Billing Cycle Progress */}
            <div className="space-y-3 rounded-xl border p-4 bg-muted/20 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Cycle Progress
                </p>
                <CalendarDays className="size-3 text-muted-foreground" />
              </div>
              <div className="flex items-baseline gap-1">
                <div>
                  {profile?.planName === "No Active Plan" ? (
                    // 1. Case: User has no active membership plan
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xl font-bold italic text-neutral-500 dark:text-neutral-400">
                        Inactive
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        No active subscription plan found
                      </span>
                    </div>
                  ) : daysLeft === 0 ? (
                    <>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xl font-bold italic text-red-600 dark:text-red-400 animate-pulse">
                          Renewal Today
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          Subscription charges apply today
                        </span>
                      </div>
                      {/* <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div> */}
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold italic text-orange-600 dark:text-orange-400">
                          {daysLeft}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {daysLeft === 1 ? "day left" : "days left"}
                        </span>
                      </div>
                      {/* <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div> */}
                    </>
                  )}
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground flex items-center justify-start gap-2 py-1">
            <span>Next invoice on</span>
            <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded">
              {profile?.planName === "No Active Plan" ||
              !profile?.endDate ||
              isNaN(new Date(profile.endDate).getTime())
                ? // Fallback text when there is no valid end date
                  "N/A"
                : // Cleanly formats only when a valid date exists
                  new Date(profile.endDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="default" onClick={() => navigate("/pricing")}>
                Upgrade
              </Button>
              <Button variant="outline" onClick={() => setPayOpen(true)}>
                Manage Plan
              </Button>
              {/* <UpgradeModal open={openUpgrade} setOpen={setOpenUpgrade} /> */}
              <ManagePlanModal open={payOpen} setOpen={setPayOpen} />
            </div>

            <div className="grid grid-cols-1 gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium "
                onClick={() => navigate("/paymentHistory")}
              >
                <Receipt className="mr-2 size-3.5" />
                History
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium"
              >
                <Download className="mr-2 size-3.5" />
                Invoices
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NOTIFICATIONS */}
      <Card className="rounded-2xl shadow-lg border dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select the events you want to be alerted about.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* CHECKBOX SECTION */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="newMember"
                checked={notifications.newMember}
                onCheckedChange={(val) =>
                  setNotifications({ ...notifications, newMember: val })
                }
              />
              <label
                htmlFor="newMember"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                New Member Registration
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="expiry"
                checked={notifications.expiry}
                onCheckedChange={(val) =>
                  setNotifications({ ...notifications, expiry: val })
                }
              />
              <label
                htmlFor="expiry"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Membership Expiry
              </label>
            </div>
          </div>

          <Separator />

          {/* SELECT SECTION (The Reminder Logic) */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Reminder Threshold</Label>
            <p className="text-xs text-muted-foreground">
              Send automated WhatsApp reminders to members before their plan
              ends.
            </p>

            <Select
              value={notifications.reminderDays}
              onValueChange={(val) =>
                setNotifications({ ...notifications, reminderDays: val })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select threshold" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day before</SelectItem>
                <SelectItem value="3">3 Days before</SelectItem>
                <SelectItem value="7">1 Week before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notificatons 2 */}
      <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Notifications
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Manage alerts and reminders for your gym
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Membership Expiry Reminder */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Membership Expiry Reminder
              </p>
              <p className="text-xs text-muted-foreground">
                Notify before a member’s plan expires
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          {/* Payment Received */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Payment Notifications
              </p>
              <p className="text-xs text-muted-foreground">
                Get notified when a payment is added
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          {/* Membership Expired */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Membership Expired Alerts
              </p>
              <p className="text-xs text-muted-foreground">
                Alert when a membership has expired
              </p>
            </div>
            <Switch />
          </div>

          {/* Reminder Timing */}
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">
              Reminder Timing
            </p>
            <p className="text-xs text-muted-foreground">
              Choose how many days before expiry to notify
            </p>

            <Select defaultValue="3">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day Before</SelectItem>
                <SelectItem value="3">3 Days Before</SelectItem>
                <SelectItem value="5">5 Days Before</SelectItem>
                <SelectItem value="7">7 Days Before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* PREFERENCES */}
      <Card className="rounded-2xl shadow-lg border dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your app experience and billing currency.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 z-50">
          {/* DARK MODE */}
          <div className="flex items-center space-x-3">
            {/* <Checkbox
              id="darkMode"
              checked={preferences.darkMode}
              onCheckedChange={(val) =>
                setPreferences({ ...preferences, darkMode: val })
              }
            /> */}
            <Checkbox
              id="darkMode"
              checked={dark}
              onCheckedChange={toggleDark}
            />
            <label
              htmlFor="darkMode"
              className="text-sm font-medium cursor-pointer"
            >
              Enable Dark Mode
            </label>
          </div>

          <Separator />

          {/* CURRENCY SELECTION */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Base Currency</Label>
            <p className="text-xs text-muted-foreground">
              Select the primary currency for your gym payments.
            </p>

            <RadioGroup
              value={preferences.currency}
              onValueChange={(val) =>
                setPreferences({ ...preferences, currency: val })
              }
              className="flex items-center gap-6"
              defaultValue="INR"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="INR" id="inr" />
                <label
                  htmlFor="inr"
                  className="text-sm cursor-pointer font-medium"
                >
                  INR (₹)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USD" id="usd" />
                <label
                  htmlFor="usd"
                  className="text-sm cursor-pointer font-medium"
                >
                  USD ($)
                </label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* SECURITY */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* <Button onClick={() => setVerifyOtpOpen(true)}>
            Change Password
          </Button> */}
          <VerifyOtpModal
            open={verifyOtpOpen}
            onOpenChange={setVerifyOtpOpen}
            email={profile.email}
            onVerified={() => {
              // close otp modal
              setVerifyOtpOpen(false);

              // open password modal
              setChangePasswordOpen(true);
            }}
          />
          <ChangePasswordModal
            open={changePasswordOpen}
            onOpenChange={setChangePasswordOpen}
          />
          {/* <LogoutModal /> */}
        </CardContent>
        <CardContent>
          {/* <Button variant="destructive">Delete Account</Button> */}
          <DeleteAccountModal />
        </CardContent>
      </Card>

      {/* DANGER ZONE */}
      {/* <Card className="rounded-2xl shadow-lg border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
        </CardHeader>

        <CardContent>
          <DeleteAccountModal />
        </CardContent>
      </Card> */}
    </div>
  );
}
