import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToHash } from "@/utils/scrollToHash";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryJump from "@/components/CategoryJump";
import ProductsSection from "@/components/ProductsSection";
import AboutSection from "@/components/AboutSection";
import DocumentsSection from "@/components/DocumentsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { Reveal } from "@/components/Reveal";


const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Delay ensures content has rendered before scroll
      setTimeout(() => {
        scrollToHash(location.hash);
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      {/* Each wrapper fades + slides up once as it scrolls into view (native IntersectionObserver).
          AboutSection keeps its own framer-motion entrance, so it is intentionally not wrapped. */}
      <Reveal>
        <CategoryJump />
      </Reveal>
      <Reveal>
        <ProductsSection />
      </Reveal>
      <AboutSection />
      <Reveal>
        <DocumentsSection />
      </Reveal>
      <Reveal>
        <ContactSection />
      </Reveal>
      <Footer />
    </div>
  );
};

export default Index;
