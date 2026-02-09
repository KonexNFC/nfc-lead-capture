import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token");
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      await apiRequest("POST", "/api/reset-password", { token, password: data.password });
    },
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const handleSubmit = (data: z.infer<typeof resetPasswordSchema>) => {
    mutation.mutate({ password: data.password });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md animate-in">
          <Card className="border-border/50 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg" data-testid="text-invalid-link">Invalid Reset Link</h3>
                  <p className="text-sm text-muted-foreground">
                    This password reset link is invalid. Please request a new one.
                  </p>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => setLocation("/forgot-password")}
                  data-testid="button-request-new-link"
                >
                  Request New Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
          <h1 className="text-3xl font-display font-bold">Set New Password</h1>
          <p className="text-muted-foreground">Choose a new password for your account.</p>
        </div>

        {success ? (
          <Card className="border-border/50 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg" data-testid="text-password-reset-success">Password Reset</h3>
                  <p className="text-sm text-muted-foreground">
                    Your password has been updated successfully. You can now sign in with your new password.
                  </p>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => setLocation("/auth")}
                  data-testid="button-go-to-login"
                >
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>New Password</CardTitle>
              <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="bg-muted/50" data-testid="input-new-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="bg-muted/50" data-testid="input-confirm-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {mutation.isError && (
                    <div className="text-sm text-destructive flex items-center gap-2" data-testid="text-reset-error">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {mutation.error?.message?.includes("expired") 
                        ? "This reset link has expired. Please request a new one."
                        : "Something went wrong. Please try again."}
                    </div>
                  )}
                  <Button type="submit" className="w-full mt-2" disabled={mutation.isPending} data-testid="button-reset-password">
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Reset Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
