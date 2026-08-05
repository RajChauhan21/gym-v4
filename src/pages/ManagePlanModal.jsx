import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "../contexts/ProfileContext";
import { UpgradeModal } from "./UpgradeModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cancelSubscription } from "../apis/backend_apis";
import { toast } from "sonner";
import { X } from "lucide-react";

export function ManagePlanModal({ open, setOpen }) {
  const [openUpgrade, setOpenUpgrade] = useState(false);
  const { profile, setProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const plan = {
    name: profile?.planName || "N/A",
    price: profile?.price ? `₹${profile.price}` : "₹0",
    status: profile?.status || "",
    renewDate:
      profile?.planName === "No Active Plan" ||
      !profile?.endDate ||
      isNaN(new Date(profile.endDate).getTime())
        ? "N/A"
        : new Date(profile.endDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }), // Removed the extra curly braces here
    usage: profile?.currentMemberCount || 0,
    limit: profile?.memberLimitCount || 0,
  };

  const cancelSubs = async () => {
    setLoading(true);
    try {
      const response = await cancelSubscription(profile.ownerId);
      if (response.status === 202 || response.data.statusCodeValue === 202) {
        if (response.data && response.data == "102") {
          toast.error("No active subscription found to cancel.");
        } else if (response.data && response.data == "202") {
          const payload = {
            ...profile,
            status: "CANCELLED",
          };
          console.log("Updated gym profile payload:", payload);
          setProfile(payload);
          localStorage.setItem("userProfile", JSON.stringify(payload));
          toast.success(
            "Subscription cancelled. Your plan will remain active until the current billing period ends.",
          );
        }
      } else if (
        response.status === 404 ||
        response.data.statusCodeValue === 202
      ) {
        if (response.data && response.data.message === "102") {
          toast.error("No active subscription found to cancel.");
        }
        if (
          response.data &&
          response.data.message &&
          response.data.message !== "100"
        ) {
          toast.error(
            "Something went wrong while cancelling subscription. Please try again",
          );
          // Member already exists with the name
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const usagePercent = (plan.usage / plan.limit) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-full max-w-[95vw] sm:max-w-xl lg:max-w-2xl p-4 sm:p-6"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
            Manage Your Plan
          </DialogTitle>

          <DialogPrimitive.Close asChild>
            <button
              disabled={loading}
              type="button"
              className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity outline-none"
              onClick={setOpen}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogPrimitive.Close>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Current Plan Card */}
          <Card className="rounded-xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <Badge
                  className={`capitalize ${
                    plan.status === "Active" ||
                    profile.status === "ACTIVE" ||
                    profile.status === "PARTIALLY_ACTIVE"
                      ? "bg-blue-600 text-white dark:bg-blue-600 dark:text-white"
                      : "bg-red-600 text-white line-through"
                  }`}
                >
                  {profile.status === "PARTIALLY_ACTIVE"
                    ? "PARTIALLY ACTIVE"
                    : "Active"}
                </Badge>
              </div>
              {/* 
              <p className="text-sm text-muted-foreground">
                {plan.price} • Renews on {profile.status === "PARTIALLY_ACTIVE" ? "N/A": plan.renewDate}
              </p> */}
              <p className="text-sm text-muted-foreground">
                {plan.price} •{" "}
                {profile?.status === "PARTIALLY_ACTIVE" ||
                profile?.planName === "No Active Plan"
                  ? "Your Last Date"
                  : "Renews on"}{" "}
                {profile?.status === "PARTIALLY_ACTIVE" ||
                profile?.planName === "No Active Plan"
                  ? profile?.billingDate &&
                    !isNaN(new Date(profile.billingDate).getTime())
                    ? new Date(profile.billingDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "N/A"
                  : plan?.renewDate &&
                      !isNaN(new Date(plan.renewDate).getTime())
                    ? new Date(plan.renewDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
              </p>

              {/* Usage */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Members Usage</span>
                  <span>
                    {plan.usage} / {plan.limit}
                  </span>
                </div>
                <Progress value={usagePercent} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button className="w-full" onClick={() => navigate("/pricing")}>
              Upgrade Plan
            </Button>
            {/* <UpgradeModal open={openUpgrade} setOpen={setOpenUpgrade} /> */}
            {/* <Button variant="outline" className="w-full">
              Switch to Yearly
            </Button> */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={cancelSubs}
              disabled={loading || profile.status === "PARTIALLY_ACTIVE"}
            >
              {loading
                ? "Cancelling..."
                : profile.status === "PARTIALLY_ACTIVE"
                  ? "Already Cancelled"
                  : "Cancel Subscription"}
            </Button>
          </div>

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center">
            You can upgrade, downgrade, or cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
