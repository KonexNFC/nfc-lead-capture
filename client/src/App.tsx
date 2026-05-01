import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { ActiveProfileProvider } from "@/hooks/use-active-profile";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";

// Eagerly loaded — first thing users see
import LandingPage from "@/pages/landing";

// Lazy loaded — only downloaded when the user navigates to that route
const AuthPage = lazy(() => import("@/pages/auth"));
const Dashboard = lazy(() => import("@/pages/dashboard/index"));
const EditProfile = lazy(() => import("@/pages/dashboard/edit"));
const LeadsPage = lazy(() => import("@/pages/dashboard/leads"));
const SettingsPage = lazy(() => import("@/pages/dashboard/settings"));
const ModulesPage = lazy(() => import("@/pages/dashboard/modules"));
const AdminDashboard = lazy(() => import("@/pages/dashboard/admin/index"));
const AdminUsers = lazy(() => import("@/pages/dashboard/admin/users"));
const AdminUserDetail = lazy(() => import("@/pages/dashboard/admin/user-detail"));
const AdminLeads = lazy(() => import("@/pages/dashboard/admin/leads"));
const PublicProfile = lazy(() => import("@/pages/public-profile"));
const KonexCardsPage = lazy(() => import("@/pages/konex-cards"));
const KonexCardsTierPage = lazy(() => import("@/pages/konex-cards-tier"));
const WhatIsNfcPage = lazy(() => import("@/pages/what-is-nfc"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const TestimonialPage = lazy(() => import("@/pages/dashboard/testimonial"));
const MyCardsPage = lazy(() => import("@/pages/dashboard/cards"));
const AppearancePage = lazy(() => import("@/pages/dashboard/appearance"));
const AnalyticsPage = lazy(() => import("@/pages/dashboard/analytics"));
const AdminTestimonials = lazy(() => import("@/pages/dashboard/admin/testimonials"));
const AdminCards = lazy(() => import("@/pages/dashboard/admin/cards"));
const AdminOrders = lazy(() => import("@/pages/dashboard/admin/orders"));
const OrganizationDashboard = lazy(() => import("@/pages/dashboard/organization/index"));
const OrganizationMembers = lazy(() => import("@/pages/dashboard/organization/members"));
const OrganizationCards = lazy(() => import("@/pages/dashboard/organization/cards"));
const OrganizationSettings = lazy(() => import("@/pages/dashboard/organization/settings"));
const TapRouter = lazy(() => import("@/pages/tap-router"));
const ActivateCard = lazy(() => import("@/pages/activate-card"));
const NotFound = lazy(() => import("@/pages/not-found"));
const CheckoutPage = lazy(() => import("@/pages/checkout/index"));
const CheckoutSuccessPage = lazy(() => import("@/pages/checkout/success"));
const CheckoutCancelPage = lazy(() => import("@/pages/checkout/cancel"));
const CheckoutActivatePage = lazy(() => import("@/pages/checkout/activate"));
const RefundPolicyPage = lazy(() => import("@/pages/refund-policy"));
const PrivacyPolicyPage = lazy(() => import("@/pages/privacy-policy"));
const TermsPage = lazy(() => import("@/pages/terms"));
const LayoutShell = lazy(() => import("@/components/layout-shell").then(m => ({ default: m.LayoutShell })));

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-[#0B1120]">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

function ProtectedRoute({ component: Component, adminOnly }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!user) return <Redirect to="/auth" />;
  if (adminOnly && !user.isAdmin) return <Redirect to="/dashboard" />;

  return (
    <ActiveProfileProvider>
      <Suspense fallback={<PageLoader />}>
        <LayoutShell>
          <Component />
        </LayoutShell>
      </Suspense>
    </ActiveProfileProvider>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Landing — eager */}
        <Route path="/" component={LandingPage} />

        {/* Public */}
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
        <Route path="/refund-policy" component={RefundPolicyPage} />
        <Route path="/privacy" component={PrivacyPolicyPage} />
        <Route path="/terms" component={TermsPage} />

        {/* Checkout */}
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/checkout/success" component={CheckoutSuccessPage} />
        <Route path="/checkout/cancel" component={CheckoutCancelPage} />
        <Route path="/checkout/activate" component={CheckoutActivatePage} />

        {/* Protected */}
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

        {/* Organization */}
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

        {/* Admin shortcut */}
        <Route path="/admin">
          <Redirect to="/dashboard/admin" />
        </Route>

        {/* Admin */}
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
        <Route path="/dashboard/admin/orders">
          <ProtectedRoute component={AdminOrders} adminOnly />
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
