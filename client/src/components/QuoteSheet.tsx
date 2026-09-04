import { useState, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { productOptions, countyOptions } from "@/data/options";

export type QuoteProduct = {
  name: string;
  category?: string;
  horsepower?: string;
};

type Form = {
  name: string;
  email: string;
  phone: string;
  county: string;
  area: string;
  productInterest: string;
  message: string;
};

const emptyForm: Form = {
  name: "",
  email: "",
  phone: "",
  county: "",
  area: "",
  productInterest: "",
  message: "",
};

// Map a product's category + HP range onto one of the fixed Product Interest options.
export const resolveProductInterest = (product?: QuoteProduct): string => {
  if (!product) return "";

  const haystack = `${product.category ?? ""} ${product.name}`.toLowerCase();

  if (haystack.includes("harvester")) return "Harvesters";
  if (
    haystack.includes("implement") ||
    haystack.includes("plough") ||
    haystack.includes("harrow") ||
    haystack.includes("bowser")
  ) {
    return "Agricultural Implements";
  }

  // Treat everything else as a tractor and bucket it by horsepower.
  const nums = (product.horsepower ?? "").match(/\d+/g)?.map(Number) ?? [];

  if (nums.length > 0) {
    const lo = Math.min(...nums);
    const hi = Math.max(...nums);

    // Tractor bands as numeric ranges (upper bound open-ended for the top band).
    const bands: { label: string; lo: number; hi: number }[] = [
      { label: "Tractors (50-100 HP)", lo: 50, hi: 100 },
      { label: "Tractors (100-150 HP)", lo: 100, hi: 150 },
      { label: "Tractors (150+ HP)", lo: 150, hi: Infinity },
    ];

    // Score each band by how much the product's HP range overlaps it.
    // For a single-point HP value, fall back to the range midpoint's distance.
    const mid = (lo + hi) / 2;
    let best = bands[0];
    let bestScore = -Infinity;

    for (const band of bands) {
      const overlap = Math.min(hi, band.hi) - Math.max(lo, band.lo);
      // Overlap can be 0 for a point value or a gap; break ties by proximity
      // of the midpoint to the band, and prefer the higher band on exact ties
      // (so a boundary range like 90-110 lands in 100-150, not 50-100).
      const proximity =
        mid >= band.lo && mid <= band.hi
          ? 0.001
          : -Math.min(Math.abs(mid - band.lo), Math.abs(mid - band.hi)) / 1000;
      const score = overlap + proximity;

      if (score >= bestScore) {
        bestScore = score;
        best = band;
      }
    }

    return best.label;
  }

  return "General Inquiry";
};

interface QuoteSheetProps {
  children: ReactNode;
  product?: QuoteProduct;
}

const QuoteSheet = ({ children, product }: QuoteSheetProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm);

  // Pre-fill the Product Interest whenever the drawer is opened for a product.
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setForm({
        ...emptyForm,
        productInterest: resolveProductInterest(product),
      });
    }
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.quote({
        ...form,
        message: product ? `Quoting for: ${product.name}\n\n${form.message}` : form.message,
        productInterest: form.productInterest || null,
      });
      toast({
        title: "Quote request sent",
        description: "We'll get back to you within 24 hours.",
      });
      setForm(emptyForm);
      setOpen(false);
    } catch (err: any) {
      toast({
        title: "Failed to send",
        description: err?.message || "Please check the fields.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col gap-0 overflow-y-auto"
      >
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-primary">Request a Quote</SheetTitle>
          <SheetDescription>
            Tell us what you need and where you are. We&apos;ll send a tailored
            quote within 24 hours.
          </SheetDescription>
        </SheetHeader>

        {product && (
          <div className="mt-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Quoting for
            </p>
            <p className="font-semibold text-foreground">{product.name}</p>
            {product.horsepower && (
              <p className="text-sm text-muted-foreground">{product.horsepower}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 text-left">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Full Name *</label>
            <Input
              name="name"
              placeholder="Enter your full name"
              required
              value={form.name}
              onChange={onChange}
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Email Address *</label>
            <Input
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              value={form.email}
              onChange={onChange}
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Phone Number *</label>
            <Input
              name="phone"
              type="tel"
              placeholder="+254 XXX XXX XXX"
              required
              value={form.phone}
              onChange={onChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">County *</label>
              <Select
                value={form.county}
                onValueChange={(v) => setForm((s) => ({ ...s, county: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select County" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {countyOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Area/Town *</label>
              <Input
                name="area"
                placeholder="e.g., Kilimani"
                required
                value={form.area}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Product Interest</label>
            <Select
              value={form.productInterest}
              onValueChange={(v) =>
                setForm((s) => ({ ...s, productInterest: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product category" />
              </SelectTrigger>
              <SelectContent>
                {productOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium">Message *</label>
            <Textarea
              name="message"
              placeholder="Describe your needs (at least 10 characters)"
              minLength={10}
              required
              rows={4}
              value={form.message}
              onChange={onChange}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Sending..." : "Request a Quote"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default QuoteSheet;
