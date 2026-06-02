import { useInventory } from "@/context/InventoryContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRCodeDisplay } from "@/components/qr/QRCodeDisplay";
import { ArrowLeft, Edit, Cpu, Activity, Monitor, Settings, Grid, Zap, Box } from "lucide-react";
import { format } from "date-fns";
import { ProductModal } from "@/components/products/ProductModal";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { products, currentUser } = useInventory();
  const [modalOpen, setModalOpen] = useState(false);
  
  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">The product ID {id} does not exist in the database.</p>
          <Link href="/products">
            <Button variant="outline">Return to Inventory</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isLowStock = product.quantity < product.minThreshold;
  const isCritical = product.quantity === 0 || product.quantity < product.minThreshold / 2;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Microcontroller": return <Cpu className="h-12 w-12 text-primary" />;
      case "Sensor": return <Activity className="h-12 w-12 text-emerald-500" />;
      case "Display": return <Monitor className="h-12 w-12 text-blue-400" />;
      case "Motor": return <Settings className="h-12 w-12 text-amber-500" />;
      case "Breadboard": return <Grid className="h-12 w-12 text-orange-400" />;
      case "Wiring": return <Zap className="h-12 w-12 text-yellow-500" />;
      default: return <Box className="h-12 w-12 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <PageHeader crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Inventory", href: "/products" }, { label: product.name }]} />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/products">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                {isCritical ? (
                  <Badge variant="destructive" className="uppercase">Critical</Badge>
                ) : isLowStock ? (
                  <Badge className="bg-amber-500 hover:bg-amber-600 uppercase">Low Stock</Badge>
                ) : (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 uppercase">In Stock</Badge>
                )}
              </div>
              <p className="text-sm font-mono text-muted-foreground mt-1">{product.id}</p>
            </div>
          </div>
          
          {currentUser?.role === "admin" && (
            <Button onClick={() => setModalOpen(true)} data-testid="button-edit-product">
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground">Category</dt>
                    <dd className="font-medium flex items-center gap-2">
                      <Badge variant="outline">{product.category}</Badge>
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground">Unit Price</dt>
                    <dd className="font-medium font-mono">${product.unitPrice.toFixed(2)}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground">Current Quantity</dt>
                    <dd className={cn("font-medium font-mono text-lg", isLowStock && "text-destructive font-bold")}>
                      {product.quantity}
                    </dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground">Minimum Threshold</dt>
                    <dd className="font-medium font-mono">{product.minThreshold}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground">Storage Location</dt>
                    <dd className="font-medium font-mono">{product.storageLocation}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground">Last Updated</dt>
                    <dd className="font-medium font-mono text-xs">
                      {format(new Date(product.lastUpdated), "PPpp")}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px] text-center">
                {getCategoryIcon(product.category)}
                <h3 className="mt-4 text-lg font-medium">{product.category} Component</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  Generic placeholder for {product.category.toLowerCase()} parts. In a full system, this would be a photo of the {product.name}.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inventory Tag</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <QRCodeDisplay text={product.id} size={220} />
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Scan this QR code to quickly access this product's details in the PIH system.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Value Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Stock Value</span>
                  <span className="text-xl font-bold font-mono">${(product.quantity * product.unitPrice).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ProductModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        product={product} 
      />
    </AppLayout>
  );
}
