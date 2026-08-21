import React, { useState, useEffect, useCallback } from 'react';
import { Product, Order, StoreConfig, CartItem, Coupon, Customer } from './types';
import { storageService } from './services/storageService';
import { FirestoreSyncService } from './services/firestoreService';
import { Navbar } from './components/Navbar';
import { AnnouncementBar } from './components/AnnouncementBar';
import { HeroBanner } from './components/HeroBanner';
import { ProductGrid } from './components/ProductGrid';
import { ProductQuickView } from './components/ProductQuickView';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard';
import { HoneypotPortal } from './components/Honeypot/HoneypotPortal';
import { SeoDirectorySection } from './components/SeoDirectorySection';
import { Footer } from './components/Footer';
import { PolicyModal } from './components/PolicyModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { WhatsAppConcierge } from './components/WhatsAppConcierge';
import { generateStoreJsonLd } from './services/seoKeywords';
import { SecurityService } from './services/securityService';
import {
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Tag,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Lock,
  ShieldAlert,
  Timer
} from 'lucide-react';

export const App: React.FC = () => {
  // Primary Storefront & Admin States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<StoreConfig>(storageService.getConfig());
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Honeypot trap routes: /system-root-login, /wp-admin, /api/v1/debug, /db-backup.sql, /phpmyadmin, etc.
  const isTargetHoneypot = () => {
    const raw = (window.location.pathname + window.location.hash + window.location.search).toLowerCase();
    return (
      raw.includes('system-root') ||
      raw.includes('wp-admin') ||
      raw.includes('phpmyadmin') ||
      raw.includes('db-backup') ||
      raw.includes('config.env') ||
      raw.includes('api/v1/debug') ||
      raw.includes('secret-admin-portal') ||
      raw.includes('honeypot')
    );
  };

  // URL-based view state: 'storefront' | 'admin' | 'honeypot'
  const isTargetAdmin = () => {
    const isPathAdmin = window.location.pathname.toLowerCase().includes('/admin');
    const isHashAdmin = window.location.hash.toLowerCase().includes('admin');
    const isSearchAdmin =
      window.location.search.toLowerCase().includes('admin=1') ||
      window.location.search.toLowerCase().includes('admin=true') ||
      window.location.search.toLowerCase().includes('view=admin');
    return isPathAdmin || isHashAdmin || isSearchAdmin;
  };

  const getInitialView = (): 'storefront' | 'admin' | 'honeypot' => {
    if (isTargetHoneypot()) return 'honeypot';
    if (isTargetAdmin()) return 'admin';
    return 'storefront';
  };

  const [view, setView] = useState<'storefront' | 'admin' | 'honeypot'>(getInitialView);

  // Dedicated Admin Gate PIN state (for direct /admin access)
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [adminGateError, setAdminGateError] = useState<string | null>(null);
  const [isAdminVerifying, setIsAdminVerifying] = useState(false);
  const [adminLockoutSec, setAdminLockoutSec] = useState(0);

  // Check admin session and lockout status on load
  useEffect(() => {
    SecurityService.validateAdminSession().then((isValid) => {
      if (isValid) {
        setIsAdminAuthenticated(true);
      }
    });

    const status = SecurityService.getLockoutStatus();
    if (status.isLocked) {
      setAdminLockoutSec(status.remainingSeconds);
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (adminLockoutSec <= 0) return;
    const timer = setInterval(() => {
      setAdminLockoutSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAdminGateError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [adminLockoutSec]);

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCustomerAccountOpen, setIsCustomerAccountOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [policyModalType, setPolicyModalType] = useState<'shipping' | 'returns' | 'privacy' | 'terms' | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Initial Load & Storage Event Subscription
  const loadState = useCallback(() => {
    setProducts(storageService.getProducts());
    setOrders(storageService.getOrders());
    setConfig(storageService.getConfig());
    setCoupons(storageService.getCoupons());
    setCustomers(storageService.getCustomers());
    setCurrentCustomer(storageService.getCurrentCustomer());
    setCart(storageService.getCart());
    setIsAdminAuthenticated(storageService.isAdminAuthenticated());
  }, []);

  useEffect(() => {
    loadState();

    // Initialize Firestore defaults with current local customized data and subscribe to real-time updates
    const currentLocalConfig = storageService.getConfig();
    const currentLocalProducts = storageService.getProducts();
    FirestoreSyncService.initDefaults(currentLocalConfig, currentLocalProducts).catch(console.warn);

    const unsubConfig = FirestoreSyncService.subscribeConfig((cloudConfig) => {
      if (cloudConfig) {
        const localConfig = storageService.getConfig();
        const localTime = localConfig.updatedAt ? new Date(localConfig.updatedAt).getTime() : 0;
        const cloudTime = cloudConfig.updatedAt ? new Date(cloudConfig.updatedAt).getTime() : 0;

        // Prevent overwriting freshly edited local config with stale cloud snapshots
        if (!localTime || cloudTime >= localTime) {
          setConfig(cloudConfig);
          try {
            localStorage.setItem('aura_store_config', JSON.stringify(cloudConfig));
          } catch (e) {
            console.warn('LocalStorage sync warning:', e);
          }
        } else {
          // If local config is newer, sync it to cloud
          FirestoreSyncService.saveConfig(localConfig).catch(console.warn);
        }
      }
    });

    const unsubProducts = FirestoreSyncService.subscribeProducts((cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        const localProducts = storageService.getProducts();
        // Intelligent two-way merge by ID and timestamp to ensure custom garments never disappear
        const mergedMap = new Map<string, Product>();
        cloudProducts.forEach((p) => mergedMap.set(p.id, p));

        localProducts.forEach((lp) => {
          const cp = mergedMap.get(lp.id);
          if (!cp) {
            mergedMap.set(lp.id, lp);
            FirestoreSyncService.saveProduct(lp).catch(console.warn);
          } else {
            const lpTime = lp.updatedAt ? new Date(lp.updatedAt).getTime() : 0;
            const cpTime = cp.updatedAt ? new Date(cp.updatedAt).getTime() : 0;
            if (lpTime > cpTime) {
              mergedMap.set(lp.id, lp);
              FirestoreSyncService.saveProduct(lp).catch(console.warn);
            }
          }
        });

        const finalProducts = Array.from(mergedMap.values());
        setProducts(finalProducts);
        try {
          localStorage.setItem('aura_products', JSON.stringify(finalProducts));
        } catch (e) {
          console.warn('LocalStorage sync warning:', e);
        }
      }
    });

    const handleStorageChange = () => {
      loadState();
    };

    const handleUrlChange = () => {
      if (isTargetHoneypot()) {
        setView('honeypot');
      } else if (isTargetAdmin()) {
        setView('admin');
      } else {
        setView('storefront');
      }
    };

    // Secret shortcut for shop owner: Ctrl+Shift+A or Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigateToAdmin();
      }
    };

    window.addEventListener('aura_storage_update', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubConfig();
      unsubProducts();
      window.removeEventListener('aura_storage_update', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [loadState]);

  // URL Navigation Handlers
  const navigateToAdmin = () => {
    try {
      window.history.pushState({}, '', '/admin');
    } catch {
      window.location.hash = '#/admin';
    }
    setView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStorefront = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
      window.location.hash = '';
    }
    setView('storefront');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Operations
  const handleAddToCart = (product: Product, size: string, quantity = 1) => {
    const updatedCart = storageService.addToCart(product, size, quantity);
    setCart(updatedCart);
    showToast(`Added ${product.title} (${size}) to bag`);
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, size: string, delta: number) => {
    const updatedCart = storageService.updateCartQuantity(productId, size, delta);
    setCart(updatedCart);
  };

  const handleRemoveFromCart = (productId: string, size: string) => {
    const updatedCart = storageService.removeFromCart(productId, size);
    setCart(updatedCart);
  };

  const handleApplyCoupon = (code: string): { success: boolean; message: string } => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const result = storageService.validateCoupon(code, subtotal);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      return { success: true, message: `Applied coupon: ${result.coupon.code}` };
    }
    return { success: false, message: result.message };
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Place Order
  const handlePlaceOrder = (order: Order) => {
    setCart([]);
    setAppliedCoupon(null);
    setOrders(storageService.getOrders());
    showToast(`Order ${order.orderNumber} successfully confirmed! Delivery tracking initiated.`, 'success');
  };

  // Wishlist Toggle
  const handleToggleWishlist = (productId: string) => {
    if (!currentCustomer) {
      setIsAuthModalOpen(true);
      showToast('Please sign in to save items to your personal wishlist.', 'info');
      return;
    }
    const updatedWishlist = storageService.toggleWishlist(productId);
    if (currentCustomer) {
      const updatedCustomer = { ...currentCustomer, wishlist: updatedWishlist };
      setCurrentCustomer(updatedCustomer);
      const isSaved = updatedWishlist.includes(productId);
      showToast(isSaved ? 'Garment saved to wishlist' : 'Removed from wishlist');
    }
  };

  // Customer Auth
  const handleCustomerLogin = (customer: Customer) => {
    storageService.setCurrentCustomer(customer);
    setCurrentCustomer(customer);
    setCustomers(storageService.getCustomers());
    showToast(`Welcome to the Atelier, ${customer.name}`);
  };

  const handleCustomerLogout = () => {
    storageService.setCurrentCustomer(null);
    setCurrentCustomer(null);
    showToast('Signed out of Atelier membership.');
  };

  const handleUpdateShipping = (address: Customer['shippingAddress']) => {
    if (!currentCustomer) return;
    const updated = { ...currentCustomer, shippingAddress: address };
    storageService.saveCustomer(updated);
    storageService.setCurrentCustomer(updated);
    setCurrentCustomer(updated);
  };

  // Admin Auth & Portal Navigation
  const handleAdminGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminVerifying || adminLockoutSec > 0) return;

    const status = SecurityService.getLockoutStatus();
    if (status.isLocked) {
      setAdminLockoutSec(status.remainingSeconds);
      setAdminGateError(`Too many failed attempts. Security Cooldown active (${status.remainingSeconds}s).`);
      return;
    }

    setIsAdminVerifying(true);
    setAdminGateError(null);

    // Artificial verification delay to counter automated brute-force scripts
    await new Promise((r) => setTimeout(r, 500));

    const cleanInput = adminPinInput.trim();
    const correctPin = config.adminPin || 'admin123';

    if (cleanInput === correctPin) {
      setAdminGateError(null);
      setAdminPinInput('');
      await SecurityService.createAdminSession();
      storageService.setAdminAuthenticated(true);
      setIsAdminAuthenticated(true);
      setIsAdminVerifying(false);
      showToast('Master Admin access granted.');
    } else {
      const record = SecurityService.recordFailedAttempt();
      if (record.isLocked) {
        setAdminLockoutSec(record.remainingSeconds);
        setAdminGateError('Access Denied! Security Lockout activated for 15 minutes due to multiple failed attempts.');
      } else {
        setAdminGateError(`Access Denied: Invalid Master PIN. (${record.attemptsRemaining}/5 attempts remaining)`);
      }
      setIsAdminVerifying(false);
    }
  };

  const handleAdminLogout = () => {
    SecurityService.clearAdminSession();
    storageService.setAdminAuthenticated(false);
    setIsAdminAuthenticated(false);
    navigateToStorefront();
    showToast('Admin session securely locked.');
  };

  // Admin Actions
  const handleSaveProduct = (product: Product) => {
    storageService.saveProduct(product);
    setProducts(storageService.getProducts());
    showToast('Garment catalogue updated successfully.');
  };

  const handleDeleteProduct = (id: string) => {
    storageService.deleteProduct(id);
    setProducts(storageService.getProducts());
    showToast('Garment deleted from inventory.');
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status'], trackingNumber?: string) => {
    storageService.updateOrderStatus(orderId, status, trackingNumber);
    setOrders(storageService.getOrders());
    showToast(`Order status updated to ${status}`);
  };

  const handleSaveCustomer = (customer: Customer) => {
    storageService.saveCustomer(customer);
    setCustomers(storageService.getCustomers());
    showToast(`Customer profile for ${customer.name} updated.`);
  };

  const handleSaveConfig = (updated: StoreConfig) => {
    storageService.saveConfig(updated);
    setConfig(updated);
    showToast('Brand settings & customizations applied live!');
  };

  const handleSaveCoupon = (coupon: Coupon) => {
    storageService.saveCoupon(coupon);
    setCoupons(storageService.getCoupons());
    showToast(`Coupon ${coupon.code} updated.`);
  };

  const handleDeleteCoupon = (id: string) => {
    storageService.deleteCoupon(id);
    setCoupons(storageService.getCoupons());
    showToast('Coupon removed.');
  };

  // Calculations for total cart count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // -------------------------------------------------------------
  // INTERACTIVE HONEYPOT TRAP ROUTE (/system-root-login, /wp-admin, /db-backup.sql, etc.)
  // -------------------------------------------------------------
  if (view === 'honeypot') {
    return (
      <HoneypotPortal
        onBackToStore={() => {
          try {
            window.history.pushState({}, '', '/');
          } catch {
            window.location.hash = '';
          }
          setView('storefront');
        }}
        trapRoute={window.location.hash || window.location.pathname || '#/system-root-login'}
      />
    );
  }

  // -------------------------------------------------------------
  // DEDICATED ADMIN ROUTE (/admin)
  // -------------------------------------------------------------
  if (view === 'admin') {
    // If not authenticated, display the dedicated full-screen Admin Gateway Page
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white font-sans selection:bg-amber-400 selection:text-neutral-950">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative text-center">
            
            {/* Return to Storefront button */}
            <button
              onClick={navigateToStorefront}
              className="absolute top-6 left-6 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Public Store</span>
            </button>

            {/* Shield Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner mt-4 transition-colors ${
              adminLockoutSec > 0 
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
                : 'bg-amber-400/10 border border-amber-400/30 text-amber-400'
            }`}>
              {adminLockoutSec > 0 ? <ShieldAlert className="w-8 h-8" /> : <KeyRound className="w-8 h-8" />}
            </div>

            <div className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-widest mb-3 border ${
              adminLockoutSec > 0 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {adminLockoutSec > 0 ? 'Brute-Force Lockout Active' : 'Protected Admin Gateway • Zero-Trust Shield'}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
              {config.brandName} Console
            </h2>
            
            <p className="text-xs text-neutral-400 mb-8 leading-relaxed max-w-xs mx-auto">
              Please enter the administrative master PIN to access stock control, courier dispatch, and customer management.
            </p>

            {adminLockoutSec > 0 ? (
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-5 text-center space-y-3 mb-4">
                <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm">
                  <Timer className="w-5 h-5 animate-spin" />
                  <span>Cooldown: {Math.floor(adminLockoutSec / 60)}m {adminLockoutSec % 60}s</span>
                </div>
                <p className="text-xs text-rose-300/80">
                  Multiple failed login attempts detected. Access is temporarily locked to defend against dictionary & brute-force hacking attempts.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAdminGateSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showAdminPin ? 'text' : 'password'}
                    value={adminPinInput}
                    disabled={isAdminVerifying}
                    onChange={(e) => {
                      setAdminPinInput(e.target.value);
                      if (adminGateError) setAdminGateError(null);
                    }}
                    placeholder="Enter Master PIN"
                    autoFocus
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-2xl py-3.5 px-4 text-center text-lg tracking-[0.25em] font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPin(!showAdminPin)}
                    className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-300"
                  >
                    {showAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {adminGateError && (
                  <div className="flex items-center justify-center gap-2 text-xs text-rose-400 bg-rose-950/50 p-3 rounded-xl border border-rose-800/60 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{adminGateError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAdminVerifying || !adminPinInput.trim()}
                  className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isAdminVerifying ? 'Authenticating...' : 'Verify PIN & Enter Admin Panel'}</span>
                </button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-neutral-800/80 text-[11px] text-neutral-500 flex flex-col items-center gap-2">
              <button
                onClick={navigateToStorefront}
                className="text-neutral-400 hover:text-white underline underline-offset-4 text-xs transition-colors"
              >
                ← Back to Customer Storefront
              </button>
            </div>
          </div>

          {/* Floating Toast */}
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white border border-amber-400/50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-slideUp">
              <Check className="w-4 h-4 text-amber-400" />
              <span>{toast.message}</span>
            </div>
          )}
        </div>
      );
    }

    // Authenticated Admin Dashboard
    return (
      <div className="min-h-screen bg-neutral-900">
        <AdminDashboard
          products={products}
          orders={orders}
          config={config}
          coupons={coupons}
          customers={customers}
          onExitAdmin={navigateToStorefront}
          onLogoutAdmin={handleAdminLogout}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onSaveCustomer={handleSaveCustomer}
          onSaveConfig={handleSaveConfig}
          onSaveCoupon={handleSaveCoupon}
          onDeleteCoupon={handleDeleteCoupon}
          onRefreshData={loadState}
        />

        {/* Global Floating Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-neutral-950 text-white border border-amber-400/50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-slideUp">
            <Check className="w-4 h-4 text-amber-400" />
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // PUBLIC STOREFRONT VIEW (/)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-900 flex flex-col font-sans selection:bg-neutral-950 selection:text-white">
      
      {/* Store Announcement Notification Bar */}
      <AnnouncementBar config={config} />

      {/* Top Navbar */}
      <Navbar
        config={config}
        cartCount={cartCount}
        wishlistCount={currentCustomer?.wishlist?.length || 0}
        customer={currentCustomer}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => (currentCustomer ? setIsCustomerAccountOpen(true) : setIsAuthModalOpen(true))}
        onOpenWishlist={() => (currentCustomer ? setIsCustomerAccountOpen(true) : setIsAuthModalOpen(true))}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('shop') || document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('shop') || document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Banner */}
      <HeroBanner
        config={config}
        onExplore={() => {
          const el = document.getElementById('shop') || document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onExploreClick={() => {
          const el = document.getElementById('shop') || document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSignIn={() => (currentCustomer ? setIsCustomerAccountOpen(true) : setIsAuthModalOpen(true))}
      />

      {/* Main Catalogue Section */}
      <main id="shop" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Curated Capsule Feature Strip */}
        <div className="mb-12 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800">
              Autumn / Winter Capsule
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-950">
              Quiet Luxury, Architectural Tailoring
            </h3>
            <p className="text-xs text-neutral-600 max-w-xl leading-relaxed">
              Explore pure organic wools, raw silks, and structural silhouettes meticulously crafted in limited atelier batches.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-mono text-neutral-400 block">Complimentary Shipping</span>
              <span className="text-xs font-bold text-neutral-900">Orders over {config.currencySymbol}{config.freeShippingThreshold}</span>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSortBy('newest');
              }}
              className="px-5 py-3 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center gap-2"
            >
              <span>View Latest Drop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product Grid with Filters, Search, and Sorting */}
        <ProductGrid
          products={products}
          config={config}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onQuickView={(p) => setQuickViewProduct(p)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={currentCustomer?.wishlist || []}
        />
      </main>

      {/* Structured Schema.org JSON-LD Script for Google & AI Search Bots */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateStoreJsonLd(config, products)) }}
      />

      {/* SEO 1,000+ Keyword Index & Category Directory */}
      <SeoDirectorySection />

      {/* Invisible Ethical Honeypot Canary Traps (Indexed only by automated bot crawlers & vulnerability scanners) */}
      <div style={{ display: 'none', position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <a href="#/system-root-login" rel="nofollow" tabIndex={-1}>Root Terminal & SSH Web Shell</a>
        <a href="#/wp-admin" rel="nofollow" tabIndex={-1}>Legacy WordPress Administration Panel</a>
        <a href="#/api/v1/debug" rel="nofollow" tabIndex={-1}>Core API Debug & Environment Dump</a>
        <a href="#/db-backup.sql" rel="nofollow" tabIndex={-1}>PostgreSQL Database Backup Archive</a>
        <a href="#/phpmyadmin" rel="nofollow" tabIndex={-1}>Direct Database SQL Manager</a>
        <a href="#/secret-admin-portal" rel="nofollow" tabIndex={-1}>Internal Super Admin Gateway</a>
      </div>

      {/* Footer */}
      <Footer
        config={config}
        onOpenPolicy={(type) => setPolicyModalType(type)}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      {/* WhatsApp Atelier Concierge Floating Suite */}
      <WhatsAppConcierge
        config={config}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      {/* MODALS & DRAWERS */}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        config={config}
        appliedCoupon={appliedCoupon}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveFromCart}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={() => setAppliedCoupon(null)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        config={config}
        appliedCoupon={appliedCoupon}
        customer={currentCustomer}
        onSaveCustomerShipping={handleUpdateShipping}
        onOrderPlaced={handlePlaceOrder}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
      />

      {/* Quick View Modal */}
      <ProductQuickView
        isOpen={!!quickViewProduct}
        product={quickViewProduct}
        allProducts={products}
        config={config}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? currentCustomer?.wishlist?.includes(quickViewProduct.id) || false : false}
      />

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        orders={orders}
        config={config}
      />

      {/* Atelier Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* Customer Auth Modal (Member Sign In / Register / Google OAuth with GIS) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        config={config}
        onCustomerLogin={handleCustomerLogin}
      />

      {/* Customer Account Dashboard Modal */}
      <CustomerAccountModal
        isOpen={isCustomerAccountOpen}
        onClose={() => setIsCustomerAccountOpen(false)}
        customer={currentCustomer}
        orders={orders}
        products={products}
        config={config}
        onUpdateShipping={handleUpdateShipping}
        onLogout={handleCustomerLogout}
        onAddToCart={(p, s) => handleAddToCart(p, s, 1)}
      />

      {/* Store Policy Clauses Modal */}
      <PolicyModal
        isOpen={!!policyModalType}
        onClose={() => setPolicyModalType(null)}
        policyType={policyModalType}
        config={config}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold border border-neutral-700 animate-slideUp">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;

