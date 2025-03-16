"use client"

import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useSearch } from "@/context/search-context"

// Available shops and categories
const AVAILABLE_SHOPS = ["Woolworths", "Pick n Pay", "Checkers", "Spar", "Shoprite"]
const AVAILABLE_CATEGORIES = ["Fresh Produce", "Dairy & Eggs", "Meat & Poultry", "Bakery", "Pantry"]

export function Filters() {
  const { priceRange, setPriceRange, selectedShops, setSelectedShops, selectedCategories, setSelectedCategories } =
    useSearch()

  // Handle price range change
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]] as [number, number])
  }

  // Handle shop toggle
  const handleShopToggle = (shop: string) => {
    if (selectedShops.includes(shop)) {
      setSelectedShops(selectedShops.filter((s) => s !== shop))
    } else {
      setSelectedShops([...selectedShops, shop])
    }
  }

  // Handle category toggle
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  // Format price as Rand
  const formatRand = (value: number) => {
    return `R${value.toLocaleString()}`
  }

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border">
      <h2 className="font-semibold text-lg mb-4">Filters</h2>

      <div className="mb-6">
        <h3 className="font-medium mb-2">Price Range</h3>
        <Slider
          min={0}
          max={500}
          step={10}
          value={[priceRange[0], priceRange[1]]}
          onValueChange={handlePriceRangeChange}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatRand(priceRange[0])}</span>
          <span>{formatRand(priceRange[1])}</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-2">Shops</h3>
        <div className="space-y-2">
          {AVAILABLE_SHOPS.map((shop) => (
            <div key={shop} className="flex items-center space-x-2">
              <Checkbox
                id={`shop-${shop}`}
                checked={selectedShops.includes(shop)}
                onCheckedChange={() => handleShopToggle(shop)}
              />
              <Label htmlFor={`shop-${shop}`} className="text-sm">
                {shop}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-2">Categories</h3>
        <div className="space-y-2">
          {AVAILABLE_CATEGORIES.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              />
              <Label htmlFor={`category-${category}`} className="text-sm">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

