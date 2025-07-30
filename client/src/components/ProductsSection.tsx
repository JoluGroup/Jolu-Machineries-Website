import { useState } from "react";
import { Filter, Grid, List, Search, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import tractor1 from "@/assets/tractor-1.png";
import harvester1 from "@/assets/harvester-1.png";
import harvester2 from "@/assets/harvester-2.png";
import harvester3 from "@/assets/harvester-3.png";
import implements1 from "@/assets/implements-1.jpg";
import tractor2 from "@/assets/tractor-2.png";
import tractor3 from "@/assets/tractor-3.png";
import tractor4 from "@/assets/tractor-4.png";
import tractor5 from "@/assets/tractor-5.png";
import tractor6 from "@/assets/tractor-6.png";
import tractor7 from "@/assets/tractor-7.png";



const ProductsSection = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(6); // Load 6 products initially

  const categories = [
    { id: 'all', name: 'All Products', count: 12 },
    { id: 'tractors', name: 'Tractors', count: 8 },
    { id: 'harvesters', name: 'Harvesters', count: 3 },
    { id: 'implements', name: 'Implements', count: 15 },
  ];

  const products = [
    {
      id: 1,
      slug: "zoomlion-rn904",
      name: "Zoomlion RN904/1104 Wheeled Tractor",
      category: "tractors",
      image: tractor1,
      horsepower: "90-110 HP",
      rating: 4.8,
      reviews: 24,
      features: ["4WD", "Power Steering", "Air Conditioning", "16F+8R Transmission"],
      badge: "Best Seller"
    },
    {
      id: 2,
      slug: "zoomlion-zl120",
      name: "Zoomlion ZL120 Harvester",
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
      slug: "implements-set",
      name: "Agricultural Implements Set",
      category: "implements",
      image: implements1,
      horsepower: "Compatible with 80-200 HP",
      rating: 4.7,
      reviews: 31,
      features: ["Disc Plough", "Cultivator", "Rotary Harrow", "Boom Sprayer"],
      badge: "Value Pack"
    },
    {
  id: 4,
  slug: "zoomlion-pl2304",
  name: "Zoomlion PL2304 Wheeled Tractor",
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
  id: 5,
  slug: "tf150-combine-harvester",
  name: "Zoomlion TF150 Combine Harvester",
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
},
{
  id: 6,
  slug: "zoomlion-pg2004",
  name: "Zoomlion PG2004 Wheeled Tractor",
  category: "tractors",
  image: tractor3, // make sure this image is imported as `tractor3`
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
  id: 7,
  slug: "zoomlion-rd504",
  name: "Zoomlion RD504 Wheeled Tractor",
  category: "tractors",
  image: tractor4, // Make sure this is imported as `tractor4`
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
  id: 8,
  slug: "zl105-combine-harvester",
  name: "Zoomlion ZL105 Combine Harvester",
  category: "harvesters",
  image: harvester3, // make sure this image is imported as `harvester3`
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
  id: 9,
  slug: "zoomlion-rk504-704",
  name: "Zoomlion RK504/704 Wheeled Tractor",
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
  id: 10,
  slug: "zoomlion-rc904-1104",
  name: "Zoomlion RC904/1104 Wheeled Tractor",
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
  id: 11,
  slug: "zoomlion-rs1304-1604",
  name: "Zoomlion RS1304/1604 Wheeled Tractor",
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
}









































    // Add more products here as needed
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

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

        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {visibleProducts.map((product) => (
            <Card key={product.id} className="product-card group">
              <CardHeader className="p-0 relative">
                {product.badge && (
                  <Badge className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground">
                    {product.badge}
                  </Badge>
                )}
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

                <Link to="/quote" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Get Quote
                  </Button>
                </Link>
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
    </section>
  );
};

export default ProductsSection;
