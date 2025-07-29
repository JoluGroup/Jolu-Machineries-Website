import { Award, Users, Wrench, ShieldCheck, Truck, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AboutSection = () => {
  const features = [
    {
      icon: Award,
      title: "15+ Years Experience",
      description: "Over a decade of expertise in agricultural machinery sales and service"
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Certified technicians and agricultural specialists at your service"
    },
    {
      icon: Wrench,
      title: "Comprehensive Service",
      description: "Complete after-sales support including maintenance and repairs"
    },
    {
      icon: ShieldCheck,
      title: "Genuine Parts",
      description: "Only authentic Zoomlion parts and accessories for your equipment"
    },
    {
      icon: Truck,
      title: "Nationwide Delivery",
      description: "Reliable delivery and installation services across Nigeria"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your agricultural needs"
    }
  ];

  const testimonials = [
    {
      name: "Geoffrey Maina",
      role: "Large Scale Farmer",
      location: "Eldoret",
      comment: "Jolu Machineries provided exceptional service. My Zoomlion tractor has been working perfectly for 3 years with minimal downtime.",
      rating: 5
    },
    {
      name: "Priscilla Auma",
      role: "Agricultural Cooperative Leader",
      location: "Nakuru",
      comment: "Professional team, quality equipment, and excellent after-sales support. Highly recommend Jolu Machineries to all farmers.",
      rating: 5
    },
    {
      name: "Syombua Kyalo",
      role: "Commercial Farmer",
      location: "Machakos",
      comment: "The harvester we purchased has significantly improved our farm productivity. Great value for money and reliable service.",
      rating: 5
    }
  ];

  return (
    <section id="about" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            About Jolu Machineries
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Your Trusted Agricultural Partner
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            For over 15 years, Jolu Agricultural & Construction Machineries has been Kenya's 
            premier dealer for Zoomlion agricultural equipment. We combine industry expertise 
            with unwavering commitment to help farmers achieve greater productivity and success.
          </p>
        </div>

        {/* Company Story */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-3xl font-bold mb-6 text-foreground">Our Story</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Founded with a vision to revolutionize Kenyan agriculture, Jolu Machineries 
                began as a small agricultural equipment dealer with big dreams. Today, we're 
                proud to be one of Kenya's leading distributors of Zoomlion agricultural machinery.
              </p>
              <p>
                Our journey started when we recognized the need for reliable, high-quality 
                agricultural equipment that could withstand Kenya's diverse farming conditions. 
                Partnering with Zoomlion, a global leader in agricultural technology, we've been 
                able to provide farmers with world-class equipment at competitive prices.
              </p>
              <p>
                What sets us apart is our commitment to building lasting relationships with our 
                customers. We don't just sell equipment; we provide comprehensive support, 
                training, and maintenance services to ensure our customers get the maximum 
                return on their investment.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold mb-6 text-foreground">Why Choose Us?</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card key={index} className="product-card">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <feature.icon size={20} className="text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="card-gradient border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To empower Kenyan farmers with world-class agricultural machinery and 
                exceptional service, driving agricultural productivity and food security 
                across the nation.
              </p>
            </CardContent>
          </Card>

          <Card className="card-gradient border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be East Africa's leading agricultural machinery dealer, recognized for 
                innovation, reliability, and unwavering commitment to customer success 
                in modern farming.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        <div>
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            What Our Customers Say
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="product-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.comment}"
                  </p>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-primary">{testimonial.role}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;