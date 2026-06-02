import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  minThreshold: number;
  storageLocation: string;
  imageUrl?: string;
  lastUpdated: string;
}

export interface ActivityLog {
  id: string;
  action: "added" | "edited" | "deleted" | "adjusted";
  productId: string;
  productName: string;
  timestamp: string;
  performedBy: string;
}

export type Role = "admin" | "staff" | null;

export interface User {
  email: string;
  role: Role;
  name: string;
}

interface InventoryContextType {
  products: Product[];
  activityLog: ActivityLog[];
  currentUser: User | null;
  reorderStatus: Record<string, boolean>;
  login: (email: string, role: Role, name: string) => void;
  logout: () => void;
  addProduct: (product: Omit<Product, "id" | "lastUpdated">) => void;
  updateProduct: (id: string, product: Partial<Omit<Product, "id" | "lastUpdated">>) => void;
  deleteProduct: (id: string) => void;
  adjustQuantity: (id: string, delta: number) => void;
  markReordered: (id: string, ordered: boolean) => void;
}

const seedProducts: Product[] = [
  { id: "PRD-001", name: "Arduino Uno", category: "Microcontroller", unitPrice: 8.50, quantity: 45, minThreshold: 10, storageLocation: "Shelf A-1", lastUpdated: new Date().toISOString() },
  { id: "PRD-002", name: "Arduino Nano", category: "Microcontroller", unitPrice: 6.00, quantity: 30, minThreshold: 10, storageLocation: "Shelf A-1", lastUpdated: new Date().toISOString() },
  { id: "PRD-003", name: "ESP32", category: "Microcontroller", unitPrice: 5.50, quantity: 60, minThreshold: 15, storageLocation: "Shelf A-2", lastUpdated: new Date().toISOString() },
  { id: "PRD-004", name: "ESP8266", category: "Microcontroller", unitPrice: 3.50, quantity: 8, minThreshold: 10, storageLocation: "Shelf A-2", lastUpdated: new Date().toISOString() },
  { id: "PRD-005", name: "AI Camera Module", category: "Sensor", unitPrice: 22.00, quantity: 12, minThreshold: 5, storageLocation: "Shelf B-1", lastUpdated: new Date().toISOString() },
  { id: "PRD-006", name: "Breadboard", category: "Breadboard", unitPrice: 2.50, quantity: 80, minThreshold: 20, storageLocation: "Shelf C-1", lastUpdated: new Date().toISOString() },
  { id: "PRD-007", name: "Mini Breadboard", category: "Breadboard", unitPrice: 1.50, quantity: 3, minThreshold: 15, storageLocation: "Shelf C-1", lastUpdated: new Date().toISOString() },
  { id: "PRD-008", name: "Vero Board", category: "Breadboard", unitPrice: 3.00, quantity: 25, minThreshold: 10, storageLocation: "Shelf C-2", lastUpdated: new Date().toISOString() },
  { id: "PRD-009", name: "Male-to-Male Jumper Wires", category: "Wiring", unitPrice: 1.20, quantity: 200, minThreshold: 50, storageLocation: "Shelf D-1", lastUpdated: new Date().toISOString() },
  { id: "PRD-010", name: "Male-to-Female Jumper Wires", category: "Wiring", unitPrice: 1.20, quantity: 150, minThreshold: 50, storageLocation: "Shelf D-1", lastUpdated: new Date().toISOString() },
  { id: "PRD-011", name: "Female-to-Female Jumper Wires", category: "Wiring", unitPrice: 1.20, quantity: 6, minThreshold: 50, storageLocation: "Shelf D-1", lastUpdated: new Date().toISOString() },
  { id: "PRD-012", name: "SG90 Servo Motor", category: "Motor", unitPrice: 4.00, quantity: 35, minThreshold: 10, storageLocation: "Shelf E-1", lastUpdated: new Date().toISOString() },
  { id: "PRD-013", name: "MG996R Servo Motor", category: "Motor", unitPrice: 9.00, quantity: 18, minThreshold: 5, storageLocation: "Shelf E-1", lastUpdated: new Date().toISOString() },
  { id: "PRD-014", name: "HC-SR04 Ultrasonic", category: "Sensor", unitPrice: 2.50, quantity: 22, minThreshold: 8, storageLocation: "Shelf B-2", lastUpdated: new Date().toISOString() },
  { id: "PRD-015", name: "DHT11 Sensor", category: "Sensor", unitPrice: 2.00, quantity: 4, minThreshold: 8, storageLocation: "Shelf B-2", lastUpdated: new Date().toISOString() },
  { id: "PRD-016", name: "PIR Motion Sensor", category: "Sensor", unitPrice: 3.50, quantity: 14, minThreshold: 5, storageLocation: "Shelf B-3", lastUpdated: new Date().toISOString() },
  { id: "PRD-017", name: "16x2 LCD Display", category: "Display", unitPrice: 5.50, quantity: 20, minThreshold: 5, storageLocation: "Shelf F-1", lastUpdated: new Date().toISOString() },
  { id: "PRD-018", name: "Relay Module", category: "Other", unitPrice: 3.00, quantity: 9, minThreshold: 8, storageLocation: "Shelf G-1", lastUpdated: new Date().toISOString() },
  { id: "PRD-019", name: "DC Motor", category: "Motor", unitPrice: 4.50, quantity: 30, minThreshold: 10, storageLocation: "Shelf E-2", lastUpdated: new Date().toISOString() },
  { id: "PRD-020", name: "L298N Motor Driver", category: "Other", unitPrice: 5.00, quantity: 11, minThreshold: 5, storageLocation: "Shelf G-2", lastUpdated: new Date().toISOString() }
];

