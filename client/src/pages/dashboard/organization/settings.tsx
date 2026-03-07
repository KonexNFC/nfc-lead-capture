import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OrgDetail {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  ownerUserId: number;
  planType: string;
  role: string;
  createdAt: string;
}

export default function OrganizationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const { data: orgs } = useQuery<{ id: number; role: string }[]>({ queryKey: ["/api/organizations"] });
  const org = orgs?.[0];

  const { data: orgDetail, isLoading } = useQuery<OrgDetail>({
    queryKey: ["/api/organizations", org?.id],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${org!.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch organization");
      return res.json();
    },
    enabled: !!org,
  });

  useEffect(() => {
    if (orgDetail) {
      setName(orgDetail.name);
      setLogoUrl(orgDetail.logoUrl || "");
    }
  }, [orgDetail]);

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; logoUrl?: string | null }) => {
      const res = await apiRequest("PATCH", `/api/organizations/${org!.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", org?.id] });
      toast({ title: "Settings saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const canEdit = org?.role === "owner" || org?.role === "admin";

  if (!org || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/organization">
          <Button variant="ghost" size="icon" data-testid="button-back-org">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-org-settings-title">Organization Settings</h1>
          <p className="text-muted-foreground">{orgDetail?.slug}</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit}
              data-testid="input-org-name"
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={orgDetail?.slug || ""} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Slug cannot be changed after creation</p>
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              disabled={!canEdit}
              data-testid="input-org-logo"
            />
          </div>
          <div className="space-y-2">
            <Label>Plan</Label>
            <div>
              <Badge variant="secondary" className="text-sm">{orgDetail?.planType}</Badge>
            </div>
          </div>
          {canEdit && (
            <Button
              onClick={() => updateMutation.mutate({ name: name.trim(), logoUrl: logoUrl.trim() || null })}
              disabled={updateMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Role</span>
            <Badge variant="outline">{orgDetail?.role}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{orgDetail?.createdAt ? new Date(orgDetail.createdAt).toLocaleDateString() : "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Organization ID</span>
            <span className="font-mono">{orgDetail?.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
