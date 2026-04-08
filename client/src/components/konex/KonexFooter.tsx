import { Link } from "wouter";

export default function KonexFooter() {
  return (
    <footer className="py-8 border-t border-border/50 text-center text-muted-foreground text-sm">
      <p className="mb-3">&copy; {new Date().getFullYear()} KONEX. All rights reserved.</p>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs" style={{ color: "#4b5563" }}>
        <Link href="/terms" className="hover:underline transition-colors" data-testid="link-footer-terms">
          Terms of Service
        </Link>
        <Link href="/privacy" className="hover:underline transition-colors" data-testid="link-footer-privacy">
          Privacy Policy
        </Link>
        <Link href="/refund-policy" className="hover:underline transition-colors" data-testid="link-footer-refund">
          Refund &amp; Return Policy
        </Link>
      </div>
    </footer>
  );
}
