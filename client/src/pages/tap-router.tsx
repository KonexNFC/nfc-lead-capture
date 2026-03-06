import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CreditCard, Loader2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface TapResponse {
  status: string;
  cardCode: string;
  redirectTo?: string;
  profileSlug?: string;
}

export default function TapRouter({ cardCode }: { cardCode: string }) {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [tapData, setTapData] = useState<TapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTap() {
      try {
        const res = await fetch(`/api/tap/${cardCode}`);
        if (res.status === 404) {
          setTapData({ status: "not_found", cardCode });
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setError("Something went wrong. Please try again.");
          setLoading(false);
          return;
        }
        const data: TapResponse = await res.json();
        setTapData(data);

        if (data.status === "unassigned") {
          setLocation(`/activate/${data.cardCode}`);
          return;
        }

        if (data.status === "active" && data.redirectTo) {
          window.location.href = data.redirectTo;
          return;
        }

        setLoading(false);
      } catch {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    }
    fetchTap();
  }, [cardCode, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" data-testid="tap-loading">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Loading your card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Error</h1>
            <p className="text-muted-foreground" data-testid="text-error">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tapData?.status === "not_found") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Card Not Found</h1>
              <p className="text-muted-foreground">
                This KONEX card doesn't exist or has been removed.
              </p>
            </div>
            <Link href="/">
              <Button data-testid="link-home">Go to KONEX</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tapData?.status === "inactive") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Card Inactive</h1>
              <p className="text-muted-foreground">
                This card has been suspended. Please contact support if you believe this is an error.
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

  if (tapData?.status === "active" && !tapData.redirectTo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Card Not Linked</h1>
              <p className="text-muted-foreground">
                This card is active but not linked to a profile yet. The card owner can link it from their dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
