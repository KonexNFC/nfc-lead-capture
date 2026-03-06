import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, CreditCard, AlertTriangle } from "lucide-react";

type ActivationState = "idle" | "loading" | "success" | "error_forbidden" | "error_not_found" | "error_generic";

interface ActivationResult {
  hasProfile?: boolean;
  profileSlug?: string;
}

export default function ActivateCard({ cardCode }: { cardCode: string }) {
  const { user, isLoading: authLoading } = useAuth();
  const [activationState, setActivationState] = useState<ActivationState>("idle");
  const [activationResult, setActivationResult] = useState<ActivationResult>({});
  const [activated, setActivated] = useState(false);

  const activateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/cards/activate", { cardCode });
      return await res.json();
    },
    onSuccess: (data) => {
      setActivationState("success");
      setActivationResult({
        hasProfile: data.hasProfile,
        profileSlug: data.profileSlug,
      });
    },
    onError: (error: Error) => {
      const msg = error.message;
      if (msg.startsWith("403")) {
        setActivationState("error_forbidden");
      } else if (msg.startsWith("404")) {
        setActivationState("error_not_found");
      } else if (msg.includes("already")) {
        setActivationState("success");
      } else {
        setActivationState("error_generic");
      }
    },
  });

  useEffect(() => {
    if (user && !activated && !authLoading) {
      setActivated(true);
      setActivationState("loading");
      activateMutation.mutate();
    }
  }, [user, authLoading, activated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" data-testid="activate-loading">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Activate Your KONEX Card</h1>
              <p className="text-muted-foreground">
                Log in or sign up to activate your card and start sharing your profile.
              </p>
            </div>
            <Link href={`/auth?redirect=/activate/${cardCode}`}>
              <Button className="w-full" data-testid="button-login-to-activate">
                Log In or Sign Up
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activationState === "loading" || activateMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" data-testid="activate-processing">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Activating your card...</p>
        </div>
      </div>
    );
  }

  if (activationState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-activation-success">
                Your Konex card is now active
              </h1>
              <p className="text-muted-foreground">
                Your card is linked to your profile and ready to share.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/dashboard/cards">
                <Button className="w-full" data-testid="link-view-cards">
                  <CreditCard className="mr-2 h-4 w-4" />
                  View My Cards
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full" data-testid="link-dashboard">
                  Go to Dashboard
                </Button>
              </Link>
              {activationResult.hasProfile && activationResult.profileSlug && (
                <Link href={`/u/${activationResult.profileSlug}`}>
                  <Button variant="outline" className="w-full" data-testid="link-public-profile">
                    View Public Profile
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activationState === "error_forbidden") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Card Unavailable</h1>
              <p className="text-muted-foreground" data-testid="text-error-forbidden">
                This card belongs to another user. Contact support.
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" data-testid="link-dashboard-from-error">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activationState === "error_not_found") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Card Not Found</h1>
              <p className="text-muted-foreground" data-testid="text-error-not-found">
                This card doesn't exist or has been removed.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" data-testid="link-home">Go to KONEX</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activationState === "error_generic") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Activation Failed</h1>
              <p className="text-muted-foreground" data-testid="text-error-generic">
                Something went wrong. Please try again later.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" data-testid="link-home-error">Go to KONEX</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
