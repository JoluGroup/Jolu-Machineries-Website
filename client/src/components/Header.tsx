import { useState } from "react";
import { Menu, X, Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import QuoteDrawer from "@/components/QuoteDrawer";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/#home" },
    { name: "Products", href: "/#products" },
    { name: "Spare Parts", href: "/spare-parts" },
    {
      name: "About",
      dropdown: true,
      items: [
        { name: "About Us", href: "/#about" },
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
            { name: "Nakuru Regional Office & Showroom Grand Launch", href: "/showroom-launch", new: true},
            { name: "Mud4Fun 4x4 Challenge", href: "/mud4fun", hot: true }, // ✅ NEW
            { name: "Head Office - Nairobi Business Launch", href: "/news#grand-launch", hot: true }, // HOT
            { name: "KTN Interview", href: "/ktn-interview", hot: true }, // HOT
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
                  <div className="absolute left-0 mt-2 w-72 rounded-lg border border-primary-glow/30 bg-primary text-primary-foreground shadow-[0_16px_40px_-12px_hsl(var(--primary)/0.6)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden py-1">
                    {(() => {
                      const hasSection = item.items.some((s) => "dropdown" in s);
                      return item.items.map((sub) =>
                      "dropdown" in sub ? (
                        <div key={sub.name}>
                          <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-glow">
                            {sub.name}
                          </p>
                          <ul>
                            {sub.items.map((nested) => (
                              <li key={nested.name}>
                                <Link
                                  to={nested.href}
                                  className="flex items-start gap-2 px-4 py-2 hover:bg-primary-glow/15 transition-colors"
                                >
                                  <span className="flex-1 min-w-0 text-sm leading-snug line-clamp-2">
                                    {nested.name}
                                  </span>
                                  {nested.hot && (
                                    <span className="shrink-0 mt-0.5 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                                      HOT
                                    </span>
                                  )}
                                  {nested.new && (
                                    <span className="shrink-0 mt-0.5 text-[10px] font-bold bg-accent text-primary px-2 py-0.5 rounded-full">
                                      NEW
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <Link
                          key={sub.name}
                          to={sub.href}
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-primary-glow/15 transition-colors ${
                            hasSection ? "mt-1 border-t border-primary-glow/20" : ""
                          }`}
                        >
                          <ChevronRight size={14} className="text-primary-glow" />
                          {sub.name}
                        </Link>
                      )
                    );
                    })()}
                  </div>
                </div>
              ) : (
                <Link key={item.name} to={item.href} className="hover:text-primary">
                  {item.name}
                </Link>
              )
            )}
            <QuoteDrawer trigger={<Button size="sm">Request a Quote</Button>} />
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
                        <li key={sub.name}>
                          <p className="pt-1 pb-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                            {sub.name}
                          </p>
                          <ul className="pl-2 space-y-1">
                            {sub.items.map((nested) => (
                              <li key={nested.name}>
                                <Link
                                  to={nested.href}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="flex items-start gap-2 py-1"
                                >
                                  <span className="flex-1 min-w-0 text-sm leading-snug">
                                    {nested.name}
                                  </span>
                                  {nested.hot && (
                                    <span className="shrink-0 mt-0.5 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                                      HOT
                                    </span>
                                  )}
                                  {nested.new && (
                                    <span className="shrink-0 mt-0.5 text-[10px] font-bold bg-accent text-primary px-2 py-0.5 rounded-full">
                                      NEW
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ) : (
                        <li key={sub.name}>
                          <Link
                            to={sub.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="block py-1 text-sm font-medium"
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
            <QuoteDrawer
              trigger={
                <Button className="w-full mt-2" onClick={() => setIsMenuOpen(false)}>
                  Request a Quote
                </Button>
              }
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
