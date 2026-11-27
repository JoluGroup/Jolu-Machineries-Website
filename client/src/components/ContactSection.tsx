import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FieldError from "@/components/FieldError";
import { errorProps, useSubmission } from "@/hooks/use-submission";
import { missingSelections } from "@/lib/submit-feedback";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { productOptions, countyOptions } from "@/data/options";
import { emails, locations, mailHref, phones, telHref, visible, waHref } from "@/config/business";
import MapEmbed from "@/components/MapEmbed";

type Form = {
  name: string;
  email: string;
  phone: string;
  county: string;
  area: string;
  productInterest?: string | null;
  message: string;
};

const ContactSection = () => {
  const navigate = useNavigate();
  const { isSubmitting, fieldErrors, clearFieldError, submit } = useSubmission();
  const ID = "contact";
  const [formData, setFormData] = useState<Form>({
    name: "",
    email: "",
    phone: "",
    county: "",
    area: "",
    productInterest: "",
    message: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
    clearFieldError(e.target.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      precheck: () => missingSelections(formData, ["county"]),
      run: () => api.contact({ ...formData, productInterest: formData.productInterest || null }),
      success: { title: "Message sent!" },
      onStored: () => setFormData({ name: "", email: "", phone: "", county: "", area: "", productInterest: "", message: "" }),
    });
  };

  const contactInfo = [
    { icon: Mail, title: "Email", details: [visible(emails.general)].filter(Boolean) as string[], action: "Send Email" },
    { icon: Phone, title: "Phone", details: [[visible(phones.primary)?.display, visible(phones.secondary)?.display].filter(Boolean).join(" | ")].filter(Boolean), action: "Call Now" },
    { icon: MapPin, title: "Locations", details: [...(visible(locations.contactSummary) ?? [])], action: "Get Directions" },
    { icon: Clock, title: "Business Hours", details: [...(visible(locations.hours) ?? [])], action: "Schedule Visit" },
  ].filter((info) => info.details.length > 0);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow bg-white dark:bg-zinc-900 text-black dark:text-white">
        
        {/* ✅ Contact section now has an id */}
        <section id="contact" aria-label="Contact and locations" className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Contact Jolu Machineries</h2>
              <p className="text-lg text-muted-foreground">
                Talk to our experts for personalized recommendations and quotes.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Info */}
              <div className="lg:col-span-1 space-y-6">
                {contactInfo.map((info, idx) => (
                  <Card key={idx} className="product-card">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <info.icon size={18} />
                        <CardTitle className="text-xl">{info.title}</CardTitle>
                      </div>
                      <ul className="space-y-1 text-muted-foreground">
                        {info.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                      <div className="mt-4 flex gap-2">
                        {info.title === "Phone" && (
                          <Button
                            variant="secondary"
                            className="w-full justify-start"
                            onClick={() => { const href = telHref(visible(phones.primary)); if (href) window.open(href); }}
                          >
                            <Phone size={16} className="mr-2" /> Call Now
                          </Button>
                        )}
                        {info.title === "Email" && (
                          <Button
                            variant="secondary"
                            className="w-full justify-start"
                            onClick={() => { const href = mailHref(visible(emails.general)); if (href) window.open(href); }}
                          >
                            <Mail size={16} className="mr-2" /> Email Us
                          </Button>
                        )}
                      </div>
                      {waHref(visible(phones.secondary)) && (
                        <div className="mt-2">
                          <Button
                            variant="secondary"
                            className="w-full justify-start"
                            onClick={() => { const href = waHref(visible(phones.secondary)); if (href) window.open(href, "_blank"); }}
                          >
                            <MessageCircle size={16} className="mr-2" /> WhatsApp Chat
                          </Button>
                        </div>
                      )}
                      <div className="mt-2">
                        <Button
                          variant="secondary"
                          className="w-full justify-start"
                          onClick={() => navigate("/schedule")}
                        >
                          <Calendar size={16} className="mr-2" /> Schedule Demo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Right: Form */}
              <div className="lg:col-span-2">
                <Card className="product-card">
                  <CardHeader>
                    <CardTitle>Send us a message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isSubmitting}>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2 font-medium">Full Name *</label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your full name"
                            {...errorProps(fieldErrors, "name", ID)}
                          />
                          <FieldError errors={fieldErrors} name="name" idPrefix={ID} />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">Email Address *</label>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your email"
                            {...errorProps(fieldErrors, "email", ID)}
                          />
                          <FieldError errors={fieldErrors} name="email" idPrefix={ID} />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">Phone Number *</label>
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="+254 XXX XXX XXX"
                            {...errorProps(fieldErrors, "phone", ID)}
                          />
                          <FieldError errors={fieldErrors} name="phone" idPrefix={ID} />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">County *</label>
                          <Select
                            value={formData.county}
                            onValueChange={(value) => { setFormData((s) => ({ ...s, county: value })); clearFieldError("county"); }}
                          >
                            <SelectTrigger aria-label="County" aria-required="true" {...errorProps(fieldErrors, "county", ID)}>
                              <SelectValue placeholder="Select County" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {countyOptions.map((county) => (
                                <SelectItem key={county} value={county}>
                                  {county}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FieldError errors={fieldErrors} name="county" idPrefix={ID} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-2 font-medium">Area/Town *</label>
                          <Input
                            name="area"
                            value={formData.area}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., Kilimani, Ruaka"
                            {...errorProps(fieldErrors, "area", ID)}
                          />
                          <FieldError errors={fieldErrors} name="area" idPrefix={ID} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-2 font-medium">Product Interest</label>
                          <Select
                            value={formData.productInterest || ""}
                            onValueChange={(value) => setFormData((s) => ({ ...s, productInterest: value }))}
                          >
                            <SelectTrigger aria-label="Product Interest">
                              <SelectValue placeholder="Select product category" />
                            </SelectTrigger>
                            <SelectContent>
                              {productOptions.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 font-medium">Message *</label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          minLength={10}
                          placeholder="Tell us what you need..."
                          {...errorProps(fieldErrors, "message", ID)}
                        />
                        <FieldError errors={fieldErrors} name="message" idPrefix={ID} />
                      </div>

                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : (
                          <>
                            <Send className="mr-2 h-4 w-4" /> Send Message
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Maps Section */}
                    <div className="mt-10 space-y-6">
                      <h3 className="text-xl font-semibold">Find Us</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nairobi — location name only, intentionally map-free */}
                        <div className="border border-slate-200 rounded-xl bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                            <h4 className="font-medium">Jolu Head Office – Thome, Nairobi</h4>
                          </div>
                        </div>

                        {/* Nakuru Map */}
                        <div className="border border-slate-200 rounded-xl bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                          <div className="flex items-start gap-2 mb-3">
                            <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                            <h4 className="font-medium">Jolu Regional Office & Showroom – Nakuru, Kenya</h4>
                          </div>
                          <MapEmbed
                            title="Map showing Jolu Machineries Nakuru Regional Office & Showroom"
                            label="Nakuru Regional Office & Showroom"
                            query="P357+5JP, Nakuru"
                            embedSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1328.126918773704!2d36.06425771376447!3d-0.29232555730089016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18298dc3daec4f73%3A0x9502bd597c8842f0!2sP357%2B5JP%2C%20Nakuru!5e0!3m2!1sen!2ske!4v1774359316918!5m2!1sen!2ske"
                          />
                        </div>

                        {/* Nakuru KFA Map */}
                        <div className="border border-slate-200 rounded-xl bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                          <div className="flex items-start gap-2 mb-3">
                            <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                            <h4 className="font-medium">Jolu Office (Machineries & Security) – KFA Building, Nakuru</h4>
                          </div>
                          <MapEmbed
                            title="Map showing Jolu Machineries Nakuru branch (KFA Building)"
                            label="KFA Building, Nakuru"
                            query="KFA Building, Nakuru"
                            embedSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15958.37956243454!2d36.05669568715821!3d-0.28648409808689044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa60a63f693e9%3A0xaba0a02d31f7b4d5!2sKFA%20Building%2C%20Nakuru!5e0!3m2!1sen!2ske!4v1723810622341!5m2!1sen!2ske"
                          />
                        </div>

                        {/* Rongo Map */}
                        <div className="border border-slate-200 rounded-xl bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                          <div className="flex items-start gap-2 mb-3">
                            <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                            <h4 className="font-medium">Jolu Office - Quickfill Service Station – Rongo, Migori</h4>
                          </div>
                          <MapEmbed
                            title="Map showing Jolu Machineries Rongo/Migori branch"
                            label="Quickfill Rongo Station, Migori"
                            query="Quickfill Rongo Station"
                            embedSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.472100426641!2d34.606213499999996!3d-0.7548144999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182b496e03a56399%3A0xc2ad096c1f16c391!2sQUICKFILL%20RONGO%20STATION!5e0!3m2!1sen!2ske!4v1774360053586!5m2!1sen!2ske"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactSection;
