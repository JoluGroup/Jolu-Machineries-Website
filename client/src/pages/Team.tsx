// src/pages/News.tsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Mic, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const News: React.FC = () => {
  // SEO metadata
  const metaTitle = "Jolu Group of Companies Launch — Aug. 23, 2025";
  const metaDescription =
    "The Jolu Group of Companies officially launched on Aug. 23, 2025 at Lowland Estate, Thome, Nairobi — unveiling Jolu Machineries, Jolu Group Security, and partnerships with Equity Bank, Kingdom Bank, and Britam Insurance.";

  useEffect(() => {
    document.title = metaTitle;
    let meta = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = metaDescription;

    const ogTitle = document.querySelector(
      'meta[property="og:title"]'
    ) as HTMLMetaElement | null;
    if (!ogTitle) {
      const t = document.createElement("meta");
      t.setAttribute("property", "og:title");
      t.content = metaTitle;
      document.head.appendChild(t);
    } else {
      ogTitle.content = metaTitle;
    }

    const ogDesc = document.querySelector(
      'meta[property="og:description"]'
    ) as HTMLMetaElement | null;
    if (!ogDesc) {
      const d = document.createElement("meta");
      d.setAttribute("property", "og:description");
      d.content = metaDescription;
      document.head.appendChild(d);
    } else {
      ogDesc.content = metaDescription;
    }
  }, []);

  // Speaker data with Google Drive links
  const speakers = [
    {
      name: "John",
      title: "Chief Executive Officer",
      image: "/lovable-uploads/event/john.jpg",
      speech:
        "https://drive.google.com/file/d/FILE_ID_JOHN_SPEECH/view?usp=sharing",
      video:
        "https://drive.google.com/file/d/FILE_ID_JOHN_VIDEO/view?usp=sharing",
    },
    {
      name: "Lucy",
      title: "Managing Director",
      image: "/lovable-uploads/event/lucy.jpg",
      speech:
        "https://drive.google.com/file/d/FILE_ID_LUCY_SPEECH/view?usp=sharing",
      video:
        "https://drive.google.com/file/d/FILE_ID_LUCY_VIDEO/view?usp=sharing",
    },
    {
      name: "Shem",
      title: "Director of Operations",
      image: "/lovable-uploads/event/shem.jpg",
      speech:
        "https://drive.google.com/file/d/FILE_ID_SHEM_SPEECH/view?usp=sharing",
      video:
        "https://drive.google.com/file/d/FILE_ID_SHEM_VIDEO/view?usp=sharing",
    },
    {
      name: "Hesbon",
      title: "Partner",
      image: "/lovable-uploads/event/hesbon.jpg",
      speech:
        "https://drive.google.com/file/d/FILE_ID_HESBON_SPEECH/view?usp=sharing",
      video:
        "https://drive.google.com/file/d/FILE_ID_HESBON_VIDEO/view?usp=sharing",
    },
    {
      name: "Kelvin",
      title: "General Manager",
      image: "/lovable-uploads/event/kelvin.jpg",
      speech:
        "https://drive.google.com/file/d/FILE_ID_KELVIN_SPEECH/view?usp=sharing",
      video:
        "https://drive.google.com/file/d/FILE_ID_KELVIN_VIDEO/view?usp=sharing",
    },
    {
      name: "Pastor Caroline",
      title: "Opening Prayer & Dedication Service",
      image: "/lovable-uploads/event/caroline.jpg",
      speech:
        "https://drive.google.com/file/d/FILE_ID_CAROLINE_SPEECH/view?usp=sharing",
      video:
        "https://drive.google.com/file/d/FILE_ID_CAROLINE_VIDEO/view?usp=sharing",
    },
  ];

  return (
    <>
      <Header />

      <main className="bg-white dark:bg-green-900 text-zinc-900 dark:text-zinc-100 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-[hsl(var(--primary))]">
              Jolu Group of Companies Official Launch
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-300">
              On <strong>Aug. 23, 2025</strong> at{" "}
              <strong>Lowland Estate, Thome, Nairobi</strong>, the Jolu Group of
              Companies officially launched, marking a milestone with prayers,
              keynote speeches, corporate presentations, and the unveiling of
              its subsidiaries: Jolu Machineries, Jolu Group Security and Jolu
              Ventures.
            </p>
          </header>

          <div className="md:flex md:items-start md:space-x-8">
            {/* Main article */}
            <article className="md:flex-1">
              {/* Hero image */}
              <figure className="mb-6">
                <img
                  src="/lovable-uploads/event/launch-hero.jpg"
                  alt="Ribbon cutting at Jolu Group launch"
                  className="w-full rounded-lg object-cover shadow-md"
                />
                <figcaption className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  Ribbon cutting at the official launch, Aug. 23, 2025.
                </figcaption>
              </figure>

              {/* Lead */}
              <section className="prose dark:prose-invert max-w-none mb-6">
                <p>
                  The programme featured an opening prayer, dedication service,
                  corporate speeches, partner presentations, customer
                  testimonials, and the official unveiling of the company
                  alongside a cake-cutting celebration. Guests included clients,
                  executives, banking partners, and insurance representatives.
                </p>
              </section>

              {/* Event highlights */}
              <h2 className="text-xl font-semibold mt-4 text-[hsl(var(--primary))]">
                Event highlights
              </h2>
              <p className="mb-4">
                From the morning dedication service led by Pastor Caroline, to
                speeches from CEO John, Managing Director Lucy, Director of
                Operations Shem, and Hesbon of Jolu Machineries. The day
                reflected gratitude, inspiration, and forward-looking
                strategies. Banking partners (Equity and Kingdom) and Britam
                Insurance reinforced their collaboration, while Kelvin unveiled
                the new Jolu Group website.
              </p>

              {/* Speaker section */}
              <h2 className="text-xl font-semibold mt-4 text-[hsl(var(--primary))]">
                Speakers & Presentations
              </h2>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                {speakers.map((speaker) => (
                  <div
                    key={speaker.name}
                    className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg shadow-sm"
                  >
                    <img
                      src={speaker.image}
                      alt={speaker.name}
                      className="
                        w-full 
                        h-auto 
                        object-contain 
                        md:h-72 md:object-cover 
                        lg:h-80 
                        rounded-md 
                        mb-2
                      "
                    />
                    <h3 className="text-lg font-semibold">{speaker.name}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-2">
                      {speaker.title}
                    </p>
                    <div className="flex space-x-3">
                      {speaker.speech && (
                        <a
                          href={speaker.speech}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-md shadow hover:opacity-90 transition text-sm"
                        >
                          Read Speech
                        </a>
                      )}
                      {speaker.video && (
                        <a
                          href={speaker.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-black text-white rounded-md shadow hover:bg-zinc-900 transition text-sm"
                        >
                          View Presentation
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Key announcements */}
              <h2 className="text-xl font-semibold mt-6 text-[hsl(var(--primary))]">
                Key announcements
              </h2>
              <p className="mb-4">
                Jolu Group reaffirmed its dedication to expanding agricultural
                mechanization through Jolu Machineries, securing communities via
                Jolu Group Security and distribution of spare parts via Jolu
                Ventures. The launch also highlighted structured service plans,
                dealer training, financing partnerships with banks, and new
                insurance offerings.
              </p>

              {/* Pull quote */}
              <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                “This launch is about empowering communities with reliable
                tools, services, and partnerships they can trust.” —{" "}
                <strong>Lucy, Managing Director</strong>
              </blockquote>

              {/* Notable attendees and quotes */}
              <h2 className="text-xl font-semibold mt-4 text-[hsl(var(--primary))]">
                Notable attendees and quotes
              </h2>
              <p className="mb-4">
                The event hosted key customers, executives, bank partners, and
                insurance representatives. Highlights included:
              </p>
              <ul className="mb-4 space-y-2 list-inside">
                <li>
                  “Partnerships like this drive local development and
                  resilience.” — <em>Equity Bank Representative</em>
                </li>
                <li>
                  “We are committed to protecting livelihoods and
                  investments.” — <em>Britam Insurance Representative</em>
                </li>
                <li>
                  “The launch of Jolu Group Security demonstrates vision and
                  responsibility.” — <em>Key Client Testimonial</em>
                </li>
              </ul>

              {/* Company focus */}
              <h2 className="text-xl font-semibold mt-4 text-[hsl(var(--primary))]">
                Company focus and direction
              </h2>
              <ul className="mb-4 list-disc list-inside">
                <li>
                  <strong>Jolu Machineries</strong> — Agricultural machinery
                  sales, servicing, and spare parts.
                </li>
                <li>
                  <strong>Jolu Group Security</strong> — Comprehensive building
                  and asset security services.
                </li>
                <li>
                  <strong>Jolu Ventures</strong> — Customer-oriented dealership
                  in spare parts.
                </li>
                <li>
                  Expanding partnerships with financial institutions and
                  insurers to support customers.
                </li>
              </ul>

              {/* Next steps */}
              <h2 className="text-xl font-semibold mt-4 text-[hsl(var(--primary))]">
                Next steps
              </h2>
              <p className="mb-6">
                Roadshows, demos, and client engagements are planned across
                Kenya. Customers are encouraged to request demonstrations,
                explore security packages, and take advantage of financing and
                insurance support announced during the launch.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3">
                <a
                  href="mailto:info@jolumachineries.com?subject=%20Inquiry%20-%20Jolu%20Machineries"
                  aria-label="Contact jolu machineries"
                >
                  <Button size="sm">Email Us</Button>
                </a>
                <Link to="/quote" aria-label="Request a demo or quote">
                  <Button variant="outline" size="sm">
                    Request a Demo / Quote
                  </Button>
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="mt-8 md:mt-0 md:w-80">
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold mb-3 text-[hsl(var(--primary))]">
                  Quick facts
                </h4>
                <ul className="text-sm space-y-2">
                  <li>
                    <Calendar className="inline-block mr-2 text-[hsl(var(--primary))]" />{" "}
                    <strong className="text-[hsl(var(--primary))]">When:</strong>{" "}
                    Aug. 23, 2025
                  </li>
                  <li>
                    <MapPin className="inline-block mr-2 text-[hsl(var(--primary))]" />{" "}
                    <strong className="text-[hsl(var(--primary))]">Where:</strong>{" "}
                    Lowland Estate, Thome, Nairobi
                  </li>
                  <li>
                    <Users className="inline-block mr-2 text-[hsl(var(--primary))]" />{" "}
                    <strong className="text-[hsl(var(--primary))]">Attendees:</strong>{" "}
                    Executives, Partners, Customers, Banks & Insurers
                  </li>
                  <li>
                    <Mic className="inline-block mr-2 text-[hsl(var(--primary))]" />{" "}
                    <strong className="text-[hsl(var(--primary))]">Speakers:</strong>{" "}
                    John (CEO), Lucy (MD), Shem (DOO), Kelvin (GM), Hesbon
                    (Partner), Pastor Caroline, Equity Bank, Kingdom Bank,
                    Britam Insurance
                  </li>
                </ul>
              </div>

              <figure className="mt-6">
                <img
                  src="/lovable-uploads/event/cakecutting.jpg"
                  alt="cake cutting session during the event"
                  className="w-full rounded-md object-cover"
                />
                <figcaption className="text-xs text-zinc-500 mt-2">
                  Cake cutting session during the event.
                </figcaption>
              </figure>

              <figure className="mt-4">
                <img
                  src="/lovable-uploads/event/tractor.jpg"
                  alt="machinery showcased at launch"
                  className="w-full rounded-md object-cover"
                />
                <figcaption className="text-xs text-zinc-500 mt-2">
                  Agricultural machinery displayed during launch.
                </figcaption>
              </figure>

              <figure className="mt-4">
                <img
                  src="/lovable-uploads/event/handover.jpg"
                  alt="handover of machinery at the Jolu Group launch"
                  className="w-full rounded-md object-cover"
                />
                <figcaption className="text-xs text-zinc-500 mt-2">
                  Handover of machinery at the Jolu Group launch.
                </figcaption>
              </figure>
            </aside>
          </div>
        </div>

        {/* Floating external link */}
        <a
          href="https://www.facebook.com/share/v/1A8Fioh2kj/"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg flex items-center space-x-2 z-50"
        >
          <Youtube className="w-5 h-5 text-white" />
          <span className="font-semibold text-sm text-white">
            Watch Full Event
          </span>
        </a>
      </main>

      <Footer />
    </>
  );
};

export default News;
