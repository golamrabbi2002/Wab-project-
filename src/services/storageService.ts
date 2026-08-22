import { Product, StoreConfig, Coupon, Order, Customer, CartItem } from '../types';
import { initialStoreConfig, initialProducts, initialCoupons, initialOrders } from '../data/initialData';
import { FirestoreSyncService } from './firestoreService';

const KEYS = {
  CONFIG: 'aura_store_config',
  PRODUCTS: 'aura_products',
  COUPONS: 'aura_coupons',
  ORDERS: 'aura_orders',
  CURRENT_USER: 'aura_current_customer',
  CUSTOMERS: 'aura_all_customers',
  WISHLIST: 'aura_wishlist',
  ADMIN_AUTH: 'aura_admin_authenticated',
  CART: 'aura_cart_items'
};

// Resilient in-memory backup cache to prevent data loss in strict environments
const memoryCache: Record<string, any> = {
  [KEYS.CONFIG]: initialStoreConfig,
  [KEYS.PRODUCTS]: [...initialProducts],
  [KEYS.COUPONS]: [...initialCoupons],
  [KEYS.ORDERS]: [...initialOrders],
  [KEYS.CART]: []
};

// Safe LocalStorage setter with QuotaExceeded auto-cleanup
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    console.warn(`LocalStorage quota warning for key "${key}":`, e?.message);
    if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.code === 1014) {
      try {
        // Clear telemetry/log caches to reclaim space
        localStorage.removeItem('aura_threat_logs');
        localStorage.removeItem('aura_security_logs');
        localStorage.removeItem('aura_debug_logs');
        // Retry
        localStorage.setItem(key, value);
      } catch (retryError) {
        console.error('LocalStorage write failed after space cleanup, continuing in memory:', retryError);
      }
    }
  }
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`LocalStorage read warning for key "${key}":`, e);
    return null;
  }
}

function broadcastStorageEvent(eventName: string, detail?: any) {
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
    window.dispatchEvent(new CustomEvent('aura_storage_update', { detail: { event: eventName, detail } }));
  } catch (e) {
    console.warn('Event dispatch notice:', e);
  }
}

