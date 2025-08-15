import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToHash } from "@/utils/scrollToHash";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductsSection from "@/components/ProductsSection";
import AboutSection from "@/components/AboutSection";
import DocumentsSection from "@/components/DocumentsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";


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
      <ProductsSection />
      <AboutSection />
      <DocumentsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
