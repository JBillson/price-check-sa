export interface Shop {
  id: string;
  name: string;
  url: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Price {
  id: string;
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  barcode?: string;
  createdAt: Date;
  updatedAt: Date;
  shopId: string;
  shop: Shop;
  prices: Price[];
}

export interface ProductWithRelations extends Product {
  shop: Shop;
  prices: Price[];
} 