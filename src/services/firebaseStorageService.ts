import { getStorage, ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import { app } from './firestoreService';
import firebaseConfig from '../../firebase-applet-config.json';
import { ImageOptimizer } from '../utils/imageOptimizer';

// Initialize Firebase Cloud Storage with bucket from config
export const storage = getStorage(
  app,
  firebaseConfig.storageBucket || 'smartcommerce-os.firebasestorage.app'
);

export interface StorageUploadResult {
  url: string;
  isCloudStorage: boolean;
  sizeKb: number;
  error?: string;
}

export class FirebaseStorageService {
  /**
   * Upload an image File or Blob directly to Firebase Cloud Storage.
   * If Cloud Storage succeeds, returns public HTTPS download URL.
   * If Cloud Storage fails (e.g. rules/permissions), safely falls back to high-compression WebP Base64 (<60KB).
   */
  static async uploadProductImage(
    file: File | Blob,
    filenamePrefix = 'prod'
  ): Promise<StorageUploadResult> {
    const timestamp = Date.now();
    const cleanPrefix = filenamePrefix.replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `products/${cleanPrefix}_${timestamp}.webp`;

    try {
      // 1. Optimize image before upload to reduce bandwidth & storage
      const optimized = await ImageOptimizer.optimizeFile(file, 1200, 0.82);
      
      // 2. Attempt Firebase Storage upload
      try {
        const storageRef = ref(storage, storagePath);
        // Upload data URL directly
        await uploadString(storageRef, optimized.base64, 'data_url', {
          contentType: optimized.format || 'image/webp',
          customMetadata: {
            uploadedAt: new Date().toISOString(),
            app: 'Bismillah Collection'
          }
        });

        // 3. Obtain permanent public download URL
        const downloadUrl = await getDownloadURL(storageRef);
        return {
          url: downloadUrl,
          isCloudStorage: true,
          sizeKb: optimized.sizeKb
        };
      } catch (storageError: any) {
        console.warn('Firebase Cloud Storage upload notice (using optimized fallback):', storageError?.message || storageError);
        
        // Return highly compressed WebP base64 (<60KB) to ensure Firestore document stays tiny
        let fallbackBase64 = optimized.base64;
        let fallbackSize = optimized.sizeKb;
        if (fallbackSize > 80) {
          const ultraCompact = await ImageOptimizer.optimizeFile(file, 800, 0.65);
          fallbackBase64 = ultraCompact.base64;
          fallbackSize = ultraCompact.sizeKb;
        }

        return {
          url: fallbackBase64,
          isCloudStorage: false,
          sizeKb: fallbackSize,
          error: storageError?.message
        };
      }
    } catch (generalError: any) {
      console.error('Image processing failed:', generalError);
      throw generalError;
    }
  }

  /**
   * Upload a Base64 Data URL to Firebase Cloud Storage.
   */
  static async uploadBase64Image(
    base64Data: string,
    filenamePrefix = 'garment'
  ): Promise<StorageUploadResult> {
    if (!base64Data || !base64Data.startsWith('data:image/')) {
      // If it's already an HTTP / HTTPS link (e.g. Unsplash or existing Storage URL), return directly
      return {
        url: base64Data,
        isCloudStorage: base64Data.includes('firebasestorage.googleapis.com'),
        sizeKb: Math.round((base64Data?.length || 0) / 1024)
      };
    }

    const timestamp = Date.now();
    const cleanPrefix = filenamePrefix.replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `products/${cleanPrefix}_${timestamp}.webp`;

    try {
      const storageRef = ref(storage, storagePath);
      await uploadString(storageRef, base64Data, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);
      return {
        url: downloadUrl,
        isCloudStorage: true,
        sizeKb: Math.round((base64Data.length * (3 / 4)) / 1024)
      };
    } catch (err: any) {
      console.warn('Firebase Storage uploadBase64 notice (falling back to inline):', err?.message);
      // Ensure base64 is optimized and small
      const optimized = await ImageOptimizer.optimizeBase64(base64Data, 800, 0.7);
      return {
        url: optimized.base64,
        isCloudStorage: false,
        sizeKb: optimized.sizeKb,
        error: err?.message
      };
    }
  }

  /**
   * Test Firebase Storage bucket connectivity
   */
  static async testStorageConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const testRef = ref(storage, 'diagnostics/test_probe.txt');
      await uploadString(testRef, `Probe timestamp: ${new Date().toISOString()}`, 'raw');
      const url = await getDownloadURL(testRef);
      return {
        success: true,
        message: `Firebase Storage Bucket "${firebaseConfig.storageBucket}" Connected Successfully (${url.slice(0, 40)}...)`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Firebase Storage notice: ${err?.message || 'Storage permission or network restriction'}`
      };
    }
  }
}
