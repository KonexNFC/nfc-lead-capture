import { useActiveProfile } from "@/hooks/use-active-profile";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Download, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function LeadsPage() {
  const { profiles, activeProfile } = useActiveProfile();
  const [filterProfileId, setFilterProfileId] = useState<string>("all");

  const profileIdParam = filterProfileId === "all" ? "" : `?profileId=${filterProfileId}`;
  const { data: leads, isLoading } = useQuery({
    queryKey: ["/api/leads", filterProfileId],
    queryFn: async () => {
      const res = await fetch(`/api/leads${profileIdParam}`);
      if (!res.ok) return [];
      return await res.json();
    },
  });

  const exportCSV = () => {
    if (!leads) return;
    const headers = ["Name", "Telephone", "WhatsApp", "Email", "Company", "Note", "Profile", "Date"];
    const csvContent = [
      headers.join(","),
      ...leads.map((l: any) => [
        `"${l.name}"`, 
        `"${l.telephone || ''}"`,
        `"${l.whatsapp || ''}"`,
        `"${l.email || ''}"`, 
        `"${l.company || ''}"`, 
        `"${l.note || ''}"`,
        `"${l.profileName || ''}"`,
        new Date(l.createdAt!).toISOString()
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

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-leads-title">Leads</h1>
          <p className="text-muted-foreground">Contacts collected through your profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          {profiles.length > 1 && (
            <Select value={filterProfileId} onValueChange={setFilterProfileId}>
              <SelectTrigger className="w-[180px]" data-testid="select-profile-filter">
                <SelectValue placeholder="All Profiles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Profiles</SelectItem>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" onClick={exportCSV} disabled={!leads?.length} data-testid="button-export-csv">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                {profiles.length > 1 && filterProfileId === "all" && <TableHead>Profile</TableHead>}
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={profiles.length > 1 && filterProfileId === "all" ? 6 : 5} className="h-24 text-center text-muted-foreground">
                    No leads collected yet.
                  </TableCell>
                </TableRow>
              ) : (
                leads?.map((lead: any) => (
                  <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {lead.telephone && (
                          <a href={`tel:${lead.telephone}`} className="flex items-center hover:underline text-foreground text-sm">
                            <Phone className="h-3 w-3 mr-1.5 text-muted-foreground" />
                            {lead.telephone}
                          </a>
                        )}
                        {lead.whatsapp && lead.whatsapp !== lead.telephone && (
                          <a 
                            href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center hover:underline text-green-600 dark:text-green-400 text-sm"
                          >
                            <MessageCircle className="h-3 w-3 mr-1.5" />
                            WhatsApp
                          </a>
                        )}
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="flex items-center hover:underline text-sm">
                            <Mail className="h-3 w-3 mr-1.5" />
                            {lead.email}
                          </a>
                        )}
                        {!lead.telephone && !lead.whatsapp && !lead.email && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{lead.company || "-"}</TableCell>
                    {profiles.length > 1 && filterProfileId === "all" && (
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{lead.profileName || "-"}</Badge>
                      </TableCell>
                    )}
                    <TableCell className="max-w-xs truncate text-muted-foreground">{lead.note || "-"}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {new Date(lead.createdAt!).toLocaleDateString()}
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
