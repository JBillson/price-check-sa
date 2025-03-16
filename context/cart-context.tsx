"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, Shop } from "@/lib/dummy-data"

// Define cart item type
export interface CartItem {
  productId: string
  productName: string
  image: string
  shop: string
  price: number
  quantity: number
}

// Define cart by shop
export interface CartByShop {
  [shopName: string]: CartItem[]
}

// Define context type
type CartContextType = {
  cartItems: CartItem[]
  cartByShop: CartByShop
  totalItems: number
  totalPrice: number
  addToCart: (product: Product, shop: Shop) => void
  removeFromCart: (productId: string, shop: string) => void
  updateQuantity: (productId: string, shop: string, quantity: number) => void
  clearCart: () => void
}

// Create context with default values
const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartByShop: {},
  totalItems: 0,
  totalPrice: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartByShop, setCartByShop] = useState<CartByShop>({})
  const [totalItems, setTotalItems] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  // Load cart from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("groceryCart")
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          setCartItems(parsedCart)
        } catch (error) {
          console.error("Failed to parse cart from localStorage", error)
        }
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && cartItems.length > 0) {
      localStorage.setItem("groceryCart", JSON.stringify(cartItems))
    } else if (typeof window !== "undefined" && cartItems.length === 0) {
      localStorage.removeItem("groceryCart")
    }
  }, [cartItems])

  // Update derived state whenever cartItems changes
  useEffect(() => {
    // Calculate total items and price
    const items = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const price = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotalItems(items)
    setTotalPrice(price)

    // Group items by shop
    const byShop: CartByShop = {}
    cartItems.forEach((item) => {
      if (!byShop[item.shop]) {
        byShop[item.shop] = []
      }
      byShop[item.shop].push(item)
    })
    setCartByShop(byShop)
  }, [cartItems])

  // Add item to cart
  const addToCart = (product: Product, shop: Shop) => {
    setCartItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((item) => item.productId === product.id && item.shop === shop.name)

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += 1
        return updatedItems
      } else {
        // Add new item if it doesn't exist
        return [
          ...prevItems,
          {
            productId: product.id,
            productName: product.name,
            image: product.image,
            shop: shop.name,
            price: shop.price,
            quantity: 1,
          },
        ]
      }
    })
  }

  // Remove item from cart
  const removeFromCart = (productId: string, shop: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => !(item.productId === productId && item.shop === shop)))
  }

  // Update item quantity
  const updateQuantity = (productId: string, shop: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, shop)
      return
    }

    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.productId === productId && item.shop === shop) {
          return { ...item, quantity }
        }
        return item
      })
    })
  }

  // Clear cart
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("groceryCart")
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartByShop,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}

