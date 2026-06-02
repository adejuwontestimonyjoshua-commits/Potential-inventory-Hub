import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductTable } from "@/components/products/ProductTable";
import { useInventory } from "@/context/InventoryContext";
import { ShieldAlert } from "lucide-react";

export default function ProductsPage() {
  const { currentUser } = useInventory();
  const isStaff = currentUser?.role === "staff";

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

        {isStaff && (
          <div
            className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"
            data-testid="banner-staff-readonly"
          >
            <ShieldAlert className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <span className="font-medium text-amber-400">Read-only access.</span>
              <span className="text-muted-foreground ml-1">
                You are signed in as <span className="font-mono">Staff</span>. Adding, editing, and deleting products requires an{" "}
                <span className="font-medium text-foreground">Admin</span> account
                {" "}(<span className="font-mono text-xs">admin@potentialhub.com / admin123</span>).
              </span>
            </div>
          </div>
        )}

        <ProductTable />
      </div>
    </AppLayout>
  );
}
