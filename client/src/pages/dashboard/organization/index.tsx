import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Users, CreditCard, MousePointerClick, UserPlus, Plus, Loader2, Check, Settings, Trophy, Star, Zap, TrendingUp } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useActiveOrg } from "@/hooks/use-active-org";
import { useAuth } from "@/hooks/use-auth";

interface OrgAnalytics {
  totalCards: number;
  activeCards: number;
  totalTaps: number;
  totalLeads: number;
  topCard: { cardCode: string; taps: number } | null;
  topMember: { name: string; email: string; taps: number } | null;
}

interface MemberAnalytic {
  memberId: number;
  userId: number;
  name: string;
  email: string;
  role: string;
  assignedCards: number;
  totalTaps: number;
  totalLeads: number;
  activationRate: number;
}

const roleColors: Record<string, string> = {
  owner: "bg-purple-500/20 text-purple-400",
  admin: "bg-blue-500/20 text-blue-400",
  manager: "bg-amber-500/20 text-amber-400",
  member: "bg-zinc-500/20 text-zinc-400",
};

export default function OrganizationDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { orgs, activeOrg, isLoading, setActiveOrgId } = useActiveOrg();
  const [createOpen, setCreateOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [inviteProcessed, setInviteProcessed] = useState(false);

  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const inviteToken = searchParams.get("invite");

  const acceptInviteMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await apiRequest("POST", "/api/organizations/accept-invite", { token });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to accept invitation");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      toast({ title: "Invitation accepted!", description: "You've joined the organization." });
      window.history.replaceState({}, "", "/dashboard/organization");
    },
    onError: (error: Error) => {
      toast({ title: "Invitation error", description: error.message, variant: "destructive" });
      window.history.replaceState({}, "", "/dashboard/organization");
    },
  });

  useEffect(() => {
    if (inviteToken && !inviteProcessed) {
      setInviteProcessed(true);
      acceptInviteMutation.mutate(inviteToken);
    }
  }, [inviteToken, inviteProcessed]);

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      const res = await apiRequest("POST", "/api/organizations", data);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Failed to create organization");
      }
      return await res.json();
    },
    onSuccess: (newOrg) => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      setCreateOpen(false);
      setOrgName("");
      setOrgSlug("");
      setActiveOrgId(newOrg.id);
      toast({ title: "Organization created", description: "Your organization workspace is ready." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!orgName.trim() || !orgSlug.trim()) {
      toast({ title: "Missing fields", description: "Name and slug are required.", variant: "destructive" });
      return;
    }
    createMutation.mutate({ name: orgName.trim(), slug: orgSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-") });
  };

  const handleNameChange = (name: string) => {
    setOrgName(name);
    setOrgSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  if (isLoading || acceptInviteMutation.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        {acceptInviteMutation.isPending && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Accepting invitation...</span>
          </div>
        )}
      </div>
    );
  }

  const createDialog = (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input
              value={orgName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Acme Inc."
              data-testid="input-org-name"
            />
          </div>
          <div className="space-y-2">
            <Label>Slug (URL-friendly)</Label>
            <Input
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              placeholder="acme-inc"
              data-testid="input-org-slug"
            />
            <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, and hyphens</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-submit-create-org">
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (!orgs || orgs.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold" data-testid="text-org-title">Organizations</h1>
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <Building2 className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold">No Organization Yet</h2>
            <p className="text-muted-foreground text-center max-w-md">
              {user?.isAdmin
                ? "Create an organization to manage your team's NFC cards, track performance, and capture leads at scale."
                : "You haven't been added to an organization yet. Ask your admin to invite you, or contact support."}
            </p>
            {user?.isAdmin && (
              <Button onClick={() => setCreateOpen(true)} data-testid="button-create-org">
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            )}
          </CardContent>
        </Card>
        {createDialog}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-org-title">{activeOrg?.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs" data-testid="text-org-plan">{activeOrg?.planType}</Badge>
            <Badge variant="outline" className="text-xs" data-testid="text-org-role">{activeOrg?.role}</Badge>
          </div>
        </div>
        {user?.isAdmin && (
          <Button variant="outline" onClick={() => setCreateOpen(true)} data-testid="button-create-org">
            <Plus className="h-4 w-4 mr-2" />
            New Organization
          </Button>
        )}
      </div>

      {orgs.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {orgs.map((o) => (
            <Button
              key={o.id}
              variant={o.id === activeOrg?.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveOrgId(o.id)}
              data-testid={`button-switch-org-${o.id}`}
            >
              {o.id === activeOrg?.id && <Check className="h-3 w-3 mr-1.5" />}
              {o.name}
              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{o.role}</Badge>
            </Button>
          ))}
        </div>
      )}

      {activeOrg && <OrgAnalyticsCards orgId={activeOrg.id} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/organization/members">
          <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 py-6">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Team Members</h3>
                <p className="text-sm text-muted-foreground">Manage roles & invitations</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/organization/cards">
          <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 py-6">
              <CreditCard className="h-8 w-8 text-amber-500" />
              <div>
                <h3 className="font-semibold">Organization Cards</h3>
                <p className="text-sm text-muted-foreground">Assign & track NFC cards</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/organization/settings">
          <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 py-6">
              <Settings className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold">Settings & Branding</h3>
                <p className="text-sm text-muted-foreground">Logo, colors & defaults</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {activeOrg && (activeOrg.role === "owner" || activeOrg.role === "admin" || activeOrg.role === "manager") && (
        <TeamAnalyticsTable orgId={activeOrg.id} />
      )}

      {createDialog}
    </div>
  );
}

function OrgAnalyticsCards({ orgId }: { orgId: number }) {
  const { data: analytics, isLoading } = useQuery<OrgAnalytics>({
    queryKey: ["/api/organizations", orgId, "analytics"],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${orgId}/analytics`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  const stats = [
    { label: "Total Cards", value: analytics?.totalCards ?? 0, icon: CreditCard, color: "text-blue-500" },
    { label: "Active Cards", value: analytics?.activeCards ?? 0, icon: Zap, color: "text-green-500" },
    { label: "Total NFC Taps", value: analytics?.totalTaps ?? 0, icon: MousePointerClick, color: "text-amber-500" },
    { label: "Leads Captured", value: analytics?.totalLeads ?? 0, icon: UserPlus, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-org-stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
                {stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Performing Card</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {analytics?.topCard ? (
              <div>
                <div className="text-xl font-bold font-mono" data-testid="text-top-card-code">{analytics.topCard.cardCode}</div>
                <p className="text-sm text-muted-foreground">{analytics.topCard.taps.toLocaleString()} taps</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-top-card-empty">No tap data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Performing Member</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {analytics?.topMember ? (
              <div>
                <div className="text-xl font-bold" data-testid="text-top-member-name">{analytics.topMember.name}</div>
                <p className="text-sm text-muted-foreground">{analytics.topMember.taps.toLocaleString()} taps</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground" data-testid="text-top-member-empty">No tap data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TeamAnalyticsTable({ orgId }: { orgId: number }) {
  const { data: memberAnalytics, isLoading } = useQuery<MemberAnalytic[]>({
    queryKey: ["/api/organizations", orgId, "member-analytics"],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${orgId}/member-analytics`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch member analytics");
      return res.json();
    },
  });

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">Team Performance</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Cards</TableHead>
              <TableHead className="text-right">NFC Taps</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead className="text-right">Activation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : !memberAnalytics || memberAnalytics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center text-muted-foreground text-sm">
                  No team members yet. Invite your team to see performance data.
                </TableCell>
              </TableRow>
            ) : (
              memberAnalytics.map((member) => (
                <TableRow key={member.memberId} data-testid={`row-member-analytics-${member.memberId}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs ${roleColors[member.role] || ""}`}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{member.assignedCards}</TableCell>
                  <TableCell className="text-right font-medium">{member.totalTaps.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">{member.totalLeads}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${member.activationRate === 100 ? "text-green-500" : member.activationRate > 50 ? "text-amber-500" : "text-muted-foreground"}`}>
                      {member.activationRate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
