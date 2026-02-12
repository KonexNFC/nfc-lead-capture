import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@shared/schema";
import type { UpdateProfileRequest } from "@shared/routes";

interface ActiveProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  activeProfileId: number | null;
  setActiveProfileId: (id: number) => void;
  isLoading: boolean;
  createProfile: ReturnType<typeof useCreateProfileMutation>;
  updateProfile: ReturnType<typeof useUpdateActiveProfileMutation>;
  deleteProfile: ReturnType<typeof useDeleteProfileMutation>;
}

const ActiveProfileContext = createContext<ActiveProfileContextType | null>(null);

function useCreateProfileMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const res = await apiRequest("POST", "/api/profiles", data);
      return await res.json() as Profile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({ title: "Profile Created", description: `"${data.name}" has been created.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

function useUpdateActiveProfileMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ profileId, data }: { profileId: number; data: UpdateProfileRequest }) => {
      const res = await apiRequest("PUT", `/api/profiles/${profileId}`, data);
      return await res.json() as Profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    },
  });
}

function useDeleteProfileMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (profileId: number) => {
      await apiRequest("DELETE", `/api/profiles/${profileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({ title: "Profile Deleted", description: "The profile has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function ActiveProfileProvider({ children }: { children: React.ReactNode }) {
  const [activeProfileId, setActiveProfileIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem("konex_active_profile_id");
    return stored ? parseInt(stored) : null;
  });

  const { data: profiles = [], isLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
    queryFn: async () => {
      const res = await fetch("/api/profiles");
      if (!res.ok) return [];
      return await res.json();
    },
  });

  const createProfileMutation = useCreateProfileMutation();
  const updateProfileMutation = useUpdateActiveProfileMutation();
  const deleteProfileMutation = useDeleteProfileMutation();

  const setActiveProfileId = useCallback((id: number) => {
    setActiveProfileIdState(id);
    localStorage.setItem("konex_active_profile_id", String(id));
  }, []);

  useEffect(() => {
    if (profiles.length > 0 && (!activeProfileId || !profiles.find(p => p.id === activeProfileId))) {
      setActiveProfileId(profiles[0].id);
    }
  }, [profiles, activeProfileId, setActiveProfileId]);

  useEffect(() => {
    if (deleteProfileMutation.isSuccess && profiles.length > 0) {
      if (!profiles.find(p => p.id === activeProfileId)) {
        setActiveProfileId(profiles[0].id);
      }
    }
  }, [deleteProfileMutation.isSuccess, profiles, activeProfileId, setActiveProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  return (
    <ActiveProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        activeProfileId,
        setActiveProfileId,
        isLoading,
        createProfile: createProfileMutation,
        updateProfile: updateProfileMutation,
        deleteProfile: deleteProfileMutation,
      }}
    >
      {children}
    </ActiveProfileContext.Provider>
  );
}

export function useActiveProfile() {
  const ctx = useContext(ActiveProfileContext);
  if (!ctx) throw new Error("useActiveProfile must be used within ActiveProfileProvider");
  return ctx;
}
