import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Trophy,
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  Menu } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sidebarItems = [
{ label: "Dashboard", path: "/admin", icon: LayoutDashboard },
{ label: "Sports", path: "/admin/sports", icon: Trophy },
{ label: "Registrations", path: "/admin/registrations", icon: Users },
{ label: "Draw Generator", path: "/admin/draw", icon: Calendar },
{ label: "Settings", path: "/admin/settings", icon: Settings }];


export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const NavContent = () =>
  <>
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
            <Trophy className="h-5 w-5" />
          </div>
          {!collapsed &&
        <span className="font-display font-bold text-lg text-sidebar-foreground">
              Admin Panel
            </span>
        }
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path ||
        item.path !== "/admin" && location.pathname.startsWith(item.path);

        return (
          <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
              <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2",
                isActive && "bg-sidebar-accent text-sidebar-primary"
              )}>
              
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>);

      })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <Button
        variant="ghost"
        onClick={handleLogout}
        className={cn(
          "w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive",
          collapsed && "justify-center px-2"
        )}>
        
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
        
        <Button
        variant="ghost"
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hidden md:flex",
          collapsed && "justify-center px-2"
        )}>
        
          <ChevronLeft className={cn("h-5 w-5 shrink-0 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </Button>
      </div>
    </>;


  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}>
        
        <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen &&
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={() => setMobileOpen(false)} />

      }

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar w-64 transform transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
        
        <NavContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 flex items-center gap-4 border-b bg-background px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}>
            
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-display font-semibold">Admin Panel</span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>);

}