import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Eye, Nfc, Users, MousePointerClick, Phone, Mail, Globe,
  MessageCircle, Download, TrendingUp, ArrowRight, BarChart2, Star
} from "lucide-react";

const EVENT_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  view:           { label: "Profile Views",      icon: Eye,              color: "#6366f1" },
  cta_click:      { label: "CTA Clicks",         icon: MousePointerClick,color: "#8b5cf6" },
  call_click:     { label: "Phone Calls",        icon: Phone,            color: "#22c55e" },
  email_click:    { label: "Email Clicks",       icon: Mail,             color: "#3b82f6" },
  whatsapp_click: { label: "WhatsApp Clicks",    icon: MessageCircle,    color: "#10b981" },
  website_click:  { label: "Website Clicks",     icon: Globe,            color: "#f59e0b" },
  social_click:   { label: "Social Clicks",      icon: Star,             color: "#ec4899" },
  booking_click:  { label: "Booking Clicks",     icon: TrendingUp,       color: "#14b8a6" },
  save_contact:   { label: "Contact Saves",      icon: Download,         color: "#f97316" },
  form_submit:    { label: "Form Submissions",   icon: Users,            color: "#a855f7" },
  payment_click:  { label: "Payment Clicks",     icon: TrendingUp,       color: "#eab308" },
  qr_scan:        { label: "QR Scans",           icon: Nfc,              color: "#06b6d4" },
};

const PIE_COLORS = ["#6366f1","#22c55e","#3b82f6","#f59e0b","#ec4899","#14b8a6"];

function StatCard({ title, value, sub, icon: Icon, color }: { title: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1" data-testid={`stat-${title.toLowerCase().replace(/\s/g,"-")}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: color + "20" }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState("30");

  const { data: overview, isLoading: ovLoading } = useQuery<{
    views: number; taps: number; leads: number; formSubmits: number;
    ctaClicks: number; saveContacts: number; conversionRate: number;
  }>({
    queryKey: ["/api/analytics/overview"],
    staleTime: 60_000,
  });

  const { data: trend, isLoading: trendLoading } = useQuery<{ date: string; views: number; leads: number; clicks: number }[]>({
    queryKey: ["/api/analytics/trend", days],
    queryFn: () => fetch(`/api/analytics/trend?days=${days}`).then(r => r.json()),
    staleTime: 60_000,
  });

  const { data: ctas, isLoading: ctasLoading } = useQuery<{ eventType: string; count: number }[]>({
    queryKey: ["/api/analytics/ctas"],
    staleTime: 60_000,
  });

  const { data: sources } = useQuery<{ source: string; count: number }[]>({
    queryKey: ["/api/analytics/sources"],
    staleTime: 60_000,
  });

  const isLoading = ovLoading || trendLoading || ctasLoading;

  const totalClicks = ctas?.reduce((s, c) => {
    const isClick = c.eventType !== "view" && c.eventType !== "form_submit";
    return s + (isClick ? c.count : 0);
  }, 0) || 0;

  const ctaBarData = (ctas || [])
    .filter(c => c.eventType !== "view")
    .map(c => ({
      name: EVENT_LABELS[c.eventType]?.label || c.eventType,
      count: c.count,
      fill: EVENT_LABELS[c.eventType]?.color || "#6366f1",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const sourceData = (sources || []).map(s => ({
    name: s.source.charAt(0).toUpperCase() + s.source.slice(1),
    value: s.count,
  }));

  const trendFormatted = (trend || []).map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  const roiMessage = () => {
    if (!overview) return null;
    const { leads, taps, views, conversionRate } = overview;
    if (leads === 0 && views === 0) return "Start sharing your card to see ROI data here.";
    if (leads > 0 && conversionRate > 0) return `You're converting ${conversionRate}% of profile views into leads — ${leads} contact${leads > 1 ? "s" : ""} collected from ${views} view${views > 1 ? "s" : ""}.`;
    if (taps > 0 && leads === 0) return `${taps} NFC tap${taps > 1 ? "s" : ""} so far. Add a lead capture form to start converting taps into contacts.`;
    return `${views} view${views > 1 ? "s" : ""} recorded. Keep sharing to grow your reach.`;
  };

  if (isLoading) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your profile performance.</p>
      </div>
      <OverviewSkeleton />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-analytics-title">Analytics</h1>
          <p className="text-muted-foreground">Track your profile performance and conversions.</p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-36" data-testid="select-days-range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ROI Banner */}
      {roiMessage() && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{roiMessage()}</p>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Profile Views"    value={overview?.views ?? 0}          sub="All-time total" icon={Eye}              color="#6366f1" />
        <StatCard title="NFC Taps"         value={overview?.taps ?? 0}           sub="From your cards" icon={Nfc}             color="#22c55e" />
        <StatCard title="Leads Collected"  value={overview?.leads ?? 0}          sub="Form submissions" icon={Users}          color="#3b82f6" />
        <StatCard title="Conversion Rate"  value={`${overview?.conversionRate ?? 0}%`} sub="Views → leads" icon={TrendingUp} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="CTA Clicks"    value={overview?.ctaClicks ?? 0}    sub="Primary button taps"  icon={MousePointerClick} color="#8b5cf6" />
        <StatCard title="Contact Saves" value={overview?.saveContacts ?? 0} sub="vCard downloads"       icon={Download}          color="#f97316" />
        <StatCard title="Total Clicks"  value={totalClicks}                 sub="All interaction types" icon={BarChart2}          color="#14b8a6" />
      </div>

      {/* Trend Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Activity Trend</CardTitle>
          <CardDescription>Leads and clicks over the last {days} days</CardDescription>
        </CardHeader>
        <CardContent>
          {trendFormatted.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">No data yet — start sharing your profile.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendFormatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} />
                <Line type="monotone" dataKey="leads"  stroke="#3b82f6" strokeWidth={2} dot={false} name="Leads" />
                <Line type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} dot={false} name="Clicks" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* CTA Performance + Sources */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* CTA Performance */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>CTA Performance</CardTitle>
            <CardDescription>Which actions visitors take most</CardDescription>
          </CardHeader>
          <CardContent>
            {ctaBarData.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">No click data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ctaBarData} layout="vertical" margin={{ left: 80, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" radius={4} name="Clicks">
                    {ctaBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            {!sourceData || sourceData.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">No source data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {sourceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leads CTA */}
      <Card className="border-border/50 bg-muted/30">
        <CardContent className="flex items-center justify-between flex-wrap gap-4 pt-6">
          <div>
            <p className="font-semibold text-lg">View your leads</p>
            <p className="text-sm text-muted-foreground">See contact details, export to CSV, and follow up.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/leads">
              Go to Leads <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
