import React, { useState } from "react";
import { Trash2, AlertOctagon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccountModal() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const EXPECTED_TEXT = "DELETE MY ACCOUNT";

  const handleDelete = () => {
    setIsDeleting(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Account deleted.");
      setIsDeleting(false);
      setOpen(false);
    }, 2000);
  };

  const resetAndClose = () => {
    setConfirmText("");
    setIsDeleting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if(!val) resetAndClose(); setOpen(val); }}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="cursor-pointer rounded-xl font-semibold transition-transform active:scale-95">
          Delete Account
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95%] sm:max-w-[425px] rounded-2xl bg-white dark:bg-zinc-950 border-red-200 dark:border-red-900/30 p-0 overflow-hidden shadow-2xl">
        <div className="p-6">
          <DialogHeader className="flex flex-col items-center text-center">
            {/* Warning Icon */}
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 animate-pulse">
              <AlertOctagon className="w-8 h-8 text-red-600" />
            </div>
            
            <DialogTitle className="text-2xl font-bold text-red-600">
              Permanent Action
            </DialogTitle>
            
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
              This will permanently delete all your gym data, membership history, and profile. <strong>This cannot be undone.</strong>
            </p>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            <Label htmlFor="confirm" className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
              Type <span className="text-red-600">"{EXPECTED_TEXT}"</span> to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type phrase here..."
              className="h-12 rounded-xl border-red-100 dark:border-red-900/30 focus:ring-red-500/20 dark:bg-zinc-900"
              disabled={isDeleting}
            />
          </div>
        </div>

        {/* Footer with Stacked Buttons for Mobile */}
        <div className="p-6 bg-red-50/50 dark:bg-red-950/10 border-t border-red-100 dark:border-red-900/20">
          <div className="flex flex-col gap-3">
            <Button
              disabled={confirmText.trim() !== EXPECTED_TEXT || isDeleting}
              variant="destructive"
              className="w-full h-14 sm:h-12 rounded-xl font-bold shadow-lg shadow-red-500/30 disabled:opacity-30 disabled:grayscale transition-all cursor-pointer flex items-center justify-center gap-2"
              onClick={handleDelete}
            >
              {isDeleting ? (
                "Deleting Account..."
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Permanently
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              className="w-full h-14 sm:h-12 rounded-xl font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer"
              onClick={resetAndClose}
              disabled={isDeleting}
            >
              Cancel, keep my account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
