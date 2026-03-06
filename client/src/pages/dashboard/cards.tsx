import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QRCodeSVG } from "qrcode.react";
import {
  CreditCard,
  Nfc,
  Copy,
  MoreVertical,
  Pause,
  Play,
  AlertTriangle,
  QrCode,
  Edit3,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Card as CardType } from "@shared/schema";

const tierColors: Record<string, string> = {
  basic: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  premium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  elite: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  custom: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  suspended: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
  unassigned: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

function getTapUrl(cardCode: string) {
  return `https://konexnfc.com/t/${cardCode}`;
}

export default function MyCardsPage() {
  const { toast } = useToast();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameCard, setRenameCard] = useState<CardType | null>(null);
  const [nickname, setNickname] = useState("");

  const { data: cards, isLoading } = useQuery<CardType[]>({
    queryKey: ["/api/cards/my"],
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, nickname }: { id: number; nickname: string }) => {
      await apiRequest("PATCH", `/api/cards/${id}`, { nickname });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards/my"] });
      toast({ title: "Renamed", description: "Card nickname updated." });
      setRenameDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to rename card.", variant: "destructive" });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/cards/${id}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards/my"] });
      toast({ title: "Suspended", description: "Card has been suspended." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to suspend card.", variant: "destructive" });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/cards/${id}/reactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards/my"] });
      toast({ title: "Reactivated", description: "Card has been reactivated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reactivate card.", variant: "destructive" });
    },
  });

  const lostMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/cards/${id}/lost`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards/my"] });
      toast({ title: "Marked Lost", description: "Card has been marked as lost." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to mark card as lost.", variant: "destructive" });
    },
  });

  const handleCopyLink = (cardCode: string) => {
    navigator.clipboard.writeText(getTapUrl(cardCode));
    toast({ title: "Copied!", description: "Tap link copied to clipboard." });
  };

  const handleOpenRename = (card: CardType) => {
    setRenameCard(card);
    setNickname(card.nickname || "");
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = () => {
    if (renameCard) {
      renameMutation.mutate({ id: renameCard.id, nickname });
    }
  };

  if (isLoading) {
    return <CardsSkeleton />;
  }

  const totalCards = cards?.length || 0;
  const totalTaps = cards?.reduce((sum, c) => sum + (c.tapCount || 0), 0) || 0;
  const activeCards = cards?.filter((c) => c.status === "active").length || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-my-cards-title">My Cards</h1>
          <p className="text-muted-foreground">Manage your NFC cards and track taps.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-cards">{totalCards}</div>
            <p className="text-xs text-muted-foreground">Cards linked to your account</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total NFC Taps</CardTitle>
            <Nfc className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-taps">{totalTaps}</div>
            <p className="text-xs text-muted-foreground">Across all your cards</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-cards">{activeCards}</div>
            <p className="text-xs text-muted-foreground">Currently active and tappable</p>
          </CardContent>
        </Card>
      </div>

      {totalCards === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-bold font-display">No cards linked yet</h2>
              <p className="text-muted-foreground">Get started by activating your first NFC card or purchasing one from our store.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/activate">
                <Button data-testid="button-activate-card">
                  <QrCode className="h-4 w-4 mr-2" />
                  Activate a Card
                </Button>
              </Link>
              <Link href="/konex-cards">
                <Button variant="outline" data-testid="button-buy-card">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Buy a Card
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards?.map((card) => {
            const cardLabel = card.nickname || `Card #${card.cardCode.slice(-4)}`;
            const tapUrl = getTapUrl(card.cardCode);

            return (
              <Card key={card.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow" data-testid={`card-nfc-${card.id}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-lg truncate" data-testid={`text-card-name-${card.id}`}>{cardLabel}</CardTitle>
                    <p className="text-sm font-mono text-muted-foreground tracking-wider" data-testid={`text-card-code-${card.id}`}>{card.cardCode}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" data-testid={`button-card-menu-${card.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleCopyLink(card.cardCode)} data-testid={`menu-copy-link-${card.id}`}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Tap Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenRename(card)} data-testid={`menu-rename-${card.id}`}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Rename Card
                      </DropdownMenuItem>
                      {card.status === "active" && (
                        <DropdownMenuItem onClick={() => suspendMutation.mutate(card.id)} data-testid={`menu-suspend-${card.id}`}>
                          <Pause className="h-4 w-4 mr-2" />
                          Suspend Card
                        </DropdownMenuItem>
                      )}
                      {(card.status === "suspended" || card.status === "lost") && (
                        <DropdownMenuItem onClick={() => reactivateMutation.mutate(card.id)} data-testid={`menu-reactivate-${card.id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          Reactivate Card
                        </DropdownMenuItem>
                      )}
                      {card.status === "active" && (
                        <DropdownMenuItem onClick={() => lostMutation.mutate(card.id)} className="text-destructive" data-testid={`menu-lost-${card.id}`}>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Mark Lost
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-xs ${tierColors[card.productTier] || tierColors.basic}`} data-testid={`badge-tier-${card.id}`}>
                      {card.productTier}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${statusColors[card.status] || statusColors.unassigned}`} data-testid={`badge-status-${card.id}`}>
                      {card.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Nfc className="h-4 w-4" />
                        <span data-testid={`text-tap-count-${card.id}`}>{card.tapCount} taps</span>
                      </div>
                      {card.lastTapAt && (
                        <span className="text-xs text-muted-foreground" data-testid={`text-last-tap-${card.id}`}>
                          {formatDistanceToNow(new Date(card.lastTapAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                    <div className="bg-white p-1.5 rounded-md">
                      <QRCodeSVG value={tapUrl} size={56} level="M" includeMargin={false} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{tapUrl}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-1 h-7 text-xs"
                        onClick={() => handleCopyLink(card.cardCode)}
                        data-testid={`button-copy-link-${card.id}`}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Card</DialogTitle>
          </DialogHeader>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter a nickname for this card"
            data-testid="input-card-nickname"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)} data-testid="button-rename-cancel">
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={renameMutation.isPending} data-testid="button-rename-save">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
