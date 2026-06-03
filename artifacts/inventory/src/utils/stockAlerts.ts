import type { Product } from "@/context/InventoryContext";

export const checkLowStockItems = (products: Product[]): Product[] => {
  return products.filter((product) => product.quantity <= product.minThreshold);
};

export const sendBrowserNotification = (product: Product): void => {
  if (!("Notification" in window)) return;

  const send = () => {
    new Notification("⚠️ Low Stock Alert!", {
      body: `${product.name} has only ${product.quantity} units (minimum: ${product.minThreshold})`,
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='70' font-size='80' fill='%23ff6b6b'>!</text></svg>",
      tag: `alert-${product.id}`,
      requireInteraction: true,
    });
  };

  if (Notification.permission === "granted") {
    send();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") send();
    });
  }
};

export type AlertSeverity = "CRITICAL" | "LOW" | "HEALTHY";

export const getAlertSeverity = (product: Product): AlertSeverity => {
  if (product.minThreshold === 0) return "HEALTHY";
  const percentage = (product.quantity / product.minThreshold) * 100;
  if (percentage <= 50) return "CRITICAL";
  if (percentage <= 100) return "LOW";
  return "HEALTHY";
};
