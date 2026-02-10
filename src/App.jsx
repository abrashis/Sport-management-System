import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { UserGuard } from "@/components/auth/UserGuard";

// Public Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SportsPage from "@/pages/SportsPage";
import RegisterPage from "@/pages/RegisterPage";
import SignupPage from "@/pages/SignupPage";
import TieSheetsPage from "@/pages/TieSheetsPage";
import NotFound from "@/pages/NotFound";

// Admin Pages
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminSignupPage from "@/pages/admin/AdminSignupPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminSportsPage from "@/pages/admin/AdminSportsPage";
import AdminRegistrationsPage from "@/pages/admin/AdminRegistrationsPage";
import AdminDrawPage from "@/pages/admin/AdminDrawPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";

const queryClient = new QueryClient();

const App = () =>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            {/* Admin Auth Routes use same public layout (navbar + footer) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/signup" element={<AdminSignupPage />} />
            {/* Auth-protected user routes */}
            <Route element={<UserGuard />}>
              <Route path="/sports" element={<SportsPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/tie-sheets" element={<TieSheetsPage />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }>

            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/sports" element={<AdminSportsPage />} />
            <Route path="/admin/registrations" element={<AdminRegistrationsPage />} />
            <Route path="/admin/draw" element={<AdminDrawPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;


export default App;