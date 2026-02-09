import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CreditCard, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof forgotPasswordSchema>) => {
      await apiRequest("POST", "/api/forgot-password", data);
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (data: z.infer<typeof forgotPasswordSchema>) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md animate-in">
        <div className="text-center mb-8 space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold">Reset Password</h1>
          <p className="text-muted-foreground">We'll send you a link to reset your password.</p>
        </div>

        {submitted ? (
          <Card className="border-border/50 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg" data-testid="text-reset-sent">Check your email</h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-reset-description">
                    If an account with that email exists, we've sent a password reset link. Check your inbox and follow the instructions.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setLocation("/auth")}
                  data-testid="button-back-to-login"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>Enter the email address associated with your account</CardDescription>
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
                          <Input placeholder="you@example.com" {...field} className="bg-muted/50" data-testid="input-forgot-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-2" disabled={mutation.isPending} data-testid="button-send-reset">
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send Reset Link
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground transition-opacity hover:opacity-70"
                  onClick={() => setLocation("/auth")}
                  data-testid="link-back-to-login"
                >
                  <ArrowLeft className="inline h-3 w-3 mr-1" />
                  Back to Login
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
