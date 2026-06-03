import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InventoryProvider, useInventory } from "@/context/InventoryContext";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import ReportsPage from "@/pages/ReportsPage";
import ReorderPage from "@/pages/ReorderPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import { CommandPalette } from "@/components/CommandPalette";
import { useEffect } from "react";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { currentUser } = useInventory();
  
  if (!currentUser) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
}

function RootRedirect() {
  const { currentUser } = useInventory();
  return <Redirect to={currentUser ? "/dashboard" : "/login"} />;
}

function Router() {
  const { currentUser } = useInventory();
  const [location] = useLocation();

  useEffect(() => {
    // Add dark class to html to enforce dark theme
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/products">
        <ProtectedRoute component={ProductsPage} />
      </Route>
      <Route path="/reorder">
        <ProtectedRoute component={ReorderPage} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={AnalyticsPage} />
      </Route>
      <Route path="/product/:id">
        {params => <ProtectedRoute component={ProductDetailPage} id={params.id} />}
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={ReportsPage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <InventoryProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
          <CommandPalette />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </InventoryProvider>
  );
}

export default App;
