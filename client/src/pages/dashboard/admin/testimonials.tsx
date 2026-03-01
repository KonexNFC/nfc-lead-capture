import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, XCircle, Trash2, Clock, MessageSquareQuote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Testimonial } from "@shared/schema";

export default function AdminTestimonials() {
  const { toast } = useToast();

  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials"],
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/testimonials/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "Updated", description: "Testimonial status updated." });
    },
  });

  const deleteTestimonial = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "Deleted", description: "Testimonial removed." });
    },
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold" data-testid="text-admin-testimonials-title">Manage Testimonials</h1>
        <p className="text-muted-foreground mt-1">Review, approve, or reject user testimonials that appear on the homepage.</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">Loading testimonials...</CardContent>
        </Card>
      ) : !testimonials || testimonials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquareQuote className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No testimonials have been submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <Card key={t.id} data-testid={`admin-testimonial-card-${t.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold" data-testid={`admin-testimonial-name-${t.id}`}>{t.name}</span>
                      {t.title && <span className="text-sm text-muted-foreground">· {t.title}</span>}
                      {statusBadge(t.status)}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                      {Array.from({ length: 5 - t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-muted-foreground/30" />
                      ))}
                    </div>
                    <p className="text-muted-foreground" data-testid={`admin-testimonial-quote-${t.id}`}>"{t.quote}"</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "recently"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {t.status !== "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus.mutate({ id: t.id, status: "approved" })}
                        disabled={updateStatus.isPending}
                        data-testid={`button-approve-${t.id}`}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {t.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateStatus.mutate({ id: t.id, status: "rejected" })}
                        disabled={updateStatus.isPending}
                        data-testid={`button-reject-${t.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTestimonial.mutate(t.id)}
                      disabled={deleteTestimonial.isPending}
                      data-testid={`button-delete-${t.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
