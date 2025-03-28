"use client"

import type React from "react"

import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, MinusCircle, PlusCircle, ArrowLeft, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { dummyProducts, getCleanProductName } from "@/lib/dummy-data"
import { toast } from "sonner"
import type { CartItem } from "@/context/cart-context"

export default function CartPage() {
  const { cartByShop, cartItems, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart, addToCart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [draggingItem, setDraggingItem] = useState<CartItem | null>(null)
  const [draggingShop, setDraggingShop] = useState<string | null>(null)
  const [dragOverShop, setDragOverShop] = useState<string | null>(null)
  const [priceDifference, setPriceDifference] = useState<number | null>(null)
  const [shopPriceDifferences, setShopPriceDifferences] = useState<{ [shopName: string]: number | null }>({})
  const [autoScrollDirection, setAutoScrollDirection] = useState<"up" | "down" | null>(null)
  const autoScrollRef = useRef<number | null>(null)

  // Handle hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Increase scrolling speed significantly
  const scrollSpeed = 100 // Increased from 10 to 100 for much faster scrolling

  // Add wheel event handling for mouse scrolling during drag
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (draggingItem) {
        e.preventDefault()
        window.scrollBy(0, e.deltaY)
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      window.removeEventListener("wheel", handleWheel)
    }
  }, [draggingItem])

  // Auto-scroll when dragging near edges
  useEffect(() => {
    if (autoScrollDirection && draggingItem) {
      const scrollSpeed = 100

      const performScroll = () => {
        if (autoScrollDirection === "up") {
          window.scrollBy(0, -scrollSpeed)
        } else if (autoScrollDirection === "down") {
          window.scrollBy(0, scrollSpeed)
        }

        autoScrollRef.current = requestAnimationFrame(performScroll)
      }

      autoScrollRef.current = requestAnimationFrame(performScroll)

      return () => {
        if (autoScrollRef.current) {
          cancelAnimationFrame(autoScrollRef.current)
        }
      }
    }
  }, [autoScrollDirection, draggingItem])

  // If not mounted yet, show a loading state
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shopping
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-8">My Cart</h1>
        <div className="text-center py-12 bg-card rounded-lg shadow-sm border">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your cart...</p>
        </div>
      </div>
    )
  }

  // Format price as Rand
  const formatRand = (value: number) => {
    return `R${value.toFixed(2)}`
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

  // Function to check if an item is available at a shop
  const isItemAvailableAtShop = (productId: string, shopName: string): boolean => {
    const product = dummyProducts.find((p) => p.id === productId)
    const shopData = product?.shops.find((s) => s.name === shopName)
    return !!shopData && shopData.inStock
  }

  // Function to move an item from one shop to another
  const moveItemToShop = (productId: string, sourceShop: string, targetShop: string) => {
    // Find the item in the source shop
    const sourceItem = cartByShop[sourceShop]?.find((item) => item.productId === productId)

    if (!sourceItem) return

    // Find the product in dummy data to get the price in dummy data to get the price in the target shop
    const product = dummyProducts.find((p) => p.id === productId)
    const targetShopData = product?.shops.find((s) => s.name === targetShop)

    if (!targetShopData) return

    // Check if the item is in stock at the target shop
    if (!targetShopData.inStock) {
      toast.error(`${sourceItem.productName} is not available at ${targetShop}`)
      return
    }

    // Remove from source shop
    removeFromCart(productId, sourceShop)

    // Add to cart with the new shop and price
    for (let i = 0; i < sourceItem.quantity; i++) {
      addToCart(
        {
          id: productId,
          name: sourceItem.productName,
          image: sourceItem.image,
          category: "",
          rating: 0,
          shops: [targetShopData],
        },
        targetShopData,
      )
    }

    toast.success(`${sourceItem.productName} moved from ${sourceShop} to ${targetShop}`)
  }

  // Function to calculate price differences for all shops
  const calculatePriceDifferences = (item: CartItem, sourceShop: string) => {
    const differences: { [shopName: string]: number | null } = {}

    Object.keys(cartByShop).forEach((shopName) => {
      if (shopName === sourceShop) {
        differences[shopName] = null
        return
      }

      // Find the product price in the target shop
      const productId = item.productId
      const product = dummyProducts.find((p) => p.id === productId)
      const targetShopData = product?.shops.find((s) => s.name === shopName)

      if (targetShopData) {
        // Check if the item is in stock
        if (!targetShopData.inStock) {
          differences[shopName] = null // Not available
        } else {
          const currentPrice = item.price
          const newPrice = targetShopData.price

          // Calculate price difference per item
          const diff = (newPrice - currentPrice) * item.quantity
          differences[shopName] = diff
        }
      } else {
        differences[shopName] = null // Not available
      }
    })

    return differences
  }

  // Handle drag start
  const handleDragStart = (item: CartItem, shop: string) => {
    setDraggingItem(item)
    setDraggingShop(shop)

    // Calculate price differences for all shops
    const differences = calculatePriceDifferences(item, shop)
    setShopPriceDifferences(differences)
  }

  // Fix the drag-and-drop functionality and highlighting
  const handleDragOver = (e: React.DragEvent, shopName: string) => {
    e.preventDefault()

    if (draggingItem && draggingShop !== shopName) {
      setDragOverShop(shopName)
      setPriceDifference(shopPriceDifferences[shopName])
    }

    // Check if we're near the top or bottom of the viewport for auto-scrolling
    const { clientY } = e
    const viewportHeight = window.innerHeight
    const scrollThreshold = 150 // Increased threshold for earlier activation

    if (clientY < scrollThreshold) {
      setAutoScrollDirection("up")
    } else if (clientY > viewportHeight - scrollThreshold) {
      setAutoScrollDirection("down")
    } else {
      setAutoScrollDirection(null)
    }
  }

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverShop(null)
    setPriceDifference(null)
    setAutoScrollDirection(null)
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetShop: string) => {
    e.preventDefault()

    if (draggingItem && draggingShop && draggingShop !== targetShop) {
      // Check if the item is available at the target shop
      if (isItemAvailableAtShop(draggingItem.productId, targetShop)) {
        moveItemToShop(draggingItem.productId, draggingShop, targetShop)
      } else {
        // Show error notification
        toast.error(`${draggingItem.productName} is not available at ${targetShop}`)
      }
    }

    // Reset drag state
    setDraggingItem(null)
    setDraggingShop(null)
    setDragOverShop(null)
    setPriceDifference(null)
    setAutoScrollDirection(null)
  }

  // Handle drag end
  const handleDragEnd = () => {
    // Reset drag state
    setDraggingItem(null)
    setDraggingShop(null)
    setDragOverShop(null)
    setPriceDifference(null)
    setAutoScrollDirection(null)
  }

  // Get border color for shop section based on drag state
  const getBorderColor = (shopName: string) => {
    if (dragOverShop === shopName) {
      // Show different colors based on price difference
      const diff = shopPriceDifferences[shopName]

      if (diff === null) {
        return "border-yellow-400" // Not available
      } else if (diff > 0) {
        return "border-red-400" // More expensive
      } else if (diff < 0) {
        return "border-green-400" // Cheaper
      } else {
        return "border-blue-400" // Same price
      }
    } else if (draggingShop === shopName) {
      return "border-blue-200" // Source shop
    }
    return "" // Default
  }

  // Get price difference class for text color
  const getPriceDifferenceClass = (diff: number | null) => {
    if (diff === null) return "text-yellow-500"
    if (diff > 0) return "text-red-500"
    if (diff < 0) return "text-green-500"
    return "text-blue-500"
  }

  // Get price difference text
  const getPriceDifferenceText = (diff: number | null, shopName: string) => {
    if (diff === null) {
      return `Not available at ${shopName}`
    } else if (diff > 0) {
      return `${formatRand(diff)} more expensive`
    } else if (diff < 0) {
      return `${formatRand(Math.abs(diff))} cheaper`
    } else {
      return "Same price"
    }
  }

  // Calculate totals for each shop
  const shopTotals = Object.entries(cartByShop).map(([shopName, items]) => {
    const shopTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return { shopName, total: shopTotal, items: items.length }
  })

  // Get current shop total
  const getShopTotal = (shopName: string) => {
    const items = cartByShop[shopName] || []
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center text-primary hover:text-primary/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shopping
        </Link>

        {totalItems > 0 && (
          <Button variant="outline" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-2">My Cart</h1>
      <p className="text-muted-foreground mb-8">
        {totalItems} {totalItems === 1 ? "item" : "items"} • {formatRand(totalPrice)} total
      </p>

      {totalItems === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <ShoppingCart className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Start adding products to your cart to see them here. You can compare prices across different shops.
            </p>
            <Link href="/" passHref>
              <Button>
                Start Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(cartByShop).map(([shopName, items]) => (
              <Card
                key={shopName}
                className={`transition-colors ${getBorderColor(shopName)}`}
                onDragOver={(e) => handleDragOver(e, shopName)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, shopName)}
              >
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="w-10 h-10 relative">
                    <Image
                      src={getShopLogoUrl(shopName)}
                      alt={shopName}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{shopName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatRand(getShopTotal(shopName))}</p>
                  </div>
                </CardHeader>

                <CardContent>
                  {dragOverShop === shopName && priceDifference !== undefined && (
                    <div
                      className={`mb-4 p-3 rounded-md bg-opacity-10 ${
                        priceDifference === null
                          ? "bg-yellow-100"
                          : priceDifference > 0
                          ? "bg-red-100"
                          : priceDifference < 0
                          ? "bg-green-100"
                          : "bg-blue-100"
                      }`}
                    >
                      <p className={`text-sm font-medium ${getPriceDifferenceClass(priceDifference)}`}>
                        {getPriceDifferenceText(priceDifference, shopName)}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${shopName}`}
                        className={`flex items-center rounded-md p-3 ${
                          draggingItem?.productId === item.productId && draggingShop === shopName
                            ? "opacity-50 bg-gray-100"
                            : "hover:bg-gray-50"
                        }`}
                        draggable
                        onDragStart={() => handleDragStart(item, shopName)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="relative w-16 h-16 mr-4 flex-shrink-0 bg-gray-100 rounded">
                          <Image
                            src={item.image || "/images/product-placeholder.png"}
                            alt={item.productName}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{item.productName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatRand(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.productId, shopName, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.productId, shopName, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.productId, shopName)}
                            className="h-8 w-8 ml-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="w-20 text-right font-medium ml-4">
                          {formatRand(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatRand(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium text-lg pt-2">
                <span>Total</span>
                <span>{formatRand(totalPrice)}</span>
              </div>
            </div>

            <Button className="w-full mt-6" size="lg">
              Proceed to Checkout
            </Button>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>
                By proceeding to checkout, you agree to our{" "}
                <Link href="#" className="underline hover:text-primary">
                  Terms and Conditions
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ShoppingCart({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}

