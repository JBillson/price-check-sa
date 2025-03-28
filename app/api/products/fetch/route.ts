import { NextResponse } from 'next/server';
import { WoolworthsScraper } from '@/app/services/WoolworthsScraper';
import { prisma } from '@/lib/prisma';
import { Product } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const shopName = body?.shopName;
    console.log(`[FetchEndpoint] Received request for shop: ${shopName}`);

    if (!shopName) {
      console.log('[FetchEndpoint] Error: No shop name provided');
      return NextResponse.json({ error: 'Shop name is required' }, { status: 400 });
    }

    // Create fetch operation record
    const fetchOperation = await prisma.fetchOperation.create({
      data: {
        id: `fetch_${Date.now()}`,
        shopName,
        isFetching: true
      }
    });

    let scraper;
    switch (shopName.toLowerCase()) {
      case 'woolworths':
        console.log('[FetchEndpoint] Initializing Woolworths scraper');
        scraper = new WoolworthsScraper();
        break;
      // Add Pick n Pay scraper here when implemented
      default:
        console.log(`[FetchEndpoint] Error: Unsupported shop: ${shopName}`);
        return NextResponse.json({ error: 'Unsupported shop' }, { status: 400 });
    }

    try {
      // Get all products from the shop
      console.log('[FetchEndpoint] Starting product search');
      const products = await scraper.fetchAllProducts();
      console.log(`[FetchEndpoint] Found ${products.length} products to process`);

      // Store products in database
      let processedCount = 0;
      for (const product of products) {
        try {
          // Find or create shop
          let shop = await prisma.shop.findFirst({ 
            where: { name: shopName } 
          });
          
          if (!shop) {
            console.log(`[FetchEndpoint] Shop ${shopName} not found, creating...`);
            shop = await prisma.shop.create({
              data: {
                name: shopName,
                url: scraper.baseUrl
              }
            });
          }

          // Upsert product
          const upsertedProduct = await prisma.product.upsert({
            where: {
              name_shopId: {
                name: product.name,
                shopId: shop.id,
              },
            },
            update: {
              description: product.description || null,
              brand: product.brand || null,
              category: product.category || null,
              imageUrl: product.imageUrl || null,
              barcode: product.barcode || null,
            },
            create: {
              name: product.name,
              description: product.description || null,
              brand: product.brand || null,
              category: product.category || null,
              imageUrl: product.imageUrl || null,
              barcode: product.barcode || null,
              shop: {
                connect: {
                  id: shop.id
                }
              },
            },
          });

          // Create price record
          await prisma.price.create({
            data: {
              amount: product.price,
              currency: product.currency || 'ZAR',
              product: {
                connect: {
                  id: upsertedProduct.id
                }
              }
            }
          });
          
          processedCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`[FetchEndpoint] Error processing product ${product.name}: ${errorMessage}`);
        }
      }

      console.log(`[FetchEndpoint] Completed processing ${processedCount} products`);
      return NextResponse.json({ 
        message: `Successfully fetched ${products.length} products from ${shopName}`,
        processed: processedCount,
        total: products.length
      });
    } finally {
      // Update fetch operation to indicate completion
      await prisma.fetchOperation.update({
        where: { id: fetchOperation.id },
        data: { isFetching: false }
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[FetchEndpoint] Error during fetch process:', errorMessage);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shopName = searchParams.get('shop');
    const shopId = searchParams.get('shopId');
    
    let products;
    
    const includeRelations = {
      shop: true,
      prices: {
        orderBy: {
          createdAt: 'desc' as const,
        },
        take: 1,
      },
    };
    
    if (shopName) {
      // Fetch products for a specific shop by name
      products = await prisma.product.findMany({
        where: {
          shop: {
            name: shopName,
          },
        },
        include: includeRelations,
      });
    } else if (shopId) {
      // Fetch products for a specific shop by ID
      products = await prisma.product.findMany({
        where: {
          shopId,
        },
        include: includeRelations,
      });
    } else {
      // Fetch all products
      products = await prisma.product.findMany({
        include: includeRelations,
      });
    }
    
    // Log summary of products
    console.log(`[API] Fetched ${products.length} products`);
    const productsWithImages = products.filter((p) => p.imageUrl !== null);
    console.log(`[API] Products with images: ${productsWithImages.length}`);
    
    // Make sure each product has a fallback if image is null
    const processedProducts = products.map((product) => {
      const imageUrl = product.imageUrl ?? 'https://placehold.co/400x400?text=No+Image';
      return {
        ...product,
        imageUrl,
      };
    });
    
    return NextResponse.json(processedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
} 