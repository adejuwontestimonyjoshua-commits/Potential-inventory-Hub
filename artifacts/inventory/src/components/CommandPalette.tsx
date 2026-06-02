import { useState, useEffect } from "react";
import { useInventory } from "@/context/InventoryContext";
import { useLocation } from "wouter";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Package, LayoutDashboard, FileText, ShoppingCart, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { onCommandPaletteOpen } from "@/lib/commandPalette";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { products } = useInventory();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    return onCommandPaletteOpen(() => setOpen(true));
  }, []);

  const navigateTo = (href: string) => {
    setOpen(false);
    setLocation(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search products, pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => navigateTo("/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/products")}>
            <Package className="mr-2 h-4 w-4" />
            <span>Inventory</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/reorder")}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>Reorder</span>
          </CommandItem>
          <CommandItem onSelect={() => navigateTo("/reports")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Inventory">
          {products.slice(0, 8).map((product) => (
            <CommandItem 
              key={product.id} 
              onSelect={() => navigateTo(`/product/${product.id}`)}
              className="flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>{product.name}</span>
                <span className="font-mono text-xs text-muted-foreground ml-2">{product.id}</span>
              </div>
              <Badge variant={product.quantity < product.minThreshold ? "destructive" : "outline"} className="text-[10px]">
                {product.quantity} in stock
              </Badge>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
