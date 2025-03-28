import { NextResponse } from 'next/server';
import { WoolworthsScraper } from '@/app/services/WoolworthsScraper';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Initialize scrapers for different shops
    const woolworthsScraper = new WoolworthsScraper();

    // Search products in parallel
    const [woolworthsProducts] = await Promise.all([
      woolworthsScraper.fetchAllProducts(query),
      // Add more shop scrapers here
    ]);

    // Combine results
    const allProducts = [...woolworthsProducts];

    // Store products in database
    for (const product of allProducts) {
      await prisma.product.upsert({
        where: {
          name_shopId: {
            name: product.name,
            shopId: (await prisma.shop.findFirst({ where: { name: 'Woolworths' } }))?.id || '',
          },
        },
        update: {
          description: product.description,
          brand: product.brand,
          category: product.category,
          imageUrl: product.imageUrl,
          barcode: product.barcode,
        },
        create: {
          name: product.name,
          description: product.description,
          brand: product.brand,
          category: product.category,
          imageUrl: product.imageUrl,
          barcode: product.barcode,
          shop: {
            connectOrCreate: {
              where: { name: 'Woolworths' },
              create: {
                name: 'Woolworths',
                url: 'https://www.woolworths.co.za',
              },
            },
          },
          prices: {
            create: {
              amount: product.price,
              currency: product.currency,
            },
          },
        },
      });
    }

    return NextResponse.json(allProducts);
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
} 