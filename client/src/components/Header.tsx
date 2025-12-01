import { useState } from "react";
import { Menu, X, Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/#home" },
    { name: "Products", href: "/#products" },
    { name: "Slightly Used Tractors", href: "/used-tractors" }, // ✅ New Tab
    {
      name: "About Us",
      dropdown: true,
      items: [
        { name: "About Us", href: "/#about" },
        { name: "Team", href: "/team" },
        { name: "Documents", href: "/#documents" },
      ],
    },
    {
      name: "Media & Events",
      dropdown: true,
      items: [
        {
          name: "Events",
          dropdown: true,
          items: [
            { name: "Grand Business Launch", href: "/news#grand-launch", hot: true },
            { name: "KTN Interview", href: "/ktn-interview", new: true },
          ],
        },
        { name: "Gallery", href: "/gallery" },
      ],
    },
    { name: "Schedule", href: "/schedule" },
    { name: "Careers", href: "/careers" }, // ✅ Added Careers page
  ];

  return (
    <header className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground text-xs py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Phone size={14} />
              <span>+254 705 038 679</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={14} />
              <span>info@jolumachineries.com</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <MapPin size={14} />
            <span>Agricultural Equipment Specialists</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand with Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/jolu-machinery-logo.jpg"
              alt="Jolu Logo"
              className="h-12 w-15 object-contain"
            />
            <div className="text-3xl font-bold">JOLU</div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) =>
              "dropdown" in item ? (
                <div key={item.name} className="relative group">
                  <button className="hover:text-primary">{item.name}</button>
                  <div className="absolute left-0 mt-2 w-44 bg-white dark:bg-zinc-800 shadow rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <ul className="py-1">
                      {item.items.map((sub) =>
                        "dropdown" in sub ? (
                          <li key={sub.name} className="relative group">
                            <button className="flex items-center justify-between w-full px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                              {sub.name}
                              <ChevronRight size={14} />
                            </button>
                            {/* Nested dropdown */}
                            <div className="absolute left-full top-0 ml-1 w-44 bg-white dark:bg-zinc-800 shadow rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                              <ul className="py-1">
                                {sub.items.map((nested) => (
                                  <li key={nested.name}>
                                    <Link
                                      to={nested.href}
                                      className="flex items-center justify-between px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                    >
                                      <span>{nested.name}</span>
                                      {nested.hot && (
                                        <span className="ml-2 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                                          HOT
                                        </span>
                                      )}
                                      {nested.new && (
                                        <span className="ml-2 text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded-full animate-bounce">
                                          NEW
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </li>
                        ) : (
                          <li key={sub.name}>
                            <Link
                              to={sub.href}
                              className="block px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <Link key={item.name} to={item.href} className="hover:text-primary">
                  {item.name}
                </Link>
              )
            )}
            <Link to="/quote">
              <Button size="sm">Request a Quote</Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            {navItems.map((item) =>
              "dropdown" in item ? (
                <details
                  key={item.name}
                  className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2"
                >
                  <summary className="cursor-pointer">{item.name}</summary>
                  <ul className="pl-4 mt-2 space-y-1">
                    {item.items.map((sub) =>
                      "dropdown" in sub ? (
                        <details key={sub.name} className="pl-2">
                          <summary className="cursor-pointer flex items-center justify-between">
                            {sub.name}
                          </summary>
                          <ul className="pl-4 mt-1 space-y-1">
                            {sub.items.map((nested) => (
                              <li key={nested.name}>
                                <Link
                                  to={nested.href}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="flex items-center justify-between py-1"
                                >
                                  <span>{nested.name}</span>
                                  {nested.hot && (
                                    <span className="ml-2 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                                      HOT
                                    </span>
                                  )}
                                  {nested.new && (
                                    <span className="ml-2 text-[10px] font-bold bg-green-600 text-white px-2 py-0.5 rounded-full animate-bounce">
                                      NEW
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : (
                        <li key={sub.name}>
                          <Link
                            to={sub.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="block py-1"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </details>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  {item.name}
                </Link>
              )
            )}
            <Link to="/quote" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full mt-2">Request a Quote</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
