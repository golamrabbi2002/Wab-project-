import React, { useState } from 'react';
import { Customer, Order, Product, StoreConfig } from '../types';
import { X, User, Package, Heart, LogOut, MapPin, Check, Truck, ArrowRight, ShoppingBag } from 'lucide-react';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  orders: Order[];
  products: Product[];
  config: StoreConfig;
  onUpdateShipping: (address: Customer['shippingAddress']) => void;
  onLogout: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  customer,
  orders,
  products,
  config,
  onUpdateShipping,
  onLogout,
  onAddToCart,
}) => {
  const [tab, setTab] = useState<'orders' | 'profile' | 'wishlist'>('orders');
  const [street, setStreet] = useState(customer?.shippingAddress?.street || '');
  const [city, setCity] = useState(customer?.shippingAddress?.city || '');
  const [state, setState] = useState(customer?.shippingAddress?.state || '');
  const [zip, setZip] = useState(customer?.shippingAddress?.zip || '');
  const [country, setCountry] = useState(customer?.shippingAddress?.country || 'Bangladesh');
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sync state if customer changes
  React.useEffect(() => {
    if (customer?.shippingAddress) {
      setStreet(customer.shippingAddress.street || '');
      setCity(customer.shippingAddress.city || '');
      setState(customer.shippingAddress.state || '');
      setZip(customer.shippingAddress.zip || '');
      setCountry(customer.shippingAddress.country || 'Bangladesh');
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  // Filter orders for this customer
  const customerOrders = orders.filter(
    (o) => o.customerId === customer.id || o.customerEmail.toLowerCase() === customer.email.toLowerCase()
  );

  // Wishlist products
  const wishlistProducts = products.filter((p) => customer.wishlist?.includes(p.id));

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShipping({ street, city, state, zip, country });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 bg-[#faf9f6] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={customer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'}
              alt={customer.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-neutral-300 ring-2 ring-emerald-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-neutral-950">{customer.name}</h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold tracking-wider rounded-full">
                  Atelier Member
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono">{customer.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-950 hover:bg-neutral-200/60 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider bg-neutral-50">
          <button
            onClick={() => setTab('orders')}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-2 transition-colors ${
              tab === 'orders' ? 'border-b-2 border-neutral-950 text-neutral-950 bg-white' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setTab('wishlist')}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-2 transition-colors ${
              tab === 'wishlist' ? 'border-b-2 border-neutral-950 text-neutral-950 bg-white' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Wishlist ({wishlistProducts.length})</span>
          </button>

          <button
            onClick={() => setTab('profile')}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-2 transition-colors ${
              tab === 'profile' ? 'border-b-2 border-neutral-950 text-neutral-950 bg-white' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Shipping Preferences</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          
          {/* TAB: ORDERS */}
          {tab === 'orders' && (
            <div className="space-y-4">
              {customerOrders.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Package className="w-12 h-12 text-neutral-300 mx-auto" />
                  <h4 className="font-serif text-base font-bold text-neutral-800">No Past Orders Found</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    When you place garment orders in our atelier, real-time fulfillment and tracking links will appear here.
                  </p>
                </div>
              ) : (
                customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-4 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200 gap-2">
                      <div>
                        <span className="font-mono font-bold text-sm text-neutral-950">{order.orderNumber}</span>
                        <div className="text-[11px] text-neutral-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="font-mono font-bold text-sm text-neutral-950">
                          {config.currencySymbol}{order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt="" className="w-10 h-12 object-cover rounded bg-neutral-200" />
                            <div>
                              <div className="font-semibold text-neutral-900">{item.title}</div>
                              <div className="text-[11px] text-neutral-500 font-mono">
                                Size: {item.size} • Qty: {item.quantity}
                              </div>
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-neutral-900">
                            {config.currencySymbol}{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="pt-3 border-t border-neutral-200/80 flex items-center justify-between text-[11px] text-neutral-600 bg-white p-2.5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Tracking ID: <strong className="font-mono text-neutral-950">{order.trackingNumber}</strong></span>
                        </div>
                        <span className="text-amber-700 font-semibold uppercase">In Transit</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: WISHLIST */}
          {tab === 'wishlist' && (
            <div className="space-y-4">
              {wishlistProducts.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Heart className="w-12 h-12 text-neutral-300 mx-auto" />
                  <h4 className="font-serif text-base font-bold text-neutral-800">Your Wishlist is Empty</h4>
                  <p className="text-xs text-neutral-500">
                    Click the heart icon on any garment to save items to your personal atelier wishlist.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((p) => (
                    <div key={p.id} className="flex gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                      <img src={p.image} alt={p.title} className="w-16 h-20 object-cover rounded bg-neutral-200" />
                      <div className="flex-1 flex flex-col justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-neutral-900 line-clamp-1">{p.title}</h4>
                          <span className="font-mono font-bold text-neutral-950">{config.currencySymbol}{p.price}</span>
                        </div>
                        <button
                          onClick={() => onAddToCart(p, p.sizes[0] || 'M')}
                          className="mt-2 py-1.5 px-3 bg-neutral-950 text-white rounded text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-neutral-800"
                        >
                          <ShoppingBag className="w-3 h-3" /> Move to Bag
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFILE & SHIPPING ADDRESS */}
          {tab === 'profile' && (
            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs max-w-lg">
              <div>
                <h4 className="font-bold uppercase tracking-wider text-neutral-900 mb-1">
                  Default Delivery Address
                </h4>
                <p className="text-[11px] text-neutral-500 mb-4">
                  This address will automatically pre-fill your checkout for effortless ordering.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                {savedFeedback && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Preferences Updated!
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-6 py-2.5 bg-neutral-950 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
