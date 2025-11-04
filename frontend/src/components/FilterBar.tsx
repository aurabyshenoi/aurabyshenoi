import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { PaintingFilters } from '../types/painting';

interface FilterBarProps {
  filters: PaintingFilters;
  onFiltersChange: (filters: PaintingFilters) => void;
  categories: string[];
  priceRange: { min: number; max: number };
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  categories,
  priceRange
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<PaintingFilters>(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...localFilters, search: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCategoryChange = (category: string) => {
    const newFilters = { 
      ...localFilters, 
      category: category === 'all' ? undefined : category 
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    const newFilters = { 
      ...localFilters, 
      [type === 'min' ? 'minPrice' : 'maxPrice']: numValue 
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: PaintingFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setIsFilterOpen(false);
  };

  const hasActiveFilters = localFilters.category || 
                          localFilters.minPrice !== undefined || 
                          localFilters.maxPrice !== undefined ||
                          localFilters.search;

  return (
    <div className="bg-cream border-b border-warm-gray">
      <div className="container mx-auto px-4 py-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
            <input
              type="text"
              placeholder="Search paintings..."
              value={localFilters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-warm-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent bg-off-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors duration-200 ${
                hasActiveFilters
                  ? 'bg-sage-green text-cream border-sage-green'
                  : 'bg-off-white text-text-dark border-warm-gray hover:bg-warm-gray'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-cream text-sage-green text-xs px-2 py-1 rounded-full">
                  {[
                    localFilters.category,
                    localFilters.minPrice !== undefined && 'Min',
                    localFilters.maxPrice !== undefined && 'Max',
                    localFilters.search && 'Search'
                  ].filter(Boolean).length}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="p-2 text-text-light hover:text-text-dark transition-colors duration-200"
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 p-4 bg-off-white rounded-lg border border-warm-gray">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Category
                </label>
                <select
                  value={localFilters.category || 'all'}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-warm-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent bg-cream"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder={`$${priceRange.min}`}
                  value={localFilters.minPrice || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  min={priceRange.min}
                  max={priceRange.max}
                  className="w-full px-3 py-2 border border-warm-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent bg-cream"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder={`$${priceRange.max}`}
                  value={localFilters.maxPrice || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  min={priceRange.min}
                  max={priceRange.max}
                  className="w-full px-3 py-2 border border-warm-gray rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent bg-cream"
                />
              </div>
            </div>

            {/* Quick Price Filters */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-text-dark mb-2">
                Quick Price Ranges
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Under $500', max: 500 },
                  { label: '$500 - $1,000', min: 500, max: 1000 },
                  { label: '$1,000 - $2,500', min: 1000, max: 2500 },
                  { label: 'Over $2,500', min: 2500 },
                ].map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      const newFilters = {
                        ...localFilters,
                        minPrice: range.min,
                        maxPrice: range.max
                      };
                      setLocalFilters(newFilters);
                      onFiltersChange(newFilters);
                    }}
                    className="px-3 py-1 text-sm border border-warm-gray rounded-full hover:bg-sage-green hover:text-cream hover:border-sage-green transition-colors duration-200"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;