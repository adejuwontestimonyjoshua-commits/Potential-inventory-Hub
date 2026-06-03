import { useInventory } from "@/context/InventoryContext";
import type { Product } from "@/context/InventoryContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { LowStockAlerts } from "@/components/dashboard/LowStockAlerts";
import StockAlerts from "@/components/StockAlerts";
import { Package, DollarSign, AlertTriangle, Layers } from "lucide-react";
import { useLocation } from "wouter";

export default function DashboardPage() {
  const { products } = useInventory();
  const [, setLocation] = useLocation();

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  const lowStockCount = products.filter((p) => p.quantity < p.minThreshold).length;
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);

  const handleReorderClick = (product: Product) => {
    setLocation(`/reorder`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            System overview and real-time inventory alerts.
          </p>
        </div>

        <StockAlerts onReorderClick={handleReorderClick} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value={totalProducts}
            icon={<Package className="h-4 w-4" />}
          />
          <StatCard
            title="Total Inventory Value"
            value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatCard
            title="Low Stock Items"
            value={lowStockCount}
            icon={<AlertTriangle className="h-4 w-4" />}
            alert={lowStockCount > 0}
          />
          <StatCard
            title="Total Units"
            value={totalUnits.toLocaleString()}
            icon={<Layers className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <ActivityFeed />
          <LowStockAlerts />
        </div>
      </div>
    </AppLayout>
  );
}
