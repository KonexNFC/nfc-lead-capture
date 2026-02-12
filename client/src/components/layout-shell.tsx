import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useActiveProfile } from "@/hooks/use-active-profile";
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
  Check
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import konexLogo from "@assets/550C626E-A2A1-4FB3-987B-240D2C74066D_1770323201397.jpeg";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const [location, setLocation] = useLocation();
  const { logout, user } = useAuth();
  const { profiles, activeProfile, setActiveProfileId } = useActiveProfile();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', href: '/dashboard/edit', icon: UserCircle },
    { name: 'Modules', href: '/dashboard/modules', icon: Blocks },
    { name: 'Leads', href: '/dashboard/leads', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ...(user?.isAdmin ? [{ name: 'Admin Panel', href: '/dashboard/admin', icon: Shield }] : []),
  ];

  const ProfileSwitcher = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-left hover-elevate transition-colors border border-border/50"
          data-testid="button-profile-switcher"
        >
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
            {activeProfile?.name?.charAt(0) || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{activeProfile?.name || "No profile"}</p>
            {activeProfile?.title && (
              <p className="text-xs text-muted-foreground truncate">{activeProfile.title}</p>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {profiles.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => setActiveProfileId(p.id)}
            className="flex items-center gap-2"
            data-testid={`menu-profile-${p.id}`}
          >
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
              {p.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm">{p.name}</p>
              {p.title && <p className="text-xs text-muted-foreground truncate">{p.title}</p>}
            </div>
            {p.id === activeProfile?.id && <Check className="h-4 w-4 text-primary shrink-0" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setLocation("/dashboard/edit?new=1")}
          data-testid="menu-create-profile"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Profile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <img src={konexLogo} alt="KONEX Logo" className="h-8 w-auto" />
        </div>
      </div>

      {profiles.length > 0 && (
        <div className="px-4 pt-4">
          <ProfileSwitcher />
        </div>
      )}
      
      <div className="flex-1 py-6 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard' 
            ? location === '/dashboard' 
            : location.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href} className={`
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
            `}>
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-background border-r border-border shrink-0 fixed h-full z-30">
        <NavContent />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src={konexLogo} alt="KONEX Logo" className="h-6 w-auto" />
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}