const seedActivityLog: ActivityLog[] = [
  { id: "ACT-001", action: "added", productId: "PRD-001", productName: "Arduino Uno", timestamp: new Date(Date.now() - 10000000).toISOString(), performedBy: "Admin" },
  { id: "ACT-002", action: "added", productId: "PRD-002", productName: "Arduino Nano", timestamp: new Date(Date.now() - 9000000).toISOString(), performedBy: "Admin" },
  { id: "ACT-003", action: "added", productId: "PRD-003", productName: "ESP32", timestamp: new Date(Date.now() - 8000000).toISOString(), performedBy: "Admin" },
  { id: "ACT-004", action: "added", productId: "PRD-004", productName: "ESP8266", timestamp: new Date(Date.now() - 7000000).toISOString(), performedBy: "Admin" },
  { id: "ACT-005", action: "added", productId: "PRD-005", productName: "AI Camera Module", timestamp: new Date(Date.now() - 6000000).toISOString(), performedBy: "Admin" },
  { id: "ACT-006", action: "added", productId: "PRD-006", productName: "Breadboard", timestamp: new Date(Date.now() - 5000000).toISOString(), performedBy: "Admin" },
  { id: "ACT-007", action: "added", productId: "PRD-007", productName: "Mini Breadboard", timestamp: new Date(Date.now() - 4000000).toISOString(), performedBy: "Admin" },
  { id: "ACT-008", action: "added", productId: "PRD-008", productName: "Vero Board", timestamp: new Date(Date.now() - 3000000).toISOString(), performedBy: "Admin" },
];

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("inventory_products");
    return saved ? JSON.parse(saved) : seedProducts;
  });

  const [activityLog, setActivityLog] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem("inventory_activity");
    return saved ? JSON.parse(saved) : seedActivityLog;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("inventory_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [reorderStatus, setReorderStatus] = useState<Record<string, boolean>>(() => {
    const s = localStorage.getItem("inventory_reorder");
    return s ? JSON.parse(s) : {};
  });

  useEffect(() => {
    localStorage.setItem("inventory_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("inventory_activity", JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("inventory_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("inventory_user");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("inventory_reorder", JSON.stringify(reorderStatus));
  }, [reorderStatus]);

  const login = (email: string, role: Role, name: string) => {
    setCurrentUser({ email, role, name });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const logActivity = (action: ActivityLog["action"], productId: string, productName: string) => {
    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}`,
      action,
      productId,
      productName,
      timestamp: new Date().toISOString(),
      performedBy: currentUser?.name || "System"
    };
    setActivityLog(prev => [newLog, ...prev].slice(0, 50));
  };

  const addProduct = (product: Omit<Product, "id" | "lastUpdated">) => {
    const newProduct: Product = {
      ...product,
      id: `PRD-${Date.now().toString().slice(-4)}`,
      lastUpdated: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
    logActivity("added", newProduct.id, newProduct.name);
  };

  const updateProduct = (id: string, updates: Partial<Omit<Product, "id" | "lastUpdated">>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates, lastUpdated: new Date().toISOString() };
        logActivity("edited", p.id, updated.name);
        return updated;
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setProducts(prev => prev.filter(p => p.id !== id));
      logActivity("deleted", id, product.name);
    }
  };

  const adjustQuantity = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(0, p.quantity + delta);
        const updated = { ...p, quantity: newQty, lastUpdated: new Date().toISOString() };
        logActivity("adjusted", p.id, updated.name);
        return updated;
      }
      return p;
    }));
  };

  const markReordered = (id: string, ordered: boolean) => {
    setReorderStatus(prev => ({ ...prev, [id]: ordered }));
  };

  return (
    <InventoryContext.Provider value={{
      products, activityLog, currentUser, reorderStatus, login, logout, addProduct, updateProduct, deleteProduct, adjustQuantity, markReordered
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
