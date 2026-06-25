import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventory } from "@/context/InventoryContext";
import { formatDistanceToNow } from "date-fns";
import { PlusCircle, Edit, Trash2, MinusCircle } from "lucide-react";

export function ActivityFeed() {
  const { activityLog } = useInventory();

  const getIcon = (action: string) => {
    switch (action) {
      case "added": return <PlusCircle className="h-4 w-4 text-emerald-500" />;
      case "edited": return <Edit className="h-4 w-4 text-primary" />;
      case "deleted": return <Trash2 className="h-4 w-4 text-destructive" />;
      case "adjusted": return <MinusCircle className="h-4 w-4 text-amber-500" />;
      default: return null;
    }
  };

  const getActionText = (action: string) => {
    if (action === "adjusted") return "adjusted qty of";
    return action;
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="text-lg">System Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activityLog.slice(0, 8).map((log) => (
            <div key={log.id} className="flex items-start gap-4">
              <div className="mt-1 bg-muted p-1.5 rounded-full shrink-0">
                {getIcon(log.action)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium text-foreground">{log.performedBy}</span>
                  <span className="text-muted-foreground"> {getActionText(log.action)} </span>
                  <span className="font-medium text-foreground">{log.productName}</span>
                </p>
                <div className="flex items-center text-xs text-muted-foreground font-mono">
                  <span>{log.productName}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          ))}
          {activityLog.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
