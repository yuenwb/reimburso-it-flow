
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReimbursementProvider } from "@/contexts/ReimbursementContext";

// Layouts
import AppLayout from "@/components/Layout/AppLayout";
import AuthLayout from "@/components/Layout/AuthLayout";

// Auth Pages
import Login from "@/pages/Login";
import Unauthorized from "@/pages/Unauthorized";

// Public Pages
import Dashboard from "@/pages/Dashboard";
import Requests from "@/pages/Requests";
import NewRequest from "@/pages/NewRequest";
import Approvals from "@/pages/Approvals";
import Reports from "@/pages/Reports";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

// Private Route Component
import PrivateRoute from "@/components/PrivateRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ReimbursementProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
              </Route>
              
              {/* Protected app routes - require authentication */}
              <Route element={<PrivateRoute />}>
                <Route element={<AppLayout />}>
                  {/* Default redirect to dashboard */}
                  <Route path="/" element={<Dashboard />} />
                  
                  {/* Employee routes */}
                  <Route path="/requests" element={<Requests />} />
                  <Route path="/new-request" element={<NewRequest />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Manager routes */}
                  <Route path="/approvals" element={<PrivateRoute requiredRole="manager" />}>
                    <Route path="" element={<Approvals />} />
                  </Route>
                  <Route path="/reports" element={<PrivateRoute requiredRole="manager" />}>
                    <Route path="" element={<Reports />} />
                  </Route>
                  
                  {/* Admin routes */}
                  <Route path="/users" element={<PrivateRoute requiredRole="admin" />}>
                    <Route path="" element={<Users />} />
                  </Route>
                  <Route path="/settings" element={<PrivateRoute requiredRole="admin" />}>
                    <Route path="" element={<Settings />} />
                  </Route>
                </Route>
              </Route>
              
              {/* Catch all - 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner position="top-right" closeButton />
        </TooltipProvider>
      </ReimbursementProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
