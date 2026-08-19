import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, CreditCard, AlertTriangle, UserRoundPlus } from "lucide-react";

type ActivationState = "idle" | "input" | "loading" | "success" | "profile_required" | "error_conflict" | "error_forbidden" | "error_not_found" | "error_generic";

interface ActivationResult {
  hasProfile?: boolean;
  profileSlug?: string;
}

export default function ActivateCard({ cardCode: initialCardCode }: { cardCode?: string }) {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activationState, setActivationState] = useState<ActivationState>(initialCardCode ? "idle" : "input");
  const [activationResult, setActivationResult] = useState<ActivationResult>({});
  const [manualCode, setManualCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const activeCode = initialCardCode || manualCode.trim();

  const activateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/cards/activate", { cardCode: activeCode });
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
      if (msg.startsWith("409") && msg.includes("PROFILE_REQUIRED")) {
        setActivationState("profile_required");
      } else if (msg.startsWith("409")) {
        setActivationState("error_conflict");
      } else if (msg.startsWith("403")) {
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

  const handleManualActivate = () => {
    const code = manualCode.trim();
    if (!code) {
      setCodeError("Please enter your card code");
      return;
    }
    setCodeError("");
    setActivationState("loading");
    activateMutation.mutate();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" data-testid="activate-loading">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    const redirectPath = initialCardCode ? `/activate/${initialCardCode}` : "/activate";
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
                We recently had to restore card registrations. Your physical card is recognized, but its previous account and profile connection could not be recovered.
              </p>
              <p className="text-sm text-muted-foreground">
                Log in or create a new account to rebuild your profile and securely link this card to you again.
              </p>
            </div>
            <Link href={`/auth?redirect=${encodeURIComponent(redirectPath)}`}>
              <Button className="w-full" data-testid="button-login-to-activate">
                Log In or Sign Up
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activationState === "idle") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Let’s reconnect your card</h1>
              <p className="text-muted-foreground">
                We recently had to restore card registrations. This card is recognized, but it is no longer connected to a customer profile.
              </p>
              <p className="text-sm text-muted-foreground">
                We’ll check for your profile, help you create one if needed, and then link this card to it.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setActivationState("loading");
                activateMutation.mutate();
              }}
              data-testid="button-start-reactivation"
            >
              Reactivate My Card
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activationState === "input") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Activate Your Card</h1>
              <p className="text-muted-foreground">
                Enter the code printed on the back of your KONEX card to link it to your account.
              </p>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="e.g. KONEX-B-0001"
                value={manualCode}
                onChange={(e) => {
                  setManualCode(e.target.value.toUpperCase());
                  setCodeError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleManualActivate()}
                className="text-center text-lg tracking-wider font-mono"
                data-testid="input-card-code"
              />
              {codeError && (
                <p className="text-sm text-destructive text-center" data-testid="text-code-error">{codeError}</p>
              )}
              <Button
                className="w-full"
                onClick={handleManualActivate}
                disabled={activateMutation.isPending}
                data-testid="button-submit-card-code"
              >
                {activateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Activate Card
              </Button>
            </div>
            <div className="text-center">
              <Link href="/dashboard/cards">
                <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="link-back-to-cards">
                  Back to My Cards
                </Button>
              </Link>
            </div>
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

  if (activationState === "profile_required") {
    const createProfilePath = `/dashboard/edit?new=1&activate=${encodeURIComponent(activeCode)}`;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <UserRoundPlus className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Create your profile first</h1>
              <p className="text-muted-foreground">
                Your KONEX card needs a profile to share. Create one now, then we’ll bring you back here to finish linking it.
              </p>
            </div>
            <Link href={createProfilePath}>
              <Button className="w-full" data-testid="button-create-profile-for-activation">
                Create My Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activationState === "error_conflict") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Card Already Reactivated</h1>
              <p className="text-muted-foreground" data-testid="text-error-conflict">
                This card was linked to another account while you were reactivating it. If this is your card, please contact support.
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" data-testid="link-dashboard-from-conflict">Go to Dashboard</Button>
            </Link>
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
                This card code doesn't exist. Please check the code on the back of your card and try again.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => {
                if (initialCardCode) {
                  setLocation("/activate");
                } else {
                  setActivationState("input");
                  setManualCode("");
                }
              }} data-testid="button-try-again">
                Try Another Code
              </Button>
              <Link href="/dashboard/cards">
                <Button variant="ghost" data-testid="link-back-cards">Back to My Cards</Button>
              </Link>
            </div>
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
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => {
                setActivationState("loading");
                activateMutation.mutate();
              }} data-testid="button-try-again-error">
                Try Again
              </Button>
              <Link href="/">
                <Button variant="ghost" data-testid="link-home-error">Go to KONEX</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
