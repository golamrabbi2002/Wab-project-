import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
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
import { StoreConfig, Product, Order } from '../types';
import { initialStoreConfig, initialProducts } from '../data/initialData';

// Initialize Firebase App instance safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Automatically establish an authorized session if not yet signed in
export function ensureFirebaseAuth(): Promise<void> {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve();
      } else {
        signInAnonymously(auth)
          .then(() => resolve())
          .catch((err) => {
            console.warn('Firebase Anonymous Auth fallback notice:', err);
            resolve();
          });
      }
    });
  });
}
ensureFirebaseAuth().catch(console.warn);

// Initialize Firestore with custom database ID if specified in config and force long polling to guarantee connectivity across all environments (Netlify, iframes, proxies)
function createFirestoreInstance() {
  const dbId = firebaseConfig.firestoreDatabaseId || undefined;
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
}

// Connection validator per Firebase Skill Guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore: Client operating in offline mode.');
    }
    return false;
  }
}

const STORE_CONFIG_DOC = 'config';
const STORE_COLLECTION = 'store';
const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

export class FirestoreSyncService {
  private static isInitialized = false;

  // Initialize and ensure default documents exist in Firestore without overwriting local custom data
  static async initDefaults(currentLocalConfig?: StoreConfig, currentLocalProducts?: Product[]): Promise<void> {
    if (this.isInitialized) return;
    try {
      await ensureFirebaseAuth();
      // Check if store config exists
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
      }

      // Check if products exist
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const productsSnap = await getDocs(productsRef);
      if (productsSnap.empty) {
        const prodsToSave = (currentLocalProducts && currentLocalProducts.length > 0) 
          ? currentLocalProducts 
          : initialProducts;
        for (const product of prodsToSave) {
          const pDoc = doc(db, PRODUCTS_COLLECTION, product.id);
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
      this.isInitialized = true;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, STORE_COLLECTION);
    }
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

  // Real-time listener for Products
  static subscribeProducts(callback: (products: Product[]) => void): () => void {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(productsRef, (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((d) => {
        const p = d.data() as Product;
        if (p && p.id) {
          products.push(p);
        }
      });
      callback(products);
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
}
