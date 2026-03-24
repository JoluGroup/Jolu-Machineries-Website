// src/pages/Mud4Fun.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Youtube, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Mud4Fun: React.FC = () => {
  const metaTitle = "Mud4Fun 4x4 Challenge Highlights — Dec 2025";
  const metaDescription =
    "Jolu Group proudly partnered in the Mud4Fun 4x4 Challenge in Naivasha, providing security and equipment support.";

  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    document.title = metaTitle;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = metaDescription;
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const highlights = [
    { type: "image", src: "/lovable-uploads/mud4fun/security1.jpg", alt: "Security team at the event" },
    { type: "image", src: "/lovable-uploads/mud4fun/tractor1.jpg", alt: "Tractor helping a vehicle" },
    { type: "video", src: "https://www.youtube.com/embed/CXWhcNIrnFw", alt: "Mud4Fun 4x4 highlight" },
    { type: "image", src: "/lovable-uploads/mud4fun/prize.jpg", alt: "Partnership prize" },
  ];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="relative h-[70vh] flex items-center justify-center bg-black">
        <img
          src="/lovable-uploads/mud4fun/hero.jpg"
          alt="Mud4Fun Event"
          className="absolute inset-0 w-full h-full object-cover object-bottom opacity-60"
        />

        <div className="absolute inset-0 bg-black/30" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center px-4 max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Mud4Fun 4x4 Challenge
          </h1>
          <p className="text-lg text-zinc-200">
            Power, performance, and partnership — Jolu Group supporting an unforgettable off-road experience.
          </p>
        </motion.div>
      </section>

      <main className="bg-white dark:bg-green-900 text-zinc-900 dark:text-zinc-100 py-16">
        <div className="container mx-auto px-4 max-w-6xl space-y-20">

          {/* HIGHLIGHTS */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--primary))]">
              Event Highlights
            </h2>
            <ul className="grid md:grid-cols-2 gap-4 text-lg">
              <li>✔ Professional security & crowd management</li>
              <li>✔ Tractor recovery & terrain support</li>
              <li>✔ Extreme off-road action</li>
              <li>✔ Media coverage & partnerships</li>
            </ul>
          </motion.section>

          {/* MEDIA */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-8 text-[hsl(var(--primary))]">
              Photos & Videos
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {highlights.map((item, idx) =>
                item.type === "image" ? (
                  <motion.img
                    key={idx}
                    src={item.src}
                    alt={item.alt}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-2xl shadow-xl h-64 w-full object-cover cursor-pointer"
                  />
                ) : (
                  <Dialog key={idx}>
                    <DialogTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative rounded-2xl shadow-xl overflow-hidden cursor-pointer"
                      >
                        <img
                          src="https://img.youtube.com/vi/CXWhcNIrnFw/hqdefault.jpg"
                          alt={item.alt}
                          className="h-64 w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Youtube className="w-16 h-16 text-white" />
                        </div>
                      </motion.div>
                    </DialogTrigger>

                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Mud4Fun Highlight</DialogTitle>
                      </DialogHeader>
                      <iframe
                        width="315"
                        height="576"
                        src={item.src}
                        allowFullScreen
                        className="rounded-xl mx-auto"
                      />
                    </DialogContent>
                  </Dialog>
                )
              )}
            </div>
          </motion.section>

          {/* QUICK FACTS */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-8 shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4 text-[hsl(var(--primary))]">
              Quick Facts
            </h3>
            <ul className="space-y-3 text-lg">
              <li><Calendar className="inline mr-2" /> Dec 12–15, 2025</li>
              <li><MapPin className="inline mr-2" /> Naivasha, South Lake</li>
              <li><Users className="inline mr-2" /> Security & Equipment Support</li>
            </ul>
          </motion.aside>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild>
              <a href="mailto:info@jolugroup.com">Email Us</a>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/quote">Request a Quote</Link>
            </Button>
          </motion.div>
        </div>

        {showScroll && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-[hsl(var(--primary))] text-white p-4 rounded-full shadow-xl"
          >
            <ArrowUp />
          </motion.button>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Mud4Fun;
