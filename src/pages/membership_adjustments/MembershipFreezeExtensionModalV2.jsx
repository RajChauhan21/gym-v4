import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import axios from "axios";
import {
  ArrowRight,
  Loader2,
  PauseCircle,
  CalendarPlus,
  Snowflake,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { saveMemberShipAdjustment } from "../../apis/backend_apis";
import { useProfile } from "../../contexts/ProfileContext";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const QUICK_DURATIONS = [7, 15, 30];

const FREEZE_REASONS = [
  { value: "medical", label: "Medical" },
  { value: "travel", label: "Travel" },
  { value: "financial", label: "Financial hardship" },
  { value: "other", label: "Other" },
];

const EXTEND_REASONS = [
  { value: "downtime", label: "Compensating for gym downtime" },
  { value: "loyalty", label: "Loyalty / goodwill gesture" },
  { value: "correction", label: "Billing correction" },
  { value: "other", label: "Other" },
];

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const formSchema = z
  .object({
    duration: z.string().min(1, "Select a duration"),
    customDays: z.coerce.number().int().positive().optional(),
    reason: z.string().min(1, "Select a reason"),
    note: z.string().max(300, "Keep it under 300 characters").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.duration === "custom" && !data.customDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customDays"],
        message: "Enter number of days",
      });
    }
  });

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * MembershipTimelinePreviewModal
 *
 * Freeze / extend flow built around a before-and-after date comparison, so
 * staff visually confirm the resulting expiry before committing.
 *
 * `member` matches the backend member payload directly — pass the object
 * you already get from your members API, e.g.:
 *   {
 *     id: 396,
 *     name: "VikasR",
 *     plan: "Silver",
 *     expiry: "2027-10-09",
 *     phone: "9000000052",
 *     email: "vikas52@gmail.com",
 *     dueAmount: 894,
 *     isActive: 1,
 *     ...
 *   }
 *
 * Usage:
 *   <MembershipTimelinePreviewModal
 *     open={open}
 *     onOpenChange={setOpen}
 *     member={member}
 *     defaultMode="extend"
 *     onSuccess={(updated) => refetchMember(updated)}
 *   />
 */
