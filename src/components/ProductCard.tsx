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
    e.stopPropagation();
    if (product.stock <= 0) return;
    onAddToCart(product, selectedSize);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      className="group flex flex-col bg-white rounded-lg overflow-hidden border border-neutral-200/90 hover:border-neutral-400 hover:shadow-xl transition-all duration-300 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Showcase Container */}
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        {(isHovered && product.additionalImages?.[0]) || product.image ? (
          <img
            src={(isHovered && product.additionalImages?.[0]) ? product.additionalImages[0] : product.image}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : null}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.stock <= 0 ? (
            <span className="px-2.5 py-1 bg-rose-900/90 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest rounded">
              Out of Stock
            </span>
          ) : (
            <>
              {discountPercent && (
                <span className="px-2.5 py-1 bg-neutral-950 text-white text-[10px] uppercase font-bold tracking-widest rounded shadow-sm">
                  -{discountPercent}%
                </span>
              )}
              {product.badges?.map((badge) => (
                <span
                  key={badge}
                  className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded shadow-sm ${
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

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-neutral-800 rounded-full shadow-md backdrop-blur-sm transition-transform active:scale-90 z-10"
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-neutral-700'
            }`}
          />
        </button>

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-4 bottom-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-2.5 bg-white/95 hover:bg-white text-neutral-950 text-xs font-semibold uppercase tracking-wider rounded backdrop-blur-md shadow-lg transition-all flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Garment Details */}
      <div className="p-5 flex flex-col flex-1">
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
          className="text-sm font-semibold text-neutral-950 hover:text-neutral-700 cursor-pointer line-clamp-1 transition-colors"
        >
          {product.title}
        </h3>

        <p className="text-xs text-neutral-500 line-clamp-2 mt-1 mb-3 font-light leading-relaxed flex-1">
          {product.subtitle || product.description}
        </p>

        {/* Size Selection Pill Bar */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase mr-1">Size:</span>
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-all ${
                  selectedSize === s
                    ? 'bg-neutral-950 text-white border-neutral-950 font-bold'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Price & Add to Cart Footer */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-base font-bold text-neutral-950 font-sans">
              {config.currencySymbol}
              {product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through ml-2">
                {config.currencySymbol}
                {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-all flex items-center gap-1.5 ${
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
