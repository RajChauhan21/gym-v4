import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"

export function AuthModal({ triggerText = "Get Started" }) {
  // 'login' or 'signup'
  const [mode, setMode] = useState("login")

  return (
    <Dialog onOpenChange={() => setMode("login")}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full shadow-lg">
          {triggerText}
        </Button>
      </DialogTrigger>

      {/* login-03 and signup-03 are both wide 2-column layouts */}
      <DialogContent className="w-[92%] max-w-4xl p-0 overflow-hidden border-none bg-transparent rounded-3xl">
        {mode === "login" ? (
          <LoginForm onNavigateToSignup={() => setMode("signup")} />
        ) : (
          <SignupForm onNavigateToLogin={() => setMode("login")} />
        )}
      </DialogContent>
    </Dialog>
  )
}
