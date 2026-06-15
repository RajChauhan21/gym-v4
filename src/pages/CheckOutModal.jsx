import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  createRazorpaySubscription,
  verifySubscriptionPayment, getActiveSubscriptionOfOwner
} from "../apis/backend_apis";
import { useState } from "react";
import { useProfile } from "../contexts/ProfileContext";
import { Loader } from "lucide-react";
import PaymentSuccessModal from "./PaymentSuccessModal";
import PaymentFailedModal from "./PaymentFailedModal";

export default function CheckOutModal({ open, setOpen, plan }) {
  if (!plan) return null;
  const GST_RATE = 0.18;
  const gstAmount = Math.round(plan.price * GST_RATE);
  const total = plan.price + gstAmount;
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [failureModalOpen, setFailureModalOpen] = useState(false);

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [failureReason, setFailureReason] = useState("");

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const activeSubscription = async () => {
    setLoadActiveSubs(true);
    try {
      const response = await getActiveSubscriptionOfOwner(profile.ownerId);
      if (response.status === 201 || response.status === 202) {
        setProfile((prev) => {
          // 1. Map backend fields to the correct local state keys
          const updatedProfile = {
            ...prev,
            planName: response.data.name || "No Active Plan",
            price: response.data.price || 0,
            startDate: response.data.startDate || "N/A",
            endDate: response.data.endDate || "N/A",
            status: response.data.subscriptionStatus || "",
            memberLimitCount:response.data.memberLimitCount || 0,
          };

          // 2. Update LocalStorage so it persists after refresh
          const storedUser = localStorage.getItem("userProfile");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            // Map backend fields to the correct localStorage keys
            parsedUser.planName = response.data.name || "No Active Plan";
            parsedUser.price = response.data.price || 0;
            parsedUser.startDate = response.data.startDate || "N/A";
            parsedUser.endDate = response.data.endDate || "N/A";
            parsedUser.status = response.data.subscriptionStatus || "";

            localStorage.setItem("userProfile", JSON.stringify(parsedUser));
          }
          console.log(
            "updated localstorage",
            localStorage.getItem("userProfile"),
          );
          return updatedProfile;
        });

        console.log("Active subscription details:", response.data);
      } else if (response.status === 404) {
        toast.error(
          "Something went wrong while uploading image. Please try again later.",
        );
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
      console.error(
        "API Error in active subscription:",
        error.response || error,
      );
    } finally {
      setLoadActiveSubs(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        toast.error("Razorpay SDK failed to load");
        setLoading(false);
        return;
      }

      // 🔹 Step 1: Call backend to create subscription
      const response = await createRazorpaySubscription(
        profile?.ownerId,
        plan.id,
      );

      let subscriptionId = null;

      if (response.status === 202 || response.data.statusCodeValue === 200) {
        subscriptionId = response.data;
        console.log("subs id " + response.data);
      } else if (response.status === 404) {
        toast.error(
          "Something went wrong while connecting to razorpay. Please try again later.",
        );
        return;
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
        return;
      }

      if (!subscriptionId) {
        throw new Error("Subscription creation failed");
      }

      // 🔹 Step 2: Open Razorpay Checkout
      const options = {
        key: "rzp_test_SfiIKwSs0OhpAz", // do not harcode in production!
        subscription_id: subscriptionId,

        name: "Gym SaaS",
        description: "Subscription Payment",

        // handler: function (response) {
        //   // ⚠️ DO NOT trust this fully
        //   console.log("Payment success (frontend):", response);

        //   // Just UX feedback
        //   toast.success("Payment initiated successfully 🎉");
        // },

        handler: async function (response) {
          try {
            const payload = {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySubscriptionId: response.razorpay_subscription_id,
              razorpaySignature: response.razorpay_signature,
            };

            const verifyResponse = await verifySubscriptionPayment(payload);

            // Read the actual boolean value from the response data
            const isVerified = verifyResponse.data;

            // Open the success modal only if the boolean is explicitly true
            if (isVerified == true) {
              activeSubscription();
              setSuccessModalOpen(true);
            } else {
              setFailureModalOpen(true);
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            setFailureModalOpen(true);
          }
        },

        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
          },
        },

        prefill: {
          phone: profile?.phone,
          email: profile?.email,
        },

        // customer_id:profile?.owner,
        notes: {
          owner_id: profile?.owner, // Put "john" here
          subsId: subscriptionId,
        },

        theme: {
          color: "#e2e3fe",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-[90%]  max-w-md sm:max-w-lg p-6"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
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
          <Button
            className="w-full mt-4"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <Loader className="animate-spin mr-2" />
            ) : (
              `Proceed to Pay ₹${total}`
            )}
          </Button>


          {/* Trust */}
          <p className="text-xs text-center text-muted-foreground">
            Secure payments via Razorpay • Cancel anytime
          </p>
        </div>
      </DialogContent>

      <PaymentSuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        planName={plan?.name}
        amount={`₹${plan?.price}`}
        renewalDate="Next billing cycle"
      />

      <PaymentFailedModal
        open={failureModalOpen}
        onOpenChange={setFailureModalOpen}
        reason={failureReason}
      />
    </Dialog>
  );
}
