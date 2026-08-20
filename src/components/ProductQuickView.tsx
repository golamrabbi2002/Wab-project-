import React, { useState } from 'react';
import { Product, StoreConfig } from '../types';
import { X, Heart, ShoppingBag, Star, Check, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';

interface ProductQuickViewProps {
  product: Product | null;
  config: StoreConfig;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  config,
  isOpen,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [activeImage, setActiveImage] = useState<string>(product?.image || '');
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] || 'M');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'care'>('details');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Sync state if product changes
  React.useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setSelectedSize(product.sizes?.[0] || 'M');
      setQuantity(1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const images = [product.image, ...(product.additionalImages || [])];

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    onAddToCart(product, selectedSize, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 grid grid-cols-1 md:grid-cols-2 max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-neutral-800 rounded-full shadow-md backdrop-blur-sm transition-transform active:scale-95"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Visual Gallery */}
        <div className="bg-neutral-100 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="relative aspect-[3/4] bg-white rounded-xl overflow-hidden shadow-sm mb-4">
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.badges && product.badges.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.badges.map((b) => (
                  <span key={b} className="px-2.5 py-1 bg-neutral-950 text-white text-[10px] uppercase font-bold tracking-wider rounded">
                    {b}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === img ? 'border-neutral-950 ring-2 ring-neutral-950/20' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Garment Specs & Purchase Options */}
        <div className="p-6 sm:p-8 flex flex-col overflow-y-auto max-h-[85vh]">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold uppercase tracking-widest mb-1">
            <span>{product.category}</span>
            <span className="font-mono text-neutral-500">SKU: {product.sku}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-light text-neutral-950 leading-snug mb-2">
            {product.title}
          </h2>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-neutral-700">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-neutral-400">({product.reviewsCount} verified reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-neutral-100">
            <span className="text-2xl font-bold text-neutral-950">
              {config.currencySymbol}{product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-sm text-neutral-400 line-through">
                  {config.currencySymbol}{product.originalPrice.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Save {config.currencySymbol}{(product.originalPrice - product.price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Size Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-neutral-900">
                Select Size: <span className="font-bold text-neutral-950 font-mono">{selectedSize}</span>
              </span>
              <span className="text-[11px] text-neutral-500 underline cursor-pointer hover:text-neutral-900">
                Tailored Fit Guide
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2.5 text-xs font-semibold rounded-lg border transition-all ${
                    selectedSize === size
                      ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                      : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Stock Level */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-neutral-300 rounded-lg p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded text-sm font-bold"
              >
                -
              </button>
              <span className="w-10 text-center text-xs font-bold text-neutral-900">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded text-sm font-bold"
              >
                +
              </button>
            </div>

            <div className="text-xs">
              {product.stock > 0 ? (
                product.stock <= 5 ? (
                  <span className="text-amber-600 font-semibold">
                    Hurry! Only {product.stock} items remaining in atelier
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium">Ready to dispatch ({product.stock} available)</span>
                )
              ) : (
                <span className="text-rose-600 font-bold">Currently Out of Stock</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
                product.stock <= 0
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-950 hover:bg-neutral-800 text-white active:scale-98'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Atelier Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Bag</span>
                </>
              )}
            </button>

            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-4 rounded-lg border transition-all ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-white border-neutral-300 hover:border-neutral-600 text-neutral-700'
              }`}
              title="Save to wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Specification Tabs */}
          <div className="border-t border-neutral-200 pt-4 flex-1">
            <div className="flex gap-4 border-b border-neutral-100 pb-2 mb-3 text-xs">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-1 font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'details' ? 'border-b-2 border-neutral-950 text-neutral-950' : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`pb-1 font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'materials' ? 'border-b-2 border-neutral-950 text-neutral-950' : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Textiles & Origin
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`pb-1 font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'care' ? 'border-b-2 border-neutral-950 text-neutral-950' : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Garment Care
              </button>
            </div>

            <div className="text-xs text-neutral-600 leading-relaxed min-h-[60px]">
              {activeTab === 'details' && <p>{product.description}</p>}
              {activeTab === 'materials' && <p>{product.material || 'Organic natural fibers sustainably woven.'}</p>}
              {activeTab === 'care' && <p>{product.careInstructions || 'Dry clean or gentle cold cycle.'}</p>}
            </div>
          </div>

          {/* Micro Value props */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-100 text-[10px] text-neutral-500 mt-4">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-neutral-400" />
              <span>Carbon-Neutral</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
              <span>30-Day Return</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>Authentic Craft</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
