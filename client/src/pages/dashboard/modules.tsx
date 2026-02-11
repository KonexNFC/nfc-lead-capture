import { useEffect, useState } from "react";
import { useMyProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { useUpload } from "@/hooks/use-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  Upload,
  Zap,
  LayoutGrid,
  Play,
  CalendarDays,
  Star,
  SlidersHorizontal,
  Languages,
  MapPin,
  Link2,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type {
  ProfileModules,
  ProfileBranding,
  ProfileTextOverrides,
  ProfileTile,
  ProfileReview,
} from "@shared/schema";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const MODULE_DEFINITIONS = [
  { key: "smart-actions", label: "Smart Actions", icon: Zap },
  { key: "tiles", label: "Custom Tiles", icon: LayoutGrid },
  { key: "video", label: "Brand Video", icon: Play },
  { key: "booking", label: "Booking & Calendar", icon: CalendarDays },
  { key: "reviews", label: "Reviews & Reputation", icon: Star },
];

const DEFAULT_ORDER = MODULE_DEFINITIONS.map((m) => m.key);

export default function ModulesPage() {
  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateProfile();
  const { uploadFile, isUploading } = useUpload();
  const { toast } = useToast();

  const [modules, setModules] = useState<ProfileModules>({});
  const [branding, setBranding] = useState<ProfileBranding>({});
  const [textOverrides, setTextOverrides] = useState<ProfileTextOverrides>({});
  const [moduleOrder, setModuleOrder] = useState<string[]>(DEFAULT_ORDER);
  const [moduleEnabled, setModuleEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (profile) {
      const m = (profile.modules as ProfileModules) || {};
      setModules(m);
      setBranding((profile.branding as ProfileBranding) || {});
      setTextOverrides((profile.textOverrides as ProfileTextOverrides) || {});
      setModuleOrder(m.order && m.order.length > 0 ? m.order : DEFAULT_ORDER);
      const defaultEnabled: Record<string, boolean> = {};
      DEFAULT_ORDER.forEach((k) => { defaultEnabled[k] = true; });
      setModuleEnabled({ ...defaultEnabled, ...(m.enabled || {}) });
    }
  }, [profile]);

  const moveModule = (key: string, direction: "up" | "down") => {
    setModuleOrder((prev) => {
      const idx = prev.indexOf(key);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  const toggleModule = (key: string) => {
    setModuleEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validateModules = (): string[] => {
    const errors: string[] = [];
    const tiles = modules.tiles || [];
    tiles.forEach((tile, i) => {
      if (tile.title && !tile.url) errors.push(`Tile "${tile.title}" is missing a URL`);
      if (tile.url && !tile.title) errors.push(`Tile #${i + 1} is missing a title`);
    });
    const reviews = modules.reviews || [];
    reviews.forEach((review, i) => {
      if (!review.url) errors.push(`Review #${i + 1} is missing a URL`);
    });
    if (modules.videoUrl) {
      const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      if (!yt.test(modules.videoUrl)) errors.push("Video URL must be a valid YouTube link");
    }
    if (modules.bookingUrl && !modules.bookingUrl.includes(".")) {
      errors.push("Booking URL doesn't look like a valid link");
    }
    return errors;
  };

  const handleSave = () => {
    const errors = validateModules();
    if (errors.length > 0) {
      toast({
        title: "Please fix the following",
        description: errors.join(". "),
        variant: "destructive",
      });
      return;
    }
    const cleanedTiles = (modules.tiles || []).filter((t) => t.title || t.url);
    const cleanedReviews = (modules.reviews || []).filter((r) => r.url);
    updateMutation.mutate({
      modules: {
        ...modules,
        tiles: cleanedTiles,
        reviews: cleanedReviews,
        order: moduleOrder,
        enabled: moduleEnabled,
      },
      branding,
      textOverrides,
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (path: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await uploadFile(file);
        if (response) {
          onSuccess(response.objectPath);
          toast({ title: "Uploaded", description: "File uploaded successfully." });
        }
      } catch {
        toast({ title: "Error", description: "Upload failed.", variant: "destructive" });
      }
    }
  };

  const addTile = () => {
    const newTile: ProfileTile = { id: generateId(), title: "", url: "", type: "link" };
    setModules((m) => ({ ...m, tiles: [...(m.tiles || []), newTile] }));
  };

  const updateTile = (id: string, updates: Partial<ProfileTile>) => {
    setModules((m) => ({
      ...m,
      tiles: (m.tiles || []).map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const removeTile = (id: string) => {
    setModules((m) => ({ ...m, tiles: (m.tiles || []).filter((t) => t.id !== id) }));
  };

  const addReview = () => {
    const newReview: ProfileReview = { id: generateId(), platform: "google", url: "" };
    setModules((m) => ({ ...m, reviews: [...(m.reviews || []), newReview] }));
  };

  const updateReview = (id: string, updates: Partial<ProfileReview>) => {
    setModules((m) => ({
      ...m,
      reviews: (m.reviews || []).map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  };

  const removeReview = (id: string) => {
    setModules((m) => ({ ...m, reviews: (m.reviews || []).filter((r) => r.id !== id) }));
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" data-testid="loading-spinner" />
      </div>
    );

  if (!profile)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground" data-testid="text-no-profile">
          Please create a profile first from the Edit Profile page.
        </p>
      </div>
    );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-modules-title">
            Modules
          </h1>
          <p className="text-muted-foreground">
            Customize what appears on your public profile.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="shadow-lg"
          data-testid="button-save-modules"
        >
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Module Order & Visibility</CardTitle>
          <CardDescription>
            Drag modules up or down to reorder them. Toggle visibility for your public profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {moduleOrder.map((key, idx) => {
            const def = MODULE_DEFINITIONS.find((d) => d.key === key);
            if (!def) return null;
            const IconComp = def.icon;
            const isEnabled = moduleEnabled[key] !== false;
            return (
              <div
                key={key}
                className={`flex items-center gap-3 p-3 rounded-md border ${isEnabled ? "border-border/50" : "border-border/30 opacity-50"}`}
                data-testid={`module-order-${key}`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <IconComp className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="flex-1 text-sm font-medium">{def.label}</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={idx === 0}
                    onClick={() => moveModule(key, "up")}
                    data-testid={`button-move-up-${key}`}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={idx === moduleOrder.length - 1}
                    onClick={() => moveModule(key, "down")}
                    data-testid={`button-move-down-${key}`}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => toggleModule(key)}
                    data-testid={`switch-module-${key}`}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Accordion type="multiple" className="space-y-3" defaultValue={["smart-actions"]}>
        {/* Smart Actions */}
        <AccordionItem value="smart-actions" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline" data-testid="accordion-smart-actions">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold">Smart Actions</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <p className="text-sm text-muted-foreground">
              These are derived from your profile links. Edit your phone, email, WhatsApp, and
              address on the Edit Profile page. Add a physical address below for directions.
            </p>
            <div>
              <label className="text-sm font-medium">Address (for directions)</label>
              <Input
                placeholder="123 Main St, City, Country"
                value={modules.address || ""}
                onChange={(e) => setModules((m) => ({ ...m, address: e.target.value }))}
                data-testid="input-address"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Visitors can tap to open directions in their maps app.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Custom Tiles */}
        <AccordionItem value="tiles" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline" data-testid="accordion-tiles">
            <div className="flex items-center gap-3">
              <LayoutGrid className="h-5 w-5 text-primary" />
              <span className="font-semibold">Custom Tiles</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Add custom links, PDFs, menus, or any URL with a custom icon.
            </p>
            {(modules.tiles || []).map((tile) => (
              <Card key={tile.id} className="border-border/50">
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        placeholder="Price List"
                        value={tile.title}
                        onChange={(e) => updateTile(tile.id, { title: e.target.value })}
                        data-testid={`input-tile-title-${tile.id}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select
                        value={tile.type}
                        onValueChange={(v) => updateTile(tile.id, { type: v as ProfileTile["type"] })}
                      >
                        <SelectTrigger data-testid={`select-tile-type-${tile.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="menu">Menu</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <Input
                      placeholder="https://..."
                      value={tile.url}
                      onChange={(e) => updateTile(tile.id, { url: e.target.value })}
                      data-testid={`input-tile-url-${tile.id}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subtitle (optional)</label>
                    <Input
                      placeholder="Short description"
                      value={tile.subtitle || ""}
                      onChange={(e) => updateTile(tile.id, { subtitle: e.target.value })}
                      data-testid={`input-tile-subtitle-${tile.id}`}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeTile(tile.id)}
                      data-testid={`button-remove-tile-${tile.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addTile} data-testid="button-add-tile">
              <Plus className="h-4 w-4 mr-2" />
              Add Tile
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Brand Video */}
        <AccordionItem value="video" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline" data-testid="accordion-video">
            <div className="flex items-center gap-3">
              <Play className="h-5 w-5 text-primary" />
              <span className="font-semibold">Brand Video</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Embed a YouTube video on your profile page.
            </p>
            <div>
              <label className="text-sm font-medium">YouTube URL</label>
              <Input
                placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                value={modules.videoUrl || ""}
                onChange={(e) => setModules((m) => ({ ...m, videoUrl: e.target.value }))}
                data-testid="input-video-url"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Booking & Calendar */}
        <AccordionItem value="booking" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline" data-testid="accordion-booking">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span className="font-semibold">Booking & Calendar</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Add a booking link so visitors can schedule meetings on the spot.
            </p>
            <div>
              <label className="text-sm font-medium">Booking URL</label>
              <Input
                placeholder="https://calendly.com/your-name"
                value={modules.bookingUrl || ""}
                onChange={(e) => setModules((m) => ({ ...m, bookingUrl: e.target.value }))}
                data-testid="input-booking-url"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Button Label (optional)</label>
              <Input
                placeholder="Book a Meeting"
                value={modules.bookingLabel || ""}
                onChange={(e) => setModules((m) => ({ ...m, bookingLabel: e.target.value }))}
                data-testid="input-booking-label"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Reviews & Reputation */}
        <AccordionItem value="reviews" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline" data-testid="accordion-reviews">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <span className="font-semibold">Reviews & Reputation</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Add links to your review profiles so visitors can leave reviews easily.
            </p>
            {(modules.reviews || []).map((review) => (
              <Card key={review.id} className="border-border/50">
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Platform</label>
                      <Select
                        value={review.platform}
                        onValueChange={(v) => updateReview(review.id, { platform: v })}
                      >
                        <SelectTrigger data-testid={`select-review-platform-${review.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google Reviews</SelectItem>
                          <SelectItem value="trustpilot">Trustpilot</SelectItem>
                          <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                          <SelectItem value="yelp">Yelp</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Custom Label (optional)</label>
                      <Input
                        placeholder="Leave a review"
                        value={review.label || ""}
                        onChange={(e) => updateReview(review.id, { label: e.target.value })}
                        data-testid={`input-review-label-${review.id}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Review URL</label>
                    <Input
                      placeholder="https://g.page/your-business/review"
                      value={review.url}
                      onChange={(e) => updateReview(review.id, { url: e.target.value })}
                      data-testid={`input-review-url-${review.id}`}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeReview(review.id)}
                      data-testid={`button-remove-review-${review.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addReview} data-testid="button-add-review">
              <Plus className="h-4 w-4 mr-2" />
              Add Review Link
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Branding Controls */}
        <AccordionItem value="branding" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline" data-testid="accordion-branding">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <span className="font-semibold">Branding Controls</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Customize fonts, colours, logo, and hero image to match your brand.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Primary Colour</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.primaryColor || "#6366f1"}
                    onChange={(e) => setBranding((b) => ({ ...b, primaryColor: e.target.value }))}
                    className="h-9 w-12 rounded-md border cursor-pointer"
                    data-testid="input-primary-color"
                  />
                  <Input
                    value={branding.primaryColor || ""}
                    onChange={(e) => setBranding((b) => ({ ...b, primaryColor: e.target.value }))}
                    placeholder="#6366f1"
                    className="flex-1"
                    data-testid="input-primary-color-text"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Accent Colour</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.accentColor || "#8b5cf6"}
                    onChange={(e) => setBranding((b) => ({ ...b, accentColor: e.target.value }))}
                    className="h-9 w-12 rounded-md border cursor-pointer"
                    data-testid="input-accent-color"
                  />
                  <Input
                    value={branding.accentColor || ""}
                    onChange={(e) => setBranding((b) => ({ ...b, accentColor: e.target.value }))}
                    placeholder="#8b5cf6"
                    className="flex-1"
                    data-testid="input-accent-color-text"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Font Family</label>
              <Select
                value={branding.fontFamily || "default"}
                onValueChange={(v) =>
                  setBranding((b) => ({ ...b, fontFamily: v === "default" ? undefined : v }))
                }
              >
                <SelectTrigger data-testid="select-font-family">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (System)</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Logo</label>
              <div className="flex items-center gap-3">
                {branding.logoUrl && (
                  <img
                    src={
                      branding.logoUrl.startsWith("http")
                        ? branding.logoUrl
                        : `/objects/${branding.logoUrl}`
                    }
                    alt="Logo"
                    className="h-12 w-auto rounded-md border"
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="relative"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Logo
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, (path) => setBranding((b) => ({ ...b, logoUrl: path })))}
                    data-testid="input-upload-logo"
                  />
                </Button>
                {branding.logoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBranding((b) => ({ ...b, logoUrl: undefined }))}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Cover Banner</label>
              <p className="text-xs text-muted-foreground mb-2">
                This replaces the default gradient background behind your profile photo on the card.
              </p>
              <div className="flex items-center gap-3">
                {branding.coverUrl && (
                  <img
                    src={
                      branding.coverUrl.startsWith("http")
                        ? branding.coverUrl
                        : `/objects/${branding.coverUrl}`
                    }
                    alt="Cover Banner"
                    className="h-16 w-28 object-cover rounded-md border"
                    data-testid="img-cover-preview"
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="relative"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Cover
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, (path) => setBranding((b) => ({ ...b, coverUrl: path })))}
                    data-testid="input-upload-cover"
                  />
                </Button>
                {branding.coverUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBranding((b) => ({ ...b, coverUrl: undefined }))}
                    data-testid="button-remove-cover"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Hero Image</label>
              <div className="flex items-center gap-3">
                {branding.heroUrl && (
                  <img
                    src={
                      branding.heroUrl.startsWith("http")
                        ? branding.heroUrl
                        : `/objects/${branding.heroUrl}`
                    }
                    alt="Hero"
                    className="h-16 w-28 object-cover rounded-md border"
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="relative"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Hero Image
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, (path) => setBranding((b) => ({ ...b, heroUrl: path })))}
                    data-testid="input-upload-hero"
                  />
                </Button>
                {branding.heroUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBranding((b) => ({ ...b, heroUrl: undefined }))}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Hero Video URL (optional)</label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={branding.heroVideoUrl || ""}
                onChange={(e) => setBranding((b) => ({ ...b, heroVideoUrl: e.target.value }))}
                data-testid="input-hero-video-url"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Text Overrides / Multilingual */}
        <AccordionItem value="text" className="border rounded-md px-4">
          <AccordionTrigger className="hover:no-underline" data-testid="accordion-text">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-primary" />
              <span className="font-semibold">Text & Language</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Override the default text on your profile page. Great for non-English profiles.
            </p>
            <div>
              <label className="text-sm font-medium">Language / Locale</label>
              <Input
                placeholder="e.g. Arabic, French, Spanish"
                value={textOverrides.locale || ""}
                onChange={(e) => setTextOverrides((t) => ({ ...t, locale: e.target.value }))}
                data-testid="input-locale"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Custom Headline</label>
              <Input
                placeholder="Override the default headline"
                value={textOverrides.headline || ""}
                onChange={(e) => setTextOverrides((t) => ({ ...t, headline: e.target.value }))}
                data-testid="input-headline"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Custom Subheadline</label>
              <Input
                placeholder="Override the subtitle text"
                value={textOverrides.subheadline || ""}
                onChange={(e) => setTextOverrides((t) => ({ ...t, subheadline: e.target.value }))}
                data-testid="input-subheadline"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Exchange Contact Button Label</label>
              <Input
                placeholder="e.g. Share Info, Connect"
                value={textOverrides.ctaLabel || ""}
                onChange={(e) => setTextOverrides((t) => ({ ...t, ctaLabel: e.target.value }))}
                data-testid="input-cta-label"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bio Override</label>
              <Textarea
                placeholder="Override the bio text for this language"
                value={textOverrides.bioOverride || ""}
                onChange={(e) => setTextOverrides((t) => ({ ...t, bioOverride: e.target.value }))}
                className="resize-none"
                data-testid="input-bio-override"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end pt-4 pb-8 sticky bottom-4 z-10">
        <Button
          onClick={handleSave}
          size="lg"
          disabled={updateMutation.isPending}
          className="shadow-xl"
          data-testid="button-save-modules-bottom"
        >
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All Changes
        </Button>
      </div>
    </div>
  );
}
