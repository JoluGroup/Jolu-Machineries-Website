import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const galleryItems = [
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/jolu-group.jpg`,
    caption: "Jolu Team at the Head Office, Nairobi",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/jolu-team.jpg`,
    caption: "The Jolu Group",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/jolu-boardroom.jpg`,
    caption: "The Jolu Team in Boardroom – Nairobi",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/directors.jpg`,
    caption: "Jolu Group Directors ",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/ceo.jpg`,
    caption: "Jolu Group CEO",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/managing-director.jpg`,
    caption: "Jolu Group Managing Director",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/head-of-business.jpg`,
    caption: "The Jolu Group Head of Business",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/john-tractor-1.jpg`,
    caption: "Our CEO at the Nakuru Godown",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/contract.jpg`,
    caption: "Contract Signing with a Valued Partner",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/shem-tractor.jpg`,
    caption: "General Manager at Our Migori Branch",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/handover-4.jpg`,
    caption: "Delighted Client During Tractor Handover – Eldoret",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/tractor-2.jpg`,
    caption: "Zoomlion Tractor on Display",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/zoomlion-tractor.jpg`,
    caption: "Zoomlion Tractor Model Featured at Our Showroom",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/godown-2.jpg`,
    caption: "Wide Inventory at Jolu Agricultural Machineries Showroom",
  },
  {
    src: `${import.meta.env.BASE_URL}lovable-uploads/gallery/handover-3.jpg`,
    caption: "Client Zoomlion Tractor Handover –  Nandi Hills",
  },
];

const Gallery = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black transition-colors duration-500">
      <Header />
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 relative">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Gallery</h1>
          <div className="absolute top-3/4 left-0 right-0 h-1 bg-green-700 max-w-[100px] mx-auto mt-2"></div>
        </div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          initial="hidden"
          whileInView="visible"
          transition={{ staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="relative group overflow-hidden rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors duration-500"
            >
              <img
                src={item.src}
                alt={item.caption}
                className="w-full h-72 object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs sm:text-sm text-center px-3 py-2 transition-opacity duration-300">
                {item.caption}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
