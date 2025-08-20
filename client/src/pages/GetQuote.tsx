import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { productOptions, countyOptions } from "@/data/options";

type Form = {
  name: string; email: string; phone: string;
  county: string; area: string; productInterest?: string | null; message: string;
};

const GetQuote = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<Form>({
    name: "", email: "", phone: "", county: "", area: "", productInterest: "", message: ""
  });

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.quote({ ...form, productInterest: form.productInterest || null });
      toast({ title: "Quote request sent", description: "We'll get back to you within 24 hours." });
      setForm({ name: "", email: "", phone: "", county: "", area: "", productInterest: "", message: "" });
    } catch (err: any) {
      toast({ title: "Failed to send", description: err?.message || "Please check the fields.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-white dark:bg-zinc-900 text-black dark:text-white">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-4xl font-bold mb-6 text-primary">Request a Quote</h1>
          <p className="text-muted-foreground mb-8">Tell us what you need and where you are. We'll send a tailored quote.</p>
          <form onSubmit={handleSubmit} className="grid gap-6 text-left">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Full Name *</label>
                <Input name="name" placeholder="Enter your full name" required value={form.name} onChange={onChange} />
              </div>
              <div>
                <label className="block mb-2 font-medium">Email Address *</label>
                <Input name="email" type="email" placeholder="Enter your email" required value={form.email} onChange={onChange} />
              </div>
              <div>
                <label className="block mb-2 font-medium">Phone Number *</label>
                <Input name="phone" type="tel" placeholder="+254 XXX XXX XXX" required value={form.phone} onChange={onChange} />
              </div>
              <div>
                <label className="block mb-2 font-medium">County *</label>
                <Select onValueChange={(v) => setForm((s) => ({ ...s, county: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select County" /></SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {countyOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">Area/Town *</label>
              <Input name="area" placeholder="e.g., Kilimani, Ruaka" required value={form.area} onChange={onChange} />
            </div>

            <div>
              <label className="block mb-2 font-medium">Product Interest</label>
              <Select onValueChange={(v) => setForm((s) => ({ ...s, productInterest: v }))}>
                <SelectTrigger><SelectValue placeholder="Select product category" /></SelectTrigger>
                <SelectContent>
                  {productOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Message *</label>
              <Textarea name="message" placeholder="Describe your needs (at least 10 characters)" minLength={10} required value={form.message} onChange={onChange} />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Request Quote"}</Button>
              <Button type="button" variant="secondary" onClick={() => setForm({ name: "", email: "", phone: "", county: "", area: "", productInterest: "", message: "" })}>
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
