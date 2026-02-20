import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCheckSlug } from "@/hooks/use-profiles";
import { useActiveProfile } from "@/hooks/use-active-profile";
import { insertProfileSchema } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfilePreview } from "@/components/profile-preview";
import { Loader2, Plus, Trash2, Upload, Phone, MessageCircle, MessageSquare, AlertTriangle, Copy } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/use-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation, useSearch } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const profileFormSchema = insertProfileSchema.extend({
  links: z.record(z.string()).optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and dashes only")
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfile() {
  const { activeProfile: profile, isLoading, createProfile, updateProfile, deleteProfile, setActiveProfileId } = useActiveProfile();
  const checkSlugMutation = useCheckSlug();
  const { toast } = useToast();
  const { uploadFile, isUploading: isUploadingPhoto } = useUpload();
  const search = useSearch();
  const [, setLocation] = useLocation();
  const isNewMode = new URLSearchParams(search).get("new") === "1";
  const [creatingNew, setCreatingNew] = useState(isNewMode);

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
          phone: "",
          whatsapp: "",
          sms: "",
          email: "",
          linkedin: "",
          website: "",
          x: "",
          facebook: "",
          instagram: "",
          snapchat: "",
          tiktok: "",
          youtube: "",
        }
    }
  });

  useEffect(() => {
    if (isNewMode) {
      setCreatingNew(true);
    }
  }, [isNewMode]);

  useEffect(() => {
    if (profile && !creatingNew) {
      form.reset({
        name: profile.name,
        title: profile.title || "",
        company: profile.company || "",
        bio: profile.bio || "",
        photoUrl: profile.photoUrl || "",
        slug: profile.slug,
        links: (profile.links as Record<string, string>) || { phone: "", whatsapp: "", sms: "", email: "", linkedin: "", website: "", x: "", facebook: "", instagram: "", snapchat: "", tiktok: "", youtube: "" }
      });
    }
    if (creatingNew) {
      form.reset({
        name: "",
        title: "",
        company: "",
        bio: "",
        photoUrl: "",
        slug: "",
        links: { phone: "", whatsapp: "", sms: "", email: "", linkedin: "", website: "", x: "", facebook: "", instagram: "", snapchat: "", tiktok: "", youtube: "" }
      });
    }
  }, [profile, form, creatingNew]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await uploadFile(file);
        if (response) {
          form.setValue("photoUrl", response.objectPath);
          toast({
            title: "Success",
            description: "Photo uploaded successfully",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload photo. Please check your cloud budget.",
          variant: "destructive"
        });
      }
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (creatingNew || !profile) {
      const { available } = await checkSlugMutation.mutateAsync(data.slug);
      if (!available) {
        form.setError("slug", { message: "This URL is already taken" });
        return;
      }
      createProfile.mutate(data, {
        onSuccess: (newProfile) => {
          setActiveProfileId(newProfile.id);
          setCreatingNew(false);
          setLocation("/dashboard/edit");
        },
      });
      return;
    }

    if (data.slug !== profile.slug) {
      const { available } = await checkSlugMutation.mutateAsync(data.slug);
      if (!available) {
        form.setError("slug", { message: "This URL is already taken" });
        return;
      }
    }
    
    updateProfile.mutate({ profileId: profile.id, data });
  };

  const handleDeleteProfile = () => {
    if (!profile) return;
    deleteProfile.mutate(profile.id, {
      onSuccess: () => {
        setLocation("/dashboard");
      },
    });
  };

  // Watch for live preview
  const watchedValues = form.watch();

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold" data-testid="text-edit-title">
              {creatingNew ? "Create New Profile" : "Edit Profile"}
            </h1>
            <p className="text-muted-foreground">
              {creatingNew ? "Set up a new digital business card." : "Customize how you appear to others."}
            </p>
          </div>
          {!creatingNew && profile && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive" data-testid="button-delete-profile">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Profile
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this profile?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{profile.name}" and all its collected leads. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProfile}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-testid="button-confirm-delete-profile"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6 mb-4">
                  <Avatar className="h-20 w-20 border-2 border-primary/10">
                    <AvatarImage 
                      src={watchedValues.photoUrl ? (
                        watchedValues.photoUrl.startsWith('http') ? watchedValues.photoUrl :
                        watchedValues.photoUrl.startsWith('/objects/') ? watchedValues.photoUrl :
                        `/objects/${watchedValues.photoUrl}`
                      ) : undefined} 
                      className="object-cover" 
                    />
                    <AvatarFallback className="text-xl bg-secondary font-display font-bold text-primary">
                      {watchedValues.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <FormLabel>Profile Photo</FormLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="relative"
                        disabled={isUploadingPhoto}
                      >
                        {isUploadingPhoto ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload Image
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                      </Button>
                      {watchedValues.photoUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => form.setValue("photoUrl", "")}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">JPG, PNG or WebP. Max 5MB.</p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-name" />
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
                        <span className="bg-muted px-2 sm:px-3 py-2 border border-r-0 rounded-l-md text-muted-foreground text-xs sm:text-sm whitespace-nowrap shrink-0">konex.app/u/</span>
                        <FormControl>
                          <Input className="rounded-l-none min-w-0" placeholder="john-doe" {...field} data-testid="input-slug" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="links.phone"
                  render={({ field }) => (
                    <FormItem data-testid="field-phone">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" inputMode="tel" placeholder="+971 50 123 4567" {...field} value={field.value || ''} data-testid="input-phone" />
                      </FormControl>
                      <FormDescription>Used for Call and SMS actions on your card</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="links.whatsapp"
                  render={({ field }) => {
                    const phoneValue = form.watch("links.phone") || "";
                    const isSame = !!phoneValue && field.value === phoneValue;
                    return (
                      <FormItem data-testid="field-whatsapp">
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl>
                          <Input type="tel" inputMode="tel" placeholder="+971 50 123 4567" {...field} value={field.value || ''} data-testid="input-whatsapp" />
                        </FormControl>
                        <div className="flex items-center gap-2 pt-1">
                          <Checkbox
                            id="whatsapp-same"
                            checked={isSame}
                            disabled={!phoneValue}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? phoneValue : "");
                            }}
                            data-testid="checkbox-whatsapp-same"
                          />
                          <label htmlFor="whatsapp-same" className="text-sm text-muted-foreground cursor-pointer select-none">
                            Same as phone number
                          </label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="links.sms"
                  render={({ field }) => {
                    const phoneValue = form.watch("links.phone") || "";
                    const isSame = !!phoneValue && field.value === phoneValue;
                    return (
                      <FormItem data-testid="field-sms">
                        <FormLabel>SMS Number</FormLabel>
                        <FormControl>
                          <Input type="tel" inputMode="tel" placeholder="+971 50 123 4567" {...field} value={field.value || ''} data-testid="input-sms" />
                        </FormControl>
                        <div className="flex items-center gap-2 pt-1">
                          <Checkbox
                            id="sms-same"
                            checked={isSame}
                            disabled={!phoneValue}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? phoneValue : "");
                            }}
                            data-testid="checkbox-sms-same"
                          />
                          <label htmlFor="sms-same" className="text-sm text-muted-foreground cursor-pointer select-none">
                            Same as phone number
                          </label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="links.email"
                  render={({ field }) => (
                    <FormItem data-testid="field-email">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" inputMode="email" placeholder="you@company.com" {...field} value={field.value || ''} data-testid="input-email" />
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
                {['linkedin', 'website', 'x', 'facebook', 'instagram', 'snapchat', 'tiktok', 'youtube'].map((key) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`links.${key}`}
                    render={({ field }) => (
                      <FormItem data-testid={`field-link-${key}`}>
                        <FormLabel className="capitalize">{key}</FormLabel>
                        <FormControl>
                          <Input placeholder="Username or URL" {...field} value={field.value || ''} data-testid={`input-link-${key}`} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end sticky bottom-4 z-10">
              <Button type="submit" size="lg" className="shadow-xl" disabled={createProfile.isPending || updateProfile.isPending} data-testid="button-save-profile">
                {(createProfile.isPending || updateProfile.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {creatingNew ? "Create Profile" : "Save Changes"}
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
