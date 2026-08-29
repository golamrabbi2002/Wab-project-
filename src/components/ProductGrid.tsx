import React, { useState, useMemo } from 'react';
import { Product, StoreConfig } from '../types';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, ArrowUpDown, Check, X, Sparkles } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  config: StoreConfig;
  wishlist: string[];
  onToggleWishlist?: (id: string) => void;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product, size: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  onCategorySelect?: (cat: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  onSortChange?: (sort: any) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  config,
  wishlist = [],
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  selectedCategory = 'All',
  onSelectCategory,
  onCategorySelect,
  searchQuery = '',
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All');
  // Dynamically calculate highest price and dynamic categories from all available products
  const highestPrice = useMemo(() => {
    if (!products || products.length === 0) return 1000;
    return Math.max(...products.map((p) => p.price || 0), 1000);
  }, [products]);

  const [maxPrice, setMaxPrice] = useState<number>(() => {
    return products.length > 0 ? Math.max(...products.map(p => p.price || 0), 1000) : 5000;
  });

  // Keep maxPrice expanded when higher-priced garments exist
  React.useEffect(() => {
    if (highestPrice > maxPrice) {
      setMaxPrice(highestPrice);
    }
  }, [highestPrice]);

  const handleCategorySelect = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else if (onCategorySelect) {
      onCategorySelect(cat);
    }
  };

  // Dynamically build category list from actual products
  const categories = useMemo(() => {
    const defaultCats = ['All', 'Panjabi', 'Saree', 'Three-Piece', 'Tops', 'Outerwear', 'Bottoms', 'Dresses', 'Accessories'];
    const productCats = products.map((p) => p.category).filter(Boolean);
    const combined = ['All', ...new Set([...defaultCats.slice(1), ...productCats])];
    return combined;
  }, [products]);

  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchSubtitle = p.subtitle?.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchMaterial = p.material?.toLowerCase().includes(q);
          if (!matchTitle && !matchSubtitle && !matchDesc && !matchCategory && !matchMaterial) {
            return false;
          }
        }
        // In-stock
        if (inStockOnly && p.stock <= 0) return false;
        // Size
        if (selectedSizeFilter !== 'All' && !p.sizes.includes(selectedSizeFilter)) return false;
        // Price
        if (p.price > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // Featured default
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, inStockOnly, selectedSizeFilter, maxPrice, sortBy]);

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-neutral-200 gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 text-neutral-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ready-to-Wear Atelier Capsule</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-light tracking-wide text-neutral-950">
            {selectedCategory === 'All' ? 'Complete Collection' : `${selectedCategory} Edition`}
          </h2>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-200/60 rounded-xl max-w-full overflow-x-auto no-scrollbar py-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap touch-manipulation cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neutral-950 text-white shadow-sm font-semibold'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Sort Controls Bar */}
      <div className="bg-neutral-100/70 border border-neutral-200 rounded-xl p-4 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Quick filters (Size, In-Stock, Price) */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          
          {/* Size Filter */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-semibold uppercase tracking-wider">Size:</span>
            <div className="flex items-center gap-1">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSizeFilter(sz)}
                  className={`px-2 py-1 text-[11px] rounded border transition-colors ${
                    selectedSizeFilter === sz
                      ? 'bg-neutral-950 text-white border-neutral-950 font-bold'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only Toggle */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 w-4 h-4 cursor-pointer"
            />
            <span className="text-neutral-700 font-medium">In Stock Only</span>
          </label>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-semibold uppercase tracking-wider">Max Price:</span>
            <input
              type="range"
              min="50"
              max={highestPrice || 600}
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-24 accent-neutral-950 cursor-pointer"
            />
            <span className="font-mono font-bold text-neutral-950">
              {config.currencySymbol}{maxPrice}
            </span>
          </div>
        </div>

        {/* Right: Results Count & Sort Dropdown */}
        <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-neutral-200">
          <span className="text-xs text-neutral-500">
            Showing <strong className="text-neutral-950 font-semibold">{filteredProducts.length}</strong> items
          </span>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-950 cursor-pointer font-medium"
            >
              <option value="featured">Featured Curations</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Search / Filters Badge Bar */}
      {(searchQuery || selectedSizeFilter !== 'All' || inStockOnly || selectedCategory !== 'All' || maxPrice < highestPrice) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
          <span className="text-neutral-400 text-[11px] font-semibold uppercase">Active Filters:</span>
          
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-200 text-neutral-800 rounded-full font-medium">
              Search: "{searchQuery}"
              <button onClick={() => {}} className="hover:text-neutral-950"><X className="w-3 h-3" /></button>
            </span>
          )}

          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-200 text-neutral-800 rounded-full font-medium">
              Category: {selectedCategory}
              <button onClick={() => handleCategorySelect('All')} className="hover:text-neutral-950"><X className="w-3 h-3" /></button>
            </span>
          )}

          {selectedSizeFilter !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-200 text-neutral-800 rounded-full font-medium">
              Size: {selectedSizeFilter}
              <button onClick={() => setSelectedSizeFilter('All')} className="hover:text-neutral-950"><X className="w-3 h-3" /></button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-200 text-neutral-800 rounded-full font-medium">
              In Stock Only
              <button onClick={() => setInStockOnly(false)} className="hover:text-neutral-950"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-neutral-300 p-8">
          <SlidersHorizontal className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-neutral-900 mb-1">No Matching Garments Found</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mb-6">
            Try adjusting your search criteria, clearing selected filters, or exploring all clothing categories.
          </p>
          <button
            onClick={() => {
              handleCategorySelect('All');
              setSelectedSizeFilter('All');
              setInStockOnly(false);
              setMaxPrice(highestPrice || 600);
            }}
            className="px-5 py-2.5 bg-neutral-950 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              config={config}
              isWishlisted={wishlist.includes(product.id)}
              onToggleWishlist={(id) => onToggleWishlist?.(id)}
              onQuickView={(p) => onQuickView?.(p)}
              onAddToCart={(p, s) => onAddToCart?.(p, s)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
