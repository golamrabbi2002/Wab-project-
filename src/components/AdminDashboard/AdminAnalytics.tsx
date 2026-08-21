import React from 'react';
import { Product, Order, StoreConfig } from '../../types';
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

interface AdminAnalyticsProps {
  products: Product[];
  orders: Order[];
  config: StoreConfig;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ products, orders, config }) => {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  // Status breakdown
  const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
  const shippedOrders = orders.filter((o) => o.status === 'Shipped').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {config.currencySymbol}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active transactions processed</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalOrders}</div>
          <div className="text-[11px] text-neutral-400 mt-2">
            <strong className="text-amber-300">{pendingOrders}</strong> pending fulfillment
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {config.currencySymbol}{avgOrderValue.toFixed(2)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">Per checkout customer basket</div>
        </div>

        {/* Inventory Status */}
        <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Inventory</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{products.length} Garments</div>
          <div className="text-[11px] text-amber-400 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lowStockProducts.length} low stock alerts</span>
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Warnings & Recent Orders Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Low Stock Attention List */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Low Stock & Out of Stock Watchlist
              </h3>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              {lowStockProducts.length + outOfStockProducts.length} items need restock
            </span>
          </div>

          {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              All catalogue garments have healthy atelier stock reserves.
            </div>
          ) : (
            <div className="space-y-3">
              {[...outOfStockProducts, ...lowStockProducts].slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-10 h-12 object-cover rounded bg-neutral-800" />
                    ) : null}
                    <div>
                      <h4 className="font-bold text-white line-clamp-1">{p.title}</h4>
                      <span className="text-[10px] text-neutral-400 font-mono">SKU: {p.sku}</span>
                    </div>
                  </div>

                  <div>
                    {p.stock === 0 ? (
                      <span className="px-2.5 py-1 bg-rose-950/80 text-rose-300 border border-rose-800/60 rounded text-[10px] font-bold uppercase">
                        Sold Out (0)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-800/60 rounded text-[10px] font-bold uppercase">
                        {p.stock} Units Left
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fulfillment Pipeline */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Order Fulfillment Breakdown
            </h3>
            <span className="text-[11px] text-neutral-400">{orders.length} total shipments</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-neutral-300">Processing / Packaging ({pendingOrders})</span>
                <span className="font-mono text-amber-300">
                  {orders.length ? Math.round((pendingOrders / orders.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${orders.length ? (pendingOrders / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-neutral-300">Dispatched in Courier Transit ({shippedOrders})</span>
                <span className="font-mono text-blue-300">
                  {orders.length ? Math.round((shippedOrders / orders.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{ width: `${orders.length ? (shippedOrders / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-neutral-300">Successfully Delivered ({deliveredOrders})</span>
                <span className="font-mono text-emerald-300">
                  {orders.length ? Math.round((deliveredOrders / orders.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${orders.length ? (deliveredOrders / orders.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
