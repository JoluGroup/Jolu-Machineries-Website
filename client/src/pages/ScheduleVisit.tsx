import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, MailIcon, PhoneIcon, UserIcon, ClockIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { api } from "@/lib/api";
import { productOptions } from "@/data/options";
import FieldError from "@/components/FieldError";
import { errorProps, useSubmission } from "@/hooks/use-submission";
import { missingSelections } from "@/lib/submit-feedback";

type Form = {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  product: string;
  notes?: string | null;
};

export default function ScheduleVisit() {
  const { isSubmitting, fieldErrors, clearFieldError, submit } = useSubmission();
  const ID = "schedule";
  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    product: "",
    notes: "",
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    clearFieldError(e.target.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      precheck: () => missingSelections(form, ["product"]),
      run: () => api.schedule({ ...form, notes: form.notes || null }),
      success: { title: "Visit request received", description: "We will contact you to confirm the date and time." },
      onStored: () =>
        setForm({
          name: "",
          email: "",
          phone: "",
          preferredDate: "",
          preferredTime: "",
          product: "",
          notes: "",
        }),
    });
  };

  return (
    <>
      <Header />
      <section className="min-h-screen bg-white dark:bg-zinc-900 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-center text-primary mb-4">
            Schedule a Visit
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
            Book a hands-on demo or site visit with our specialists.
          </p>

          <form
            className="space-y-6 bg-zinc-100 dark:bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700"
            onSubmit={handleSubmit}
            aria-busy={isSubmitting}
          >
            {/* Contact Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Full Name *</label>
                <Input
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={onChange}
                  icon={<UserIcon className="w-4 h-4" />}
                  required
                  {...errorProps(fieldErrors, "name", ID)}
                />
                <FieldError errors={fieldErrors} name="name" idPrefix={ID} />
              </div>
              <div>
                <label className="block text-sm font-medium">Email *</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange}
                  icon={<MailIcon className="w-4 h-4" />}
                  required
                  {...errorProps(fieldErrors, "email", ID)}
                />
                <FieldError errors={fieldErrors} name="email" idPrefix={ID} />
              </div>
              <div>
                <label className="block text-sm font-medium">Phone *</label>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="+254 XXX XXX XXX"
                  value={form.phone}
                  onChange={onChange}
                  icon={<PhoneIcon className="w-4 h-4" />}
                  required
                  {...errorProps(fieldErrors, "phone", ID)}
                />
                <FieldError errors={fieldErrors} name="phone" idPrefix={ID} />
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-2 col-span-2">
                <div>
                  <label className="block text-sm font-medium">
                    Preferred Date *
                  </label>
                  <Input
                    name="preferredDate"
                    type="date"
                    value={form.preferredDate}
                    onChange={onChange}
                    icon={<CalendarIcon className="w-4 h-4" />}
                    required
                    {...errorProps(fieldErrors, "preferredDate", ID)}
                  />
                  <FieldError errors={fieldErrors} name="preferredDate" idPrefix={ID} />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Preferred Time *
                  </label>
                  <Input
                    name="preferredTime"
                    type="time"
                    value={form.preferredTime}
                    onChange={onChange}
                    icon={<ClockIcon className="w-4 h-4" />}
                    required
                    {...errorProps(fieldErrors, "preferredTime", ID)}
                  />
                  <FieldError errors={fieldErrors} name="preferredTime" idPrefix={ID} />
                </div>
              </div>
            </div>

            {/* Product */}
            <div>
              <label className="block text-sm font-medium">Product *</label>
              <Select
                value={form.product}
                onValueChange={(v) => {
                  setForm((s) => ({ ...s, product: v }));
                  clearFieldError("product");
                }}
              >
                <SelectTrigger aria-label="Product" aria-required="true" {...errorProps(fieldErrors, "product", ID)}>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {productOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={fieldErrors} name="product" idPrefix={ID} />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium">
                Notes (optional)
              </label>
              <Textarea
                name="notes"
                placeholder="Anything else we should know?"
                maxLength={2000}
                value={form.notes || ""}
                onChange={onChange}
                {...errorProps(fieldErrors, "notes", ID)}
              />
              <FieldError errors={fieldErrors} name="notes" idPrefix={ID} />
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Visit"}
            </Button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}
