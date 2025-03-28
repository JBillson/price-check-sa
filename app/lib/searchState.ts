export interface SearchState {
  searchTerm: string;
  currentPage: number;
  filters: {
    sortBy: string;
    viewType: string;
    itemsPerPage: number;
  };
}

export const saveSearchState = (state: SearchState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('woolworthsSearchState', JSON.stringify(state));
  }
};

export const loadSearchState = (): SearchState | null => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem('woolworthsSearchState');
    if (savedState) {
      return JSON.parse(savedState);
    }
  }
  return null;
};

export const updateSearchState = (updates: Partial<SearchState>) => {
  const currentState = loadSearchState() || {
    searchTerm: '',
    currentPage: 0,
    filters: {
      sortBy: 'popularity',
      viewType: 'grid',
      itemsPerPage: 15
    }
  };

  const newState = {
    ...currentState,
    ...updates
  };

  saveSearchState(newState);
  return newState;
}; 