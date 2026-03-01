import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Star, MessageSquareQuote, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTestimonialSchema } from "@shared/schema";
import type { Testimonial, InsertTestimonial } from "@shared/schema";
import { z } from "zod";

const testimonialFormSchema = insertTestimonialSchema.extend({
  name: z.string().min(1, "Name is required"),
  quote: z.string().min(10, "Review must be at least 10 characters").max(500, "Review must be under 500 characters"),
  rating: z.number().int().min(1).max(5),
});

type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

export default function TestimonialPage() {
  const { toast } = useToast();
  const [hoveredStar, setHoveredStar] = useState(0);

  const { data: myTestimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials/mine"],
  });

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      name: "",
      title: "",
      quote: "",
      rating: 5,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (values: TestimonialFormValues) => {
      await apiRequest("POST", "/api/testimonials", {
        ...values,
        title: values.title || undefined,
      });
    },
    onSuccess: () => {
      toast({ title: "Thank you!", description: "Your testimonial has been submitted for review." });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials/mine"] });
      form.reset();
    },
    onError: (err: Error) => {
      const msg = err.message?.includes("already submitted")
        ? "You have already submitted a testimonial."
        : "Something went wrong. Please try again.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const hasExisting = myTestimonials && myTestimonials.length > 0;
  const existing = hasExisting ? myTestimonials[0] : null;

  const statusIcon = {
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    approved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    rejected: <XCircle className="h-4 w-4 text-red-500" />,
  };

  const statusLabel = {
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Not Approved",
  };

  const currentRating = form.watch("rating");
  const currentQuote = form.watch("quote");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold" data-testid="text-page-title">Leave a Review</h1>
        <p className="text-muted-foreground mt-1">Share your experience with KONEX and help others discover what makes it great.</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground" data-testid="text-loading">Loading...</CardContent>
        </Card>
      ) : hasExisting ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5" />
              Your Testimonial
            </CardTitle>
            <CardDescription>You've already submitted a review. Here's what you wrote.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-6 rounded-xl border border-border/50">
              <div className="flex items-center gap-1 mb-3" data-testid="testimonial-my-rating">
                {Array.from({ length: existing!.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
                {Array.from({ length: 5 - existing!.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-muted-foreground/30" />
                ))}
              </div>
              <p className="text-foreground mb-4" data-testid="testimonial-my-quote">"{existing!.quote}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm" data-testid="testimonial-my-name">{existing!.name}</p>
                  {existing!.title && <p className="text-xs text-muted-foreground" data-testid="testimonial-my-title">{existing!.title}</p>}
                </div>
                <div className="flex items-center gap-1.5 text-sm" data-testid="testimonial-my-status">
                  {statusIcon[existing!.status as keyof typeof statusIcon] || statusIcon.pending}
                  <span className="text-muted-foreground">{statusLabel[existing!.status as keyof typeof statusLabel] || "Pending"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareQuote className="h-5 w-5" />
              Write Your Review
            </CardTitle>
            <CardDescription>Your testimonial will appear on the homepage once approved by an admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => submitMutation.mutate(values))} className="space-y-6">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-1" data-testid="input-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => field.onChange(star)}
                              onMouseEnter={() => setHoveredStar(star)}
                              onMouseLeave={() => setHoveredStar(0)}
                              className="p-0.5"
                              data-testid={`button-star-${star}`}
                            >
                              <Star
                                className={`h-7 w-7 transition-colors ${
                                  star <= (hoveredStar || currentRating)
                                    ? "fill-primary text-primary"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Sarah Mitchell" data-testid="input-testimonial-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title / Role (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Marketing Director" data-testid="input-testimonial-title" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="quote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Review</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us how KONEX has helped you grow your network..."
                          rows={4}
                          data-testid="input-testimonial-quote"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">{currentQuote.length}/500 characters</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={submitMutation.isPending} data-testid="button-submit-testimonial">
                  {submitMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
