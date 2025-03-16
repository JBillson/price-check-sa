import { Search } from "@/components/search"
import { ProductGrid } from "@/components/product-grid"
import { Filters } from "@/components/filters"
import { SearchProvider } from "@/context/search-context"

export default function Home() {
  return (
    <SearchProvider>
      <div className="container mx-auto px-4 py-8">
        <Search />
        <div className="flex flex-col md:flex-row gap-6 mt-8">
          <div className="w-full md:w-64 shrink-0">
            <Filters />
          </div>
          <div className="flex-1">
            <ProductGrid />
          </div>
        </div>
      </div>
    </SearchProvider>
  )
}

