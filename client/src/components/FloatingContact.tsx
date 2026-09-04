import { useState } from "react";
import { Phone, MapPin, Plus, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_URL = "https://wa.me/254705038679";
const PHONE_TEL = "tel:+254705038679";

const branches = [
  {
    city: "Nairobi",
    label: "Main Office",
    address: "Main Office - Thome, Nairobi, Kenya",
  },
  {
    city: "Nakuru",
    label: "Regional Office & Showroom",
    address:
      "Along West Road, Opposite Nakuru Athletics, Next to Evans Hospital, Nakuru, Kenya",
  },
  {
    city: "Rongo",
    label: "Branch Office",
    address: "Quickfill Rongo Station, Migori, Kenya",
  },
];

const FloatingContact = () => {
  const [expanded, setExpanded] = useState(false);
  const [showBranches, setShowBranches] = useState(false);

  const collapseAll = () => {
    setExpanded(false);
    setShowBranches(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Branch popover */}
      {expanded && showBranches && (
        <div className="w-72 rounded-lg border border-primary-glow/30 bg-primary text-primary-foreground shadow-[0_16px_40px_-12px_hsl(var(--primary)/0.6)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-primary-glow/20">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-glow">
              Our Branches
            </p>
            <button
              onClick={() => setShowBranches(false)}
              aria-label="Close branches"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <ul>
            {branches.map((b) => (
              <li
                key={b.city}
                className="flex items-start gap-2 px-4 py-2.5 border-b border-primary-glow/10 last:border-b-0"
              >
                <MapPin size={16} className="text-primary-glow mt-0.5 shrink-0" />
                <div className="leading-snug">
                  <p className="font-semibold text-white">
                    {b.city}
                    <span className="font-normal text-white/60"> — {b.label}</span>
                  </p>
                  <p className="text-sm text-white/70">{b.address}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Secondary actions */}
      {expanded && (
        <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-sm font-medium text-primary-foreground shadow-md">
              Find a Branch
            </span>
            <button
              onClick={() => setShowBranches((s) => !s)}
              aria-label="Find a branch"
              aria-expanded={showBranches}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <MapPin size={22} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-sm font-medium text-primary-foreground shadow-md">
              Call Now
            </span>
            <a
              href={PHONE_TEL}
              aria-label="Call now"
              className="w-12 h-12 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <Phone size={22} />
            </a>
          </div>
        </div>
      )}

      {/* Primary row: WhatsApp (default) + toggle */}
      <div className="flex items-center gap-3">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          <FaWhatsapp className="w-7 h-7 text-white" />
        </a>
        <button
          onClick={() => (expanded ? collapseAll() : setExpanded(true))}
          aria-label={expanded ? "Close contact options" : "Open contact options"}
          aria-expanded={expanded}
          className="w-11 h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          {expanded ? (
            <X size={20} />
          ) : (
            <Plus size={20} className="transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
};

export default FloatingContact;
