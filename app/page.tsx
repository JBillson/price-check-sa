import { prisma } from '@/lib/prisma';
import { ProductList } from './components/ProductList';
import { Navigation } from './components/Navigation';

export default async function Home() {
  const products = await prisma.product.findMany({
    include: {
      shop: true,
      prices: true,
    },
  });

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Welcome to Price Check SA</h1>
            <p className="text-gray-600 mb-8">
              We're currently setting up our product database. Please check back soon!
            </p>
            <div className="bg-gray-50 p-6 rounded-lg max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold mb-2">What to expect:</h2>
              <ul className="text-left space-y-2 text-gray-600">
                <li>• Real-time price comparisons across major South African retailers</li>
                <li>• Price history tracking and trends</li>
                <li>• Price alerts for your favorite products</li>
                <li>• Shopping lists with price comparisons</li>
              </ul>
            </div>
          </div>
        ) : (
          <ProductList initialProducts={products} />
        )}
      </div>
    </main>
  );
}

