import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

import ScrollToTop from "./components/ScrollToTop";

// Lazy load pages (better performance)
const Index = lazy(() => import("./pages/Index"));
const GetQuote = lazy(() => import("./pages/GetQuote"));
const ScheduleVisit = lazy(() => import("./pages/ScheduleVisit"));
const ProductList = lazy(() => import("./pages/ProductList"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Team = lazy(() => import("@/pages/Team"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const News = lazy(() => import("@/pages/News"));
const KTNInterview = lazy(() => import("./pages/KTNInterview"));
const UsedTractors = lazy(() => import("./pages/UsedTractors"));
const Careers = lazy(() => import("./pages/Careers"));
const Mud4Fun = lazy(() => import("./pages/Mud4Fun"));
const NakuruLaunch = lazy(() => import("./pages/NakuruLaunch"));
const NotFound = lazy(() => import("./pages/NotFound"));


const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <ScrollToTop />

          <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
            <Routes>
              {/* Core Pages */}
              <Route path="/" element={<Index />} />
              <Route path="/quote" element={<GetQuote />} />
              <Route path="/schedule" element={<ScheduleVisit />} />

              {/* Products */}
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/used-tractors" element={<UsedTractors />} />

              {/* Company */}
              <Route path="/team" element={<Team />} />
              <Route path="/careers" element={<Careers />} />

              {/* Media */}
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/news" element={<News />} />
              <Route path="/ktn-interview" element={<KTNInterview />} />
              <Route path="/mud4fun" element={<Mud4Fun />} />
              <Route path="/showroom-launch" element={<NakuruLaunch />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;