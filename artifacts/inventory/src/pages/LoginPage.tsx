import { useState } from "react";
import { useInventory } from "@/context/InventoryContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useInventory();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email === "admin@potentialhub.com" && password === "admin123") {
      login(email, "admin", "Admin User");
      setLocation("/dashboard");
    } else if (email === "staff@potentialhub.com" && password === "staff123") {
      login(email, "staff", "Lab Staff");
      setLocation("/dashboard");
    } else {
      toast({
        title: "Authentication Failed",
        description: "Invalid credentials provided.",
        variant: "destructive",
      });
    }
  };

  const fillDemo = (type: "admin" | "staff") => {
    if (type === "admin") {
      setEmail("admin@potentialhub.com");
      setPassword("admin123");
    } else {
      setEmail("staff@potentialhub.com");
      setPassword("staff123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
      </div>

      <Card className="w-full max-w-md z-10 border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center border border-primary/20 mb-2">
            <Cpu className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">PIH System</CardTitle>
          <CardDescription className="text-muted-foreground">
            Potential Innovation Hub Inventory Management
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@potentialhub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50"
                data-testid="input-login-email"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50"
                data-testid="input-login-password"
                required
              />
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Demo Accounts</p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="text-xs h-auto py-2 flex flex-col items-center gap-1 border-primary/20 hover:border-primary/50 hover:bg-primary/5" 
                  onClick={() => fillDemo("admin")}
                  data-testid="button-demo-admin"
                >
                  <span className="font-semibold text-primary">Admin Role</span>
                  <span className="text-[10px] text-muted-foreground font-mono">admin@potentialhub.com</span>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="text-xs h-auto py-2 flex flex-col items-center gap-1 border-border hover:border-foreground/30 hover:bg-muted/50" 
                  onClick={() => fillDemo("staff")}
                  data-testid="button-demo-staff"
                >
                  <span className="font-semibold">Staff Role</span>
                  <span className="text-[10px] text-muted-foreground font-mono">staff@potentialhub.com</span>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" size="lg" data-testid="button-login-submit">
              Initialize Session
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}