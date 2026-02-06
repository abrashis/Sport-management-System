import { Link, useLocation } from "react-router-dom";
import { Trophy, Home, Users, Calendar, LogIn, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Sports", path: "/sports", icon: Trophy },
  { label: "Register", path: "/register", icon: Users },
  { label: "Tie Sheets", path: "/tie-sheets", icon: Calendar }];


export function PublicNavbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHomePage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/admin/login";
  const showNav = !isHomePage && !isAuthPage;

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

          {/* Hide Admin Login button if we are already on the admin login page */}
          {location.pathname !== "/admin/login" && (
            <Link to="/admin/login">
              <Button variant="outline" size="sm" className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
                <LogIn className="h-4 w-4" />
                <span>Admin Login</span>
              </Button>
            </Link>
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