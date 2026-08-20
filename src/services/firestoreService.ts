import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
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

// Initialize Firestore with custom database ID if specified in config
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const STORE_CONFIG_DOC = 'config';
const STORE_COLLECTION = 'store';
const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';

export class FirestoreSyncService {
  private static isInitialized = false;

  // Initialize and ensure default documents exist in Firestore
  static async initDefaults(): Promise<void> {
    if (this.isInitialized) return;
    try {
      // Check if store config exists
      const configRef = doc(db, STORE_COLLECTION, STORE_CONFIG_DOC);
      const configSnap = await getDoc(configRef);
      if (!configSnap.exists()) {
        await setDoc(configRef, {
          ...initialStoreConfig,
          updatedAt: new Date().toISOString()
        });
      }

      // Check if products exist
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const productsSnap = await getDocs(productsRef);
      if (productsSnap.empty && initialProducts.length > 0) {
        for (const product of initialProducts) {
          const pDoc = doc(db, PRODUCTS_COLLECTION, product.id);
          await setDoc(pDoc, product);
        }
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('Firestore initial sync note:', error);
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
      console.warn('Firestore config subscription error:', error);
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
      console.warn('Error getting store config from Firestore:', error);
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
      console.error('Error saving store config to Firestore:', error);
      throw error;
    }
  }

  // Real-time listener for Products
  static subscribeProducts(callback: (products: Product[]) => void): () => void {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(productsRef, (snapshot) => {
      if (!snapshot.empty) {
        const products: Product[] = [];
        snapshot.forEach((d) => {
          products.push(d.data() as Product);
        });
        callback(products);
      }
    }, (error) => {
      console.warn('Firestore products subscription error:', error);
    });
  }

  // Save or update a single product
  static async saveProduct(product: Product): Promise<void> {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
      await setDoc(productRef, product, { merge: true });
    } catch (error) {
      console.error('Error saving product to Firestore:', error);
      throw error;
    }
  }

  // Bulk save all products
  static async saveAllProducts(products: Product[]): Promise<void> {
    try {
      for (const product of products) {
        const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
        await setDoc(productRef, product, { merge: true });
      }
    } catch (error) {
      console.error('Error saving all products to Firestore:', error);
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      await deleteDoc(productRef);
    } catch (error) {
      console.error('Error deleting product from Firestore:', error);
      throw error;
    }
  }

  // Save new Order
  static async saveOrder(order: Order): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, order.id);
      await setDoc(orderRef, order);
    } catch (error) {
      console.error('Error saving order to Firestore:', error);
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(orderRef, { status });
    } catch (error) {
      console.error('Error updating order status in Firestore:', error);
    }
  }
}
