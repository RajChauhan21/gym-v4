import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Crown, Calendar, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export default function PaymentSuccessModal({
  open,
  onOpenChange,
  planName = "Pro Monthly",
  amount = "₹999",
  renewalDate = "30 Jun 2026",
}) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-md overflow-hidden border-0 p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* <DialogPrimitive.Close
          // disabled={uploading || downloadingTemplate}
          className="absolute right-4 top-4 z-[9999] rounded bg-red-500 p-2 text-white"
          onClick={onOpenChange} // Also clear form if they just close the modal
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close> */}

        <DialogPrimitive.Close asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1 z-50 h-8 w-8"
            onClick={onOpenChange}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogPrimitive.Close>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-background to-emerald-500/10" />

          <div className="relative px-4 py-6 sm:px-8 sm:py-8">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 ring-8 ring-green-500/5">
                <CheckCircle2 className="size-10 text-green-500" />
              </div>

              <h2 className="text-2xl font-bold">Subscription Activated</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Your premium subscription is now active and all features have
                been unlocked.
              </p>
            </div>

            {/* Subscription Details */}
            <div className="mt-8 rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Plan</span>

                <div className="flex items-center gap-2 font-medium">
                  <Crown className="size-4 shrink-0 text-yellow-500" />
                  <span>{planName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Amount Paid
                </span>

                <span className="font-semibold">{amount}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Next Renewal
                </span>

                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="size-4 shrink-0" />
                  <span>{renewalDate}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="outline"
                className="h-8 w-full"
                onClick={() => navigate("/paymentHistory")}
              >
                View Billing History
              </Button>

              <Button
                className="h-8 w-full"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
