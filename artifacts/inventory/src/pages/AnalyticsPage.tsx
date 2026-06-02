import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { useInventory } from "@/context/InventoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Package, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { add, format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

const PIE_COLORS: Record<string, string> = {
  Microcontroller: "#22d3ee",
  Sensor: "#34d399",
  Motor: "#f59e0b",
  Breadboard: "#f97316",
  Wiring: "#a78bfa",
  Display: "#60a5fa",
  Other: "#94a3b8"
};

export default function AnalyticsPage() {
  const { activityLog, products } = useInventory();
  
  // Section A
  const adjustedLogs = useMemo(() => activityLog.filter(l => l.action === "adjusted"), [activityLog]);
  const totalAdjustments = adjustedLogs.length;

  const { mostActiveProduct, avgDailyAdjustments, mostActiveUser } = useMemo(() => {
    const productCounts = adjustedLogs.reduce((acc, log) => {
      acc[log.productName] = (acc[log.productName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostProduct = Object.keys(productCounts).reduce((a, b) => productCounts[a] > productCounts[b] ? a : b, "");

    const daysWithActivity = new Set(activityLog.map(l => format(new Date(l.timestamp), "yyyy-MM-dd"))).size;
    const avgDaily = daysWithActivity > 0 ? (totalAdjustments / daysWithActivity).toFixed(1) : "0.0";

    const userCounts = activityLog.reduce((acc, log) => {
      acc[log.performedBy] = (acc[log.performedBy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostUser = Object.keys(userCounts).reduce((a, b) => userCounts[a] > userCounts[b] ? a : b, "");

    return { mostActiveProduct: mostProduct, avgDailyAdjustments: avgDaily, mostActiveUser: mostUser };
  }, [adjustedLogs, activityLog, totalAdjustments]);

  // Section B
  const areaData = useMemo(() => {
    const thirtyDaysAgo = subDays(startOfDay(new Date()), 30);
    const recentLogs = activityLog.filter(l => new Date(l.timestamp) >= thirtyDaysAgo);
    
    const dailyDataMap = recentLogs.reduce((acc, log) => {
      const date = format(new Date(log.timestamp), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = { date, adjustments: 0, edits: 0, total: 0 };
      acc[date].total += 1;
      if (log.action === "adjusted") acc[date].adjustments += 1;
      if (log.action === "edited") acc[date].edits += 1;
      return acc;
    }, {} as Record<string, { date: string, adjustments: number, edits: number, total: number }>);

    const daysInterval = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
    return daysInterval.map(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      return dailyDataMap[dateStr] || { date: dateStr, adjustments: 0, edits: 0, total: 0 };
    });
  }, [activityLog]);

  // Section C Left
  const topAdjusted = useMemo(() => {
    const productCounts = adjustedLogs.reduce((acc, log) => {
      acc[log.productName] = (acc[log.productName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [adjustedLogs]);

  // Section C Right
  const pieData = useMemo(() => {
    const pieDataMap = adjustedLogs.reduce((acc, log) => {
      const product = products.find(p => p.id === log.productId);
      const cat = product ? product.category : "Other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(pieDataMap).map(([name, value]) => ({ name, value }));
  }, [adjustedLogs, products]);

  // Section D
  const reorderForecast = useMemo(() => {
    return products
      .filter(p => adjustedLogs.some(l => l.productId === p.id))
      .map(p => {
        const count = adjustedLogs.filter(l => l.productId === p.id).length;
        const avg = count / 30;
        const daysUntil = avg > 0 ? Math.floor((p.quantity - p.minThreshold) / avg) : null;
        const projDate = daysUntil !== null ? add(new Date(), { days: daysUntil }) : null;
        return { product: p, avg, daysUntil, projDate };
      })
      .sort((a, b) => {
        if (a.daysUntil === null) return 1;
        if (b.daysUntil === null) return -1;
        return a.daysUntil - b.daysUntil;
      });
  }, [products, adjustedLogs]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Analytics" }]} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usage Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Consumption trends and adjustment frequency across the inventory</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Adjustments" value={totalAdjustments} icon={<Activity className="h-4 w-4" />} />
          <StatCard title="Most Active Product" value={mostActiveProduct || "-"} icon={<Package className="h-4 w-4" />} />
          <StatCard title="Avg Daily Adjustments" value={avgDailyAdjustments} icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard title="Most Active User" value={mostActiveUser || "-"} icon={<Users className="h-4 w-4" />} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Adjustment Activity — Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAdj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEdits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tickFormatter={(val) => format(new Date(val), "MMM d")} tick={{ fill: "#64748b" }} interval={4} />
                  <YAxis tick={{ fill: "#64748b" }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(220 13% 12%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '6px', color: 'hsl(210 20% 92%)' }} labelFormatter={(val) => format(new Date(val), "MMM d, yyyy")} />
                  <Legend verticalAlign="bottom" height={36} />
                  <Area type="monotone" dataKey="adjustments" name="Adjustments" stroke="#22d3ee" fillOpacity={1} fill="url(#colorAdj)" />
                  <Area type="monotone" dataKey="edits" name="Edits" stroke="#a78bfa" fillOpacity={1} fill="url(#colorEdits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Adjusted Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topAdjusted} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <XAxis type="number" tick={{ fill: "#64748b" }} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(220 13% 12%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '6px', color: 'hsl(210 20% 92%)' }} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                    <Bar dataKey="count" name="Count" fill="#22d3ee" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || PIE_COLORS.Other} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(220 13% 12%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '6px', color: 'hsl(210 20% 92%)' }} itemStyle={{ color: 'hsl(210 20% 92%)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Consumption Rate & Reorder Forecast</CardTitle>
            <CardDescription>Based on quantity adjustment history. Estimates are projections only.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Qty</TableHead>
                  <TableHead className="text-right">Avg Daily Usage</TableHead>
                  <TableHead className="text-right">Days Until Reorder</TableHead>
                  <TableHead className="text-right">Projected Reorder Date</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reorderForecast.map((row) => (
                  <TableRow key={row.product.id}>
                    <TableCell className="font-medium">{row.product.name}</TableCell>
                    <TableCell>{row.product.category}</TableCell>
                    <TableCell className="text-right">{row.product.quantity}</TableCell>
                    <TableCell className="text-right">{row.avg.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{row.daysUntil !== null ? row.daysUntil : "-"}</TableCell>
                    <TableCell className="text-right">{row.projDate ? format(row.projDate, "MMM d, yyyy") : "-"}</TableCell>
                    <TableCell>
                      {row.daysUntil === null ? (
                        <Badge variant="secondary" className="text-muted-foreground bg-muted">NO DATA</Badge>
                      ) : row.daysUntil <= 7 ? (
                        <Badge variant="destructive">URGENT</Badge>
                      ) : row.daysUntil <= 21 ? (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white">SOON</Badge>
                      ) : (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">STABLE</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-4">* Projections based on adjustment frequency logged in the last 30 days. Actual usage may vary.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}