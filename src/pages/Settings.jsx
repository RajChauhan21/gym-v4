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
import { Separator } from "@/components/ui/separator";
import EditProfileModal from "../components/dashboard/EditProfileModal";
import EditPaymentModal from "../components/dashboard/EditPaymentModal";
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

export default function Settings() {
  const { dark, toggleDark } = useTheme();
  const [open, setOpen] = useState(false);
  const { profile, setProfile } = useProfile();
  const [payOpen, setPayOpen] = useState(false);
  const [payments, setPayments] = useState({
    upiId: "paramount@okupi",
    bankAccount: "1234567890",
    ifscCode: "HDFC0001234",
    holderName: profile.owner,
  });
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
  const getCycleStats = (targetDate) => {
    const now = new Date();
    const end = new Date(targetDate);
    const start = new Date(end);
    start.setDate(end.getDate() - 30);

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const percentage = Math.min(Math.max((elapsed / total) * 100, 0), 100);
    const daysLeft = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      percentage: Math.round(percentage),
      daysLeft: Math.max(daysLeft, 0),
    };
  };

  const { percentage, daysLeft } = getCycleStats(profile.endDate);
  const memberUsagePercent =
    (profile.currentMemberCount / profile.memberLimitCount) * 100;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Basic Validation: Only images
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    // 2. Size Validation: Max 2MB for SaaS performance
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    // 3. Create Preview URL
    const url = URL.createObjectURL(file);

    // 4. Update State
    setProfile((prev) => ({
      ...prev,
      logo: url, // For immediate UI preview
      logoFile: file, // Save the raw file to upload to your database later
    }));
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  if (loading) {
    return <Loader text="Loading Settings...." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* GYM */}
      <Card className="rounded-3xl shadow-xl border-none bg-gradient-to-br from-card to-muted/20 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Branding Section */}
          <div className="lg:w-96 p-12 flex flex-col items-center justify-center relative overflow-hidden">
            {/* The "Anti-Box" Background: A soft, large radial gradient instead of a solid color */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(var(--primary),0.15),transparent_70%)]" />

            {/* Animated decorative ring */}
            {/* <div className="absolute size-84 border-[1px] border-primary/10 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none" /> */}

            <div className="relative group mb-8">
              {/* High-end Glowing Border */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary via-primary/50 to-transparent rounded-[2.5rem] blur-md opacity-20 group-hover:opacity-60 transition-all duration-700"></div>

              <div className="relative">
                <img
                  src={profile.gymLogo || "https://placeholder.com"}
                  alt="Gym Logo"
                  className="w-36 h-36 rounded-[2.5rem] object-cover border-4 border-background shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] group-hover:scale-[1.02] transition-transform duration-500"
                />
                <label className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center rounded-[2.5rem] transition-all cursor-pointer backdrop-blur-sm">
                  <Camera className="size-6 text-white mb-1" />
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">
                    Change Logo
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            <div className="relative z-10 text-center space-y-2">
              <h3 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                {profile.gymName}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <span className="h-[1px] w-4 bg-primary/40" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                  Est. 2024
                </span>
                <span className="h-[1px] w-4 bg-primary/40" />
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 p-8 md:p-12 bg-card/50 backdrop-blur-md">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-1">
                  Business Hub
                </h4>
                <p className="text-sm text-muted-foreground font-medium">
                  Public gym information & location
                </p>
              </div>
              <Button
                variant="secondary"
                className="rounded-xl font-bold shadow-sm"
                onClick={() => setOpen(true)}
              >
                Edit Business
              </Button>
              <EditProfileModal
                open={open}
                setOpen={setOpen}
                profile={profile}
                setProfile={setProfile}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="group">
                  <div className="flex items-center gap-3 text-muted-foreground mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white dark:group-hover:bg-black transition-colors">
                      <MapPin className="size-4" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      Physical Address
                    </span>
                  </div>
                  <p className="text-md font-bold leading-relaxed pl-1">
                    {profile.address}
                  </p>
                  {profile.googleMapUrl && (
                    <a
                      href={profile.googleMapUrl}
                      target="_blank"
                      className="mt-3 inline-flex items-center text-[11px] text-blue-500 font-black uppercase tracking-tighter hover:gap-1 transition-all"
                    >
                      Get Directions <ExternalLink className="ml-1 size-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <div className="flex items-center gap-3 text-muted-foreground mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white dark:group-hover:bg-black transition-colors">
                      <Globe className="size-4" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      Official Website
                    </span>
                  </div>
                  <p className="text-md font-bold pl-1 italic underline decoration-primary/30 underline-offset-4">
                    {profile.website || "Not Linked"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* PROFILE */}
      <Card className="rounded-3xl shadow-lg border border-zinc-200/50 dark:border-zinc-800/50 bg-card p-8 mt-8 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-4 -bottom-4 size-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            {/* Owner Profile Photo Upload */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative size-20">
                <img
                  src={profile.ownerLogo || "https://placeholder.com"}
                  alt="Owner"
                  className="size-20 rounded-full object-cover border-2 border-background shadow-xl"
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center rounded-full transition-all cursor-pointer backdrop-blur-sm">
                  <Camera className="size-4 text-white mb-0.5" />
                  <span className="text-[8px] text-white font-black uppercase">
                    Change
                  </span>
                  {/* Note: You'll need a separate handler or logic for owner image vs gym logo */}
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-black tracking-tight flex items-center gap-2">
                Owner Profile
                <ShieldCheck className="size-4 text-indigo-500" />
              </h4>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">
                Private Account Details
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            className="rounded-xl font-bold shadow-sm"
            onClick={() => setOpen(true)}
          >
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Full Name",
              value: profile.owner,
              icon: <User className="size-3" />,
            },
            {
              label: "Phone Line",
              value: profile.phone,
              icon: <Phone className="size-3" />,
            },
            {
              label: "Management Email",
              value: profile.email,
              icon: <Mail className="size-3" />,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-muted/40 border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-card hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                {item.icon}
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                  {item.label}
                </span>
              </div>
              <p
                className="font-bold text-foreground truncate"
                title={item.value}
              >
                {item.value || "Not Set"}
              </p>
            </div>
          ))}
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
              <CardDescription className="flex items-center gap-1.5 text-xs">
                <CreditCard className="size-3" />
                {profile.planName} • {profile.price}
              </CardDescription>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
              ${profile.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-100 text-amber-700"}`}
            >
              {profile.status}
            </span>
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
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">
                  {profile.currentMemberCount}
                </span>
                <span className="text-xs text-muted-foreground">
                  / {profile.memberLimitCount}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${memberUsagePercent}%` }}
                />
              </div>
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
                <span className="text-2xl font-bold italic text-orange-600 dark:text-orange-400">
                  {daysLeft}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  days left
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
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
              {new Date(profile.endDate).toLocaleDateString(
                "en-GB",
                { day: "numeric", month: "short", year: "numeric" },
              )}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            <Button className="w-full font-semibold">Manage Plan</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium"
              >
                <Receipt className="mr-2 size-3.5" />
                History
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-medium"
              >
                <Download className="mr-2 size-3.5" />
                Invoices
              </Button>
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
          {/* <Button className="mr-2">Change Password</Button> */}
          {/* <Button>Logout from all devices</Button> */}
          <ChangePasswordModal />
          <LogoutModal />
        </CardContent>
      </Card>

      {/* DANGER ZONE */}
      <Card className="rounded-2xl shadow-lg border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
        </CardHeader>

        <CardContent>
          {/* <Button variant="destructive">Delete Account</Button> */}
          <DeleteAccountModal />
        </CardContent>
      </Card>
    </div>
  );
}
