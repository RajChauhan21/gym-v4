import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Loader2, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, addMonths } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function RenewMembershipDialog({
  open,
  setOpen,
  member,
  onRenew,
  plans = [],
  loading,
}) {
  const [form, setForm] = useState({
    name: "",
    plan: "",
    dueAmount: 0,
    joinedDate: "",
    expiryDate: "",
    startDate: "",
    totalPayable: 0,
  });

  // const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStartDateCalendarOpen, setIsStartDateCalendarOpen] = useState(false);

  const selectedPlan = plans.find((p) => p.name === form.plan);
  // const totalPayable = (form.dueAmount || 0) + (selectedPlan?.price || 0);

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || "",
        plan: member.plan || "",
        dueAmount: member.dueAmount || 0,
        joinedDate: member.joined || "",
        expiryDate: member.expiry || "",
        startDate: member.startDate || "",
        totalPayable: (member.dueAmount || 0) + (selectedPlan?.price || 0),
      });
      console.log("Renewing member:", member);
      console.log("Renewing form member:", form);
    }
  }, [member]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      dueAmount: form.totalPayable,
    };
    onRenew?.(payload);
    setOpen(false);
  };

  const initialFormState = {
    name: "",
    plan: "",
    dueAmount: "",
    expiryDate: null,
    joiningDate: null,
    startDate: null,
  };

  const errorCount = Object.keys(errors || {}).length;
  const resetForm = () => {
    setForm(initialFormState);
    setErrors({});
  };

  // useEffect(() => {
  //   if (form.startDate && form.plan) {
  //     const selectedPlan = plans.find((p) => p.name === form.plan);

  //     if (selectedPlan) {
  //       const startDate = new Date(form.startDate);
  //       const expiryDate = addMonths(startDate, selectedPlan.validity);
  //       const planPrice = selectedPlan.price || 0;

  //       // setForm((prev) => ({
  //       //   const totalPayable = (prev.dueAmount || 0) + planPrice;
  //       //   ...prev,
  //       //   expiryDate: format(expiryDate, "yyyy-MM-dd"),
  //       // }));

  //       setForm((prev) => {
  //         const totalPayable = (prev.dueAmount || 0) + planPrice;
  //         console.log(prev.dueAmount);
  //         console.log(planPrice);
  //         // ⚠️ GUARD: Only update state if values actually changed to prevent infinite loops
  //         if (
  //           prev.expiryDate === format(expiryDate, "yyyy-MM-dd") &&
  //           prev.dueAmount === totalPayable
  //         ) {
  //           return prev;
  //         }

  //         return {
  //           ...prev,
  //           expiryDate: format(expiryDate, "yyyy-MM-dd"),
  //           totalPayable: totalPayable, // Sets the total inside dueAmount
  //         };
  //       });
  //     }
  //   }
  // }, [form.startDate, form.plan, plans]);

  // useEffect(() => {
  //   if (form.startDate && form.plan) {
  //     const selectedPlan = plans.find((p) => p.name === form.plan);

  //     if (selectedPlan) {
  //       const startDate = new Date(form.startDate);
  //       const expiryDate = format(
  //         addMonths(startDate, selectedPlan.validity),
  //         "yyyy-MM-dd",
  //       );

  //       setForm((prev) => {
  //         if (prev.expiryDate === expiryDate) return prev;
  //         return { ...prev, expiryDate };
  //       });
  //     }
  //   }
  // }, [form.startDate, form.plan, plans]);

  useEffect(() => {
    // ✅ Run if a plan is selected (even if startDate is not set yet)
    if (form.plan) {
      const selectedPlan = plans.find((p) => p.name === form.plan);

      if (selectedPlan) {
        const planPrice = selectedPlan.price || 0;

        // Calculate expiry date only if startDate is filled
        let formattedExpiry = form.expiryDate;
        if (form.startDate) {
          const startDate = new Date(form.startDate);
          formattedExpiry = format(
            addMonths(startDate, selectedPlan.validity),
            "yyyy-MM-dd",
          );
        }

        setForm((prev) => {
          const totalPayable = (prev.dueAmount || 0) + planPrice;

          // ✅ FIX: Compare totalPayable against prev.totalPayable to prevent loops
          if (
            prev.expiryDate === formattedExpiry &&
            prev.totalPayable === totalPayable
          ) {
            return prev; // Stop here if nothing changed
          }

          return {
            ...prev,
            expiryDate: formattedExpiry,
            totalPayable: totalPayable, // Updates instantly when plan dropdown changes
          };
        });
      }
    }
  }, [form.startDate, form.plan, plans]); // Watches both plan dropdown and start date

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-[90%] max-w-md max-h-[600px] rounded-2xl p-0 shadow-xl flex flex-col overflow-hidden no-scrollbar"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* HEADER */}
        <DialogHeader className="p-6 border-b shrink-0">
          <DialogTitle>Renew Membership</DialogTitle>

          <DialogPrimitive.Close
          disabled={loading}
            className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity"
            onClick={resetForm}
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogHeader>

        {/* ERROR BLOCK (same pattern as yours) */}
        {errorCount > 0 && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">
              Please fix {errorCount} field{errorCount > 1 ? "s" : ""}:
            </p>

            <ul className="ml-5 list-disc text-sm text-red-600 dark:text-red-300">
              {Object.keys(errors).map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        )}

        {/* BODY */}
        <div className="overflow-y-auto p-6 space-y-6 no-scrollbar">
          {/* NAME (read-only like your expiry style) */}
          <div className="space-y-2">
            <Label className="mb-1 block">Name</Label>
            <Input value={form.name} disabled className="bg-muted" />
          </div>

          {/* PLAN */}
          <div className="space-y-1 m-0">
            <Label className="mb-1 block">Package</Label>
            <Select
              disabled={loading}
              value={form.plan}
              onValueChange={(value) => setForm({ ...form, plan: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>

              <SelectContent>
                {plans.map((plan, idx) => (
                  <SelectItem key={plan.id} value={String(plan.name)}>
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

          {/* PAYMENT BREAKDOWN */}
          {form.plan && (
            <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Payment Breakdown
              </p>

              {/* OLD DUE */}
              <div className="flex justify-between text-sm">
                <span>Previous Due</span>
                <span className="font-medium text-red-500">
                  ₹{member?.dueAmount || 0}
                </span>
              </div>

              {/* PLAN PRICE */}
              <div className="flex justify-between text-sm">
                <span>Selected Plan ({form.plan})</span>
                <span className="font-medium text-blue-500">
                  ₹{selectedPlan?.price || 0}
                </span>
              </div>

              {/* TOTAL */}
              <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                <span>Total Payable</span>
                <span className="text-green-600">
                  ₹{(member?.dueAmount || 0) + (selectedPlan?.price || 0)}
                </span>
              </div>
            </div>
          )}

          {/* JOINED DATE */}
          <div className="space-y-1">
            <Label className="mb-1 block">Date of Joining</Label>
            {/* <Input value={form.joinedDate} disabled className="bg-muted" /> */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal px-3", // Added padding
                    !form.joinedDate && "text-muted-foreground",
                  )}
                  disabled
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />{" "}
                  {/* shrink-0 prevents icon squashing */}
                  <span className="truncate">
                    {" "}
                    {/* truncate prevents text going out of the field */}
                    {form.joinedDate
                      ? format(parseISO(form.joinedDate), "PPP")
                      : "Pick a date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    form.joinedDate ? parseISO(form.joinedDate) : undefined
                  }
                  defaultMonth={
                    form.joinedDate ? parseISO(form.joinedDate) : new Date()
                  }
                  onSelect={(date) => {
                    setForm({
                      ...form,
                      joinedDate: date ? format(date, "yyyy-MM-dd") : "",
                    });
                    setIsCalendarOpen(false); // This closes the popover automatically
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* START DATE */}
          <div className="space-y-1">
            <Label className="mb-1 block">New Start Date</Label>
            {/* <Input value={form.joinedDate} disabled className="bg-muted" /> */}
            <Popover
              open={isStartDateCalendarOpen}
              onOpenChange={setIsStartDateCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
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
                    setForm({
                      ...form,
                      startDate: date ? format(date, "yyyy-MM-dd") : "",
                    });
                    setIsStartDateCalendarOpen(false); // This closes the popover automatically
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* EXPIRY DATE (EDITABLE OR AUTO-CALCULATED) */}
          <div className="space-y-1">
            <Label className="mb-1 block">New Expiry Date</Label>
            <Input
              type="text"
              readOnly
              disabled={loading}
              placeholder="Auto-calculated"
              value={
                form.expiryDate ? format(parseISO(form.expiryDate), "PPP") : ""
              }
              className="bg-muted cursor-not-allowed"
            />
          </div>
          <div className="space-y-1">
            <Label className="mb-1 block">Previous Due</Label>
            <Input value={form.dueAmount} disabled className="bg-muted" />
          </div>

          <div className="space-y-1">
            <Label className="mb-1 block">Plan Price</Label>
            <Input value={selectedPlan?.price} disabled className="bg-muted" />
          </div>

          <div className="space-y-1">
            <Label className="mb-1 block">Total Payable</Label>
            <Input
              value={form.totalPayable || 0}
              disabled
              className="bg-green-50 font-bold text-green-700"
            />
          </div>
        </div>

        {/* FOOTER (same structure as yours) */}
        <div className="p-6 border-t shrink-0 bg-white dark:bg-zinc-950 mt-auto">
          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Renewing...
              </>
            ) : (
              "Renew Membership"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
