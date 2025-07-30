import { useParams, Link } from "react-router-dom";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return <div className="text-center text-red-600 mt-20">Product not found</div>;
  }

  return (
    <>
      <Header />
      <main className="bg-background text-foreground">
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <img
              src={product.image}
              alt={product.name}
              className="rounded-xl shadow-lg w-full object-contain"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{product.name}</h1>
              <p className="text-lg mb-6">{product.longDescription}</p>
              {product.keySpecs && (
                <ul className="space-y-2 text-muted-foreground">
                  {product.keySpecs.map((spec, i) => (
                    <li key={i}>⚙️ <strong>{spec.label}</strong>: {spec.value}</li>
                  ))}
                </ul>
              )}
              <Link to="/quote">
                <Button className="mt-6 btn-agricultural">Request a Quote</Button>
              </Link>
            </div>
          </div>

          {/* Advantages */}
          {product.advantages && (
            <>
              <h3 className="text-xl font-semibold mb-4 mt-10 text-primary">Advantages</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                {product.advantages.map((adv, i) => (
                  <li key={i}>{adv}</li>
                ))}
              </ul>
            </>
          )}

          {/* Specifications Table */}
          {product.specTable && (
            <>
              <h3 className="text-xl font-semibold mt-10 mb-4 text-primary">Specifications Table</h3>
              <div className="overflow-auto">
                <table className="min-w-full text-sm text-left border border-border">
                  <thead className="bg-primary text-primary-foreground">
                    <tr>
                      {product.specTable.headers.map((header, i) => (
                        <th key={i} className="p-3 border border-border">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-card text-foreground">
                    {product.specTable.rows.map((row, i) => (
                      <tr key={i} className="border-t border-border">
                        {row.map((cell, j) => (
                          <td key={j} className="p-3 border border-border">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Call to Action */}
          {product.ctaHeadline && (
            <section className="bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white py-12 px-6 text-center rounded-2xl mt-16 shadow-lg border dark:border-zinc-700">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{product.ctaHeadline}</h2>
              <p className="text-lg mb-6 max-w-2xl mx-auto">{product.ctaDescription}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/quote">
                  <Button className="bg-primary-dark text-white hover:bg-primary border border-primary-dark font-semibold px-6 py-3 transition-colors">
                    Request a Quote
                  </Button>
                </Link>
                <a
                  href="https://wa.me/254743682700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 transition-colors">
                    Chat on WhatsApp
                  </Button>
                </a>
              </div>
            </section>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
