import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Mail,
  MapPin,
  Phone,
  User,
  CreditCard,
  Clock,
  TimerIcon,
  Route,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export function MemberDetailsModal({ member, open, onOpenChange }) {
  if (!member) return null;

  function getExpiryTextColor(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    // Use Math.ceil to match the day-rounding of your text function
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    // 1. Expired or expires today -> Red
    if (diffDays <= 0) return "text-red-500";

    // 2. Expiring within 1 to 7 days -> Blue
    if (diffDays > 0 && diffDays <= 7) return "text-blue-500";

    // 3. More than 7 days left -> Default / No extra class
    return "text-black dark:text-white";
  }

  function getExpiryColor(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return "text-red-500";
    if (diffDays === 0) return "text-orange-500 font-semibold";
    if (diffDays <= 7) return "text-yellow-500";
    return "text-blue-500";
  }

  function getExpiryBg(isActive) {
    // Constant backgrounds: Red for expired/today, Blue for future
    if (isActive == 0) return "bg-red-600";
    return "bg-sky-600";
  }

  function getExpiryText(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    // 1. Expired in the past
    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);

      if (absDays < 30) {
        return `Exp. ${absDays}d ago`;
      } else if (absDays < 365) {
        const months = Math.round(absDays / 30.44);
        return `Exp. ${months}mo ago`;
      } else {
        const years = Math.round(absDays / 365.25);
        return `Exp. ${years} ${years === 1 ? "yr" : "yrs"} ago`;
      }
    }

    // 2. Exact same day
    if (diffDays === 0) return "Exp. Today";

    // 3. NEW/UPDATED: Expiring within 1 to 7 days from today (inclusive)
    if (diffDays > 0 && diffDays <= 7) {
      return `Expring. in ${diffDays}d`;
    }

    // 4. More than 7 days in the future
    return expiryDate;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[90vw] max-w-[380px] sm:max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-card"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Profile Header */}
        <div className="bg-primary/5 p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20 uppercase">
              {member.name.charAt(0)}
            </div>
            <div className="min-w-0">
              {" "}
              {/* Prevents name from pushing container */}
              <DialogTitle className="text-xl font-bold truncate">
                {member.name}
              </DialogTitle>
              <DialogPrimitive.Close
                className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity outline-none"
                onClick={onOpenChange} // Also clear form if they just close the modal
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="font-semibold bg-background"
                >
                  {member.plan} Plan
                </Badge>
                <Badge
                  variant="outline"
                  className={`max-w-[120px] truncate bg-background text-center ${getExpiryTextColor(member.expiry)}`}
                  title={getExpiryText(member.expiry)} // Shows full text on hover
                >
                  {getExpiryText(member.expiry)}
                </Badge>

                {/* <Badge
                  className={cn(
                    "bg-white dark:bg-black",
                    getExpiryBg(member.isActive),
                  )}
                >
                  {member.isActive == 1 ? "Active" : "Inactive"}
                </Badge> */}
                <Badge
                  className={`inline-flex w-24 h-5 items-center justify-center rounded-xl px-2 shadow-sm ${getExpiryBg(member.isActive)}`}
                >
                  <span className="block w-full text-center truncate text-[10px] font-bold text-white dark:text-black uppercase">
                    {member.isActive == 1 ? "Active" : "Inactive"}
                  </span>
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="p-6 space-y-5 overflow-x-hidden">
          {/* Contact Section - Single Column for Long Text */}
          <div className="space-y-4">
            <DetailItem
              icon={<Phone className="size-4 text-primary" />}
              label="Phone Number"
              value={member.phone}
            />

            <DetailItem
              icon={<Mail className="size-4 text-primary" />}
              label="Email Address"
              value={member.email || "Not Provided"}
              isLongText // 👈 This will trigger word-wrap
            />

            <DetailItem
              icon={<MapPin className="size-4 text-primary" />}
              label="Home Address"
              value={member.address || "Not Provided"}
              isLongText
            />

            <DetailItem
              icon={<TimerIcon className="size-4 text-primary" />}
              label="Joined"
              value={member.joined || "N/A"}
              isLongText
            />

            <DetailItem
              icon={<Route className="size-4 text-primary" />}
              label="Source"
              value={member.source || "N/A"}
              isLongText
            />
          </div>

          <div className="h-px bg-border w-full my-2" />

          {/* Dates Section - Two Columns */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem
              icon={<Calendar className="size-4 text-muted-foreground" />}
              label="Start Date"
              value={member.startDate || "N/A"}
            />
            <DetailItem
              icon={<Clock className="size-4 text-muted-foreground" />}
              label="Expiry Date"
              value={member.expiry || "N/A"}
            />
          </div>

          {/* Footer Stats */}
          <div className="pt-4 mt-2 border-t bg-muted/30 -mx-6 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                Balance Due
              </p>
              <p className="text-lg font-bold text-foreground">
                ₹{member.dueAmount.toLocaleString()}
              </p>
            </div>
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-opacity"
              onClick={() => onOpenChange(false)}
            >
              Close Details
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ icon, label, value, isLongText }) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="mt-1 shrink-0 bg-muted p-1.5 rounded-md group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        {" "}
        {/* Essential for text wrapping */}
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm font-medium text-foreground ${isLongText ? "break-all sm:break-words" : "truncate"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
