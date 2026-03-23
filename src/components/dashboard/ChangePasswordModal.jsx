import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
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
import { toast } from "sonner";
export function ChangePasswordModal() {
    const [open, setOpen] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const getPasswordStrength = (pass) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        const strengthMap = {
            0: { label: "Too Weak", color: "bg-zinc-200" },
            1: { label: "Weak", color: "bg-red-500" },
            2: { label: "Fair", color: "bg-orange-500" },
            3: { label: "Good", color: "bg-yellow-500" },
            4: { label: "Strong", color: "bg-green-500" },
        };

        return { score, ...strengthMap[score] };
    };

    const { score, label, color } = getPasswordStrength(password);


    const resetAndClose = () => {
        setPassword("");
        setConfirmPassword("");
        setShowPass(false);
        toast.success("Password has been reset successfully.");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetAndClose(); }}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl">
                    Change Password
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-600" />
                        Update Password
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-5 py-4">
                    {/* New Password Field */}
                    <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                            <Input
                                id="new-password"
                                type={showPass ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="rounded-xl pr-10 border-zinc-200 focus:ring-2 focus:ring-blue-500/20 transition-all dark:bg-zinc-900"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Strength Meter UI */}
                        <div className="mt-1 space-y-2">
                            <div className="flex h-1.5 w-full gap-1.5">
                                {[1, 2, 3, 4].map((step) => (
                                    <div
                                        key={step}
                                        className={`h-full flex-1 rounded-full transition-all duration-500 ${score >= step ? color : "bg-zinc-100 dark:bg-zinc-800"
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between items-center px-0.5">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">Strength</span>
                                <span className={`text-[11px] font-bold ${score === 4 ? "text-green-600" : "text-zinc-600 dark:text-zinc-400"}`}>
                                    {label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="grid gap-2">
                        <Label htmlFor="confirm">Confirm Password</Label>
                        <Input
                            id="confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="rounded-xl border-zinc-200 dark:bg-zinc-900"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        disabled={score < 4 || password !== confirmPassword}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:grayscale transition-all cursor-pointer"
                        onClick={resetAndClose}
                    >
                        {password !== confirmPassword && password.length > 0 ? "Passwords Match Needed" : "Confirm Change"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
