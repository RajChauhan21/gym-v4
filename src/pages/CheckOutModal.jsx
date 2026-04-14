import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function CheckOutModal({ open, setOpen, plan }) {
  if (!plan) return null;
  console.log(plan);
  const GST_RATE = 0.18;
  const gstAmount = Math.round(plan.price * GST_RATE);
  const total = plan.price + gstAmount;

  // const handlePayment = async () => {
  //   // 1. Call backend to create Razorpay order
  //   // const res = await fetch("/api/payment/create-order", {
  //   //   method: "POST",
  //   //   headers: { "Content-Type": "application/json" },
  //   //   body: JSON.stringify({ amount: total }),
  //   // });

  //   // const data = await res.json();

  //   const options = {
  //     key: "rzp_test_SdGz0Kv1QdvBfQ",
  //     amount: plan.amount,
  //     currency: "INR",
  //     name: "Gym SaaS",
  //     description: `${plan.name} Plan`,
  //     order_id: plan.name,
  //     handler: async function (response) {
  //       // 2. Verify payment on backend
  //       // await fetch("/api/payment/verify", {
  //       //   method: "POST",
  //       //   headers: { "Content-Type": "application/json" },
  //       //   body: JSON.stringify(response),
  //       // });

  //       toast.success("Payment Successful 🎉");
  //       setOpen(false);
  //     },
  //     prefill: {
  //       name: "Gym Owner",
  //       email: "owner@example.com",
  //     },
  //     theme: {
  //       color: "#6366f1",
  //     },
  //   };

  //   const razor = new window.Razorpay(options);
  //   razor.open();
  // };

  const handlePayment = () => {
    const options = {
      key: "rzp_test_SdGz0Kv1QdvBfQ",

      // ✅ amount in paise
      amount: plan.price * 100,

      currency: "INR",
      name: "Gym SaaS",
      description: `${plan.name} Plan`,

      // ❌ REMOVE order_id completely
      // order_id: plan.name,

      handler: function (response) {
        console.log("Payment Success:", response);

        toast.success("Payment Successful 🎉");
        setOpen(false);
      },

      prefill: {
        name: "Gym Owner",
        email: "owner@example.com",
      },

      theme: {
        color: "#6366f1",
      },
    };

    const razor = new window.Razorpay(options);
    razor.open();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-md sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Plan Info */}
          <div className="flex justify-between">
            <span className="font-medium">{plan.name} Plan</span>
            <span>₹{plan.price}</span>
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{plan.price}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{gstAmount}</span>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {/* CTA */}
          <Button className="w-full mt-4" onClick={handlePayment}>
            Proceed to Pay ₹{total}
          </Button>

          {/* Trust */}
          <p className="text-xs text-center text-muted-foreground">
            Secure payments via Razorpay • Cancel anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
