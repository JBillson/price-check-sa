"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function CartIcon() {
  const { totalItems, totalPrice } = useCart()

  return (
    <div className="relative">
      <Link href="/cart">
        <Button variant="ghost" className="relative p-2">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[1.5rem] h-5 flex items-center justify-center">
              {totalItems}
            </Badge>
          )}
          {totalItems > 0 && (
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 text-xs font-medium">
              R{totalPrice.toLocaleString()}
            </span>
          )}
        </Button>
      </Link>
    </div>
  )
}

