import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

interface OrgWithRole {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  ownerUserId: number;
  planType: string;
  role: string;
  createdAt: string;
}

const STORAGE_KEY = "konex-active-org-id";

export function useActiveOrg() {
  const [storedId, setStoredId] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved) : null;
  });

  const { data: orgs, isLoading } = useQuery<OrgWithRole[]>({
    queryKey: ["/api/organizations"],
  });

  const setActiveOrgId = useCallback((id: number) => {
    setStoredId(id);
    localStorage.setItem(STORAGE_KEY, id.toString());
  }, []);

  const activeOrg = orgs?.find(o => o.id === storedId) || orgs?.[0] || null;

  if (activeOrg && storedId !== activeOrg.id) {
    localStorage.setItem(STORAGE_KEY, activeOrg.id.toString());
  }

  return { orgs: orgs || [], activeOrg, isLoading, setActiveOrgId };
}
