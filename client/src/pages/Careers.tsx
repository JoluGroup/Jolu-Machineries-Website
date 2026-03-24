// src/pages/Careers.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Briefcase, HeartHandshake, Users, Lightbulb, Building } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const Careers: React.FC = () => {
  const metaTitle = "Careers at Jolu Group of Companies — Join Our Team";
  const metaDescription =
    "Discover exciting career opportunities at Jolu Group of Companies. Join a passionate, innovative, and purpose-driven team building Africa’s future in security, machinery, and sustainable enterprise.";

  const [showScroll, setShowScroll] = useState(false);

  // SEO setup
  useEffect(() => {
    document.title = metaTitle;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = metaDescription;
  }, [metaTitle, metaDescription]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Sample job openings
  const openings = [

  ];

  return (
    <>
      <Header />
      <main className="bg-white dark:bg-green-900 text-zinc-900 dark:text-zinc-100 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold mb-4 text-[hsl(var(--primary))]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Build Your Future with Jolu
            </motion.h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto">
              At Jolu Group of Companies, we’re not just building businesses. We’re building
              people, communities, and opportunities. Join a team that values innovation, growth,
              and impact across Africa’s security, machinery, and ventures sectors.
            </p>
          </section>

          {/* Why Work With Us */}
          <section className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: <HeartHandshake className="w-10 h-10 text-[hsl(var(--primary))]" />,
                title: "Purpose & Impact",
                text: "Your work contributes directly to empowering communities through security, mechanization, and enterprise.",
              },
              {
                icon: <Users className="w-10 h-10 text-[hsl(var(--primary))]" />,
                title: "People & Culture",
                text: "We nurture a supportive, inclusive culture where everyone’s voice is valued, and teamwork drives success.",
              },
              {
                icon: <Lightbulb className="w-10 h-10 text-[hsl(var(--primary))]" />,
                title: "Growth & Learning",
                text: "We invest in continuous learning, leadership programs, and mentorship to help you grow personally and professionally.",
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-xl shadow-sm"
                whileHover={{ y: -5 }}
              >
                <div className="mb-3">{card.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{card.text}</p>
              </motion.div>
            ))}
          </section>

          {/* Job Openings */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--primary))] text-center">
              Current Opportunities
            </h2>
            {openings.length === 0 ? (
              <p className="text-center text-zinc-600 dark:text-zinc-300">
                We’re not hiring right now, but feel free to send your CV to{" "}
                <a
                  href="mailto:info@jolumachineries.com"
                  className="text-[hsl(var(--primary))] font-medium underline"
                >
                  info@jolumachineries.com
                </a>{" "}
                for future consideration.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {openings.map((job, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-xl shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2 }}
                  >
                    <img
                      src={job.image}
                      alt={job.title}
                      className="w-full h-56 object-cover rounded-md mb-4"
                    />
                    <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-3">
                      <Building className="inline-block w-4 h-4 mr-1" /> {job.location} •{" "}
                      <Briefcase className="inline-block w-4 h-4 mr-1" /> {job.type}
                    </p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-400 mb-4">{job.description}</p>
                    <p className="text-xs text-zinc-500 mb-4">
                      <strong>Application Deadline:</strong> {job.deadline}
                    </p>
                    <a href={job.link} target="_blank" rel="noopener noreferrer">
                      <Button size="sm">Apply Now</Button>
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Life at Jolu Section */}
          <section className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4 text-[hsl(var(--primary))]">Life at Jolu</h2>
            <p className="text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto mb-8">
              Our people are at the heart of everything we do. Whether in the field, the office, or
              on-site, every member of the Jolu family plays a veryvital role in our shared mission.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                "/lovable-uploads/event/tractor.jpg",
                "/lovable-uploads/event/handover.jpg",
                "/lovable-uploads/event/cakecutting.jpg",
              ].map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Life at Jolu ${idx + 1}`}
                  className="w-full h-56 object-cover rounded-lg shadow-md"
                />
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center mt-16 bg-zinc-50 dark:bg-zinc-800 py-10 rounded-lg">
            <h3 className="text-2xl font-bold text-[hsl(var(--primary))] mb-3">
              Ready to start your journey?
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 mb-5">
              We’re always looking for talented, passionate individuals to join our growing team.
            </p>
            <a
              href="mailto:info@jolumachineries.com?subject=Career%20Opportunities%20at%20Jolu"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg">Send Your CV</Button>
            </a>
          </section>
        </div>

        {/* Scroll To Top Button */}
        {showScroll && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-6 bg-[hsl(var(--primary))] hover:opacity-90 text-white p-3 rounded-full shadow-lg z-50"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Careers;
