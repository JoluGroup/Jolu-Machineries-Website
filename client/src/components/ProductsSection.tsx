import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Filter, Grid, List, Search, Star, ArrowRight, X, Check, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import QuoteDrawer from "@/components/QuoteDrawer";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { FILTER_CATEGORY_EVENT } from "@/components/CategoryJump";
import tractor1 from "@/assets/tractor-1.png";
import harvester1 from "@/assets/harvester-1.png";
import harvester2 from "@/assets/harvester-2.png";
import harvester3 from "@/assets/harvester-3.png";
import harvester4 from "@/assets/harvester-4.png";
import harvester5 from "@/assets/harvester-5.png";


import twodiskplough from "@/assets/twodiskplough.png";
import diskHarrow18 from "@/assets/diskHarrow18.jpeg";
import threeDiskPlough from "@/assets/threeDiskPlough.webp";
import waterBowser from "@/assets/waterBowser.jpg";



import tractor2 from "@/assets/tractor-2.png";
import tractor3 from "@/assets/tractor-3.png";
import tractor4 from "@/assets/tractor-4.png";
import tractor5 from "@/assets/tractor-5.png";
import tractor6 from "@/assets/tractor-6.png";
import tractor7 from "@/assets/tractor-7.png";
import tractor8 from "@/assets/tractor-8.png";
import tractor9 from "@/assets/tractor-9.png";



// Derive at-a-glance specs (gearbox, weight) from the existing product data
// without restructuring it. Gearbox/weight live inside the `features` strings
// (e.g. "16F+8R Gearbox…", "Weight 4080kg"), so we pull them out with regex.
const deriveQuickSpecs = (product: { horsepower?: string; features: string[] }) => {
  const features = product.features.join(" ");
  const gearboxMatch = features.match(/\d+F\s*\+\s*\d+R/i);
  const weightMatch = features.match(/(\d[\d,.]*)\s*kg/i);
  return {
    hp: product.horsepower || "—",
    gearbox: gearboxMatch ? gearboxMatch[0].replace(/\s+/g, "") : "—",
    weight: weightMatch ? `${weightMatch[1]} kg` : "—",
  };
};

// Shared shape for the comparison feature. Some products expose `capacity`
// instead of `horsepower` (e.g. the water bowser), so both are optional and
// any absent field is simply omitted from the comparison — never faked.
type CompareProduct = {
  id: number;
  slug: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  features: string[];
  horsepower?: string;
  capacity?: string;
  badge?: string;
};

const MAX_COMPARE = 3;

