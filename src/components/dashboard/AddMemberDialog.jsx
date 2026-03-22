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
    duration: "1", // months
  });

  const handleSubmit = () => {
    setLoading(true);
    const expiry = calculateExpiry(form.duration);

    const newMember = {
      ...form,
      expiry,
      due: Number(form.amount),
    };

    console.log("Smart Member:", newMember);
    // setOpen(false) // ✅ CLOSE MODAL

    setTimeout(() => {
      setLoading(false);
      toast.success("Member added successfully.");
      setOpen(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              onKeyDown= {allowOnlyText}
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
                  <SelectItem key={idx} value={plan.name}>
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
  );
}
