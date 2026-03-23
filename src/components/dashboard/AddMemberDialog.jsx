import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGymStore } from "../../store/gymStore";
import { toast } from "sonner";
import { PhoneNumberInput } from "@/components/ui/phone-input";
import { allowOnlyText, allowOnlyNumbers } from "../../lib/inputValidator";

export default function AddMemberDialog() {
  const plans = useGymStore((state) => state.plans);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // const { toast } = useToast()

  const calculateExpiry = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() + Number(months));
    return date.toISOString().split("T")[0];
  };

  const [form, setForm] = useState({
    name: "",
    phone: "",
    countryCode: "+91",
    plan: "",
    amount: "",
    address: "",
    email: "",
  });

  const initialFormState = {
    name: "",
    phone: "",
    countryCode: "+91",
    plan: "",
    amount: "",
    address: "",
    email: "",
  };

  const validate = () => {
    let newErrors = {};

    // Text-only validation (Allows letters, spaces, and basic punctuation like hyphens/apostrophes)
    const textRegex = /^[a-zA-Z\s'.-]+$/;

    if (!form.name.trim()) {
      newErrors.name = "member name required";
    } else if (!textRegex.test(form.name)) {
      newErrors.name = "Member name should only contain letters";
    }

    // Address: Allows letters, numbers, spaces, and common separators (/, #, -)
    const addressRegex = /^[a-zA-Z0-9\s,.'#/-]+$/;
    if (!form.address.trim()) {
      newErrors.address = "Address required";
    } else if (!addressRegex.test(form.address)) {
      newErrors.address = "Invalid characters found in address";
    }

    // Phone Validation
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;

    if (!form.phone || !form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(form.phone.replace(/[\s()-]/g, ""))) {
      // We strip spaces, dashes, and brackets before testing the regex
      newErrors.phone = "Enter a valid international phone number";
    }

    // Strict Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!form.email.trim()) {
      newErrors.email = "Email required";
    }
    else if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.amount.trim()) {
      newErrors.amount = "Amount required";
    }

    if (!form.plan == null) {
      newErrors.plan = "Plan required";
    }
    return newErrors;
  };

  const handleSubmit = () => {
    setLoading(true);
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      setLoading(false)
      return
    }
    const expiry = calculateExpiry(form.plan);

    const newMember = {
      ...form,
      expiry,
      due: Number(form.amount),
    };

    console.log("Smart Member:", newMember);
    // setOpen(false) // ✅ CLOSE MODAL

    setTimeout(() => {
      setLoading(false);
      resetForm();
      toast.success("Member added successfully.");
      setOpen(false);
    }, 1000);
  };

  const resetForm = () => {
    setForm(initialFormState);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm(); // ✅ Clears data & errors on close
    }}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="mb-4 dark:bg-white dark:text-black"
        >
          + Add Member
        </Button>
      </DialogTrigger>

      {/* Fixed height changed to max-height + overflow-hidden */}
      <DialogContent className="w-[90%] max-w-md max-h-[600px] rounded-2xl p-0 shadow-xl flex flex-col overflow-hidden">
        {/* Header: shrink-0 keeps it from squishing */}
        <DialogHeader className="p-6 border-b shrink-0">
          <DialogTitle>Add New Member</DialogTitle>
          <DialogPrimitive.Close
            className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity outline-none"
            onClick={resetForm} // Also clear form if they just close the modal
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogHeader>

        {/* Body: Scrollable only when content exceeds max-height */}
        <div className="overflow-y-auto p-6 space-y-4">
          <div>
            <Label className="mb-1 block">Name</Label>
            <Input
              type="text"
              disabled={loading}
              placeholder="Enter name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={allowOnlyText}
            />
            {/* Placeholder for error messages to prevent layout jumping */}
            <div className="min-h-[20px]">
              {errors?.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Package</Label>
            <Select
              disabled={loading}
              onValueChange={(value) => setForm({ ...form, plan: value })}
              value={form.plan}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan, idx) => (
                  <SelectItem key={idx} value={plan.duration}>
                    {plan.name} ({plan.duration} Month
                    {plan.duration > 1 ? "s" : ""}) - ₹{plan.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="min-h-[20px]">
              {errors?.plan && (
                <p className="text-red-500 text-sm">{errors.plan}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Phone Number</Label>
            <PhoneNumberInput
              disabled={loading}
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
            />
            <div className="min-h-[20px]">
              {errors?.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Email</Label>
            <Input
              type="email"
              disabled={loading}
              placeholder="Enter email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {/* Placeholder for error messages to prevent layout jumping */}
            <div className="min-h-[20px]">
              {errors?.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Address</Label>
            <Input
              type="text"
              disabled={loading}
              placeholder="Enter address"
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            {/* Placeholder for error messages to prevent layout jumping */}
            <div className="min-h-[20px]">
              {errors?.address && (
                <p className="text-red-500 text-sm">{errors.address}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Amount</Label>
            <Input
              disabled={loading}
              type="number"
              placeholder="Enter amount"
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              onKeyDown={allowOnlyNumbers}
            />
            <div className="min-h-[20px]">
              {errors?.amount && (
                <p className="text-red-500 text-sm">{errors.amount}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Stays at bottom of content or bottom of modal */}
        <div className="p-6 border-t shrink-0 bg-white dark:bg-zinc-950 mt-auto">
          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? "Saving..." : "Save Member"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
