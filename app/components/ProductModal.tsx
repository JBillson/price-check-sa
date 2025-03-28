import { ScrapedProduct } from '../services/BaseScraper';

interface ProductModalProps {
  product: ScrapedProduct | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="aspect-square">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">Price</h3>
              <p className="text-2xl font-bold">
                {product.currency} {product.price.toFixed(2)}
              </p>
            </div>

            {product.brand && (
              <div>
                <h3 className="text-xl font-semibold">Brand</h3>
                <p>{product.brand}</p>
              </div>
            )}

            {product.description && (
              <div>
                <h3 className="text-xl font-semibold">Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            {product.promotion && (
              <div className="bg-yellow-100 p-3 rounded">
                <h3 className="text-xl font-semibold text-yellow-800">Promotion</h3>
                <p className="text-yellow-800">{product.promotion}</p>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold">Product URL</h3>
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {product.productUrl}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 