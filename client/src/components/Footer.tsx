import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, ArrowUp } from "lucide-react";
import { emails, locations, manufacturer, phones, social, visible, waHref } from "@/config/business";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FaTiktok, FaWhatsapp } from "react-icons/fa";
import { useLocation, Link } from "react-router-dom";
import { useState, useRef } from "react";
import { api } from "@/lib/api";
import RegistryLink from "@/components/RegistryLink";
import { CookieSettingsButton } from "@/privacy/ConsentBanner";

const footerLocations = [locations.nairobi, locations.nakuru, locations.migoriFooter].map((c) => visible(c)).filter((l): l is NonNullable<typeof l> => Boolean(l));

const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const [email, setEmail] = useState("");
  const subscribing = useRef(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInternalNav = (sectionId: string) => {
    if (isHomePage) {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  const handleSubscribe = async () => {
    if (!email) return setMessage("⚠️ Please enter an email address.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setMessage("⚠️ Please enter a valid email.");

    if (subscribing.current) return;
    subscribing.current = true;
    setLoading(true);
    setMessage("");
    let outcome: Awaited<ReturnType<typeof api.subscribe>>;
    try {
      outcome = await api.subscribe({ email });
    } finally {
      subscribing.current = false;
      setLoading(false);
    }
    switch (outcome.kind) {
      case "received":
        setMessage("✅ Thank you for subscribing!");
        setEmail("");
        break;
      case "duplicate":
        setMessage("ℹ️ You’re already subscribed with this email.");
        setEmail("");
        break;
      case "invalid":
        setMessage("⚠️ Please enter a valid email.");
        break;
      case "rate_limited":
        setMessage("⚠️ Too many attempts. Please wait a minute and try again.");
        break;
      case "network":
        setMessage("⚠️ We couldn't reach our server. Please check your connection and try again.");
        break;
      default:
        setMessage("⚠️ Could not subscribe right now. Please try again later.");
    }
  };

  const quickLinks = [
    { name: "Home", id: "home" },
    { name: "Products", id: "products" },
    { name: "About Us", id: "about" },
    { name: "Contact", id: "contact" },
  ];

  const productCategories = [
    { name: "Tractors", id: "products" },
    { name: "Harvesters", id: "products" },
    { name: "Implements", id: "products" },
  ];

  const services = [
    { name: "Equipment Sales", id: "products" },
    { name: "After-Sales Service", id: "contact" },
    { name: "Equipment Financing", id: "contact" },
    { name: "Training Programs", id: "contact" },
  ];

  return (
    <footer className="bg-primary-dark text-white relative">
      <Button
        onClick={scrollToTop}
        aria-label="Back to top"
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-primary hover:bg-primary-glow shadow-lg"
      >
        <ArrowUp size={20} />
      </Button>

      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Link to="/" className="inline-block bg-white rounded p-1 dark:bg-white/10">
                <img
                  src="/lovable-uploads/jolu-machinery-logo.jpg"
                  alt="Jolu Machineries Logo"
                  className="h-16 w-auto mb-4 dark:invert"
                />
              </Link>
              <p className="text-white/80 leading-relaxed mb-4">
                {manufacturer.neutralDescription}
              </p>
            </div>

            <div className="space-y-3">
              {visible(phones.primaryLocalDisplay) && (
                <div className="flex items-center space-x-3">
                  <Phone size={18} className="text-primary-glow shrink-0" />
                  <span className="text-white/80">{visible(phones.primaryLocalDisplay)}</span>
                </div>
              )}
              {visible(emails.general) && (
                <div className="flex items-center space-x-3">
                  <Mail size={18} className="text-primary-glow shrink-0" />
                  <span className="text-white/80">{visible(emails.general)}</span>
                </div>
              )}
              {visible(phones.afterSales) && (
                <div className="flex items-center space-x-3">
                  <Phone size={18} className="text-primary-glow shrink-0" />
                  <span className="text-white/80">After-Sales Department: {visible(phones.afterSales)}</span>
                </div>
              )}

              {footerLocations.map((loc) => (
                <div key={loc.name} className="flex items-start space-x-3">
                  <MapPin size={18} className="text-primary-glow mt-0.5 shrink-0" />
                  <div className="leading-snug">
                    <p className="font-semibold text-white">{loc.name === "Nairobi" ? loc.name : `${loc.name} — ${loc.label}`}</p>
                    <p className="text-sm text-white/70">{loc.name === "Nairobi" ? `${loc.label} - ${loc.address}` : loc.address}</p>
                    {loc.name === "Nakuru" && visible(phones.secondaryLocalDisplay) && (
                      <p className="text-sm text-white/70">{visible(phones.secondaryLocalDisplay)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleInternalNav(link.id)}
                    className="text-white/80 no-underline hover:text-primary-glow transition-colors duration-200 relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-glow transition-all duration-300 group-hover:w-full"></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Products & Services */}
          <div>
            <h4 className="text-xl font-semibold mb-6">Products &amp; Services</h4>

            <p className="text-sm font-semibold uppercase tracking-wider text-primary-glow mb-3">
              Our Products
            </p>
            <ul className="space-y-3 mb-8">
              {productCategories.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleInternalNav(item.id)}
                    className="text-white/80 no-underline hover:text-primary-glow transition-colors duration-200 relative group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-glow transition-all duration-300 group-hover:w-full"></span>
                  </button>
                </li>
              ))}
              <li>
                <Link
                  to="/products"
                  className="text-white/80 no-underline hover:text-primary-glow transition-colors duration-200"
                >
                  Full Catalogue
                </Link>
              </li>
            </ul>

            <p className="text-sm font-semibold uppercase tracking-wider text-primary-glow mb-3">
              Services
            </p>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleInternalNav(service.id)}
                    className="text-white/80 no-underline hover:text-primary-glow transition-colors duration-200 relative group"
                  >
                    {service.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-glow transition-all duration-300 group-hover:w-full"></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Socials */}
          <div>
            <h4 className="text-xl font-semibold mb-6">Stay Updated</h4>
            <p className="text-white/80 mb-4">
              Subscribe to our newsletter for the latest agricultural machinery updates,
              farming tips, and exclusive offers.
            </p>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-white text-primary-dark border border-white placeholder:text-primary-dark/50 focus-visible:ring-primary-glow"
                  disabled={loading}
                />
                <Button
                  onClick={handleSubscribe}
                  className="bg-primary hover:bg-primary-glow px-6"
                  disabled={loading}
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
              {message && (
                <p
                  className={`text-sm mt-2 ${
                    message.startsWith("⚠️")
                      ? "text-yellow-400"
                      : message.startsWith("ℹ️")
                      ? "text-blue-400"
                      : "text-green-400"
                  }`}
                >
                  {message}
                </p>
              )}

              <div>
                <p className="text-white/80 mb-3">Follow us on social media:</p>
                <div className="flex space-x-3">
                  {visible(social.facebook) && (
                    <a
                      href={visible(social.facebook)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visit our Facebook page"
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-glow transition-colors duration-200"
                    >
                      <Facebook size={18} />
                    </a>
                  )}
                  <RegistryLink
                    href={visible(social.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit our Instagram page"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-glow transition-colors duration-200"
                  >
                    <Instagram size={18} />
                  </RegistryLink>
                  <RegistryLink
                    href={visible(social.tiktok)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit our TikTok page"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-glow transition-colors duration-200"
                  >
                    <FaTiktok size={18} />
                  </RegistryLink>
                  <RegistryLink
                    href={waHref(visible(phones.primary))}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with us on WhatsApp"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-glow transition-colors duration-200"
                  >
                    <FaWhatsapp size={18} />
                  </RegistryLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/20 mb-8" />

        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
          <div className="text-white/60 text-sm">
            © {new Date().getFullYear()} Jolu Machineries. All rights reserved.
          </div>
          <CookieSettingsButton className="md:ml-6 text-white/60 text-sm underline-offset-4 hover:text-white hover:underline" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
