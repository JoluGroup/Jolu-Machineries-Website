import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, matchPath } from "react-router-dom";
import { Suspense, lazy, type ComponentType, type ReactNode } from "react";

import ScrollToTop from "./components/ScrollToTop";
import RouteSeo from "./seo/RouteSeo";

// Lazy-loaded pages (code splitting) that can also be preloaded. A preloaded page renders synchronously, so the
// prerendered HTML (M2-SEO-01) is not replaced by the Suspense fallback on first load, and the build-time renderer can
// render every page without suspending.
type Page = ComponentType & { preload: () => Promise<void> };
function lazyPage(factory: () => Promise<{ default: ComponentType }>): Page {
  let Loaded: ComponentType | null = null;
  const Lazy = lazy(() => factory().then((m) => { Loaded = m.default; return m; }));
  const Wrapper = (() => (Loaded ? <Loaded /> : <Lazy />)) as Page;
  Wrapper.preload = () => factory().then((m) => { Loaded = m.default; });
  return Wrapper;
}

const Index = lazyPage(() => import("./pages/Index"));
const GetQuote = lazyPage(() => import("./pages/GetQuote"));
const ScheduleVisit = lazyPage(() => import("./pages/ScheduleVisit"));
const ProductList = lazyPage(() => import("./pages/ProductList"));
const ProductDetail = lazyPage(() => import("./pages/ProductDetail"));
const SpareParts = lazyPage(() => import("./pages/SpareParts"));
const Team = lazyPage(() => import("@/pages/Team"));
const Gallery = lazyPage(() => import("@/pages/Gallery"));
const News = lazyPage(() => import("@/pages/News"));
const KTNInterview = lazyPage(() => import("./pages/KTNInterview"));
const UsedTractors = lazyPage(() => import("./pages/UsedTractors"));
const Careers = lazyPage(() => import("./pages/Careers"));
const Mud4Fun = lazyPage(() => import("./pages/Mud4Fun"));
const NakuruLaunch = lazyPage(() => import("./pages/NakuruLaunch"));
const NotFound = lazyPage(() => import("./pages/NotFound"));

/** Route table: the single list used by the router, the client preloader and the build-time prerender. */
export const ROUTE_TABLE: { path: string; page: Page }[] = [
  // Core Pages
  { path: "/", page: Index },
  { path: "/quote", page: GetQuote },
  { path: "/schedule", page: ScheduleVisit },
  // Products
  { path: "/products", page: ProductList },
  { path: "/products/:slug", page: ProductDetail },
  { path: "/spare-parts", page: SpareParts },
  { path: "/used-tractors", page: UsedTractors },
  // Company
  { path: "/team", page: Team },
  { path: "/careers", page: Careers },
  // Media
  { path: "/gallery", page: Gallery },
  { path: "/news", page: News },
  { path: "/ktn-interview", page: KTNInterview },
  { path: "/mud4fun", page: Mud4Fun },
  { path: "/showroom-launch", page: NakuruLaunch },
];

/** Loads the page module for `pathname` before the first render (no fallback flash over prerendered HTML). */
export function preloadRoute(pathname: string): Promise<void> {
  const hit = ROUTE_TABLE.find((r) => matchPath({ path: r.path, end: true }, pathname));
  return (hit ? hit.page : NotFound).preload();
}

export function preloadAllRoutes(): Promise<void[]> {
  return Promise.all([...ROUTE_TABLE.map((r) => r.page.preload()), NotFound.preload()]);
}

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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </>
);

const App = () => {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
};

export default App;
