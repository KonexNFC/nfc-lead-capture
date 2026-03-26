import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Loader2, Trash2, CreditCard, UserCheck, RefreshCw, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useActiveOrg } from "@/hooks/use-active-org";

interface OrgCard {
  id: number;
  organizationId: number;
  cardId: number;
  assignedUserId: number | null;
  cardCode: string;
  status: string;
  productTier: string;
  createdAt: string;
}

interface OrgMember {
  id: number;
  userId: number;
  role: string;
  email: string;
  name?: string;
}

const tierColors: Record<string, string> = {
  basic: "bg-zinc-500/20 text-zinc-400",
  premium: "bg-amber-500/20 text-amber-400",
  elite: "bg-purple-500/20 text-purple-400",
  custom: "bg-cyan-500/20 text-cyan-400",
};

const statusColors: Record<string, string> = {
  unassigned: "bg-zinc-500/20 text-zinc-400",
  active: "bg-green-500/20 text-green-400",
  suspended: "bg-orange-500/20 text-orange-400",
  archived: "bg-red-500/20 text-red-400",
  lost: "bg-red-500/20 text-red-400",
};

type FilterTab = "all" | "assigned" | "unassigned" | "active";

export default function OrganizationCards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [cardCode, setCardCode] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [reassignCardId, setReassignCardId] = useState<number | null>(null);
  const [reassignMember, setReassignMember] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");

  const { activeOrg: org } = useActiveOrg();

  const { data: orgCards, isLoading } = useQuery<OrgCard[]>({
    queryKey: ["/api/organizations", org?.id, "cards"],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${org!.id}/cards`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cards");
      return res.json();
    },
    enabled: !!org,
  });

  const { data: members } = useQuery<OrgMember[]>({
    queryKey: ["/api/organizations", org?.id, "members"],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${org!.id}/members`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
    enabled: !!org,
  });

  const addMutation = useMutation({
    mutationFn: async (data: { cardCode: string; assignedUserId?: number | null }) => {
      const res = await apiRequest("POST", `/api/organizations/${org!.id}/cards`, data);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to assign card");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", org?.id, "cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", org?.id, "analytics"] });
      setAddOpen(false);
      setCardCode("");
      setSelectedMember("");
      toast({ title: "Card assigned", description: "Card has been added to the organization." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const reassignMutation = useMutation({
    mutationFn: async ({ orgCardId, assignedUserId }: { orgCardId: number; assignedUserId: number | null }) => {
      const res = await apiRequest("PATCH", `/api/organizations/${org!.id}/cards/${orgCardId}`, { assignedUserId });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to reassign card");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", org?.id, "cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", org?.id, "analytics"] });
      setReassignCardId(null);
      setReassignMember("");
      toast({ title: "Card reassigned" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (orgCardId: number) => {
      await apiRequest("DELETE", `/api/organizations/${org!.id}/cards/${orgCardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", org?.id, "cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", org?.id, "analytics"] });
      toast({ title: "Card removed from organization" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const memberMap = new Map<number, OrgMember>();
  members?.forEach(m => memberMap.set(m.userId, m));

  const canManage = org?.role === "owner" || org?.role === "admin";

  const statusSummary = {
    total: orgCards?.length ?? 0,
    active: orgCards?.filter(c => c.status === "active").length ?? 0,
    assigned: orgCards?.filter(c => c.assignedUserId !== null).length ?? 0,
    unassigned: orgCards?.filter(c => c.assignedUserId === null).length ?? 0,
  };

  const filteredCards = orgCards?.filter(c => {
    if (filterTab === "assigned") return c.assignedUserId !== null;
    if (filterTab === "unassigned") return c.assignedUserId === null;
    if (filterTab === "active") return c.status === "active";
    return true;
  }) ?? [];

  const reassignCard = orgCards?.find(c => c.id === reassignCardId);

  if (!org) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: statusSummary.total },
    { key: "assigned", label: "Assigned", count: statusSummary.assigned },
    { key: "unassigned", label: "Unassigned", count: statusSummary.unassigned },
    { key: "active", label: "Active", count: statusSummary.active },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/organization">
            <Button variant="ghost" size="icon" data-testid="button-back-org">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold" data-testid="text-org-cards-title">Organization Cards</h1>
            <p className="text-muted-foreground">{orgCards?.length ?? 0} cards in inventory</p>
          </div>
        </div>
        {canManage && (
          <Button onClick={() => setAddOpen(true)} data-testid="button-add-card">
            <Plus className="h-4 w-4 mr-2" />
            Assign Card
          </Button>
        )}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Cards", value: statusSummary.total, color: "text-foreground", icon: CreditCard },
          { label: "Active", value: statusSummary.active, color: "text-green-500", icon: UserCheck },
          { label: "Assigned", value: statusSummary.assigned, color: "text-blue-500", icon: RefreshCw },
          { label: "Unassigned", value: statusSummary.unassigned, color: "text-amber-500", icon: AlertCircle },
        ].map(stat => (
          <Card key={stat.label} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`} data-testid={`text-card-stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(tab => (
          <Button
            key={tab.key}
            variant={filterTab === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTab(tab.key)}
            data-testid={`button-filter-${tab.key}`}
          >
            {tab.label}
            <span className={`ml-2 text-xs rounded-full px-1.5 py-0.5 ${filterTab === tab.key ? "bg-white/20" : "bg-muted"}`}>
              {tab.count}
            </span>
          </Button>
        ))}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card Code</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Added</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredCards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {filterTab === "all" ? "No cards assigned to this organization yet." : `No ${filterTab} cards.`}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCards.map((oc) => {
                  const assignedMember = oc.assignedUserId ? memberMap.get(oc.assignedUserId) : null;
                  return (
                    <TableRow key={oc.id} data-testid={`row-org-card-${oc.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm font-medium">{oc.cardCode}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs ${tierColors[oc.productTier] || ""}`}>
                          {oc.productTier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs ${statusColors[oc.status] || ""}`}>
                          {oc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {assignedMember ? (
                          <span data-testid={`text-assigned-member-${oc.id}`}>{assignedMember.name || assignedMember.email}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {oc.createdAt ? new Date(oc.createdAt).toLocaleDateString() : "-"}
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReassignCardId(oc.id);
                                setReassignMember(oc.assignedUserId?.toString() ?? "");
                              }}
                              data-testid={`button-reassign-card-${oc.id}`}
                              title="Reassign card"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Reassign
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMutation.mutate(oc.id)}
                              data-testid={`button-remove-card-${oc.id}`}
                              title="Remove from organization"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Card Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Card to Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Card Code</Label>
              <Input
                value={cardCode}
                onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                placeholder="e.g. KONEX-B-00001"
                data-testid="input-card-code"
              />
              <p className="text-xs text-muted-foreground">Enter the full card code from the card inventory</p>
            </div>
            <div className="space-y-2">
              <Label>Assign to Member (optional)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                data-testid="select-assigned-member"
              >
                <option value="">Unassigned</option>
                {members?.map(m => (
                  <option key={m.userId} value={m.userId.toString()}>
                    {m.name || m.email} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                const code = cardCode.trim();
                if (!code) { toast({ title: "Enter a card code", variant: "destructive" }); return; }
                const uid = selectedMember ? parseInt(selectedMember) : null;
                addMutation.mutate({ cardCode: code, assignedUserId: uid });
              }}
              disabled={addMutation.isPending}
              data-testid="button-submit-add-card"
            >
              {addMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog open={reassignCardId !== null} onOpenChange={(open) => { if (!open) { setReassignCardId(null); setReassignMember(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Card</p>
              <p className="font-mono font-semibold">{reassignCard?.cardCode}</p>
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={reassignMember}
                onChange={(e) => setReassignMember(e.target.value)}
                data-testid="select-reassign-member"
              >
                <option value="">Unassigned</option>
                {members?.map(m => (
                  <option key={m.userId} value={m.userId.toString()}>
                    {m.name || m.email} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReassignCardId(null); setReassignMember(""); }}>Cancel</Button>
            <Button
              onClick={() => {
                if (reassignCardId === null) return;
                const uid = reassignMember ? parseInt(reassignMember) : null;
                reassignMutation.mutate({ orgCardId: reassignCardId, assignedUserId: uid });
              }}
              disabled={reassignMutation.isPending}
              data-testid="button-submit-reassign"
            >
              {reassignMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Reassignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
