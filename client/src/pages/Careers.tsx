// src/pages/Careers.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  HeartHandshake,
  Users,
  Lightbulb,
  MapPin,
  Briefcase,
  CalendarDays,
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
      intro:
        "We're looking for an experienced operations leader to help guide Jolu Group's next chapter. If you're someone who thrives on solving real problems, building strong teams, and driving growth with integrity, we'd love to hear from you.",
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

            <p className="text-lg text-[#3F6F35] max-w-3xl mx-auto leading-relaxed">
              At Jolu, your career is more than a job description — it&apos;s a chance to grow
              alongside people who genuinely care about your success. We&apos;re proud to serve
              communities across Kenya through security, agriculture, and enterprise, and we want
              people who share that sense of purpose to grow with us.
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
                icon: <HeartHandshake className="w-8 h-8 text-[#0B3D24]" />,
                title: "Purpose & Impact",
                text: "Your work makes a real difference — helping communities across Kenya thrive through security, mechanization, and enterprise.",
              },
              {
                icon: <Users className="w-8 h-8 text-[#0B3D24]" />,
                title: "People & Culture",
                text: "You'll join a warm, supportive team where every voice matters and people genuinely look out for one another.",
              },
              {
                icon: <Lightbulb className="w-8 h-8 text-[#0B3D24]" />,
                title: "Growth & Learning",
                text: "We invest in your growth with hands-on learning, mentorship, and leadership programs — so you keep moving forward.",
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                className="relative bg-[#F0F6EA] border border-[#DCE8D2] border-t-4 border-t-[#A6CE39] p-7 rounded-2xl shadow-sm hover:shadow-lg transition-shadow"
                whileHover={{ y: -6 }}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#A6CE39]/25 ring-4 ring-[#A6CE39]/10">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#0B3D24]">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#3F6F35]">{card.text}</p>
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
                We&apos;re not hiring right now, but we&apos;d still love to hear from you — send
                your CV to{" "}
                <a
                  href="mailto:info@jolumachineries.com"
                  className="text-[#0B3D24] font-medium underline"
                >
                  info@jolumachineries.com
                </a>{" "}
                and we&apos;ll keep you in mind for future roles.
              </p>
            ) : (
              <div
                className={`grid gap-8 mx-auto ${
                  openings.length === 1
                    ? "max-w-3xl grid-cols-1"
                    : "md:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {openings.map((job, idx) => (
                  <motion.article
                    key={idx}
                    className="flex flex-col bg-white border border-[#DCE8D2] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    {/* Image header */}
                    <div className="relative h-52">
                      <img
                        src={job.image}
                        alt={job.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D24]/85 via-[#0B3D24]/30 to-transparent" />
                      <span className="absolute top-4 left-4 uppercase tracking-widest text-[11px] font-bold text-[#0B3D24] bg-[#A6CE39] px-3 py-1 rounded-full">
                        Career Opportunity
                      </span>
                      <h3 className="absolute bottom-4 left-4 right-4 text-2xl font-extrabold leading-tight text-white text-balance">
                        {job.title}
                      </h3>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-6">
                      {/* Fact badges — location, type, deadline (unchanged) */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#F0F6EA] text-[#0B3D24] border border-[#DCE8D2] rounded-full px-3 py-1">
                          <MapPin className="w-3.5 h-3.5 text-[#3F6F35]" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#F0F6EA] text-[#0B3D24] border border-[#DCE8D2] rounded-full px-3 py-1">
                          <Briefcase className="w-3.5 h-3.5 text-[#3F6F35]" />
                          {job.type}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#F0F6EA] text-[#0B3D24] border border-[#DCE8D2] rounded-full px-3 py-1">
                          <CalendarDays className="w-3.5 h-3.5 text-[#3F6F35]" />
                          Apply by {job.deadline}
                        </span>
                      </div>

                      {/* Warm intro */}
                      <p className="text-[#3F6F35] leading-relaxed mb-4">{job.intro}</p>

                      {/* Role summary (factual) */}
                      <p className="text-sm text-[#3F6F35]/90 leading-relaxed whitespace-pre-line mb-5">
                        {job.description}
                      </p>

                      {/* Qualifications */}
                      <h4 className="text-base font-bold mb-3 text-[#0B3D24]">
                        Qualifications &amp; Requirements
                      </h4>
                      <ul className="space-y-2 mb-6">
                        {job.qualifications.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-[#3F6F35]">
                            <span className="mt-1 text-[#A6CE39] font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      {/* What we offer */}
                      <h4 className="text-base font-bold mb-3 text-[#0B3D24]">
                        What We Offer
                      </h4>
                      <ul className="space-y-2 mb-6">
                        {[
                          "Competitive executive remuneration package.",
                          "Opportunity to shape and lead operations across Jolu Group.",
                          "Professional growth and leadership development.",
                          "Supportive and innovation-driven work environment.",
                          "Chance to drive impact across security, machinery, and automobile sectors.",
                        ].map((offer, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-[#3F6F35]">
                            <span className="mt-0.5 text-[#A6CE39] font-bold">✓</span>
                            <span>{offer}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA pinned to bottom */}
                      <div className="mt-auto pt-2">
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button
                            size="lg"
                            className="w-full rounded-full bg-[#0B3D24] hover:bg-[#092E1B] text-white"
                          >
                            Apply Now
                          </Button>
                        </a>
                      </div>
                    </div>
                  </motion.article>
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

            <div className="grid md:grid-cols-2 md:grid-rows-2 gap-4 md:h-[480px]">
              {[
                "/lovable-uploads/event/tractor.jpg",
                "/lovable-uploads/event/handover.jpg",
                "/lovable-uploads/event/cakecutting.jpg",
              ].map((img, idx) => (
                <div
                  key={idx}
                  className={`group relative overflow-hidden rounded-2xl shadow-md ${
                    idx === 0 ? "md:row-span-2 h-56 md:h-full" : "h-56 md:h-full"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Life at Jolu ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D24]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
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
