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
import { Loader2 } from "lucide-react";
import { z } from "zod";
import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1770323201397.jpeg";
import type { Profile } from "@shared/schema";

const STORAGE_KEY_PREFIX = "konex_contact_";

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

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center p-4 pt-6 pb-8">
      {/* KONEX Logo + Wordmark Header */}
      <a href="/" className="flex items-center gap-2 mb-6" data-testid="konex-branding-header">
        <img src={konexLogo} alt="KONEX" className="h-12 md:h-16 w-auto" />
      </a>

      {/* Profile Card */}
      <ProfilePreview profile={profile} onSaveContact={() => setIsOpen(true)} />

      {/* Dialog/Drawer for Lead Capture Form */}
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
      <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground/50">
        <img src={konexLogo} alt="KONEX" className="h-4 w-auto opacity-50" />
        <span>Powered by KONEX</span>
      </div>
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
