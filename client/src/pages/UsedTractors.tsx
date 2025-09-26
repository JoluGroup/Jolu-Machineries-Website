// src/pages/UsedTractors.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Cog, Gauge, Weight, Tractor } from "lucide-react";

const UsedTractors = () => {
  // Images for RX754A
  const images = [
    "/lovable-uploads/used/rx754a-1.jpeg",
    "/lovable-uploads/used/rx754a-2.jpeg",
    "/lovable-uploads/used/rx754a-3.jpeg",
    "/lovable-uploads/used/rx754a-4.jpeg",
    "/lovable-uploads/used/rx754a-5.jpeg",
    "/lovable-uploads/used/rx754a-6.jpeg",
    "/lovable-uploads/used/rx754a-7.jpeg",
    "/lovable-uploads/used/rx754a-8.jpeg",
    "/lovable-uploads/used/rx754a-9.jpeg",
  ];

  return (
    <div className="bg-background text-foreground dark:bg-background dark:text-foreground">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative hero-gradient">
        <img
          src={images[0]}
          alt="RX754-A Tractor"
          className="w-full h-[400px] md:h-[600px] lg:h-[700px] object-cover rounded-b-2xl"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-3xl md:text-5xl font-bold">
            RK754-A Slightly Used Tractor with Plough for Sale
          </h1>
          <p className="mt-4 max-w-2xl">
            A powerful, reliable, and cost-friendly tractor ideal for farmers
            looking for performance and durability at a reduced price.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="btn-quote"
              onClick={() => (window.location.href = "/quote")}
            >
              Request a Quote
            </Button>
            <a
              href="https://wa.me/254705038679"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Photo Gallery</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="w-full aspect-[4/3] rounded-lg overflow-hidden hover:scale-105 transition-transform"
            >
              <img
                src={img}
                alt={`RX754-A ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Key Highlights */}
      <section className="bg-muted dark:bg-muted-foreground py-12 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Key Highlights</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Gauge className="text-primary" />
            <span>Horse Power: 75 hp</span>
          </div>
          <div className="flex items-center space-x-3">
            <Cog className="text-primary" />
            <span>Number of Gears: 12F+12R</span>
          </div>
          <div className="flex items-center space-x-3">
            <Weight className="text-primary" />
            <span>Weight: 3,200 kg</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-primary" />
            <span>Fuel-efficient engine</span>
          </div>
          <div className="flex items-center space-x-3">
            <Tractor className="text-primary" />
            <span>Easy handling with hydraulic steering</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="text-primary" />
            <span>Great ground clearance</span>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="container mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Advantages</h2>
        <ul className="space-y-3 max-w-2xl mx-auto list-disc list-inside">
          <li>Four-cylinder diesel engine with high torque.</li>
          <li>Reliable gearbox for multiple field operations.</li>
          <li>Hydraulic lifting system for heavy implements.</li>
          <li>Fuel economy suited for small & medium farms.</li>
          <li>Comfortable operator space with optional canopy.</li>
        </ul>
      </section>

      {/* Specifications Table */}
      <section className="bg-muted dark:bg-muted-foreground py-12 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Specifications</h2>
        <div className="overflow-x-auto">
          <table className="table-auto mx-auto border-collapse border border-border">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="px-4 py-2">Specification</th>
                <th className="px-4 py-2">RX754-A</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">Overall Dimension (L×W×H)</td>
                <td className="border px-4 py-2">4000 × 1800 × 2450 mm</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Wheelbase</td>
                <td className="border px-4 py-2">2200 mm</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Weight</td>
                <td className="border px-4 py-2">3200 kg</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Engine Power</td>
                <td className="border px-4 py-2">75 hp</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Gearbox</td>
                <td className="border px-4 py-2">12F+12R</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">PTO Speed</td>
                <td className="border px-4 py-2">540/1000 rpm</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Ground Clearance</td>
                <td className="border px-4 py-2">400 mm</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Suspension</td>
                <td className="border px-4 py-2">Class II, three-point</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="text-center py-12 px-4">
        <h2 className="text-2xl font-bold mb-4">
          Looking for a tractor that combines power and affordability?
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="btn-quote"
            onClick={() => (window.location.href = "/quote")}
          >
            Request a Quote
          </Button>
          <a
            href="https://wa.me/254705038679"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Chat on WhatsApp
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UsedTractors;
