import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/context/InventoryContext";
import { AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export function LowStockAlerts() {
  const { products } = useInventory();
  
  const lowStockProducts = products
    .filter(p => p.quantity < p.minThreshold)
    .sort((a, b) => (a.quantity / a.minThreshold) - (b.quantity / b.minThreshold));

  return (
    <Card className="col-span-4 lg:col-span-2 border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lowStockProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors cursor-pointer group">
                <div>
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{product.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{product.id} • {product.storageLocation}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={cn(
                      "font-mono text-sm font-bold",
                      product.quantity === 0 ? "text-destructive" : "text-amber-500"
                    )}>
                      {product.quantity} / {product.minThreshold}
                    </div>
                  </div>
                  <Badge variant="destructive" className="uppercase text-[10px]">Reorder</Badge>
                </div>
              </div>
            </Link>
          ))}
          {lowStockProducts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
              Inventory levels nominal.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}