import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, Eye, UserPlus, ArrowRight, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const { data: analytics, isLoading } = useQuery<{
    totalUsers: number;
    totalProfiles: number;
    totalLeads: number;
    totalViews: number;
  }>({
    queryKey: ["/api/admin/analytics"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: analytics?.totalUsers ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Total Profiles", value: analytics?.totalProfiles ?? 0, icon: UserPlus, color: "text-green-500" },
    { label: "Total Leads", value: analytics?.totalLeads ?? 0, icon: BarChart3, color: "text-purple-500" },
    { label: "Total Views", value: analytics?.totalViews ?? 0, icon: Eye, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold" data-testid="text-admin-title">Admin Panel</h1>
        <p className="text-muted-foreground">Platform overview and management.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Manage Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">View and manage all registered user accounts and their profiles.</p>
            <Link href="/dashboard/admin/users">
              <Button data-testid="link-admin-users">
                View All Users
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">All Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">View all leads captured across all profiles on the platform.</p>
            <Link href="/dashboard/admin/leads">
              <Button data-testid="link-admin-leads">
                View All Leads
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
