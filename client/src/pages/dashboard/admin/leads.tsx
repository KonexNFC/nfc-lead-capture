import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Download, Phone, Mail, MessageCircle, Search } from "lucide-react";
import { Link } from "wouter";

interface LeadWithProfile {
  id: number;
  profileId: number;
  name: string;
  email?: string | null;
  telephone?: string | null;
  whatsapp?: string | null;
  company?: string | null;
  note?: string | null;
  source?: string | null;
  createdAt?: string;
  profileName?: string | null;
}

export default function AdminLeads() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  const { data: leads, isLoading } = useQuery<LeadWithProfile[]>({
    queryKey: ["/api/admin/leads"],
  });

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch = searchQuery === "" ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.telephone?.includes(searchQuery) ||
      lead.whatsapp?.includes(searchQuery) ||
      lead.profileName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;

    return matchesSearch && matchesSource;
  }) ?? [];

  const uniqueSources = Array.from(new Set(leads?.map(l => l.source).filter(Boolean) ?? []));

  const exportCSV = () => {
    if (!filteredLeads.length) return;
    const headers = ["Name", "Telephone", "WhatsApp", "Email", "Company", "Note", "Profile", "Source", "Date"];
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map(l => [
        `"${l.name}"`,
        `"${l.telephone || ''}"`,
        `"${l.whatsapp || ''}"`,
        `"${l.email || ''}"`,
        `"${l.company || ''}"`,
        `"${l.note || ''}"`,
        `"${l.profileName || ''}"`,
        `"${l.source || ''}"`,
        l.createdAt ? new Date(l.createdAt).toISOString() : ''
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "konex_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin">
            <Button variant="ghost" size="icon" data-testid="button-back-admin">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold" data-testid="text-admin-leads-title">All Leads</h1>
            <p className="text-muted-foreground">{filteredLeads.length} of {leads?.length ?? 0} leads</p>
          </div>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={!filteredLeads.length} data-testid="button-export-csv">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, company, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-leads"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-source-filter">
            <SelectValue placeholder="Filter source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {uniqueSources.map(source => (
              <SelectItem key={source} value={source!}>{source!.toUpperCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {searchQuery || sourceFilter !== "all" ? "No leads match your filters." : "No leads captured yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
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
                    <TableCell>
                      <span className="text-sm font-medium">{lead.profileName || "-"}</span>
                    </TableCell>
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
