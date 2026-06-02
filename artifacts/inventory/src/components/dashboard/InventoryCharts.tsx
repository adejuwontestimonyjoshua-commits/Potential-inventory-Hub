import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

const PIE_COLORS: Record<string, string> = {
  Microcontroller: "#22d3ee",
  Sensor: "#34d399",
  Motor: "#f59e0b",
  Breadboard: "#f97316",
  Wiring: "#a78bfa",
  Display: "#60a5fa",
  Other: "#94a3b8"
};

export function InventoryCharts() {
  const { products } = useInventory();

  const pieData = products.reduce((acc, product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += product.quantity;
    } else {
      acc.push({ name: product.category, value: product.quantity });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const barData = products
    .map(p => ({
      ...p,
      ratio: p.quantity / (p.minThreshold || 1)
    }))
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, 8)
    .map(p => ({
      name: p.name.length > 10 ? p.name.substring(0, 10) + "..." : p.name,
      "Current Qty": p.quantity,
      "Min Threshold": p.minThreshold
    }));

  return (
    <Card className="col-span-4 mt-6">
      <CardHeader>
        <CardTitle>Inventory Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[250px] w-full">
            <h3 className="text-sm font-medium text-muted-foreground text-center mb-2">Category Stock Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || PIE_COLORS.Other} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '0.375rem' }} 
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[250px] w-full">
            <h3 className="text-sm font-medium text-muted-foreground text-center mb-2">Quantity vs Threshold</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#1e293b" }} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#1e293b" }} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '0.375rem' }}
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                <Bar dataKey="Current Qty" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Min Threshold" fill="#ef4444" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
