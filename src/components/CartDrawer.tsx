import React, { useState } from 'react';
import { CartItem, StoreConfig, Coupon } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  config: StoreConfig;
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  onRemoveCoupon: () => void;
  onUpdateQuantity: (productId: string, size: string, change: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  config,
  coupons,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ text: string; error: boolean } | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent > 0) {
      discountAmount = (subtotal * appliedCoupon.discountPercent) / 100;
    } else if (appliedCoupon.discountFixed) {
      discountAmount = Math.min(subtotal, appliedCoupon.discountFixed);
    }
  }

  const freeShippingNeeded = Math.max(0, config.freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / config.freeShippingThreshold) * 100);
  const isFreeShipping = subtotal >= config.freeShippingThreshold;
  const shippingCost = cart.length === 0 ? 0 : isFreeShipping ? 0 : 15;
  const estimatedTax = (subtotal - discountAmount) * config.taxRate;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost + estimatedTax);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = onApplyCoupon(couponInput.trim());
    if (res.success) {
      setCouponFeedback({ text: res.message, error: false });
      setCouponInput('');
    } else {
      setCouponFeedback({ text: res.message, error: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-[#faf9f6]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-950 text-white rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-950 tracking-wide">Atelier Bag</h3>
                <span className="text-xs text-neutral-500 font-medium">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} handcrafted items
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-950 hover:bg-neutral-200/60 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-neutral-100 px-6 py-3 border-b border-neutral-200 text-xs">
            {isFreeShipping ? (
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complimentary Express Courier Unlocked!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>
                    Add <strong className="text-neutral-950">{config.currencySymbol}{freeShippingNeeded.toFixed(2)}</strong> for Free Courier
                  </span>
                  <span className="font-mono font-semibold">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-950 transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-base font-bold text-neutral-800">Your Bag is Empty</h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Discover our architectural silhouettes and season capsules to start shopping.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-neutral-950 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="flex gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 group transition-all hover:border-neutral-300"
                >
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-20 h-24 object-cover object-center rounded-lg bg-neutral-200 shrink-0"
                    />
                  ) : null}

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-1">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded font-semibold">
                          Size: {item.selectedSize}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {config.currencySymbol}{item.product.price.toFixed(2)} ea
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-200/60">
                      <div className="flex items-center border border-neutral-300 rounded-md bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, -1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-l"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold font-mono">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-r"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-neutral-950 font-mono">
                        {config.currencySymbol}
                        {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Calculations & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-neutral-200 bg-[#faf9f6] space-y-4">
              
              {/* Promo Code Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Coupon <strong>{appliedCoupon.code}</strong> Applied ({appliedCoupon.description})
                      </span>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Promo code (e.g. WELCOME15)"
                        className="w-full pl-8 pr-3 py-2 text-xs uppercase font-mono bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-950"
                      />
                      <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <p
                    className={`text-[11px] mt-1.5 flex items-center gap-1 ${
                      couponFeedback.error ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {couponFeedback.error ? <AlertCircle className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                    {couponFeedback.text}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600 pt-2 border-t border-neutral-200/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-neutral-900">{config.currencySymbol}{subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-mono">-{config.currencySymbol}{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Tax ({(config.taxRate * 100).toFixed(0)}%)</span>
                  <span className="font-mono text-neutral-900">{config.currencySymbol}{estimatedTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping & Courier</span>
                  <span className="font-mono text-neutral-900">
                    {shippingCost === 0 ? <span className="text-emerald-700 font-bold uppercase text-[10px]">FREE</span> : `${config.currencySymbol}${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>Estimated Total</span>
                  <span className="font-mono text-base">{config.currencySymbol}{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Trigger Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-4 bg-neutral-950 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-lg group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
