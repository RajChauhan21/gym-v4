import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {login, getAllOwners, saveGym, loginByGoogle} from "../apis/backend_apis";
import {
  CheckCircle2,
  Dumbbell,
  Zap,
  ShieldCheck,
  QrCode,
  Mail,
  MapPin,
  Globe,
  Users,
  BarChart3,
  Menu,
} from "lucide-react";
import { AuthModal } from "../components/auth/AuthModal";
import { useTheme } from "../contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function LandingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const { dark, toggleDark } = useTheme();
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* --- STICKY NAVIGATION --- */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
        {/* justify-between pushes content to the absolute ends */}
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8">
          {/* LEFT: Logo - stays pinned to the left */}
          <div className="flex items-center gap-2 shrink-0">
            <Dumbbell className="size-6 text-primary" onClick={getAllOwners}/>
            <span className="text-xl font-bold tracking-tighter">
              IRON FORGE
            </span>
          </div>

          {/* CENTER: Navigation - hidden on mobile, centered on desktop */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#features"
              className="hover:text-primary transition-colors"
            >
              Features
            </a>
            <a href="#pricing" className="hover:text-primary transition-colors">
              Pricing
            </a>
          </div>

          {/* RIGHT: Buttons - stays pinned to the right */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <AuthModal triggerText="Get Started" />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDark}
              className="rounded-full cursor-pointer shrink-0"
            >
              {dark ? (
                <Sun className="size-5 text-yellow-500 transition-all" />
              ) : (
                <Moon className="size-5 transition-all" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                        Now in Beta
                    </Badge> */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
            Manage your Gym <br />
            <span className="text-primary">Without the Paperwork.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The simple SaaS for gym owners. Automate reminders, track
            memberships, and grow your community—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {/* <Button size="lg" className="h-12 px-8 rounded-full text-md font-bold shadow-lg shadow-primary/20">
                            Start Free Trial
                        </Button> */}
            <AuthModal triggerText="Get Started" />
            <Button
            onClick={login}
              size="lg"
              variant="outline"
              className="h-10 px-8 rounded-full text-md font-bold"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* --- PROBLEM & SOLUTION CARDS --- */}
      <section id="features" className="py-24 bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">
              Everything you need to manage a gym
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Feature
              icon={<Users />}
              title="Member Management"
              text="Track memberships, renewals, and member data easily."
            />

            <Feature
              icon={<Zap />}
              title="Automated Reminders"
              text="Send payment reminders instantly via WhatsApp."
            />

            <Feature
              icon={<BarChart3 />}
              title="Analytics Dashboard"
              text="Understand gym revenue, growth, and activity."
            />

            <Feature
              icon={<ShieldCheck />}
              title="Expiry Alerts"
              text="Never miss expiring memberships again."
            />
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={!isYearly ? "font-bold" : "text-muted-foreground"}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={isYearly ? "font-bold" : "text-muted-foreground"}>
              Yearly{" "}
              <Badge
                variant="secondary"
                className="ml-1 bg-green-500/10 text-green-600 border-none"
              >
                Save 20%
              </Badge>
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              title="Starter"
              price={isYearly ? "399" : "499"}
              description="Perfect for small studio gyms."
              features={[
                "Up to 50 Members",
                "Basic WhatsApp Links",
                "Payment Tracking",
              ]}
            />
            <PricingCard
              title="Pro"
              price={isYearly ? "799" : "999"}
              description="Our most popular plan for growth."
              highlight
              features={[
                "Unlimited Members",
                "Automated Expiry Alerts",
                "Multi-Staff Accounts",
                "Priority Support",
              ]}
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-card border-t pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="size-6 text-primary" />
                <span className="font-bold text-xl">IRON FORGE</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Helping gym owners worldwide go paperless and grow their fitness
                business with simple, powerful tools.
              </p>
            </div>
            <FooterList
              title="Product"
              items={["Features", "Pricing", "Testimonials"]}
            />
            <FooterList
              title="Company"
              items={["About Us", "Contact", "Privacy Policy"]}
            />
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest">
                Connect
              </h4>
              <div className="flex gap-4">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-background hover:text-foreground transition-all">
                  <Mail className="size-4" />
                </div>
                <div className="size-8 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-background hover:text-foreground transition-all">
                  <MapPin className="size-4" />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            © 2026 Iron Forge Gym Suite. Built for Gym Owners.
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function FeatureCard({ icon, title, problem, solution }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 p-8 space-y-6">
      <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-red-500/80 font-medium">
          ❌ Problem: {problem}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          ✅ Solution: {solution}
        </p>
      </div>
    </Card>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="bg-background text-foreground rounded-xl p-6 shadow-sm border space-y-3">
      <div className="text-orange-500">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}

function PricingCard({ title, price, description, features, highlight }) {
  return (
    <Card
      className={`relative p-8 rounded-3xl border-2 transition-all ${highlight ? "border-primary shadow-2xl scale-105 z-10" : "border-border shadow-md"}`}
    >
      {highlight && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 mt-4">
          Most Popular
        </Badge>
      )}
      <CardHeader className="p-0 mb-6 text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <div className="text-center mb-8">
        <span className="text-4xl font-extrabold">₹{price}</span>
        <span className="text-muted-foreground"> / month</span>
      </div>
      <div className="space-y-4 mb-8">
        {features.map((f) => (
          <div key={f} className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="size-4 text-green-500 shrink-0" />
            <span>{f}</span>
          </div>
        ))}
      </div>
      <Button
        className="w-full rounded-full h-11"
        variant={highlight ? "default" : "outline"}
      >
        Get Started
      </Button>
    </Card>
  );
}

function FooterList({ title, items }) {
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-sm uppercase tracking-widest">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li
            key={i}
            className="hover:text-primary cursor-pointer transition-colors"
          >
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
