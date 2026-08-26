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
  Link as LinkIcon,
  Check,
  Radio,
  ShieldAlert,
  Wrench,
  Code2
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
    'analytics' | 'ai_creator' | 'products' | 'orders' | 'customers' | 'doctor' | 'settings' | 'coupons' | 'export' | 'threat_map'
  >('analytics');

  const [copiedLink, setCopiedLink] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;

  const handleCopyAdminLink = () => {
    const adminUrl = `${window.location.origin}${window.location.pathname}#/admin`;
    navigator.clipboard.writeText(adminUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

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
            {/* Copy Secret Admin URL */}
            <button
              onClick={handleCopyAdminLink}
              className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-700 active:scale-98"
              title="Copy direct link to this Admin Panel (/#/admin)"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 hidden md:inline">Admin Link Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Copy Admin URL</span>
                </>
              )}
            </button>

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
            <span>System Doctor & Repair</span>
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
        
        {/* Secret Direct Admin Link Banner */}
        <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm">
                  গোপন এডমিন লিংক (Direct Secret URL)
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-mono">
                  পাবলিক পেইজে কোনো এডমিন বাটন নেই
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                পাবলিক স্টোরফ্রন্ট থেকে সমস্ত এডমিন বাটন ও লিংক সম্পূর্ণ বাদ দেওয়া হয়েছে। শুধুমাত্র এই গোপন লিংকটি দিয়ে সরাসরি প্যানেলে প্রবেশ করা যাবে:
              </p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-950 border border-neutral-750 rounded-lg text-xs font-mono text-amber-300 select-all max-w-full overflow-x-auto">
                <LinkIcon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>{`${window.location.origin}${window.location.pathname}#/admin`}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyAdminLink}
            className="w-full md:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                <span>লিংক কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" />
                <span>এডমিন লিংক কপি করুন</span>
              </>
            )}
          </button>
        </div>

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