export const StorageService = {
  // CONFIG
  getConfig(): StoreConfig {
    try {
      const stored = safeGetItem(KEYS.CONFIG);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.googleClientId && initialStoreConfig.googleClientId) {
          parsed.googleClientId = initialStoreConfig.googleClientId;
        }
        memoryCache[KEYS.CONFIG] = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse stored store config', e);
    }
    if (memoryCache[KEYS.CONFIG]) return memoryCache[KEYS.CONFIG];
    this.saveConfig(initialStoreConfig);
    return initialStoreConfig;
  },

  saveConfig(config: StoreConfig): void {
    try {
      const configWithTimestamp: StoreConfig = {
        ...config,
        updatedAt: config.updatedAt || new Date().toISOString()
      };
      memoryCache[KEYS.CONFIG] = configWithTimestamp;
      safeSetItem(KEYS.CONFIG, JSON.stringify(configWithTimestamp));
      broadcastStorageEvent('aura_config_updated', configWithTimestamp);
      // Background Sync to Firebase Firestore
      FirestoreSyncService.saveConfig(configWithTimestamp).catch(err => {
        console.warn('Background Firestore config sync notice:', err);
      });
    } catch (e) {
      console.error('Failed to save config', e);
    }
  },

  // PRODUCTS
  getProducts(): Product[] {
    try {
      const stored = safeGetItem(KEYS.PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCache[KEYS.PRODUCTS] = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored products', e);
    }
    if (memoryCache[KEYS.PRODUCTS] && memoryCache[KEYS.PRODUCTS].length > 0) {
      return memoryCache[KEYS.PRODUCTS];
    }
    this.saveProducts(initialProducts);
    return initialProducts;
  },

  saveProducts(products: Product[]): void {
    try {
      const now = new Date().toISOString();
      const updatedProducts = products.map(p => ({
        ...p,
        category: p.category || 'Tops',
        price: Number(p.price) >= 0 ? Number(p.price) : 0,
        stock: Number(p.stock) >= 0 ? Number(p.stock) : 0,
        sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['One Size'],
        updatedAt: p.updatedAt || now
      }));
      memoryCache[KEYS.PRODUCTS] = updatedProducts;
      safeSetItem(KEYS.PRODUCTS, JSON.stringify(updatedProducts));
      broadcastStorageEvent('aura_products_updated', updatedProducts);
      // Background Sync to Firebase Firestore
      FirestoreSyncService.saveAllProducts(updatedProducts).catch(err => {
        console.warn('Background Firestore products sync notice:', err);
      });
    } catch (e) {
      console.error('Failed to save products', e);
    }
  },

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const now = new Date().toISOString();
    const productWithTimestamp: Product = {
      ...product,
      category: product.category || 'Tops',
      price: Number(product.price) >= 0 ? Number(product.price) : 0,
      stock: Number(product.stock) >= 0 ? Number(product.stock) : 0,
      sizes: Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['One Size'],
      updatedAt: now
    };
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = productWithTimestamp;
    } else {
      products.unshift(productWithTimestamp);
    }
    this.saveProducts(products);
    FirestoreSyncService.saveProduct(productWithTimestamp).catch(err => {
      console.warn('Background Firestore single product sync notice:', err);
    });
  },

  deleteProduct(productId: string): void {
    const products = this.getProducts().filter(p => p.id !== productId);
    this.saveProducts(products);
    FirestoreSyncService.deleteProduct(productId).catch(err => {
      console.warn('Background Firestore delete product notice:', err);
    });
  },

  decrementStock(items: { productId: string; quantity: number }[]): void {
    const products = this.getProducts();
    items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
        p.updatedAt = new Date().toISOString();
      }
    });
    this.saveProducts(products);
  },

  // ORDERS
  getOrders(): Order[] {
    try {
      const stored = safeGetItem(KEYS.ORDERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          memoryCache[KEYS.ORDERS] = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load orders', e);
    }
    if (memoryCache[KEYS.ORDERS]) return memoryCache[KEYS.ORDERS];
    this.saveOrders(initialOrders);
    return initialOrders;
  },

  saveOrders(orders: Order[]): void {
    try {
      memoryCache[KEYS.ORDERS] = orders;
      safeSetItem(KEYS.ORDERS, JSON.stringify(orders));
      broadcastStorageEvent('aura_orders_updated', orders);
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  },

  createOrder(orderData: Order | Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...orderData,
      id: 'id' in orderData ? orderData.id : `ord-${Date.now()}`,
      orderNumber: 'orderNumber' in orderData ? orderData.orderNumber : `AUR-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: 'createdAt' in orderData ? orderData.createdAt : new Date().toISOString(),
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    this.decrementStock(newOrder.items);
    FirestoreSyncService.saveOrder(newOrder).catch(err => {
      console.warn('Background Firestore order sync notice:', err);
    });
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string): void {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (trackingNumber !== undefined) {
        order.trackingNumber = trackingNumber;
      }
      this.saveOrders(orders);
      FirestoreSyncService.updateOrderStatus(orderId, status, trackingNumber).catch(err => {
        console.warn('Background Firestore order status sync notice:', err);
      });
    }
  },

  // COUPONS
  getCoupons(): Coupon[] {
    try {
      const stored = safeGetItem(KEYS.COUPONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load coupons', e);
    }
    this.saveCoupons(initialCoupons);
    return initialCoupons;
  },

  saveCoupons(coupons: Coupon[]): void {
    try {
      memoryCache[KEYS.COUPONS] = coupons;
      safeSetItem(KEYS.COUPONS, JSON.stringify(coupons));
      broadcastStorageEvent('aura_coupons_updated', coupons);
    } catch (e) {
      console.error('Failed to save coupons', e);
    }
  },

  saveCoupon(coupon: Coupon): void {
    const coupons = this.getCoupons();
    const index = coupons.findIndex((c) => c.id === coupon.id);
    if (index >= 0) {
      coupons[index] = coupon;
    } else {
      coupons.push(coupon);
    }
    this.saveCoupons(coupons);
  },

  deleteCoupon(id: string): void {
    const coupons = this.getCoupons().filter((c) => c.id !== id);
    this.saveCoupons(coupons);
  },

  // CUSTOMER / AUTH
  getCurrentCustomer(): Customer | null {
    try {
      const stored = safeGetItem(KEYS.CURRENT_USER);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load current customer', e);
    }
    return null;
  },

  saveCurrentCustomer(customer: Customer | null): void {
    try {
      if (customer) {
        safeSetItem(KEYS.CURRENT_USER, JSON.stringify(customer));
        // Also update in all customers list
        const all = this.getAllCustomers();
        const idx = all.findIndex(c => c.id === customer.id);
        if (idx >= 0) all[idx] = customer;
        else all.push(customer);
        safeSetItem(KEYS.CUSTOMERS, JSON.stringify(all));
      } else {
        localStorage.removeItem(KEYS.CURRENT_USER);
      }
      broadcastStorageEvent('aura_customer_updated', customer);
    } catch (e) {
      console.error('Failed to save customer', e);
    }
  },

  getAllCustomers(): Customer[] {
    try {
      const stored = safeGetItem(KEYS.CUSTOMERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load all customers', e);
    }
    return [];
  },

  // WISHLIST
  getWishlist(): string[] {
    const customer = this.getCurrentCustomer();
    if (customer && customer.wishlist) return customer.wishlist;
    try {
      const stored = safeGetItem(KEYS.WISHLIST);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load wishlist', e);
    }
    return [];
  },

  toggleWishlist(productId: string): string[] {
    const current = this.getWishlist();
    const updated = current.includes(productId)
      ? current.filter(id => id !== productId)
      : [...current, productId];

    safeSetItem(KEYS.WISHLIST, JSON.stringify(updated));
    const customer = this.getCurrentCustomer();
    if (customer) {
      customer.wishlist = updated;
      this.saveCurrentCustomer(customer);
    }
    broadcastStorageEvent('aura_wishlist_updated', updated);
    return updated;
  },

  // CART PERSISTENCE
  getCart(): CartItem[] {
    try {
      const stored = safeGetItem(KEYS.CART);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load cart', e);
    }
    if (memoryCache[KEYS.CART]) return memoryCache[KEYS.CART];
    return [];
  },

  saveCart(cart: CartItem[]): void {
    try {
      memoryCache[KEYS.CART] = cart;
      safeSetItem(KEYS.CART, JSON.stringify(cart));
      broadcastStorageEvent('aura_cart_updated', cart);
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  },

  // ADMIN AUTH STATE
  isAdminAuthenticated(): boolean {
    try {
      return sessionStorage.getItem(KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  },

  setAdminAuthenticated(auth: boolean): void {
    try {
      if (auth) {
        sessionStorage.setItem(KEYS.ADMIN_AUTH, 'true');
      } else {
        sessionStorage.removeItem(KEYS.ADMIN_AUTH);
      }
    } catch (e) {
      console.warn('SessionStorage notice:', e);
    }
    broadcastStorageEvent('aura_admin_auth_changed', auth);
  },

  // DATABASE BACKUP & RESTORE
  exportFullBackup(): string {
    const data = {
      config: this.getConfig(),
      products: this.getProducts(),
      orders: this.getOrders(),
      coupons: this.getCoupons(),
      customers: this.getAllCustomers(),
      version: '2.5.0 (Resilient Synchronized)',
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  },

  exportFullDatabase(): string {
    return this.exportFullBackup();
  },

  importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.config) this.saveConfig(data.config);
      if (data.products && Array.isArray(data.products)) this.saveProducts(data.products);
      if (data.orders && Array.isArray(data.orders)) this.saveOrders(data.orders);
      if (data.coupons && Array.isArray(data.coupons)) this.saveCoupons(data.coupons);
      if (data.customers && Array.isArray(data.customers)) safeSetItem(KEYS.CUSTOMERS, JSON.stringify(data.customers));
      return true;
    } catch (e) {
      console.error('Failed to parse backup', e);
      return false;
    }
  },

  importFullDatabase(jsonString: string): boolean {
    return this.importFullBackup(jsonString);
  },

  resetToDefaultDemo(): void {
    try {
      localStorage.removeItem(KEYS.CONFIG);
      localStorage.removeItem(KEYS.PRODUCTS);
      localStorage.removeItem(KEYS.COUPONS);
      localStorage.removeItem(KEYS.ORDERS);
      localStorage.removeItem(KEYS.CART);
      localStorage.removeItem(KEYS.WISHLIST);
    } catch (e) {
      console.warn(e);
    }
    this.saveConfig(initialStoreConfig);
    this.saveProducts(initialProducts);
    this.saveCoupons(initialCoupons);
    this.saveOrders(initialOrders);
  },

  resetToDefaults(): void {
    this.resetToDefaultDemo();
  },

  // Helper Cart Methods
  addToCart(product: Product, size: string, quantity = 1): CartItem[] {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === size
    );
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ product, selectedSize: size, quantity });
    }
    this.saveCart(cart);
    return cart;
  },

  updateCartQuantity(productId: string, size: string, delta: number): CartItem[] {
    let cart = this.getCart();
    const existingIndex = cart.findIndex(
      (item) => item.product.id === productId && item.selectedSize === size
    );
    if (existingIndex >= 0) {
      const newQty = cart[existingIndex].quantity + delta;
      if (newQty <= 0) {
        cart = cart.filter((_, idx) => idx !== existingIndex);
      } else {
        cart[existingIndex].quantity = newQty;
      }
    }
    this.saveCart(cart);
    return cart;
  },

  removeFromCart(productId: string, size: string): CartItem[] {
    const cart = this.getCart().filter(
      (item) => !(item.product.id === productId && item.selectedSize === size)
    );
    this.saveCart(cart);
    return cart;
  },

  validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; message: string } {
    const coupons = this.getCoupons();
    const cleanCode = code.toUpperCase().trim();
    const coupon = coupons.find((c) => c.code === cleanCode && c.isActive);
    if (!coupon) {
      return { valid: false, message: 'Invalid or expired coupon code.' };
    }
    if (subtotal < coupon.minSpend) {
      return { valid: false, message: `Minimum spend of $${coupon.minSpend} required for this coupon.` };
    }
    return { valid: true, coupon, message: 'Coupon applied successfully!' };
  },

  getCustomers(): Customer[] {
    return this.getAllCustomers();
  },

  saveCustomer(customer: Customer): void {
    const all = this.getAllCustomers();
    const idx = all.findIndex((c) => c.id === customer.id);
    if (idx >= 0) all[idx] = customer;
    else all.push(customer);
    safeSetItem(KEYS.CUSTOMERS, JSON.stringify(all));
  },

  setCurrentCustomer(customer: Customer | null): void {
    this.saveCurrentCustomer(customer);
  }
};

export const storageService = StorageService;
