import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { sendOtp, verifyOtp } from "../apis/backend_apis";

export default function VerifyOtpModal({
  open,
  onOpenChange,
  email,
  onVerified,
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter valid 6 digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await verifyOtp(email, otp);
      if (response.data.body != "201") {
        toast.error("Invalid OTP");
      } else {
        // success
        toast.success("OTP verified successfully");
        onOpenChange(false);
        resetModalState();
        // trigger password reset modal
        onVerified();
      }
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const response = await sendOtp(email);
      if (response.data.statusCodeValue == 202) {
        setOtpSent(true);
        toast.success(response.data.body);
      } else if (
        response.status === 404 ||
        response.data.statusCodeValue == 404
      ) {
        toast.error(
          "Something went wrong while sending OTP. Please try again later.",
        );
      } else if (
        response.status === 429 ||
        response.data.statusCodeValue == 429
      ) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetModalState = () => {
    setOtp("");
    setError("");
    setOtpSent(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          resetModalState();
        }

        onOpenChange(val);
      }}
    >
      {/* REMOVE DialogTrigger from here */}

      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-zinc-900 mr-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl">
          Change Password
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-black to-zinc-800 text-white p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <DialogTitle className="text-xl font-semibold">
                Verify OTP
              </DialogTitle>

              <DialogDescription className="text-zinc-300 mt-1">
                Secure password reset verification
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Email */}
          <div className="text-sm text-zinc-500 break-all">
            OTP will be sent to:
            <span className="font-medium text-black dark:text-white ml-1">
              {email}
            </span>
          </div>

          {/* BEFORE OTP SENT */}
          {!otpSent && (
            <Button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full h-12 rounded-xl text-base font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Get OTP"
              )}
            </Button>
          )}

          {/* AFTER OTP SENT */}
          {otpSent && (
            <>
              {/* OTP Input */}
              <div className="space-y-2">
                <Input
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  maxLength={6}
                  placeholder="Enter OTP"
                  className="h-12 text-center text-2xl tracking-[10px] font-semibold rounded-xl"
                />

                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full h-12 rounded-xl text-base font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              {/* Resend */}
              <div className="text-center text-sm text-zinc-500">
                Didn't receive OTP?{" "}
                <button
                  onClick={handleSendOtp}
                  className="font-medium text-black dark:text-white hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
