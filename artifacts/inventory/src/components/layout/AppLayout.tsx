import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { useInventory } from "@/context/InventoryContext";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentUser } = useInventory();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground">
            <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <span className="text-foreground">{timeStr}</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
