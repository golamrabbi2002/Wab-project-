import { Product, StoreConfig, Coupon, Order, Customer, CartItem } from '../types';
import { initialStoreConfig, initialProducts, initialCoupons, initialOrders } from '../data/initialData';

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

export const StorageService = {
  // CONFIG
  getConfig(): StoreConfig {
    try {
      const stored = localStorage.getItem(KEYS.CONFIG);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.googleClientId && initialStoreConfig.googleClientId) {
          parsed.googleClientId = initialStoreConfig.googleClientId;
          this.saveConfig(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load store config', e);
    }
    this.saveConfig(initialStoreConfig);
    return initialStoreConfig;
  },

  saveConfig(config: StoreConfig): void {
    try {
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('aura_config_updated', { detail: config }));
    } catch (e) {
      console.error('Failed to save config', e);
    }
  },

  // PRODUCTS
  getProducts(): Product[] {
    try {
      const stored = localStorage.getItem(KEYS.PRODUCTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load products', e);
    }
    this.saveProducts(initialProducts);
    return initialProducts;
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('aura_products_updated', { detail: products }));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  },

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    this.saveProducts(products);
  },

  deleteProduct(productId: string): void {
    const products = this.getProducts().filter(p => p.id !== productId);
    this.saveProducts(products);
  },

  decrementStock(items: { productId: string; quantity: number }[]): void {
    const products = this.getProducts();
    items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    });
    this.saveProducts(products);
  },

  // ORDERS
  getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(KEYS.ORDERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load orders', e);
    }
    this.saveOrders(initialOrders);
    return initialOrders;
  },

  saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
      window.dispatchEvent(new CustomEvent('aura_orders_updated', { detail: orders }));
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
    }
  },

  // COUPONS
  getCoupons(): Coupon[] {
    try {
      const stored = localStorage.getItem(KEYS.COUPONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load coupons', e);
    }
    this.saveCoupons(initialCoupons);
    return initialCoupons;
  },

  saveCoupons(coupons: Coupon[]): void {
    try {
      localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));
      window.dispatchEvent(new CustomEvent('aura_coupons_updated', { detail: coupons }));
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
      const stored = localStorage.getItem(KEYS.CURRENT_USER);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load current customer', e);
    }
    return null;
  },

  saveCurrentCustomer(customer: Customer | null): void {
    try {
      if (customer) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(customer));
        // Also update in all customers list
        const all = this.getAllCustomers();
        const idx = all.findIndex(c => c.id === customer.id);
        if (idx >= 0) all[idx] = customer;
        else all.push(customer);
        localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(all));
      } else {
        localStorage.removeItem(KEYS.CURRENT_USER);
      }
      window.dispatchEvent(new CustomEvent('aura_customer_updated', { detail: customer }));
    } catch (e) {
      console.error('Failed to save customer', e);
    }
  },

  getAllCustomers(): Customer[] {
    try {
      const stored = localStorage.getItem(KEYS.CUSTOMERS);
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
      const stored = localStorage.getItem(KEYS.WISHLIST);
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

    localStorage.setItem(KEYS.WISHLIST, JSON.stringify(updated));
    const customer = this.getCurrentCustomer();
    if (customer) {
      customer.wishlist = updated;
      this.saveCurrentCustomer(customer);
    }
    window.dispatchEvent(new CustomEvent('aura_wishlist_updated', { detail: updated }));
    return updated;
  },

  // CART PERSISTENCE
  getCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(KEYS.CART);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load cart', e);
    }
    return [];
  },

  saveCart(cart: CartItem[]): void {
    try {
      localStorage.setItem(KEYS.CART, JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('aura_cart_updated', { detail: cart }));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  },

  // ADMIN AUTH STATE
  isAdminAuthenticated(): boolean {
    return sessionStorage.getItem(KEYS.ADMIN_AUTH) === 'true';
  },

  setAdminAuthenticated(auth: boolean): void {
    if (auth) {
      sessionStorage.setItem(KEYS.ADMIN_AUTH, 'true');
    } else {
      sessionStorage.removeItem(KEYS.ADMIN_AUTH);
    }
    window.dispatchEvent(new CustomEvent('aura_admin_auth_changed', { detail: auth }));
  },

  // DATABASE BACKUP & RESTORE
  exportFullBackup(): string {
    const data = {
      config: this.getConfig(),
      products: this.getProducts(),
      orders: this.getOrders(),
      coupons: this.getCoupons(),
      customers: this.getAllCustomers(),
      version: '1.0.0',
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
      if (data.products) this.saveProducts(data.products);
      if (data.orders) this.saveOrders(data.orders);
      if (data.coupons) this.saveCoupons(data.coupons);
      if (data.customers) localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(data.customers));
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
    localStorage.removeItem(KEYS.CONFIG);
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.COUPONS);
    localStorage.removeItem(KEYS.ORDERS);
    localStorage.removeItem(KEYS.CART);
    localStorage.removeItem(KEYS.WISHLIST);
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
      (item) => item.product.id === product.id && item.size === size
    );
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ product, size, quantity });
    }
    this.saveCart(cart);
    return cart;
  },

  updateCartQuantity(productId: string, size: string, delta: number): CartItem[] {
    let cart = this.getCart();
    const existingIndex = cart.findIndex(
      (item) => item.product.id === productId && item.size === size
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
      (item) => !(item.product.id === productId && item.size === size)
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
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(all));
  },

  setCurrentCustomer(customer: Customer | null): void {
    this.saveCurrentCustomer(customer);
  }
};

export const storageService = StorageService;
