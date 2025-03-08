import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getItems } from '../lib/itemApi';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Items() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    size: '',
    condition: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({});
  
  // Available filter options
  const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories', 'Shoes', 'Other'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const conditions = ['New with tags', 'Like new', 'Good', 'Fair', 'Poor'];
  
  // Fetch items with React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['items', page, appliedFilters],
    queryFn: async () => {
      const result = await getItems(page, 12, appliedFilters);
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to load items');
      }
      return result;
    }
  });

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    // Filter out empty values
    const newFilters = Object.entries(filters)
      .filter(([_, value]) => value !== '')
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    
    setAppliedFilters(newFilters);
    setPage(1); // Reset to first page
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      condition: ''
    });
    setAppliedFilters({});
    setPage(1);
  };

  // Handle pagination
  const goToNextPage = () => {
    if (data && page < data.totalPages) {
      setPage(prevPage => prevPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="page items-page">
      <div className="container">
        <div className="page-header">
          <h1>Browse Items</h1>
          <div className="search-bar">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search items..."
              className="search-input"
            />
            <button 
              onClick={applyFilters}
              className="btn btn-primary search-btn"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="browse-layout">
          {/* Filter sidebar */}
          <div className="filters-sidebar">
            <div className="filters-header">
              <h2>
                <Filter size={18} />
                Filters
              </h2>
              {Object.keys(appliedFilters).length > 0 && (
                <button 
                  onClick={clearFilters}
                  className="btn btn-text clear-filters"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="filter-group">
              <label htmlFor="category">Category</label>
              <select 
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  min="0"
                />
                <span className="price-divider">to</span>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  min="0"
                />
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="size">Size</label>
              <select 
                id="size"
                name="size"
                value={filters.size}
                onChange={handleFilterChange}
              >
                <option value="">All Sizes</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="condition">Condition</label>
              <select 
                id="condition"
                name="condition"
                value={filters.condition}
                onChange={handleFilterChange}
              >
                <option value="">Any Condition</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={applyFilters}
              className="btn btn-primary apply-filters-btn"
            >
              Apply Filters
            </button>
          </div>

          {/* Items grid */}
          <div className="items-section">
            {isLoading ? (
              <div className="loading">Loading items...</div>
            ) : error ? (
              <div className="error-message">Error loading items: {error.message}</div>
            ) : data?.data?.length > 0 ? (
              <>
                <div className="items-count">
                  Showing {data.data.length} of {data.count} items
                </div>
                <div className="items-grid">
                  {data.data.map(item => (
                    <Link to={`/items/${item.id}`} key={item.id} className="item-card">
                      <div className="item-image">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0].image_url} alt={item.title} />
                        ) : (
                          <div className="item-image-placeholder">No image</div>
                        )}
                      </div>
                      <div className="item-info">
                        <h3 className="item-title">{item.title}</h3>
                        <p className="item-price">${item.price}</p>
                        <div className="item-meta">
                          {item.size && <span className="item-size">{item.size}</span>}
                          {item.brand && <span className="item-brand">{item.brand}</span>}
                        </div>
                        <div className="item-seller">
                          <span className="seller-name">
                            {item.user?.name}
                          </span>
                          {item.user?.rating_average > 0 && (
                            <span className="seller-rating">
                              {'★'.repeat(Math.round(item.user.rating_average))}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      onClick={goToPrevPage}
                      disabled={page === 1}
                      className="pagination-btn prev"
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>
                    <div className="page-indicator">
                      Page {page} of {data.totalPages}
                    </div>
                    <button 
                      onClick={goToNextPage}
                      disabled={page === data.totalPages}
                      className="pagination-btn next"
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-items">
                <h3>No items found</h3>
                <p>Try changing your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}