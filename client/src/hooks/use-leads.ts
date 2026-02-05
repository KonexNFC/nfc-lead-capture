import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, leadFormSchema } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type LeadFormData = z.infer<typeof leadFormSchema> & { slug: string };

// Submit a lead (Public)
export function useSubmitLead() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: LeadFormData) => {
      const res = await fetch(api.leads.submit.path, {
        method: api.leads.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to submit information");
      return api.leads.submit.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Info Sent!",
        description: "Your contact information has been shared successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not send information. Please try again.",
        variant: "destructive",
      });
    }
  });
}

// Fetch leads list (Dashboard)
export function useLeads() {
  return useQuery({
    queryKey: [api.leads.list.path],
    queryFn: async () => {
      const res = await fetch(api.leads.list.path);
      if (!res.ok) throw new Error("Failed to fetch leads");
      return api.leads.list.responses[200].parse(await res.json());
    },
  });
}

// Fetch analytics (Dashboard)
export function useAnalytics() {
  return useQuery({
    queryKey: [api.leads.stats.path],
    queryFn: async () => {
      const res = await fetch(api.leads.stats.path);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.leads.stats.responses[200].parse(await res.json());
    },
  });
}
