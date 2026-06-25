import { createContext, useContext, useState, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unitPrice: number;
  storageLocation: string;
  lastUpdated: string;
  imageUrl?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  performedBy: string;
  productId: string;
  productName: string;
  timestamp: string;
}

export interface User {
  name: string;
  email: string;
  role: "admin" | "staff";
}

interface InventoryContextType {
  products: Product[];
  activityLog: ActivityLog[];
  currentUser: User | null;
  reorderStatus: Record<string, boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  addProduct: (product: Partial<Product>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustQuantity: (id: string, amount: number) => void;
  markReordered: (id: string, ordered: boolean) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export const InventoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadFromStorage<User | null>("pih_user", null)
  );

  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage<Product[]>("pih_products", [])
  );

  const [activityLog, setActivityLog] = useState<ActivityLog[]>(() =>
    loadFromStorage<ActivityLog[]>("pih_activityLog", [])
  );

  const [reorderStatus, setReorderStatus] = useState<Record<string, boolean>>(() =>
    loadFromStorage<Record<string, boolean>>("pih_reorderStatus", {})
  );

  // Persist to localStorage on every state change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("pih_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("pih_user");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("pih_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("pih_activityLog", JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
    localStorage.setItem("pih_reorderStatus", JSON.stringify(reorderStatus));
  }, [reorderStatus]);

  // --- Auth ---

  const login = async (email: string, password: string) => {
    if (email === "admin@potentialhub.com" && password === "Testimony") {
      setCurrentUser({ name: "Admin", email, role: "admin" });
    } else if (email === "staff@potentialhub.com" && password === "staff123") {
      setCurrentUser({ name: "Staff", email, role: "staff" });
    } else {
      throw new Error("Invalid email or password.");
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // --- Activity logging helper ---

  const logActivity = (
    action: string,
    productId: string,
    productName: string
  ) => {
    const entry: ActivityLog = {
      id: Date.now().toString(),
      action,
      performedBy: currentUser?.name ?? "System",
      productId,
      productName,
      timestamp: new Date().toISOString(),
    };
    setActivityLog((prev) => [entry, ...prev].slice(0, 100)); // keep last 100
  };

  // --- Product CRUD ---

  const addProduct = (product: Partial<Product>) => {
    const newProduct: Product = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: product.name ?? "Unnamed Product",
      category: product.category ?? "Uncategorized",
      quantity: product.quantity ?? 0,
      minThreshold: product.minThreshold ?? 5,
      unitPrice: product.unitPrice ?? 0,
      storageLocation: product.storageLocation ?? "",
      lastUpdated: new Date().toISOString(),
      imageUrl: product.imageUrl,
    };
    setProducts((prev) => [...prev, newProduct]);
    logActivity("Added product", newProduct.id, newProduct.name);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, lastUpdated: new Date().toISOString() }
          : p
      )
    );
    const product = products.find((p) => p.id === id);
    logActivity("Updated product", id, product?.name ?? id);
  };

  const deleteProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logActivity("Deleted product", id, product?.name ?? id);
  };

  const adjustQuantity = (id: string, amount: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              quantity: Math.max(0, p.quantity + amount),
              lastUpdated: new Date().toISOString(),
            }
          : p
      )
    );
    const product = products.find((p) => p.id === id);
    const direction = amount >= 0 ? `+${amount}` : `${amount}`;
    logActivity(`Adjusted quantity (${direction})`, id, product?.name ?? id);
  };

  const markReordered = (id: string, ordered: boolean) => {
    setReorderStatus((prev) => ({ ...prev, [id]: ordered }));
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        activityLog,
        currentUser,
        reorderStatus,
        login,
        logout,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustQuantity,
        markReordered,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return context;
};

// Currency formatter — use this everywhere prices are displayed
export const formatNaira = (value: number): string =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(value);