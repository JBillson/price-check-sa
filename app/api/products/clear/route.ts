import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { shopName } = await request.json();
    console.log(`[ClearEndpoint] Received request to clear data for shop: ${shopName}`);

    if (!shopName) {
      console.log('[ClearEndpoint] Error: No shop name provided');
      return NextResponse.json({ error: 'Shop name is required' }, { status: 400 });
    }

    try {
      // Find the shop with its products
      const shop = await prisma.shop.findFirst({ 
        where: { name: shopName },
        include: { products: true }
      });

      if (!shop) {
        console.log(`[ClearEndpoint] Error: Shop '${shopName}' not found`);
        return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
      }

      console.log(`[ClearEndpoint] Found shop: ${shop.name} with ${shop.products.length} products`);

      // Extract product IDs
      const productIds = shop.products.map(product => product.id);
      
      // First, delete all prices for these products
      let deletedPricesCount = 0;
      if (productIds.length > 0) {
        const deletedPrices = await prisma.price.deleteMany({
          where: {
            productId: {
              in: productIds
            }
          }
        });
        deletedPricesCount = deletedPrices.count;
        console.log(`[ClearEndpoint] Deleted ${deletedPricesCount} prices`);
      }

      // Then delete all products for this shop
      const deletedProducts = await prisma.product.deleteMany({
        where: {
          shopId: shop.id
        }
      });
      
      console.log(`[ClearEndpoint] Successfully deleted ${deletedProducts.count} products for ${shopName}`);
      
      return NextResponse.json({
        message: `Successfully cleared ${deletedProducts.count} products for ${shopName}`,
        deleted: deletedProducts.count,
        deletedPrices: deletedPricesCount
      });
    } catch (dbError) {
      console.error('[ClearEndpoint] Database error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  } catch (error) {
    console.error('[ClearEndpoint] Error during clear process:', error);
    return NextResponse.json({ error: 'Failed to clear products' }, { status: 500 });
  }
} 