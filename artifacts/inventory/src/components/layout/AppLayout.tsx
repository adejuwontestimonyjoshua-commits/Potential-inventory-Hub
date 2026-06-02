import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useInventory } from "@/context/InventoryContext";
import { useLocation } from "wouter";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentUser, logout } = useInventory();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground hidden sm:inline-block">
              {currentUser?.role === "admin" ? "ADMIN_ACCESS" : "STAFF_ACCESS"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium" data-testid="text-username">{currentUser?.name}</span>
              <span className="text-xs text-muted-foreground" data-testid="text-userrole">{currentUser?.role}</span>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}