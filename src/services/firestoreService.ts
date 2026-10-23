import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StoreConfig, Product, Order, Customer, Coupon } from '../types';
import { initialStoreConfig, initialProducts } from '../data/initialData';

// Initialize Firebase App instance safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Automatically establish an authorized session if not yet signed in
let authAttemptDone = false;
export function ensureFirebaseAuth(): Promise<void> {
  if (authAttemptDone && auth.currentUser) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      authAttemptDone = true;
      if (user) {
        resolve();
      } else {
        signInAnonymously(auth)
          .then(() => resolve())
          .catch((err: any) => {
            // If Anonymous Sign-in is restricted in Firebase Console, smoothly continue
            if (err?.code !== 'auth/admin-restricted-operation') {
              console.info('Firebase auth note:', err?.message || err);
            }
            resolve();
          });
      }
    });
  });
}
ensureFirebaseAuth().catch(() => {});

// Initialize Firestore with custom database ID if specified in config
function createFirestoreInstance() {
  const dbId = (firebaseConfig as any).firestoreDatabaseId || undefined;
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, dbId);
  } catch {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
}

export const db = createFirestoreInstance();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));

  // Log to diagnostics service if available
  if (typeof window !== 'undefined' && (window as any).firebaseDiagnostics) {
    (window as any).firebaseDiagnostics.recordError(error, operationType, path, {
      userId: currentUser?.uid,
      email: currentUser?.email,
      isAnonymous: currentUser?.isAnonymous
    });
  }
}

// Connection validator per Firebase Skill Guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Cloud Firestore connection established.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration or network status.');
    }
    return false;
  }
}
// Execute test connection probe on startup
testConnection().catch(() => {});

const STORE_CONFIG_DOC = 'config';
const STORE_COLLECTION = 'store';
const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const CUSTOMERS_COLLECTION = 'customers';
const COUPONS_COLLECTION = 'coupons';
const THREAT_LOGS_COLLECTION = 'threat_logs';

export class FirestoreSyncService {
  private static isInitialized = false;

  // Initialize and ensure authentic real documents exist in Firestore
  static async initDefaults(currentLocalConfig?: StoreConfig, currentLocalProducts?: Product[]): Promise<void> {
    if (this.isInitialized) return;
    try {
      await ensureFirebaseAuth();
      
      // Ensure store config is updated with real brand settings
      const configRef = doc(db, STORE_COLLECTION, STORE_CONFIG_DOC);
      const configSnap = await getDoc(configRef);
      if (!configSnap.exists()) {
        const configToSave = currentLocalConfig || initialStoreConfig;
        try {
          await setDoc(configRef, {
            ...configToSave,
            updatedAt: configToSave.updatedAt || new Date().toISOString()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `${STORE_COLLECTION}/${STORE_CONFIG_DOC}`);
        }
      } else {
        const existingData = configSnap.data() as StoreConfig;
        if (existingData.currencySymbol !== '৳' || !existingData.brandName.includes('BISMILLAH')) {
          try {
            await setDoc(configRef, {
              ...existingData,
              brandName: initialStoreConfig.brandName,
              tagline: initialStoreConfig.tagline,
              currencySymbol: '৳',
              currencyCode: 'BDT',
              heroHeadline: initialStoreConfig.heroHeadline,
              heroSubheadline: initialStoreConfig.heroSubheadline,
              announcementText: initialStoreConfig.announcementText,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `${STORE_COLLECTION}/${STORE_CONFIG_DOC}`);
          }
        }
      }

      // Check and populate products
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const productsSnap = await getDocs(productsRef);
      const prodsToSave = (currentLocalProducts && currentLocalProducts.length > 0) 
        ? currentLocalProducts 
        : initialProducts;

      // Seed any missing real products
      for (const product of prodsToSave) {
        const pDoc = doc(db, PRODUCTS_COLLECTION, product.id);
        const pSnap = await getDoc(pDoc);
        if (!pSnap.exists()) {
          try {
            await setDoc(pDoc, {
              ...product,
              updatedAt: product.updatedAt || new Date().toISOString()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `${PRODUCTS_COLLECTION}/${product.id}`);
          }
        }
      }

      // Clean up legacy dummy test products
      const legacyDummyIds = ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-7'];
      for (const oldId of legacyDummyIds) {
        try {
          const oldDoc = doc(db, PRODUCTS_COLLECTION, oldId);
          const oldSnap = await getDoc(oldDoc);
          if (oldSnap.exists()) {
            await deleteDoc(oldDoc);
          }
        } catch (err) {
          // Silent cleanup
        }
      }

      this.isInitialized = true;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, STORE_COLLECTION);
    }
  }

  // --- Real-time Firebase Authentication with Google & Cloud Firestore User Persistence ---

  // Sign in using Google Provider via Firebase Auth popup
  static async signInWithGoogle(): Promise<Customer> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const customer = await this.syncFirebaseUserToCustomer(user);
    return customer;
  }

  // Sign out customer from Firebase Auth
  static async signOutCustomer(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Sign-out note:', error);
    }
  }

