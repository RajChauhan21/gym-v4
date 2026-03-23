import React, { useState } from "react";
import { LogOut, AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/ui/Loader";

export function LogoutModal() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = () => {
        setIsLoggingOut(true);
        <Loader text="Logging Out...." />
        // Simulate API call
        setTimeout(() => {
            console.log("Logged out successfully");
            setIsLoggingOut(false);
            toast.success("Logged out successfully.");
            setOpen(false);
            navigate('/')
        }, 1500);
    };

    // if (setIsLoggingOut == true) {
    //     <Loader text="Logging Out...." />
    // }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl cursor-pointer">
                    Logout from all devices
                </Button>
            </DialogTrigger>

            <DialogContent className="w-[95%] sm:max-w-[400px] rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden shadow-2xl">
                <div className="p-6">
                    <DialogHeader className="flex flex-col items-center text-center">
                        {/* Visual Icon for Warning */}
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                            Logout Everywhere?
                        </DialogTitle>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                            This will end your active sessions on all other devices. You will need to log back in to use the gym portal elsewhere.
                        </p>
                    </DialogHeader>
                </div>

                {/* Footer with Responsive Button Stack */}
                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex flex-col sm:flex-row-reverse gap-3">
                        {/* Primary Action (Logout) - Tall on Mobile */}
                        <Button
                            disabled={isLoggingOut}
                            className="w-full h-14 sm:h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                            onClick={handleLogout}
                        >
                            {isLoggingOut ? "Processing..." : "Yes, Log out"}
                        </Button>

                        {/* Secondary Action (Cancel) - Tall on Mobile */}
                        <Button
                            variant="ghost"
                            className="w-full h-14 sm:h-11 rounded-xl font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
