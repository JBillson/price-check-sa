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
import type { CartItem } from "@/types"

export default function CartPage() {
  const { cartByShop, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart, addToCart } = useCart()
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
    return `R${value.toLocaleString()}`
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

    // Reset state
    setDraggingItem(null)
    setDraggingShop(null)
    setDragOverShop(null)
    setPriceDifference(null)
    setShopPriceDifferences({})
    setAutoScrollDirection(null)
  }

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingItem(null)
    setDraggingShop(null)
    setDragOverShop(null)
    setPriceDifference(null)
    setShopPriceDifferences({})
    setAutoScrollDirection(null)
  }

  // Ensure the border color function works correctly
  const getBorderColor = (shopName: string) => {
    if (!draggingItem || draggingShop === shopName) return ""

    const diff = shopPriceDifferences[shopName]

    // Check if the product is available at this shop
    if (diff === null) {
      const productId = draggingItem.productId
      const product = dummyProducts.find((p) => p.id === productId)
      const targetShopData = product?.shops.find((s) => s.name === shopName)

      // If shop data exists but item is not in stock, or shop data doesn't exist
      if (!targetShopData || !targetShopData.inStock) {
        return "border-price-unavailable ring-4 ring-price-unavailable" // Unavailable - thicker ring
      }

      return "" // No price difference (same price)
    }

    return diff > 0
      ? "border-price-increase ring-4 ring-price-increase"
      : diff < 0
        ? "border-price-decrease ring-4 ring-price-decrease"
        : "border-yellow-500 ring-4 ring-yellow-500"
  }

  // Get price difference class
  const getPriceDifferenceClass = (diff: number | null) => {
    if (diff === null) return "price-unavailable"
    return diff > 0 ? "price-increase" : "price-decrease"
  }

  // Get price difference text
  const getPriceDifferenceText = (diff: number | null, shopName: string) => {
    if (diff === null) {
      if (!isItemAvailableAtShop(draggingItem!.productId, shopName)) {
        return "Not available"
      }
      return ""
    }
    return `${diff > 0 ? "+" : ""}${formatRand(diff)}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/" className="flex items-center text-primary hover:text-primary/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shopping
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">My Cart</h1>

      {totalItems === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-6">Add some items to your cart to see them here</p>
          <Link href="/">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(cartByShop).map(([shopName, items]) => {
              const shopTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
              const isOver = dragOverShop === shopName
              const borderColor = getBorderColor(shopName)
              const isUnavailable = draggingItem && !isItemAvailableAtShop(draggingItem.productId, shopName)

              return (
                <div
                  id={`shop-card-${shopName}`}
                  key={shopName}
                  onDragOver={(e) => handleDragOver(e, shopName)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, shopName)}
                  className={`rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 relative
                    ${isOver ? "ring-4 ring-primary bg-primary/5" : ""} 
                    ${draggingItem && draggingShop !== shopName ? borderColor : ""}`}
                >
                  {/* Show overlay for unavailable items throughout the drag operation */}
                  {draggingItem && isUnavailable && (
                    <div className="absolute inset-0 bg-gray-500/50 z-10 flex items-center justify-center rounded-lg">
                      <p className="text-white font-bold text-lg">Not Available</p>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-center pb-3">
                      <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center">
                        <div className="w-8 h-8 bg-muted rounded-full overflow-hidden relative mr-2">
                          <Image
                            src={getShopLogoUrl(shopName) || "/placeholder.svg"}
                            alt={shopName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {shopName}
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        {items.length} {items.length === 1 ? "item" : "items"} · {formatRand(shopTotal)}
                        {isOver && draggingItem && (
                          <span className={`ml-2 font-medium ${getPriceDifferenceClass(priceDifference)}`}>
                            {getPriceDifferenceText(priceDifference, shopName)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div
                          key={`${item.productId}::${item.shop}`}
                          className="flex items-center p-3 border border-transparent hover:border-border rounded-md group relative cursor-grab active:cursor-grabbing"
                          draggable
                          onDragStart={() => handleDragStart(item, shopName)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-muted-foreground"
                            >
                              <circle cx="9" cy="5" r="1" />
                              <circle cx="9" cy="12" r="1" />
                              <circle cx="9" cy="19" r="1" />
                              <circle cx="15" cy="5" r="1" />
                              <circle cx="15" cy="12" r="1" />
                              <circle cx="15" cy="19" r="1" />
                            </svg>
                          </div>
                          <div className="h-16 w-16 relative bg-muted rounded ml-4 mr-4">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.productName}
                              fill
                              className="object-contain p-2"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium line-clamp-1">{getCleanProductName(item.productName)}</h3>
                            <div className="text-sm text-muted-foreground">{formatRand(item.price)} each</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.productId, item.shop, item.quantity - 1)}
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.productId, item.shop, item.quantity + 1)}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeFromCart(item.productId, item.shop)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(cartByShop).map(([shopName, items]) => {
                      const shopTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
                      const isShopOver = dragOverShop === shopName

                      return (
                        <div key={shopName} className="flex justify-between">
                          <span>
                            {shopName} ({items.length} {items.length === 1 ? "item" : "items"})
                          </span>
                          <div>
                            <span>{formatRand(shopTotal)}</span>
                            {isShopOver && draggingItem && (
                              <span className={`ml-2 font-medium ${getPriceDifferenceClass(priceDifference)}`}>
                                {getPriceDifferenceText(priceDifference, shopName)}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    <Separator />

                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <div>
                        <span>{formatRand(totalPrice)}</span>
                        {dragOverShop && draggingItem && (
                          <span className={`ml-2 font-medium ${getPriceDifferenceClass(priceDifference)}`}>
                            {getPriceDifferenceText(priceDifference, dragOverShop)}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button className="w-full">Checkout</Button>
                    <Button variant="outline" className="w-full" onClick={clearCart}>
                      Clear Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

