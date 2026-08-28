import React, { useState } from 'react';
import { Product, Order, StoreConfig, Coupon, Customer } from '../../types';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminStoreSettings } from './AdminStoreSettings';
import { AdminCoupons } from './AdminCoupons';
import { AdminExportBackup } from './AdminExportBackup';
import { AdminThreatMap } from './AdminThreatMap';
import { AdminAiProductCreator } from './AdminAiProductCreator';
import { AdminSystemDoctor } from './AdminSystemDoctor';
import { AdminFirebaseDiagnostics } from './AdminFirebaseDiagnostics';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Sliders,
  Tag,
  FileCode,
  ArrowLeft,
  LogOut,
  Sparkles,
  Shield,
  Eye,
  Check,
  Radio,
  ShieldAlert,
  Wrench,
  Code2,
  Database
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  config: StoreConfig;
  coupons: Coupon[];
  customers: Customer[];
  onExitAdmin: () => void;
  onLogoutAdmin: () => void;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status'], trackingNumber?: string) => void;
  onSaveCustomer: (customer: Customer) => void;
  onSaveConfig: (updated: StoreConfig) => void;
  onSaveCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (id: string) => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  config,
  coupons,
  customers,
  onExitAdmin,
  onLogoutAdmin,
  onSaveProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onSaveCustomer,
  onSaveConfig,
  onSaveCoupon,
  onDeleteCoupon,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'ai_creator' | 'products' | 'orders' | 'customers' | 'doctor' | 'firebase_debug' | 'settings' | 'coupons' | 'export' | 'threat_map'
  >('analytics');

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col font-sans">
      
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-neutral-950 font-serif font-black flex items-center justify-center text-sm shadow-md">
                {config.brandName.slice(0, 1)}
              </div>
              <div>
                <span className="font-serif font-bold text-sm tracking-wider text-white">
                  {config.brandName}
                </span>
                <span className="block text-[9px] uppercase tracking-widest text-amber-400 font-mono">
                  Master Admin Console
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-850 text-neutral-400 rounded-full text-[10px] uppercase font-mono border border-neutral-750">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Protected Session</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onExitAdmin}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors border border-neutral-700 active:scale-98"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Public Storefront</span>
            </button>

            <button
              onClick={onLogoutAdmin}
              className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-xl transition-colors"
              title="Lock Admin Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-1 border-t border-neutral-850/60 text-xs font-semibold uppercase tracking-wider">
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_creator')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'ai_creator'
                ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                : 'border-transparent text-amber-300/80 hover:text-amber-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>AI Garment Creator</span>
            <span className="px-1.5 py-0.2 bg-amber-400 text-neutral-950 rounded-full text-[9px] font-bold font-mono">
              AI CHAT
            </span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'products'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Garments & Stock ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'orders'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-neutral-950 rounded-full text-[10px] font-bold font-mono">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'customers'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('doctor')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'doctor'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span>System Doctor</span>
          </button>

          <button
            onClick={() => setActiveTab('firebase_debug')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'firebase_debug'
                ? 'border-amber-400 text-amber-400 bg-amber-950/20'
                : 'border-transparent text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>Firebase & Auth Diagnostics</span>
            <span className="px-1.5 py-0.2 bg-amber-400/20 border border-amber-500/40 text-amber-300 rounded-full text-[9px] font-bold font-mono">
              RULES
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Store Settings & OAuth</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'coupons'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Coupons ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('threat_map')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'threat_map'
                ? 'border-rose-400 text-rose-400 bg-rose-950/20'
                : 'border-transparent text-rose-400/80 hover:text-rose-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>Threat Radar & Honeypot Map</span>
            <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-bold font-mono">
              LIVE
            </span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'export'
                ? 'border-amber-400 text-amber-400 bg-neutral-900/50'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Standalone HTML & Backup</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {activeTab === 'analytics' && (
          <AdminAnalytics products={products} orders={orders} config={config} />
        )}

        {activeTab === 'ai_creator' && (
          <AdminAiProductCreator
            config={config}
            onSaveProduct={onSaveProduct}
            onOpenManualModal={() => setActiveTab('products')}
          />
        )}

        {activeTab === 'products' && (
          <AdminProducts
            products={products}
            config={config}
            onSaveProduct={onSaveProduct}
            onDeleteProduct={onDeleteProduct}
            onOpenAiCreator={() => setActiveTab('ai_creator')}
          />
        )}

        {activeTab === 'orders' && (
          <AdminOrders
            orders={orders}
            config={config}
            onUpdateOrderStatus={onUpdateOrderStatus}
          />
        )}

        {activeTab === 'customers' && (
          <AdminCustomers
            customers={customers}
            orders={orders}
            products={products}
            config={config}
            onSaveCustomer={onSaveCustomer}
          />
        )}

        {activeTab === 'doctor' && (
          <AdminSystemDoctor
            products={products}
            config={config}
            onRefreshData={onRefreshData}
            onSaveProduct={onSaveProduct}
          />
        )}

        {activeTab === 'firebase_debug' && (
          <AdminFirebaseDiagnostics />
        )}

        {activeTab === 'settings' && (
          <AdminStoreSettings config={config} onSaveConfig={onSaveConfig} />
        )}

        {activeTab === 'coupons' && (
          <AdminCoupons
            coupons={coupons}
            config={config}
            onSaveCoupon={onSaveCoupon}
            onDeleteCoupon={onDeleteCoupon}
          />
        )}

        {activeTab === 'export' && (
          <AdminExportBackup
            products={products}
            orders={orders}
            config={config}
            coupons={coupons}
            customers={customers}
            onRefreshData={onRefreshData}
          />
        )}

        {activeTab === 'threat_map' && (
          <AdminThreatMap />
        )}
      </main>

      {/* Admin Panel Footer Signature */}
      <footer className="mt-auto border-t border-neutral-800/80 bg-neutral-950 py-4 px-6 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Engine: Online • Production Master Mode</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-400">
          <Code2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Engineered & Developed by</span>
          <span className="text-amber-400 font-bold tracking-wide font-serif">Golam Rabbi</span>
        </div>
      </footer>
    </div>
  );
};

