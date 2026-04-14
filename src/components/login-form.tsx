import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import constant from "../apis/constant"
import { login, loginByGoogle } from "../apis/backend_apis"
import { toast } from "sonner";
import { useProfile } from "../contexts/ProfileContext";
import { Loader2 } from "lucide-react";
export function LoginForm({
  onNavigateToSignup,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { profile, setProfile } = useProfile();
  const [loading, setLoading] = useState(false);

  // 3. Handle Email/Password Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true);
    console.log("Login Attempt:", { email, password })
    // Add your login logic here (e.g., Firebase, Supabase, or API call)
    try {
      const response = await login(email, password);
      if (response.data.statusCodeValue === 200) {
        const userData = response.data.body;
        console.log("userData", userData)
        const updatedProfile = {
          ownerId: userData?.ownerId,
          gymId: userData?.gymId,
          gymName: userData.gymName || "Paramounts Gym",
          owner: userData.ownerName, // Mapping backend 'ownerName' to frontend 'owner'
          email: userData.email,
          phone: userData.phone || "9876543210",
          address: userData.location || "Sector 9, Delhi",
          website: userData.website || "://paramountgym.com",
          gymLogo: userData.gymImage || "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/back06.jpg",
          ownerLogo: userData.ownerImage || "https://png.pngtree.com/png-vector/20230801/ourmid/pngtree-cartoon-superhero-with-red-cape-with-logo-on-white-background-vector-png-image_6830646.png",
          googleMapUrl: userData.googleMapUrl || "https://maps.google.com/?q=paramount+gym",
          planName:userData.planName || "Premium",
          price:userData.price || 0,
          startDate:userData.startDate || 'N/A',
          endDate:userData.endDate || 'N/A',
          status:userData.status || 'Active',
          memberLimitCount:userData.memberLimitCount || 12,
          currentMemberCount:userData.currentMemberCount || 10,
        };

        setProfile(updatedProfile);
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile)); //store user details in LS

        //Auth Logic
        // 1. Set the hint for URL protection
        localStorage.setItem("isLoggedIn", "true");
        // 2. Update React State
        setIsAuthenticated(true);
        // 3. Redirect to secure area
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    }
    catch (error) {
      toast.error("Invalid email or password");
    }
    finally {
      setLoading(false);
    }

  }

  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 4. Handle Social Logins
  const handleSocialLogin = (provider: string) => {
    console.log(`Logging in with ${provider}`)
    // Trigger Google/Apple OAuth flow here
    if (provider === "Google") {
      loginByGoogle();
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Apple or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button typeof="button" variant="outline" type="button" onClick={() => handleSocialLogin("Apple")}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Apple
                </Button>
                <Button typeof="button" variant="outline" type="button" onClick={() => handleSocialLogin("Google")}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  disabled={loading}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password"  disabled={loading} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <a onClick={onNavigateToSignup}>Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </FieldDescription>
      </Card>
    </div>
  );
}

