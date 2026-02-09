import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Loader2 } from "lucide-react";
import { Link } from "wouter";

const loginSchema = z.object({
  username: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { login, register, isLoggingIn, isRegistering, user } = useAuth();
  
  // URL param parsing for tab selection could be added here, 
  // but for simplicity defaulting to login or getting from query param manually if needed
  const [activeTab, setActiveTab] = useState("login");

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md animate-in">
        <div className="text-center mb-8 space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold">Welcome to KONEX</h1>
          <p className="text-muted-foreground">Your digital identity starts here.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm 
              onSubmit={login} 
              isLoading={isLoggingIn} 
              onSuccess={() => setLocation("/dashboard")}
            />
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm 
              onSubmit={register} 
              isLoading={isRegistering} 
              onSuccess={() => setActiveTab("login")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading, onSuccess }: { 
  onSubmit: any, 
  isLoading: boolean,
  onSuccess: () => void 
}) {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const handleSubmit = (data: z.infer<typeof loginSchema>) => {
    onSubmit(data, {
      onSuccess: () => onSuccess()
    });
  };

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} className="bg-muted/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-muted/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-2" disabled={isLoading} data-testid="button-login">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-primary transition-opacity hover:opacity-70"
            data-testid="link-forgot-password"
          >
            Forgot your password?
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function RegisterForm({ onSubmit, isLoading, onSuccess }: { 
  onSubmit: any, 
  isLoading: boolean,
  onSuccess: () => void 
}) {
  const form = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = (data: z.infer<typeof insertUserSchema>) => {
    onSubmit(data, {
      onSuccess: () => onSuccess()
    });
  };

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Start building your professional presence</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} className="bg-muted/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-muted/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
