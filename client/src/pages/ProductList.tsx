import { products, type Product } from "@/data/products";
import { groupProducts, productPath } from "@/data/catalogue";
import { Link } from "react-router-dom";

const ProductList = () => {
  const groups = groupProducts(products);

  const renderProductCard = (product: Product) => (
    <div key={product.id} className="border rounded-lg p-4 shadow-md">
      <img
        src={product.image}
        alt={product.name}
        className="mb-2 w-full h-48 object-cover rounded"
      />
      <h3 className="text-xl font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{product.description}</p>
      <Link
        to={productPath(product.slug)}
        className="text-red-600 hover:underline font-medium"
      >
        View Details
      </Link>
    </div>
  );

  return (
    <section className="p-8 space-y-12">
      {groups.map((group) => (
        <div key={group.category}>
          <h2 className="text-2xl font-bold mb-4">{group.heading}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {group.items.map(renderProductCard)}
          </div>
        </div>
      ))}
    </section>
  );
};

export default ProductList;
