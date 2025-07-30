import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import { productOptions, countyOptions } from "@/data/options";


type ContactSectionProps = {
  productOptions?: string[];
};

const ContactSection = ({ productOptions = [] }: ContactSectionProps) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    county: "",
    area: "",
    productInterest: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      productInterest: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast({
        title: "Message Sent Successfully!",
        description:
          "We'll get back to you within 24 hours. Thank you for contacting Jolu Machineries."
      });
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        county: "",
        area: "",
        productInterest: "",
        message: ""
      });
    }, 2000);
  };


const navigate = useNavigate();

  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      details: ["+254 743 682 700", "+254 705 038 679"],
      action: "Call Now"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["jolumachineries@gmail.com"],
      action: "Send Email"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: [
        "KFA Building",
        "Along Geoffrey Kamau Avenue, Next to Rubis Petrol Station",
        "Nakuru, Kenya"
      ],
      action: "Get Directions"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: [
        "Monday - Friday: 8:00 AM - 6:00 PM",
        "Saturday: 9:00 AM - 4:00 PM",
        "Sunday: Closed"
      ],
      action: "Schedule Visit"
    }
  ];

  return (
    <section id="contact" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            Get In Touch
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Contact Jolu Machineries
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to revolutionize your farming operations? Get in touch with our agricultural
            experts today for personalized equipment recommendations and competitive quotes.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="product-card">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                      <div className="space-y-1">
                        {info.details.map((detail, i) => (
                          <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                        ))}
                      </div>

                        {info.title === "Business Hours" ? (
                          <Link to="/schedule" className="inline-block mt-2">
                            <Button variant="link" className="p-0 h-auto text-primary">
                              {info.action}
                            </Button>
                          </Link>
                        ) : (
                          <a
                            href={
                              info.title === "Call Us"
                                ? `tel:${info.details[0].replace(/\s+/g, "")}`
                                : info.title === "Email Us"
                                ? `mailto:${info.details[0]}`
                                : "https://www.google.com/maps/search/?api=1&query=KFA+Building,+Geoffrey+Kamau+Avenue,+Nakuru,+Kenya"
                            }
                            className="inline-block mt-2"
                            {...((info.title === "Visit Us") && {
                              target: "_blank",
                              rel: "noopener noreferrer",
                            })}
                          >
                            <Button variant="link" className="p-0 h-auto text-primary">
                              {info.action}
                            </Button>
                          </a>
                          )}

                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

                  <Card className="product-card bg-primary text-primary-foreground">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        {/* WhatsApp Chat */}
                        <Button
                          variant="secondary"
                          className="w-full justify-start"
                          onClick={() =>
                            window.open("https://wa.me/254743682700", "_blank")
                          }
                        >
                          <MessageCircle size={18} className="mr-2" /> WhatsApp Chat
                        </Button>

                        {/* Schedule Demo */}
                        <Button
                          variant="secondary"
                          className="w-full justify-start"
                          onClick={() => navigate("/schedule")}
                        >
                          <Calendar size={18} className="mr-2" /> Schedule Demo
                        </Button>

                        {/* Request Catalog */}
                        <Button
                          variant="secondary"
                          className="w-full justify-start"
                          onClick={() =>
                            window.open("mailto:info@example.com?subject=Request%20for%20Catalog")
                          }
                        >
                          <Send size={18} className="mr-2" /> Request Catalog
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
              </div>

          <div className="lg:col-span-2">
            <Card className="product-card">
              <CardHeader>
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and our team will get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <Input name="name" value={formData.name} onChange={handleInputChange} required placeholder="Enter your full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <Input name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="Enter your email" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <Input name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+254 XXX XXX XXX" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">County *</label>
                      <Select onValueChange={(value) => setFormData({ ...formData, county: value })} required>
                        <SelectTrigger className="focus:border-lime-500 focus:ring-lime-500">
                          <SelectValue placeholder="Select County" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {countyOptions.map((county, index) => (
                            <SelectItem key={index} value={county}>
                              {county}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label htmlFor="area" className="block text-sm font-medium mb-2">Area/Town *</label>
                      <Input id="area" name="area" value={formData.area} onChange={handleInputChange} required placeholder="e.g. Ruaka" className="focus:border-lime-500 focus:ring-lime-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Product of Interest</label>
                      <Select onValueChange={handleSelectChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product category" />
                        </SelectTrigger>
                        <SelectContent>
                          {productOptions.map((option, index) => (
                            <SelectItem key={index} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us about your farming needs, preferred equipment specifications, budget range, or any questions you have..."
                      rows={6}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="btn-quote flex-1" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={18} className="mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1">
                      Request Quote
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    * Required fields. By submitting this form, you agree to our privacy policy
                    and consent to being contacted by our sales team.
                  </p>
                </form>
              </CardContent>
            </Card>

            <Card className="product-card mt-6">
              <CardContent className="p-0">
                <div className="h-64 w-full rounded-lg overflow-hidden">
                  <iframe
                    title="KFA Building Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.594770230731!2d36.057953614749446!3d-0.28645259980988364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aaa2d140f3223%3A0x8c4bc4cb5c5d1e62!2sKFA%20Building%2C%20Nakuru%2C%20Kenya!5e0!3m2!1sen!2ske!4v1698662143200!5m2!1sen!2ske"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    className="border-0 w-full h-full"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
