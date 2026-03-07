import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MoreVertical, UserPlus, Loader2, Mail, Copy } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OrgWithRole {
  id: number;
  name: string;
  role: string;
}

interface OrgMember {
  id: number;
  userId: number;
  role: string;
  department: string | null;
  status: string;
  email: string;
  name: string | null;
  createdAt: string;
}

interface OrgInvitation {
  id: number;
  email: string;
  role: string;
  token: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

const roleColors: Record<string, string> = {
  owner: "bg-purple-500/20 text-purple-400",
  admin: "bg-blue-500/20 text-blue-400",
  manager: "bg-amber-500/20 text-amber-400",
  member: "bg-zinc-500/20 text-zinc-400",
};

export default function OrganizationMembers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const { data: orgs } = useQuery<OrgWithRole[]>({ queryKey: ["/api/organizations"] });
  const org = orgs?.[0];

  const { data: members, isLoading: membersLoading } = useQuery<OrgMember[]>({
    queryKey: ["/api/organizations", org?.id, "members"],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${org!.id}/members`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
    enabled: !!org,
  });

  const { data: invitations } = useQuery<OrgInvitation[]>({
    queryKey: ["/api/organizations", org?.id, "invitations"],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${org!.id}/invitations`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invitations");
      return res.json();
    },
    enabled: !!org && (org.role === "owner" || org.role === "admin"),
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const res = await apiRequest("POST", `/api/organizations/${org!.id}/invite`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", org?.id, "invitations"] });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      const inviteUrl = `${window.location.origin}/dashboard/organization?invite=${data.token}`;
      navigator.clipboard.writeText(inviteUrl);
      toast({ title: "Invitation sent", description: "Invite link copied to clipboard." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: number; role: string }) => {
      await apiRequest("PATCH", `/api/organizations/${org!.id}/members/${memberId}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", org?.id, "members"] });
      toast({ title: "Role updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: number) => {
      await apiRequest("DELETE", `/api/organizations/${org!.id}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", org?.id, "members"] });
      toast({ title: "Member removed" });
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
            <h1 className="text-3xl font-display font-bold" data-testid="text-members-title">Team Members</h1>
            <p className="text-muted-foreground">{members?.length ?? 0} members</p>
          </div>
        </div>
        {canManage && (
          <Button onClick={() => setInviteOpen(true)} data-testid="button-invite-member">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : !members || members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No members yet. Invite your team to get started.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                    <TableCell className="font-medium">{member.name || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${roleColors[member.role] || ""}`}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${member.status === "active" ? "bg-green-500/20 text-green-400" : "bg-zinc-500/20 text-zinc-400"}`}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        {member.role !== "owner" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-member-actions-${member.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => changeRoleMutation.mutate({ memberId: member.id, role: "admin" })}>
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => changeRoleMutation.mutate({ memberId: member.id, role: "manager" })}>
                                Make Manager
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => changeRoleMutation.mutate({ memberId: member.id, role: "member" })}>
                                Make Member
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => removeMutation.mutate(member.id)}
                              >
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canManage && invitations && invitations.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-8">Pending Invitations</h2>
          <Card className="border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => (
                    <TableRow key={inv.id} data-testid={`row-invitation-${inv.id}`}>
                      <TableCell className="text-sm">{inv.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs ${roleColors[inv.role] || ""}`}>
                          {inv.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs ${inv.status === "pending" ? "bg-amber-500/20 text-amber-400" : "bg-green-500/20 text-green-400"}`}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {inv.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/dashboard/organization?invite=${inv.token}`);
                              toast({ title: "Copied", description: "Invite link copied to clipboard." });
                            }}
                            data-testid={`button-copy-invite-${inv.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                data-testid="input-invite-email"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger data-testid="select-invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })} disabled={inviteMutation.isPending} data-testid="button-submit-invite">
              {inviteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
