import { useState } from "react";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/#home" },
    { name: "Products", href: "/#products" },
    {
      name: "About",
      dropdown: true,
      items: [
        { name: "About Us", to: "#about" },
        { name: "Our Team", to: "/team" },
        { name: "Gallery", to: "/gallery" },
        { name: "Company Documents", to: "#documents" },
      ],
    },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      {/* Top Contact Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Phone size={14} />
              <span>+254 743 682 700 / +254 705 038 679</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail size={14} />
              <span>info@jolumachineries.com</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <MapPin size={14} />
            <span>Agricultural Equipment Specialists</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/jolu-machinery-logo.jpg" 
              alt="Jolu Machineries Logo" 
              className="h-12 w-auto"
            />
            <span className="text-base sm:text-xl font-bold text-primary">
              JOLU AGRICULTURAL MACHINERIES
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.name} className="relative group">
                  <button className="text-foreground hover:text-primary font-medium transition-colors duration-200">
                    {item.name}
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-black border border-border shadow-lg rounded-md opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transform transition-all duration-300 z-50">
                  {item.items.map((subItem) =>
                    subItem.to.startsWith("#") ? (
                      <HashLink
                        key={subItem.name}
                        to={`/${subItem.to}`}
                        smooth
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {subItem.name}
                      </HashLink>
                    ) : (
                      <Link
                        key={subItem.name}
                        to={subItem.to}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {subItem.name}
                      </Link>
                    )
                  )}
                  </div>
                </div>
              ) : (
                <HashLink
                  key={item.name}
                  smooth
                  to={item.href}
                  className="text-foreground hover:text-primary font-medium transition-colors duration-200 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </HashLink>
              )
            )}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link to="/quote">
              <Button className="btn-quote">
                Get Quote
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <nav className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) =>
                item.dropdown ? (
                  <div key={item.name}>
                    <span className="text-foreground font-medium">{item.name}</span>
                    <div className="ml-4 mt-2 space-y-2">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.to}
                          className="block text-foreground hover:text-primary text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <HashLink
                    key={item.name}
                    smooth
                    to={item.href}
                    className="text-foreground hover:text-primary font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </HashLink>
                )
              )}
              <Link to="/quote">
                <Button className="btn-quote mt-4 w-full">
                  Get Quote
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
