import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Eye, UserPlus, ArrowRight, BarChart3, TrendingUp, Activity, Trophy, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface GrowthData {
  date: string;
  users: number;
  leads: number;
  views: number;
}

interface TopProfile {
  id: number;
  name: string;
  slug: string;
  views: number;
  leadCount: number;
  photoUrl: string | null;
}

interface ActivityItem {
  type: string;
  description: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export default function AdminDashboard() {
  const { data: analytics, isLoading } = useQuery<{
    totalUsers: number;
    totalProfiles: number;
    totalLeads: number;
    totalViews: number;
  }>({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: growth } = useQuery<GrowthData[]>({
    queryKey: ["/api/admin/growth"],
  });

  const { data: topProfiles } = useQuery<TopProfile[]>({
    queryKey: ["/api/admin/top-profiles"],
  });

  const { data: recentActivity } = useQuery<ActivityItem[]>({
    queryKey: ["/api/admin/activity"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: analytics?.totalUsers ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Total Profiles", value: analytics?.totalProfiles ?? 0, icon: UserPlus, color: "text-green-500" },
    { label: "Total Leads", value: analytics?.totalLeads ?? 0, icon: BarChart3, color: "text-purple-500" },
    { label: "Total Views", value: analytics?.totalViews ?? 0, icon: Eye, color: "text-orange-500" },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getTimeSince = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold" data-testid="text-admin-title">Admin Panel</h1>
        <p className="text-muted-foreground">Platform overview and management.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
                {stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Growth (Last 30 Days)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {growth && growth.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={growth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="date" tickFormatter={formatDate} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: 12 }}
                    labelFormatter={formatDate}
                  />
                  <Area type="monotone" dataKey="users" name="Signups" stroke="hsl(var(--chart-1))" fill="url(#colorUsers)" strokeWidth={2} />
                  <Area type="monotone" dataKey="leads" name="Leads" stroke="hsl(var(--chart-2))" fill="url(#colorLeads)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Top Profiles</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {topProfiles && topProfiles.length > 0 ? (
              <div className="space-y-3">
                {topProfiles.map((profile, index) => (
                  <Link key={profile.id} href={`/u/${profile.slug}`}>
                    <div className="flex items-center gap-3 hover-elevate rounded-md p-2 -mx-2 cursor-pointer" data-testid={`top-profile-${profile.id}`}>
                      <span className="text-xs font-bold text-muted-foreground w-4">{index + 1}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={profile.photoUrl ? (
                            profile.photoUrl.startsWith('http') ? profile.photoUrl :
                            profile.photoUrl.startsWith('/objects/') ? profile.photoUrl :
                            `/objects/${profile.photoUrl}`
                          ) : undefined}
                          alt={profile.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-secondary font-bold text-xs">
                          {profile.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{profile.name}</p>
                        <p className="text-xs text-muted-foreground">/{profile.slug}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{profile.views}</p>
                        <p className="text-xs text-muted-foreground">views</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                No profiles yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-1">
                {recentActivity.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0" data-testid={`activity-${index}`}>
                    <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${item.type === 'signup' ? 'bg-blue-500' : 'bg-green-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{item.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{getTimeSince(item.timestamp)}</span>
                        <Badge variant="secondary" className="text-xs">{item.type === 'signup' ? 'Signup' : 'Lead'}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Manage Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">View and manage all registered accounts.</p>
              <Link href="/dashboard/admin/users">
                <Button className="w-full" data-testid="link-admin-users">
                  View All Users
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">All Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">View all leads across all profiles.</p>
              <Link href="/dashboard/admin/leads">
                <Button className="w-full" data-testid="link-admin-leads">
                  View All Leads
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
