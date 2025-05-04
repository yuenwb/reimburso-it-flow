
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar collapsed={sidebarCollapsed} />
        <main 
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out p-4 md:p-6",
            sidebarCollapsed ? "ml-16" : "ml-0 md:ml-64"
          )}
        >
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster position="top-right" closeButton />
    </div>
  );
};

export default AppLayout;
