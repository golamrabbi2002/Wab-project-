import React, { useState } from 'react';
import { Coupon, StoreConfig } from '../../types';
import { Plus, Tag, Trash2, Check, X, Percent, DollarSign } from 'lucide-react';

interface AdminCouponsProps {
  coupons: Coupon[];
  config: StoreConfig;
  onSaveCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (id: string) => void;
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({
  coupons,
  config,
  onSaveCoupon,
  onDeleteCoupon,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minSpend, setMinSpend] = useState<number>(50);
  const [description, setDescription] = useState('');

  const openAdd = () => {
    setCode('');
    setDiscountType('percent');
    setDiscountValue(15);
    setMinSpend(50);
    setDescription('15% off orders over $50');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    const newCoupon: Coupon = {
      id: `c-${Date.now()}`,
      code: code.toUpperCase().trim(),
      discountPercent: discountType === 'percent' ? Number(discountValue) : 0,
      discountFixed: discountType === 'fixed' ? Number(discountValue) : undefined,
      minSpend: Number(minSpend),
      description: description || (discountType === 'percent' ? `${discountValue}% off` : `$${discountValue} off`),
      isActive: true,
    };

    onSaveCoupon(newCoupon);
    setIsModalOpen(false);
  };

  const toggleStatus = (c: Coupon) => {
    onSaveCoupon({ ...c, isActive: !c.isActive });
  };

  return (
    <div className="space-y-6 animate-fadeIn text-xs">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Promotional Coupons & Discount Engine
          </h3>
          <p className="text-neutral-400">
            Create coupon codes that customers can redeem in the cart drawer and checkout.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`p-5 rounded-2xl border transition-all ${
              coupon.isActive ? 'bg-neutral-950 border-neutral-800 shadow-xl' : 'bg-neutral-950/40 border-neutral-850 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-base font-bold text-white tracking-widest">
                  {coupon.code}
                </span>
              </div>
              <button
                onClick={() => toggleStatus(coupon)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  coupon.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {coupon.isActive ? 'Active' : 'Disabled'}
              </button>
            </div>

            <p className="text-neutral-300 text-xs mb-4 min-h-[32px]">
              {coupon.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-neutral-400">
              <div>
                <span className="text-[10px] uppercase block text-neutral-500">Discount</span>
                <span className="font-mono font-bold text-white">
                  {coupon.discountPercent > 0 ? `${coupon.discountPercent}% OFF` : `${config.currencySymbol}${coupon.discountFixed} OFF`}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase block text-neutral-500">Min Spend</span>
                <span className="font-mono font-bold text-white">
                  {config.currencySymbol}{coupon.minSpend}
                </span>
              </div>

              <button
                onClick={() => onDeleteCoupon(coupon.id)}
                className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Delete coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-neutral-900 border border-neutral-800 text-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h4 className="font-bold uppercase tracking-wider text-white">Create Promo Coupon</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH25"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white font-mono uppercase text-sm tracking-wider focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    Value ({discountType === 'percent' ? '%' : config.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                  Minimum Order Spend ({config.currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={minSpend}
                  onChange={(e) => setMinSpend(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                  Customer Description / Headline
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 20% off luxury seasonal items"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg uppercase font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold uppercase tracking-wider rounded-lg transition-colors"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
