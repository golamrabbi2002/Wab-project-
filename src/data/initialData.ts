import { Product, StoreConfig, Coupon, Order } from '../types';
import { hundredRealisticProducts } from './hundredProducts';

// High-fidelity curated brand settings
export const initialStoreConfig: StoreConfig = {
  brandName: 'BISMILLAH COLLECTION',
  tagline: 'এক্সক্লুসিভ লাইফস্টাইল ও প্রিমিয়াম ফ্যাশন কালেকশন',
  logoText: 'BISMILLAH',
  logoImage: '',
  heroHeadline: 'EXCLUSIVE EID & FESTIVE ATELIER 2026',
  heroSubheadline: 'অভিজাত রাজকীয় কাতান ও জ্যাকার্ড পাঞ্জাবি, পিওর সিল্ক ও জামদানি শাড়ি, ডিজাইনার পার্টি থ্রি-পিস ও প্রিমিয়াম ক্যাজুয়াল কালেকশন। সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি ও দ্রুততম হোম ডেলিভারি।',
  heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
  announcementText: '✨ সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা • ৩০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি! • কুপন কোড: BISMILLAH10',
  showAnnouncement: true,
  currencySymbol: '৳',
  currencyCode: 'BDT',
  taxRate: 0.0,
  freeShippingThreshold: 3000,
  deliveryDhakaCity: 70,
  deliveryOutsideDhaka: 130,
  bkashMerchantNumber: '01712-345678',
  nagadMerchantNumber: '01812-345678',
  rocketMerchantNumber: '01912-345678',
  contactEmail: 'golamrabbi4801@gmail.com',
  contactPhone: '+880 1712-345678',
  studioAddress: 'হাউস ১৪, রোড ৭, ধানমন্ডি, ঢাকা ১২০৫, বাংলাদেশ',
  shippingPolicy: 'ঢাকার ভেতরে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২-৩ কর্মদিবসের মধ্যে নির্ভরযোগ্য কুরিয়ারে ক্যাশ অন ডেলিভারিতে হোম ডেলিভারি পৌঁছে দেওয়া হয়।',
  returnPolicy: 'ডেলিভারি ম্যানের উপস্থিতিতে পণ্য পরীক্ষা করে নেওয়ার পূর্ণ স্বাধীনতা রয়েছে। সাইজ বা কালার সংক্রান্ত প্রয়োজনে ৭ দিনের মধ্যে সহজ এক্সচেঞ্জ সুবিধা প্রযোজ্য।',
  privacyPolicy: 'গ্রাহকের সমস্ত নাম, ফোন নম্বর ও ডেলিভারি তথ্য এনক্রিপ্টেড এবং সম্পূর্ণ নিরাপদ রাখা হয়।',
  termsOfService: 'বিসমিল্লাহ কালেকশনের প্রতিটি পোশাক শতভাগ আসল ফেব্রিক ও নিখুঁত ফিনিশিং নিশ্চিত করে সরবরাহ করা হয়।',
  adminPin: 'admin123',
  googleClientId: '461741220295-rqq6hdsnrijiopvkc8j2g6j39ch0h33o.apps.googleusercontent.com',
  storefrontTheme: 'amazon'
};

// Exactly 100 realistic Bangladeshi e-commerce demo products
export const initialProducts: Product[] = hundredRealisticProducts;

export const initialCoupons: Coupon[] = [
  {
    id: 'cpn-bismillah10',
    code: 'BISMILLAH10',
    discountPercent: 10,
    minSpend: 1500,
    description: '১০% ইনস্ট্যান্ট ছাড় (১৫০০ টাকার ওপর যে কোনো অর্ডারে)',
    isActive: true
  },
  {
    id: 'cpn-eid20',
    code: 'EID20',
    discountPercent: 20,
    minSpend: 3000,
    description: '২০% মেগা ডিসকাউন্ট (৩০০০ টাকার ওপর ফেস্টিভ কালেকশনে)',
    isActive: true
  },
  {
    id: 'cpn-luxury500',
    code: 'LUXURY500',
    discountPercent: 0,
    discountFixed: 500,
    minSpend: 4000,
    description: '৳৫০০ ফ্লাট ছাড় (৪০০০ টাকার বেশি শপিংয়ে)',
    isActive: true
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'BIS-2026-1001',
    customerId: 'cust-real-101',
    customerName: 'তানজিম আহমেদ',
    customerEmail: 'tanzim.ahmed@gmail.com',
    customerPhone: '+880 1712-445566',
    shippingAddress: {
      street: 'হাউজ ২৪, রোড ৩, বনানী',
      city: 'ঢাকা',
      state: 'ঢাকা বিভাগ',
      zip: '১২১৩',
      country: 'বাংলাদেশ'
    },
    items: [
      {
        productId: 'prod-panjabi-01',
        title: 'রয়্যাল জ্যাকার্ড এমব্রয়ডারি কাবলি পাঞ্জাবি',
        size: '42',
        price: 3250,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop'
      }
    ],
    subtotal: 3250,
    discount: 325,
    couponCode: 'BISMILLAH10',
    tax: 0,
    shippingCost: 0,
    total: 2925,
    status: 'Shipped',
    paymentMethod: 'ক্যাশ অন ডেলিভারি (Cash on Delivery)',
    trackingNumber: 'STEADFAST-DH-84920',
    courierPartner: 'Steadfast Courier',
    currentLocationName: 'বনানী হাব, ঢাকা',
    estimatedDeliveryDate: '2026-03-05',
    createdAt: '2026-02-18T14:30:00Z',
    notes: 'কল দিয়ে ডেলিভারি করার জন্য অনুরোধ করা হয়েছে।'
  },
  {
    id: 'ord-102',
    orderNumber: 'BIS-2026-1002',
    customerId: 'cust-real-102',
    customerName: 'নুসরাত জাহান',
    customerEmail: 'nusrat.jahan@gmail.com',
    customerPhone: '+880 1819-778899',
    shippingAddress: {
      street: 'ফ্ল্যাট ৪বি, ধানমন্ডি লেকভিউ',
      city: 'ঢাকা',
      state: 'ঢাকা বিভাগ',
      zip: '১২০৫',
      country: 'বাংলাদেশ'
    },
    items: [
      {
        productId: 'prod-saree-01',
        title: 'ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি (গোল্ডেন জরি মোটিফ)',
        size: '১২ হাত বহর (ব্লাউজ পিস সহ)',
        price: 4950,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'
      }
    ],
    subtotal: 4950,
    discount: 990,
    couponCode: 'EID20',
    tax: 0,
    shippingCost: 0,
    total: 3960,
    status: 'Processing',
    paymentMethod: 'বিকাশ পেমেন্ট (bKash Verified)',
    trackingNumber: 'REDX-DH-19827',
    courierPartner: 'REDX Logistics',
    currentLocationName: 'সেন্ট্রাল সর্টিং ওয়্যারহাউজ, তেজগাঁও',
    estimatedDeliveryDate: '2026-03-06',
    createdAt: '2026-02-22T10:15:00Z'
  }
];
