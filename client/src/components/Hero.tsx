import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight,
  Tractor,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingContact from "@/components/FloatingContact";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import ResponsiveImage from "@/components/ResponsiveImage";
import { createSlideNavigator, wrapIndex } from "@/lib/slide-navigation";

const heroImage1 = "@/assets/hero/tractor1.jpg";
const heroImage2 = "@/assets/hero/tractor2.png";
const heroImage3 = "@/assets/hero/hero-tractor.jpg";
const heroImage4 = "@/assets/hero/hero-field.jpg";
const heroImage5 = "@/assets/hero/tractor3.jpg";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Count-up metrics fire once when the stats block scrolls into view.
  const { ref: statsRef, inView: statsInView } = useInView<HTMLDivElement>({ once: true });
  const heroStats = [
    { target: 150, label: "Tractors Sold", icon: Tractor },
    { target: 5, label: "Years Experience", icon: Award },
    { target: 100, label: "Happy Customers", icon: Users },
  ];

  const heroSlides = [
    {
      title: "Premium Agricultural Machinery",
      subtitle: "Zoomlion Tractors & Implements",
      description:
        "Discover our comprehensive range of Zoomlion tractors and agricultural implements designed for maximum efficiency and productivity.",
      cta: "Browse Tractors",
      image: heroImage1,
    },
    {
      title: "Trusted Agricultural Partner",
      subtitle: "Quality Equipment Since Day One",
      description:
        "Your reliable source for high-quality agricultural machinery with expert support and genuine spare parts.",
      cta: "Learn More",
      image: heroImage2,
    },
    {
      title: "Powerful Field Performance",
      subtitle: "Engineered for African Farms",
      description:
        "From plowing to harvesting, our tractors are built to handle diverse farming needs with ease.",
      cta: "View Models",
      image: heroImage3,
    },
    {
      title: "Reliable & Durable",
      subtitle: "Made to Last",
      description:
        "Zoomlion tractors offer unmatched durability, keeping your farm running season after season.",
      cta: "View Products",
      image: heroImage4,
    },
    {
      title: "Smart Farming Solutions",
      subtitle: "Modern Implements Included",
      description:
        "Boost productivity with advanced implements that work seamlessly with our tractors.",
      cta: "Explore More",
      image: heroImage5,
    },
  ];

  // Only the first slide is requested immediately. Neighbouring slides are
  // requested once the page has loaded and again whenever the slide changes,
  // so the next image is normally ready before its transition begins.
  const [activeSlides, setActiveSlides] = useState<Set<number>>(() => new Set([0]));
  const settledSlides = useRef<Set<number>>(new Set());
  const slideCount = heroSlides.length;

  const activateSlides = useCallback((...indexes: number[]) => {
    setActiveSlides((prev) => {
      if (indexes.every((i) => prev.has(i))) return prev;
      const next = new Set(prev);
      indexes.forEach((i) => next.add(i));
      return next;
    });
  }, []);

  useEffect(() => {
    const warm = () => activateSlides(1, slideCount - 1);
    if (document.readyState === "complete") {
      const t = setTimeout(warm, 300);
      return () => clearTimeout(t);
    }
    let t: ReturnType<typeof setTimeout>;
    const onLoad = () => {
      t = setTimeout(warm, 300);
    };
    window.addEventListener("load", onLoad, { once: true });
    return () => {
      window.removeEventListener("load", onLoad);
      clearTimeout(t);
    };
  }, [activateSlides, slideCount]);

  useEffect(() => {
    activateSlides((currentSlide + 1) % slideCount, (currentSlide - 1 + slideCount) % slideCount);
  }, [currentSlide, activateSlides, slideCount]);

  // Navigation never swaps in a slide whose image is not ready: the current slide
  // stays visible until the requested one has loaded (see lib/slide-navigation.ts).
  const currentRef = useRef(0);
  currentRef.current = currentSlide;
  const navigator = useRef<ReturnType<typeof createSlideNavigator> | null>(null);
  if (navigator.current === null) {
    navigator.current = createSlideNavigator({
      count: slideCount,
      isReady: (i) => settledSlides.current.has(i),
      show: (i) => setCurrentSlide(i),
      prepare: (i) => activateSlides(i),
    });
  }
  const nav = navigator.current;
  useEffect(() => () => nav.cancel(), [nav]);

  const markSettled = useCallback(
    (index: number) => {
      settledSlides.current.add(index);
      nav.settled(index);
    },
    [nav],
  );

  // Auto-slide: skipped while the next image is not ready or a manual request is pending.
  useEffect(() => {
    const timer = setInterval(() => {
      if (nav.pending() !== null) return;
      const next = wrapIndex(currentRef.current + 1, slideCount);
      if (settledSlides.current.has(next)) nav.request(next);
    }, 6000);
    return () => clearInterval(timer);
  }, [nav, slideCount]);

  const nextSlide = () => nav.request(nav.base(currentRef.current) + 1);
  const prevSlide = () => nav.request(nav.base(currentRef.current) - 1);

  return (
    <section
      id="home"
      aria-label="Hero"
      className="relative min-h-screen flex items-center md:items-center pt-20 md:pt-0 overflow-hidden bg-[#0a0c0a]"
    >
      {/* Sliding Background Images — darkened and desaturated so they read as
          industrial texture against the near-black base */}
      <div
        className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {heroSlides.map((slide, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            {activeSlides.has(index) && (
              <ResponsiveImage
                src={slide.image}
                alt="Agricultural Machinery"
                sizes="100vw"
                priority={index === 0}
                loading="eager"
                fetchPriority={index === 0 ? "high" : "low"}
                ref={(el) => {
                  // Cached images can be complete before React attaches onLoad.
                  if (el && el.complete && el.naturalWidth > 0) markSettled(index);
                }}
                onLoad={() => markSettled(index)}
                onError={() => markSettled(index)}
                className="w-full h-full object-cover opacity-55 contrast-110 saturate-[0.85]"
              />
            )}
          </div>
        ))}
      </div>

      {/* Grid-line texture (lime accent, very low opacity) */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary-glow)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-glow)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 30% 40%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 30% 40%, black 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Contrast + industrial vignette: strong near-black gradient from the
          left (where text sits) guaranteeing WCAG AA, plus a lime edge glow */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(90deg, rgba(6,8,6,0.94) 0%, rgba(6,8,6,0.82) 42%, rgba(6,8,6,0.55) 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(0deg, rgba(6,8,6,0.85) 0%, transparent 45%), radial-gradient(circle at 85% 15%, hsl(var(--primary-glow) / 0.14), transparent 55%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl">
          <Reveal className="text-white mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold mb-4 leading-snug md:leading-tight">
              {heroSlides[currentSlide].title}
            </h1>
            <div className="text-lg sm:text-xl md:text-2xl text-primary-glow font-semibold mb-4 min-h-[2rem]">
              {heroSlides[currentSlide].subtitle}
            </div>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              {heroSlides[currentSlide].description}
            </p>

            {/* CTA Buttons — direct, high-intent conversion triggers */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button asChild size="lg" className="btn-quote text-lg px-6 sm:px-8 py-3 sm:py-4">
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("products")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Browse Machinery Fleet
                  <ArrowRight className="ml-2" size={20} />
                </a>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white text-lg px-6 sm:px-8 py-3 sm:py-4"
              >
                <a
                  href="https://wa.me/254705038679?text=Hello%20Jolu%20Machineries%2C%20I%20would%20like%20to%20inquire%20about%20your%20machinery%20fleet."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quick WhatsApp Quote
                </a>
              </Button>
            </div>
          </Reveal>

          {/* Stats Section — count-up on scroll into view */}
          <div
            ref={statsRef}
            className={cn(
              "grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-primary-glow/25 transition-all duration-300 ease-out",
              statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[15px]"
            )}
          >
            {heroStats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-3">
                  <stat.icon size={24} className="text-primary-glow" />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  <CountUp target={stat.target} start={statsInView} />
                </div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => nav.request(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide ? "true" : undefined}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-primary-glow scale-125"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Arrow Buttons */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Floating contact stack (WhatsApp + Call + Find a Branch) */}
      <FloatingContact />
    </section>
  );
};

export default Hero;
