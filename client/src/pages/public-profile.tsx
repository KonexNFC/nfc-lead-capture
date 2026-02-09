import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { usePublicProfile } from "@/hooks/use-profiles";
import { ProfilePreview } from "@/components/profile-preview";
import { ContactCard } from "@/components/contact-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadFormSchema } from "@shared/routes";
import { useSubmitLead } from "@/hooks/use-leads";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Loader2, Share2, UserPlus } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { z } from "zod";
import { ProfileModulesRenderer } from "@/components/profile-modules";
import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1770323201397.jpeg";
import type { Profile, ProfileBranding, ProfileTextOverrides } from "@shared/schema";

const STORAGE_KEY_PREFIX = "konex_contact_";

export default function PublicProfile() {
  const [match, params] = useRoute("/u/:slug");
  const slug = params?.slug || "";
  const { data: profile, isLoading, error } = usePublicProfile(slug);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ whatsapp?: string } | null>(null);
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
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

  const brandStyle: Record<string, string> = {};
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
    ? branding.heroUrl.startsWith("http") ? branding.heroUrl : `/objects/${branding.heroUrl}`
    : null;
  const logoUrl = branding.logoUrl
    ? branding.logoUrl.startsWith("http") ? branding.logoUrl : `/objects/${branding.logoUrl}`
    : null;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center p-4 pt-6 pb-24" style={brandStyle}>
      {/* Hero Banner */}
      {heroUrl && (
        <div className="w-full max-w-md rounded-md overflow-hidden mb-6 relative" data-testid="hero-banner">
          <img src={heroUrl} alt="Hero" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Logo or KONEX Branding */}
      <a href="/" className="flex items-center gap-2 mb-6" data-testid="konex-branding-header">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-12 md:h-16 w-auto" />
        ) : (
          <img src={konexLogo} alt="KONEX" className="h-12 md:h-16 w-auto" />
        )}
      </a>

      {/* Hero Section */}
      <div className="text-center mb-6">
        {textOverrides.headline && (
          <h1 className="text-xl font-bold mb-1" data-testid="text-hero-headline">{textOverrides.headline}</h1>
        )}
        <p className="text-muted-foreground text-sm md:text-base" data-testid="text-hero-subtitle">
          {subtitleText}
        </p>
      </div>

      {/* Profile Card */}
      <ProfilePreview profile={profile} onSaveContact={() => setIsContactSheetOpen(true)} />

      {/* CTA Icons */}
      <CTAIcons links={(profile.links as Record<string, string>) || {}} />

      {/* Modules */}
      <ProfileModulesRenderer profile={profile} brandColor={branding.primaryColor} />

      {/* Contact Save Sheet */}
      {isDesktop ? (
        <Dialog open={isContactSheetOpen} onOpenChange={setIsContactSheetOpen}>
          <DialogContent className="max-w-md sm:max-w-lg p-6">
            <DialogHeader>
              <DialogTitle data-testid="text-contact-sheet-title">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Save Contact
                </div>
              </DialogTitle>
              <DialogDescription>
                Preview and save {profile.name}'s contact details to your device.
              </DialogDescription>
            </DialogHeader>
            <ContactCard profile={profile} showSuccessBanner={false} onClose={() => setIsContactSheetOpen(false)} />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isContactSheetOpen} onOpenChange={setIsContactSheetOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle data-testid="text-contact-sheet-title">
                <div className="flex items-center gap-2 justify-center">
                  <UserPlus className="h-5 w-5" />
                  Save Contact
                </div>
              </DrawerTitle>
              <DrawerDescription className="text-center">
                Preview and save {profile.name}'s contact details.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-8">
              <ContactCard profile={profile} showSuccessBanner={false} onClose={() => setIsContactSheetOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Floating Action Button for Lead Capture */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        {isDesktop ? (
           <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : handleClose()}>
            <Button 
              size="lg" 
              className="rounded-full shadow-2xl px-8 h-14 text-base font-semibold animate-in slide-in-from-bottom-4" 
              style={branding.primaryColor ? { backgroundColor: branding.primaryColor, color: "#fff", borderColor: branding.primaryColor } : undefined}
              onClick={() => setIsOpen(true)}
              data-testid="button-exchange-contact"
            >
              <Share2 className="mr-2 h-5 w-5" />
              {ctaLabel}
            </Button>
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
            <DrawerTrigger asChild>
              <Button 
                size="lg" 
                className="rounded-full shadow-2xl px-8 h-14 text-base font-semibold animate-in slide-in-from-bottom-4"
                style={branding.primaryColor ? { backgroundColor: branding.primaryColor, color: "#fff", borderColor: branding.primaryColor } : undefined}
                data-testid="button-exchange-contact"
              >
                <Share2 className="mr-2 h-5 w-5" />
                {ctaLabel}
              </Button>
            </DrawerTrigger>
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
      </div>

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
          <a href={facebook.startsWith('http') ? facebook : `https://${facebook}`} target="_blank" rel="noopener noreferrer">
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
