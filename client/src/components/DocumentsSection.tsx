import { FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const documents = [
  {
    title: "Company Profile",
    description: "Learn more about our history, mission, and achievements.",
    file: "/lovable-uploads/docs/company-profile.pdf",
  },
  {
    title: "Company Brochure",
    description: "Browse our full range of agricultural and construction equipment.",
    file: "/lovable-uploads/docs/product-brochure.pdf",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const DocumentsSection = () => {
  return (
    <section id="documents" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          className="text-4xl font-bold mb-6 text-foreground"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Company Documents
        </motion.h2>
        <motion.p
          className="text-muted-foreground mb-12 max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Download our official documents to learn more about our company and products.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8">
          {documents.map((doc, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="text-primary" size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                  </div>
                    <a
                    href={doc.file}
                    download
                    className="p-2 rounded-full bg-primary text-white hover:bg-[#B5D646] transition-colors"
                    >
                    <Download size={20} />
                    </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentsSection;