export default function MembershipFreezeExtensionModalV2({
  open,
  onOpenChange,
  member,
  defaultMode = "freeze",
  onSuccess,
}) {
  const [mode, setMode] = useState(defaultMode);
  const [loading, setLoading] = useState(false);
  const { profile } = useProfile();
  const [submitError, setSubmitError] = useState(null);

  const reasons = mode === "freeze" ? FREEZE_REASONS : EXTEND_REASONS;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: "15",
      customDays: undefined,
      reason: "",
      note: "",
    },
  });

  const duration = watch("duration");
  const customDays = watch("customDays");

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setSubmitError(null);
      reset({ duration: "15", customDays: undefined, reason: "", note: "" });
    }
  }, [open, defaultMode, reset]);

  useEffect(() => {
    setValue("reason", "");
    setSubmitError(null);
  }, [mode, setValue]);

  const days = useMemo(() => {
    if (duration === "custom") return Number(customDays) || 0;
    return Number(duration) || 0;
  }, [duration, customDays]);

  // Backend sends `expiry`, not `currentExpiryDate` — read from the real field.
  const currentExpiry = member?.expiry ? parseISO(member.expiry) : null;

  const newExpiry = useMemo(() => {
    if (!currentExpiry || !days) return null;
    return addDays(currentExpiry, days);
  }, [currentExpiry, days]);

  const onSubmit = async (values) => {
    setSubmitError(null);
    try {
      const payload = {
        durationDays: days,
        reason: values.reason,
        notes: values.note || undefined,
        ownerId: profile?.ownerId,
        memberId: member.id,
        newEndDate: newExpiry ? format(newExpiry, "yyyy-MM-dd") : undefined,
        oldEndDate: member.expiry,
        status: mode === "freeze" ? 2 : 3,
      };
      const response = await saveMemberShipAdjustment(payload);
      if (response.status === 202 || response.data.statusCodeValue === 200) {
        toast.success(
          `Membership ${mode === "freeze" ? "frozen" : "extended"} successfully!`,
        );
        onOpenChange(false);
      }
      if (response.status === 404) {
        if (response && response.message && response.message == "100") {
          toast.error(
            "You dont have any active subscription to use this feature",
          );
        } else if (response && response.message && response.message == "101") {
          toast.error("New end date cannot be before old end date");
        } else {
          toast.error("Something went wong. Please try again.");
        }
      }

      //   onSuccess?.(data);
    } catch (err) {
      if (err.response?.status === 404) {
        if (
          err.response &&
          err.response.data &&
          err.response.data.message == "100"
        ) {
          toast.error(
            "You dont have any active subscription to use this feature",
          );
        } else if (
          err.response &&
          err.response.data &&
          err.response.data.message == "101"
        ) {
          toast.error("New end date cannot be before old end date");
        } else {
          toast.error("Something went wong. Please try again.");
        }
      }
      //   setSubmitError(
      //     err?.response?.data?.message || "Couldn't save this change. Try again.",
      //   );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[92%] flex-col gap-0 overflow-hidden rounded-lg p-0 sm:w-full sm:max-w-[440px]">
        <DialogHeader className="shrink-0 space-y-1 border-b px-4 py-3 sm:px-5">
          <DialogTitle className="text-base">
            {mode === "freeze" ? "Freeze membership" : "Extend membership"}
          </DialogTitle>
          {member?.name && (
            <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <span className="min-w-0 truncate">{member.name}</span>
              {member?.plan && (
                <Badge variant="secondary" className="shrink-0 font-normal">
                  {member.plan}
                </Badge>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5 no-scrollbar">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("freeze")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                mode === "freeze"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-input text-muted-foreground hover:bg-muted",
              )}
            >
              <Snowflake className="h-4 w-4 shrink-0" />
              Freeze
            </button>
            <button
              type="button"
              onClick={() => setMode("extend")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                mode === "extend"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-input text-muted-foreground hover:bg-muted",
              )}
            >
              <CalendarPlus className="h-4 w-4 shrink-0" />
              Extend
            </button>
          </div>

          <form
            id="freeze-extend-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label>{mode === "freeze" ? "Freeze by" : "Extend by"}</Label>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {QUICK_DURATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => field.onChange(String(d))}
                        className={cn(
                          "rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                          field.value === String(d)
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-input text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {d} days
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => field.onChange("custom")}
                      className={cn(
                        "rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                        field.value === "custom"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-input text-muted-foreground hover:bg-muted",
                      )}
                    >
                      Custom
                    </button>
                  </div>
                )}
              />
              {errors.duration && (
                <p className="text-xs text-destructive">
                  {errors.duration.message}
                </p>
              )}
            </div>

            {duration === "custom" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="customDays">Number of days</Label>
                <Controller
                  name="customDays"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="customDays"
                      type="number"
                      min={1}
                      placeholder="e.g. 21"
                      {...field}
                    />
                  )}
                />
                {errors.customDays && (
                  <p className="text-xs text-destructive">
                    {errors.customDays.message}
                  </p>
                )}
              </div>
            )}

            <div className="rounded-md bg-muted px-3 py-3">
              <p className="mb-2 text-xm text-muted-foreground">
                New expiry date
              </p>
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1 text-center">
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="truncate text-xs font-medium text-muted-foreground line-through sm:text-sm">
                    {currentExpiry ? format(currentExpiry, "d MMM yyyy") : "—"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 text-center">
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p
                    className={cn(
                      "truncate text-xs font-semibold sm:text-sm",
                      newExpiry ? "text-emerald-600" : "text-muted-foreground",
                    )}
                  >
                    {newExpiry ? format(newExpiry, "d MMM yyyy") : "—"}
                  </p>
                </div>
              </div>
              {currentExpiry && newExpiry && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {differenceInCalendarDays(newExpiry, currentExpiry)} days{" "}
                  {mode === "freeze" ? "of frozen access" : "added"}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reason">Reason</Label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {reasons.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.reason && (
                <p className="text-xs text-destructive">
                  {errors.reason.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="note">Note (optional)</Label>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="note"
                    rows={2}
                    placeholder="Add context for other staff"
                    className="resize-none"
                    {...field}
                  />
                )}
              />
              {errors.note && (
                <p className="text-xs text-destructive">
                  {errors.note.message}
                </p>
              )}
            </div>

            {submitError && (
              <p className="text-xs text-destructive">{submitError}</p>
            )}
          </form>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 border-t px-4 py-3 sm:flex-row sm:justify-end sm:px-5 m-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="freeze-extend-form"
            disabled={isSubmitting || !newExpiry}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm {mode === "freeze" ? "freeze" : "extension"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
