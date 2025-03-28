import { Prisma } from '@prisma/client';

export interface ScrapedProduct {
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  description: string;
  brand: string;
  category: string;
  promotion?: string;
  productUrl?: string;
  barcode?: string;
}

export abstract class BaseScraper {
  protected abstract baseUrl: string;
  protected abstract shopName: string;

  abstract fetchAllProducts(query?: string): Promise<ScrapedProduct[]>;
  abstract getProductDetails(url: string): Promise<ScrapedProduct>;
  abstract getProductPrice(url: string): Promise<any>;

  protected async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 