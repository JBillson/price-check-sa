export interface Product {
  name: string;
  description: string;
  imageUrl?: string;
  category?: string;
  brand?: string;
  prices: {
    amount: number;
    currency: string;
  }[];
  shop: {
    name: string;
    logoUrl?: string;
  };
} 