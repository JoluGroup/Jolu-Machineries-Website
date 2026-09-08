import { Link } from "react-router-dom";
import { Tractor, Wheat, Wrench, Cog } from "lucide-react";

/** Event name shared with ProductsSection so pills drive its existing filter state. */
export const FILTER_CATEGORY_EVENT = "jolu:filter-category";

const filterPills = [
  { label: "Tractors", value: "tractors", icon: Tractor },
  { label: "Harvesters", value: "harvesters", icon: Wheat },
  { label: "Implements", value: "implements", icon: Wrench },
];

const CategoryJump = () => {
  const jumpToProducts = (value: string) => {
    // Update the existing Product Grid filter (no duplicate filtering component)…
    window.dispatchEvent(new CustomEvent(FILTER_CATEGORY_EVENT, { detail: value }));
    // …then smoothly scroll to the existing #products section.
    document
      .getElementById("products")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section aria-label="Quick category navigation" className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="mr-1 text-sm font-medium text-muted-foreground">Jump to:</span>

          {filterPills.map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => jumpToProducts(pill.value)}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:shadow-md"
            >
              <pill.icon size={16} />
              {pill.label}
            </button>
          ))}

          {/* Spare Parts navigates to its dedicated route instead of filtering in-page. */}
          <Link
            to="/spare-parts"
            className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-accent hover:text-primary hover:shadow-md"
          >
            <Cog size={16} />
            Spare Parts
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryJump;
