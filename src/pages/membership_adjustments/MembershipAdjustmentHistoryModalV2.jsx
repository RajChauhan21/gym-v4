import {
  CalendarDays,
  Clock3,
  Snowflake,
  CalendarPlus,
  History,
  ArrowRight,
  CircleCheck,
  CircleAlert,
  FileText,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getMembershipAdjustment } from "../../apis/backend_apis";
import { useState, useEffect } from "react";

export default function MembershipAdjustmentHistoryModalV2({
  open,
  onOpenChange,
  member,
}) {
  const [adjustmentData, setAdjustmentData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMembershipData = async () => {
      // Check the enabled conditions: open must be true and member.id must exist
      if (!open || !member?.id) return;

      setIsLoading(true);
      //   setIsError(false);

      try {
        const response = await getMembershipAdjustment(member.id);
        if (response.status == 202 || response.status == 200) {
          setAdjustmentData(response.data);
        }
      } catch (error) {
        console.error("Error fetching membership data:", error);
        toast.error("Failed to fetch membership history.");
        // setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembershipData();
  }, [open, member?.id]); // Re-runs whenever open or member.id changes

  const history = adjustmentData.filter(
    (adjustment) => adjustment.isCurrent === 0,
  );

  const currentAdjustments = adjustmentData.filter(
    (adjustment) => adjustment.isCurrent === 1,
  );

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getAdjustmentLabel = (status) => {
    return status === 2 ? "Freeze" : "Extension";
  };

  const getAdjustmentIcon = (status) => {
    return status === 2 ? Snowflake : CalendarPlus;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogContent
        className={cn(
          "flex h-[92vh] w-[99vw] max-w-7xl flex-col gap-0 overflow-hidden p-0",
          "rounded-xl",
          "sm:h-[90vh]",
          "max-sm:h-screen max-sm:w-full max-sm:max-w-none max-sm:rounded-none",
        )}
      > */}
      <DialogContent
        className={cn(
          "flex h-[94vh] w-[99vw] max-w-[1600px] flex-col gap-0 overflow-hidden rounded-xl p-0",
          "sm:h-[92vh]",
          "max-sm:h-screen max-sm:w-full max-sm:max-w-none max-sm:rounded-none",
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogPrimitive.Close asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1 z-50 h-8 w-8"
            onClick={onOpenChange}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogPrimitive.Close>
        {/* Header */}
        <DialogHeader className="shrink-0 border-b bg-background px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <History className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="min-w-0">
                  <DialogTitle className="truncate text-lg font-semibold sm:text-xl">
                    Membership history
                  </DialogTitle>

                  <DialogDescription className="mt-0.5 truncate text-xs sm:text-sm">
                    View past freezes and extensions for{" "}
                    <span className="font-medium text-foreground">
                      {member?.name || "this member"}
                    </span>
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8"> */}
          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Member summary */}
            <div className="rounded-xl border bg-muted/30 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Member
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold sm:text-lg">
                      {member?.name || "—"}
                    </h3>

                    {member?.plan && (
                      <Badge variant="secondary" className="font-normal">
                        {member.plan}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    Current expiry:{" "}
                    <span className="font-medium text-foreground">
                      {formatDate(member?.expiry)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Current adjustments */}
            {/* {currentAdjustments.length > 0 && (
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Current adjustments
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Active membership changes currently affecting this member.
                    </p>
                  </div>

                  <Badge variant="outline">
                    {currentAdjustments.length} active
                  </Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {currentAdjustments.map((adjustment) => {
                    const Icon = getAdjustmentIcon(adjustment.status);
                    const isFreeze = adjustment.status === 2;

                    return (
                      <div
                        key={adjustment.id}
                        className="rounded-xl border bg-background p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                isFreeze
                                  ? "bg-sky-50 text-sky-600 dark:bg-sky-950/40"
                                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium">
                                {getAdjustmentLabel(adjustment.status)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {adjustment.durationDays} days
                              </p>
                            </div>
                          </div>

                          <Badge variant="secondary">Current</Badge>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Original date
                            </p>
                            <p className="mt-1 text-sm font-medium">
                              {formatDate(adjustment.oldEndDate)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              New expiry
                            </p>
                            <p className="mt-1 text-sm font-semibold">
                              {formatDate(adjustment.newEndDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )} */}
            {currentAdjustments.length > 0 && (
              <section className="w-full">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold">Current adjustments</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Active membership adjustments currently affecting this
                    member.
                  </p>
                </div>

                <div className="space-y-3">
                  {currentAdjustments.map((adjustment) => {
                    const isFreeze = adjustment.status === 2;
                    const Icon = isFreeze ? Snowflake : CalendarPlus;

                    return (
                      <div
                        key={adjustment.id}
                        className="w-full rounded-xl border bg-background p-4 sm:p-5"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                isFreeze
                                  ? "bg-sky-50 text-sky-600 dark:bg-sky-950/40"
                                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium">
                                {isFreeze ? "Freeze" : "Extension"}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {adjustment.durationDays} days
                              </p>
                            </div>
                          </div>

                          <Badge variant="secondary" className="shrink-0">
                            Current
                          </Badge>
                        </div>

                        {/* Dates */}
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg bg-muted/50 px-3 py-3">
                            <p className="text-xs text-muted-foreground">
                              Original date
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {formatDate(adjustment.oldEndDate)}
                            </p>
                          </div>

                          <div className="rounded-lg bg-muted/50 px-3 py-3">
                            <p className="text-xs text-muted-foreground">
                              New expiry
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {formatDate(adjustment.newEndDate)}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium">Reason</p>

                            <p className="mt-1 break-words text-sm text-muted-foreground">
                              {adjustment.reason || "No reason provided"}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium">Notes</p>

                            <p className="mt-1 break-words text-sm text-muted-foreground">
                              {adjustment.notes || "No notes added"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {currentAdjustments.length > 0 && history.length > 0 && (
              <Separator />
            )}

            {/* History */}
            <section>
              <div className="mb-5">
                <h3 className="text-sm font-semibold">Previous adjustments</h3>
                <p className="text-xs text-muted-foreground">
                  A record of previously completed freezes and extensions.
                </p>
              </div>

              {history.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <History className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold">
                    No membership history
                  </h3>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground sm:text-sm">
                    Previous freezes and extensions will appear here once this
                    member has a completed membership adjustment.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute bottom-4 left-[18px] top-4 hidden w-px bg-border sm:block" />

                  <div className="space-y-4">
                    {history.map((adjustment) => {
                      const isFreeze = adjustment.status === 2;
                      const Icon = getAdjustmentIcon(adjustment.status);

                      return (
                        <div key={adjustment.id} className="relative sm:pl-12">
                          {/* Timeline icon */}
                          <div
                            className={cn(
                              "absolute left-0 top-4 hidden h-9 w-9 items-center justify-center rounded-full border bg-background sm:flex",
                              isFreeze
                                ? "border-sky-200 text-sky-600 dark:border-sky-900"
                                : "border-emerald-200 text-emerald-600 dark:border-emerald-900",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          {/* History card */}
                          <div className="rounded-xl border bg-background p-4 transition-colors hover:bg-muted/20 sm:p-5">
                            <div className="flex flex-col gap-4">
                              {/* Card header */}
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:hidden",
                                      isFreeze
                                        ? "bg-sky-50 text-sky-600 dark:bg-sky-950/40"
                                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
                                    )}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>

                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="text-sm font-semibold">
                                        {getAdjustmentLabel(adjustment.status)}
                                      </h4>

                                      <Badge
                                        variant="outline"
                                        className="text-[11px] font-normal"
                                      >
                                        Completed
                                      </Badge>
                                    </div>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                      {adjustment.durationDays} days
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Clock3 className="h-3.5 w-3.5" />
                                  {formatDate(adjustment.updatedAt)}
                                </div>
                              </div>

                              {/* Dates */}
                              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                                <div className="rounded-lg bg-muted/50 px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">
                                    Original expiry
                                  </p>
                                  <p className="mt-1 text-sm font-medium">
                                    {formatDate(adjustment.oldEndDate)}
                                  </p>
                                </div>

                                <ArrowRight className="mx-auto hidden h-4 w-4 text-muted-foreground sm:block" />

                                <div className="rounded-lg bg-muted/50 px-3 py-3">
                                  <p className="text-[11px] text-muted-foreground">
                                    Updated expiry
                                  </p>
                                  <p className="mt-1 text-sm font-semibold">
                                    {formatDate(adjustment.newEndDate)}
                                  </p>
                                </div>
                              </div>

                              {/* Details */}
                              <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <CircleAlert className="h-3.5 w-3.5 text-muted-foreground" />
                                    <p className="text-xs font-medium">
                                      Reason
                                    </p>
                                  </div>

                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {adjustment.reason || "No reason provided"}
                                  </p>
                                </div>

                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                    <p className="text-xs font-medium">Notes</p>
                                  </div>

                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {adjustment.notes || "No notes added"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t bg-background px-4 py-3 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
