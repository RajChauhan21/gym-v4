import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { PauseCircle, CalendarPlus, Loader2, History, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getMembershipAdjustment } from "../../apis/backend_apis";
import { toast } from "sonner";

function deriveStatus(record) {
  if (record.status) return record.status;
  return record.isCurrent === 1 ? "active" : "completed";
}

const STATUS_STYLES = {
  active: "border-primary/30 bg-primary/10 text-primary",
  completed: "border-border bg-muted text-muted-foreground",
  removed: "border-destructive/30 bg-destructive/10 text-destructive",
};

const STATUS_DOT = {
  active: "bg-primary",
  completed: "bg-muted-foreground/50",
  removed: "bg-destructive",
};

function getHoldType(record) {
  return record.status === 2 ? "freeze" : "extend";
}

function getLifecycleStatus(record) {
  return record.isCurrent === 1 ? "active" : "completed";
}

export default function MembershipHistoryModal({ open, onOpenChange, member }) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchMembershipData = async () => {
      if (!open || !member?.id) return;

      setIsLoading(true);
      setIsError(false);

      try {
        const response = await getMembershipAdjustment(member.id);
        if (response.status == 202 || response.status == 200) {
          setRecords(response.data);
        }
      } catch (error) {
        console.error("Error fetching membership data:", error);
        toast.error("Failed to fetch membership history.");
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembershipData();
  }, [open, member?.id]);

  const sorted = useMemo(() => {
    if (!records) return [];

    return [...records].sort(
      (a, b) => new Date(b.newEndDate) - new Date(a.newEndDate),
    );
  }, [records]);

  const stats = useMemo(() => {
    if (!records) return null;

    const current = records.filter((record) => record.isCurrent === 1);

    const freezeDays = records
      .filter((record) => record.status === 2)
      .reduce((sum, record) => sum + (record.durationDays || 0), 0);

    const extendDays = records
      .filter((record) => record.status === 3)
      .reduce((sum, record) => sum + (record.durationDays || 0), 0);

    return {
      total: records.length,
      freezeDays,
      extendDays,
      currentLabel:
        current.length === 0
          ? "None"
          : current.some((record) => record.status === 2)
            ? "Freeze"
            : "Extension",
    };
  }, [records]);

  const status = deriveStatus(records);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="flex h-[92vh] min-h-0 w-[96%] max-w-6xl flex-col gap-0 overflow-hidden rounded-lg p-0 sm:h-[85vh]"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "96%",
          maxWidth: "72rem",
          gap: 0,
          padding: 0,
        }}
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
        <DialogHeader className="shrink-0 space-y-1 border-b px-4 py-3 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Freeze &amp; extension history
          </DialogTitle>

          {member?.name && (
            <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <span className="min-w-0 truncate">{member.name}</span>

              {member?.plan && (
                <Badge
                  variant="secondary"
                  className="shrink-0 font-normal bg-black text-white dark:bg-white dark:text-black"
                >
                  {member.plan} Plan
                </Badge>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row no-scrollbar">
          {stats && (
            <div className="grid shrink-0 grid-cols-2 gap-px overflow-x-auto border-b bg-border md:w-56 md:grid-cols-1 md:border-b-0 md:border-r">
              {[
                ["Total holds", stats.total],
                ["Freeze days used", stats.freezeDays],
                ["Extension days added", stats.extendDays],
                ["Active", stats.currentLabel],
              ].map(([label, value]) => (
                <div key={label} className="bg-background px-4 py-3 md:px-5">
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold sm:text-base">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 pb-6 sm:px-6 md:px-8 no-scrollbar">
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading history…
              </div>
            )}

            {isError && (
              <p className="py-16 text-center text-sm text-destructive">
                Couldn't load this member's history. Try again.
              </p>
            )}

            {!isLoading && !isError && sorted.length === 0 && (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No freeze or extension history yet.
              </p>
            )}

            {!isLoading && !isError && sorted.length > 0 && (
              <ol className="flex max-w-3xl flex-col">
                {sorted.map((record, index) => {
                  const holdType = getHoldType(record);
                  const lifecycleStatus = getLifecycleStatus(record);

                  const startDate = record.freezeStartDate
                    ? parseISO(record.freezeStartDate)
                    : parseISO(record.oldEndDate);

                  const endDate = record.freezeEndDate
                    ? parseISO(record.freezeEndDate)
                    : parseISO(record.newEndDate);

                  const isLast = index === sorted.length - 1;
                  const isFreeze = holdType === "freeze";

                  return (
                    <li key={record.id} className="flex gap-4">
                      {/* Rail: dot + connecting line */}
                      <div className="flex shrink-0 flex-col items-center">
                        <span
                          className={cn(
                            "mt-1.5 h-2.5 w-2.5 rounded-full",
                            isFreeze ? "bg-sky-500" : "bg-emerald-500",
                          )}
                        />

                        {!isLast && (
                          <span className="mt-1 w-px flex-1 bg-border" />
                        )}
                      </div>

                      <div className={cn("min-w-0 flex-1", !isLast && "pb-6")}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5 text-sm font-semibold capitalize">
                            <span
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                                isFreeze
                                  ? "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
                                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
                              )}
                            >
                              {isFreeze ? (
                                <PauseCircle className="h-4 w-4" />
                              ) : (
                                <CalendarPlus className="h-4 w-4" />
                              )}
                            </span>

                            <span className="truncate">
                              {holdType} · {record.durationDays} days
                            </span>
                          </div>

                          <span
                            className={cn(
                              "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
                              lifecycleStatus === "active"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : lifecycleStatus === "completed"
                                  ? "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                                  : STATUS_STYLES[lifecycleStatus],
                            )}
                          >
                            {lifecycleStatus}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {format(startDate, "d MMM yyyy")} →{" "}
                          {format(endDate, "d MMM yyyy")}
                        </p>

                        {record.reason && (
                          <p className="mt-1.5 text-sm capitalize">
                            {record.reason}
                          </p>
                        )}

                        {record.notes && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t px-4 py-3 sm:px-6 m-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
