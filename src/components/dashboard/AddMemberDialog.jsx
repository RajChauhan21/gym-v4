import { useState, useEffect, memo, useRef } from "react";
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
import { addMember, getActiveMembers } from "../../apis/backend_apis";
import { email } from "zod";
import { useProfile } from "../../contexts/ProfileContext";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addMonths, parseISO, isSameDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AddMemberDialog({
  open,
  setOpen,
  editingMember,
  setEditingMember,
  fetchActiveMemberCount,
  fetchAllMemberCount,
  fetchAllMembers,
}) {
  const plans = useGymStore((state) => state.plans);
  const sources = useGymStore((state) => state.sources);
  const fetchSources = useGymStore((state) => state.fetchSources);
  const [errors, setErrors] = useState({});
  // const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStartDateCalendarOpen, setIsStartDateCalendarOpen] = useState(false);
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
    source: "",
    joiningDate: null,
    expiryDate: null,
    startDate: null,
  });

  const fieldRefs = {
    name: useRef(null),
    joiningDate: useRef(null),
    startDate: useRef(null),
    plan: useRef(null),
    phone: useRef(null),
    email: useRef(null),
    address: useRef(null),
    source: useRef(null),
  };

  const focusFirstError = (validationErrors) => {
    const firstErrorField = Object.keys(validationErrors)[0];

    const element = fieldRefs[firstErrorField]?.current;

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // Only works for actual input/button refs, not wrapper divs
    if (typeof element.focus === "function") {
      element.focus();
    }
  };

  const fetchMembers = useGymStore((state) => state.fetchMembers);

  // useEffect(() => {
  //   if (form.startDate && form.plan) {
  //     // Find the selected plan object to get its validity months
  //     const selectedPlan = plans.find((p) => p.name === form.plan);

  //     if (selectedPlan) {
  //       const startDate = new Date(form.startDate);
  //       const expiryDate = addMonths(startDate, selectedPlan.validity);

  //       // Format to yyyy-MM-dd for Java LocalDate compatibility
  //       setForm((prev) => ({
  //         ...prev,
  //         expiryDate: format(expiryDate, "yyyy-MM-dd"),
  //       }));
  //     }
  //   }
  // }, [form.startDate, form.plan, plans]);

  useEffect(() => {
    if (form.startDate && form.plan) {
      const selectedPlan = plans.find((p) => p.name === form.plan);

      if (selectedPlan) {
        const startDate = new Date(form.startDate);
        const expiryDate = addMonths(startDate, selectedPlan.validity);

        const value = format(expiryDate, "yyyy-MM-dd");

        setForm((prev) => ({
          ...prev,
          expiryDate: value,
        }));

        handleFieldValidation("expiryDate", value);
      }
    } else {
      setForm((prev) => ({
        ...prev,
        expiryDate: "",
      }));

      handleFieldValidation("expiryDate", "");
    }
  }, [form.startDate, form.plan, plans]);

  useEffect(() => {
    if (editingMember) {
      const matchedSource = sources?.find(
        (s) => s.name.toLowerCase() === editingMember.source?.toLowerCase(),
      );
      setForm({
        name: editingMember.name,
        plan: editingMember.plan,
        phone: editingMember.phone,
        email: editingMember.email || "abc4757@gmail.com",
        address: editingMember.address || "12",
        amount: editingMember.due || 0,
        source: matchedSource ? matchedSource.id : null,
        joiningDate: editingMember.joined || null,
        expiryDate: editingMember.expiry || null,
        startDate: editingMember.startDate || null,
      });
      console.log("Editing member:", editingMember);
      console.log("Editing form member:", form);
    } else {
      resetForm(); // Clear if adding new
    }
  }, [editingMember]);

  const initialFormState = {
    name: "",
    phone: "",
    countryCode: "+91",
    plan: "",
    amount: "",
    address: "",
    email: "",
    source: "",
    expiryDate: null,
    joiningDate: null,
    startDate: null,
  };

  const handleClose = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingMember(null); // Crucial: Reset to "Add Mode"
      resetForm();
    }
  };

  const handleFieldValidation = (field, value) => {
    const error = validateField(field, value);

    setErrors((prev) => {
      const updated = { ...prev };

      if (error) {
        updated[field] = error;
      } else {
        delete updated[field];
      }

      return updated;
    });
  };

  const validateField = (name, value) => {
    const textRegex = /^[a-zA-Z\s'.-]+$/;
    const addressRegex = /^[a-zA-Z0-9\s,.'#/-]+$/;
    const phoneRegex = /^(?:\+91|91|0)?\s*[6-9]\d{9}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    switch (name) {
      case "name":
        if (!value.trim()) return "Member name required";
        if (!textRegex.test(value))
          return "Member name should only contain letters";
        if (value.trim().length > 15) return "Maximum 15 letters allowed";
        return "";

      case "address":
        if (!value.trim()) return "Address required";
        if (!addressRegex.test(value))
          return "Invalid characters found in address";
        return "";

      case "phone":
        if (!value) return "Phone number is required";
        if (!phoneRegex.test(value.replace(/[\s()-]/g, "")))
          return "Enter a valid 10 digit Indian phone number";
        return "";

      case "email":
        if (!value.trim()) return "Email required";
        if (!emailRegex.test(value)) return "Invalid email format";
        return "";

      case "joiningDate":
        if (!value) return "Joining date required";
        return "";

      case "startDate":
        if (!value) return "Start date required";
        return "";

      case "plan":
        if (!value) return "Plan required";
        return "";

      // case "expiryDate":
      //   if (!value) return "Expiry date required";
      //   return "";

      default:
        return "";
    }
  };
  useEffect(() => {
    fetchSources(profile?.ownerId);
  }, []);

  const validate = () => {
    const errors = {};

    Object.keys(form).forEach((field) => {
      const error = validateField(field, form[field]);

      if (error) {
        errors[field] = error;
      }
    });

    return errors;
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (profile.planName === "No Active Plan") {
      // 1. Show the error toast
      toast.error(
        "You need an active plan to add members. Please subscribe to a plan first.",
      );
      setLoading(false);
      return;
    }
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      focusFirstError(validation);
      setLoading(false);
      return;
    }
    const selectedPlan = plans.find((p) => p.name === form.plan);
    const duration = selectedPlan ? selectedPlan.validity : 0;
    try {
      const member = {
        memberShipId: selectedPlan?.id ?? null, // Defaults to empty string if null
        memberId: editingMember?.id ?? null, // Keep null if the DB needs it for updates
        ownerId: profile.ownerId,
        name: form.name || "",
        email: form.email || "",
        phone: form.phone || "",
        address: form.address || "",
        sourceId: form.source || null,
        joined: form.joiningDate || null,
        expiry: form.expiryDate || null,
        startDate: form.startDate || null,
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
        await fetchMembers(profile.ownerId);
      } else if (response.status === 404) {
        if (
          response.data &&
          response.data.message &&
          response.data.message == "100"
        ) {
          toast.error(
            "You need an active plan to add members. Please subscribe to a plan first.",
          );
          // Member already exists with the name
        } else if (
          response.data &&
          response.data.message &&
          response.data.message == "limit"
        ) {
          toast.error(
            "Member limit reached. Upgrade your plan or manage existing members to add new members.",
          );

          // Member already exists with the name
        } else if (
          response.data &&
          response.data.message &&
          response.data.message == "112"
        ) {
          toast.error("Member already exists with the name");
          // Member already exists with the name
        }
      } else if (response.status === 429) {
        toast.error(
          "You are performing actions too quickly. Please wait a few seconds and try again.",
        );
      }
    } catch (error) {
      toast.error("Error saving member. Please try again.");
    } finally {
      resetForm();
      setOpen(false);
      setLoading(false);
      editingMember ? setEditingMember(null) : null; // Clear editing state after update
      fetchActiveMemberCount();
      fetchAllMemberCount();
      fetchAllMembers();
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setErrors({});
  };

  const errorCount = Object.keys(errors || {}).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* <DialogTrigger asChild> */}
      <Button
        onClick={() => {
          if (profile.planName === "No Active Plan") {
            // 1. Show the error toast
            toast.error(
              "You need an active plan to add members. Please subscribe to a plan first.",
            );
          } else {
            // 2. Open the modal if they have a plan
            setOpen(true);
          }
        }}
        className="mb-4 dark:bg-white dark:text-black"
      >
        + Add Member
      </Button>

      {/* Fixed height changed to max-height + overflow-hidden */}
      <DialogContent
        className="w-[90%] max-w-md max-h-[600px] rounded-2xl p-0 shadow-xl flex flex-col overflow-hidden no-scrollbar"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header: shrink-0 keeps it from squishing */}
        <DialogHeader className="p-6 border-b shrink-0">
          <DialogTitle>
            {" "}
            {editingMember ? "Update Member" : "Add New Member"}
          </DialogTitle>
          <DialogPrimitive.Close
            disabled={loading}
            className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity outline-none"
            onClick={resetForm} // Also clear form if they just close the modal
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogHeader>

        {/* {errorCount > 0 && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">
              Please fill/fix {errorCount} field{errorCount > 1 ? "s" : ""}{" "}
              before continuing:
            </p>

            <ul className="ml-5 list-disc text-sm text-red-600 dark:text-red-300">
              {Object.keys(errors).map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        )} */}

        {/* Body: Scrollable only when content exceeds max-height */}
        <div className="overflow-y-auto p-6 space-y-4 no-scrollbar">
          <div>
            <Label className="mb-1 block">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              ref={fieldRefs.name}
              type="text"
              disabled={loading}
              placeholder="Enter name"
              onChange={(e) => {
                const value = e.target.value;

                setForm((prev) => ({
                  ...prev,
                  name: value,
                }));

                handleFieldValidation("name", value);
              }}
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
            <Label>
              Date of Joining <span className="text-red-500">*</span>
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  ref={fieldRefs.joiningDate}
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal px-3", // Added padding
                    !form.joiningDate && "text-muted-foreground",
                  )}
                  disabled={loading || editingMember} // Disable if editing to prevent date changes
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
                  defaultMonth={
                    form.joiningDate ? parseISO(form.joiningDate) : new Date()
                  }
                  onSelect={(date) => {
                    const value = date ? format(date, "yyyy-MM-dd") : "";
                    setForm((prev) => ({
                      ...prev,
                      joiningDate: value,
                    }));
                    handleFieldValidation("joiningDate", value);
                    setIsCalendarOpen(false);
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

          {/* Membership start date */}
          <div className="space-y-1">
            <Label>
              Membership Start Date <span className="text-red-500">*</span>
            </Label>
            <Popover
              open={isStartDateCalendarOpen}
              onOpenChange={setIsStartDateCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  ref={fieldRefs.startDate}
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal px-3", // Added padding
                    !form.startDate && "text-muted-foreground",
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />{" "}
                  {/* shrink-0 prevents icon squashing */}
                  <span className="truncate">
                    {" "}
                    {/* truncate prevents text going out of the field */}
                    {form.startDate
                      ? format(parseISO(form.startDate), "PPP")
                      : "Pick a date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    form.startDate ? parseISO(form.startDate) : undefined
                  }
                  defaultMonth={
                    form.startDate ? parseISO(form.startDate) : new Date()
                  }
                  onSelect={(date) => {
                    const value = date ? format(date, "yyyy-MM-dd") : "";

                    setForm((prev) => ({
                      ...prev,
                      startDate: value,
                    }));

                    handleFieldValidation("startDate", value);

                    setIsStartDateCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="min-h-[20px]">
              {errors?.startDate && (
                <p className="text-red-500 text-sm">{errors.startDate}</p>
              )}
            </div>
          </div>

          {/* Pacakge */}
          <div>
            <Label className="mb-1 block">
              Package <span className="text-red-500">*</span>
            </Label>
            <Select
              disabled={loading}
              onValueChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  plan: value,
                }));

                handleFieldValidation("plan", value);
              }}
              value={form.plan ? String(form.plan).trim() : ""}
            >
              <SelectTrigger className="w-full" ref={fieldRefs.plan}>
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

          {/* Expiry Date (Read Only / Auto-populated) */}
          <div className="space-y-1">
            <Label>
              Membership End Date <span className="text-red-500">*</span>
            </Label>
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

          <div ref={fieldRefs.phone}>
            <Label className="mb-1 block">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <PhoneNumberInput
              // ref={fieldRefs.phone}
              disabled={loading}
              value={form.phone}
              onChange={(value) => {
                setForm((prev) => ({
                  ...prev,
                  phone: value,
                }));

                handleFieldValidation("phone", value);
              }}
            />
            <div className="min-h-[20px]">
              {errors?.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              ref={fieldRefs.email}
              type="email"
              disabled={loading}
              placeholder="Enter email"
              value={form.email}
              onChange={(e) => {
                const value = e.target.value;

                setForm((prev) => ({
                  ...prev,
                  email: value,
                }));

                handleFieldValidation("email", value);
              }}
            />
            {/* Placeholder for error messages to prevent layout jumping */}
            <div className="min-h-[20px]">
              {errors?.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">
              Address<span className="text-red-500">*</span>
            </Label>
            <Input
              ref={fieldRefs.address}
              type="text"
              disabled={loading}
              placeholder="Enter address"
              value={form.address}
              onChange={(e) => {
                const value = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  address: value,
                }));
                handleFieldValidation("address", value);
              }}
            />
            {/* Placeholder for error messages to prevent layout jumping */}
            <div className="min-h-[20px]">
              {errors?.address && (
                <p className="text-red-500 text-sm">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Source */}

          <div>
            <Label className="mb-1 block">Source</Label>
            <Select
              disabled={loading}
              // 1. Convert the selected string ID back to a Number for your form state
              onValueChange={(value) =>
                setForm({ ...form, source: Number(value) })
              }
              // 2. Safely cast the number ID to a string so Shadcn can match and display the active label
              value={form.source ? String(form.source) : ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((s) => (
                  // 3. Converted s.id to String and swapped array index with unique s.id for the key
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="min-h-[20px]">
              {errors?.source && (
                <p className="text-red-500 text-sm">{errors.source}</p>
              )}
            </div>
          </div>
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
