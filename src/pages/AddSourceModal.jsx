import { useEffect, useState } from "react";
import { Route, Plus, Loader2, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as DialogPrimitive from "@radix-ui/react-dialog";

const SUGGESTED_SOURCES = [
  "Instagram",
  "Facebook",
  "Google Search",
  "Google Maps",
  "Referral",
  "Walk-In",
  "WhatsApp",
];

export function AddSourceModal({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  editingSource,
}) {
  const [name, setName] = useState("");
  const MAX_CHARS = 12;

  const handleSubmit = () => {
    const value = name.trim();
    if (!value || loading) return;
    onSubmit?.(value);
  };

  const handleClose = () => {
    setName("");
    onOpenChange?.(false);
  };

  const handleSelectBadge = (item) => {
    if (loading) return;
    setName((prev) => (prev === item ? "" : item));
  };

  useEffect(() => {
    if (open) {
      setName(editingSource?.name || "");
    }
  }, [editingSource, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => (!val ? handleClose() : onOpenChange?.(val))}
    >
      <DialogContent
        className="sm:max-w-md gap-0 overflow-hidden p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Route className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {editingSource ? "Update Source" : "Add Source"}
              </DialogTitle>
              <DialogPrimitive.Close
                disabled={loading}
                className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity outline-none"
                onClick={handleClose} // Also clear form if they just close the modal
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
              <DialogDescription className="text-sm text-muted-foreground">
                {editingSource
                  ? "Update the source name."
                  : "Add a new customer acquisition source."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Input field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="source-name" className="text-sm font-medium">
                Source Name<span className="text-red-500">*</span>
              </Label>
              <span className="text-xs text-muted-foreground">
                {name.length}/{MAX_CHARS}
              </span>
            </div>

            <Input
              id="source-name"
              placeholder="e.g. Instagram, Referral, Google Search"
              value={name}
              maxLength={MAX_CHARS}
              disabled={loading}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Quick Suggestions container */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold">Common Examples</p>
              <p className="text-xs text-muted-foreground">
                Click any option to quickly populate the source field.
              </p>
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Suggested acquisition sources"
            >
              {SUGGESTED_SOURCES.map((item) => {
                const isSelected = name === item;
                return (
                  <button
                    key={item}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSelectBadge(item)}
                    aria-pressed={isSelected}
                    className={`
                      rounded-md border px-3 py-1.5 text-xs font-medium transition-all
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      disabled:opacity-50 disabled:pointer-events-none
                      ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "bg-background border-input text-muted-foreground hover:bg-muted hover:text-foreground"
                      }
                    `}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t bg-muted/10 px-6 py-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:items-center">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            className="w-full sm:w-auto mb-2"
          >
            Cancel
          </Button>

          {/* <Button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="w-full sm:w-auto min-w-[130px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Source
              </>
            )}
          </Button> */}

          <Button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="w-full sm:w-auto min-w-[130px] mb-2"
          >
            {loading
              ? editingSource
                ? "Updating..."
                : "Adding..."
              : editingSource
                ? "Update Source"
                : "Add Source"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
