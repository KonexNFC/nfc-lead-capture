import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ExternalLink, Phone, Mail, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserDetail {
  id: number;
  email: string;
  isAdmin: boolean | null;
  createdAt: string;
  profile: {
    id: number;
    name: string;
    slug: string;
    title?: string;
    company?: string;
    bio?: string;
    photoUrl?: string;
    views?: number;
    theme?: string;
    links?: Record<string, string>;
    createdAt?: string;
  } | null;
  leads: Array<{
    id: number;
    name: string;
    email?: string | null;
    telephone?: string | null;
    whatsapp?: string | null;
    company?: string | null;
    note?: string | null;
    source?: string | null;
    createdAt?: string;
  }>;
}

export default function AdminUserDetail({ params }: { params: { id: string } }) {
  const userId = params.id;

  const { data: user, isLoading } = useQuery<UserDetail>({
    queryKey: ["/api/admin/users", userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        User not found.
      </div>
    );
  }

  const profile = user.profile;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/users">
          <Button variant="ghost" size="icon" data-testid="button-back-users">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-user-detail-title">User Details</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-xs text-muted-foreground">Email</span>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Role</span>
              <div className="mt-1">
                {user.isAdmin ? (
                  <Badge variant="default">Admin</Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Joined</span>
              <p className="text-sm">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</p>
            </div>
          </CardContent>
        </Card>

        {profile ? (
          <>
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={profile.photoUrl ? (
                        profile.photoUrl.startsWith('http') ? profile.photoUrl :
                        profile.photoUrl.startsWith('/objects/') ? profile.photoUrl :
                        `/objects/${profile.photoUrl}`
                      ) : undefined}
                      alt={profile.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-secondary font-bold text-primary">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">{profile.title || "No title"}</p>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Company</span>
                  <p className="text-sm">{profile.company || "-"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Slug</span>
                  <p className="text-sm font-mono">/{profile.slug}</p>
                </div>
                <Link href={`/u/${profile.slug}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2" data-testid="link-view-profile">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View Public Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Profile Views</span>
                  <p className="text-2xl font-bold">{profile.views ?? 0}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Total Leads</span>
                  <p className="text-2xl font-bold">{user.leads.length}</p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="md:col-span-2 border-border/50 shadow-sm">
            <CardContent className="flex items-center justify-center h-full py-12 text-muted-foreground">
              This user hasn't created a profile yet.
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Leads ({user.leads.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No leads captured.
                  </TableCell>
                </TableRow>
              ) : (
                user.leads.map((lead) => (
                  <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {lead.telephone && (
                          <span className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1.5 text-muted-foreground" />
                            {lead.telephone}
                          </span>
                        )}
                        {lead.whatsapp && lead.whatsapp !== lead.telephone && (
                          <span className="flex items-center text-sm text-green-600 dark:text-green-400">
                            <MessageCircle className="h-3 w-3 mr-1.5" />
                            {lead.whatsapp}
                          </span>
                        )}
                        {lead.email && (
                          <span className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1.5 text-muted-foreground" />
                            {lead.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{lead.company || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{lead.note || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{lead.source || "nfc"}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
