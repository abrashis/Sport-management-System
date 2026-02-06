import { Outlet } from "react-router-dom";
import { PublicNavbar } from "./PublicNavbar";
import { Trophy } from "lucide-react";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-muted/30 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-display font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero text-primary-foreground">
                <Trophy className="h-4 w-4" />
              </div>
              SportsPro Tournament Management
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Sports Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>);

}