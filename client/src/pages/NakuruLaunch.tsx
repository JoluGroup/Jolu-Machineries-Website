// src/pages/NakuruLaunch.tsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Mic,
  Youtube,
  ArrowUp,
  Handshake,
  Scissors,
  Cake,
  Camera,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NakuruLaunch: React.FC = () => {
  const metaTitle = "Jolu Group Nakuru Regional Offices & Showroom Grand Launch";
  const metaDescription =
    "Jolu Group officially launches its Nakuru Regional Offices and Showroom in Nakuru, marking a major milestone in regional expansion.";

  const [showScroll, setShowScroll] = useState(false);

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
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const speeches = [
    {
      name: "Pastor Carol",
      title: "Opening Prayer & Sermon",
      image: "/lovable-uploads/nakuru-launch/pastor-carol.jpg",
      video: "#",
      speech: "#",
    },
    {
      name: "Lucy Ndung’u",
      title: "Welcome & Opening Remarks",
      image: "/lovable-uploads/nakuru-launch/lucy.jpg",
      video: "#",
      speech: "#",
    },
    {
      name: "Kelvin Macharia",
      title: "Jolu Group Presentation",
      image: "/lovable-uploads/nakuru-launch/kelvin.jpg",
      video: "#",
      speech: "#",
    },
    {
      name: "Jackson Oduor",
      title: "Farm Mechanization Talk",
      image: "/lovable-uploads/nakuru-launch/jackson.jpg",
      video: "#",
      speech: "#",
    },
    {
      name: "John Ndung’u",
      title: "CEO Address",
      image: "/lovable-uploads/nakuru-launch/john.jpg",
      video: "#",
      speech: "#",
    },
    {
      name: "Catherine",
      title: "Vote of Thanks",
      image: "/lovable-uploads/nakuru-launch/catherine.jpg",
      video: "#",
      speech: "#",
    },
  ];

  const gallery = [
    "/lovable-uploads/nakuru-launch/hero.jpg",
    "/lovable-uploads/nakuru-launch/staff.jpg",
    "/lovable-uploads/nakuru-launch/aerial-view.jpg",
    "/lovable-uploads/nakuru-launch/cake-cutting.jpg",
    "/lovable-uploads/nakuru-launch/tractor.jpg",
    "/lovable-uploads/nakuru-launch/guests.jpg",
  ];

  const partners = ["Tower SACCO", "KCB Bank", "Equity Bank", "Kingdom Bank"];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Header />

      <main className="bg-background text-foreground">
        {/* Hero */}
        <section className="relative min-h-[75vh] flex items-center hero-gradient overflow-hidden">
          <img
            src="/lovable-uploads/nakuru-launch/hero.jpg"
            alt="Jolu Group Nakuru Regional Offices and Showroom Grand Launch"
            className="absolute inset-0 w-full h-full object-cover opacity-75"
          />

          <div className="absolute inset-0 bg-black/65" />

          <div className="relative container mx-auto px-4 max-w-6xl py-24">
            <p className="uppercase tracking-[0.3em] text-accent font-bold mb-4">
              Grand Launch
            </p>

            <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground leading-tight max-w-5xl">
              Jolu Group Nakuru Regional Offices & Showroom Grand Launch
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mt-6 max-w-3xl">
              A major milestone in Jolu Group’s regional expansion, bringing
              agricultural machinery, security solutions, automobile services,
              financing partnerships, and after-sales support closer to Nakuru and accesible countrywide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/quote">
                <Button className="btn-quote">Request a Quote</Button>
              </Link>

              <a href="#speeches">
                <Button
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground:bg-primary-foreground hover:text-primary"
                >
                  Watch Speeches
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 max-w-6xl py-14">
          <div className="grid lg:grid-cols-3 gap-8">
            <article className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-primary mb-4">
                About the Launch
              </h2>

              <p className="text-muted-foreground leading-relaxed mb-6">
                The Nakuru Regional Offices and Showroom Grand Launch marks a
                powerful step in Jolu Group’s growth journey. The new regional
                hub is designed to improve customer access to agricultural
                machinery, spare parts, professional security services,
                automobile solutions, financing support, and reliable after-sales
                service.
              </p>

              <figure className="mb-10">
                <img
                  src="/lovable-uploads/nakuru-launch/showroom.jpg"
                  alt="Jolu Group Nakuru showroom"
                  className="w-full rounded-xl object-cover shadow-lg"
                />
                <figcaption className="text-sm text-muted-foreground mt-2">
                  Nakuru Regional Offices and Showroom — opposite Nakuru
                  Athletics Club, along West Road.
                </figcaption>
              </figure>

              {/* Speeches */}
              <section id="speeches" className="mt-12">
                <h2 className="text-3xl font-bold text-primary mb-3">
                  Speeches & Presentations
                </h2>

                <p className="text-muted-foreground mb-6">
                  Watch the key speeches and presentations delivered during the
                  Nakuru launch.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {speeches.map((speaker) => (
                    <div
                      key={speaker.name}
                      className="product-card hover-lift"
                    >
                      <img
                        src={speaker.image}
                        alt={speaker.name}
                        className="w-full h-64 object-cover"
                      />

                      <div className="p-5">
                        <h3 className="text-xl font-bold text-primary">
                          {speaker.name}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-4">
                          {speaker.title}
                        </p>

                        <div className="flex flex-wrap gap-3">
                          <a
                            href={speaker.video}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" className="btn-agricultural">
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Watch Video
                            </Button>
                          </a>

                          <a
                            href={speaker.speech}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-border text-primary hover:bg-accent hover:text-accent-foreground"
                            >
                              <Mic className="w-4 h-4 mr-2" />
                              Read Speech
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Photo Gallery */}
              <section className="mt-14">
                <h2 className="text-3xl font-bold text-primary mb-3">
                  Launch Photo Gallery
                </h2>

                <p className="text-muted-foreground mb-6">
                  A visual highlight of the guests, showroom, machinery display,
                  ribbon cutting, cake cutting, and networking moments.
                </p>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((img, index) => (
                    <div
                      key={index}
                      className="relative group overflow-hidden rounded-xl shadow-md hover-lift"
                    >
                      <img
                        src={img}
                        alt={`Nakuru launch photo ${index + 1}`}
                        className="w-full h-56 object-cover group-hover:scale-105 transition duration-500"
                      />

                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition flex items-center justify-center">
                        <Camera className="text-primary-foreground opacity-0 group-hover:opacity-100 transition w-8 h-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Partners */}
              <section className="mt-14">
                <h2 className="text-3xl font-bold text-primary mb-4">
                  Financial Partners
                </h2>

                <p className="text-muted-foreground mb-5">
                  The launch highlighted strong partnerships that support
                  customers in accessing machinery and business solutions through
                  structured financing.
                </p>

                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {partners.map((partner) => (
                    <div
                      key={partner}
                      className="rounded-xl bg-primary text-primary-foreground p-5 text-center font-semibold shadow-md border-b-4 border-accent hover-lift"
                    >
                      {partner}
                    </div>
                  ))}
                </div>
              </section>

              {/* Key Moments */}
              <section className="mt-14">
                <h2 className="text-3xl font-bold text-primary mb-4">
                  Key Launch Moments
                </h2>

                <div className="grid md:grid-cols-3 gap-5">
                  <div className="rounded-xl p-5 bg-primary text-primary-foreground hover-lift">
                    <Scissors className="w-7 h-7 mb-3 text-accent" />
                    <h3 className="font-bold">Ribbon Cutting</h3>
                    <p className="text-sm mt-2 text-primary-foreground/80">
                      Official opening of the Nakuru Regional Offices and
                      Showroom.
                    </p>
                  </div>

                  <div className="rounded-xl p-5 bg-accent text-accent-foreground hover-lift">
                    <Cake className="w-7 h-7 mb-3" />
                    <h3 className="font-bold">Cake Cutting</h3>
                    <p className="text-sm mt-2">
                      A celebratory milestone with Jolu leadership and partners.
                    </p>
                  </div>

                  <div className="rounded-xl p-5 bg-card text-card-foreground border border-border hover-lift">
                    <Handshake className="w-7 h-7 mb-3 text-primary" />
                    <h3 className="font-bold">Networking</h3>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Business interactions with clients, partners, guests, and
                      the Jolu team.
                    </p>
                  </div>
                </div>
              </section>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="card-gradient rounded-xl p-5 shadow-sm border border-border">
                  <h4 className="font-bold text-primary mb-4">Quick Facts</h4>

                  <ul className="space-y-4 text-sm">
                    <li className="flex gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span>
                        <strong>Date:</strong> Saturday, 21st February 2026
                      </span>
                    </li>

                    <li className="flex gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span>
                        <strong>Venue:</strong> Opposite Nakuru Athletics Club,
                        along West Road, Nakuru
                      </span>
                    </li>

                    <li className="flex gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span>
                        <strong>Guests:</strong> Clients, partners, government
                        representatives, management, and invited guests
                      </span>
                    </li>

                    <li className="flex gap-3">
                      <Mic className="w-5 h-5 text-primary" />
                      <span>
                        <strong>Content:</strong> Speeches, presentations,
                        launch photos, partner highlights, and videos
                      </span>
                    </li>
                  </ul>
                </div>

                <figure>
                  <img
                    src="/lovable-uploads/nakuru-launch/tractor.jpg"
                    alt="Machinery showcase"
                    className="w-full rounded-xl object-cover shadow-md"
                  />
                  <figcaption className="text-xs text-muted-foreground mt-2">
                    Machinery showcase during the Nakuru launch.
                  </figcaption>
                </figure>

                <figure>
                  <img
                    src="/lovable-uploads/nakuru-launch/hero.jpg"
                    alt="Ribbon cutting ceremony"
                    className="w-full rounded-xl object-cover shadow-md"
                  />
                  <figcaption className="text-xs text-muted-foreground mt-2">
                    Official ribbon cutting ceremony.
                  </figcaption>
                </figure>
              </div>
            </aside>
          </div>
        </section>

        {/* CTA */}
        <section className="hero-gradient text-primary-foreground py-14">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Visit the Nakuru Regional Offices & Showroom
            </h2>

            <p className="text-primary-foreground/80 max-w-3xl mx-auto mb-8">
              Discover Jolu Machineries, Jolu Group Security, and Jolu
              Automobile solutions closer to you in Nakuru.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/quote">
                <Button className="btn-quote">Request a Free Quote</Button>
              </Link>

              <a href="mailto:info@jolumachineries.com">
                <Button
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground bg-primary-foreground text-primary"
                >
                  Email Us
                </Button>
              </a>
            </div>
          </div>
        </section>

        <a
          href="#speeches"
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg flex items-center gap-2 z-50"
        >
          <Youtube className="w-5 h-5 text-accent" />
          <span className="font-semibold text-sm">Watch Full Event</span>
        </a>

        {showScroll && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-20 right-6 bg-accent hover:bg-accent/90 text-accent-foreground p-3 rounded-full shadow-lg z-50"
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

export default NakuruLaunch;