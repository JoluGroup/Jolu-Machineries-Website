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
        { name: "About Us", href: "/#about" },
        { name: "Team", href: "/team" },
        { name: "Gallery", href: "/gallery" },
        { name: "Documents", href: "/#documents" },
      ],
    },
    { name: "Schedule", href: "/schedule" },
  ] as const;

  return (
    <header className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground text-xs py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Phone size={14} />
              <span>+254 743 682 700</span>
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
          {/* Brand with Logo (Clickable to Home) */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/jolu-machinery-logo.jpg"
              alt="Jolu Logo"
              className="h-10 w-10 object-contain"
            />
            <div className="text-2xl font-bold text-primary">
              JOLU MACHINERIES
            </div>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) =>
              "dropdown" in item ? (
                <div
                  key={item.name}
                  className="relative group"
                  // Keep pointer events active on hover
                >
                  <button className="hover:text-primary">{item.name}</button>
                  <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-zinc-800 shadow rounded-lg opacity-0 group-hover:opacity-100 pointer-events-auto transition-opacity duration-200 z-50">
                    <ul className="py-2">
                      {item.items.map((sub) => (
                        <li key={sub.name}>
                          {sub.href.startsWith("/#") ? (
                            <HashLink
                              to={sub.href}
                              className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            >
                              {sub.name}
                            </HashLink>
                          ) : (
                            <Link
                              to={sub.href}
                              className="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            >
                              {sub.name}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : item.href.startsWith("/#") ? (
                <HashLink key={item.name} to={item.href} className="hover:text-primary">
                  {item.name}
                </HashLink>
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
                <details key={item.name} className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                  <summary className="cursor-pointer">{item.name}</summary>
                  <ul className="pl-4 mt-2 space-y-1">
                    {item.items.map((sub) => (
                      <li key={sub.name}>
                        {sub.href.startsWith("/#") ? (
                          <HashLink
                            to={sub.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="block py-1"
                          >
                            {sub.name}
                          </HashLink>
                        ) : (
                          <Link
                            to={sub.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="block py-1"
                          >
                            {sub.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : item.href.startsWith("/#") ? (
                <HashLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  {item.name}
                </HashLink>
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
