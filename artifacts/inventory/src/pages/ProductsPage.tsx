import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductTable } from "@/components/products/ProductTable";

export default function ProductsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Inventory" }]} />
        
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
