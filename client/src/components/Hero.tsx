import { useState, useEffect } from "react";
import {
  ArrowRight,
  Tractor,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import heroImage1 from "@/assets/hero/tractor1.jpg";
import heroImage2 from "@/assets/hero/tractor2.png";
import heroImage3 from "@/assets/hero/hero-tractor.jpg";
import heroImage4 from "@/assets/hero/hero-field.jpg";
import heroImage5 from "@/assets/hero/tractor3.jpg";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatedStats, setAnimatedStats] = useState([
    { value: 0, target: 150, label: "Tractors Sold", icon: Tractor },
    { value: 0, target: 5, label: "Years Experience", icon: Award },
    { value: 0, target: 100, label: "Happy Customers", icon: Users },
  ]);

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

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Animate stats
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedStats((prev) =>
        prev.map((stat) => {
          if (stat.value < stat.target) {
            return {
              ...stat,
              value: Math.min(
                stat.value + Math.ceil(stat.target / 100),
                stat.target
              ),
            };
          }
          return stat;
        })
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) =>
      prev === 0 ? heroSlides.length - 1 : prev - 1
    );

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center md:items-center pt-20 md:pt-0 overflow-hidden"
    >
      {/* Sliding Background Images */}
      <div
        className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {heroSlides.map((slide, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <img
              src={slide.image}
              alt="Agricultural Machinery"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl">
          <div className="text-white mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold mb-4 leading-snug md:leading-tight">
              {heroSlides[currentSlide].title}
            </h1>
            <div className="text-lg sm:text-xl md:text-2xl text-primary-glow font-semibold mb-4 min-h-[2rem]">
              {heroSlides[currentSlide].subtitle}
            </div>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              {heroSlides[currentSlide].description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button asChild size="lg" className="btn-quote text-lg px-6 sm:px-8 py-3 sm:py-4">
                <a href="#products">
                  {heroSlides[currentSlide].cta}
                  <ArrowRight className="ml-2" size={20} />
                </a>
              </Button>

              <a href="tel:+254743682700">
                <Button
                  size="lg"
                  className="text-white border-white/30 hover:bg-white/10 text-lg px-6 sm:px-8 py-3 sm:py-4"
                >
                  Contact Us
                </Button>
              </a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            {animatedStats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-3">
                  <stat.icon size={24} className="text-primary-glow" />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  {stat.value}
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
              onClick={() => setCurrentSlide(index)}
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
        className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/254743682700"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50"
      >
        <Button className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110">
          <svg
            className="w-7 h-7 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382z" />
          </svg>
        </Button>
      </a>
    </section>
  );
};

export default Hero;
