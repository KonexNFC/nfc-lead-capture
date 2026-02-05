import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { usePublicProfile } from "@/hooks/use-profiles";
import { ProfilePreview } from "@/components/profile-preview";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema } from "@shared/routes";
import { useSubmitLead } from "@/hooks/use-leads";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Loader2, Share2, CreditCard } from "lucide-react";
import { z } from "zod";

export default function PublicProfile() {
  const [match, params] = useRoute("/u/:slug");
  const slug = params?.slug || "";
  const { data: profile, isLoading, error } = usePublicProfile(slug);
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!profile || error) return <div className="h-screen flex items-center justify-center text-muted-foreground">Profile not found</div>;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
      {/* Header Branding (Mobile) */}
      <div className="flex md:hidden items-center gap-2 mb-8 text-muted-foreground/40 font-display font-bold tracking-widest text-xs uppercase">
        <CreditCard className="h-4 w-4" />
        <span>KONEX</span>
      </div>

      {/* Profile Card */}
      <ProfilePreview profile={profile} />

      {/* Floating Action Button for Lead Capture */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        {isDesktop ? (
           <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button size="lg" className="rounded-full shadow-2xl px-8 h-14 text-base font-semibold animate-in slide-in-from-bottom-4" onClick={() => setIsOpen(true)}>
              <Share2 className="mr-2 h-5 w-5" />
              Exchange Contact
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share your info with {profile.name}</DialogTitle>
                <DialogDescription>Your details will be sent directly to them.</DialogDescription>
              </DialogHeader>
              <LeadForm slug={slug} onSuccess={() => setIsOpen(false)} />
            </DialogContent>
           </Dialog>
        ) : (
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
              <Button size="lg" className="rounded-full shadow-2xl px-8 h-14 text-base font-semibold animate-in slide-in-from-bottom-4">
                <Share2 className="mr-2 h-5 w-5" />
                Exchange Contact
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Share your info with {profile.name}</DrawerTitle>
                <DrawerDescription>Your details will be sent directly to them.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-8">
                <LeadForm slug={slug} onSuccess={() => setIsOpen(false)} />
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-4 right-4 hidden md:flex items-center gap-2 text-xs text-muted-foreground/50">
        <CreditCard className="h-3 w-3" />
        <span>Powered by KONEX</span>
      </div>
    </div>
  );
}

function LeadForm({ slug, onSuccess }: { slug: string, onSuccess: () => void }) {
  const submitLead = useSubmitLead();
  
  const form = useForm<z.infer<typeof insertLeadSchema>>({
    resolver: zodResolver(insertLeadSchema),
    defaultValues: { name: "", email: "", company: "", note: "" }
  });

  const onSubmit = (data: z.infer<typeof insertLeadSchema>) => {
    submitLead.mutate({ ...data, slug }, {
      onSuccess: () => {
        form.reset();
        onSuccess();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Your organization" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Nice meeting you!" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={submitLead.isPending}>
          {submitLead.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Info
        </Button>
      </form>
    </Form>
  );
}
