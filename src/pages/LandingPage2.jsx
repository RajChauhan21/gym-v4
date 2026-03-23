import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dumbbell, Zap, ShieldCheck, Users, BarChart3 } from "lucide-react"

export default function LandingPage2() {
  const [yearly, setYearly] = useState(false)

  return (
    <div className="landing-wrapper bg-white text-black min-h-screen font-sans">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2 font-bold text-xl">
            <Dumbbell className="text-orange-500"/>
            IRON FORGE
          </div>

          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>

          <Button className="rounded-full px-6">
            Get Started
          </Button>

        </div>
      </nav>


      {/* HERO */}
      <section className="py-24 text-center px-6">
        <div className="max-w-4xl mx-auto space-y-6">

          <Badge className="bg-orange-100 text-orange-600 border-none">
            Built for Gym Owners
          </Badge>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Run Your Gym <br/>
            <span className="text-orange-500">Without the Paperwork</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Manage members, track payments, send reminders and grow your gym —
            all from one powerful dashboard.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="rounded-full px-8">
              Start Free Trial
            </Button>

            <Button size="lg" variant="outline" className="rounded-full px-8">
              Watch Demo
            </Button>
          </div>

        </div>
      </section>


      {/* DASHBOARD PREVIEW */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto bg-gray-100 rounded-2xl p-6 shadow-lg">

          <div className="h-[400px] rounded-xl bg-white flex items-center justify-center text-gray-400">
            Dashboard Preview Screenshot
          </div>

        </div>
      </section>


      {/* FEATURES */}
      <section id="features" className="py-24 bg-gray-50">
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


      {/* PRICING */}
      <section id="pricing" className="py-24">
        <div className="max-w-4xl mx-auto text-center px-6">

          <h2 className="text-3xl font-bold mb-6">
            Simple Pricing
          </h2>

          <div className="flex justify-center gap-4 mb-12">
            Monthly
            <Switch checked={yearly} onCheckedChange={setYearly}/>
            Yearly
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            <Pricing
              name="Starter"
              price={yearly ? "399" : "499"}
              features={[
                "Up to 50 Members",
                "Payment Tracking",
                "Basic Reminders"
              ]}
            />

            <Pricing
              name="Pro"
              price={yearly ? "799" : "999"}
              highlight
              features={[
                "Unlimited Members",
                "Automated Expiry Alerts",
                "Advanced Analytics",
                "Priority Support"
              ]}
            />

          </div>

        </div>
      </section>


      {/* FINAL CTA */}
      <section className="py-24 bg-orange-500 text-white text-center">
        <h2 className="text-4xl font-bold mb-4">
          Start Managing Your Gym Smarter
        </h2>

        <Button size="lg" className="bg-white text-orange-600 rounded-full px-10">
          Start Free Trial
        </Button>
      </section>


      {/* FOOTER */}
      <footer className="border-t py-10 text-center text-sm text-gray-500">
        © 2026 Iron Forge Gym Suite
      </footer>

    </div>
  )
}


function Feature({icon,title,text}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border space-y-3">
      <div className="text-orange-500">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  )
}

function Pricing({name,price,features,highlight}) {
  return (
    <div className={`rounded-xl border p-8 space-y-4 ${highlight ? "border-orange-500 shadow-lg" : ""}`}>
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="text-4xl font-bold">₹{price}</p>

      <ul className="space-y-2 text-sm text-gray-600">
        {features.map((f,i)=><li key={i}>✓ {f}</li>)}
      </ul>

      <Button className="w-full rounded-full">
        Get Started
      </Button>
    </div>
  )
}