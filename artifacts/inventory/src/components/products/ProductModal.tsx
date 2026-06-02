import { useInventory, Product } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(1, "Category is required"),
  unitPrice: z.coerce.number().min(0, "Price must be positive"),
  quantity: z.coerce.number().min(0, "Quantity must be positive"),
  minThreshold: z.coerce.number().min(0, "Threshold must be positive"),
  storageLocation: z.string().min(2, "Location is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

const CATEGORIES = [
  "Microcontroller",
  "Sensor",
  "Display",
  "Motor",
  "Breadboard",
  "Wiring",
  "Other",
];

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductModal({ open, onOpenChange, product }: ProductModalProps) {
  const { addProduct, updateProduct } = useInventory();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      unitPrice: 0,
      quantity: 0,
      minThreshold: 0,
      storageLocation: "",
    },
  });

  useEffect(() => {
    if (product && open) {
      form.reset({
        name: product.name,
        category: product.category,
        unitPrice: product.unitPrice,
        quantity: product.quantity,
        minThreshold: product.minThreshold,
        storageLocation: product.storageLocation,
      });
    } else if (!open) {
      form.reset({
        name: "",
        category: "",
        unitPrice: 0,
        quantity: 0,
        minThreshold: 0,
        storageLocation: "",
      });
    }
  }, [product, open, form]);

  const onSubmit = (data: ProductFormValues) => {
    if (product) {
      updateProduct(product.id, data);
    } else {
      addProduct(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Arduino Uno" {...field} data-testid="input-product-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-product-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} data-testid={`select-item-${cat}`}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} data-testid="input-product-price" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} data-testid="input-product-quantity" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Threshold</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} data-testid="input-product-threshold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storageLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Shelf A-1" {...field} data-testid="input-product-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-modal">
                Cancel
              </Button>
              <Button type="submit" data-testid="button-save-product">
                {product ? "Save Changes" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}