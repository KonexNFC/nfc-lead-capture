import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Sparkles,
  Crown,
  Gem,
  Nfc,
  Zap,
  Eye,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1770323201397.jpeg";

interface KonexNavProps {
  variant?: "overview" | "tier";
}

export default function KonexNav({ variant = "overview" }: KonexNavProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="w-full border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <img src={konexLogo} alt="KONEX Logo" className="h-8 w-auto cursor-pointer" style={{ mixBlendMode: "screen" }} data-testid="link-logo" />
          </Link>
          <div className="hidden md:flex items-center gap-1 ml-4">
            {variant === "overview" ? (
              <>
                <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" onClick={() => scrollTo("tiers")} data-testid="nav-tiers">
                  Cards
                </Button>
                <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" onClick={() => scrollTo("benefits")} data-testid="nav-benefits">
                  Benefits
                </Button>
                <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" onClick={() => scrollTo("compare")} data-testid="nav-compare">
                  Compare
                </Button>
                <Link href="/what-is-nfc">
                  <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" data-testid="nav-what-is-nfc">
                    What is NFC
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/konex-cards">
                <Button variant="ghost" size="sm" className="font-medium text-muted-foreground" data-testid="nav-all-cards">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  All Cards
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-nav-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {variant === "overview" ? (
                <>
                  <DropdownMenuItem onClick={() => scrollTo("tiers")} data-testid="menu-tiers">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Cards
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => scrollTo("benefits")} data-testid="menu-benefits">
                    <Zap className="h-4 w-4 mr-2" />
                    Benefits
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => scrollTo("compare")} data-testid="menu-compare">
                    <Eye className="h-4 w-4 mr-2" />
                    Compare
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <Link href="/what-is-nfc">
                    <DropdownMenuItem data-testid="menu-what-is-nfc">
                      <Nfc className="h-4 w-4 mr-2" />
                      What is NFC
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/konex-cards">
                    <DropdownMenuItem data-testid="menu-all-cards">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      All Cards
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/konex-cards/basic">
                    <DropdownMenuItem data-testid="menu-tier-basic">
                      <Sparkles className="h-4 w-4 mr-2" />
                      KONEX Basic
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/konex-cards/premium">
                    <DropdownMenuItem data-testid="menu-tier-premium">
                      <Crown className="h-4 w-4 mr-2" />
                      KONEX Premium
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/konex-cards/elite">
                    <DropdownMenuItem data-testid="menu-tier-elite">
                      <Gem className="h-4 w-4 mr-2" />
                      KONEX Elite
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/auth">
            <Button variant="ghost" className="font-medium" data-testid="button-login">Log in</Button>
          </Link>
          <Link href="/auth?tab=register">
            <Button className="font-semibold shadow-lg shadow-primary/20" data-testid="button-get-started">Sign Up Free</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
