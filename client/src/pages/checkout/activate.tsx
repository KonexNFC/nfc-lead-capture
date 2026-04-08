import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2, CheckCircle2, User, Briefcase, Phone, Mail, Globe, FileText, Link as LinkIcon, Lock, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const activateSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(100),
  title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email("Enter a valid email").or(z.literal("")),
  website: z.string().url("Enter a valid URL (include https://)").or(z.literal("")),
  bio: z.string().max(500).optional(),
  slug: z
    .string()
    .min(2, "At least 2 characters")
    .max(50, "Max 50 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  shippingAddress: z.string().max(400).optional(),
});

type ActivateForm = z.infer<typeof activateSchema>;

export default function CheckoutActivatePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [done, setDone] = useState(false);
  const [profileSlug, setProfileSlug] = useState("");

  const token = new URLSearchParams(window.location.search).get("token") || "";

  const { data: tokenInfo, isLoading: tokenLoading, isError: tokenError } = useQuery({
    queryKey: ["/api/checkout/token-info", token],
    queryFn: async () => {
      const res = await fetch(`/api/checkout/token-info?token=${encodeURIComponent(token)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Invalid token");
      }
      return res.json();
    },
    enabled: !!token,
    retry: false,
  });

  const form = useForm<ActivateForm>({
    resolver: zodResolver(activateSchema),
    defaultValues: {
      displayName: (tokenInfo as any)?.customerName || "",
      email: (tokenInfo as any)?.customerEmail || "",
      title: "",
      company: "",
      phone: "",
      website: "",
      bio: "",
      slug: "",
      password: "",
      shippingAddress: "",
    },
  });

  // Pre-fill email/name once token info loads
  useEffect(() => {
    if (tokenInfo) {
      const info = tokenInfo as any;
      if (info.customerEmail && !form.getValues("email")) {
        form.setValue("email", info.customerEmail);
      }
      if (info.customerName && !form.getValues("displayName")) {
        form.setValue("displayName", info.customerName);
      }
    }
  }, [tokenInfo, form]);

  const activateMutation = useMutation({
    mutationFn: async (values: ActivateForm) => {
      const res = await apiRequest("POST", "/api/checkout/activate", { ...values, token });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Activation failed");
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      setProfileSlug(data.profileSlug);
      setDone(true);
    },
    onError: (err: any) => {
      toast({
        title: "Activation failed",
        description: err.message || "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  if (!token) {
    return <ErrorState message="No activation token found. Please check your link." />;
  }

  if (tokenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#13131A" }}>
        <Loader2 size={36} className="animate-spin" style={{ color: "#3B82F6" }} />
      </div>
    );
  }

  if (tokenError) {
    return (
      <ErrorState message="This activation link is invalid or has expired. Please contact support." />
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#13131A", color: "#fff" }}>
        <div className="max-w-md w-full text-center rounded-2xl p-10"
          style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <CheckCircle2 size={56} className="mx-auto mb-4" style={{ color: "#22c55e" }} />
          <h1 className="text-2xl font-bold mb-2">You're live!</h1>
          <p className="mb-6" style={{ color: "#9ca3af" }}>
            Your KONEX profile is published and ready to share.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`/u/${profileSlug}`}
              data-testid="link-view-profile"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: "#3B82F6", color: "#fff" }}
            >
              View My Profile
            </a>
            <a
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: "rgba(255,255,255,0.06)", color: "#d1d5db" }}
            >
              Sign In to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const info = tokenInfo as any;

  return (
    <div className="min-h-screen px-4 py-16" style={{ background: "#13131A", color: "#fff" }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ background: "rgba(34,197,94,0.15)", color: "#86efac", border: "1px solid rgba(34,197,94,0.3)" }}>
            <CheckCircle2 size={12} /> Payment Confirmed
          </div>
          <h1 className="text-2xl font-bold mb-2">Set up your profile</h1>
          <p style={{ color: "#9ca3af" }}>
            {info?.productName} — complete your details to activate your KONEX.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl p-6" style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => activateMutation.mutate(v))}
              className="space-y-4"
            >
              <FormField control={form.control} name="displayName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm" style={{ color: "#d1d5db" }}>
                    <User size={13} className="inline mr-1" /> Full Name *
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Alex Rivera" data-testid="input-displayName"
                      className="bg-transparent border rounded-lg text-white placeholder:text-gray-600"
                      style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm" style={{ color: "#d1d5db" }}>
                      <Briefcase size={13} className="inline mr-1" /> Job Title
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Product Designer" data-testid="input-title"
                        className="bg-transparent border rounded-lg text-white placeholder:text-gray-600"
                        style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="company" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm" style={{ color: "#d1d5db" }}>Company</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Acme Inc" data-testid="input-company"
                        className="bg-transparent border rounded-lg text-white placeholder:text-gray-600"
                        style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm" style={{ color: "#d1d5db" }}>
                    <Mail size={13} className="inline mr-1" /> Email *
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="you@example.com" data-testid="input-email"
                      className="bg-transparent border rounded-lg text-white placeholder:text-gray-600"
                      style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm" style={{ color: "#d1d5db" }}>
                      <Phone size={13} className="inline mr-1" /> Phone
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+44 7700 900000" data-testid="input-phone"
                        className="bg-transparent border rounded-lg text-white placeholder:text-gray-600"
                        style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="website" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm" style={{ color: "#d1d5db" }}>
                      <Globe size={13} className="inline mr-1" /> Website
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://yoursite.com" data-testid="input-website"
                        className="bg-transparent border rounded-lg text-white placeholder:text-gray-600"
                        style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm" style={{ color: "#d1d5db" }}>
                    <FileText size={13} className="inline mr-1" /> Bio
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="A short intro about yourself..." rows={3}
                      data-testid="input-bio"
                      className="bg-transparent border rounded-lg text-white placeholder:text-gray-600 resize-none"
                      style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm" style={{ color: "#d1d5db" }}>
                    <LinkIcon size={13} className="inline mr-1" /> Profile URL *
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center rounded-lg overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                      <span className="px-3 py-2 text-sm shrink-0" style={{ background: "#22222E", color: "#6b7280" }}>
                        konexnfc.com/u/
                      </span>
                      <Input
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="your-name"
                        data-testid="input-slug"
                        className="border-0 bg-transparent text-white placeholder:text-gray-600 rounded-none"
                      />
                    </div>
                  </FormControl>
                  <FormDescription style={{ color: "#4b5563", fontSize: "0.75rem" }}>
                    Lowercase letters, numbers and hyphens only
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm" style={{ color: "#d1d5db" }}>
                    <Lock size={13} className="inline mr-1" /> Password *
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Min 8 characters" data-testid="input-password"
                      className="bg-transparent border rounded-lg text-white placeholder:text-gray-600"
                      style={{ borderColor: "rgba(255,255,255,0.12)" }} />
                  </FormControl>
                  <FormDescription style={{ color: "#4b5563", fontSize: "0.75rem" }}>
                    Used to log in to your dashboard later
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Shipping address — shown only for physical card orders */}
              {info?.productType === "physical_card" && (
                <FormField control={form.control} name="shippingAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm" style={{ color: "#d1d5db" }}>
                      <MapPin size={13} className="inline mr-1" /> Shipping Address *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={"12 Example Street\nLondon\nEC1A 1BB\nUnited Kingdom"}
                        rows={4}
                        data-testid="input-shippingAddress"
                        className="bg-transparent border rounded-lg text-white placeholder:text-gray-600 resize-none"
                        style={{ borderColor: "rgba(255,255,255,0.12)" }}
                      />
                    </FormControl>
                    <FormDescription style={{ color: "#4b5563", fontSize: "0.75rem" }}>
                      We'll ship your NFC card to this address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <Button
                type="submit"
                data-testid="button-activate"
                disabled={activateMutation.isPending}
                className="w-full py-3 font-bold rounded-xl"
                style={{ background: "#3B82F6", color: "#fff" }}
              >
                {activateMutation.isPending ? (
                  <><Loader2 size={16} className="animate-spin mr-2" /> Activating…</>
                ) : (
                  "Activate My Profile"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#13131A", color: "#fff" }}>
      <div className="max-w-md w-full text-center rounded-2xl p-10"
        style={{ background: "#1E1E28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <h1 className="text-xl font-bold mb-3">Link Invalid</h1>
        <p className="mb-6" style={{ color: "#9ca3af" }}>{message}</p>
        <a href="/checkout" className="inline-block px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ background: "#3B82F6", color: "#fff" }}>
          Start Over
        </a>
      </div>
    </div>
  );
}
