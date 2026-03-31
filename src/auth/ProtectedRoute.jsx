import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "@/components/ui/Loader";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show nothing or a shadcn skeleton while checking the cookie
  // 2. WAIT while state is null (still checking)
  if (isAuthenticated === null) {
    return <Loader text="Verifying session..." />;
  }

  console.log("Final Guard Check. Authenticated:", isAuthenticated);

  // 3. Only redirect if it's strictly FALSE
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