  // Map Firebase User to Customer and persist in Cloud Firestore /customers/{uid}
  static async syncFirebaseUserToCustomer(user: FirebaseUser): Promise<Customer> {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, user.uid);
    let customer: Customer;

    try {
      const snap = await getDoc(customerRef);
      if (snap.exists()) {
        const existingData = snap.data() as Customer;
        customer = {
          ...existingData,
          id: user.uid,
          email: user.email?.toLowerCase() || existingData.email,
          name: user.displayName || existingData.name || (user.email ? user.email.split('@')[0] : 'Member'),
          avatar: user.photoURL || existingData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
          updatedAt: new Date().toISOString()
        };
      } else {
        customer = {
          id: user.uid,
          email: (user.email || '').toLowerCase(),
          name: user.displayName || (user.email ? user.email.split('@')[0] : 'Member'),
          avatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
          phone: user.phoneNumber || '+880 1812-345678',
          shippingAddress: {
            street: 'House 14, Road 7, Dhanmondi',
            city: 'Dhaka',
            state: 'Dhaka Division',
            zip: '1205',
            country: 'Bangladesh',
          },
          wishlist: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      // Persist customer record to Cloud Firestore
      await setDoc(customerRef, customer, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${CUSTOMERS_COLLECTION}/${user.uid}`);
      customer = {
        id: user.uid,
        email: (user.email || '').toLowerCase(),
        name: user.displayName || (user.email ? user.email.split('@')[0] : 'Member'),
        avatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
        phone: user.phoneNumber || '+880 1812-345678',
        shippingAddress: {
          street: 'House 14, Road 7, Dhanmondi',
          city: 'Dhaka',
          state: 'Dhaka Division',
          zip: '1205',
          country: 'Bangladesh',
        },
        wishlist: [],
        createdAt: new Date().toISOString()
      };
    }

    return customer;
  }

  // Subscribe to Firebase Auth state changes
  static onAuthStateSync(callback: (customer: Customer | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !firebaseUser.isAnonymous) {
        try {
          const customer = await this.syncFirebaseUserToCustomer(firebaseUser);
          callback(customer);
        } catch (err) {
          console.warn('Error syncing Firebase user to customer profile:', err);
        }
      } else {
        // No non-anonymous user signed in
        callback(null);
      }
    });
  }

  // Real-time listener for Store Config
  static subscribeConfig(callback: (config: StoreConfig) => void): () => void {
    const configRef = doc(db, STORE_COLLECTION, STORE_CONFIG_DOC);
    return onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StoreConfig;
        callback(data);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `${STORE_COLLECTION}/${STORE_CONFIG_DOC}`);
    });
  }

  // Fetch current store config once
  static async getConfig(): Promise<StoreConfig | null> {
    try {
      const configRef = doc(db, STORE_COLLECTION, STORE_CONFIG_DOC);
      const configSnap = await getDoc(configRef);
      if (configSnap.exists()) {
        return configSnap.data() as StoreConfig;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${STORE_COLLECTION}/${STORE_CONFIG_DOC}`);
      return null;
    }
  }

  // Update store config in Firestore
  static async saveConfig(config: StoreConfig): Promise<boolean> {
    try {
      const configRef = doc(db, STORE_COLLECTION, STORE_CONFIG_DOC);
      await setDoc(configRef, {
        ...config,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${STORE_COLLECTION}/${STORE_CONFIG_DOC}`);
      throw error;
    }
  }

  // Real-time listener for Products with automatic deduplication
  static subscribeProducts(callback: (products: Product[]) => void): () => void {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(productsRef, (snapshot) => {
      const rawProducts: Product[] = [];
      snapshot.forEach((d) => {
        const p = d.data() as Product;
        if (p && p.id) {
          rawProducts.push(p);
        }
      });
      // Filter duplicates by unique ID & normalized title
      const seenIds = new Set<string>();
      const seenTitles = new Set<string>();
      const uniqueProducts: Product[] = [];
      for (const p of rawProducts) {
        const idKey = String(p.id).trim().toLowerCase();
        const titleKey = String(p.title || '').trim().toLowerCase();
        if (seenIds.has(idKey)) continue;
        if (titleKey && seenTitles.has(titleKey)) continue;
        seenIds.add(idKey);
        if (titleKey) seenTitles.add(titleKey);
        uniqueProducts.push(p);
      }
      callback(uniqueProducts);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
    });
  }

  // Sanitize product object to prevent Firestore serialization errors (removes undefined, validates types)
  private static sanitizeProductPayload(product: Product): Record<string, any> {
    return {
      id: String(product.id || `prod-${Date.now()}`),
      title: String(product.title || 'Untitled Garment'),
      subtitle: String(product.subtitle || ''),
      category: String(product.category || 'Tops'),
      price: Number(product.price) >= 0 ? Number(product.price) : 0,
      originalPrice: product.originalPrice !== undefined ? Number(product.originalPrice) : Number(product.price || 0),
      image: String(product.image || ''),
      additionalImages: Array.isArray(product.additionalImages) ? product.additionalImages.filter(Boolean) : [],
      sizes: Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['One Size'],
      stock: Number(product.stock) >= 0 ? Number(product.stock) : 0,
      sku: String(product.sku || `AUR-${Date.now().toString().slice(-4)}`),
      rating: Number(product.rating) || 5.0,
      reviewsCount: Number(product.reviewsCount) || 1,
      description: String(product.description || ''),
      material: String(product.material || ''),
      careInstructions: String(product.careInstructions || ''),
      badges: Array.isArray(product.badges) ? product.badges : [],
      featured: Boolean(product.featured),
      createdAt: String(product.createdAt || new Date().toISOString()),
      updatedAt: String(product.updatedAt || new Date().toISOString())
    };
  }

  // Save or update a single product
  static async saveProduct(product: Product): Promise<void> {
    try {
      const sanitized = this.sanitizeProductPayload(product);
      const productRef = doc(db, PRODUCTS_COLLECTION, sanitized.id);
      await setDoc(productRef, sanitized, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COLLECTION}/${product.id}`);
      throw error;
    }
  }

  // Bulk save all products
  static async saveAllProducts(products: Product[]): Promise<void> {
    try {
      for (const product of products) {
        const sanitized = this.sanitizeProductPayload(product);
        const productRef = doc(db, PRODUCTS_COLLECTION, sanitized.id);
        await setDoc(productRef, sanitized, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      await deleteDoc(productRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${productId}`);
      throw error;
    }
  }

  // Real-time listener for Orders
  static subscribeOrders(callback: (orders: Order[]) => void): () => void {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    return onSnapshot(ordersRef, (snapshot) => {
      if (!snapshot.empty) {
        const orders: Order[] = [];
        snapshot.forEach((d) => {
          orders.push(d.data() as Order);
        });
        // Sort descending by createdAt
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(orders);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
    });
  }

  // Save new Order
  static async saveOrder(order: Order): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, order.id);
      await setDoc(orderRef, order);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${ORDERS_COLLECTION}/${order.id}`);
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string, trackingNumber?: string): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      const updateData: Record<string, any> = { status };
      if (trackingNumber !== undefined) {
        updateData.trackingNumber = trackingNumber;
      }
      await updateDoc(orderRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
    }
  }

  // Real-time listener for Customers
  static subscribeCustomers(callback: (customers: Customer[]) => void): () => void {
    const customersRef = collection(db, CUSTOMERS_COLLECTION);
    return onSnapshot(customersRef, (snapshot) => {
      if (!snapshot.empty) {
        const customers: Customer[] = [];
        snapshot.forEach((d) => {
          customers.push(d.data() as Customer);
        });
        callback(customers);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, CUSTOMERS_COLLECTION);
    });
  }

  // Save Customer Profile directly to Cloud Firestore /customers/{id}
  static async saveCustomer(customer: Customer): Promise<void> {
    try {
      const customerRef = doc(db, CUSTOMERS_COLLECTION, customer.id);
      await setDoc(customerRef, {
        ...customer,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${CUSTOMERS_COLLECTION}/${customer.id}`);
    }
  }

  // Real-time listener for Coupons
  static subscribeCoupons(callback: (coupons: Coupon[]) => void): () => void {
    const couponsRef = collection(db, COUPONS_COLLECTION);
    return onSnapshot(couponsRef, (snapshot) => {
      if (!snapshot.empty) {
        const coupons: Coupon[] = [];
        snapshot.forEach((d) => {
          coupons.push(d.data() as Coupon);
        });
        callback(coupons);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, COUPONS_COLLECTION);
    });
  }

  // Save Coupons
  static async saveCoupon(coupon: Coupon): Promise<void> {
    try {
      const couponRef = doc(db, COUPONS_COLLECTION, coupon.id);
      await setDoc(couponRef, coupon, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${COUPONS_COLLECTION}/${coupon.id}`);
    }
  }

  // Delete Coupon
  static async deleteCoupon(couponId: string): Promise<void> {
    try {
      const couponRef = doc(db, COUPONS_COLLECTION, couponId);
      await deleteDoc(couponRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COUPONS_COLLECTION}/${couponId}`);
    }
  }

  // Real-time listener for Threat Logs
  static subscribeThreatLogs(callback: (logs: any[]) => void): () => void {
    const logsRef = collection(db, THREAT_LOGS_COLLECTION);
    return onSnapshot(logsRef, (snapshot) => {
      if (!snapshot.empty) {
        const logs: any[] = [];
        snapshot.forEach((d) => {
          logs.push(d.data());
        });
        logs.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
        callback(logs);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, THREAT_LOGS_COLLECTION);
    });
  }

  // Save Threat Log
  static async saveThreatLog(log: any): Promise<void> {
    try {
      const logRef = doc(db, THREAT_LOGS_COLLECTION, log.id || `log-${Date.now()}`);
      await setDoc(logRef, log, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${THREAT_LOGS_COLLECTION}/${log.id}`);
    }
  }
}
