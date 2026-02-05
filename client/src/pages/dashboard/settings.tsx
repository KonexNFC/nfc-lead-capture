import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/hooks/use-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Upload, ImageIcon, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { uploadFile, isUploading } = useUpload();

  const { data: bannerData, isLoading } = useQuery<{ value: string | null }>({
    queryKey: ['/api/public/settings/landing_banner'],
  });

  const updateBannerMutation = useMutation({
    mutationFn: async (value: string) => {
      const res = await apiRequest('PUT', '/api/settings/landing_banner', { value });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/public/settings/landing_banner'] });
      toast({ title: "Success", description: "Banner updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update banner", variant: "destructive" });
    },
  });

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await uploadFile(file);
        if (response) {
          updateBannerMutation.mutate(response.objectPath);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload banner image",
          variant: "destructive"
        });
      }
    }
  };

  const handleRemoveBanner = () => {
    updateBannerMutation.mutate('');
  };

  const bannerUrl = bannerData?.value;
  const displayUrl = bannerUrl ? (
    bannerUrl.startsWith('http') ? bannerUrl :
    bannerUrl.startsWith('/objects/') ? bannerUrl :
    `/objects/${bannerUrl}`
  ) : null;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold" data-testid="text-settings-title">Site Settings</h1>
        <p className="text-muted-foreground">Manage landing page and site-wide settings.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Landing Page Banner</CardTitle>
          <CardDescription>
            Upload a hero banner image that will display at the top of the landing page.
            Recommended size: 1920x400 pixels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img 
                src={displayUrl} 
                alt="Landing banner preview" 
                className="w-full h-48 object-cover"
                data-testid="img-banner-preview"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="relative"
                  disabled={isUploading}
                  data-testid="button-change-banner"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Change
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleBannerUpload}
                  />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveBanner}
                  disabled={updateBannerMutation.isPending}
                  data-testid="button-remove-banner"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">No banner image uploaded</p>
              <Button
                variant="outline"
                className="relative"
                disabled={isUploading}
                data-testid="button-upload-banner"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload Banner
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleBannerUpload}
                />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
