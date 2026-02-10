import { Link, useLocation, useNavigate } from "react-router-dom";
import { Trophy, Home, Users, Calendar, LogIn, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";
import { toast } from "sonner";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Sports", path: "/sports", icon: Trophy },
  { label: "Register", path: "/register", icon: Users },
  { label: "Tie Sheets", path: "/tie-sheets", icon: Calendar }];


export function PublicNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHomePage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/admin/login";
  // Show the main nav everywhere except the true public landing (home while logged out)
  const isLandingHome = isHomePage && !user && !loading;
  const showNav = !isLandingHome && !isAuthPage;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero text-primary-foreground">
            <Trophy className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">SportsPro</span>
        </Link>

        {/* Desktop Navigation - Hidden on Home & Auth Pages */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2 transition-all",
                      isActive && "shadow-glow"
                    )}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Landing Button: Show on Auth pages or general pages (not Home) */}
          {!isHomePage && (
            <Link to="/">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Home className="h-4 w-4 mr-2" />
                Landing
              </Button>
            </Link>
          )}

          {/* When a user is logged in, show Sign Out instead of Admin Login */}
          {user && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          )}

          {/* Mobile Menu Toggle - Only if showing nav */}
          {showNav && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen &&
        <nav className="md:hidden border-t bg-background p-4 animate-slide-in-right">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}>

                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start gap-2">

                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>);

            })}
          </div>
        </nav>
      }
    </header>);

}