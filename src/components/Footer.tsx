import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "Products", href: "#products" },
    { name: "About Us", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  const productCategories = [
    { name: "Tractors", href: "#products" },
    { name: "Harvesters", href: "#products" },
    { name: "Implements", href: "#products" },
    { name: "Spare Parts", href: "#contact" },
  ];

  const services = [
    { name: "Equipment Sales", href: "#products" },
    { name: "After-Sales Service", href: "#contact" },
    { name: "Equipment Financing", href: "#contact" },
    { name: "Training Programs", href: "#contact" },
  ];

  return (
    <footer className="bg-primary-dark text-white relative">
      {/* Scroll to Top Button */}
      <Button
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-primary hover:bg-primary-glow shadow-lg"
      >
        <ArrowUp size={20} />
      </Button>

      <div className="container mx-auto px-4 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/fc941d17-d3ac-4e39-b869-99285d33b697.png" 
                alt="Jolu Machineries Logo" 
                className="h-16 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-white/80 leading-relaxed mb-4">
                Nigeria's trusted partner for premium Zoomlion agricultural machinery. 
                Empowering farmers with world-class equipment and exceptional service for over 15 years.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-primary-glow" />
                <span className="text-white/80">+234 XXX XXX XXXX</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-primary-glow" />
                <span className="text-white/80">info@jolumachineries.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary-glow mt-1" />
                <span className="text-white/80">
                  Agricultural Equipment Hub<br />
                  Lagos - Ibadan Expressway<br />
                  Lagos, Nigeria
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-white/80 hover:text-primary-glow transition-colors duration-200 relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-glow transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-xl font-semibold mb-6">Our Products</h4>
            <ul className="space-y-3">
              {productCategories.map((category, index) => (
                <li key={index}>
                  <a 
                    href={category.href} 
                    className="text-white/80 hover:text-primary-glow transition-colors duration-200 relative group"
                  >
                    {category.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-glow transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="text-xl font-semibold mb-6 mt-8">Services</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a 
                    href={service.href} 
                    className="text-white/80 hover:text-primary-glow transition-colors duration-200 relative group"
                  >
                    {service.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-glow transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xl font-semibold mb-6">Stay Updated</h4>
            <p className="text-white/80 mb-4">
              Subscribe to our newsletter for the latest agricultural machinery updates, 
              farming tips, and exclusive offers.
            </p>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Button className="bg-primary hover:bg-primary-glow px-6">
                  Subscribe
                </Button>
              </div>
              
              {/* Social Media */}
              <div>
                <p className="text-white/80 mb-3">Follow us on social media:</p>
                <div className="flex space-x-3">
                  {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                    <a
                      key={index}
                      href="#"
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-glow transition-colors duration-200"
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/20 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-white/60 text-sm">
            © {new Date().getFullYear()} Jolu Agricultural & Construction Machineries. All rights reserved.
          </div>
          
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-white/60 hover:text-primary-glow transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/60 hover:text-primary-glow transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-white/60 hover:text-primary-glow transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;