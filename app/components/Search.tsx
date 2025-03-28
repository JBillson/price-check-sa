import { useState, useEffect } from 'react';
import { SearchState, loadSearchState, updateSearchState } from '../lib/searchState';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({
    sortBy: 'popularity',
    viewType: 'grid',
    itemsPerPage: 15
  });

  // Load saved state on component mount
  useEffect(() => {
    const savedState = loadSearchState();
    if (savedState) {
      setSearchTerm(savedState.searchTerm);
      setCurrentPage(savedState.currentPage);
      setFilters(savedState.filters);
    }
  }, []);

  // Save state when search term changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    updateSearchState({ searchTerm: newSearchTerm, currentPage: 0 });
  };

  // Save state when filters change
  const handleFilterChange = (newFilters: Partial<SearchState['filters']>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    updateSearchState({ filters: updatedFilters, currentPage: 0 });
  };

  // Save state when page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateSearchState({ currentPage: newPage });
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search products..."
        className="search-input"
      />
      <div className="filters">
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
        >
          <option value="popularity">Popularity</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        <select
          value={filters.viewType}
          onChange={(e) => handleFilterChange({ viewType: e.target.value })}
        >
          <option value="grid">Grid View</option>
          <option value="list">List View</option>
        </select>
      </div>
    </div>
  );
} 