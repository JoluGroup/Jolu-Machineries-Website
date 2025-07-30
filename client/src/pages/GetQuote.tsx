import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

import { useState } from "react";

import { productOptions } from "@/data/options";




const GetQuote = () => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const { toast } = useToast();

  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Quote request sent",
      description: "We'll get back to you within 24 hours.",
    });
  };




  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
<main className="flex-grow bg-white dark:bg-zinc-900 text-black dark:text-white py-16">
  <div className="max-w-5xl mx-auto px-4 text-center">
    <h1 className="text-5xl font-bold mb-4">
      Request a Free Quote
    </h1>
    <p className="text-lg text-gray-700 dark:text-gray-300 mb-10">
      Let us know what machinery you need and we'll provide a custom quote tailored for you.
    </p>

    <form onSubmit={handleSubmit} className="grid gap-6 text-left">
      <div>
        <label className="block mb-2 font-medium">Full Name *</label>
        <Input placeholder="Enter your full name" required />
      </div>

      <div>
        <label className="block mb-2 font-medium">Email Address *</label>
        <Input type="email" placeholder="Enter your email" required />
      </div>

      <div>
        <label className="block mb-2 font-medium">Phone Number *</label>
        <Input type="tel" placeholder="+254 XXX XXX XXX" required />
      </div>


        <div className="grid sm:grid-cols-2 gap-4">
<div>
  <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
    County *
  </label>
  <div className="relative">
    <select
      required
    className="block w-full appearance-none rounded-md border border-input bg-white dark:bg-zinc-800 px-4 py-2 pr-10 text-sm text-gray-700 dark:text-white shadow-sm focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary-glow))] focus:outline-none transition"

    >
      <option value="">-- Select County --</option>
      <option value="Baringo">Baringo</option>
      <option value="Bomet">Bomet</option>
      <option value="Bungoma">Bungoma</option>
      <option value="Busia">Busia</option>
      <option value="Elgeyo-Marakwet">Elgeyo-Marakwet</option>
      <option value="Embu">Embu</option>
      <option value="Garissa">Garissa</option>
      <option value="Homa Bay">Homa Bay</option>
      <option value="Isiolo">Isiolo</option>
      <option value="Kajiado">Kajiado</option>
      <option value="Kakamega">Kakamega</option>
      <option value="Kericho">Kericho</option>
      <option value="Kiambu">Kiambu</option>
      <option value="Kilifi">Kilifi</option>
      <option value="Kirinyaga">Kirinyaga</option>
      <option value="Kisii">Kisii</option>
      <option value="Kisumu">Kisumu</option>
      <option value="Kitui">Kitui</option>
      <option value="Kwale">Kwale</option>
      <option value="Laikipia">Laikipia</option>
      <option value="Lamu">Lamu</option>
      <option value="Machakos">Machakos</option>
      <option value="Makueni">Makueni</option>
      <option value="Mandera">Mandera</option>
      <option value="Marsabit">Marsabit</option>
      <option value="Meru">Meru</option>
      <option value="Migori">Migori</option>
      <option value="Mombasa">Mombasa</option>
      <option value="Murang'a">Murang'a</option>
      <option value="Nairobi">Nairobi</option>
      <option value="Nakuru">Nakuru</option>
      <option value="Nandi">Nandi</option>
      <option value="Narok">Narok</option>
      <option value="Nyamira">Nyamira</option>
      <option value="Nyandarua">Nyandarua</option>
      <option value="Nyeri">Nyeri</option>
      <option value="Samburu">Samburu</option>
      <option value="Siaya">Siaya</option>
      <option value="Taita Taveta">Taita Taveta</option>
      <option value="Tana River">Tana River</option>
      <option value="Tharaka-Nithi">Tharaka-Nithi</option>
      <option value="Trans Nzoia">Trans Nzoia</option>
      <option value="Turkana">Turkana</option>
      <option value="Uasin Gishu">Uasin Gishu</option>
      <option value="Vihiga">Vihiga</option>
      <option value="Wajir">Wajir</option>
      <option value="West Pokot">West Pokot</option>
    </select>
    {/* Custom arrow icon */}
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400">
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 14a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 14z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  </div>
</div>
              <div>
                <label className="block mb-2 font-medium">Area / Town *</label>
                <Input placeholder="e.g. Kasarani" required />
              </div>
        </div>

        <div>
        <label className="block mb-2 font-medium">Product of Interest *</label>

          <select
            required
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="block w-full appearance-none rounded-md border border-input bg-white dark:bg-zinc-800 px-4 py-2 pr-10 text-sm text-gray-700 dark:text-white shadow-sm focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary-glow))] focus:outline-none transition"
          >
            <option value="" disabled>
              Select product category
            </option>
            {productOptions.map((product, idx) => (
              <option key={idx} value={product}>
                {product}
              </option>
            ))}
          </select>

        </div>
      <div>
        <label className="block mb-2 font-medium">Message *</label>
        <Textarea
          placeholder="Tell us about your farming needs, preferred equipment specifications, budget range, or any questions you have..."
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button type="submit" className="w-full sm:w-auto">
          Request Quote
        </Button>
      </div>
    </form>
  </div>
</main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default GetQuote;
