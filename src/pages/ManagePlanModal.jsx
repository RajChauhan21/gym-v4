import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "../contexts/ProfileContext";

export function ManagePlanModal({ open, setOpen }) {
  const { profile } = useProfile();
  const plan = {
    name: profile?.planName || "N/A",
    price: profile?.price ? `₹${profile.price}` : "₹0",
    status: profile?.status || "Active",
    renewDate:
      new Date(profile?.endDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) || "N/A",
    usage: profile?.currentMemberCount || 0,
    limit: profile?.memberLimitCount || 0,
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
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Current Plan Card */}
          <Card className="rounded-xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{plan.name} Plan</h2>
                <Badge>{plan.status}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {plan.price} • Renews on {plan.renewDate}
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
            <Button className="w-full">Upgrade Plan</Button>
            <Button variant="outline" className="w-full">
              Switch to Yearly
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="outline" className="w-full">
              Change Plan
            </Button>
            <Button variant="destructive" className="w-full">
              Cancel Subscription
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
