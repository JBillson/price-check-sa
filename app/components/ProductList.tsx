'use client';

import { useState, useEffect } from 'react';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Search, ShoppingCart, Loader2, PlusCircle, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import type { ProductWithRelations } from '../types';

interface ProductListProps {
  initialProducts: ProductWithRelations[];
}

type SortOption = 'price-low' | 'price-high' | 'name-asc' | 'name-desc';

export function ProductList({ initialProducts }: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(initialProducts);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('price-low');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const { cartItems, cartByShop, totalItems, addToCart } = useCart();

  // Get unique categories from products
  const categories = ['all', ...new Set(products.map(p => p.category || 'Uncategorized').filter(Boolean))];

  // Filter products based on search query
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || (product.category || 'Uncategorized') === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.prices[0]?.amount || 0;
    const priceB = b.prices[0]?.amount || 0;
    
    switch (sortOption) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedProducts.length);
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortOption]);

  // Function to add product to cart based on shop
  const handleAddToCart = (product: ProductWithRelations, shopName: string = '') => {
    const shopToUse = shopName || product.shop.name;
    const shopPrice = product.prices[0]?.amount || 0;
    
    addToCart(
      {
        id: product.id,
        name: product.name,
        image: product.imageUrl || '/images/product-placeholder.png',
        category: product.category || '',
        rating: 0,
        shops: [{
          name: shopToUse,
          price: shopPrice,
          inStock: true,
          deliveryDays: 1,
        }],
      },
      {
        name: shopToUse,
        price: shopPrice,
        inStock: true,
        deliveryDays: 1,
      }
    );
  };

  // Function to add product at best price
  const addBestPrice = (product: ProductWithRelations) => {
    // For now, we just have one price per product
    handleAddToCart(product);
  };

  // Function to handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      
      {/* Search and sort controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 h-full px-3 hover:bg-transparent"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4 text-gray-400" />
              </Button>
            )}
          </div>
        </form>
        
        <div className="w-full md:w-48">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href="/cart" passHref>
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2">{totalItems}</Badge>
            )}
          </Button>
        </Link>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedProducts.map((product) => (
          <Card 
            key={product.id} 
            className="overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
            onClick={() => setSelectedProduct(product)}
          >
            <div className="relative h-48 w-full bg-gray-100">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                  onError={(e) => {
                    console.log(`Image error for ${product.name}: ${product.imageUrl}`);
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.src = 'https://placehold.co/400x400?text=No+Image';
                  }}
                />
              ) : (
                <Image
                  src="https://placehold.co/400x400?text=No+Image"
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                />
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Badge variant="outline">{product.shop.name}</Badge>
                {product.brand && (
                  <Badge variant="secondary">{product.brand}</Badge>
                )}
              </div>
              <CardTitle className="text-lg line-clamp-2 h-12" title={product.name}>
                {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Available at:</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        addBestPrice(product);
                      }}
                    >
                      Add Best Price
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 relative rounded-full overflow-hidden">
                          {product.imageUrl ? (
                            <Image 
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const imgElement = e.target as HTMLImageElement;
                                imgElement.src = 'https://placehold.co/100x100?text=No+Image';
                              }}
                            />
                          ) : (
                            <Image 
                              src="https://placehold.co/100x100?text=No+Image"
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span>{product.shop.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">R{product.prices[0]?.amount.toFixed(2)}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No products found matching your search criteria.</p>
        </div>
      )}

      {/* Pagination Info and Controls */}
      {totalPages > 1 && (
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
              {filteredProducts.length !== products.length && (
                <span className="ml-2">(filtered from {products.length} total results)</span>
              )}
            </div>
            <div>
              Page {currentPage} of {totalPages}
            </div>
          </div>
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="min-w-[2.5rem]"
            >
              «
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="min-w-[2.5rem]"
            >
              ‹
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                const start = Math.max(1, currentPage - 2);
                const end = Math.min(totalPages, currentPage + 2);
                return page >= start && page <= end;
              })
              .map((page, index, array) => (
                <div key={page} className="flex items-center">
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2">...</span>
                  )}
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[2.5rem]"
                  >
                    {page}
                  </Button>
                </div>
              ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="min-w-[2.5rem]"
            >
              ›
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="min-w-[2.5rem]"
            >
              »
            </Button>
          </div>
        </div>
      )}

      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative h-60 bg-gray-100 rounded-md">
                {selectedProduct.imageUrl ? (
                  <Image
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    fill
                    className="object-contain p-4"
                    onError={(e) => {
                      console.log(`Details image error for ${selectedProduct.name}: ${selectedProduct.imageUrl}`);
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.src = '/images/product-placeholder.png';
                    }}
                  />
                ) : (
                  <Image
                    src="/images/product-placeholder.png"
                    alt={selectedProduct.name}
                    fill
                    className="object-contain p-4"
                  />
                )}
              </div>
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p>{selectedProduct.description || 'No description available.'}</p>
                </div>
                
                {selectedProduct.brand && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Brand</h3>
                    <p>{selectedProduct.brand}</p>
                  </div>
                )}
                
                {selectedProduct.category && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p>{selectedProduct.category}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Shop</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 relative">
                      <Image 
                        src="/images/shop-placeholder.png"
                        alt={selectedProduct.shop.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <span>{selectedProduct.shop.name}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="text-xl font-bold">R{selectedProduct.prices[0]?.amount.toFixed(2)}</p>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => {
                    addBestPrice(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 