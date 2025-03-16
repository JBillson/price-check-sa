"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { dummyProducts, type Product } from "@/lib/dummy-data"

// Define filter state types
export interface FilterState {
  priceRange: [number, number]
  selectedShops: string[]
  selectedCategories: string[]
}

// Define context type
type SearchContextType = {
  // Search state
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedSearchQuery: string

  // Filter state
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  selectedShops: string[]
  setSelectedShops: (shops: string[]) => void
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void

  // Results
  filteredProducts: Product[]

  // UI state
  isLoading: boolean
}

// Create context with default values
const SearchContext = createContext<SearchContextType>({
  searchQuery: "",
  setSearchQuery: () => {},
  debouncedSearchQuery: "",

  priceRange: [0, 500],
  setPriceRange: () => {},
  selectedShops: [],
  setSelectedShops: () => {},
  selectedCategories: [],
  setSelectedCategories: () => {},

  filteredProducts: [],

  isLoading: false,
})

export function SearchProvider({ children }: { children: ReactNode }) {
  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [selectedShops, setSelectedShops] = useState<string[]>([
    "Woolworths",
    "Pick n Pay",
    "Checkers",
    "Spar",
    "Shoprite",
  ])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Fresh Produce",
    "Dairy & Eggs",
    "Meat & Poultry",
    "Bakery",
    "Pantry",
  ])

  // Results
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(dummyProducts)

  // UI state
  const [isLoading, setIsLoading] = useState(false)

  // Filter products when search or filters change
  useEffect(() => {
    setIsLoading(true)

    const timer = setTimeout(() => {
      let results = [...dummyProducts]

      // Apply search filter
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase()
        results = results.filter((product) => {
          return (
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.shops.some((shop) => shop.name.toLowerCase().includes(query))
          )
        })
      }

      // Apply price filter
      results = results.filter((product) => {
        const lowestPrice = Math.min(...product.shops.map((shop) => shop.price))
        return lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1]
      })

      // Apply shop filter
      if (selectedShops.length > 0) {
        results = results.filter((product) => product.shops.some((shop) => selectedShops.includes(shop.name)))
      }

      // Apply category filter
      if (selectedCategories.length > 0) {
        results = results.filter((product) => selectedCategories.includes(product.category))
      }

      setFilteredProducts(results)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [debouncedSearchQuery, priceRange, selectedShops, selectedCategories])

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        debouncedSearchQuery,

        priceRange,
        setPriceRange,
        selectedShops,
        setSelectedShops,
        selectedCategories,
        setSelectedCategories,

        filteredProducts,

        isLoading,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  return useContext(SearchContext)
}

