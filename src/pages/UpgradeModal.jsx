import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import CheckOutModal from "../pages/CheckOutModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { getAllSubscriptionPlans } from "../apis/backend_apis";
import { useProfile } from "../contexts/ProfileContext";

export function UpgradeModal({ open, setOpen }) {
  const [isYearly, setIsYearly] = useState(false);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const getSubscriptionPlans = async () => {
    try {
      setLoading(true);
      const data = await getAllSubscriptionPlans();

      // Transform backend response to match UI needs
      const transformedPlans = data.map((plan) => ({
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
          plan.features.length > 0 ? "Core features included" : "Basic access",
        ],
      }));

      setPlans(transformedPlans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSubscriptionPlans();
  }, []);

  const handlePlanSelect = (planName) => {
    console.log("Upgrade to:", planName);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 no-scrollbar"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
            Upgrade Your Plan 🚀
          </DialogTitle>
          <p className="text-center text-muted-foreground text-xs sm:text-sm">
            Unlock premium features and grow your gym faster
          </p>
        </DialogHeader>

        {/* Urgency Banner */}
        <div className="text-center text-xs sm:text-sm bg-primary/10 text-primary py-2 rounded-md mt-2">
          ⚡ Limited Time: Get 2 months free on yearly plans
        </div>

        {/* Toggle */}
        {/* <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4">
          <span
            className={
              !isYearly
                ? "font-medium text-sm"
                : "text-muted-foreground text-sm"
            }
          >
            Monthly
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span
            className={
              isYearly ? "font-medium text-sm" : "text-muted-foreground text-sm"
            }
          >
            Yearly
          </span>
        </div> */}

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {plans.map((plan) => {
            // const price = isYearly ? plan.yearly : plan.monthly;

            return (
              <Card
                key={plan.name}
                className={`relative border rounded-xl p-2 transition-all hover:shadow-md ${
                  plan.highlighted ? "border-primary lg:scale-105" : ""
                }`}
              >
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
                  {profile.planName === plan.name && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] sm:text-xs whitespace-nowrap bg-blue-100 text-blue-700 border-blue-200"
                    >
                      Current Plan
                    </Badge>
                  )}
                  {plan.highlighted && (
                    <Badge className="text-[10px] sm:text-xs whitespace-nowrap">
                      Most Popular
                    </Badge>
                  )}
                </div>

                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-base sm:text-lg">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-xl sm:text-2xl font-bold">
                      ₹{plan.price}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm ml-1">
                      {/* {isYearly ? "/yr" : "/mo"} */}
                      {plan.days ? ` for ${plan.days} days` : ""}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-3">
                  <ul className="space-y-1 text-xs sm:text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    disabled={profile.planName === plan.name}
                    variant={
                      profile.planName === plan.name
                        ? "ghost"
                        : plan.highlighted
                          ? "default"
                          : "outline"
                    }
                    className="mt-3 w-full text-sm"
                    // onClick={() => handlePlanSelect(plan.name)}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setOpenCheckout(true);
                    }}
                  >
                    {profile.planName === plan.name
                      ? "Current Plan"
                      : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <CheckOutModal
          open={openCheckout}
          setOpen={setOpenCheckout}
          plan={selectedPlan}
        />

        {/* Footer */}
        <div className="text-center text-[10px] sm:text-xs text-muted-foreground mt-4">
          Cancel anytime • No hidden charges
        </div>
      </DialogContent>
    </Dialog>
  );
}
