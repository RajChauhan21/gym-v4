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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  deleteMembershipAdjustment,
  getMembershipAdjustmentData,
  saveMemberShipAdjustment,
} from "../../apis/backend_apis";
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
  const [adjustmentData, setAdjustmentData] = useState([]);
  const [loadingAdjustment, setLoadingAdjustment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentAdjustment = adjustmentData?.find(
    (adjustment) =>
      (mode === "freeze" && adjustment.status === 2) ||
      (mode === "extend" && adjustment.status === 3),
  );

  const isCurrentAdjustment = Boolean(currentAdjustment);

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

  useEffect(() => {
    if (!open || !member?.id) return;

    if (member.isActive === 2 || member.isActive === 3) {
      getMembershipAdjustment();
    }
  }, [open, member?.id, member?.isActive]);

  useEffect(() => {
    if (!open) return;

    if (isCurrentAdjustment && currentAdjustment) {
      setValue("duration", currentAdjustment.durationDays?.toString() || "15");

      setValue("reason", currentAdjustment.reason || "");
      setValue("note", currentAdjustment.notes || "");
    } else {
      setValue("duration", "15");
      setValue("customDays", undefined);
      setValue("reason", "");
      setValue("note", "");
    }
  }, [open, mode, isCurrentAdjustment, currentAdjustment, setValue]);

  // useEffect(() => {
  //   if (!open || !member?.id) return;

  //   const shouldFetchAdjustment =
  //     (mode === "freeze" && member.isActive === 2) ||
  //     (mode === "extend" && member.isActive === 3);

  //   if (shouldFetchAdjustment) {
  //     getMembershipAdjustment();
  //   } else {
  //     setAdjustmentData(null);
  //   }
  // }, [open, member?.id, member?.isActive, mode]);

  const days = useMemo(() => {
    if (duration === "custom") return Number(customDays) || 0;
    return Number(duration) || 0;
  }, [duration, customDays]);

  // Backend sends `expiry`, not `currentExpiryDate` — read from the real field.
  const currentExpiry = member?.expiry ? parseISO(member.expiry) : null;
  const memberStatus = member?.isActive;

  const newExpiry = useMemo(() => {
    if (!currentExpiry || !days) return null;

    const chooseExpiryDate =
      isCurrentAdjustment && currentAdjustment?.oldEndDate
        ? parseISO(currentAdjustment.oldEndDate)
        : currentExpiry;

    return addDays(chooseExpiryDate, days);
  }, [currentExpiry, days, isCurrentAdjustment, currentAdjustment]);

  const getMembershipAdjustment = async () => {
    setLoadingAdjustment(true);
    try {
      const response = await getMembershipAdjustmentData(member?.id);
      if (response.status === 202) {
        setAdjustmentData(response.data || []);
        // setValue("duration", response?.data?.durationDays.toString());
        // setValue("reason", response?.data?.reason);
        // setValue("note", response?.data?.notes);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingAdjustment(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setAdjustmentData([]);
  };

  const handleDelete = async () => {
    if (!currentAdjustment?.id) return;
    setIsDeleting(true);
    // onOpenChange(false);
    // setAdjustmentData(null);

    try {
      const response = await deleteMembershipAdjustment(currentAdjustment?.id);
      if (response.status == 202) {
        toast.success(
          `Membership ${mode === "freeze" ? "freeze" : "extension"} deleted successfully!`,
        );
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      handleClose();
      setIsDeleting(false);
    }
  };

  const onSubmit = async (values) => {
    setSubmitError(null);
    try {
      const payload = {
        id: isCurrentAdjustment ? currentAdjustment.id : null,
        durationDays: days,
        reason: values.reason,
        notes: values.note || undefined,
        ownerId: profile?.ownerId,
        memberId: member.id,
        newEndDate: newExpiry ? format(newExpiry, "yyyy-MM-dd") : undefined,
        oldEndDate:
          isCurrentAdjustment && currentAdjustment?.oldEndDate
            ? currentAdjustment.oldEndDate
            : member.expiry,
        status: mode === "freeze" ? 2 : 3,
        freezeStartDate:
          mode === "freeze" && freezeStartDate
            ? format(freezeStartDate, "yyyy-MM-dd")
            : undefined,

        freezeEndDate:
          mode === "freeze" && freezeEndDate
            ? format(freezeEndDate, "yyyy-MM-dd")
            : undefined,
      };
      const response = await saveMemberShipAdjustment(payload);
      if (response.status === 202 || response.data.statusCodeValue === 200) {
        if (isCurrentAdjustment) {
          toast.success(
            `Membership ${mode === "freeze" ? "freeze" : "extension"} updated successfully!`,
          );
        } else {
          toast.success(
            `Membership ${mode === "freeze" ? "frozen" : "extended"} successfully!`,
          );
        }
        handleClose();
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
  const canDeleteAdjustment = isCurrentAdjustment;

  const hasFreezeAdjustment = adjustmentData.some(
    (adjustment) => adjustment.status === 2,
  );

  const hasExtensionAdjustment = adjustmentData.some(
    (adjustment) => adjustment.status === 3,
  );

  const isUpdatingExtension = mode === "extend" && isCurrentAdjustment;

  const shouldRecalculateFreeze =
    mode === "extend" && isCurrentAdjustment && hasFreezeAdjustment;

  const freezeStartDate =
    isCurrentAdjustment && currentAdjustment?.freezeStartDate
      ? parseISO(currentAdjustment?.freezeStartDate)
      : new Date();

  const freezeEndDate = useMemo(() => {
    if (mode !== "freeze" || !freezeStartDate || !days) {
      return null;
    }

    return addDays(freezeStartDate, days);
  }, [mode, freezeStartDate, days]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[92%] flex-col gap-0 overflow-hidden rounded-lg p-0 sm:w-full sm:max-w-[440px]">
        <DialogHeader className="shrink-0 space-y-1 border-b px-4 py-3 sm:px-5">
          <DialogTitle className="text-base">
            {/* {mode === "freeze" ? "Freeze membership" : "Extend membership"} */}
            {memberStatus === 2
              ? "Update Freeze"
              : memberStatus === 3
                ? "Update Extension"
                : mode === "freeze"
                  ? "Freeze Membership"
                  : "Extend Membership"}
          </DialogTitle>
          {member?.name && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <span className="truncate">{member.name}</span>

                {member?.plan && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 bg-black font-normal text-white dark:bg-white dark:text-black"
                  >
                    {member.plan}
                  </Badge>
                )}
              </div>

              <Badge
                className={cn(
                  "shrink-0",
                  memberStatus === 1 &&
                    "bg-green-100 text-green-700 hover:bg-green-100",
                  memberStatus === 2 &&
                    "bg-blue-100 text-blue-700 hover:bg-blue-100",
                  memberStatus === 3 &&
                    "bg-orange-100 text-orange-700 hover:bg-orange-100",
                )}
              >
                {memberStatus === 1 && "Active"}
                {memberStatus === 2 && "Frozen"}
                {memberStatus === 3 && "Extended"}
              </Badge>
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
              disabled={hasFreezeAdjustment && !hasExtensionAdjustment}
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
            {isCurrentAdjustment && (
              <Alert
                className={
                  memberStatus === 2
                    ? "border-blue-200 bg-blue-50"
                    : "border-emerald-200 bg-emerald-50"
                }
              >
                <AlertDescription
                  className={
                    memberStatus === 2 ? "text-blue-800" : "text-emerald-800"
                  }
                >
                  This member already has an active{" "}
                  <strong>{memberStatus === 2 ? "freeze" : "extension"}</strong>
                  . The current membership expiry is{" "}
                  <strong>
                    {format(
                      parseISO(currentAdjustment.newEndDate),
                      "dd MMM yyyy",
                    )}
                  </strong>
                  . You're updating the{" "}
                  <strong>{memberStatus === 2 ? "freeze" : "extension"}</strong>{" "}
                  below, or you can remove it.
                </AlertDescription>
              </Alert>
            )}

            {shouldRecalculateFreeze && (
              <Alert>
                <AlertDescription className="ml-1">
                  <div className="space-y-1">
                    <p className="font-medium text-blue-400 dark:text-blue-400">
                      Your freeze will be adjusted
                    </p>

                    <p className="text-xm leading-relaxed text-black dark:text-white">
                      You're updating the membership extension. The existing
                      freeze will automatically be recalculated using the new
                      expiry date.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
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

            {mode === "freeze" && (
              <div className="rounded-md bg-muted px-3 py-3">
                <p className="mb-2 text-sm text-muted-foreground">
                  Freeze period
                </p>

                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1 text-center">
                    <p className="text-xs text-muted-foreground">
                      Freeze starts
                    </p>

                    <p className="truncate text-xs font-medium sm:text-sm">
                      {freezeStartDate
                        ? format(freezeStartDate, "d MMM yyyy")
                        : "—"}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

                  <div className="min-w-0 flex-1 text-center">
                    <p className="text-xs text-muted-foreground">Freeze ends</p>

                    <p
                      className={cn(
                        "truncate text-xs font-semibold sm:text-sm",
                        freezeEndDate
                          ? "text-amber-600"
                          : "text-muted-foreground",
                      )}
                    >
                      {freezeEndDate
                        ? format(freezeEndDate, "d MMM yyyy")
                        : "—"}
                    </p>
                  </div>
                </div>

                {freezeEndDate && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    {/* {days} days of frozen access, <br /> */}
                    Your membership will remain frozen during this period.
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
                  <p className="text-xs text-muted-foreground">
                    {isCurrentAdjustment ? "Original Date" : "Current Date"}
                  </p>
                  <p className="truncate text-xs font-medium text-muted-foreground line-through sm:text-sm">
                    {isCurrentAdjustment
                      ? format(currentAdjustment.oldEndDate, "d MMM yyyy")
                      : currentExpiry
                        ? format(currentExpiry, "d MMM yyyy")
                        : "—"}
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
              {(isCurrentAdjustment || currentExpiry) && newExpiry && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  <span className="font-bold">
                    {differenceInCalendarDays(
                      newExpiry,
                      isCurrentAdjustment && currentAdjustment?.oldEndDate
                        ? parseISO(currentAdjustment.oldEndDate)
                        : currentExpiry,
                    )}{" "}
                    days
                  </span>{" "}
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

        <DialogFooter className="m-1 border-t px-4 py-3 sm:px-5">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Delete - left on desktop */}
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting || !canDeleteAdjustment}
              className="w-full sm:w-auto"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete {mode === "freeze" ? "freeze" : "extension"}
            </Button>

            {/* Cancel + Confirm - right on desktop */}
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose()}
                disabled={isSubmitting || isDeleting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                form="freeze-extend-form"
                disabled={isSubmitting || !newExpiry || isDeleting}
                className="w-full sm:w-auto"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm {mode === "freeze" ? "freeze" : "extension"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
