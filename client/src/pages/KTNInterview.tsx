// src/pages/KTNInterview.tsx
import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const KTNInterview = () => {
  return (
    <>
      <Header />

      {/* Hero Banner */}
      <div className="relative w-full h-72 md:h-[28rem] mb-12">
        <img
          src="/lovable-uploads/ktn/ktnbanner.jpg"
          alt="KTN Interview Banner"
          className="w-full h-full object-cover rounded-b-2xl"
        />
        {/* Text directly on top of image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-extrabold text-white text-center px-4"
          >
            KTN Interview
          </motion.h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 leading-relaxed"
          >
            Watch our exclusive feature on <span className="font-semibold">KTN</span>, 
            where we shared insights about modern agricultural solutions and how{" "}
            <span className="font-semibold">Jolu Machineries</span> is empowering farmers across Kenya.
          </motion.p>

          {/* Responsive embedded video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full pb-[56.25%] mb-12 rounded-2xl overflow-hidden"
          >
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/-jVldmfO1j8"
              title="Farm Mechanization || Farm Kenya"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-14"
          >
            Stay tuned for more media coverage and events showcasing how we are
            revolutionizing agricultural mechanization across Kenya.
          </motion.p>

          {/* Gallery Section */}
          <section className="mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="text-2xl md:text-3xl font-bold mb-10 text-center text-gray-800 dark:text-white"
            >
              Behind the Scenes
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                {
                  src: "/lovable-uploads/ktn/interview1.jpeg",
                  alt: "Engaging in a live interview session on KTN",
                },
                {
                  src: "/lovable-uploads/ktn/interview3.jpeg",
                  alt: "Team members arriving at Spice FM studios",
                },
                {
                  src: "/lovable-uploads/ktn/interview2.jpeg",
                  alt: "Group photo after the KTN feature",
                },
                {
                  src: "/lovable-uploads/ktn/interview4.jpeg",
                  alt: "Candid moment with the DOO and CEO",
                },
                {
                  src: "/lovable-uploads/ktn/interview5.jpeg",
                  alt: "On-set discussion during recording",
                },
                {
                  src: "/lovable-uploads/ktn/interview6.jpeg",
                  alt: "Our CEO - Wrapping up a successful day at Spice FM",
                },
              ].map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.1 }}
                  className="relative group overflow-hidden rounded-2xl"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-56 object-cover transform group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold text-lg text-center p-4 transition duration-500">
                    {img.alt}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Call-to-Action Section */}
      <section className="relative w-full h-80 mt-0">
        <img
          src="/lovable-uploads/ktn/hero-field.jpg"
          alt="Agriculture Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center text-white px-6">
          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-2xl md:text-4xl font-extrabold mb-4"
          >
            Discover More with Jolu Machineries
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mb-8 text-base md:text-lg max-w-2xl"
          >
            Explore how we are transforming farming across Kenya with modern, efficient solutions.
          </motion.p>
          <motion.a
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            href="/quote"
            className="bg-green-600 hover:bg-red-700 transition-all duration-300 text-white font-semibold px-8 py-3 rounded-full"
          >
            Request a Quote
          </motion.a>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default KTNInterview;
