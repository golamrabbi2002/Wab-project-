import React, { useState } from 'react';
import { Order, StoreConfig } from '../../types';
import { Truck, CheckCircle2, Clock, Search, Eye, Filter, Sparkles, X, MapPin } from 'lucide-react';

interface AdminOrdersProps {
  orders: Order[];
  config: StoreConfig;
  onUpdateOrderStatus: (orderId: string, status: Order['status'], trackingNumber?: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, config, onUpdateOrderStatus }) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editTrackingId, setEditTrackingId] = useState('');

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setEditTrackingId(order.trackingNumber || '');
  };

  const handleSaveTracking = () => {
    if (selectedOrder) {
      onUpdateOrderStatus(selectedOrder.id, selectedOrder.status, editTrackingId);
      setSelectedOrder({ ...selectedOrder, trackingNumber: editTrackingId });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order # or Customer..."
              className="w-48 sm:w-64 pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-300 py-2 px-3 focus:outline-none focus:border-amber-400"
          >
            <option value="All">All Statuses ({orders.length})</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <span className="text-xs text-neutral-400">
          Showing <strong className="text-white">{filteredOrders.length}</strong> orders
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900/90 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Garments</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status & Pipeline</th>
                <th className="py-3.5 px-4">Tracking Code</th>
                <th className="py-3.5 px-4 text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/70 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    No customer orders found in the database.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-900/60 transition-colors">
                    
                    {/* Order Ref */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-amber-300">{o.orderNumber}</div>
                      <div className="text-[10px] text-neutral-500">
                        {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{o.customerName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{o.customerEmail}</div>
                    </td>

                    {/* Items count & preview */}
                    <td className="py-3.5 px-4">
                      <div className="text-neutral-300">
                        {o.items.reduce((s, i) => s + i.quantity, 0)} items ({o.items.length} styles)
                      </div>
                      <div className="text-[10px] text-neutral-500 truncate max-w-[140px]">
                        {o.items.map((i) => i.title).join(', ')}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white text-sm">
                        {config.currencySymbol}{o.total.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-neutral-500">{o.paymentMethod}</div>
                    </td>

                    {/* Status Badge & Selector */}
                    <td className="py-3.5 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as any)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                            : o.status === 'Shipped'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-800/80'
                            : o.status === 'Processing'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                            : o.status === 'Cancelled'
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                            : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Tracking ID */}
                    <td className="py-3.5 px-4">
                      {o.trackingNumber ? (
                        <span className="font-mono text-[11px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                          {o.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-600 italic">No Tracking</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(o)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS & PACKING SLIP MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative bg-neutral-900 border border-neutral-800 text-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-white">Order {selectedOrder.orderNumber}</h3>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded uppercase">
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Placed {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* Customer & Shipping info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    Customer Information
                  </span>
                  <div className="font-bold text-white text-sm">{selectedOrder.customerName}</div>
                  <div className="text-neutral-400 font-mono mt-0.5">{selectedOrder.customerEmail}</div>
                  {selectedOrder.customerPhone && (
                    <div className="text-neutral-400 mt-0.5">{selectedOrder.customerPhone}</div>
                  )}
                </div>

                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    Shipping Address
                  </span>
                  <div className="text-neutral-200">
                    {selectedOrder.shippingAddress.street}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}<br />
                    {selectedOrder.shippingAddress.country}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Purchased Items ({selectedOrder.items.length})
                </span>
                <div className="space-y-2">
                  {selectedOrder.items.map((i, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-neutral-950 rounded-xl border border-neutral-800"
                    >
                      <div className="flex items-center gap-3">
                        {i.image ? (
                          <img src={i.image} alt="" className="w-12 h-14 object-cover rounded bg-neutral-800" />
                        ) : null}
                        <div>
                          <div className="font-bold text-white">{i.title}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">
                            Size: {i.size} • Qty: {i.quantity} × {config.currencySymbol}{i.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white">
                        {config.currencySymbol}{(i.price * i.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Number Input */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
                <label className="font-bold uppercase tracking-wider text-neutral-300 block">
                  Carrier Courier Tracking Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editTrackingId}
                    onChange={(e) => setEditTrackingId(e.target.value)}
                    placeholder="e.g. 1Z9999999294682741"
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleSaveTracking}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold uppercase rounded-lg transition-colors"
                  >
                    Save Tracking
                  </button>
                </div>
              </div>

              {/* Order Financials */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1.5 text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{config.currencySymbol}{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({selectedOrder.couponCode || 'Promo'})</span>
                    <span className="font-mono">-{config.currencySymbol}{selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-mono text-white">{config.currencySymbol}{selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono text-white">
                    {selectedOrder.shippingCost === 0 ? 'FREE' : `${config.currencySymbol}${selectedOrder.shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-neutral-800">
                  <span>Grand Total Paid</span>
                  <span className="font-mono text-amber-300">{config.currencySymbol}{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
