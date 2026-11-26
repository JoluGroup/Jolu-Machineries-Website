import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import FieldError from "@/components/FieldError";
import { errorProps, useSubmission } from "@/hooks/use-submission";
import { missingSelections } from "@/lib/submit-feedback";
import { productOptions, countyOptions } from "@/data/options";

type Form = {
  name: string; email: string; phone: string;
  county: string; area: string; productInterest?: string | null; message: string;
};

const emptyForm: Form = { name: "", email: "", phone: "", county: "", area: "", productInterest: "", message: "" };
const ID = "quote";

const GetQuote = () => {
  const { isSubmitting, fieldErrors, setFieldErrors, clearFieldError, submit } = useSubmission();
  const [form, setForm] = useState<Form>({ ...emptyForm });

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    clearFieldError(e.target.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      precheck: () => missingSelections(form, ["county"]),
      run: () => api.quote({ ...form, productInterest: form.productInterest || null }),
      success: { title: "Quote request sent" },
      onStored: () => setForm({ ...emptyForm }),
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-white dark:bg-zinc-900 text-black dark:text-white">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-4xl font-bold mb-6 text-primary">Request a Quote</h1>
          <p className="text-muted-foreground mb-8">Tell us what you need and where you are. We'll send a tailored quote.</p>
          <form onSubmit={handleSubmit} className="grid gap-6 text-left" aria-busy={isSubmitting}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${ID}-name`} className="block mb-2 font-medium">Full Name *</label>
                <Input id={`${ID}-name`} name="name" placeholder="Enter your full name" required value={form.name} onChange={onChange} {...errorProps(fieldErrors, "name", ID)} />
                <FieldError errors={fieldErrors} name="name" idPrefix={ID} />
              </div>
              <div>
                <label htmlFor={`${ID}-email`} className="block mb-2 font-medium">Email Address *</label>
                <Input id={`${ID}-email`} name="email" type="email" placeholder="Enter your email" required value={form.email} onChange={onChange} {...errorProps(fieldErrors, "email", ID)} />
                <FieldError errors={fieldErrors} name="email" idPrefix={ID} />
              </div>
              <div>
                <label htmlFor={`${ID}-phone`} className="block mb-2 font-medium">Phone Number *</label>
                <Input id={`${ID}-phone`} name="phone" type="tel" placeholder="+254 XXX XXX XXX" required value={form.phone} onChange={onChange} {...errorProps(fieldErrors, "phone", ID)} />
                <FieldError errors={fieldErrors} name="phone" idPrefix={ID} />
              </div>
              <div>
                <label htmlFor={`${ID}-county`} className="block mb-2 font-medium">County *</label>
                <Select value={form.county} onValueChange={(v) => { setForm((s) => ({ ...s, county: v })); clearFieldError("county"); }}>
                  <SelectTrigger id={`${ID}-county`} aria-label="County" aria-required="true" {...errorProps(fieldErrors, "county", ID)}><SelectValue placeholder="Select County" /></SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {countyOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FieldError errors={fieldErrors} name="county" idPrefix={ID} />
              </div>
            </div>

            <div>
              <label htmlFor={`${ID}-area`} className="block mb-2 font-medium">Area/Town *</label>
              <Input id={`${ID}-area`} name="area" placeholder="e.g., Kilimani, Ruaka" required value={form.area} onChange={onChange} {...errorProps(fieldErrors, "area", ID)} />
              <FieldError errors={fieldErrors} name="area" idPrefix={ID} />
            </div>

            <div>
              <label className="block mb-2 font-medium">Product Interest</label>
              <Select value={form.productInterest || ""} onValueChange={(v) => setForm((s) => ({ ...s, productInterest: v }))}>
                <SelectTrigger aria-label="Product Interest"><SelectValue placeholder="Select product category" /></SelectTrigger>
                <SelectContent>
                  {productOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor={`${ID}-message`} className="block mb-2 font-medium">Message *</label>
              <Textarea id={`${ID}-message`} name="message" placeholder="Describe your needs (at least 10 characters)" minLength={10} required value={form.message} onChange={onChange} {...errorProps(fieldErrors, "message", ID)} />
              <FieldError errors={fieldErrors} name="message" idPrefix={ID} />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Request Quote"}</Button>
              <Button type="button" variant="secondary" disabled={isSubmitting} onClick={() => { setForm({ ...emptyForm }); setFieldErrors({}); }}>
                Clear
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GetQuote;
