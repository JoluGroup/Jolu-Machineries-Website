import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { productOptions, countyOptions } from "@/data/options";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        productInterest: formData.productInterest || null,
      };
      await api.contact(payload);
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setFormData({ name: "", email: "", phone: "", county: "", area: "", productInterest: "", message: "" });
    } catch (err: any) {
      toast({
        title: "Failed to send",
        description: err?.message || "Please check the fields and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: Mail, title: "Email", details: ["info@jolumachineries.com"], action: "Send Email" },
    { icon: Phone, title: "Phone", details: ["+254 743 682 700", "+254 705 038 679"], action: "Call Now" },
    { icon: MapPin, title: "Locations", details: ["Nairobi, Kenya", "Nakuru, Kenya"], action: "Get Directions" },
    { icon: Clock, title: "Business Hours", details: ["Mon–Fri: 8:00–18:00", "Sat: 9:00–16:00", "Sun: Closed"], action: "Schedule Visit" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow bg-white dark:bg-zinc-900 text-black dark:text-white">
        
        {/* ✅ Contact section now has an id */}
        <section id="contact" className="py-12 md:py-16">
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
                            onClick={() => window.open("tel:+254743682700")}
                          >
                            <Phone size={16} className="mr-2" /> Call Now
                          </Button>
                        )}
                        {info.title === "Email" && (
                          <Button
                            variant="secondary"
                            className="w-full justify-start"
                            onClick={() => window.open("mailto:info@jolumachineries.com")}
                          >
                            <Mail size={16} className="mr-2" /> Email Us
                          </Button>
                        )}
                      </div>
                      <div className="mt-2">
                        <Button
                          variant="secondary"
                          className="w-full justify-start"
                          onClick={() => window.open("https://wa.me/254743682700", "_blank")}
                        >
                          <MessageCircle size={16} className="mr-2" /> WhatsApp Chat
                        </Button>
                      </div>
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2 font-medium">Full Name *</label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your full name"
                          />
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
                          />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">Phone Number *</label>
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="+254 XXX XXX XXX"
                          />
                        </div>
                        <div>
                          <label className="block mb-2 font-medium">County *</label>
                          <Select onValueChange={(value) => setFormData((s) => ({ ...s, county: value }))}>
                            <SelectTrigger>
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
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-2 font-medium">Area/Town *</label>
                          <Input
                            name="area"
                            value={formData.area}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., Kilimani, Ruaka"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-2 font-medium">Product Interest</label>
                          <Select onValueChange={(value) => setFormData((s) => ({ ...s, productInterest: value }))}>
                            <SelectTrigger>
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
                        />
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
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Nairobi Map */}
                        <div>
                          <h4 className="font-medium mb-2">Nairobi – Simba Close, Thome</h4>
                          <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2760.7176816752344!2d36.86981770972918!3d-1.2271689765895926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f15e36827a427%3A0x99f4140fa95df719!2sSimba%20Close%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1755332232084!5m2!1sen!2ske"
                            width="100%"
                            height="250"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          ></iframe>
                        </div>

                        {/* Nakuru Map */}
                        <div>
                          <h4 className="font-medium mb-2">Nakuru – KFA Building</h4>
                          <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15958.37956243454!2d36.05669568715821!3d-0.28648409808689044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa60a63f693e9%3A0xaba0a02d31f7b4d5!2sKFA%20Building%2C%20Nakuru!5e0!3m2!1sen!2ske!4v1723810622341!5m2!1sen!2ske"
                            width="100%"
                            height="250"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          ></iframe>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactSection;
