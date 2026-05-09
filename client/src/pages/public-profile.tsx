import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { usePublicProfile } from "@/hooks/use-profiles";
import { ProfilePreview } from "@/components/profile-preview";
import { ContactCard } from "@/components/contact-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadFormSchema } from "@shared/routes";
import { useSubmitLead } from "@/hooks/use-leads";
import { Share2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SiFacebook } from "react-icons/si";
import { z } from "zod";
import { ProfileModulesRenderer } from "@/components/profile-modules";
import { KonexLogo } from "@/components/konex/KonexLogo";
import { socialHandleToUrl } from "@/lib/social-utils";
import { getTheme, resolveCustomizations, buildThemeCssVars, fontFamilyFromStyle, type ThemeCustomizations } from "@/lib/themes";
import type { Profile, ProfileBranding, ProfileTextOverrides } from "@shared/schema";

const STORAGE_KEY_PREFIX = "konex_contact_";

/** Fire-and-forget profile event tracking. Never throws. */
function trackEvent(slug: string, eventType: string, metadata?: Record<string, string>) {
  fetch("/api/public/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, eventType, metadata }),
  }).catch(() => {});
}

/** Detect the event type from a click target href */
function eventTypeFromHref(href: string): string | null {
  if (href.startsWith("tel:")) return "call_click";
  if (href.startsWith("mailto:")) return "email_click";
  if (href.includes("wa.me") || href.includes("whatsapp")) return "whatsapp_click";
  if (href.includes("calendly") || href.includes("booking") || href.includes("cal.com")) return "booking_click";
  if (href.match(/linkedin|twitter|x\.com|facebook|instagram|tiktok|youtube|snapchat|github/)) return "social_click";
  if (href.startsWith("http") && !href.includes("konex")) return "website_click";
  return null;
}


