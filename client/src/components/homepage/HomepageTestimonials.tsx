import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import type { Testimonial } from "@shared/schema";

export function HomepageTestimonials() {
  const { data: testimonials, isLoading, isError, refetch } = useQuery<Testimonial[]>({
    queryKey: ["/api/public/testimonials"],
  });

  // Approved demo records must not be presented as real customer endorsements.
  const customerTestimonials = testimonials?.filter(
    testimonial => testimonial.name.trim().toLowerCase() !== "demo user",
  );
  if (!isLoading && !isError && !customerTestimonials?.length) return null;

  return (
    <section id="testimonials" className="kx-section kx-reviews" aria-labelledby="kx-reviews-title">
      <div className="kx-shell">
        <div className="kx-section-heading">
          <div><p className="kx-eyebrow">In their own words</p><h2 id="kx-reviews-title" className="kx-section-title">On the other side of the tap.</h2></div>
        </div>
        {isLoading ? <div className="kx-review-loading" role="status" aria-label="Loading customer testimonials" /> : isError ? (
          <p className="kx-review-error" role="status">Customer stories couldn’t load. <button type="button" onClick={() => void refetch()}>Try again</button></p>
        ) : (
          <div className="kx-review-list">
            {customerTestimonials?.map((testimonial, index) => <figure className="kx-review" key={testimonial.id} data-testid={`testimonial-card-${index}`}>
              <div className="kx-rating" role="img" aria-label={`${testimonial.rating} out of 5 stars`} data-testid={`testimonial-rating-${index}`}>
                {Array.from({ length: Math.max(0, Math.min(5, testimonial.rating)) }, (_, star) => <Star key={star} aria-hidden="true" />)}
              </div>
              <blockquote data-testid={`testimonial-quote-${index}`}>“{testimonial.quote}”</blockquote>
              <figcaption><strong data-testid={`testimonial-name-${index}`}>{testimonial.name}</strong>{testimonial.title && <span data-testid={`testimonial-title-${index}`}> · {testimonial.title}</span>}</figcaption>
            </figure>)}
          </div>
        )}
      </div>
    </section>
  );
}
