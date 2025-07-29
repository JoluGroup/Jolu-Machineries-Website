import { useState } from "react";
import { Filter, Grid, List, Search, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import tractor1 from "@/assets/tractor-1.jpg";
import harvester1 from "@/assets/harvester-1.jpg";
import implements1 from "@/assets/implements-1.jpg";

const ProductsSection = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Products', count: 12 },
    { id: 'tractors', name: 'Tractors', count: 8 },
    { id: 'harvesters', name: 'Harvesters', count: 3 },
    { id: 'implements', name: 'Implements', count: 15 },
  ];

  const products = [
    {
      id: 1,
      name: "Zoomlion RK1504 Tractor",
      category: "tractors",
      image: tractor1,
      horsepower: "150 HP",
      price: "₦12,500,000",
      rating: 4.8,
      reviews: 24,
      features: ["4WD", "Power Steering", "Air Conditioning", "12F+12R Transmission"],
      badge: "Best Seller"
    },
    {
      id: 2,
      name: "Zoomlion TB60 Harvester",
      category: "harvesters",
      image: harvester1,
      horsepower: "180 HP",
      price: "₦25,800,000",
      rating: 4.9,
      reviews: 18,
      features: ["Grain Tank 4000L", "Cutting Width 2.2m", "Hydrostatic Drive"],
      badge: "Premium"
    },
    {
      id: 3,
      name: "Agricultural Implements Set",
      category: "implements",
      image: implements1,
      horsepower: "Compatible with 80-200 HP",
      price: "₦2,150,000",
      rating: 4.7,
      reviews: 31,
      features: ["Disc Plough", "Cultivator", "Rotary Harrow", "Boom Sprayer"],
      badge: "Value Pack"
    },
    // Add more products here for demonstration
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="products" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
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

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "btn-agricultural" : ""}
              >
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Search and View Controls */}
          <div className="flex gap-4 ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product) => (
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
                
                <div className="text-2xl font-bold text-primary mb-4">
                  {product.price}
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-0 flex gap-3">
                <Button className="flex-1 btn-agricultural">
                  View Details
                  <ArrowRight size={16} className="ml-2" />
                </Button>
                <Button variant="outline" className="flex-1">
                  Get Quote
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="hover:bg-primary hover:text-primary-foreground">
            Load More Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;