export default function PublicProfile() {
  const [match, params] = useRoute("/u/:slug");
  const slug = params?.slug || "";
  const { data: profile, isLoading, error } = usePublicProfile(slug);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ whatsapp?: string } | null>(null);
  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSubmitted(false);
      setSubmittedData(null);
    }, 300);
  };

  const handleSuccess = (data: { whatsapp?: string }) => {
    setSubmittedData(data);
    setIsSubmitted(true);
    trackEvent(slug, "form_submit");
    if (data.whatsapp || data) {
      try { localStorage.setItem(`${STORAGE_KEY_PREFIX}${slug}`, JSON.stringify(data)); } catch (e) {}
    }
  };

  // Track page view once profile loads
  useEffect(() => {
    if (profile && slug) {
      const source = document.referrer
        ? document.referrer.includes("wa.me") ? "whatsapp"
          : document.referrer.includes("t.me") ? "telegram"
          : document.referrer.includes("linkedin") ? "linkedin"
          : document.referrer.includes("instagram") ? "instagram"
          : "referral"
        : "direct";
      trackEvent(slug, "view", { source });
    }
  }, [profile?.id]);

  // Event delegation: catch all contact/social link clicks inside the profile card
  function handleProfileAreaClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (!anchor || !anchor.href) return;
    const evType = eventTypeFromHref(anchor.href);
    if (evType) trackEvent(slug, evType);
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center py-8 px-4" data-testid="loading-skeleton">
      {/* Banner */}
      <Skeleton className="w-full max-w-sm h-36 rounded-xl bg-neutral-800" />
      {/* Avatar */}
      <Skeleton className="w-20 h-20 rounded-full bg-neutral-700 -mt-10 border-4 border-[#0d0d0d]" />
      {/* Name / title */}
      <div className="mt-3 flex flex-col items-center gap-2 w-full max-w-sm">
        <Skeleton className="h-5 w-40 rounded bg-neutral-800" />
        <Skeleton className="h-4 w-28 rounded bg-neutral-800" />
      </div>
      {/* Contact circles */}
      <div className="flex gap-4 mt-6">
        {[0,1,2].map(i => <Skeleton key={i} className="w-12 h-12 rounded-full bg-neutral-800" />)}
      </div>
      {/* Social tile grid */}
      <div className="grid grid-cols-4 gap-2 mt-6 w-full max-w-sm">
        {[0,1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-14 rounded-lg bg-neutral-800" />)}
      </div>
      {/* CTA button */}
      <Skeleton className="mt-6 h-12 w-full max-w-sm rounded-full bg-neutral-800" />
    </div>
  );
  if (!profile || error) return <div className="h-screen flex items-center justify-center text-muted-foreground" data-testid="text-profile-not-found">Profile not found</div>;

  const branding = (profile.branding as ProfileBranding) || {};
  const textOverrides = (profile.textOverrides as ProfileTextOverrides) || {};
  const ctaLabel = textOverrides.ctaLabel || "Exchange Contact";
  const subtitleText = textOverrides.subheadline || "Share your contact details instantly.";

  // Build all theme CSS variables from the shared utility (same logic as the appearance preview)
  const theme = getTheme(branding.selectedThemeId);
  const resolvedCust = resolveCustomizations(theme, branding.themeCustomizations as ThemeCustomizations);
  const brandStyle: Record<string, string> = {
    ...buildThemeCssVars(branding.selectedThemeId, branding.themeCustomizations as ThemeCustomizations),
  };
  // Direct background/color for the page wrapper itself.
  // Themes with tinted dark backgrounds (rose gold, personal brand, ocean) use a
  // neutral dark outer background so the accent colour doesn't radiate across the page.
  const NEUTRAL_BG_THEMES = new Set(["personal_brand", "rose_gold", "ocean"]);
  brandStyle["backgroundColor"] = NEUTRAL_BG_THEMES.has(theme.id)
    ? "#0d0d0d"
    : theme.tokens["--theme-bg"];
  brandStyle["color"] = theme.tokens["--theme-text-primary"];
  // Optional branding overrides
  if (branding.primaryColor) {
    brandStyle["--brand-primary"] = branding.primaryColor;
    brandStyle["--brand-primary-fg"] = "#ffffff";
  }
  if (branding.accentColor) {
    brandStyle["--brand-accent"] = branding.accentColor;
  }
  if (branding.fontFamily) {
    brandStyle.fontFamily = `"${branding.fontFamily}", system-ui, sans-serif`;
  } else if (resolvedCust.fontStyle) {
    brandStyle.fontFamily = fontFamilyFromStyle(resolvedCust.fontStyle);
  }

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
    <div className="min-h-screen flex flex-col items-center pb-10" style={brandStyle}>

      {/* Logo or KONEX Branding */}
      <div className="w-full flex justify-center pt-4 pb-2 px-4">
        <a href="/" className="flex items-center gap-2" data-testid="konex-branding-header">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-10 md:h-14 w-auto" />
          ) : (
            <KonexLogo height={40} />
          )}
        </a>
      </div>

      {/* Subtitle */}
      <div className="text-center mb-3 px-4">
        {textOverrides.headline && (
          <h1 className="text-xl font-bold mb-1" data-testid="text-hero-headline">{textOverrides.headline}</h1>
        )}
        <p className="text-muted-foreground text-sm md:text-base" data-testid="text-hero-subtitle">
          {subtitleText}
        </p>
      </div>

      {/* Profile Card — wrapped for link-click event delegation */}
      <div className="w-full px-4" onClick={handleProfileAreaClick}>
        <ProfilePreview
          profile={profile}
          layoutVariant={resolvedCust.layoutVariant}
          themeCustomizations={branding.themeCustomizations as ThemeCustomizations}
          themeId={branding.selectedThemeId}
          extraActions={
            <button
              className="w-full rounded-xl min-h-[48px] py-2 px-3 text-sm font-semibold shadow-lg flex items-center justify-center gap-1.5 leading-tight text-white"
              style={{ backgroundColor: branding.primaryColor || 'hsl(var(--primary))' }}
              onClick={() => { trackEvent(slug, "cta_click"); handleOpen(); }}
              data-testid="button-exchange-contact"
            >
              <Share2 className="h-4 w-4 shrink-0" />
              <span>{ctaLabel}</span>
            </button>
          }
        />
      </div>

      {/* Modules */}
      <div className="w-full px-4">
        <ProfileModulesRenderer profile={profile} brandColor={branding.primaryColor} />
      </div>

      {/* Order Konex Card CTA */}
      <div className="w-full max-w-md mt-4 px-4 rounded-2xl border border-border/40 bg-card px-6 py-5 text-center space-y-3 mx-4" data-testid="section-order-konex">
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

      {/* Lead Capture Dialog — single implementation for all screen sizes */}
      <Dialog open={isOpen} onOpenChange={(open) => open ? handleOpen() : handleClose()}>
        <DialogContent>
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

      {/* Footer Branding — desktop only */}
      <div className="fixed bottom-4 right-4 hidden md:flex items-center gap-2 text-xs text-muted-foreground/50">
        <KonexLogo height={18} className="opacity-50" />
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
