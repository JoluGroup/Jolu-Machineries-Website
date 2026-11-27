import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SparePartsSection from "@/components/SparePartsSection";

const SpareParts = () => {
  return (
    <>
      <Header />
      <main>
        {/* One h1 per route (M2-SEO-01); visually hidden so the established design is unchanged. */}
        <h1 className="sr-only">Spare Parts for Zoomlion Machinery</h1>
        <SparePartsSection />
      </main>
      <Footer />
    </>
  );
};

export default SpareParts;
