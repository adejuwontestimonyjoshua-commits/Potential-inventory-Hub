import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Save, RotateCcw, Search, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["All", "Microcontroller", "Sensor", "Display", "Motor", "Breadboard", "Wiring", "Other"];

export default function SettingsPage() {
  const { products, updateProduct, currentUser } = useInventory();
  const { toast } = useToast();
  const isAdmin = currentUser?.role === "admin";

  const [thresholds, setThresholds] = useState<Record<string, number>>(() =>
    Object.fromEntries(products.map((p) => [p.id, p.minThreshold]))
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || p.category === category;
      return matchSearch && matchCat;
    });
  }, [products, search, category]);

  const dirtyIds = Object.entries(thresholds)
    .filter(([id, val]) => {
      const original = products.find((p) => p.id === id)?.minThreshold;
      return original !== val;
    })
    .map(([id]) => id);

  const handleChange = (id: string, raw: string) => {
    const val = parseInt(raw, 10);
    if (!isNaN(val) && val >= 0) {
      setThresholds((prev) => ({ ...prev, [id]: val }));
    } else if (raw === "") {
      setThresholds((prev) => ({ ...prev, [id]: 0 }));
    }
  };

  const handleReset = () => {
    setThresholds(Object.fromEntries(products.map((p) => [p.id, p.minThreshold])));
  };

  const handleSaveAll = () => {
    dirtyIds.forEach((id) => {
      updateProduct(id, { minThreshold: thresholds[id] });
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    toast({
      title: `${dirtyIds.length} threshold${dirtyIds.length > 1 ? "s" : ""} updated`,
      description: "Reorder levels have been saved.",
    });
  };

  const handleApplyToCategory = (cat: string, value: number) => {
    const ids = products.filter((p) => p.category === cat).map((p) => p.id);
    setThresholds((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = value));
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
        />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure reorder thresholds for all products in bulk.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              {dirtyIds.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Reset
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSaveAll}
                disabled={dirtyIds.length === 0}
                className={cn(saved && "bg-emerald-600 hover:bg-emerald-600")}
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save All {dirtyIds.length > 0 && `(${dirtyIds.length})`}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {!isAdmin && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
            <ShieldAlert className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-medium text-amber-400">Read-only.</span>{" "}
              Changing thresholds requires an{" "}
              <span className="font-medium text-foreground">Admin</span> account.
            </span>
          </div>
        )}

        {isAdmin && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              Quick Apply by Category
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                <div key={cat} className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">{cat}:</span>
                  {[5, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleApplyToCategory(cat, n)}
                      className="text-xs px-2 py-0.5 rounded border border-border hover:border-primary hover:text-primary transition-colors font-mono"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Current Qty</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right w-[160px]">Min Threshold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const threshold = thresholds[product.id] ?? product.minThreshold;
                const isDirty = threshold !== product.minThreshold;
                const isLow = product.quantity <= threshold;
                const pct = threshold > 0 ? Math.round((product.quantity / threshold) * 100) : 100;

                return (
                  <TableRow
                    key={product.id}
                    className={cn(isLow && "bg-destructive/5")}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{product.name}</span>
                        {isDirty && (
                          <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-semibold">
                            CHANGED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{product.storageLocation}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.category}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-mono text-sm font-semibold",
                          isLow ? "text-destructive" : "text-foreground"
                        )}
                      >
                        {product.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-muted rounded-full h-1.5 hidden sm:block">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              pct <= 50
                                ? "bg-destructive"
                                : pct <= 100
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <Badge
                          variant={isLow ? "destructive" : "secondary"}
                          className="text-[10px] uppercase"
                        >
                          {isLow ? "Low" : "OK"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        value={threshold}
                        onChange={(e) => handleChange(product.id, e.target.value)}
                        disabled={!isAdmin}
                        className={cn(
                          "w-24 ml-auto text-right font-mono h-8 text-sm",
                          isDirty && "border-primary ring-1 ring-primary/30"
                        )}
                        data-testid={`input-threshold-${product.id}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          {filtered.length} of {products.length} products shown
          {dirtyIds.length > 0 && (
            <span className="text-primary ml-2">· {dirtyIds.length} unsaved change{dirtyIds.length > 1 ? "s" : ""}</span>
          )}
        </p>
      </div>
    </AppLayout>
  );
}
