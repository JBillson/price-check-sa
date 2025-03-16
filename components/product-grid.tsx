"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Loader2, PlusCircle, VariableIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useSearch } from "@/context/search-context"
import { useCart } from "@/context/cart-context"
import type { Product, Shop } from "@/lib/dummy-data"
import { getCleanProductName } from "@/lib/dummy-data"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ProductGrid() {
  const [sortOption, setSortOption] = useState("price-low")
  const { filteredProducts, isLoading, debouncedSearchQuery, priceRange, selectedShops, selectedCategories } =
    useSearch()
  const { addToCart } = useCart()
  const [sortedProducts, setSortedProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [variantsOpen, setVariantsOpen] = useState(false)
  const [sizeSelectionOpen, setSizeSelectionOpen] = useState(false)
  const [productToAdd, setProductToAdd] = useState<{ product: Product; shop: Shop } | null>(null)

  // Use useEffect to handle sorting on the client side only
  useEffect(() => {
    if (filteredProducts && filteredProducts.length > 0) {
      const sorted = [...filteredProducts].sort((a, b) => {
        switch (sortOption) {
          case "price-low":
            return Math.min(...a.shops.map((s) => s.price)) - Math.min(...b.shops.map((s) => s.price))
          case "price-high":
            return Math.max(...b.shops.map((s) => s.price)) - Math.max(...a.shops.map((s) => s.price))
          case "rating":
            return b.rating - a.rating
          default:
            return 0
        }
      })
      setSortedProducts(sorted)
    } else {
      setSortedProducts([])
    }
  }, [filteredProducts, sortOption])

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0

    // Price range filter is active if not at default values
    if (priceRange[0] > 0 || priceRange[1] < 500) {
      count++
    }

    // Shop filter is active if not all shops are selected
    if (selectedShops.length < 5 && selectedShops.length > 0) {
      count++
    }

    // Category filter is active if not all categories are selected
    if (selectedCategories.length < 5 && selectedCategories.length > 0) {
      count++
    }

    return count
  }

  // Format price as Rand
  const formatRand = (value: number) => {
    return `R${value.toLocaleString()}`
  }

  // Handle adding item to cart
  const handleAddToCart = (product: Product, shop: Shop) => {
    // If product has variants, show size selection dialog
    if (product.hasVariants) {
      setProductToAdd({ product, shop })
      setSizeSelectionOpen(true)
      return
    }

    // Otherwise add directly to cart
    addToCart(product, shop)
    toast(`${product.name} from ${shop.name} added to your cart`, {
      action: {
        label: "View cart",
        onClick: () => (window.location.href = "/cart"),
      },
    })
  }

  // Handle adding variant to cart
  const handleAddVariantToCart = (variant: Product, shop: Shop) => {
    addToCart(variant, shop)
    setSizeSelectionOpen(false)
    setProductToAdd(null)
    toast(`${variant.name} from ${shop.name} added to your cart`, {
      action: {
        label: "View cart",
        onClick: () => (window.location.href = "/cart"),
      },
    })
  }

  // Open variants modal
  const openVariantsModal = (product: Product) => {
    setSelectedProduct(product)
    setVariantsOpen(true)
  }

  // Get shop logo URL
  const getShopLogoUrl = (shopName: string) => {
    // Use actual shop logos
    const shopLogos: Record<string, string> = {
      Woolworths: "/shop-logos/woolworths.png",
      "Pick n Pay": "/shop-logos/pick-n-pay.png",
      Checkers: "/shop-logos/checkers.png",
      Spar: "/shop-logos/spar.png",
      Shoprite: "/shop-logos/shoprite.png",
    }

    return shopLogos[shopName] || `/shop-logos/${shopName.toLowerCase().replace(/\s+/g, "-")}.png`
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating results...
            </span>
          ) : (
            <>
              {sortedProducts.length} products found
              {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
              {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()} filters applied)`}
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm">Sort by:</span>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedProducts.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-card rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProducts.map((product) => {
            // Find the lowest price shop
            const lowestPriceShop = product.shops.reduce((prev, current) =>
              prev.price < current.price ? prev : current,
            )

            // Calculate price difference percentage from highest to lowest
            const highestPrice = Math.max(...product.shops.map((s) => s.price))
            const lowestPrice = Math.min(...product.shops.map((s) => s.price))
            const priceDifference = highestPrice - lowestPrice
            const savingsPercentage = Math.round((priceDifference / highestPrice) * 100)

            // Clean product name (remove size)
            const cleanName = getCleanProductName(product.name)

            return (
              <Card key={product.id} className="overflow-hidden bg-card border-border">
                <div className="relative h-48 bg-muted">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                  {product.hasVariants && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => openVariantsModal(product)}
                    >
                      <VariableIcon className="h-4 w-4 mr-1" />
                      Variations
                    </Button>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium line-clamp-2">{cleanName}</h3>
                  </div>

                  <div className="mb-3">
                    {savingsPercentage > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      >
                        Save up to {savingsPercentage}%
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    {product.shops.map((shop) => (
                      <div key={shop.name} className="flex justify-between items-center text-sm group">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-muted rounded-full overflow-hidden relative">
                            <Image
                              src={getShopLogoUrl(shop.name) || "/placeholder.svg"}
                              alt={shop.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span>{shop.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={shop.price === lowestPrice ? "font-bold text-price-decrease" : ""}>
                            {formatRand(shop.price)}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product, shop)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Add ${product.name} from ${shop.name} to cart`}
                          >
                            <PlusCircle className="h-5 w-5 text-primary hover:text-primary/80" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full mt-4" onClick={() => handleAddToCart(product, lowestPriceShop)}>
                    Add to Cart (Best Price)
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Variants Modal */}
      <Dialog open={variantsOpen} onOpenChange={setVariantsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Product Variations</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="mt-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 relative bg-muted rounded">
                  <Image
                    src={selectedProduct.image || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <h3 className="font-medium">{getCleanProductName(selectedProduct.name)}</h3>
              </div>

              <div className="space-y-4">
                {selectedProduct.variants?.map((variant) => (
                  <div key={variant.id} className="p-3 border rounded-md border-border">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{variant.baseSize}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatRand(Math.min(...variant.shops.map((s) => s.price)))} -{" "}
                          {formatRand(Math.max(...variant.shops.map((s) => s.price)))}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleAddVariantToCart(
                            variant,
                            variant.shops.reduce((prev, current) => (prev.price < current.price ? prev : current)),
                          )
                          setVariantsOpen(false)
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Size Selection Modal */}
      <Dialog open={sizeSelectionOpen} onOpenChange={setSizeSelectionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Size</DialogTitle>
          </DialogHeader>

          {productToAdd && (
            <div className="mt-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 relative bg-muted rounded">
                  <Image
                    src={productToAdd.product.image || "/placeholder.svg"}
                    alt={productToAdd.product.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{getCleanProductName(productToAdd.product.name)}</h3>
                  <p className="text-sm text-muted-foreground">From {productToAdd.shop.name}</p>
                </div>
              </div>

              <p className="mb-4">Please select a size:</p>

              <div className="space-y-4">
                {productToAdd.product.variants?.map((variant) => {
                  // Find the same shop in the variant
                  const variantShop = variant.shops.find((s) => s.name === productToAdd.shop.name) || variant.shops[0]

                  return (
                    <div key={variant.id} className="p-3 border rounded-md border-border">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{variant.baseSize}</p>
                          <p className="text-sm text-muted-foreground">{formatRand(variantShop.price)}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddVariantToCart(variant, variantShop)}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Select
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

