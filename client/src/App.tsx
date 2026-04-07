import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { ActiveProfileProvider } from "@/hooks/use-active-profile";
import { Loader2 } from "lucide-react";

// Pages
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard/index";
import EditProfile from "@/pages/dashboard/edit";
import LeadsPage from "@/pages/dashboard/leads";
import SettingsPage from "@/pages/dashboard/settings";
import ModulesPage from "@/pages/dashboard/modules";
import AdminDashboard from "@/pages/dashboard/admin/index";
import AdminUsers from "@/pages/dashboard/admin/users";
import AdminUserDetail from "@/pages/dashboard/admin/user-detail";
import AdminLeads from "@/pages/dashboard/admin/leads";
import PublicProfile from "@/pages/public-profile";
import KonexCardsPage from "@/pages/konex-cards";
import KonexCardsTierPage from "@/pages/konex-cards-tier";
import WhatIsNfcPage from "@/pages/what-is-nfc";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import TestimonialPage from "@/pages/dashboard/testimonial";
import MyCardsPage from "@/pages/dashboard/cards";
import AppearancePage from "@/pages/dashboard/appearance";
import AnalyticsPage from "@/pages/dashboard/analytics";
import AdminTestimonials from "@/pages/dashboard/admin/testimonials";
import AdminCards from "@/pages/dashboard/admin/cards";
import OrganizationDashboard from "@/pages/dashboard/organization/index";
import OrganizationMembers from "@/pages/dashboard/organization/members";
import OrganizationCards from "@/pages/dashboard/organization/cards";
import OrganizationSettings from "@/pages/dashboard/organization/settings";
import TapRouter from "@/pages/tap-router";
import ActivateCard from "@/pages/activate-card";
import NotFound from "@/pages/not-found";
import CheckoutPage from "@/pages/checkout/index";
import CheckoutSuccessPage from "@/pages/checkout/success";
import CheckoutCancelPage from "@/pages/checkout/cancel";
import CheckoutActivatePage from "@/pages/checkout/activate";

// Protected Route Wrapper
function ProtectedRoute({ component: Component, adminOnly }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <ActiveProfileProvider>
      <LayoutShell>
        <Component />
      </LayoutShell>
    </ActiveProfileProvider>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/u/:slug" component={PublicProfile} />
      <Route path="/konex-cards" component={KonexCardsPage} />
      <Route path="/konex-cards/:tierId">
        {(params) => <KonexCardsTierPage tierId={params.tierId} />}
      </Route>
      <Route path="/what-is-nfc" component={WhatIsNfcPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/t/:cardCode">
        {(params) => <TapRouter cardCode={params.cardCode} />}
      </Route>
      <Route path="/activate/:cardCode">
        {(params) => <ActivateCard cardCode={params.cardCode} />}
      </Route>
      <Route path="/activate">
        <ActivateCard />
      </Route>

      {/* Checkout Routes */}
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/checkout/success" component={CheckoutSuccessPage} />
      <Route path="/checkout/cancel" component={CheckoutCancelPage} />
      <Route path="/checkout/activate" component={CheckoutActivatePage} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/dashboard/edit">
        <ProtectedRoute component={EditProfile} />
      </Route>
      <Route path="/dashboard/leads">
        <ProtectedRoute component={LeadsPage} />
      </Route>
      <Route path="/dashboard/modules">
        <ProtectedRoute component={ModulesPage} />
      </Route>
      <Route path="/dashboard/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route path="/dashboard/testimonial">
        <ProtectedRoute component={TestimonialPage} />
      </Route>
      <Route path="/dashboard/cards">
        <ProtectedRoute component={MyCardsPage} />
      </Route>
      <Route path="/dashboard/appearance">
        <ProtectedRoute component={AppearancePage} />
      </Route>
      <Route path="/dashboard/analytics">
        <ProtectedRoute component={AnalyticsPage} />
      </Route>

      {/* Organization Routes */}
      <Route path="/dashboard/organization">
        <ProtectedRoute component={OrganizationDashboard} />
      </Route>
      <Route path="/dashboard/organization/members">
        <ProtectedRoute component={OrganizationMembers} />
      </Route>
      <Route path="/dashboard/organization/cards">
        <ProtectedRoute component={OrganizationCards} />
      </Route>
      <Route path="/dashboard/organization/settings">
        <ProtectedRoute component={OrganizationSettings} />
      </Route>

      {/* Admin shortcut redirect */}
      <Route path="/admin">
        <Redirect to="/dashboard/admin" />
      </Route>

      {/* Admin Routes */}
      <Route path="/dashboard/admin">
        <ProtectedRoute component={AdminDashboard} adminOnly />
      </Route>
      <Route path="/dashboard/admin/users">
        <ProtectedRoute component={AdminUsers} adminOnly />
      </Route>
      <Route path="/dashboard/admin/users/:id">
        {(params) => (
          <ProtectedRoute component={() => <AdminUserDetail params={params} />} adminOnly />
        )}
      </Route>
      <Route path="/dashboard/admin/leads">
        <ProtectedRoute component={AdminLeads} adminOnly />
      </Route>
      <Route path="/dashboard/admin/testimonials">
        <ProtectedRoute component={AdminTestimonials} adminOnly />
      </Route>
      <Route path="/dashboard/admin/cards">
        <ProtectedRoute component={AdminCards} adminOnly />
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
