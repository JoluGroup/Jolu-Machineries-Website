import { products } from "@/data/products";
import { Link } from "react-router-dom";

const ProductList = () => {
  const tractors = products.filter((product) => product.category === "tractors");
  const harvesters = products.filter((product) => product.category === "harvesters");
  const implementsCategory = products.filter((product) => product.category === "implements");

  const renderProductCard = (product: any) => (
    <div key={product.id} className="border rounded-lg p-4 shadow-md">
      <img
        src={product.image}
        alt={product.name}
        className="mb-2 w-full h-48 object-cover rounded"
      />
      <h3 className="text-xl font-semibold">{product.name}</h3>

      {/* Rating and Reviews */}
      <div className="flex items-center text-sm text-yellow-600 mb-1">
        <span className="font-medium">{product.rating}</span>
        <span className="mx-1">★</span>
        <span className="text-gray-500">({product.reviews} reviews)</span>
      </div>

      {/* Horsepower Info */}
      {product.horsepower && (
        <p className="text-sm text-gray-600 mb-1">{product.horsepower}</p>
      )}

      {/* Features Preview */}
      {product.features && (
        <p className="text-sm text-gray-600 mb-4">
          {product.features.slice(0, 2).join(", ")}
          {product.features.length > 2 && ` +${product.features.length - 2} more`}
        </p>
      )}

      <Link
        to={`/product/${product.slug}`}
        className="text-red-600 hover:underline font-medium"
      >
        View Details
      </Link>
    </div>
  );

  return (
    <section className="p-8 space-y-12">
      {/* Tractors */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Our Tractors</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {tractors.map(renderProductCard)}
        </div>
      </div>

      {/* Harvesters */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Our Harvesters</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {harvesters.map(renderProductCard)}
        </div>
      </div>

      {/* Farm Implements */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Farm Implements</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {implementsCategory.map(renderProductCard)}
        </div>
      </div>
    </section>
  );
};

export default ProductList;
