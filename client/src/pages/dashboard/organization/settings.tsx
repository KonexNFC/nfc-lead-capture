import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save, Upload, X, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useActiveOrg } from "@/hooks/use-active-org";

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

async function uploadFile(file: File): Promise<string> {
  const res = await apiRequest("POST", "/api/uploads/request-url", {
    name: file.name,
    size: file.size,
    contentType: file.type,
  });
  const { uploadURL, objectPath } = await res.json();

  await fetch(uploadURL, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  return objectPath;
}

export default function OrganizationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { activeOrg } = useActiveOrg();
  const org = activeOrg;

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
      setLogoUrl(orgDetail.logoUrl || null);
      setLogoPreview(orgDetail.logoUrl || null);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Logo must be under 5MB", variant: "destructive" });
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setLogoPreview(localPreview);

    setUploading(true);
    try {
      const path = await uploadFile(file);
      setLogoUrl(path);
      toast({ title: "Logo uploaded" });
    } catch (err) {
      setLogoPreview(orgDetail?.logoUrl || null);
      setLogoUrl(orgDetail?.logoUrl || null);
      toast({ title: "Upload failed", description: "Please try again", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
            <Label>Logo</Label>
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Organization logo"
                    className="h-full w-full object-cover"
                    data-testid="img-org-logo-preview"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
              {canEdit && (
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    data-testid="input-org-logo-file"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    data-testid="button-upload-logo"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </Button>
                  {logoPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      disabled={uploading}
                      className="text-destructive hover:text-destructive"
                      data-testid="button-remove-logo"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">PNG, JPG or SVG. Max 5MB.</p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Plan</Label>
            <div>
              <Badge variant="secondary" className="text-sm">{orgDetail?.planType}</Badge>
            </div>
          </div>
          {canEdit && (
            <Button
              onClick={() => updateMutation.mutate({ name: name.trim(), logoUrl })}
              disabled={updateMutation.isPending || uploading}
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
