import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, type ReactNode } from "react";

import ScrollToTop from "./components/ScrollToTop";
import RouteSeo from "./seo/RouteSeo";
import { CATCH_ALL, ROUTE_TABLE } from "./routeTable";
import ConsentBanner from "@/privacy/ConsentBanner";

const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {children}
    </TooltipProvider>
  </QueryClientProvider>
);

/** Everything inside the router; rendered by BrowserRouter in the browser and StaticRouter at build time. */
export const AppRoutes = () => (
  <>
    <ScrollToTop />
    <RouteSeo />

    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <Routes>
        {ROUTE_TABLE.map(({ path, page: Page }) => (
          <Route key={path} path={path} element={<Page />} />
        ))}

        {/* Catch-all */}
        <Route path={CATCH_ALL.path} element={<CATCH_ALL.page />} />
      </Routes>
    </Suspense>
  </>
);

const App = () => {
  return (
    <AppProviders>
      {/* Browser-only: renders nothing until mount and only when analytics is configured (M2-PRIVACY-01).
          Kept out of AppProviders so the build-time prerender output is unaffected. */}
      <ConsentBanner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
};

export default App;
