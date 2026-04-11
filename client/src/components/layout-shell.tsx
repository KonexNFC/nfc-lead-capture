import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useActiveProfile } from "@/hooks/use-active-profile";
import { useActiveOrg } from "@/hooks/use-active-org";
import { 
  LayoutDashboard, 
  UserCircle, 
  Users, 
  Settings,
  LogOut, 
  Menu,
  X,
  Blocks,
  Shield,
  ChevronDown,
  Plus,
  Check,
  MessageSquareQuote,
  CreditCard,
  Building2,
  Palette,
  BarChart2,
  Package,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1770323201397.jpeg";
import { ThemeProvider, useTheme } from "@/hooks/use-theme";

interface LayoutShellProps {
  children: React.ReactNode;
}

function LayoutShellInner({ children }: LayoutShellProps) {
  const [location, setLocation] = useLocation();
  const { logout, user } = useAuth();
  const { profiles, activeProfile, setActiveProfileId } = useActiveProfile();
  const { orgs } = useActiveOrg();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const hasOrg = user?.isAdmin || (orgs && orgs.length > 0);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', href: '/dashboard/edit', icon: UserCircle },
    { name: 'Modules', href: '/dashboard/modules', icon: Blocks },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Leads', href: '/dashboard/leads', icon: Users },
    { name: 'My Cards', href: '/dashboard/cards', icon: CreditCard },
    { name: 'Appearance', href: '/dashboard/appearance', icon: Palette },
    ...(hasOrg ? [{ name: 'Organization', href: '/dashboard/organization', icon: Building2 }] : []),
    { name: 'Leave a Review', href: '/dashboard/testimonial', icon: MessageSquareQuote },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ...(user?.isAdmin ? [
      { name: 'Admin Panel', href: '/dashboard/admin', icon: Shield },
      { name: 'Card Inventory', href: '/dashboard/admin/cards', icon: CreditCard },
      { name: 'Orders', href: '/dashboard/admin/orders', icon: Package },
    ] : []),
  ];

  const [switcherOpen, setSwitcherOpen] = useState(false);

  const handleSelectProfile = (id: number) => {
    setActiveProfileId(id);
    setSwitcherOpen(false);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    setSwitcherOpen(false);
    setIsOpen(false);
    setLocation("/dashboard/edit?new=1");
  };

  const ProfileSwitcher = () => (
    <div>
      <button
        onClick={() => setSwitcherOpen(!switcherOpen)}
        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200 border border-white/6 hover:border-white/12 hover:bg-white/4"
        data-testid="button-profile-switcher"
      >
        <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold shrink-0 text-sm">
          {activeProfile?.name?.charAt(0) || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate text-white">{activeProfile?.name || "No profile"}</p>
          {activeProfile?.title && (
            <p className="text-xs text-white/40 truncate">{activeProfile.title}</p>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-white/30 shrink-0 transition-transform ${switcherOpen ? "rotate-180" : ""}`} />
      </button>
      {switcherOpen && (
        <div className="mt-1 rounded-xl border border-white/6 overflow-hidden" style={{ background: "#22222E" }}>
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectProfile(p.id)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-all duration-200 hover:bg-white/5"
              data-testid={`menu-profile-${p.id}`}
            >
              <div className="h-6 w-6 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                {p.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-white/80">{p.name}</p>
                {p.title && <p className="text-xs text-white/35 truncate">{p.title}</p>}
              </div>
              {p.id === activeProfile?.id && <Check className="h-4 w-4 text-blue-400 shrink-0" />}
            </button>
          ))}
          <div className="border-t border-white/6">
            <button
              onClick={handleCreateNew}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-all duration-200 hover:bg-white/5 text-white/40 hover:text-white/70"
              data-testid="menu-create-profile"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Profile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const NavContent = () => (
    <div className="flex flex-col h-full" style={{ background: "#181820" }}>
      <div className="p-6 border-b border-white/6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <img src={konexLogo} alt="KONEX Logo" className="h-8 w-auto" style={{ filter: "invert(1)", mixBlendMode: "screen" }} />
        </Link>
      </div>

      {profiles.length > 0 && (
        <div className="px-4 pt-4">
          <ProfileSwitcher />
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard' 
            ? location === '/dashboard' 
            : location.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href} className={`
              flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'bg-blue-600 text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]'
                : 'text-white/50 hover:text-white hover:bg-white/6'}
            `}>
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/6 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-white/50 hover:text-white hover:bg-white/6"
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4 shrink-0" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 shrink-0" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: "#22222E" }}>
          <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost"
          className="w-full justify-start gap-2 text-white/40 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );

  const mainBg = theme === "light" ? "hsl(220 20% 97%)" : "#13131A";

  return (
    <div className="min-h-screen flex" style={{ background: "#13131A" }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0 fixed h-full z-30 border-r border-white/6" style={{ background: "#181820" }}>
        <NavContent />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 backdrop-blur-xl border-b border-white/6 z-40 flex items-center justify-between px-4" style={{ background: "rgba(19,19,26,0.9)" }}>
        <Link href="/" className="flex items-center gap-2">
          <img src={konexLogo} alt="KONEX Logo" className="h-6 w-auto" style={{ filter: "invert(1)", mixBlendMode: "screen" }} />
        </Link>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-white/6" style={{ background: "#181820" }}>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main
        className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen transition-colors duration-300"
        style={{ background: mainBg }}
      >
        <div
          data-theme={theme}
          className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 animate-in"
        >
          {children}
        </div>
      </main>
    </div>
  );
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <ThemeProvider>
      <LayoutShellInner>{children}</LayoutShellInner>
    </ThemeProvider>
  );
}
