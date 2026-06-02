import { useState, useMemo } from "react";
import { useInventory, Product } from "@/context/InventoryContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductModal } from "./ProductModal";
import { Search, MoreVertical, Edit, Trash2, Eye, ChevronUp, ChevronDown, ChevronsUpDown, Minus, Plus } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Microcontroller",
  "Sensor",
  "Display",
  "Motor",
  "Breadboard",
  "Wiring",
  "Other",
];

export function ProductTable() {
  const { products, currentUser, deleteProduct, adjustQuantity } = useInventory();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  
  const [sortKey, setSortKey] = useState<"name" | "quantity" | "unitPrice" | "lastUpdated" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.id.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (!sortKey) return 0;
      const mult = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return mult * a.name.localeCompare(b.name);
      if (sortKey === "quantity") return mult * (a.quantity - b.quantity);
      if (sortKey === "unitPrice") return mult * (a.unitPrice - b.unitPrice);
      if (sortKey === "lastUpdated") return mult * (new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());
      return 0;
    });
  }, [filteredProducts, sortKey, sortDir]);

  const getStatusBadge = (quantity: number, threshold: number) => {
    if (quantity === 0 || quantity < threshold / 2) {
      return <Badge variant="destructive" className="uppercase text-[10px]">Critical</Badge>;
    }
    if (quantity < threshold) {
      return <Badge className="bg-amber-500 hover:bg-amber-600 uppercase text-[10px]">Low Stock</Badge>;
    }
    return <Badge className="bg-emerald-500 hover:bg-emerald-600 uppercase text-[10px]">In Stock</Badge>;
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteProduct(deleteId);
      setDeleteId(null);
    }
  };

  const handleSort = (key: "name" | "quantity" | "unitPrice" | "lastUpdated") => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortableHeader = ({ label, sortKey: key, className }: { label: string, sortKey: "name" | "quantity" | "unitPrice" | "lastUpdated", className?: string }) => (
    <TableHead 
      className={cn("cursor-pointer select-none hover:text-foreground transition-colors", className)} 
      onClick={() => handleSort(key)}
    >
      <div className={cn("flex items-center gap-1", className?.includes("text-right") && "justify-end")}>
        {label}
        {sortKey === key ? (
          sortDir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-products"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c} data-testid={`select-item-filter-${c}`}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {currentUser?.role === "admin" && (
          <Button onClick={handleAdd} data-testid="button-add-product">
            Add Product
          </Button>
        )}
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <SortableHeader label="Name" sortKey="name" />
              <TableHead>Category</TableHead>
              <SortableHeader label="Price" sortKey="unitPrice" className="text-right" />
              <SortableHeader label="Qty" sortKey="quantity" className="text-right" />
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <SortableHeader label="Last Updated" sortKey="lastUpdated" />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product) => {
              const isLowStock = product.quantity < product.minThreshold;
              return (
                <TableRow 
                  key={product.id} 
                  className={cn(
                    isLowStock && "bg-destructive/5 hover:bg-destructive/10"
                  )}
                  data-testid={`row-product-${product.id}`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right font-mono">${product.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => adjustQuantity(product.id, -1)}
                        disabled={product.quantity === 0}
                        data-testid={`button-decrement-${product.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className={cn("font-mono text-sm w-8 text-center", isLowStock && "text-destructive font-bold")}>
                        {product.quantity}
                      </span>
                      <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-emerald-500"
                        onClick={() => adjustQuantity(product.id, +1)}
                        data-testid={`button-increment-${product.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(product.quantity, product.minThreshold)}</TableCell>
                  <TableCell className="text-muted-foreground">{product.storageLocation}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{format(new Date(product.lastUpdated), "MMM d, yy")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`button-actions-${product.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/product/${product.id}`}>
                          <DropdownMenuItem className="cursor-pointer" data-testid={`menu-view-${product.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                        </Link>
                        {currentUser?.role === "admin" && (
                          <>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(product)} data-testid={`menu-edit-${product.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => setDeleteId(product.id)} data-testid={`menu-delete-${product.id}`}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {sortedProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProductModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        product={editingProduct} 
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90" data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
