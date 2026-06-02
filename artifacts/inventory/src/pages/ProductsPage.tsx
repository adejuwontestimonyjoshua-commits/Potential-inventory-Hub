import { AppLayout } from "@/components/layout/AppLayout";
import { ProductTable } from "@/components/products/ProductTable";

export default function ProductsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage hardware components, sensors, and lab equipment.
          </p>
        </div>
        
        <ProductTable />
      </div>
    </AppLayout>
  );
}