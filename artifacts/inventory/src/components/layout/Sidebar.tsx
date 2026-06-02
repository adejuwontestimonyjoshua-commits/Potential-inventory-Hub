import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, FileText, Cpu, ShoppingCart, Search, LogOut, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventory } from "@/context/InventoryContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { openCommandPalette } from "@/lib/commandPalette";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { currentUser, logout, products } = useInventory();

  const criticalCount = products.filter(p => p.quantity < p.minThreshold).length;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/products", label: "Inventory", icon: Package, badge: criticalCount > 0 ? criticalCount : null },
    { href: "/reorder", label: "Reorder", icon: ShoppingCart, badge: criticalCount > 0 ? criticalCount : null },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/analytics", label: "Analytics", icon: BarChart2 },
  ];

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0">
      <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-sidebar">
        <div className="flex items-center gap-2 text-primary">
          <Cpu className="h-6 w-6" />
          <span className="font-bold tracking-tight">PIH SYSTEM</span>
        </div>
        <button
          onClick={() => openCommandPalette()}
          className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/50 hover:text-muted-foreground transition-colors px-2 py-1 rounded border border-border/30 hover:border-border/60"
        >
          <Search className="h-3 w-3" />
          <span>⌘K</span>
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                {item.badge && (
                  <Badge className="ml-auto bg-destructive text-destructive-foreground text-[10px] h-4 min-w-4 px-1 rounded-full">{item.badge}</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60 mb-4 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>SYSTEM ONLINE</span>
        </div>
        
        {currentUser && (
          <div className="flex flex-col gap-3 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate text-foreground">{currentUser.name}</span>
                  <span className={cn(
                    "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border",
                    currentUser.role === "admin" ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"
                  )}>
                    {currentUser.role}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground truncate">{currentUser.email}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-destructive justify-start px-2" onClick={handleLogout} data-testid="button-sidebar-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
