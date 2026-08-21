import React, { useState } from 'react';
import { X, Search, Package, Truck, CheckCircle2, Clock, ShieldCheck, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Order, StoreConfig } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  config: StoreConfig;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  config,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleaned = searchQuery.trim().toLowerCase();
    
    if (!cleaned) {
      setSearchedOrder(null);
      return;
    }

    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase().includes(cleaned) ||
        (o.customerPhone && o.customerPhone.includes(cleaned)) ||
        o.customerEmail.toLowerCase().includes(cleaned) ||
        (o.transactionId && o.transactionId.toLowerCase().includes(cleaned))
    );

    setSearchedOrder(found || null);
  };

  // Status mapping
  const steps = [
    { title: 'Order Confirmed', desc: 'Received & verified by Atelier', status: 'Pending' },
    { title: 'Quality & Packing', desc: 'Handcrafted signature packaging', status: 'Processing' },
    { title: 'Handed to Courier', desc: 'Dispatched via Pathao / Steadfast', status: 'Shipped' },
    { title: 'Delivered', desc: 'Handed to doorstep', status: 'Delivered' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return 0;
    }
  };

  const currentStep = searchedOrder ? getStepIndex(searchedOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-950 text-amber-400 rounded-xl shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-neutral-900">
                Live Order & Courier Tracking
              </h3>
              <p className="text-xs text-neutral-500">
                Real-time delivery progress for Bangladesh & Worldwide orders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order # (e.g. ATL-2026-123456) or Mobile Number..."
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all text-neutral-900"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 active:scale-95 shadow"
            >
              Track Order
            </button>
          </form>

          {/* Results Display */}
          {searchedOrder ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Summary Card */}
              <div className="p-4 sm:p-5 bg-neutral-900 text-white rounded-2xl shadow-lg border border-neutral-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-neutral-800">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest block font-bold">Order Identifier</span>
                    <span className="font-mono text-sm sm:text-base font-bold text-white">{searchedOrder.orderNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">Status</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      {searchedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Recipient</span>
                    <span className="font-semibold text-neutral-200">{searchedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Mobile</span>
                    <span className="font-semibold text-neutral-200">{searchedOrder.customerPhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">City</span>
                    <span className="font-semibold text-neutral-200">{searchedOrder.shippingAddress?.city || 'Dhaka'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Total Amount</span>
                    <span className="font-bold text-amber-400 font-mono">
                      {config.currencySymbol}{searchedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Status Stepper */}
              <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-6 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-neutral-700" />
                  <span>Shipment Milestone & Progress</span>
                </h4>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-neutral-200 -z-0"></div>
                  <div
                    className="absolute left-4 top-4 w-0.5 bg-emerald-500 transition-all duration-700 -z-0"
                    style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  ></div>

                  {/* Steps */}
                  <div className="space-y-6">
                    {steps.map((step, idx) => {
                      const isDone = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={idx} className="flex items-start gap-4 relative z-10">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                              isDone
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                : 'bg-white text-neutral-400 border-2 border-neutral-300'
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className={`text-xs font-bold ${isCurrent ? 'text-neutral-950 font-serif text-sm' : 'text-neutral-700'}`}>
                                {step.title}
                              </h5>
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                                  Current Stage
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Purchased Items Preview */}
              <div className="p-4 bg-white rounded-2xl border border-neutral-200">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
                  Garments in this parcel ({searchedOrder.items.length})
                </h5>
                <div className="divide-y divide-neutral-100">
                  {searchedOrder.items.map((item, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-10 h-12 object-cover rounded-md" />
                        ) : null}
                        <div>
                          <span className="font-semibold text-neutral-900 block">{item.title}</span>
                          <span className="text-[10px] text-neutral-500">Size: {item.size} • Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold font-mono text-neutral-950">
                        {config.currencySymbol}{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : hasSearched ? (
            <div className="text-center py-10 px-4 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
              <Clock className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-neutral-800 mb-1">No order record located</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                Please verify your Order Number (e.g. ATL-2026-...) or the exact phone number used at checkout.
              </p>
              <a
                href={`https://wa.me/${(config.contactPhone || '8801700000000').replace(/[^0-9]/g, '')}?text=Hello%20Aura%20Atelier,%20I%20would%20like%20to%20inquire%20about%20my%20order`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow"
              >
                <span>Inquire via WhatsApp Support</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500 text-xs">
              <p>Enter your 6-digit Atelier Order ID or delivery phone number above to view live shipment milestone.</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>Need immediate assistance? Call <strong className="text-neutral-900">{config.contactPhone || '+880 1712-345678'}</strong></span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-950 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
