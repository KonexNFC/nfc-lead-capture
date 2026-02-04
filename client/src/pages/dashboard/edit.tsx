import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMyProfile, useUpdateProfile, useCheckSlug } from "@/hooks/use-profiles";
import { insertProfileSchema } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfilePreview } from "@/components/profile-preview";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema refinement for links jsonb validation
const profileFormSchema = insertProfileSchema.extend({
  links: z.record(z.string()).optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and dashes only")
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfile() {
  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateProfile();
  const checkSlugMutation = useCheckSlug();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      title: "",
      company: "",
      bio: "",
      photoUrl: "",
      slug: "",
        links: {
          email: "",
          linkedin: "",
          website: "",
          snapchat: "",
          tiktok: "",
          youtube: "",
        }
    }
  });

  // Load initial data
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        title: profile.title || "",
        company: profile.company || "",
        bio: profile.bio || "",
        photoUrl: profile.photoUrl || "",
        slug: profile.slug,
        links: (profile.links as Record<string, string>) || { email: "", linkedin: "", website: "", snapchat: "", tiktok: "", youtube: "" }
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    // Only check slug if changed
    if (data.slug !== profile?.slug) {
      const { available } = await checkSlugMutation.mutateAsync(data.slug);
      if (!available) {
        form.setError("slug", { message: "This URL is already taken" });
        return;
      }
    }
    
    updateMutation.mutate(data);
  };

  // Watch for live preview
  const watchedValues = form.watch();

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Edit Profile</h1>
          <p className="text-muted-foreground">Customize how you appear to others.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Photo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>Link to an image (Unsplash, etc.)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile URL</FormLabel>
                        <div className="flex items-center">
                          <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-muted-foreground text-sm">konex.app/u/</span>
                          <FormControl>
                            <Input className="rounded-l-none" placeholder="john-doe" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Product Manager" {...field} value={field.value || ''} />
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
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us a little about yourself..." className="resize-none" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Links & Socials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['email', 'linkedin', 'website', 'twitter', 'instagram', 'github', 'snapchat', 'tiktok', 'youtube'].map((key) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`links.${key}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">{key}</FormLabel>
                        <FormControl>
                          <Input placeholder={key === 'email' ? 'me@example.com' : 'username or url'} {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end sticky bottom-4 z-10">
              <Button type="submit" size="lg" className="shadow-xl" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Live Preview Sidebar */}
      <div className="hidden lg:block sticky top-8">
        <div className="mb-4 text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Preview</h3>
        </div>
        {/* Pass watched values blended with defaults to prevent crashes on partial data */}
        <ProfilePreview 
          profile={{
            ...profile,
            ...watchedValues,
            id: profile?.id || 0,
            userId: profile?.userId || 0,
            theme: profile?.theme || 'light',
            createdAt: profile?.createdAt || new Date(),
          } as any} 
          mock={false} 
        />
      </div>
    </div>
  );
}
