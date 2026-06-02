import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, FileText, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/products", label: "Inventory", icon: Package },
    { href: "/reports", label: "Reports", icon: FileText },
  ];

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border bg-sidebar">
        <div className="flex items-center gap-2 text-primary">
          <Cpu className="h-6 w-6" />
          <span className="font-bold tracking-tight">PIH SYSTEM</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} data-testid={`link-${item.label.toLowerCase()}`}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="text-xs font-mono text-muted-foreground space-y-1">
          <div>SYS_STATUS: ONLINE</div>
          <div>PING: 14ms</div>
        </div>
      </div>
    </aside>
  );
}