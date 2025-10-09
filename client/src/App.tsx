import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import GetQuote from "./pages/GetQuote";
import NotFound from "./pages/NotFound";
import ScheduleVisit from "./pages/ScheduleVisit";
import ScrollToTop from "./components/ScrollToTop";

import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";

import Team from "@/pages/Team";
import Gallery from "@/pages/Gallery";
import News from "@/pages/News";
import KTNInterview from "./pages/KTNInterview";
import UsedTractors from "./pages/UsedTractors";
import Careers from "./pages/Careers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quote" element={<GetQuote />} />
          <Route path="/schedule" element={<ScheduleVisit />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/team" element={<Team />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/news" element={<News />} />
          <Route path="/ktn-interview" element={<KTNInterview />} />
          <Route path="/used-tractors" element={<UsedTractors />} />
          <Route path="/careers" element={<Careers />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
