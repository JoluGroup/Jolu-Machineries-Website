import { Mail, Phone, MapPin, Facebook, Linkedin, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FaTiktok } from "react-icons/fa";
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";

const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loader state

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInternalNav = (sectionId: string) => {
    if (isHomePage) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  const handleSubscribe = async () => {
    if (!email) {
      setMessage("⚠️ Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("⚠️ Please enter a valid email.");
      return;
    }

    try {
      setLoading(true); // ✅ show loader
      setMessage("");

      // ✅ updated API_BASE logic
      const API_BASE = import.meta.env.VITE_API_BASE;


      const res = await fetch(`${API_BASE}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid JSON response from server");
      }

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Subscription failed");
      }

      if (data.status === "already_subscribed") {
        setMessage("ℹ️ You’re already subscribed with this email.");
      } else {
        setMessage("✅ Thank you for subscribing!");
      }
      setEmail("");
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Could not subscribe right now. Please try again later.");
    } finally {
      setLoading(false); // ✅ hide loader
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
                Kenya's trusted partner for premium Zoomlion agricultural machinery.
                Empowering farmers with world-class equipment and exceptional service for over 5 years.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-primary-glow" />
                <span className="text-white/80">0705 038 679</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-primary-glow" />
                <span className="text-white/80">info@jolumachineries.com</span>
              </div>
              <div className="flex items-start space-x-3">
<<<<<<< HEAD
                <MapPin size={20} className="text-primary-glow mt-1" />
                <span className="text-white/80">
                  Head Office - Nairobi, Kenya
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={20} className="text-primary-glow mt-1" />
                <span className="text-white/80">
                  Regional Office & Showroom<br />
                  Located along West Road, <br />
                  Opposite Nakuru Athletics, <br />
                  Next to Evans Hospital, <br />
                  Nakuru, Kenya
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={20} className="text-primary-glow mt-1" />
                <span className="text-white/80">
                  Branch Offices - Kisumu & Rongo - Quickfill Service Station, <br />
                  Migori, Kenya
                </span>
              </div>
=======
                <MapPin size={35} className="text-primary-glow mt-1" />
                <span className="text-white/80">
                  Main Office<br />
                  Simba Close, Along New Garden Estate Rd, Thome Estate<br />
                  Nairobi, Kenya
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={44} className="text-primary-glow mt-1" />
                <span className="text-white/80">
                  Regional Office<br />
                  KFA Building Along Geoffrey Kamau Avenue, Next to Rubis Petrol Station<br />
                  Nakuru, Kenya
                </span>
              </div>
>>>>>>> f8539282837b6b3fdd1ab7290716553e26b3e658
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
                    className="text-white/80 hover:text-primary-glow transition-colors duration-200 relative group"
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
            <h4 className="text-xl font-semibold mb-6">Our Products</h4>
            <ul className="space-y-3">
              {productCategories.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleInternalNav(item.id)}
                    className="text-white/80 hover:text-primary-glow transition-colors duration-200 relative group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-glow transition-all duration-300 group-hover:w-full"></span>
                  </button>
                </li>
              ))}
            </ul>

            <h4 className="text-xl font-semibold mb-6 mt-8">Services</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleInternalNav(service.id)}
                    className="text-white/80 hover:text-primary-glow transition-colors duration-200 relative group"
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

            {/* ✅ Updated Section with loader */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  disabled={loading} // ✅ disable input when loading
                />
                <Button
                  onClick={handleSubscribe}
                  className="bg-primary hover:bg-primary-glow px-6"
                  disabled={loading} // ✅ disable button when loading
                >
                  {loading ? "Subscribing..." : "Subscribe"} {/* ✅ loader text */}
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
                  <a
                    href="https://www.facebook.com/share/19TLWAd3aF/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-glow transition-colors duration-200"
                  >
                    <Facebook size={18} />
                  </a>
                  <a
                    href="https://www.tiktok.com/@jolumachineries?_t=ZM-8ySBE3JW9Cg&_r=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-glow transition-colors duration-200"
                  >
                    <FaTiktok size={18} />
                  </a>
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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
