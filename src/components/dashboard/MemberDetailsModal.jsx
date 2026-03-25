import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, MapPin, Phone, User, CreditCard, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function MemberDetailsModal({ member, open, onOpenChange }) {
    if (!member) return null;

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

    function getExpiryText(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);

        // Normalize both dates
        today.setHours(0, 0, 0, 0);
        expiry.setHours(0, 0, 0, 0);

        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} ago`;
        }

        if (diffDays === 0) {
            return "Expiring Today";
        }

        if (diffDays <= 7) {
            return `Expires in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
        }

        // return expiry.toLocaleDateString("en-IN", {
        //   day: "numeric",
        //   month: "short",
        //   year: "numeric",
        // });
        return "Active"
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:max-w-md w-[92%]  rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-card">
                {/* Profile Header */}
                <div className="bg-primary/5 p-6 border-b">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20 uppercase">
                            {member.name.charAt(0)}
                        </div>
                        <div className="min-w-0"> {/* Prevents name from pushing container */}
                            <DialogTitle className="text-xl font-bold truncate">
                                {member.name}
                            </DialogTitle>
                            <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="font-semibold bg-background">
                                    {member.plan} Plan
                                </Badge>
                                <Badge className={cn("bg-white dark:bg-black",getExpiryColor(member.expiry))}>
                                    {getExpiryText(member.expiry)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details List */}
                <div className="p-6 space-y-5">
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
                            value={member.address || "No address on file"}
                            isLongText
                        />
                    </div>

                    <div className="h-px bg-border w-full my-2" />

                    {/* Dates Section - Two Columns */}
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem
                            icon={<Calendar className="size-4 text-muted-foreground" />}
                            label="Joined Date"
                            value={member.joined}
                        />
                        <DetailItem
                            icon={<Clock className="size-4 text-muted-foreground" />}
                            label="Expiry Date"
                            value={member.expiry}
                        />
                    </div>

                    {/* Footer Stats */}
                    <div className="pt-4 mt-2 border-t flex justify-between items-center bg-muted/30 -mx-6 px-6 py-4">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Balance Due</p>
                            <p className="text-lg font-bold text-foreground">
                                ₹{member.due.toLocaleString()}
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
            <div className="min-w-0 flex-1"> {/* Essential for text wrapping */}
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">
                    {label}
                </p>
                <p className={`text-sm font-medium text-foreground ${isLongText ? 'break-all sm:break-words' : 'truncate'}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}
