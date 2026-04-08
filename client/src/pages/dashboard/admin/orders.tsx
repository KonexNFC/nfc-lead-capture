import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Package, CheckCircle2, Clock, XCircle, Truck, AlertTriangle, RotateCcw, Search, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft:              { label: "Draft",              color: "#6b7280", icon: <Clock size={12} /> },
  created:            { label: "Created",            color: "#3b82f6", icon: <Clock size={12} /> },
  activation_pending: { label: "Pending Activation", color: "#f59e0b", icon: <Clock size={12} /> },
  activated:          { label: "Activated",          color: "#10b981", icon: <CheckCircle2 size={12} /> },
  shipped:            { label: "Shipped",            color: "#8b5cf6", icon: <Truck size={12} /> },
  failed:             { label: "Failed",             color: "#ef4444", icon: <XCircle size={12} /> },
  refunded:           { label: "Refunded",           color: "#6b7280", icon: <RotateCcw size={12} /> },
  disputed:           { label: "Disputed",           color: "#f97316", icon: <AlertTriangle size={12} /> },
};

interface Order {
  id: number;
  status: string;
  sku: string;
  productType: string;
  amount: string;
  currency: string;
  customerName: string | null;
  customerEmail: string | null;
  shippingAddress: string | null;
  shippedAt: string | null;
  disputedAt: string | null;
  refundedAt: string | null;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [trackingInfo, setTrackingInfo] = useState("");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const shipMutation = useMutation({
    mutationFn: (params: { orderId: number; trackingInfo: string }) =>
      apiRequest("POST", "/api/admin/orders/ship", params),
    onSuccess: () => {
      toast({ title: "Order marked as shipped", description: "Customer has been notified by email." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setShippingOrder(null);
      setTrackingInfo("");
    },
    onError: () => {
      toast({ title: "Failed to update order", variant: "destructive" });
    },
  });

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.sku.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: orders.length,
    activated: orders.filter((o) => o.status === "activated" || o.status === "shipped").length,
    pendingShip: orders.filter((o) => o.status === "activated" && o.productType === "physical_card" && !o.shippedAt).length,
    revenue: orders
      .filter((o) => ["activation_pending", "activated", "shipped"].includes(o.status))
      .reduce((sum, o) => sum + parseFloat(o.amount || "0"), 0),
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">Track, fulfil, and manage all KONEX orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats.total, icon: <Package size={18} /> },
          { label: "Activated", value: stats.activated, icon: <CheckCircle2 size={18} /> },
          { label: "Awaiting Shipment", value: stats.pendingShip, icon: <Truck size={18} />, urgent: stats.pendingShip > 0 },
          { label: "Revenue (GBP)", value: `£${stats.revenue.toFixed(2)}`, icon: <CheckCircle2 size={18} /> },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 border"
            style={{
              background: s.urgent ? "rgba(249,115,22,0.08)" : "var(--card)",
              borderColor: s.urgent ? "rgba(249,115,22,0.4)" : undefined,
            }}
            data-testid={`stat-${s.label.toLowerCase().replace(/ /g, "-")}`}
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2" style={{ color: s.urgent ? "#f97316" : undefined }}>
              {s.icon}
              <span className="text-xs font-medium">{s.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: s.urgent ? "#f97316" : undefined }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer, email, SKU or order #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-orders"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(STATUS_META).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const meta = STATUS_META[order.status] || { label: order.status, color: "#6b7280", icon: null };
                  const needsShipping = order.productType === "physical_card" && order.status === "activated" && !order.shippedAt;
                  return (
                    <tr key={order.id} className="border-b hover:bg-muted/20 transition-colors" data-testid={`row-order-${order.id}`}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium">#{order.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{order.customerName || "—"}</p>
                          <p className="text-muted-foreground text-xs">{order.customerEmail || "—"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{order.sku}</p>
                          <p className="text-muted-foreground text-xs capitalize">{order.productType.replace("_", " ")}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">£{order.amount}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                          style={{ background: `${meta.color}20`, color: meta.color }}
                          data-testid={`status-${order.id}`}
                        >
                          {meta.icon} {meta.label}
                        </span>
                        {order.shippedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Shipped {new Date(order.shippedAt).toLocaleDateString()}
                          </p>
                        )}
                        {order.shippingAddress && !order.shippedAt && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-[160px] truncate" title={order.shippingAddress}>
                            📍 {order.shippingAddress}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        {needsShipping && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => setShippingOrder(order)}
                            data-testid={`button-ship-${order.id}`}
                          >
                            <Truck size={12} className="mr-1" /> Mark Shipped
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Truck size={12} /> Shipped
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ship modal */}
      <Dialog open={!!shippingOrder} onOpenChange={(open) => { if (!open) { setShippingOrder(null); setTrackingInfo(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Order #{shippingOrder?.id} as Shipped</DialogTitle>
            <DialogDescription>
              The customer ({shippingOrder?.customerEmail}) will receive a shipping confirmation email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {shippingOrder?.shippingAddress && (
              <div className="rounded-lg p-3 bg-muted text-sm">
                <p className="font-medium text-xs text-muted-foreground mb-1">Shipping to</p>
                <p className="whitespace-pre-line">{shippingOrder.shippingAddress}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">Tracking info (optional)</label>
              <Input
                placeholder="e.g. Royal Mail 1Z999AA10123456784"
                value={trackingInfo}
                onChange={(e) => setTrackingInfo(e.target.value)}
                data-testid="input-tracking-info"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShippingOrder(null); setTrackingInfo(""); }}>
                Cancel
              </Button>
              <Button
                onClick={() => shippingOrder && shipMutation.mutate({ orderId: shippingOrder.id, trackingInfo })}
                disabled={shipMutation.isPending}
                data-testid="button-confirm-ship"
              >
                {shipMutation.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <Truck size={14} className="mr-2" />}
                Confirm Shipped
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
