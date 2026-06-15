import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "../contexts/ProfileContext";
import CheckOutModal from "../pages/CheckOutModal";
import { getAllSubscriptionPlans } from "../apis/backend_apis";
import { Skeleton } from "../components/ui/skeleton";

// const plans = [
//   {
//     name: "Basic",
//     monthly: 699,
//     yearly: 4990,
//     features: [
//       "Up to 50 members",
//       "Basic analytics",
//       "Manual payments",
//       "Email support",
//       "Email support",
//     ],
//     highlighted: false,
//   },
//   {
//     name: "Pro",
//     monthly: 899,
//     yearly: 9990,
//     features: [
//       "Up to 200 members",
//       "Advanced analytics",
//       "Automated payments",
//       "WhatsApp reminders",
//       "Priority support",
//     ],
//     highlighted: true,
//   },
// ];

export default function PricingPage({ compact = false }) {
  const [isYearly, setIsYearly] = useState(false);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePlanSelect = (planName) => {
    console.log("Selected Plan:", planName);
    // TODO: integrate payment / upgrade flow
  };

  const getSubscriptionPlans = async () => {
    try {
      setLoading(true);
      const response = await getAllSubscriptionPlans();

      if (response.status === 202 || response.data.statusCodeValue === 200) {
        // Transform backend response to match UI needs
        const transformedPlans = response.data.map((plan) => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          days: plan.days,
          // Check if any subscription in the array is ACTIVE
          isActive: plan.subscriptions.some((s) => s.status === "ACTIVE"),
          // Highlight logic (example: highlight the 'Amateaur' plan)
          highlighted: plan.name === "Amateaur",
          // Map feature IDs to readable text or use member limit
          features: [
            `Up to ${plan.memberLimit} members`,
            `${plan.days} days validity`,
            plan.features.length > 5 ? "Priority support" : "Email support",
            plan.features.length > 0
              ? "Core features included"
              : "Basic access",
          ],
        }));
        setPlans(transformedPlans);
      } else if (response.status === 404) {
        toast.error(
          "Something went wrong while fetching subscription plans. Please try again later.",
        );
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getSubscriptionPlans();
  }, []);

  return (
    <div
      className={`mt-10 grid gap-6 ${
        compact ? "grid-cols-1" : "md:grid-cols-2"
      } max-w-6xl mx-auto`}
    >
      {loading
        ? Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="relative rounded-2xl border shadow-sm">
              <CardHeader className="text-center">
                <Skeleton className="mx-auto h-6 w-28" />

                <div className="mt-4 flex justify-center">
                  <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                <ul className="space-y-3">
                  {["w-full", "w-5/6", "w-4/5", "w-full", "w-3/4", "w-5/6"].map(
                    (width, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className={`h-4 ${width}`} />
                      </li>
                    ),
                  )}
                </ul>

                <Skeleton className="mt-4 h-10 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))
        : plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg ${
                plan.highlighted ? "border-primary scale-105" : "border-border"
              }`}
            >
              {profile?.planName === plan.name && (
                <Badge  className="absolute top-4 left-2">
                  Current Plan
                </Badge>
              )}

              {plan.highlighted && (
                <Badge  className="absolute top-4 right-2">Most Popular</Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl font-semibold">
                  {plan.name}
                </CardTitle>

                <div className="mt-4">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
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
                  onClick={() => {
                    setSelectedPlan(plan);
                    setOpenCheckout(true);
                  }}
                >
                  {plan.highlighted
                    ? `Get ${plan.name}`
                    : `Choose ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}

      <CheckOutModal
        open={openCheckout}
        setOpen={setOpenCheckout}
        plan={selectedPlan}
      />
    </div>
  );
}
