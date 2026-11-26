import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
import FieldError from "@/components/FieldError";
import { errorProps, useSubmission } from "@/hooks/use-submission";
import { missingSelections } from "@/lib/submit-feedback";
import { api } from "@/lib/api";
import { countyOptions } from "@/data/options";
import { matchProductInterest, productOptions } from "@/lib/quote-match";

export type QuoteProduct = {
  name: string;
  category?: string | null;
  hp?: string | null;
  // Optional explicit "Product Interest" override. When provided it wins over
  // the HP/category auto-match (used e.g. by spare parts).
  interest?: string | null;
};

type QuoteDrawerProps = {
  trigger: ReactNode;
  product?: QuoteProduct;
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

const QuoteDrawer = ({ trigger, product }: QuoteDrawerProps) => {
  const [open, setOpen] = useState(false);
  const { isSubmitting, fieldErrors, setFieldErrors, clearFieldError, submit } = useSubmission();
  const ID = "quote-drawer";
  const [form, setForm] = useState<Form>({ ...emptyForm });
  // Incremented on every open, so a late result from an earlier opening cannot clear or close a newer one.
  const openSession = useRef(0);

  // Reset + auto-fill Product Interest each time the drawer opens.
  useEffect(() => {
    if (!open) return;
    openSession.current += 1;
    const productInterest = product
      ? product.interest || matchProductInterest(product)
      : "";
    setForm({ ...emptyForm, productInterest });
    setFieldErrors({});
  }, [open, product, setFieldErrors]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    clearFieldError(e.target.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = openSession.current;
    await submit({
      precheck: () => missingSelections(form, ["county"]),
      run: () =>
        api.quote({
          ...form,
          message: product ? `[Product: ${product.name}] ${form.message}` : form.message,
          productInterest: form.productInterest || null,
        }),
      success: { title: "Quote request sent" },
      onStored: () => {
        if (session !== openSession.current) return;
        setForm({ ...emptyForm });
        setOpen(false);
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Request a Quote</SheetTitle>
          <SheetDescription>
            Tell us what you need and where you are. We&apos;ll send a tailored quote.
          </SheetDescription>
        </SheetHeader>

        {product && (
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quoting for
            </p>
            <p className="font-semibold text-foreground leading-snug">{product.name}</p>
            {product.hp && (
              <p className="mt-0.5 text-sm text-muted-foreground">{product.hp}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 text-left" aria-busy={isSubmitting}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium">Full Name *</label>
              <Input
                name="name"
                placeholder="Your full name"
                required
                value={form.name}
                onChange={onChange}
                {...errorProps(fieldErrors, "name", ID)}
              />
              <FieldError errors={fieldErrors} name="name" idPrefix={ID} />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Email *</label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={onChange}
                {...errorProps(fieldErrors, "email", ID)}
              />
              <FieldError errors={fieldErrors} name="email" idPrefix={ID} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium">Phone *</label>
              <Input
                name="phone"
                type="tel"
                placeholder="+254 XXX XXX XXX"
                required
                value={form.phone}
                onChange={onChange}
                {...errorProps(fieldErrors, "phone", ID)}
              />
              <FieldError errors={fieldErrors} name="phone" idPrefix={ID} />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">County *</label>
              <Select
                value={form.county || undefined}
                onValueChange={(v) => {
                  setForm((s) => ({ ...s, county: v }));
                  clearFieldError("county");
                }}
              >
                <SelectTrigger aria-label="County" aria-required="true" {...errorProps(fieldErrors, "county", ID)}>
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
              <FieldError errors={fieldErrors} name="county" idPrefix={ID} />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Area/Town *</label>
            <Input
              name="area"
              placeholder="e.g., Kilimani, Ruaka"
              required
              value={form.area}
              onChange={onChange}
              {...errorProps(fieldErrors, "area", ID)}
            />
            <FieldError errors={fieldErrors} name="area" idPrefix={ID} />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Product Interest</label>
            <Select
              value={form.productInterest || undefined}
              onValueChange={(v) => setForm((s) => ({ ...s, productInterest: v }))}
            >
                <SelectTrigger aria-label="Product Interest">
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

          <div>
            <label className="block mb-1 text-sm font-medium">Message *</label>
            <Textarea
              name="message"
              placeholder="Describe your needs (at least 10 characters)"
              minLength={10}
              required
              rows={4}
              value={form.message}
              onChange={onChange}
              {...errorProps(fieldErrors, "message", ID)}
            />
            <FieldError errors={fieldErrors} name="message" idPrefix={ID} />
          </div>

          <Button type="submit" className="btn-agricultural w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Request a Quote"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default QuoteDrawer;
