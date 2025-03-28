import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Create a test shop if it doesn't exist
    const shop = await prisma.shop.upsert({
      where: { name: 'Test Shop' },
      update: {},
      create: {
        name: 'Test Shop',
        url: 'https://test-shop.com',
      },
    });

    // Create a test product
    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        description: 'This is a test product',
        imageUrl: 'https://placehold.co/400x400?text=Test+Product',
        brand: 'Test Brand',
        category: 'Test Category',
        shopId: shop.id,
        prices: {
          create: {
            amount: 99.99,
            currency: 'ZAR',
          },
        },
      },
      include: {
        shop: true,
        prices: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating test product:', error);
    return NextResponse.json(
      { error: 'Failed to create test product' },
      { status: 500 }
    );
  }
} 