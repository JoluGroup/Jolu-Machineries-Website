import { useMemo, useState } from "react";
import {
  Search,
  Cog,
  Settings2,
  Droplets,
  Zap,
  Disc3,
  PackageSearch,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QuoteDrawer from "@/components/QuoteDrawer";

type Stock = "in-stock" | "low-stock" | "order";

type SparePart = {
  id: number;
  name: string;
  partNumber: string;
  category: string;
  compatibleModels: string[];
  stock: Stock;
  price?: string;
};

const categories = [
  { id: "all", name: "All Parts", icon: PackageSearch },
  { id: "engine", name: "Engine", icon: Cog },
  { id: "transmission", name: "Transmission", icon: Settings2 },
  { id: "hydraulics", name: "Hydraulics", icon: Droplets },
  { id: "electrical", name: "Electrical", icon: Zap },
  { id: "tires", name: "Tires & Undercarriage", icon: Disc3 },
];

const parts: SparePart[] = [
  {
    id: 1,
    name: "Oil Filter Cartridge",
    partNumber: "ZL-EN-10425",
    category: "engine",
    compatibleModels: ["RC904/1104", "RN904/1104", "RS1304/1604"],
    stock: "in-stock",
  },
  {
    id: 2,
    name: "Turbocharger Assembly",
    partNumber: "ZL-EN-20871",
    category: "engine",
    compatibleModels: ["RS1304/1604", "RG1804/2004", "PL2304"],
    stock: "low-stock",
  },
  {
    id: 3,
    name: "Fuel Injection Pump",
    partNumber: "ZL-EN-33019",
    category: "engine",
    compatibleModels: ["RK504/704", "RD504"],
    stock: "in-stock",
  },
  {
    id: 4,
    name: "Clutch Disc Kit",
    partNumber: "ZL-TR-40562",
    category: "transmission",
    compatibleModels: ["RK504/704", "RC904/1104", "RN904/1104"],
    stock: "in-stock",
  },
  {
    id: 5,
    name: "Shuttle Shift Synchronizer",
    partNumber: "ZL-TR-41288",
    category: "transmission",
    compatibleModels: ["RK504/704", "RD504"],
    stock: "order",
  },
  {
    id: 6,
    name: "PTO Drive Gear",
    partNumber: "ZL-TR-45774",
    category: "transmission",
    compatibleModels: ["RS1304/1604", "RG1804/2004"],
    stock: "low-stock",
  },
  {
    id: 7,
    name: "Hydraulic Lift Cylinder Seal Kit",
    partNumber: "ZL-HY-50913",
    category: "hydraulics",
    compatibleModels: ["RC904/1104", "RS1304/1604", "RG1804/2004"],
    stock: "in-stock",
  },
  {
    id: 8,
    name: "Steering Hydraulic Pump",
    partNumber: "ZL-HY-52640",
    category: "hydraulics",
    compatibleModels: ["RN904/1104", "PL2304", "PG2004"],
    stock: "in-stock",
  },
  {
    id: 9,
    name: "Hydraulic Control Valve",
    partNumber: "ZL-HY-55127",
    category: "hydraulics",
    compatibleModels: ["RG1804/2004", "DV3504"],
    stock: "order",
  },
  {
    id: 10,
    name: "Alternator 90A",
    partNumber: "ZL-EL-60338",
    category: "electrical",
    compatibleModels: ["RK504/704", "RC904/1104", "RN904/1104"],
    stock: "in-stock",
  },
  {
    id: 11,
    name: "Starter Motor Assembly",
    partNumber: "ZL-EL-61402",
    category: "electrical",
    compatibleModels: ["RS1304/1604", "PL2304", "PG2004"],
    stock: "low-stock",
  },
  {
    id: 12,
    name: "Instrument Cluster Harness",
    partNumber: "ZL-EL-63915",
    category: "electrical",
    compatibleModels: ["DV3504", "PG2004"],
    stock: "order",
  },
  {
    id: 13,
    name: "Rear Tire 18.4-38",
    partNumber: "ZL-TU-70551",
    category: "tires",
    compatibleModels: ["RC904/1104", "RS1304/1604", "RG1804/2004"],
    stock: "in-stock",
  },
  {
    id: 14,
    name: "Front Axle Hub Bearing",
    partNumber: "ZL-TU-72284",
    category: "tires",
    compatibleModels: ["RK504/704", "RD504", "RC904/1104"],
    stock: "in-stock",
  },
  {
    id: 15,
    name: "Undercarriage Track Roller",
    partNumber: "ZL-TU-74630",
    category: "tires",
    compatibleModels: ["PL2304", "DV3504"],
    stock: "low-stock",
  },
];

const stockMeta: Record<
  Stock,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  "in-stock": {
    label: "In Stock",
    icon: CheckCircle2,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  "low-stock": {
    label: "Low Stock",
    icon: Clock,
    className: "bg-accent/15 text-accent-foreground border-accent/30",
  },
  order: {
    label: "Order on Request",
    icon: XCircle,
    className: "bg-muted text-muted-foreground border-border",
  },
};

const SparePartsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState("all");

  const modelOptions = useMemo(() => {
    const set = new Set<string>();
    parts.forEach((p) => p.compatibleModels.forEach((m) => set.add(m)));
    return Array.from(set).sort();
  }, []);

  const filteredParts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return parts.filter((part) => {
      const matchesCategory =
        selectedCategory === "all" || part.category === selectedCategory;
      const matchesModel =
        selectedModel === "all" || part.compatibleModels.includes(selectedModel);
      const matchesSearch =
        term === "" ||
        part.partNumber.toLowerCase().includes(term) ||
        part.name.toLowerCase().includes(term);
      return matchesCategory && matchesModel && matchesSearch;
    });
  }, [selectedCategory, searchTerm, selectedModel]);

  return (
    <section id="spare-parts" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            Genuine Spare Parts
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Spare Parts &amp; Components
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Genuine OEM parts for your ZOOMLION machinery. Search by part number or filter by
            your tractor model to find the exact fit.
          </p>
        </div>

        {/* OEM part-number search */}
        <div className="max-w-2xl mx-auto mb-10">
          <label className="block mb-2 text-sm font-medium text-foreground">
            Search by OEM part number
          </label>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={22}
            />
            <Input
              placeholder="e.g. ZL-EN-10425 or 'oil filter'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-base shadow-sm"
            />
          </div>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {categories.map((category) => {
            const Icon = category.icon;
            const active = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`product-card flex flex-col items-center justify-center gap-3 p-6 text-center transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:border-primary/40"
                }`}
              >
                <Icon
                  size={28}
                  className={active ? "text-primary-foreground" : "text-primary"}
                />
                <span className="text-sm font-semibold leading-snug">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Compatible-models filter + result count */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              Compatible model
            </span>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="All models" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="all">All models</SelectItem>
                {modelOptions.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground sm:ml-auto">
            Showing {filteredParts.length} {filteredParts.length === 1 ? "part" : "parts"}
          </p>
        </div>

        {/* Parts grid */}
        {filteredParts.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredParts.map((part) => {
              const stock = stockMeta[part.stock];
              const StockIcon = stock.icon;
              return (
                <Card key={part.id} className="product-card group flex flex-col">
                  <CardHeader className="p-6 pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <Badge
                        variant="outline"
                        className={`gap-1 ${stock.className}`}
                      >
                        <StockIcon size={13} />
                        {stock.label}
                      </Badge>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {categories.find((c) => c.id === part.category)?.name}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {part.name}
                    </h3>
                    <p className="mt-1 font-mono text-sm text-primary">{part.partNumber}</p>
                  </CardHeader>

                  <CardContent className="p-6 pt-4 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                      Compatible models
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {part.compatibleModels.map((model) => (
                        <Badge key={model} variant="secondary" className="text-xs">
                          {model}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 pt-0">
                    <QuoteDrawer
                      product={{
                        name: `${part.name} (Part No. ${part.partNumber})`,
                        interest: "Spare Parts & Service",
                        hp: `Compatible: ${part.compatibleModels.join(", ")}`,
                      }}
                      trigger={
                        <Button className="w-full btn-agricultural">Request This Part</Button>
                      }
                    />
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <PackageSearch className="mx-auto mb-4 text-muted-foreground" size={40} />
            <p className="text-lg font-medium text-foreground">No parts match your search</p>
            <p className="text-muted-foreground mt-1">
              Try a different part number, category, or model — or request it directly and
              we&apos;ll source it for you.
            </p>
            <div className="mt-6 inline-block">
              <QuoteDrawer
                product={{
                  name: "Spare Part Enquiry",
                  interest: "Spare Parts & Service",
                }}
                trigger={<Button className="btn-agricultural">Request a Part</Button>}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SparePartsSection;
