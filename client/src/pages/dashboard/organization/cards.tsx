import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Loader2, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OrgWithRole {
  id: number;
  name: string;
  role: string;
}

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

export default function OrganizationCards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [cardId, setCardId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");

  const { data: orgs } = useQuery<OrgWithRole[]>({ queryKey: ["/api/organizations"] });
  const org = orgs?.[0];

  const { data: orgCards, isLoading } = useQuery<OrgCard[]>({
    queryKey: ["/api/organizations", org?.id, "cards"],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${org!.id}/cards`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cards");
      return res.json();
    },
    enabled: !!org,
  });

  const addMutation = useMutation({
    mutationFn: async (data: { cardId: number; assignedUserId?: number | null }) => {
      const res = await apiRequest("POST", `/api/organizations/${org!.id}/cards`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", org?.id, "cards"] });
      setAddOpen(false);
      setCardId("");
      setAssignedUserId("");
      toast({ title: "Card added", description: "Card has been assigned to the organization." });
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
      toast({ title: "Card removed from organization" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const canManage = org?.role === "owner" || org?.role === "admin";

  if (!org) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

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
            <p className="text-muted-foreground">{orgCards?.length ?? 0} cards assigned</p>
          </div>
        </div>
        {canManage && (
          <Button onClick={() => setAddOpen(true)} data-testid="button-add-card">
            <Plus className="h-4 w-4 mr-2" />
            Assign Card
          </Button>
        )}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card Code</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned User</TableHead>
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
              ) : !orgCards || orgCards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No cards assigned to this organization yet.
                  </TableCell>
                </TableRow>
              ) : (
                orgCards.map((oc) => (
                  <TableRow key={oc.id} data-testid={`row-org-card-${oc.id}`}>
                    <TableCell className="font-mono text-sm font-medium">{oc.cardCode}</TableCell>
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
                    <TableCell className="text-sm text-muted-foreground">
                      {oc.assignedUserId ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {oc.createdAt ? new Date(oc.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMutation.mutate(oc.id)}
                          data-testid={`button-remove-card-${oc.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Card to Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Card ID</Label>
              <Input
                type="number"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                placeholder="Enter card ID from inventory"
                data-testid="input-card-id"
              />
            </div>
            <div className="space-y-2">
              <Label>Assign to User ID (optional)</Label>
              <Input
                type="number"
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                placeholder="Leave blank for unassigned"
                data-testid="input-assigned-user-id"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                const cid = parseInt(cardId);
                if (isNaN(cid)) {
                  toast({ title: "Invalid card ID", variant: "destructive" });
                  return;
                }
                const uid = assignedUserId ? parseInt(assignedUserId) : null;
                addMutation.mutate({ cardId: cid, assignedUserId: uid });
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
    </div>
  );
}
