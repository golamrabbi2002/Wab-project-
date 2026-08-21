export interface Product {
  id: string;
  title: string;
  subtitle: string;
  category: 'Tops' | 'Bottoms' | 'Outerwear' | 'Dresses' | 'Accessories' | 'Footwear';
  price: number;
  originalPrice?: number;
  image: string; // Base64 or curated SVG/Data-URL
  additionalImages?: string[];
  sizes: string[];
  stock: number;
  sku: string;
  rating: number;
  reviewsCount: number;
  description: string;
  material: string;
  careInstructions: string;
  badges?: ('New' | 'Sale' | 'Bestseller' | 'Limited')[];
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  wishlist: string[]; // Product IDs
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  transactionId?: string;
  deliveryZone?: string;
  trackingNumber?: string;
  createdAt: string;
  notes?: string;
}

export interface StoreConfig {
  brandName: string;
  tagline: string;
  logoText: string;
  logoImage?: string; // Base64
  heroHeadline: string;
  heroSubheadline: string;
  heroImage?: string; // Base64 or curated visual
  announcementText: string;
  showAnnouncement: boolean;
  currencySymbol: string; // e.g. ৳ or $ or €
  currencyCode?: string; // e.g. BDT, USD, EUR
  taxRate: number; // e.g. 0.05 for 5%
  freeShippingThreshold: number; // e.g. 3000 in BDT or 150 in USD
  contactEmail: string;
  contactPhone: string;
  studioAddress: string;
  shippingPolicy: string;
  returnPolicy: string;
  privacyPolicy: string;
  termsOfService: string;
  adminPin: string;
  // Google OAuth Developer Client ID
  googleClientId?: string;
  // Google Drive & Google Sheets Live Integration
  googleSheetUrl?: string;
  googleDriveFolderUrl?: string;
  autoSyncGoogleSheets?: boolean;
  autoSyncGoogleDrive?: boolean;
  // Bangladesh & Global Delivery and Payment Settings
  deliveryDhakaCity?: number;
  deliveryOutsideDhaka?: number;
  bkashMerchantNumber?: string;
  nagadMerchantNumber?: string;
  rocketMerchantNumber?: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number; // e.g., 20 for 20%
  discountFixed?: number; // e.g., 15 for $15
  minSpend: number;
  description: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export type ThreatRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface HoneypotIntrusionLog {
  id: string;
  timestamp: string; // ISO format
  trapType:
    | 'Fake Root Terminal'
    | 'Vulnerable DB Backup'
    | 'SQL Injection Sandbox'
    | 'WP-Admin Emulation'
    | 'API Debug Leak'
    | 'Config Dump Probe'
    | 'Hidden Canary Crawler';
  path: string;
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  isp: string;
  org: string;
  timezone: string;
  device: {
    browser: string;
    os: string;
    screen: string;
    language: string;
    hardwareConcurrency: number;
    deviceMemory?: number;
    touchSupport: boolean;
    webglRenderer?: string;
    canvasFingerprint?: string;
    audioFingerprint?: string;
    webrtcCandidateIps?: string[];
  };
  vpnTorDetection: {
    isVpnOrProxy: boolean;
    isTor: boolean;
    confidenceScore: number; // 0 - 100%
    timezoneMismatch: boolean;
    webrtcLeakDetected: boolean;
    reasons: string[];
  };
  payload: {
    usernameAttempted?: string;
    passwordAttempted?: string;
    injectedCommands?: string;
    queryParameters?: Record<string, string>;
    headers?: Record<string, string>;
  };
  emailAlertSent: boolean;
  alertRecipient?: string;
  riskLevel: ThreatRiskLevel;
  status: 'Intercepted' | 'Quarantined' | 'Simulated';
}
