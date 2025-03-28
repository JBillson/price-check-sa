import { BaseScraper, ScrapedProduct } from './BaseScraper';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { prisma } from '../lib/prisma';
import { PrismaClient, Prisma } from '@prisma/client';

export class WoolworthsScraper extends BaseScraper {
  public baseUrl = 'https://www.woolworths.co.za';
  protected shopName = 'Woolworths';
  private readonly itemsPerPage = 100;

  async fetchAllProducts(query: string = ""): Promise<ScrapedProduct[]> {
    console.log('[WoolworthsScraper] Starting product fetch');
    const allProducts: ScrapedProduct[] = [];
    let currentPage = 0;
    let hasMoreProducts = true;

    while (hasMoreProducts) {
      console.log(`[WoolworthsScraper] Fetching page ${currentPage + 1}...`);
      const pageProducts = await this.fetchWoolworthsPage(currentPage, query);
      
      if (pageProducts.length === 0 || pageProducts.length < this.itemsPerPage) {
        hasMoreProducts = false;
        console.log(`[WoolworthsScraper] Reached end of products (found ${pageProducts.length} on last page)`);
      }
      
      allProducts.push(...pageProducts);
      currentPage++;
      console.log(`[WoolworthsScraper] Total products processed: ${allProducts.length}`);

      // Add a small delay between pages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`[WoolworthsScraper] Completed fetching all products. Total: ${allProducts.length}`);
    return allProducts;
  }

  private async fetchWoolworthsPage(pageNumber: number, query: string): Promise<ScrapedProduct[]> {
    const url = `${this.baseUrl}/cat/Food/_/N-1z13sk5?No=${pageNumber * this.itemsPerPage}&Nrpp=${this.itemsPerPage}`;
    console.log(`[WoolworthsScraper] Fetching page ${pageNumber + 1} from: ${url}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 4320 });

      // Navigate to the page
      console.log('[WoolworthsScraper] Loading page...');
      const response = await page.goto(url, { 
        waitUntil: ['domcontentloaded', 'load'],
        timeout: 30000 
      });

      if (!response || response.status() !== 200) {
        console.error(`[WoolworthsScraper] Failed to load page: ${response?.status()}`);
        return [];
      }

      // Wait for product cards to load
      console.log('[WoolworthsScraper] Waiting for product cards...');
      await page.waitForSelector('.product-list__item', { timeout: 10000 });

      // Wait for network idle with increased timeout
      await page.waitForNetworkIdle({ timeout: 5000 });

      // Get initial count of product images
      const initialImageCount = await page.evaluate(() => {
        return document.querySelectorAll('.product--image img').length;
      });
      console.log(`[WoolworthsScraper] Initial image count: ${initialImageCount}`);

      // Scroll until no new images appear
      console.log('[WoolworthsScraper] Starting to scroll page to load all images...');
      let previousImageCount = initialImageCount;
      const scrollHeight = 4320;
      let scrollPosition = 0;
      let maxScrolls = 10; // Maximum number of scrolls to prevent infinite loops

      while (scrollPosition < maxScrolls * scrollHeight) {
        // Scroll down
        scrollPosition += scrollHeight;
        await page.evaluate((height) => {
          window.scrollTo(0, height);
        }, scrollPosition);

        // Add a small delay to allow for image loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get current image count
        const currentImageCount = await page.evaluate(() => {
          return document.querySelectorAll('.product--image img').length;
        });

        console.log(`[WoolworthsScraper] Current image count after scroll: ${currentImageCount}`);

        if (currentImageCount === previousImageCount)
          break;

        previousImageCount = currentImageCount;
      }

      // Final wait for any remaining images
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get final count of images
      const finalImageCount = await page.evaluate(() => {
        return document.querySelectorAll('.product--image img').length;
      });
      console.log(`[WoolworthsScraper] Final image count after all scrolling: ${finalImageCount}`);

      // Log the total scroll distance
      console.log(`[WoolworthsScraper] Total scroll distance: ${scrollPosition}px`);

      // Extract product data
      const products = await page.evaluate(() => {
        const items = document.querySelectorAll('.product-list__item');
        return Array.from(items).map(item => {
          // Get product link
          const productLink = item.querySelector('a.product--view')?.getAttribute('href') || '';
          
          // Get product details from prod_details div
          const detailsDiv = item.querySelector('.prod_details');
          const nameElement = detailsDiv?.querySelector('.product-card__name');
          const rangeElement = detailsDiv?.querySelector('.product--range a');
          const descriptionElement = detailsDiv?.querySelector('.product--desc a');
          
          // Get price information
          const priceField = item.querySelector('.product__price-field');
          const priceElement = priceField?.querySelector('.price');
          const promotionElement = priceField?.querySelector('.product__special');
          
          // Get product image
          const imageWrapper = item.querySelector('.product--image');
          const imageElement = imageWrapper?.querySelector('img');

          return {
            name: nameElement?.textContent?.trim() || '',
            price: priceElement ? parseFloat(priceElement.textContent?.replace(/[^0-9.]/g, '') || '0') : 0,
            currency: 'ZAR',
            imageUrl: imageElement?.getAttribute('src') || '',
            description: descriptionElement?.textContent?.trim() || '',
            brand: rangeElement?.textContent?.trim() || '',
            category: '', // We can extract this from the product link if needed
            promotion: promotionElement?.textContent?.trim() || '',
            productUrl: productLink ? `https://www.woolworths.co.za${productLink}` : '',
          };
        });
      });

      console.log(`[WoolworthsScraper] Found ${products.length} products on page ${pageNumber + 1}`);
      
      // Log first product for debugging
      if (products.length > 0) {
        console.log('[WoolworthsScraper] First product data:', products[0]);
      }

      // Save products to database
      await this.saveProductsToDatabase(products);

      return products;
    } finally {
      await browser.close();
    }
  }

  private async saveProductsToDatabase(products: ScrapedProduct[]): Promise<void> {
    try {
      await prisma.$transaction(async (prisma) => {
        for (const product of products) {
          // Find or create shop
          const shop = await prisma.shop.upsert({
            where: { name: this.shopName },
            update: {},
            create: {
              name: this.shopName,
              url: this.baseUrl,
            },
          });

          // Upsert product
          const upsertedProduct = await prisma.product.upsert({
            where: { 
              name_shopId: {
                name: product.name,
                shopId: shop.id,
              }
            },
            update: {
              description: product.description,
              imageUrl: product.imageUrl,
              category: product.category,
              brand: product.brand,
            },
            create: {
              name: product.name,
              description: product.description,
              imageUrl: product.imageUrl,
              category: product.category,
              brand: product.brand,
              shopId: shop.id,
            },
          });

          // Create price record
          await prisma.price.create({
            data: {
              amount: product.price,
              currency: product.currency,
              productId: upsertedProduct.id,
            },
          });
        }
      });
      console.log(`[WoolworthsScraper] Successfully saved ${products.length} products to database`);
    } catch (error) {
      console.error('[WoolworthsScraper] Error saving products to database:', error);
      throw error;
    }
  }

  async getProductDetails(url: string): Promise<ScrapedProduct> {
    console.log(`[WoolworthsScraper] Fetching product details from: ${url}`);
    
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1366, height: 768 });
        
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Wait for product information to load
        await page.waitForSelector('.product-name, .product-description, .product-image', {
          timeout: 30000,
        });
        
        // Get page content
        const html = await page.content();
        const $ = cheerio.load(html);
        
        const name = $('.product-name').text().trim();
        const description = $('.product-description').text().trim();
        const brand = $('.product-brand').text().trim();
        const category = $('.product-category').text().trim();
        const priceText = $('.price').text().trim();
        const price = parseFloat(priceText.replace('R', '').replace(',', '.'));
        
        // Find product image
        const imgElements = $('.product-image img');
        let imageUrl = imgElements.attr('src') || imgElements.attr('data-src');
        
        if (!imageUrl) {
          const srcset = imgElements.attr('srcset');
          if (srcset) {
            imageUrl = srcset.split(',')[0].trim().split(' ')[0];
          }
        }
        
        // Process the found imageUrl
        let finalImageUrl = undefined;
        if (imageUrl && !imageUrl.includes('placeholder') && !imageUrl.includes('data:image')) {
          finalImageUrl = imageUrl.startsWith('http') ? imageUrl : `${this.baseUrl}${imageUrl}`;
        }
        
        const barcode = $('.product-barcode').text().trim();

        return {
          name,
          description,
          brand,
          category,
          price,
          currency: 'ZAR',
          imageUrl: finalImageUrl,
          barcode,
        };
      } finally {
        await browser.close();
      }
    } catch (error) {
      console.error('[WoolworthsScraper] Error getting product details:', error);
      throw error;
    }
  }

  async getProductPrice(url: string): Promise<any> {
    console.log(`[WoolworthsScraper] Fetching price from: ${url}`);
    
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        await page.waitForSelector('.price', { timeout: 20000 });
        
        const priceText = await page.$eval('.price', (el) => el.textContent?.trim() || '');
        const amount = parseFloat(priceText.replace('R', '').replace(',', '.'));

        return {
          amount,
          currency: 'ZAR',
          product: {
            connect: {
              id: '', // Will be set when creating the price
            },
          },
        };
      } finally {
        await browser.close();
      }
    } catch (error) {
      console.error('[WoolworthsScraper] Error getting product price:', error);
      throw error;
    }
  }
}