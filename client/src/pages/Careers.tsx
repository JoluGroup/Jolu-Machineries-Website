// src/pages/Careers.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  HeartHandshake,
  Users,
  Lightbulb,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const Careers: React.FC = () => {
  const metaTitle = "Careers at Jolu Group of Companies — Join Our Team";
  const metaDescription =
    "Discover exciting career opportunities at Jolu Group of Companies. Join a passionate, innovative, and purpose-driven team building Africa’s future in security, machinery, and sustainable enterprise.";

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
  }, [metaTitle, metaDescription]);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const openings = [
    {
      title: "Director - Operations & Head of Operations",
      location: "Nairobi / Nakuru, Kenya",
      type: "Full-Time",
      description:
        "Jolu Group of Companies is seeking a highly experienced, visionary, and results-driven professional to serve as Director - Operations & Head of Operations. The successful candidate will oversee and streamline operations across Jolu Security, Jolu Agricultural Machineries, and Jolu Automobile while driving business growth, operational excellence, and strategic partnerships.\n\nThe role requires a strong leader capable of coordinating teams, shaping operational strategy, supporting management, and ensuring smooth day-to-day running of all company divisions.",
      qualifications: [
        "Master’s Degree in Business Administration, Operations Management, Strategic Management, or related field.",
        "Bachelor’s Degree in Business, Economics, Management, or related discipline.",
        "Minimum 5–7 years experience in operations, executive management, or business leadership.",
        "Strong leadership, communication, and organizational skills.",
        "Experience in business development, sales management, and strategic partnerships.",
        "Ability to coordinate multiple departments and drive operational efficiency.",
        "Strong reporting, planning, and decision-making abilities.",
      ],
      deadline: "31st May 2026",
      image: "/lovable-uploads/careers/manager.png",
      link: "mailto:info@jolumachineries.com?subject=Application%20for%20Director%20-%20Operations%20%26%20Head%20of%20Operations",
    },
  ];

  return (
    <>
      <Header />

      <main className="bg-[#F7FAF4] text-[#0B3D24] py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold mb-4 text-[#0B3D24]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Build Your Future with Jolu
            </motion.h1>

            <p className="text-lg text-[#3F6F35] max-w-3xl mx-auto">
              At Jolu Group of Companies, we’re not just building businesses. We’re building
              people, communities, and opportunities. Join a team that values innovation, growth,
              and impact across Africa’s security, machinery, and ventures sectors.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="mt-10"
            >
              <img
                src="/lovable-uploads/careers/hero.png"
                alt="Careers at Jolu Group"
               className="w-full h-[650px] object-cover rounded-3xl shadow-2xl"
              />
            </motion.div>
          </section>

          {/* Why Work With Us */}
          <section className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: <HeartHandshake className="w-10 h-10 text-[#A6CE39]" />,
                title: "Purpose & Impact",
                text: "Your work contributes directly to empowering communities through security, mechanization, and enterprise.",
              },
              {
                icon: <Users className="w-10 h-10 text-[#A6CE39]" />,
                title: "People & Culture",
                text: "We nurture a supportive, inclusive culture where everyone’s voice is valued, and teamwork drives success.",
              },
              {
                icon: <Lightbulb className="w-10 h-10 text-[#A6CE39]" />,
                title: "Growth & Learning",
                text: "We invest in continuous learning, leadership programs, and mentorship to help you grow personally and professionally.",
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                className="bg-white border border-[#DCE8D2] p-6 rounded-xl shadow-sm"
                whileHover={{ y: -5 }}
              >
                <div className="mb-3">{card.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-[#0B3D24]">
                  {card.title}
                </h3>
                <p className="text-sm text-[#3F6F35]">{card.text}</p>
              </motion.div>
            ))}
          </section>

          {/* Job Openings */}
          <section>
            <h2 className="text-3xl font-extrabold mb-10 text-[#0B3D24] text-center">
              Current Opportunities
            </h2>

            {openings.length === 0 ? (
              <p className="text-center text-[#3F6F35]">
                We’re not hiring right now, but feel free to send your CV to{" "}
                <a
                  href="mailto:info@jolumachineries.com"
                  className="text-[#0B3D24] font-medium underline"
                >
                  info@jolumachineries.com
                </a>{" "}
                for future consideration.
              </p>
            ) : (
              <div className="space-y-10">
                {openings.map((job, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white border border-[#DCE8D2] rounded-2xl overflow-hidden shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2 }}
                  >
                    <div className="bg-gradient-to-r from-[#0B3D24] via-[#3F6F35] to-[#A6CE39] text-white overflow-hidden">
                      <div className="grid lg:grid-cols-2 items-stretch">
                        <div className="p-8 flex flex-col justify-center">
                          <p className="uppercase tracking-widest text-sm mb-2 text-[#A6CE39] font-bold">
                            Career Opportunity
                          </p>

                          <h3 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4 text-white">
                            {job.title}
                          </h3>

                          <p className="text-white/90 leading-relaxed whitespace-pre-line">
                            {job.description}
                          </p>

                          <div className="grid sm:grid-cols-3 gap-4 mt-8">
                            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                              <p className="text-xs uppercase text-[#A6CE39] mb-1">
                                Location
                              </p>
                              <p className="font-semibold">{job.location}</p>
                            </div>

                            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                              <p className="text-xs uppercase text-[#A6CE39] mb-1">
                                Employment
                              </p>
                              <p className="font-semibold">{job.type}</p>
                            </div>

                            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                              <p className="text-xs uppercase text-[#A6CE39] mb-1">
                                Deadline
                              </p>
                              <p className="font-semibold">{job.deadline}</p>
                            </div>
                          </div>
                        </div>

                        <div className="relative min-h-[420px]">
                          <img
                            src={job.image}
                            alt={job.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D24]/70 via-transparent to-transparent" />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 p-8">
                      <div>
                        <h4 className="text-xl font-bold mb-5 text-[#0B3D24]">
                          Qualifications & Requirements
                        </h4>

                        <ul className="space-y-3">
                          {job.qualifications.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-[#3F6F35]">
                              <span className="mt-1 text-[#A6CE39] font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold mb-5 text-[#0B3D24]">
                          What We Offer
                        </h4>

                        <div className="space-y-4 text-[#3F6F35]">
                          {[
                            "Competitive executive remuneration package.",
                            "Opportunity to shape and lead operations across Jolu Group.",
                            "Professional growth and leadership development.",
                            "Supportive and innovation-driven work environment.",
                            "Chance to drive impact across security, machinery, and automobile sectors.",
                          ].map((offer, i) => (
                            <div key={i} className="flex gap-3">
                              <span className="text-[#A6CE39] font-bold">✓</span>
                              <p>{offer}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-8">
                          <a href={job.link} target="_blank" rel="noopener noreferrer">
                            <Button
                              size="lg"
                              className="rounded-full px-8 bg-[#0B3D24] hover:bg-[#092E1B] text-white"
                            >
                              Apply Now
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Life at Jolu Section */}
          <section className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#0B3D24]">
              Life at Jolu
            </h2>

            <p className="text-[#3F6F35] max-w-3xl mx-auto mb-8">
              Our people are at the heart of everything we do. Whether in the field, the office, or
              on-site, every member of the Jolu family plays a very vital role in our shared mission.
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
          <section className="text-center mt-16 bg-gradient-to-r from-[#0B3D24] via-[#3F6F35] to-[#A6CE39] py-10 rounded-lg">
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to start your journey?
            </h3>

            <p className="text-white/90 mb-5">
              We’re always looking for talented, passionate individuals to join our growing team.
            </p>

            <a
              href="mailto:info@jolumachineries.com?subject=Career%20Opportunities%20at%20Jolu"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-[#A6CE39] hover:bg-[#92B92F] text-[#0B3D24] rounded-full px-8"
              >
                Send Your CV
              </Button>
            </a>
          </section>
        </div>

        {showScroll && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-6 bg-[#A6CE39] hover:bg-[#92B92F] text-[#0B3D24] p-3 rounded-full shadow-lg z-50"
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