import React, { useState, useRef } from 'react';
import { Product, StoreConfig } from '../types';
import { 
  X, Heart, ShoppingBag, Star, Check, ShieldCheck, Truck, RefreshCw, 
  Sparkles, Ruler, ZoomIn, MessageSquare, Plus, CheckCircle2, User, Send 
} from 'lucide-react';
import { SizeGuideModal } from './SizeGuideModal';

interface ProductQuickViewProps {
  product: Product | null;
  allProducts?: Product[];
  config: StoreConfig;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  allProducts = [],
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
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'care' | 'reviews'>('details');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Zoom & Loupe state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Reviews State
  const [userRating, setUserRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsList, setReviewsList] = useState<Array<{ name: string; rating: number; date: string; comment: string; verified: boolean }>>([
    { name: 'Farhan Rahman', rating: 5, date: '2 days ago', comment: 'Exceptional craftsmanship. The weave of the fabric is breathable, luxuriously soft, and fits true to size.', verified: true },
    { name: 'Nusrat Jahan', rating: 5, date: '1 week ago', comment: 'The drape and silhouette are stunning! Packaging felt like a true Paris/Dhaka luxury atelier.', verified: true },
  ]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Sync state if product changes
  React.useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setSelectedSize(product.sizes?.[0] || 'M');
      setQuantity(1);
      setActiveTab('details');
      setReviewSubmitted(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const currentDisplayImage = activeImage || product.image || '';
  const images = [product.image, ...(product.additionalImages || [])].filter(Boolean);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    onAddToCart(product, selectedSize, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 1000);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewComment) return;
    const newRev = {
      name: reviewerName,
      rating: userRating,
      date: 'Just now',
      comment: reviewComment,
      verified: true,
    };
    setReviewsList([newRev, ...reviewsList]);
    setReviewerName('');
    setReviewComment('');
    setReviewSubmitted(true);
  };

  // Curate Complete The Look Pairing
  const relatedPairings = allProducts
    .filter((p) => p.id !== product.id && p.category !== product.category)
    .slice(0, 2);

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex items-start sm:items-center justify-center p-0 sm:p-4 lg:p-6 animate-fadeIn">
        {/* Modal Container: On Mobile full scrollable page/sheet, On Desktop dual column grid */}
        <div className="relative bg-white w-full max-w-5xl sm:rounded-3xl shadow-2xl overflow-y-auto lg:overflow-hidden border-0 sm:border border-neutral-200 min-h-screen sm:min-h-0 max-h-none sm:max-h-[92vh] flex flex-col lg:grid lg:grid-cols-12">
          
          {/* Close Button - Sticky/Fixed on Mobile so user can close anytime */}
          <button
            onClick={onClose}
            className="sticky sm:absolute top-3 right-3 self-end sm:self-auto z-30 p-2.5 bg-white/95 hover:bg-white text-neutral-800 rounded-full shadow-lg backdrop-blur-sm transition-transform active:scale-95 border border-neutral-200 touch-manipulation cursor-pointer"
            title="Close dialog"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-neutral-900" />
          </button>

