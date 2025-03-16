"use client"

import type React from "react"

import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearch } from "@/context/search-context"

export function Search() {
  const { searchQuery, setSearchQuery } = useSearch()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission is not needed as we're using debounced search
    // but we'll keep it for accessibility
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative flex w-full max-w-3xl mx-auto items-center">
        <Input
          type="text"
          placeholder="Search for products..."
          className="pr-12 h-12 rounded-lg border-2 border-gray-200 focus-visible:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit" size="icon" className="absolute right-1 h-10 w-10">
          <SearchIcon className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </form>
  )
}

