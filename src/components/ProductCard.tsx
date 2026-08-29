import React, { useState } from 'react';
import { Product, StoreConfig } from '../types';
import { Eye, Heart, ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  config: StoreConfig;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  config,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    onAddToCart(product, selectedSize);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };

  const handleSizeClick = (e: React.MouseEvent, s: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(s);
  };

  return (
    <div
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-200/90 hover:border-neutral-400 hover:shadow-xl transition-all duration-300 relative select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Showcase Container */}
      <div 
        className="relative aspect-[3/4] bg-neutral-100 overflow-hidden cursor-pointer touch-manipulation"
        onClick={() => onQuickView(product)}
      >
        {(isHovered && product.additionalImages?.[0]) || product.image ? (
          <img
            src={(isHovered && product.additionalImages?.[0]) ? product.additionalImages[0] : product.image}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : null}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {product.stock <= 0 ? (
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-rose-900/95 backdrop-blur-md text-white text-[9px] sm:text-[10px] uppercase font-bold tracking-wider rounded-md shadow-sm">
              Out of Stock
            </span>
          ) : (
            <>
              {discountPercent && (
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-neutral-950 text-white text-[9px] sm:text-[10px] uppercase font-bold tracking-wider rounded-md shadow-sm">
                  -{discountPercent}%
                </span>
              )}
              {product.badges?.map((badge) => (
                <span
                  key={badge}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider rounded-md shadow-sm ${
                    badge === 'New'
                      ? 'bg-amber-400 text-neutral-950'
                      : badge === 'Bestseller'
                      ? 'bg-neutral-900 text-neutral-100'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {badge}
                </span>
              ))}
            </>
          )}
        </div>

        {/* Wishlist Button - Large 40px Touch Target for Mobile */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 hover:bg-white text-neutral-800 rounded-full shadow-md backdrop-blur-sm transition-transform active:scale-90 z-20 flex items-center justify-center touch-manipulation cursor-pointer border border-neutral-100"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Toggle Wishlist"
        >
          <Heart
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-neutral-700'
            }`}
          />
        </button>

        {/* Quick View Button - Desktop hover & Mobile accessible corner button */}
        <div className="hidden sm:flex absolute inset-x-4 bottom-4 z-10 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="flex-1 py-2.5 bg-white/95 hover:bg-white text-neutral-950 text-xs font-semibold uppercase tracking-wider rounded-xl backdrop-blur-md shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Mobile Quick View Action Tag */}
        <button
          type="button"
          onClick={handleQuickViewClick}
          className="sm:hidden absolute bottom-2.5 right-2.5 z-20 px-2.5 py-1.5 bg-white/95 backdrop-blur-md rounded-lg shadow-md text-neutral-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 touch-manipulation border border-neutral-200"
        >
          <Eye className="w-3 h-3 text-neutral-700" />
          <span>View</span>
        </button>
      </div>

      {/* Garment Details */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1">
          <span>{product.category}</span>
          <span className="font-mono text-neutral-500">
            {product.stock > 0 ? (
              product.stock <= 5 ? (
                <span className="text-amber-600 font-bold">Only {product.stock} left</span>
              ) : (
                <span className="text-emerald-700">In Stock</span>
              )
            ) : (
              <span className="text-rose-600 font-bold">Sold Out</span>
            )}
          </span>
        </div>

        <h3
          onClick={() => onQuickView(product)}
          className="text-xs sm:text-sm font-semibold text-neutral-950 hover:text-neutral-700 cursor-pointer line-clamp-1 transition-colors touch-manipulation"
        >
          {product.title}
        </h3>

        <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-2 mt-0.5 sm:mt-1 mb-2.5 sm:mb-3 font-light leading-relaxed flex-1">
          {product.subtitle || product.description}
        </p>

        {/* Size Selection Pill Bar - Mobile Optimized Touch Target (32px+ min height) */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              <span>Select Size:</span>
              <span className="font-bold text-neutral-900 font-mono">{selectedSize}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {product.sizes.map((s) => {
                const isSelected = selectedSize === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={(e) => handleSizeClick(e, s)}
                    className={`min-h-[30px] sm:min-h-[28px] px-2.5 sm:px-2 py-1 text-[11px] sm:text-[10px] font-bold font-mono rounded-lg border touch-manipulation transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm scale-102'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200 active:bg-neutral-200'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price & Add to Cart Footer */}
        <div className="pt-2.5 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 mt-auto">
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-bold text-neutral-950 font-sans truncate">
              {config.currencySymbol}
              {product.price.toFixed(2)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[10px] sm:text-xs text-neutral-400 line-through">
                {config.currencySymbol}
                {product.originalPrice.toFixed(2)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`min-h-[38px] sm:min-h-[36px] px-3.5 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer shrink-0 ${
              product.stock <= 0
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-950 hover:bg-neutral-800 text-white active:scale-95 shadow-sm'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
