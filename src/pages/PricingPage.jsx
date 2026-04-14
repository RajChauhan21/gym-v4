import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    monthly: 499,
    yearly: 4990,
    features: [
      "Up to 50 members",
      "Basic analytics",
      "Manual payments",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    monthly: 999,
    yearly: 9990,
    features: [
      "Up to 200 members",
      "Advanced analytics",
      "Automated payments",
      "WhatsApp reminders",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    monthly: 1999,
    yearly: 19990,
    features: [
      "Unlimited members",
      "All analytics",
      "Automation + reports",
      "Custom branding",
      "Dedicated support",
    ],
    highlighted: false,
  },
];

export default function PricingPage({ compact = false }) {
  const [isYearly, setIsYearly] = useState(false);

  const handlePlanSelect = (planName) => {
    console.log("Selected Plan:", planName);
    // TODO: integrate payment / upgrade flow
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${compact ? "p-4" : "px-6 py-16"}`}>
      {/* Header */}
      {!compact && (
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Choose a plan that fits your gym business. Upgrade anytime.
          </p>
        </div>
      )}

      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <span className={!isYearly ? "font-medium" : "text-muted-foreground"}>
          Monthly
        </span>
        <Switch checked={isYearly} onCheckedChange={setIsYearly} />
        <span className={isYearly ? "font-medium" : "text-muted-foreground"}>
          Yearly (Save 2 months)
        </span>
      </div>

      {/* Pricing Cards */}
      <div className={`mt-10 grid gap-6 ${compact ? "grid-cols-1" : "md:grid-cols-3"} max-w-6xl mx-auto`}>
        {plans.map((plan) => {
          const price = isYearly ? plan.yearly : plan.monthly;

          return (
            <Card
              key={plan.name}
              className={`relative rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg ${
                plan.highlighted
                  ? "border-primary scale-105"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <Badge className="absolute top-4 right-2">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl font-semibold">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹{price}</span>
                  <span className="text-muted-foreground ml-1">
                    {isYearly ? "/year" : "/month"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-4 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  {plan.highlighted ? "Get Started" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!compact && (
        <div className="mt-16 text-center text-sm text-muted-foreground">
          No hidden charges • 7-day free trial
        </div>
      )}
    </div>
  );
}