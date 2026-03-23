import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type UpdateProfileRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Fetch my profile
export function useMyProfile() {
  return useQuery({
    queryKey: [api.profiles.getMine.path],
    queryFn: async () => {
      const res = await fetch(api.profiles.getMine.path);
      if (res.status === 404) return null; // No profile yet
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.getMine.responses[200].parse(await res.json());
    },
  });
}

// Update my profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const res = await fetch(api.profiles.updateMine.path, {
        method: api.profiles.updateMine.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) throw new Error("Validation failed");
        throw new Error("Failed to update profile");
      }
      return api.profiles.updateMine.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.profiles.getMine.path], data);
      queryClient.invalidateQueries({ queryKey: [api.profiles.getBySlug.path] }); // Invalidate public view
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Public profile fetch
export function usePublicProfile(slug: string) {
  return useQuery({
    queryKey: [api.profiles.getBySlug.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.profiles.getBySlug.path, { slug });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.getBySlug.responses[200].parse(await res.json());
    },
    enabled: !!slug,
    staleTime: 60_000,       // treat data as fresh for 60 s — no re-fetch on revisit
    gcTime: 5 * 60_000,      // keep in memory for 5 min
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Check slug availability
export function useCheckSlug() {
  return useMutation({
    mutationFn: async (slug: string) => {
      const url = buildUrl(api.profiles.checkSlug.path, { slug });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to check slug");
      return api.profiles.checkSlug.responses[200].parse(await res.json());
    },
  });
}
