import { createContext, useContext, useState, useEffect } from "react";
import constant from "../apis/constant" // your axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Sync initial state with localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    try {
      await constant.post("/owner/auth/logout");
    } finally {
      // Clear both state and the URL security hint
      console.log("Logged out successfully");
      localStorage.removeItem("isLoggedIn");
      setIsAuthenticated(false);
      window.location.href = "/";
    }
  };

  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const oauthSuccess = params.get("login") == "success";

  //   if (oauthSuccess) {
  //     // 1. Handle the initial redirect from Google
  //     localStorage.setItem("isLoggedIn", "true");
  //     setIsAuthenticated(true);
  //     setLoading(false);
  //     // Clean URL: Remove ?login=success
  //     window.history.replaceState({}, document.title, window.location.pathname);
  //     console.log("OAuth login successful, user authenticated");
  //   }
  //   else if (localStorage.getItem("isLoggedIn") === "true") {
  //     // 2. Handle manual URL typing (we already have the hint)
  //     setIsAuthenticated(true);
  //     setLoading(false);
  //     console.log("User is already authenticated based on localStorage hint");
  //   }
  //   else {
  //     // 3. Not logged in
  //     setIsAuthenticated(false);
  //     setLoading(false);
  //     console.log("User is not authenticated");
  //   }
  // }, []);

  useEffect(() => {
    const checkAuth = () => {
      const params = new URLSearchParams(window.location.search);
      const oauthSuccess = params.get("login") === "success";
      const hasHint = localStorage.getItem("isLoggedIn") === "true";

      if (oauthSuccess) {
        localStorage.setItem("isLoggedIn", "true");
        setIsAuthenticated(true);
        // Clean the URL without triggering a full re-render loop
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (hasHint) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);


  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
