import { useInventory } from "@/context/InventoryContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle } from "lucide-react";

export default function ReorderPage() {
  const { products, reorderStatus, markReordered } = useInventory();
  
  const lowStockItems = products
    .filter(p => p.quantity < p.minThreshold)
    .sort((a, b) => (b.minThreshold - b.quantity) - (a.minThreshold - a.quantity));

  const itemsToReorder = lowStockItems.length;
  const pendingOrders = lowStockItems.filter(p => reorderStatus[p.id]).length;
  const totalShortfall = lowStockItems.reduce((sum, p) => sum + (p.minThreshold - p.quantity), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reorder Management" }]} />
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reorder Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Items requiring stock replenishment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-center">
            <span className="text-sm text-muted-foreground font-medium">Items to Reorder</span>
            <span className="text-2xl font-bold font-mono mt-1">{itemsToReorder}</span>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-center">
            <span className="text-sm text-muted-foreground font-medium">Pending Orders</span>
            <span className="text-2xl font-bold font-mono mt-1 text-amber-500">{pendingOrders}</span>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-center">
            <span className="text-sm text-muted-foreground font-medium">Total Shortfall Units</span>
            <span className="text-2xl font-bold font-mono mt-1 text-destructive">{totalShortfall}</span>
          </div>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-lg bg-card/50">
            <CheckCircle className="h-12 w-12 text-emerald-500 mb-4" />
            <h3 className="text-lg font-medium">All stock levels nominal</h3>
            <p className="text-muted-foreground text-sm mt-1">No items currently require reordering.</p>
          </div>
        ) : (
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Current Qty</TableHead>
                  <TableHead className="text-right">Min Threshold</TableHead>
                  <TableHead className="text-right">Shortfall</TableHead>
                  <TableHead className="text-right">Suggested Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map(product => {
                  const shortfall = product.minThreshold - product.quantity;
                  const suggestedOrder = product.minThreshold * 2 - product.quantity;
                  const ordered = reorderStatus[product.id];
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{product.id}</TableCell>
                      <TableCell className="text-muted-foreground">{product.storageLocation}</TableCell>
                      <TableCell className="text-right font-mono text-destructive">{product.quantity}</TableCell>
                      <TableCell className="text-right font-mono">{product.minThreshold}</TableCell>
                      <TableCell className="text-right font-mono text-destructive font-bold">{shortfall}</TableCell>
                      <TableCell className="text-right font-mono text-primary font-bold">{suggestedOrder}</TableCell>
                      <TableCell>
                        {ordered ? (
                          <Badge className="bg-amber-500 text-[10px] uppercase">Order Placed</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px] uppercase">Needs Reorder</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {ordered ? (
                          <Button variant="outline" size="sm" onClick={() => markReordered(product.id, false)}>
                            Mark Received
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => markReordered(product.id, true)}>
                            Mark Ordered
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
