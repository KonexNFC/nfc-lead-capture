import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Plus, Download, Search, MoreVertical, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient as qc } from "@/lib/queryClient";

interface CardItem {
  id: number;
  cardCode: string;
  chipUid: string | null;
  ownerId: number | null;
  profileId: number | null;
  productTier: string;
  status: string;
  nickname: string | null;
  tapCount: number;
  qrScanCount: number;
  lastTapAt: string | null;
  createdAt: string;
  updatedAt: string;
  activatedAt: string | null;
}

interface CardStats {
  total: number;
  activated: number;
  unassigned: number;
  suspended: number;
  lost: number;
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

export default function AdminCards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignCardId, setAssignCardId] = useState<number | null>(null);
  const [assignUserId, setAssignUserId] = useState("");
  const [genQuantity, setGenQuantity] = useState("10");
  const [genTier, setGenTier] = useState("basic");
  const [genPrefix, setGenPrefix] = useState("KONEX");
  const [genStartNumber, setGenStartNumber] = useState("1");
  const [genNickname, setGenNickname] = useState("");
  const [lastGeneratedCsv, setLastGeneratedCsv] = useState<string | null>(null);
  const [lastGeneratedCount, setLastGeneratedCount] = useState(0);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (tierFilter !== "all") params.set("productTier", tierFilter);
    if (searchQuery) params.set("search", searchQuery);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const { data: cards, isLoading: cardsLoading } = useQuery<CardItem[]>({
    queryKey: ["/api/admin/cards", statusFilter, tierFilter, searchQuery],
    queryFn: async () => {
      const res = await fetch(`/api/admin/cards${buildQueryString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cards");
      return res.json();
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery<CardStats>({
    queryKey: ["/api/admin/cards/stats"],
  });

  const changeStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/cards/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards/stats"] });
      toast({ title: "Status updated", description: "Card status has been changed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ id, userId }: { id: number; userId: number }) => {
      await apiRequest("PATCH", `/api/admin/cards/${id}/assign`, { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards/stats"] });
      setAssignOpen(false);
      setAssignUserId("");
      setAssignCardId(null);
      toast({ title: "Card assigned", description: "Card has been assigned to the user." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { quantity: number; productTier: string; prefix: string; startNumber: number; nicknamePattern?: string }) => {
      const res = await apiRequest("POST", "/api/admin/cards/batch-create", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cards/stats"] });
      setLastGeneratedCsv(data.csv);
      setLastGeneratedCount(data.count);
      setGenerateOpen(false);
      toast({ title: "Cards generated", description: `${data.count} cards have been created.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleExportCSV = async () => {
    try {
      const res = await fetch("/api/admin/cards/export", { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const csvText = await res.text();
      const blob = new Blob([csvText], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `konex-cards-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Export failed", description: "Could not download CSV.", variant: "destructive" });
    }
  };

  const handleGenerate = () => {
    const qty = parseInt(genQuantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 500) {
      toast({ title: "Invalid quantity", description: "Enter a number between 1 and 500.", variant: "destructive" });
      return;
    }
    const start = parseInt(genStartNumber, 10);
    if (isNaN(start) || start < 1) {
      toast({ title: "Invalid start number", description: "Enter a valid start number.", variant: "destructive" });
      return;
    }
    generateMutation.mutate({
      quantity: qty,
      productTier: genTier,
      prefix: genPrefix || "KONEX",
      startNumber: start,
      ...(genNickname ? { nicknamePattern: genNickname } : {}),
    });
  };

  const handleDownloadCsv = () => {
    if (!lastGeneratedCsv) return;
    const blob = new Blob([lastGeneratedCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `konex-cards-batch-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAssign = () => {
    const uid = parseInt(assignUserId, 10);
    if (isNaN(uid) || !assignCardId) {
      toast({ title: "Invalid user ID", description: "Enter a valid user ID.", variant: "destructive" });
      return;
    }
    assignMutation.mutate({ id: assignCardId, userId: uid });
  };

  const statItems = [
    { label: "Total Cards", value: stats?.total ?? 0, color: "text-blue-500" },
    { label: "Activated", value: stats?.activated ?? 0, color: "text-green-500" },
    { label: "Unassigned", value: stats?.unassigned ?? 0, color: "text-zinc-400" },
    { label: "Suspended", value: stats?.suspended ?? 0, color: "text-orange-500" },
    { label: "Lost", value: stats?.lost ?? 0, color: "text-red-500" },
  ];

  if (cardsLoading && statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/dashboard/admin">
            <Button variant="ghost" size="icon" data-testid="button-back-admin">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold" data-testid="text-cards-title">Card Inventory</h1>
            <p className="text-muted-foreground">{cards?.length ?? 0} cards</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-generate-cards">
                <Plus className="h-4 w-4 mr-2" />
                Generate Cards
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Cards</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Quantity (1-500)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      value={genQuantity}
                      onChange={(e) => setGenQuantity(e.target.value)}
                      data-testid="input-gen-quantity"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Product Tier</Label>
                    <Select value={genTier} onValueChange={setGenTier}>
                      <SelectTrigger data-testid="select-gen-tier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Prefix</Label>
                    <Input
                      value={genPrefix}
                      onChange={(e) => setGenPrefix(e.target.value)}
                      placeholder="KONEX"
                      data-testid="input-gen-prefix"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Start Number</Label>
                    <Input
                      type="number"
                      min={1}
                      value={genStartNumber}
                      onChange={(e) => setGenStartNumber(e.target.value)}
                      placeholder="1"
                      data-testid="input-gen-start-number"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Cards: PREFIX-00001, PREFIX-00002, etc.</p>
                <div className="space-y-1">
                  <Label className="text-xs">Nickname Pattern (optional)</Label>
                  <Input
                    value={genNickname}
                    onChange={(e) => setGenNickname(e.target.value)}
                    placeholder="e.g. Batch-A"
                    data-testid="input-gen-nickname"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerate} disabled={generateMutation.isPending} data-testid="button-submit-generate">
                  {generateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Generate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {lastGeneratedCsv && (
            <Button variant="default" onClick={handleDownloadCsv} data-testid="button-download-encoding-csv">
              <Download className="h-4 w-4 mr-2" />
              Download Encoding CSV ({lastGeneratedCount})
            </Button>
          )}
          <Button variant="outline" onClick={handleExportCSV} data-testid="button-export-csv">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statItems.map((stat) => (
          <Card key={stat.label} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <CreditCard className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
                {stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by card code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-cards"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-[150px]" data-testid="select-tier-filter">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="elite">Elite</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card Code</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner ID</TableHead>
                <TableHead>Tap Count</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!cards || cards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {searchQuery || statusFilter !== "all" || tierFilter !== "all"
                      ? "No cards match your filters."
                      : "No cards found. Generate some cards to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                cards.map((card) => (
                  <TableRow key={card.id} data-testid={`row-card-${card.id}`}>
                    <TableCell className="font-mono text-sm font-medium">{card.cardCode}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${tierColors[card.productTier] || ""}`}>
                        {card.productTier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${statusColors[card.status] || ""}`}>
                        {card.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {card.ownerId ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm">{card.tapCount}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-actions-${card.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger data-testid={`button-change-status-${card.id}`}>
                              Change Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() => changeStatusMutation.mutate({ id: card.id, status: "active" })}
                                data-testid={`button-status-active-${card.id}`}
                              >
                                Active
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => changeStatusMutation.mutate({ id: card.id, status: "suspended" })}
                                data-testid={`button-status-suspended-${card.id}`}
                              >
                                Suspended
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => changeStatusMutation.mutate({ id: card.id, status: "archived" })}
                                data-testid={`button-status-archived-${card.id}`}
                              >
                                Archived
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem
                            onClick={() => {
                              setAssignCardId(card.id);
                              setAssignOpen(true);
                            }}
                            data-testid={`button-assign-${card.id}`}
                          >
                            Assign User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={assignOpen} onOpenChange={(open) => { setAssignOpen(open); if (!open) { setAssignCardId(null); setAssignUserId(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign User to Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                type="number"
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                placeholder="Enter user ID"
                data-testid="input-assign-user-id"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={assignMutation.isPending} data-testid="button-submit-assign">
              {assignMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}