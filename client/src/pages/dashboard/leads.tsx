import { useLeads } from "@/hooks/use-leads";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LeadsPage() {
  const { data: leads, isLoading } = useLeads();

  const exportCSV = () => {
    if (!leads) return;
    const headers = ["Name", "Email", "Company", "Note", "Date"];
    const csvContent = [
      headers.join(","),
      ...leads.map(l => [
        `"${l.name}"`, 
        `"${l.email}"`, 
        `"${l.company || ''}"`, 
        `"${l.note || ''}"`, 
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Leads</h1>
          <p className="text-muted-foreground">Contacts collected through your profile.</p>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={!leads?.length}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No leads collected yet.
                  </TableCell>
                </TableRow>
              ) : (
                leads?.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <a href={`mailto:${lead.email}`} className="flex items-center hover:underline text-primary">
                        <Mail className="h-3 w-3 mr-1.5" />
                        {lead.email}
                      </a>
                    </TableCell>
                    <TableCell>{lead.company || "-"}</TableCell>
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
