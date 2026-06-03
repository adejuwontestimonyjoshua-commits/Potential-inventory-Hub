import { useState, useEffect } from "react";
import { AlertTriangle, X, Bell, BellOff } from "lucide-react";
import { useInventory } from "@/context/InventoryContext";
import type { Product } from "@/context/InventoryContext";
import {
  checkLowStockItems,
  getAlertSeverity,
  sendBrowserNotification,
} from "@/utils/stockAlerts";

interface StockAlertsProps {
  onReorderClick?: (product: Product) => void;
}

export default function StockAlerts({ onReorderClick }: StockAlertsProps) {
  const { products } = useInventory();
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof window !== "undefined" && Notification.permission === "granted"
  );

  useEffect(() => {
    const items = checkLowStockItems(products);
    setLowStockItems(items);
    if (notificationsEnabled && items.length > 0) {
      items.forEach(sendBrowserNotification);
    }
  }, [products, notificationsEnabled]);

  const handleEnableNotifications = () => {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") setNotificationsEnabled(true);
    });
  };

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => setDismissed(false), 5000);
  };

  if (lowStockItems.length === 0 || dismissed) return null;

  const hasCritical = lowStockItems.some(
    (item) => getAlertSeverity(item) === "CRITICAL"
  );

  return (
    <div
      className={`rounded-lg border-l-4 p-4 ${
        hasCritical
          ? "bg-red-500/10 border-l-red-500 border border-red-500/30"
          : "bg-yellow-500/10 border-l-yellow-500 border border-yellow-500/30"
      }`}
      data-testid="banner-stock-alerts"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle
            className={`mt-0.5 shrink-0 ${hasCritical ? "text-red-500" : "text-yellow-500"}`}
            size={18}
          />

          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold mb-3 flex flex-wrap items-center gap-2 ${
                hasCritical ? "text-red-400" : "text-yellow-400"
              }`}
            >
              {lowStockItems.length} Item{lowStockItems.length > 1 ? "s" : ""}{" "}
              Below Threshold
              {hasCritical && (
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold tracking-wide">
                  CRITICAL
                </span>
              )}
            </h3>

            <div className="space-y-2 mb-3">
              {lowStockItems.map((item) => {
                const severity = getAlertSeverity(item);
                const percentage =
                  item.minThreshold > 0
                    ? Math.round((item.quantity / item.minThreshold) * 100)
                    : 0;

                return (
                  <div
                    key={item.id}
                    className={`text-sm p-3 rounded-lg flex justify-between items-center border ${
                      severity === "CRITICAL"
                        ? "bg-red-600/10 border-red-500/40"
                        : "bg-yellow-600/10 border-yellow-500/40"
                    }`}
                    data-testid={`alert-item-${item.id}`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p
                        className={`font-medium truncate ${
                          severity === "CRITICAL"
                            ? "text-red-300"
                            : "text-yellow-300"
                        }`}
                      >
                        {item.name}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1 space-y-1">
                        <p>
                          Current:{" "}
                          <span className="font-semibold text-foreground">
                            {item.quantity}
                          </span>{" "}
                          units · Minimum:{" "}
                          <span className="font-semibold text-foreground">
                            {item.minThreshold}
                          </span>
                        </p>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className={`h-full rounded-full transition-all ${
                              severity === "CRITICAL"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                            }}
                          />
                        </div>
                        <p>{percentage}% of minimum threshold</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onReorderClick?.(item)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        severity === "CRITICAL"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-yellow-600 hover:bg-yellow-700 text-white"
                      }`}
                      data-testid={`button-reorder-${item.id}`}
                    >
                      Reorder
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleEnableNotifications}
              disabled={notificationsEnabled}
              className={`text-xs px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                notificationsEnabled
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 cursor-default"
                  : "bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600/30"
              }`}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="h-3 w-3" /> Notifications On
                </>
              ) : (
                <>
                  <BellOff className="h-3 w-3" /> Enable Notifications
                </>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title="Dismiss for 5 seconds"
          data-testid="button-dismiss-alerts"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
