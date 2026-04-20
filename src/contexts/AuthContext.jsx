import { createContext, useContext, useState, useEffect } from "react";
import constant from "../apis/constant"; // your axios instance
import { useProfile } from "./ProfileContext";
import { getMe } from "../apis/backend_apis";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Sync initial state with localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(false);
  const { profile, setProfile } = useProfile();

  const logout = async () => {
    try {
      await constant.post("/owner/auth/logout");
    } finally {
      // Clear both state and the URL security hint
      console.log("Logged out successfully");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userProfile");
      setIsAuthenticated(false);
      window.location.href = "/";
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const oauthSuccess = params.get("login") === "success";
      const hasHint = localStorage.getItem("isLoggedIn") === "true";

      if (oauthSuccess) {
        const response = await getMe();
        if (response.status === 202) {
          const userData = response.data;

          // 2. Map and Sync to Profile Context
          const updatedProfile = {
            ownerId: userData?.ownerId,
            gymId: userData?.gymId,
            gymName: userData?.gymName || "bobs Gym",
            owner: userData?.ownerName || "Raj Sharma",
            email: userData?.email,
            phone: userData?.phone || "9876543210",
            address: userData?.location || "Sector 9, Delhi",
            website: userData?.website || "://paramountgym.com",
            gymLogo:
              userData.gymImage ||
              "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/back06.jpg",
            ownerLogo:
              userData.ownerImage ||
              "https://codeskulptor-demos.commondatastorage.googleapis.com/AddressableObject/ironman.jpg",
            googleMapUrl:
              userData.googleMapUrl ||
              "https://maps.google.com/?q=paramount+gym",
            planName: userData.planName || "Premium",
            price: userData.price || 0,
            startDate: userData.startDate || "N/A",
            endDate: userData.endDate || "N/A",
            status: userData.status || "Active",
            memberLimitCount: userData.memberLimitCount || 12,
            currentMemberCount: userData.currentMemberCount || 10,
          };

          setProfile(updatedProfile);
          localStorage.setItem("userProfile", JSON.stringify(updatedProfile)); //store user details in LS

          localStorage.setItem("isLoggedIn", "true");
          setIsAuthenticated(true);

          // Clean the URL without triggering a full re-render loop
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
          console.log("OAuth Login Success Detected");
        }
      } else if (hasHint) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [setProfile]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
