import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, CreditCard, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export default function PaymentFailedModal({
  open,
  onOpenChange,
  reason = "The payment could not be completed.",
  onRetry,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[90%] max-w-md overflow-hidden border-0 p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
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
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-background to-orange-500/10" />

          <div className="relative px-8 py-10">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 ring-8 ring-red-500/5">
                <AlertTriangle className="size-10 text-red-500" />
              </div>

              <h2 className="text-2xl font-bold">Payment Failed</h2>

              <p className="mt-2 text-sm text-muted-foreground">{reason}</p>
            </div>

            <div className="mt-8 rounded-2xl border bg-muted/30 p-4">
              <div className="flex gap-3">
                <CreditCard className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

                <div>
                  <p className="font-medium">Possible reasons</p>

                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Insufficient balance</li>
                    <li>• Bank declined the payment</li>
                    <li>• UPI request expired</li>
                    <li>• Network interruption</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>

              <Button
                className="flex-1"
                // onClick={onRetry}
                onClick={() => onOpenChange(false)}
              >
                <RefreshCcw className="mr-2 size-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
