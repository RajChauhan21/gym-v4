import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"

export function AuthModal({ triggerText = "Get Started" }) {
  // 'login' or 'signup'
  const [mode, setMode] = useState("login")
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setMode("login"); // Reset to login when closed
    }}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full shadow-lg bg-white text-black cursor-pointer">
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[92%] max-w-4xl p-0 overflow-hidden border-none bg-transparent rounded-3xl">
        {mode === "login" ? (
          <LoginForm onNavigateToSignup={() => setMode("signup")} />
        ) : (
          // 3. Pass setOpen down so SignupForm can close the modal
          <SignupForm
            onNavigateToLogin={() => setMode("login")}
            closeModal={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
