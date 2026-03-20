import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EditPaymentModal({ open, setOpen, payments, setPayments }) {
  const [form, setForm] = useState(payments);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(payments);
      setErrors({});
    }
  }, [payments, open]);

  const validate = () => {
    let newErrors = {};

    // UPI Validation (must contain @)
    if (!form.upiId.trim()) {
      newErrors.upiId = "UPI ID is required";
    } else if (!form.upiId.includes("@")) {
      newErrors.upiId = "Enter a valid UPI ID (e.g., name@bank)";
    }

    // Bank Account (Numeric, 9-18 digits)
    if (!form.bankAccount.trim()) {
      newErrors.bankAccount = "Account number is required";
    } else if (!/^\d{9,18}$/.test(form.bankAccount)) {
      newErrors.bankAccount = "Enter 9 to 18 digits only";
    }

    // IFSC Code (4 letters, 0, 6 chars)
    if (!form.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) {
      newErrors.ifscCode = "Invalid IFSC format (e.g. SBIN0001234)";
    }

    // Holder Name (Letters only)
    if (!form.holderName.trim()) {
      newErrors.holderName = "Holder name is required";
    } else if (!/^[A-Za-z\s]+$/.test(form.holderName)) {
      newErrors.holderName = "Only letters allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      setLoading(true);
      setPayments(form);
      setOpen(false);
      setTimeout(() => {
        setLoading(false);
        toast.success("Payment details updated successfully.");
        setOpen(false);
      }, 1000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Removed fixed height h-[520px] to kill the gap */}
      <DialogContent className="w-[95%] max-w-md max-h-[90vh] flex flex-col rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Update Payment Details</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="upi">UPI ID</Label>
            <Input
              id="upi"
              placeholder="gymname@okaxis"
              value={form.upiId}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
              className={errors.upiId ? "border-red-500" : ""}
            />
            <div className="h-3">
              {errors.upiId && <p className="text-red-500 text-[11px] font-medium">{errors.upiId}</p>
              }
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acc">Bank Account Number</Label>
            <Input
              id="acc"
              placeholder="Enter 9-18 digits"
              value={form.bankAccount}
              onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
              className={errors.bankAccount ? "border-red-500" : ""}
            />
            <div className="h-3">
              {errors.bankAccount && <p className="text-red-500 text-[11px] font-medium">{errors.bankAccount}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ifsc">IFSC Code</Label>
            <Input
              id="ifsc"
              placeholder="SBIN0001234"
              className={`uppercase ${errors.ifscCode ? "border-red-500" : ""}`}
              value={form.ifscCode}
              onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
            />
            <div className="h-3">
              {errors.ifscCode && <p className="text-red-500 text-[11px] font-medium">{errors.ifscCode}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="holder">Account Holder Name</Label>
            <Input
              id="holder"
              placeholder="Gym Name or Owner Name"
              value={form.holderName}
              onChange={(e) => setForm({ ...form, holderName: e.target.value })}
              className={errors.holderName ? "border-red-500" : ""}
            />
            <div className="h-3">
              {errors.holderName && <p className="text-red-500 text-[11px] font-medium">{errors.holderName}</p>}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 border-t mt-4 gap-2 sm:gap-0">
          <Button classname="mx-6" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button classname="mx-6" onClick={handleSave}>
            Save Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