          {/* Left Column: Visual Gallery & Interactive Texture Zoom (5 Cols on PC, Top natural scroll on Mobile) */}
          <div className="lg:col-span-5 bg-neutral-100 p-4 sm:p-6 flex flex-col justify-between overflow-visible lg:overflow-y-auto shrink-0">
            <div>
              <div 
                ref={imageContainerRef}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                className="relative aspect-[3/4] max-h-[50vh] sm:max-h-none bg-white rounded-2xl overflow-hidden shadow-sm mb-3 sm:mb-4 cursor-crosshair group mx-auto w-full"
              >
                {currentDisplayImage ? (
                  <img
                    src={currentDisplayImage}
                    alt={product.title}
                    className={`w-full h-full object-cover object-center transition-transform duration-200 ${
                      isZooming ? 'scale-150 origin-center' : 'scale-100'
                    }`}
                    style={isZooming ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                  />
                ) : null}

                {/* Floating Zoom Indicator */}
                <div className="absolute bottom-3 right-3 bg-neutral-950/70 text-white p-2 rounded-xl backdrop-blur-sm flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hover to Inspect Weave</span>
                </div>

                {/* Badges */}
                {product.badges && product.badges.length > 0 && (
                  <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
                    {product.badges.map((b) => (
                      <span key={b} className="px-3 py-1 bg-neutral-950 text-amber-400 text-[10px] uppercase font-bold tracking-widest rounded-lg shadow">
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-angle Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeImage === img ? 'border-neutral-950 ring-2 ring-neutral-950/20' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Atelier Micro Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-200 text-[10px] text-neutral-600">
              <div className="flex items-center gap-1.5 font-medium">
                <Truck className="w-3.5 h-3.5 text-neutral-800" />
                <span>Fast Nationwide</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <RefreshCw className="w-3.5 h-3.5 text-neutral-800" />
                <span>Easy Exchange</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>100% Authentic</span>
              </div>
            </div>
          </div>

          {/* Right Column: Garment Specs, Size Selector & Tabs (7 Cols on PC, smooth natural scroll on Mobile) */}
          <div className="lg:col-span-7 p-4 sm:p-8 flex flex-col overflow-visible lg:overflow-y-auto max-h-none lg:max-h-[92vh]">
            
            {/* Category & SKU */}
            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold uppercase tracking-widest mb-1.5">
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">{product.category}</span>
              <span className="font-mono text-neutral-500">SKU: {product.sku}</span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-950 leading-snug mb-2">
              {product.title}
            </h2>

            {/* Rating & Reviews Trigger */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-neutral-900">{product.rating.toFixed(1)}</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-neutral-500 underline hover:text-neutral-900 transition-colors"
              >
                ({reviewsList.length + product.reviewsCount} verified reviews)
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-neutral-100">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-950 font-serif">
                {config.currencySymbol}{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-sm sm:text-base text-neutral-400 line-through">
                    {config.currencySymbol}{product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Save {config.currencySymbol}{(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Size Selector + Interactive Size Guide Modal Button */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="font-semibold uppercase tracking-wider text-neutral-900">
                  Select Size: <span className="font-bold text-neutral-950 font-mono text-sm bg-neutral-100 px-2 py-0.5 rounded">{selectedSize}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-neutral-900 font-bold hover:text-amber-700 transition-colors bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg"
                >
                  <Ruler className="w-3.5 h-3.5 text-amber-600" />
                  <span>Size & Measurement Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      selectedSize === size
                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-md scale-102'
                        : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-950'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Stock Level */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-neutral-300 rounded-xl p-1 bg-neutral-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-white rounded-lg text-sm font-bold transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-neutral-900 font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-white rounded-lg text-sm font-bold transition-colors"
                >
                  +
                </button>
              </div>

              <div className="text-xs">
                {product.stock > 0 ? (
                  product.stock <= 5 ? (
                    <span className="text-amber-600 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Hurry! Only {product.stock} items remaining in atelier
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready to dispatch ({product.stock} in stock)
                    </span>
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
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl ${
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
                    <span>Added to Shopping Bag!</span>
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
                className={`p-4 rounded-xl border transition-all ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-sm'
                    : 'bg-white border-neutral-300 hover:border-neutral-950 text-neutral-700'
                }`}
                title="Save to wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Complete The Look Section */}
            {relatedPairings.length > 0 && (
              <div className="mb-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Complete The Look / Curated Styling</span>
                  </span>
                  <span className="text-[10px] text-neutral-500">Pairs seamlessly</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {relatedPairings.map((pairing) => (
                    <div key={pairing.id} className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-neutral-200">
                      {pairing.image ? (
                        <img src={pairing.image} alt={pairing.title} className="w-12 h-14 object-cover rounded-lg shrink-0" />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-neutral-900 truncate block">{pairing.title}</span>
                        <span className="text-[11px] font-mono text-neutral-600 font-bold block mb-1">
                          {config.currencySymbol}{pairing.price.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAddToCart(pairing, pairing.sizes[0] || 'M', 1)}
                          className="px-2 py-0.5 bg-neutral-950 hover:bg-neutral-800 text-white text-[10px] font-bold rounded-md transition-all"
                        >
                          + Pair This
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  Textiles & Weave
                </button>
                <button
                  onClick={() => setActiveTab('care')}
                  className={`pb-1 font-semibold uppercase tracking-wider transition-colors ${
                    activeTab === 'care' ? 'border-b-2 border-neutral-950 text-neutral-950' : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  Garment Care
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-1 font-semibold uppercase tracking-wider transition-colors ${
                    activeTab === 'reviews' ? 'border-b-2 border-neutral-950 text-neutral-950' : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  Reviews ({reviewsList.length + product.reviewsCount})
                </button>
              </div>

              <div className="text-xs text-neutral-600 leading-relaxed min-h-[80px]">
                {activeTab === 'details' && <p>{product.description}</p>}
                {activeTab === 'materials' && <p>{product.material || '100% High-Grade Organic Textile, ethically woven with zero harsh chemicals.'}</p>}
                {activeTab === 'care' && <p>{product.careInstructions || 'Dry clean recommended or gentle cold machine cycle. Cool iron inside out.'}</p>}
                
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {/* Write Review Form */}
                    <form onSubmit={handleAddReview} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-900 uppercase">Write a Verified Buyer Review</span>
                        <div className="flex gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setUserRating(star)}
                              className="focus:outline-none"
                            >
                              <Star className={`w-3.5 h-3.5 ${star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="Your Name (e.g. Shakib A.)"
                          required
                          className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="How did this garment feel and drape?"
                          required
                          className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          Submit Review
                        </button>
                      </div>
                    </form>

                    {reviewSubmitted && (
                      <div className="p-2 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Thank you! Your verified rating has been recorded.</span>
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-3 pt-2">
                      {reviewsList.map((rev, i) => (
                        <div key={i} className="p-3 bg-white rounded-xl border border-neutral-100 shadow-sm space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-neutral-900">{rev.name}</span>
                              {rev.verified && (
                                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                                  Verified
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                className={`w-3 h-3 ${idx < rev.rating ? 'fill-amber-400' : 'text-neutral-200'}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-neutral-700">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Size Guide Modal Triggered Child */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.category}
      />
    </>
  );
};
