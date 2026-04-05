import { useState, useEffect, memo } from "react";
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
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGymStore } from "../../store/gymStore";
import { toast } from "sonner";
import { PhoneNumberInput } from "@/components/ui/phone-input";
import { allowOnlyText, allowOnlyNumbers } from "../../lib/inputValidator";
import { addMember } from "../../apis/backend_apis";
import { email } from "zod";
import { useProfile } from "../../contexts/ProfileContext";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addMonths, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AddMemberDialog({
  open,
  setOpen,
  editingMember,
  setEditingMember,
}) {
  const plans = useGymStore((state) => state.plans);
  const [errors, setErrors] = useState({});
  // const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // const { toast } = useToast()
  const { profile } = useProfile();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    countryCode: "+91",
    plan: "",
    amount: "",
    address: "",
    email: "",
    joiningDate: null,
    expiryDate: null,
  });

  const fetchMembers = useGymStore((state) => state.fetchMembers);

  useEffect(() => {
    if (form.joiningDate && form.plan) {
      // Find the selected plan object to get its validity months
      const selectedPlan = plans.find((p) => p.name === form.plan);

      if (selectedPlan) {
        const startDate = new Date(form.joiningDate);
        const expiryDate = addMonths(startDate, selectedPlan.validity);

        // Format to yyyy-MM-dd for Java LocalDate compatibility
        setForm((prev) => ({
          ...prev,
          expiryDate: format(expiryDate, "yyyy-MM-dd"),
        }));
      }
    }
  }, [form.joiningDate, form.plan, plans]);

  useEffect(() => {
    if (editingMember) {
      setForm({
        name: editingMember.name,
        plan: editingMember.plan,
        phone: editingMember.phone,
        email: editingMember.email || "craj4757@gmail.com",
        address: editingMember.address || "12",
        amount: editingMember.due || 0,
        joiningDate: editingMember.joined || null,
        expiryDate: editingMember.expiry || null,
      });
      console.log("Editing member:", editingMember);
      console.log("Editing form member:", form);
    } else {
      resetForm(); // Clear if adding new
    }
  }, [editingMember]);

  const calculateExpiry = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() + Number(months));
    return date.toISOString().split("T")[0];
  };

  const initialFormState = {
    name: "",
    phone: "",
    countryCode: "+91",
    plan: "",
    amount: "",
    address: "",
    email: "",
    expiryDate: null,
    joiningDate: null,
  };

  const handleClose = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingMember(null); // Crucial: Reset to "Add Mode"
      resetForm();
    }
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

    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(form.phone.replace(/[\s()-]/g, ""))) {
      // We strip spaces, dashes, and brackets before testing the regex
      newErrors.phone = "Enter a valid international phone number";
    }

    // Strict Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!form.email.trim()) {
      newErrors.email = "Email required";
    } else if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.joiningDate) {
      newErrors.joiningDate = "Joining date required";
    }

    if (!form.expiryDate) {
      newErrors.expiryDate = "Expiry date required";
    }

    if (!form.plan == null) {
      newErrors.plan = "Plan required";
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setLoading(false);
      return;
    }
    const selectedPlan = plans.find((p) => p.name === form.plan);
    const duration = selectedPlan ? selectedPlan.validity : 0;
    try {
      const member = {
        packageId: selectedPlan?.id ?? null, // Defaults to empty string if null
        memberId: editingMember?.id ?? null, // Keep null if the DB needs it for updates
        ownerId: profile.ownerId,
        name: form.name || "",
        email: form.email || "",
        phone: form.phone || "",
        address: form.address || "",
        joined: form.joiningDate || null,
        expiry: form.expiryDate || null,
      };
      const response = await addMember(member);
      console.log(member);
      console.log("add memeber,", response);
      if (response.status === 202) {
        toast.success(
          editingMember
            ? "Member updated successfully."
            : "Member added successfully.",
        );
        fetchMembers(profile.ownerId);
      } else if (response.status === 404) {
        toast.error(
          response.data.message ||
            "Plan not found. Please select a valid plan.",
        );
      }
    } catch (error) {
      toast.error(error ? error : "Error saving member. Please try again.");
    } finally {
      resetForm();
      setOpen(false);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
          <DialogTitle>
            {" "}
            {editingMember ? "Update Member" : "Add New Member"}
          </DialogTitle>
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
              value={form.name}
              onKeyDown={allowOnlyText}
            />
            {/* Placeholder for error messages to prevent layout jumping */}
            <div className="min-h-[20px]">
              {errors?.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Date of Joining</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal px-3", // Added padding
                    !form.joiningDate && "text-muted-foreground",
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />{" "}
                  {/* shrink-0 prevents icon squashing */}
                  <span className="truncate">
                    {" "}
                    {/* truncate prevents text going out of the field */}
                    {form.joiningDate
                      ? format(parseISO(form.joiningDate), "PPP")
                      : "Pick a date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    form.joiningDate ? parseISO(form.joiningDate) : undefined
                  }
                  onSelect={(date) => {
                    setForm({
                      ...form,
                      joiningDate: date ? format(date, "yyyy-MM-dd") : "",
                    });
                    setIsCalendarOpen(false); // This closes the popover automatically
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="min-h-[20px]">
              {errors?.joiningDate && (
                <p className="text-red-500 text-sm">{errors.joiningDate}</p>
              )}
            </div>
          </div>

          {/* Expiry Date (Read Only / Auto-populated) */}
          <div className="space-y-1">
            <Label>Date of Expiry</Label>
            <div className="relative">
              <Input
                type="text"
                readOnly
                disabled={loading}
                placeholder="Auto-calculated"
                value={
                  form.expiryDate
                    ? format(parseISO(form.expiryDate), "PPP")
                    : ""
                }
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <div className="min-h-[20px]">
              {errors?.expiryDate && (
                <p className="text-red-500 text-sm">{errors.expiryDate}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Package</Label>
            <Select
              disabled={loading}
              onValueChange={(value) => setForm({ ...form, plan: value })}
              value={form.plan ? String(form.plan).trim() : ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan, idx) => (
                  <SelectItem key={idx} value={String(plan.name).trim()}>
                    {/* {plan.name} ({plan.duration} Month
                    {plan.duration > 1 ? "s" : ""}) - ₹{plan.price} */}
                    {plan.name}
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
              value={form.email}
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
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            {/* Placeholder for error messages to prevent layout jumping */}
            <div className="min-h-[20px]">
              {errors?.address && (
                <p className="text-red-500 text-sm">{errors.address}</p>
              )}
            </div>
          </div>

          {/* <div>
            <Label className="mb-1 block">Amount</Label>
            <Input
              disabled={loading}
              type="number"
              placeholder="Enter amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              onKeyDown={allowOnlyNumbers}
            />
            <div className="min-h-[20px]">
              {errors?.amount && (
                <p className="text-red-500 text-sm">{errors.amount}</p>
              )}
            </div>
          </div> */}
        </div>

        {/* Footer: Stays at bottom of content or bottom of modal */}
        <div className="p-6 border-t shrink-0 bg-white dark:bg-zinc-950 mt-auto">
          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingMember ? "Updating..." : "Saving..."}
              </>
            ) : editingMember ? (
              "Update Member"
            ) : (
              "Save Member"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
