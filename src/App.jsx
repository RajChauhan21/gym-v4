import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Sidebar from './components/dashboard/Sidebar'
import Topbar from "./components/dashboard/Topbar";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import { Toaster } from "@/components/ui/sonner";
import Plans from "./pages/Plans";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/dashboard/AppSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import { SideBarLayout } from "./pages/SideBarLayout";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { dark, toggleDark } = useTheme();
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<SideBarLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>

        <Toaster
          position="top-center"
          // 🔥 Inverse logic: If app is dark, toast is light. If app is light, toast is dark.
          theme={dark ? "light" : "dark"}
          richColors
          toastOptions={{
            style: {
              // 🟢 In Light Mode (App): Background is Black, Text is White
              // 🌑 In Dark Mode (App): Background is White, Text is Black
              background: dark ? "#ffffff" : "#000000",
              color: dark ? "#000000" : "#ffffff",
              border: dark ? "1px solid #e5e7eb" : "1px solid #333333",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "500",
            },
          }}
        />
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
