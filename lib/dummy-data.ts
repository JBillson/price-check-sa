export interface Shop {
  name: string
  price: number
  inStock: boolean
  deliveryDays: number
}

export interface Variant {
  id: string
  name: string
  size: string
  price: number
}

export interface Product {
  id: string
  name: string
  baseSize?: string
  image: string
  category: string
  rating: number
  shops: Shop[]
  variants?: Product[]
  hasVariants?: boolean
}

// Helper function to clean product names by removing sizes
export function getCleanProductName(name: string): string {
  // Remove size patterns like (500g), (1kg), (2L), (6 Pack), etc.
  return name.replace(/\s*$$[^)]*$$\s*$/, "")
}

export const dummyProducts: Product[] = [
  {
    id: "1",
    name: "Fresh Free-Range Eggs",
    baseSize: "6 Pack",
    image:
      "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWdnc3xlbnwwfHwwfHx8MA%3D%3D",
    category: "Dairy & Eggs",
    rating: 4.7,
    shops: [
      { name: "Woolworths", price: 39.99, inStock: true, deliveryDays: 1 },
      { name: "Pick n Pay", price: 36.99, inStock: true, deliveryDays: 1 },
      { name: "Checkers", price: 34.99, inStock: true, deliveryDays: 2 },
      { name: "Spar", price: 38.99, inStock: true, deliveryDays: 1 },
      { name: "Shoprite", price: 32.99, inStock: true, deliveryDays: 2 },
    ],
    hasVariants: true,
    variants: [
      {
        id: "1-6",
        name: "Fresh Free-Range Eggs (6 Pack)",
        baseSize: "6 Pack",
        image:
          "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWdnc3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Dairy & Eggs",
        rating: 4.7,
        shops: [
          { name: "Woolworths", price: 39.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 36.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 34.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 38.99, inStock: true, deliveryDays: 1 },
          { name: "Shoprite", price: 32.99, inStock: true, deliveryDays: 2 },
        ],
      },
      {
        id: "1-12",
        name: "Fresh Free-Range Eggs (12 Pack)",
        baseSize: "12 Pack",
        image:
          "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWdnc3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Dairy & Eggs",
        rating: 4.7,
        shops: [
          { name: "Woolworths", price: 69.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 64.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 59.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 67.99, inStock: true, deliveryDays: 1 },
          { name: "Shoprite", price: 57.99, inStock: true, deliveryDays: 2 },
        ],
      },
      {
        id: "1-18",
        name: "Fresh Free-Range Eggs (18 Pack)",
        baseSize: "18 Pack",
        image:
          "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWdnc3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Dairy & Eggs",
        rating: 4.7,
        shops: [
          { name: "Woolworths", price: 89.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 84.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 79.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 86.99, inStock: true, deliveryDays: 1 },
          { name: "Shoprite", price: 77.99, inStock: true, deliveryDays: 2 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Organic Avocados",
    baseSize: "4 Pack",
    image:
      "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZvY2Fkb3xlbnwwfHwwfHx8MA%3D%3D",
    category: "Fresh Produce",
    rating: 4.5,
    shops: [
      { name: "Woolworths", price: 59.99, inStock: true, deliveryDays: 1 },
      { name: "Pick n Pay", price: 54.99, inStock: true, deliveryDays: 1 },
      { name: "Checkers", price: 49.99, inStock: true, deliveryDays: 2 },
      { name: "Spar", price: 56.99, inStock: true, deliveryDays: 1 },
    ],
    hasVariants: true,
    variants: [
      {
        id: "2-2",
        name: "Organic Avocados (2 Pack)",
        baseSize: "2 Pack",
        image:
          "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZvY2Fkb3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Fresh Produce",
        rating: 4.5,
        shops: [
          { name: "Woolworths", price: 34.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 29.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 27.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 32.99, inStock: true, deliveryDays: 1 },
        ],
      },
      {
        id: "2-4",
        name: "Organic Avocados (4 Pack)",
        baseSize: "4 Pack",
        image:
          "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZvY2Fkb3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Fresh Produce",
        rating: 4.5,
        shops: [
          { name: "Woolworths", price: 59.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 54.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 49.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 56.99, inStock: true, deliveryDays: 1 },
        ],
      },
      {
        id: "2-6",
        name: "Organic Avocados (6 Pack)",
        baseSize: "6 Pack",
        image:
          "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZvY2Fkb3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Fresh Produce",
        rating: 4.5,
        shops: [
          { name: "Woolworths", price: 79.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 74.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 69.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 76.99, inStock: true, deliveryDays: 1 },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Grass-Fed Beef Mince",
    baseSize: "500g",
    image:
      "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWluY2VkJTIwbWVhdHxlbnwwfHwwfHx8MA%3D%3D",
    category: "Meat & Poultry",
    rating: 4.3,
    shops: [
      { name: "Woolworths", price: 89.99, inStock: true, deliveryDays: 1 },
      { name: "Pick n Pay", price: 79.99, inStock: false, deliveryDays: 1 },
      { name: "Checkers", price: 74.99, inStock: true, deliveryDays: 2 },
      { name: "Spar", price: 84.99, inStock: true, deliveryDays: 1 },
      { name: "Shoprite", price: 69.99, inStock: true, deliveryDays: 2 },
    ],
    hasVariants: true,
    variants: [
      {
        id: "3-500g",
        name: "Grass-Fed Beef Mince (500g)",
        baseSize: "500g",
        image:
          "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWluY2VkJTIwbWVhdHxlbnwwfHwwfHx8MA%3D%3D",
        category: "Meat & Poultry",
        rating: 4.3,
        shops: [
          { name: "Woolworths", price: 89.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 79.99, inStock: false, deliveryDays: 1 },
          { name: "Checkers", price: 74.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 84.99, inStock: true, deliveryDays: 1 },
          { name: "Shoprite", price: 69.99, inStock: true, deliveryDays: 2 },
        ],
      },
      {
        id: "3-1kg",
        name: "Grass-Fed Beef Mince (1kg)",
        baseSize: "1kg",
        image:
          "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWluY2VkJTIwbWVhdHxlbnwwfHwwfHx8MA%3D%3D",
        category: "Meat & Poultry",
        rating: 4.3,
        shops: [
          { name: "Woolworths", price: 169.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 149.99, inStock: false, deliveryDays: 1 },
          { name: "Checkers", price: 139.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 159.99, inStock: true, deliveryDays: 1 },
          { name: "Shoprite", price: 129.99, inStock: true, deliveryDays: 2 },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Artisanal Sourdough Bread",
    baseSize: "800g",
    image:
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c291cmRvdWdoJTIwYnJlYWR8ZW58MHx8MHx8fDA%3D",
    category: "Bakery",
    rating: 4.6,
    shops: [
      { name: "Woolworths", price: 45.99, inStock: true, deliveryDays: 1 },
      { name: "Pick n Pay", price: 39.99, inStock: true, deliveryDays: 1 },
      { name: "Checkers", price: 36.99, inStock: true, deliveryDays: 2 },
      { name: "Spar", price: 42.99, inStock: true, deliveryDays: 1 },
    ],
  },
  {
    id: "5",
    name: "Full Cream Milk",
    baseSize: "2L",
    image:
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1pbGt8ZW58MHx8MHx8fDA%3D",
    category: "Dairy & Eggs",
    rating: 4.4,
    shops: [
      { name: "Woolworths", price: 32.99, inStock: true, deliveryDays: 1 },
      { name: "Pick n Pay", price: 29.99, inStock: true, deliveryDays: 1 },
      { name: "Checkers", price: 27.99, inStock: true, deliveryDays: 2 },
      { name: "Spar", price: 30.99, inStock: false, deliveryDays: 1 },
      { name: "Shoprite", price: 26.99, inStock: true, deliveryDays: 2 },
    ],
    hasVariants: true,
    variants: [
      {
        id: "5-1L",
        name: "Full Cream Milk (1L)",
        baseSize: "1L",
        image:
          "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1pbGt8ZW58MHx8MHx8fDA%3D",
        category: "Dairy & Eggs",
        rating: 4.4,
        shops: [
          { name: "Woolworths", price: 19.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 17.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 16.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 18.99, inStock: false, deliveryDays: 1 },
          { name: "Shoprite", price: 15.99, inStock: true, deliveryDays: 2 },
        ],
      },
      {
        id: "5-2L",
        name: "Full Cream Milk (2L)",
        baseSize: "2L",
        image:
          "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1pbGt8ZW58MHx8MHx8fDA%3D",
        category: "Dairy & Eggs",
        rating: 4.4,
        shops: [
          { name: "Woolworths", price: 32.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 29.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 27.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 30.99, inStock: false, deliveryDays: 1 },
          { name: "Shoprite", price: 26.99, inStock: true, deliveryDays: 2 },
        ],
      },
    ],
  },
  {
    id: "6",
    name: "Organic Baby Spinach",
    baseSize: "200g",
    image:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BpbmFjaHxlbnwwfHwwfHx8MA%3D%3D",
    category: "Fresh Produce",
    rating: 4.2,
    shops: [
      { name: "Woolworths", price: 29.99, inStock: true, deliveryDays: 1 },
      { name: "Pick n Pay", price: 26.99, inStock: true, deliveryDays: 1 },
      { name: "Checkers", price: 24.99, inStock: true, deliveryDays: 2 },
      { name: "Spar", price: 27.99, inStock: true, deliveryDays: 1 },
    ],
  },
  {
    id: "7",
    name: "Free-Range Whole Chicken",
    baseSize: "1.5kg",
    image:
      "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D",
    category: "Meat & Poultry",
    rating: 4.8,
    shops: [
      { name: "Woolworths", price: 109.99, inStock: true, deliveryDays: 1 },
      { name: "Pick n Pay", price: 99.99, inStock: true, deliveryDays: 1 },
      { name: "Checkers", price: 94.99, inStock: false, deliveryDays: 2 },
      { name: "Spar", price: 104.99, inStock: true, deliveryDays: 1 },
      { name: "Shoprite", price: 89.99, inStock: true, deliveryDays: 2 },
    ],
  },
  {
    id: "8",
    name: "Olive Oil Extra Virgin",
    baseSize: "500ml",
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b2xpdmUlMjBvaWx8ZW58MHx8MHx8fDA%3D",
    category: "Pantry",
    rating: 4.5,
    shops: [
      { name: "Woolworths", price: 89.99, inStock: true, deliveryDays: 1 },
      { name: "Pick n Pay", price: 79.99, inStock: true, deliveryDays: 1 },
      { name: "Checkers", price: 74.99, inStock: true, deliveryDays: 2 },
      { name: "Spar", price: 84.99, inStock: true, deliveryDays: 1 },
      { name: "Shoprite", price: 69.99, inStock: true, deliveryDays: 2 },
    ],
    hasVariants: true,
    variants: [
      {
        id: "8-500ml",
        name: "Olive Oil Extra Virgin (500ml)",
        baseSize: "500ml",
        image:
          "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b2xpdmUlMjBvaWx8ZW58MHx8MHx8fDA%3D",
        category: "Pantry",
        rating: 4.5,
        shops: [
          { name: "Woolworths", price: 89.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 79.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 74.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 84.99, inStock: true, deliveryDays: 1 },
          { name: "Shoprite", price: 69.99, inStock: true, deliveryDays: 2 },
        ],
      },
      {
        id: "8-1L",
        name: "Olive Oil Extra Virgin (1L)",
        baseSize: "1L",
        image:
          "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b2xpdmUlMjBvaWx8ZW58MHx8MHx8fDA%3D",
        category: "Pantry",
        rating: 4.5,
        shops: [
          { name: "Woolworths", price: 159.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 149.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 139.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 154.99, inStock: true, deliveryDays: 1 },
          { name: "Shoprite", price: 129.99, inStock: true, deliveryDays: 2 },
        ],
      },
    ],
  },
  {
    id: "9",
    name: "Freshly Baked Croissants",
    baseSize: "4 Pack",
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y3JvaXNzYW50fGVufDB8fDB8fHww",
    category: "Bakery",
    rating: 4.6,
    shops: [
      { name: "Woolworths", price: 49.99, inStock: true, deliveryDays: 1 },
      { name: "Pick n Pay", price: 44.99, inStock: true, deliveryDays: 1 },
      { name: "Checkers", price: 39.99, inStock: true, deliveryDays: 2 },
      { name: "Spar", price: 46.99, inStock: true, deliveryDays: 1 },
    ],
  },
  {
    id: "10",
    name: "Basmati Rice",
    baseSize: "2kg",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmljZXxlbnwwfHwwfHx8MA%3D%3D",
    category: "Pantry",
    rating: 4.3,
    shops: [
      { name: "Woolworths", price: 69.99, inStock: true, deliveryDays: 1 },
      { name: "Pick n Pay", price: 59.99, inStock: true, deliveryDays: 1 },
      { name: "Checkers", price: 54.99, inStock: true, deliveryDays: 2 },
      { name: "Spar", price: 64.99, inStock: true, deliveryDays: 1 },
      { name: "Shoprite", price: 49.99, inStock: true, deliveryDays: 2 },
    ],
    hasVariants: true,
    variants: [
      {
        id: "10-1kg",
        name: "Basmati Rice (1kg)",
        baseSize: "1kg",
        image:
          "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmljZXxlbnwwfHwwfHx8MA%3D%3D",
        category: "Pantry",
        rating: 4.3,
        shops: [
          { name: "Woolworths", price: 39.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 34.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 29.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 36.99, inStock: true, deliveryDays: 1 },
          { name: "Shoprite", price: 27.99, inStock: true, deliveryDays: 2 },
        ],
      },
      {
        id: "10-2kg",
        name: "Basmati Rice (2kg)",
        baseSize: "2kg",
        image:
          "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmljZXxlbnwwfHwwfHx8MA%3D%3D",
        category: "Pantry",
        rating: 4.3,
        shops: [
          { name: "Woolworths", price: 69.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 59.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 54.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 64.99, inStock: true, deliveryDays: 1 },
          { name: "Shoprite", price: 49.99, inStock: true, deliveryDays: 2 },
        ],
      },
      {
        id: "10-5kg",
        name: "Basmati Rice (5kg)",
        baseSize: "5kg",
        image:
          "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmljZXxlbnwwfHwwfHx8MA%3D%3D",
        category: "Pantry",
        rating: 4.3,
        shops: [
          { name: "Woolworths", price: 149.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 139.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 129.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 144.99, inStock: true, deliveryDays: 1 },
          { name: "Shoprite", price: 119.99, inStock: true, deliveryDays: 2 },
        ],
      },
    ],
  },
  {
    id: "11",
    name: "Mature Cheddar Cheese",
    baseSize: "250g",
    image:
      "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNoZWRkYXIlMjBjaGVlc2V8ZW58MHx8MHx8fDA%3D",
    category: "Dairy & Eggs",
    rating: 4.7,
    shops: [
      { name: "Woolworths", price: 64.99, inStock: true, deliveryDays: 1 },
      { name: "Pick n Pay", price: 59.99, inStock: true, deliveryDays: 1 },
      { name: "Checkers", price: 54.99, inStock: true, deliveryDays: 2 },
      { name: "Spar", price: 62.99, inStock: true, deliveryDays: 1 },
      { name: "Shoprite", price: 49.99, inStock: true, deliveryDays: 2 },
    ],
  },
  {
    id: "12",
    name: "Organic Bananas",
    baseSize: "1kg",
    image:
      "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFuYW5hc3xlbnwwfHwwfHx8MA%3D%3D",
    category: "Fresh Produce",
    rating: 4.4,
    shops: [
      { name: "Woolworths", price: 24.99, inStock: true, deliveryDays: 1 },
      { name: "Pick n Pay", price: 21.99, inStock: true, deliveryDays: 1 },
      { name: "Checkers", price: 19.99, inStock: true, deliveryDays: 2 },
      { name: "Spar", price: 22.99, inStock: true, deliveryDays: 1 },
      { name: "Shoprite", price: 17.99, inStock: true, deliveryDays: 2 },
    ],
    hasVariants: true,
    variants: [
      {
        id: "12-500g",
        name: "Organic Bananas (500g)",
        baseSize: "500g",
        image:
          "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFuYW5hc3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Fresh Produce",
        rating: 4.4,
        shops: [
          { name: "Woolworths", price: 14.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 12.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 11.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 13.99, inStock: true, deliveryDays: 1 },
          { name: "Shoprite", price: 10.99, inStock: true, deliveryDays: 2 },
        ],
      },
      {
        id: "12-1kg",
        name: "Organic Bananas (1kg)",
        baseSize: "1kg",
        image:
          "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFuYW5hc3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Fresh Produce",
        rating: 4.4,
        shops: [
          { name: "Woolworths", price: 24.99, inStock: true, deliveryDays: 1 },
          { name: "Pick n Pay", price: 21.99, inStock: true, deliveryDays: 1 },
          { name: "Checkers", price: 19.99, inStock: true, deliveryDays: 2 },
          { name: "Spar", price: 22.99, inStock: true, deliveryDays: 1 },
          { name: "Shoprite", price: 17.99, inStock: true, deliveryDays: 2 },
        ],
      },
    ],
  },
]

