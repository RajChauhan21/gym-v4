import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/Loader"
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import EditProfileModal from "../components/dashboard/EditProfileModal";
import EditPaymentModal from "../components/dashboard/EditPaymentModal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Globe, MapPin, Phone, User, Building2, Mail } from "lucide-react"
import { CreditCard, Landmark, QrCode, UserCircle } from "lucide-react";
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
      logo: url,       // For immediate UI preview
      logoFile: file   // Save the raw file to upload to your database later
    }));
  };

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200)
  }, [])

  if (loading) {
    return (
      <Loader text="Loading Settings...." />
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* PROFILE */}

      <Card className="rounded-2xl shadow-sm border dark:border-zinc-800 bg-card overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[300px]">

          {/* Left Side: Brand Identity (The Sidebar) */}
          <div className="md:w-72 bg-muted/30 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r dark:border-zinc-800">
            <div className="relative group mb-4">
              {/* Using the logo from your profile state */}
              <img
                src={profile.gymLogo || "https://via.placeholder.com"}
                alt="Logo"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-background shadow-sm transition-transform group-hover:scale-105"
              />
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition cursor-pointer">
                <span className="text-white text-[10px] font-bold uppercase tracking-tighter">Change</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">
              {profile.gymName}
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
              Premium Fitness
            </p>

            {profile.website && (
              <a
                href={`https://${profile.website}`}
                target="_blank"
                className="mt-4 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-medium"
              >
                <Globe className="size-3" /> Visit Website
              </a>
            )}
          </div>

          {/* Right Side: Business Details Grid */}
          <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Business Information
              </h4>
              <Button onClick={() => setOpen(true)}>Edit</Button>
              <EditProfileModal
                open={open}
                setOpen={setOpen}
                profile={profile}
                setProfile={setProfile}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
              {/* Owner Section */}
              {/* COLUMN 1: Identity & Place */}
              <div className="space-y-10">
                {/* Owner Section */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                    <User className="size-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Owner</p>
                  </div>
                  <p className="font-semibold text-foreground dark:text-white">{profile.owner}</p>
                </div>

                {/* Location Section */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                    <MapPin className="size-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Gym Location</p>
                  </div>
                  <p className="font-semibold text-foreground leading-relaxed dark:text-white">
                    {profile.address}
                  </p>
                  {profile.mapLink && (
                    <a href={profile.mapLink} target="_blank" rel="noreferrer" className="text-[10px] text-green-600 hover:text-green-700 font-bold uppercase mt-2 inline-block transition-colors">
                      Open Maps
                    </a>
                  )}
                </div>
              </div>

              {/*Cloumn 2 - Contact & Email */}
              <div className="space-y-10">
                {/* Contact Section */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                    <Phone className="size-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Contact</p>
                  </div>
                  <p className="font-semibold text-foreground dark:text-white">{profile.phone}</p>
                </div>

                {/* Email Section */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                    <Mail className="size-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Business Email</p>
                  </div>
                  <p className="font-semibold text-foreground truncate dark:text-white" title={profile.email}>
                    {profile.email || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>


      {/* PAYMENTS */}
      {/* <Card className="rounded-2xl shadow">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Payment Settings</CardTitle>
          <Button onClick={() => setPayOpen(true)}>Update</Button>
          <EditPaymentModal
            open={payOpen}
            setOpen={setPayOpen}
            payments={payments}
            setPayments={setPayments}
          />
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label className="mb-3">UPI ID</Label>
            <Input placeholder="example@upi" />
          </div>

          <div>
            <Label className="mb-3">Bank Account</Label>
            <Input placeholder="Account Number" />
          </div>

          <div>
            <Label className="mb-3">IFSC Code</Label>
            <Input placeholder="IFSC Code" />
          </div>

          <div>
            <Label className="mb-3">Account Holder Name</Label>
            <Input placeholder="IFSC Code" />
          </div>
        </CardContent>
      </Card> */}
      <Card className="rounded-2xl shadow-sm border dark:border-zinc-800 bg-card overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-center border-b pb-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">Payment Settings</CardTitle>
            <p className="text-xs text-muted-foreground">Account details used for member payments.</p>
          </div>
          <Button size="sm" onClick={() => setPayOpen(true)} className="rounded-lg">
            Update
          </Button>
        </CardHeader>

        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. UPI SECTION */}
          <div className="p-2 rounded-xl bg-muted/30 border border-transparent hover:border-green-500/20 transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                <QrCode className="size-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary UPI ID</p>
            </div>
            <p className="font-mono font-medium text-foreground ml-9 dark:text-white">{payments.upiId || "Not set"}</p>
          </div>

          {/* 2. HOLDER NAME SECTION */}
          <div className="p-2 rounded-xl bg-muted/30 border border-transparent hover:border-blue-500/20 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <UserCircle className="size-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Holder</p>
            </div>
            <p className="font-semibold text-foreground ml-9 dark:text-white">{payments.holderName || "Not set"}</p>
          </div>

          {/* 3. BANK DETAILS (Spans 2 columns on desktop) */}
          <div className="md:col-span-2 p-2 rounded-xl border border-dashed flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-muted text-muted-foreground">
                <Landmark className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Bank Account Details</p>
                <p className="font-medium">A/C: {payments.bankAccount || "XXXX XXXX XXXX"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">IFSC Code</p>
                <p className="font-mono text-sm uppercase">{payments.ifscCode || "NONE0000000"}</p>
              </div>
            </div>
          </div>
        </CardContent>

        <EditPaymentModal
          open={payOpen}
          setOpen={setPayOpen}
          payments={payments}
          setPayments={setPayments}
        />
      </Card>

      {/* NOTIFICATIONS */}
      <Card className="rounded-2xl shadow border dark:border-zinc-800">
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

      {/* PREFERENCES */}
      <Card className="rounded-2xl shadow border dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <p className="text-sm text-muted-foreground">Manage your app experience and billing currency.</p>
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
            <label htmlFor="darkMode" className="text-sm font-medium cursor-pointer">
              Enable Dark Mode
            </label>
          </div>

          <Separator />

          {/* CURRENCY SELECTION */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Base Currency</Label>
            <p className="text-xs text-muted-foreground">Select the primary currency for your gym payments.</p>

            <RadioGroup
              value={preferences.currency}
              onValueChange={(val) => setPreferences({ ...preferences, currency: val })}
              className="flex items-center gap-6"
              defaultValue="INR"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="INR" id="inr" />
                <label htmlFor="inr" className="text-sm cursor-pointer font-medium">INR (₹)</label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USD" id="usd" />
                <label htmlFor="usd" className="text-sm cursor-pointer font-medium">USD ($)</label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* SECURITY */}
      <Card className="rounded-2xl shadow">
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* <Button className="mr-2">Change Password</Button> */}
          {/* <Button>Logout from all devices</Button> */}
          <ChangePasswordModal/>
          <LogoutModal/>
        </CardContent>
      </Card>

      {/* DANGER ZONE */}
      <Card className="rounded-2xl shadow border-red-500">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
        </CardHeader>

        <CardContent>
          {/* <Button variant="destructive">Delete Account</Button> */}
          <DeleteAccountModal/>
        </CardContent>
      </Card>
    </div>
  );
}
