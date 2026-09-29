import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/error-boundary';
import { AgriLayout } from '@/components/agri-layout';
import Dashboard from '@/pages/dashboard';
import Crops from '@/pages/crops';
import AdvisoryNew from '@/pages/advisory-new';
import AdvisoryDetailPage from '@/pages/advisory-detail';
import History from '@/pages/history';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  return <RoutedErrorBoundary><AgriLayout><Switch><Route path="/" component={Dashboard} /><Route path="/crops" component={Crops} /><Route path="/advisory/new" component={AdvisoryNew} /><Route path="/advisory/:id" component={AdvisoryDetailPage} /><Route path="/history" component={History} /><Route component={NotFound} /></Switch></AgriLayout></RoutedErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;