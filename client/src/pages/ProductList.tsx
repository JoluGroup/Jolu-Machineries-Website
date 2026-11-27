import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResponsiveImage from "@/components/ResponsiveImage";
import { products, type Product } from "@/data/products";
import { groupProducts, productPath } from "@/data/catalogue";
import { gateCopy } from "@/data/spec-verification";
import { Link } from "react-router-dom";

const ProductList = () => {
  const groups = groupProducts(products);

  // The <img> fills the card width (the card image stage has no horizontal margin; padding is on the img).
  // Section has p-8 (4rem total); grid is 1 col, 2 cols from md (gap-6) and 3 cols from xl (gap-6).
  const IMAGE_SIZES =
    "(min-width: 1280px) calc((100vw - 7rem) / 3), (min-width: 768px) calc((100vw - 5.5rem) / 2), calc(100vw - 4rem)";

  const renderProductCard = (product: Product) => (
    <article
      key={product.id}
      className="group flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow-md transition-shadow hover:shadow-lg"
    >
      {/* Fixed-ratio showroom stage: the whole machine is always visible (object-contain), never stretched. */}
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b bg-white">
        {/* product.image is an image-manifest key, so it must go through ResponsiveImage */}
        <ResponsiveImage
          sizes={IMAGE_SIZES}
          src={product.image}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-contain p-3"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-xl font-semibold leading-snug">{product.name}</h3>
        <p className="mt-2 mb-4 text-sm text-gray-600 line-clamp-3">{gateCopy(product.description, product)}</p>
        <Link
          to={productPath(product.slug)}
          className="mt-auto inline-flex items-center gap-1 font-medium text-red-600 hover:text-red-700 hover:underline"
        >
          View Details
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </article>
  );

  return (
    <>
      <Header />
      <main>
        {/* One h1 per route (M2-SEO-01); visually hidden so the established design is unchanged. */}
        <h1 className="sr-only">Zoomlion Tractors, Harvesters &amp; Farm Implements</h1>
        <section className="p-8 space-y-12">
          {groups.map((group) => (
            <div key={group.category}>
              <h2 className="mb-6 border-l-4 border-primary pl-3 text-2xl font-bold">{group.heading}</h2>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map(renderProductCard)}
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ProductList;
