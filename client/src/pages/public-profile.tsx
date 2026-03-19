import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { usePublicProfile } from "@/hooks/use-profiles";
import { ProfilePreview } from "@/components/profile-preview";
import { ContactCard } from "@/components/contact-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadFormSchema } from "@shared/routes";
import { useSubmitLead } from "@/hooks/use-leads";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Loader2, Share2 } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { z } from "zod";
import { ProfileModulesRenderer } from "@/components/profile-modules";
import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1770323201397.jpeg";
import { socialHandleToUrl } from "@/lib/social-utils";
import { getThemeStyle, getTheme, resolveCustomizations, fontFamilyFromStyle, cardRadiusPx, type ThemeCustomizations } from "@/lib/themes";
import type { Profile, ProfileBranding, ProfileTextOverrides } from "@shared/schema";

const STORAGE_KEY_PREFIX = "konex_contact_";

/** Convert a 6-digit hex color to the HSL triple Tailwind CSS variables expect (no hsl() wrapper). */
function hexToHslVar(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let hue = 0, sat = 0;
  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: hue = ((b - r) / d + 2) / 6; break;
      case b: hue = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(hue * 360)} ${Math.round(sat * 100)}% ${Math.round(l * 100)}%`;
}

export default function PublicProfile() {
  const [match, params] = useRoute("/u/:slug");
  const slug = params?.slug || "";
  const { data: profile, isLoading, error } = usePublicProfile(slug);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ whatsapp?: string } | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  

  const handleSuccess = (data: { whatsapp?: string }) => {
    setSubmittedData(data);
    setIsSubmitted(true);
    if (data.whatsapp || data) {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${slug}`, JSON.stringify(data));
      } catch (e) {}
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset after animation completes
    setTimeout(() => {
      setIsSubmitted(false);
      setSubmittedData(null);
    }, 300);
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loading-spinner" /></div>;
  if (!profile || error) return <div className="h-screen flex items-center justify-center text-muted-foreground" data-testid="text-profile-not-found">Profile not found</div>;

  const branding = (profile.branding as ProfileBranding) || {};
  const textOverrides = (profile.textOverrides as ProfileTextOverrides) || {};
  const ctaLabel = textOverrides.ctaLabel || "Exchange Contact";
  const subtitleText = textOverrides.subheadline || "Share your contact details instantly.";

  // Apply theme tokens first, then branding overrides on top, then published customizations
  const themeTokens = getThemeStyle(branding.selectedThemeId);
  const brandStyle: Record<string, string> = { ...themeTokens };
  if (branding.primaryColor) {
    brandStyle["--brand-primary"] = branding.primaryColor;
    brandStyle["--brand-primary-fg"] = "#ffffff";
  }
  if (branding.accentColor) {
    brandStyle["--brand-accent"] = branding.accentColor;
  }
  if (branding.fontFamily) {
    brandStyle.fontFamily = `"${branding.fontFamily}", system-ui, sans-serif`;
  }
  // Apply published theme customizations
  const theme = getTheme(branding.selectedThemeId);
  const resolvedCust = resolveCustomizations(theme, branding.themeCustomizations as ThemeCustomizations);
  if (resolvedCust.accentColor) {
    brandStyle["--theme-accent"] = resolvedCust.accentColor;
    brandStyle["--brand-primary"] = brandStyle["--brand-primary"] || resolvedCust.accentColor;
    brandStyle["--brand-accent"] = brandStyle["--brand-accent"] || resolvedCust.accentColor;
  }
  if (resolvedCust.cardRadius) {
    brandStyle["--theme-border-radius"] = cardRadiusPx(resolvedCust.cardRadius);
  }
  if (resolvedCust.fontStyle) {
    brandStyle["--theme-font-heading"] = fontFamilyFromStyle(resolvedCust.fontStyle);
    if (!branding.fontFamily) {
      brandStyle.fontFamily = fontFamilyFromStyle(resolvedCust.fontStyle);
    }
  }

  // ── Bridge hex theme tokens → Tailwind HSL CSS variables ─────────────────
  // Tailwind colors use `hsl(var(--primary) / alpha)` so variables must be
  // HSL triples without the hsl() wrapper (e.g. "217 73% 47%").
  // Without this bridge, ProfilePreview's Tailwind classes ignore theme tokens.
  const tt = theme.tokens;
  const finalAccent = resolvedCust.accentColor || tt["--theme-accent"];
  try {
    brandStyle["--background"]        = hexToHslVar(tt["--theme-surface"]);
    brandStyle["--card"]              = hexToHslVar(tt["--theme-surface"]);
    brandStyle["--card-foreground"]   = hexToHslVar(tt["--theme-text-primary"]);
    brandStyle["--foreground"]        = hexToHslVar(tt["--theme-text-primary"]);
    brandStyle["--muted-foreground"]  = hexToHslVar(tt["--theme-text-secondary"]);
    brandStyle["--primary"]           = hexToHslVar(finalAccent);
    brandStyle["--primary-foreground"]= "0 0% 100%";
    brandStyle["--accent"]            = hexToHslVar(finalAccent);
    brandStyle["--card-radius"]       = resolvedCust.cardRadius
      ? cardRadiusPx(resolvedCust.cardRadius)
      : tt["--theme-border-radius"];
  } catch {
    // hexToHslVar failed (e.g. non-hex token) — safe to skip; defaults remain
  }
  // Direct CSS properties for elements that don't use Tailwind color classes
  brandStyle["backgroundColor"] = tt["--theme-bg"];
  brandStyle["color"]           = tt["--theme-text-primary"];

  const FormContent = isSubmitted ? (
    <ContactCard 
      profile={profile}
      onClose={handleClose}
    />
  ) : (
    <LeadForm 
      slug={slug} 
      profileName={profile.name}
      onSuccess={handleSuccess} 
    />
  );

  const heroUrl = branding.heroUrl
    ? branding.heroUrl.startsWith("http") ? branding.heroUrl
      : branding.heroUrl.startsWith("/objects/") ? branding.heroUrl
      : `/objects/${branding.heroUrl}`
    : null;
  const logoUrl = branding.logoUrl
    ? branding.logoUrl.startsWith("http") ? branding.logoUrl
      : branding.logoUrl.startsWith("/objects/") ? branding.logoUrl
      : `/objects/${branding.logoUrl}`
    : null;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center p-4 pt-4 pb-24" style={brandStyle}>
      {/* Hero Banner */}
      {heroUrl && (
        <div className="w-full max-w-md rounded-md overflow-hidden mb-4 relative" data-testid="hero-banner">
          <img src={heroUrl} alt="Hero" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Logo or KONEX Branding */}
      <a href="/" className="flex items-center gap-2 mb-2" data-testid="konex-branding-header">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-10 md:h-14 w-auto" />
        ) : (
          <img src={konexLogo} alt="KONEX" className="h-10 md:h-14 w-auto" />
        )}
      </a>

      {/* Hero Section */}
      <div className="text-center mb-3">
        {textOverrides.headline && (
          <h1 className="text-xl font-bold mb-1" data-testid="text-hero-headline">{textOverrides.headline}</h1>
        )}
        <p className="text-muted-foreground text-sm md:text-base" data-testid="text-hero-subtitle">
          {subtitleText}
        </p>
      </div>

      {/* Profile Card */}
      <ProfilePreview 
        profile={profile} 
        extraActions={
          <button
            className="w-full rounded-xl min-h-[48px] py-2 px-3 text-sm font-semibold shadow-lg flex items-center justify-center gap-1.5 leading-tight text-white"
            style={{
              backgroundColor: branding.primaryColor || 'hsl(var(--primary))',
            }}
            onClick={() => setIsOpen(true)}
            data-testid="button-exchange-contact"
          >
            <Share2 className="h-4 w-4 shrink-0" />
            <span>{ctaLabel}</span>
          </button>
        }
      />


      {/* Modules */}
      <ProfileModulesRenderer profile={profile} brandColor={branding.primaryColor} />

      {/* Order Konex Card CTA */}
      <div className="w-full max-w-md mt-6 rounded-2xl border border-border/40 bg-card px-6 py-5 text-center space-y-3" data-testid="section-order-konex">
        <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Upgrade your networking</p>
        <p className="text-sm font-medium">Get your own Konex NFC card</p>
        <a
          href="https://konexnfc.com"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="link-order-konex"
        >
          <Button
            variant="outline"
            className="w-full rounded-xl min-h-[44px] text-sm font-semibold border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
            size="lg"
          >
            Order Your Konex Card
          </Button>
        </a>
      </div>

      {/* Lead Capture Dialog/Drawer */}
      {isDesktop ? (
        <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : handleClose()}>
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle data-testid="text-form-title">
                {isSubmitted ? "Contact Shared!" : `Share your info with ${profile.name}`}
              </DialogTitle>
              <DialogDescription data-testid="text-form-description">
                {isSubmitted ? "" : "Your details will be sent directly to them."}
              </DialogDescription>
            </DialogHeader>
            {FormContent}
            {!isSubmitted && (
              <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t" data-testid="text-trust-line">
                Powered by KONEX · Secure contact exchange
              </p>
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : handleClose()}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle data-testid="text-form-title">
                {isSubmitted ? "Contact Shared!" : `Share your info with ${profile.name}`}
              </DrawerTitle>
              <DrawerDescription data-testid="text-form-description">
                {isSubmitted ? "" : "Your details will be sent directly to them."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-8">
              {FormContent}
              {!isSubmitted && (
                <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t" data-testid="text-trust-line">
                  Powered by KONEX · Secure contact exchange
                </p>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Footer Branding */}
      <div className="fixed bottom-4 right-4 hidden md:flex items-center gap-2 text-xs text-muted-foreground/50">
        <img src={konexLogo} alt="KONEX" className="h-4 w-auto opacity-50" />
        <span>Powered by KONEX</span>
      </div>
    </div>
  );
}

function CTAIcons({ links }: { links: Record<string, string> }) {
  const facebook = links.facebook;

  if (!facebook) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6 flex-wrap" data-testid="cta-icons">
      {facebook && (
        <Button
          size="icon"
          variant="outline"
          className="text-white"
          style={{ backgroundColor: '#1877F2', borderColor: '#1877F2' }}
          asChild
          aria-label="Open Facebook"
          data-testid="cta-facebook"
        >
          <a href={socialHandleToUrl('facebook', facebook)} target="_blank" rel="noopener noreferrer">
            <SiFacebook className="h-5 w-5" />
          </a>
        </Button>
      )}
    </div>
  );
}

function LeadForm({ 
  slug, 
  profileName,
  onSuccess 
}: { 
  slug: string; 
  profileName: string;
  onSuccess: (data: { whatsapp?: string; name?: string; telephone?: string }) => void;
}) {
  const submitLead = useSubmitLead();
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const getSavedContact = (): { name?: string; telephone?: string; whatsapp?: string; email?: string; company?: string; note?: string } => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${slug}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {};
  };

  const savedContact = getSavedContact();
  
  const form = useForm<z.infer<typeof leadFormSchema>>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { 
      name: savedContact.name || "", 
      telephone: savedContact.telephone || "", 
      whatsapp: savedContact.whatsapp || "",
      email: savedContact.email || "", 
      company: savedContact.company || "", 
      note: savedContact.note || "" 
    }
  });

  // Watch telephone to sync with WhatsApp when checkbox is checked
  const telephoneValue = form.watch("telephone");

  useEffect(() => {
    if (sameAsPhone && telephoneValue) {
      form.setValue("whatsapp", telephoneValue);
    }
  }, [sameAsPhone, telephoneValue, form]);

  const onSubmit = (data: z.infer<typeof leadFormSchema>) => {
    setSubmitError(null);
    submitLead.mutate({ ...data, slug }, {
      onSuccess: () => {
        try {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${slug}`, JSON.stringify({
            name: data.name,
            telephone: data.telephone,
            whatsapp: data.whatsapp,
            email: data.email,
            company: data.company,
            note: data.note
          }));
        } catch (e) {}
        form.reset();
        onSuccess({ whatsapp: data.whatsapp, name: data.name, telephone: data.telephone });
      },
      onError: (error) => {
        setSubmitError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name - Required */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your full name" 
                  {...field} 
                  className="h-12 text-base"
                  data-testid="input-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Telephone - Required (at least one phone) */}
        <FormField
          control={form.control}
          name="telephone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telephone *</FormLabel>
              <FormControl>
                <Input 
                  type="tel"
                  inputMode="tel"
                  placeholder="+1 (555) 123-4567" 
                  {...field} 
                  className="h-12 text-base"
                  data-testid="input-telephone"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* WhatsApp with "Same as phone" checkbox */}
        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>WhatsApp</FormLabel>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="same-as-phone" 
                    checked={sameAsPhone}
                    onCheckedChange={(checked) => {
                      setSameAsPhone(checked === true);
                      if (checked && telephoneValue) {
                        form.setValue("whatsapp", telephoneValue);
                      }
                    }}
                    data-testid="checkbox-same-as-phone"
                  />
                  <label 
                    htmlFor="same-as-phone" 
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Same as phone
                  </label>
                </div>
              </div>
              <FormControl>
                <Input 
                  type="tel"
                  inputMode="tel"
                  placeholder="+1 (555) 123-4567" 
                  {...field} 
                  disabled={sameAsPhone}
                  className="h-12 text-base"
                  data-testid="input-whatsapp"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email - Optional */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  inputMode="email"
                  placeholder="you@company.com" 
                  {...field} 
                  className="h-12 text-base"
                  data-testid="input-email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company - Optional */}
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your organization" 
                  {...field} 
                  value={field.value || ''} 
                  className="h-12 text-base"
                  data-testid="input-company"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Error Message */}
        {submitError && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm" data-testid="text-error-message">
            {submitError}
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold" 
          disabled={submitLead.isPending}
          data-testid="button-submit-form"
        >
          {submitLead.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </form>
    </Form>
  );
}