const ProductsSection = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(6); // Load 6 products initially

  // Grid fade-up entrance on scroll into view (zero-dependency IntersectionObserver).
  const { ref: gridRef, inView: gridInView } = useInView<HTMLDivElement>({ once: true });

  // Quick-jump pills (CategoryJump) drive this existing filter via a window event —
  // no duplicate filtering component, the state stays owned here.
  useEffect(() => {
    const handleFilter = (e: Event) => {
      const category = (e as CustomEvent<string>).detail;
      if (!category) return;
      setSelectedCategory(category);
      setVisibleCount(6);
    };
    window.addEventListener(FILTER_CATEGORY_EVENT, handleFilter);
    return () => window.removeEventListener(FILTER_CATEGORY_EVENT, handleFilter);
  }, []);

  // --- Product comparison (additive; capped at MAX_COMPARE) ---
  const { toast } = useToast();
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleCompare = (id: number) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) {
        toast({
          title: "Comparison limit reached",
          description: `You can compare up to ${MAX_COMPARE} products at once. Remove one to add another.`,
        });
        return prev;
      }
      return [...prev, id];
    });
  };

  const removeCompare = (id: number) =>
    setCompareIds((prev) => prev.filter((x) => x !== id));
  const clearCompare = () => {
    setCompareIds([]);
    setCompareOpen(false);
  };

  const categories = [
    { id: 'all', name: 'All Products', count: 18 },
    { id: 'tractors', name: 'Tractors', count: 9 },
    { id: 'harvesters', name: 'Harvesters', count: 5 },
    { id: 'implements', name: 'Implements', count: 4 },
  ];

  const products = [
    {
      id: 1,
      slug: "zoomlion-rc904-1104",
      name: "ZOOMLION Model RC904/ RC1104 Wheeled Tractor",
      category: "tractors",
      image: tractor6,
      horsepower: "90–110 HP",
      rating: 4.6,
      reviews: 8,
      features: [
        "16F+8R Gearbox for Versatile Speed Control",
        "Turbocharged Inter-cooling Engine with High Efficiency",
        "Full Hydraulic Steering for Easy Maneuvering",
        "Enhanced Dual-Speed PTO for Broad Implement Compatibility",
        "High-Pressure Hydraulic Lifting System for Heavy Loads"
      ],
      badge: "Heavy-Duty Performer"
    },
    {
      id: 2,
      slug: "zoomlion-zl120",
      name: "ZOOMLION ZL120 Harvester",
      category: "harvesters",
      image: harvester1,
      horsepower: "120 HP",
      rating: 4.9,
      reviews: 18,
      features: ["Weight 4080kg", "Cutting Width 2360mm", "Hydrostatic Drive"],
      badge: "Premium"
    },

    {
  id: 3,
  slug: "3-disk-plough",
  name: "3-Disk Plough",
  category: "implements",
  image: threeDiskPlough,
  horsepower: "70–90 HP",
  rating: 4.8,
  reviews: 20,
  features: [
    "Heavy-duty frame for durability",
    "Three sharp discs for effective soil cutting",
    "Adjustable working depth",
    "Ideal for primary tillage in tough soils"
  ],
  badge: "Reliable Performance"
},

    {
  id: 4,
  slug: "zoomlion-rk504-704",
  name: "ZOOMLION Model RK504/ RK704 Wheeled Tractor",
  category: "tractors",
  image: tractor5,
  horsepower: "50–70 HP",
  rating: 4.7,
  reviews: 11,
  features: [
    "12F+12R Shuttle Shift for Smooth Operation",
    "Reliable National II Engine with High Torque",
    "Enhanced Chassis & Waterproof Wiring for Paddy Fields",
    "Adjustable Rear Track & Extra-Large Fuel Tank",
    "Dual-Speed PTO for Versatile Implement Use"
  ],
  badge: "Powerful & Flexible"
},

{
  id: 5,
  slug: "disk-harrow",
  name: "Disk Harrow",
  category: "implements",
  image: diskHarrow18,
  horsepower: "Compatible with 80–120 HP",
  rating: 4.8,
  reviews: 27,
  features: [
    "Heavy-duty 18-disk configuration for efficient soil breaking",
    "Designed for deep tillage and seedbed preparation",
    "Durable boron steel disks for long-lasting performance",
    "Adjustable working depth and angle for different soil conditions",
    "Robust frame construction for stability in tough terrain",
    "Low maintenance with easily replaceable wear parts",
    "Ideal for medium to large-scale farms"
  ],
  badge: "Durable"
},

{
  id: 6,
  slug: "zoomlion-rs1304-1604",
  name: "ZOOMLION RS1304/1604 Wheeled Tractor",
  category: "tractors",
  image: tractor7,
  horsepower: "130–160 HP",
  rating: 4.9,
  reviews: 7,
  features: [
    "16F+8R Gearbox with Creeper for Precision Tasks",
    "Powerful Turbocharged Engine for Heavy-Duty Work",
    "Independent Dual-Speed PTO for Maximum Efficiency",
    "High-Flow Hydraulic System with Multiple Outputs",
    "Air-Brake System for Safe High-Speed Towing"
  ],
  badge: "Maximum Power & Performance"
},



{
  id: 7,
  slug: "implements-set",
  name: "2 Disk Plough",
  category: "implements",
  image: twodiskplough,
  horsepower: "Compatible with 60 HP and Below Tractors",
  rating: 4.8,
  reviews: 45,
  features: [
    "2 heavy-duty heat-treated steel discs",
    "Working depth up to 25 cm",
    "Durable frame for tough soils",
    "Easy tractor attachment"
  ],
  badge: "Best Seller"
},


{
  id: 8,
  slug: "zoomlion-rd504",
  name: "ZOOMLION RD504 Wheeled Tractor",
  category: "tractors",
  image: tractor4,
  horsepower: "50 HP",
  rating: 4.8,
  reviews: 9,
  features: [
    "8F+8R Shuttle Shift Transmission",
    "Strong Lifting Power for Efficient Soil Entry",
    "Compact Design for Small Plots & Greenhouses",
    "Oversized 53L Fuel Tank for Long Operations",
    "Quanchai Engine with High Torque Reserve"
  ],
  badge: "Compact & Versatile"
},
{
  id: 9,
  slug: "zl105-combine-harvester",
  name: "ZOOMLION ZL105 Combine Harvester",
  category: "harvesters",
  image: harvester3,
  horsepower: "105 HP",
  rating: 4.8,
  reviews: 15,
  features: [
    "105hp engine with upgraded threshing system",
    "6.0 kg/s feeding capacity for efficient harvesting",
    "Smart Edition with automatic power output control",
    "Electric handle for header and grain unloading",
    "Upgraded 8-blade cleaning fan for uniform airflow",
    "Transparent oil-water separator for easy maintenance",
    "350mm high-clearance U-shaped chassis",
    "Optimized shock absorption reduces vibration by up to 50%",
    "Improved right-side header drive for load balance",
    "Reinforced axles and center thrust design for durability"
  ],
  badge: "Efficient"
},

    {
  id: 10,
  slug: "zoomlion-pl2304",
  name: "ZOOMLION PL2304 Wheeled Tractor",
  category: "tractors",
  image: tractor2,
  horsepower: "230 HP",
  rating: 4.9,
  reviews: 15,
  features: [
    "4WD",
    "Smart Operation System",
    "Air Conditioning",
    "40F+40R Power Shift Transmission"
  ],
  badge: "New Arrival"
},

{
      id: 11,
      slug: "zoomlion-rn904",
      name: "ZOOMLION RN904/1104 Wheeled Tractor",
      category: "tractors",
      image: tractor1,
      horsepower: "90-110 HP",
      rating: 4.8,
      reviews: 24,
      features: ["4WD", "Power Steering", "Air Conditioning", "16F+8R Transmission"],
      badge: "Best Seller"
},


{
  id: 12,
  slug: "water-bowser",
  name: "Water Bowser",
  category: "implements",
  image: waterBowser,
  capacity: "2000–5000 Litres",
  rating: 4.8,
  reviews: 15,
  features: [
    "Durable steel tank construction for long service life",
    "Capacity range from 2000L to 5000L for various needs",
    "Mounted on heavy-duty trailer chassis for stability",
    "Equipped with high-pressure pump for efficient water delivery",
    "Multi-purpose use: irrigation, livestock watering, and dust suppression",
    "Rear discharge outlets with adjustable flow control",
    "Easy attachment to tractors for towing",
    "Corrosion-resistant coating for enhanced durability",
    "Low maintenance design with strong reliability",
    "Suitable for medium to large-scale farm and construction operations"
  ],
  badge: "Multi-Purpose"
},




{
  id: 13,
  slug: "zc123s-combine-harvester",
  name: "ZOOMLION ZC123S Combine Harvester",
  category: "harvesters",
  image: harvester4,
  horsepower: "120 HP",
  rating: 4.9,
  reviews: 22,
  features: [
    "120hp turbocharged Xinchai engine for high fuel efficiency",
    "Large 1800L grain tank and 220L fuel tank for extended operation",
    "Robust chassis designed for navigating field ridges",
    "Hydraulic dual-drive motor system for 360° turning in paddy fields",
    "Modern A/C cabin with steering wheel for operator comfort",
    "Hydraulic variable speed reel suitable for various crops",
    "High-strength materials ensure extended machine lifetime",
    "270° rotating unloading auger for efficient grain discharge",
    "High-performance threshing cylinder with dual-layer vibrating screen",
    "Air-flush radiator cleaning system to extend engine lifespan",
    "Optional straw chopper for efficient straw management",
    "Compatible with corn, wheat, and rapeseed attachments"
  ],
  badge: "Versatile"
},


{
  id: 14,
  slug: "zoomlion-pg2004",
  name: "ZOOMLION PG2004 Wheeled Tractor",
  category: "tractors",
  image: tractor3,
  horsepower: "200 HP",
  rating: 4.9,
  reviews: 12,
  features: [
    "48F+24R Power Shift Gears",
    "High-pressure Turbocharged Engine",
    "Smart Electro-Hydraulic Control",
    "Automatic PTO & GPS Option"
  ],
  badge: "High Performance"
},


{
  id: 15,
  slug: "zoomlion-rg1804-2004",
  name: "ZOOMLION RG1804/2004 Wheeled Tractor",
  category: "tractors",
  image: tractor8,
  horsepower: "180–200 HP",
  rating: 4.8,
  reviews: 9,
  features: [
    "16F+16R Gearbox with Dual Joysticks for Versatile Operation",
    "Bosch Electronically Controlled Injection for Fuel Efficiency",
    "375L Fuel Tank for Full-Day Continuous Work",
    "Split Hydraulic Lifting System with 90 kN Capacity",
    "Three Hydraulic Outputs for Multiple Implements"
  ],
  badge: "Heavy-Duty Precision & Endurance"
},
{
  id: 16,
  slug: "zoomlion-te100-combine-harvester",
  name: "ZOOMLION TE100 Combine Harvester",
  category: "harvesters",
  image: harvester5,
  horsepower: "190 HP",
  rating: 4.8,
  reviews: 17,
  features: [
    "190hp Yuchai high-pressure common rail engine with large torque reserve",
    "Hydrostatic drive system for smooth and flexible movement",
    "3.2m³ grain tank and 52L/sec unloading rate for uninterrupted harvesting",
    "Single longitudinal axial flow threshing unit for powerful separation",
    "Luxury A/C cabin with ergonomic, noise-reducing design",
    "Multi-functional mono-lever for simplified operator control",
    "Hydraulic main clutch reduces effort and increases efficiency",
    "Rear flail-type chopper for even residue distribution",
    "Supports wheat, corn, sorghum, soybean, and more",
    "Upgraded 4.0m cutting width and detachable concave plate for easy maintenance",
    "Wide cleaning room and improved airflow for better grain purity",
    "4.5m high-level grain unloading system with stable performance"
  ],
  badge: "Powerful & Multi-Crop"
},
{
  id: 17,
  slug: "zoomlion-dv3504-wheeled-tractor",
  name: "ZOOMLION DV3504 Wheeled Tractor",
  category: "tractors",
  image: tractor9,
  horsepower: "350 HP",
  rating: 4.9,
  reviews: 11,
  features: [
    "350hp hybrid power with dual-motor power coupling for heavy-load performance",
    "CVT with AMT gearbox for seamless 0–40 km/h stepless speed changes",
    "Hydraulic output flow rate of 160–220 L/min supports advanced implements",
    "360° panoramic video surveillance enhances safety and precision",
    "Air-conditioned intelligent pressure cabin with human-machine interface",
    "Motor direct drive for smooth starts and efficient power delivery",
    "Electrohydraulic joystick control for precise acceleration and reversing",
    "Cold & warm storage box and wide air suspension seat for operator comfort",
    "Ergonomic design reduces fatigue during long working hours",
    "Front and rear high-definition cameras improve tool hookup visibility",
    "Electrohydraulic tillage control and category 4N rear suspension",
    "Built-in torque damper clutch for high-efficiency under varying loads"
  ],
  badge: "Hybrid Intelligence & Strength"
},
{
  id: 18,
  slug: "tf150-combine-harvester",
  name: "ZOOMLION TF150 Combine Harvester",
  category: "harvesters",
  image: harvester2,
  horsepower: "300 HP",
  rating: 4.9,
  reviews: 18,
  features: [
    "300hp National III Yuchai engine with Bosch fuel system",
    "Light-load modes: 240hp and 185hp for fuel efficiency",
    "Double longitudinal axial flow threshing & separation system",
    "Low loss rates: <0.4% for wheat, <1% for corn",
    "Inclined 6.5° upper sieve for better grain cleaning",
    "Massive 9000L electronically controlled grain tank",
    "High-speed 55L/s grain unloading system",
    "Robust 600L fuel tank for extended operation",
    "Floating header bridge for 10° slope harvesting",
    "Custom H-drive chassis with 4WD torque distribution",
    "High-frequency vibrating screen with 900MPa steel",
    "Adaptable headers: 6.1m wheat, 5.6m flexible, 6-row or 8-row corn"
  ],
  badge: "Premium"
}

    // Add more products here as needed
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  // Resolve selected ids to full product objects (order preserved).
  const compareProducts = compareIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as CompareProduct[];

  // Never show the comparison view for fewer than 2 products.
  useEffect(() => {
    if (compareOpen && compareProducts.length < 2) setCompareOpen(false);
  }, [compareOpen, compareProducts.length]);

  return (
    <section id="products" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            Our Product Range
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Premium Agricultural Machinery
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our comprehensive range of Zoomlion tractors, harvesters, and implements 
            designed for maximum efficiency and productivity.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setVisibleCount(6); // Reset when switching category
                }}
                className={selectedCategory === category.id ? "btn-agricultural" : ""}
              >
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          <div className="flex gap-4 ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(6); // Reset on search
                }}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? "btn-agricultural" : ""}
              >
                <Grid size={18} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? "btn-agricultural" : ""}
              >
                <List size={18} />
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={gridRef}
          className={cn(
            "grid gap-6 transition-all duration-300 ease-out",
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
            gridInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[15px]"
          )}
        >
          {visibleProducts.map((product) => (
            <Card key={product.id} className="product-card group">
              <CardHeader className="p-0 relative">
                {product.badge && (
                  <span className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 rounded-sm border border-accent/70 bg-zinc-950/90 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent shadow-sm backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-[1px] bg-accent" aria-hidden="true" />
                    {product.badge}
                  </span>
                )}
                {(() => {
                  const isSelected = compareIds.includes(product.id);
                  return (
                    <button
                      type="button"
                      onClick={() => toggleCompare(product.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "absolute top-4 right-4 z-30 inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] backdrop-blur-sm transition-colors",
                        isSelected
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border/70 bg-background/85 text-foreground/80 hover:border-accent hover:text-accent"
                      )}
                    >
                      {isSelected ? <Check size={12} /> : <Scale size={12} />}
                      {isSelected ? "Added" : "Compare"}
                    </button>
                  );
                })()}
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Tactical quick-spec overlay revealed on hover */}
                  {(() => {
                    const specs = deriveQuickSpecs(product);
                    const rows: { label: string; value: string }[] = [
                      { label: "HP", value: specs.hp },
                      { label: "Gearbox", value: specs.gearbox },
                      { label: "Weight", value: specs.weight },
                    ];
                    return (
                      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-zinc-950/95 via-zinc-950/70 to-transparent opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        <div className="p-4">
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent/80">
                            At a glance
                          </p>
                          <dl className="grid grid-cols-3 gap-2">
                            {rows.map((row) => (
                              <div
                                key={row.label}
                                className="rounded-sm border border-white/10 bg-white/5 px-2 py-1.5"
                              >
                                <dt className="font-mono text-[9px] uppercase tracking-wider text-white/50">
                                  {row.label}
                                </dt>
                                <dd className="font-mono text-xs font-semibold text-white">
                                  {row.value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                </div>

                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </CardTitle>

                <div className="text-sm text-muted-foreground mb-3">
                  {product.horsepower}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {product.features.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {product.features.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.features.length - 2} more
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 flex gap-3">
                <Link to={`/products/${product.slug}`} className="flex-1">
                  <Button className="w-full btn-agricultural">
                    View Details
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>

                <QuoteDrawer
                  product={{
                    name: product.name,
                    category: product.category,
                    hp: (product as { horsepower?: string }).horsepower,
                  }}
                  trigger={
                    <Button variant="outline" className="flex-1 w-full">
                      Request a Quote
                    </Button>
                  }
                />
              </CardFooter>
            </Card>
          ))}
        </div>

        {visibleCount < filteredProducts.length && (
          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground"
              onClick={() => setVisibleCount((prev) => prev + 6)}
            >
              Load More Products
            </Button>
          </div>
        )}
      </div>

      {/* Persistent compare bar — portaled to <body> so the ancestor Reveal
          transform can't break its fixed positioning. Raised on mobile
          (bottom-24) so it never sits under the WhatsApp floating button. */}
      {compareIds.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-200 sm:bottom-6">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 shadow-2xl backdrop-blur sm:gap-3 sm:px-4 sm:py-2.5">
              <Scale className="shrink-0 text-primary" size={18} />
              <span className="whitespace-nowrap text-sm font-medium text-foreground">
                Compare ({compareIds.length})
              </span>
              <Button
                size="sm"
                className="btn-agricultural rounded-full"
                disabled={compareIds.length < 2}
                onClick={() => setCompareOpen(true)}
                title={
                  compareIds.length < 2
                    ? "Select at least 2 products to compare"
                    : undefined
                }
              >
                Compare
              </Button>
              <button
                type="button"
                onClick={clearCompare}
                aria-label="Clear comparison"
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Side-by-side comparison view (only meaningful for 2+ products) */}
      <Sheet open={compareOpen} onOpenChange={setCompareOpen}>
        <SheetContent side="bottom" className="flex h-[85vh] flex-col">
          <SheetHeader className="text-left">
            <SheetTitle>Compare Products</SheetTitle>
            <SheetDescription>
              Side-by-side specs from our catalog. Remove items or request a tailored quote.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-1 gap-4 overflow-auto pb-6 md:justify-center">
            {compareProducts.map((p) => {
              const categoryLabel =
                p.category.charAt(0).toUpperCase() + p.category.slice(1);
              return (
                <div
                  key={p.id}
                  className="relative flex w-64 shrink-0 flex-col rounded-xl border border-border bg-card p-4"
                >
                  <button
                    type="button"
                    onClick={() => removeCompare(p.id)}
                    aria-label={`Remove ${p.name} from comparison`}
                    className="absolute right-2 top-2 z-10 rounded-full bg-background/90 p-1 text-muted-foreground shadow transition-colors hover:text-destructive"
                  >
                    <X size={16} />
                  </button>

                  <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-muted/40">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>

                  <Badge className="mb-2 w-fit bg-primary/10 text-primary hover:bg-primary/20">
                    {categoryLabel}
                  </Badge>
                  <h3 className="mb-3 font-semibold leading-snug text-foreground">
                    {p.name}
                  </h3>

                  <dl className="mb-3 space-y-2 border-t border-border pt-3 text-sm">
                    {p.horsepower && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Power</dt>
                        <dd className="text-right font-medium text-foreground">
                          {p.horsepower}
                        </dd>
                      </div>
                    )}
                    {p.capacity && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Capacity</dt>
                        <dd className="text-right font-medium text-foreground">
                          {p.capacity}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Rating</dt>
                      <dd className="flex items-center gap-1 font-medium text-foreground">
                        <Star className="fill-current text-yellow-400" size={14} />
                        {p.rating}
                      </dd>
                    </div>
                  </dl>

                  <div className="mb-4 flex-1">
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Features
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {p.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <QuoteDrawer
                    product={{
                      name: p.name,
                      category: p.category,
                      hp: p.horsepower,
                    }}
                    trigger={
                      <Button className="btn-agricultural w-full">Request a Quote</Button>
                    }
                  />
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default ProductsSection;
