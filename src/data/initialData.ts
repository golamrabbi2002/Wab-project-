import { Product, StoreConfig, Coupon, Order } from '../types';

// High-fidelity curated fashion imagery and authentic brand settings
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
  googleClientId: '461741220295-rqq6hdsnrijiopvkc8j2g6j39ch0h33o.apps.googleusercontent.com'
};

export const initialProducts: Product[] = [
  {
    id: 'prod-panjabi-royal',
    title: 'রয়্যাল জ্যাকার্ড এমব্রয়ডারি কাবলি পাঞ্জাবি',
    subtitle: 'হ্যান্ডক্রাফটেড মেটালিক বাটন ও প্রিমিয়াম সফট কটন জ্যাকার্ড',
    category: 'Panjabi',
    price: 3250,
    originalPrice: 3850,
    image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['38', '40', '42', '44', '46'],
    stock: 28,
    sku: 'BIS-PANJ-001',
    rating: 4.9,
    reviewsCount: 64,
    description: 'অভিজাত রাজকীয় লুক ও আরামদায়ক কাটিং। সফট জ্যাকার্ড বুনন ও কলার-প্লাকেটে সূক্ষ্ম সুতার এমব্রয়ডারি কারুকাজ করা। উৎসব ও বিশেষ অনুষ্ঠানের জন্য অত্যন্ত মানানসই।',
    material: '১০০% পিওর প্রি-শ্রাঙ্ক প্রিমিয়াম জ্যাকার্ড কটন',
    careInstructions: 'হ্যান্ড ওয়াশ অথবা মাইল্ড ডিটারজেন্ট দিয়ে নরমাল ওয়াশ। উল্টো করে ইস্ত্রি করুন।',
    badges: ['Bestseller', 'Sale'],
    featured: true,
    createdAt: '2026-02-15'
  },
  {
    id: 'prod-saree-jamdani',
    title: 'এক্সক্লুসিভ ঢাকাই মসলিন জামদানি শাড়ি',
    subtitle: 'ঐতিহ্যবাহী বয়ন শিল্পীদের হাতে বোনা জরি সুতার কাজ',
    category: 'Saree',
    price: 5400,
    originalPrice: 6500,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['Free Size (12 হাত + ব্লাউজ পিস)'],
    stock: 14,
    sku: 'BIS-SAR-002',
    rating: 5.0,
    reviewsCount: 42,
    description: 'বাংলার শতবর্ষের ঐতিহ্যকে ধারণ করা নিখুঁত ঢাকাই জামদানি শাড়ি। হালকা ও আরামদায়ক ফেব্রিক্সে অল-ওভার ঐতিহ্যবাহী বুটি ও রানি আঁচল ডিজাইন। ম্যাচিং ব্লাউজ পিস অন্তর্ভুক্ত।',
    material: '৮০ কাউন্ট পিওর মসলিন কটন ও মেটালিক জারি সুতা',
    careInstructions: 'ড্রাই ক্লিন রেকমেন্ডেড। দীর্ঘস্থায়িত্বের জন্য ভাঁজ করে নরম সুতি কাপড়ে পেঁচিয়ে রাখুন।',
    badges: ['Limited', 'New'],
    featured: true,
    createdAt: '2026-02-18'
  },
  {
    id: 'prod-three-piece-organza',
    title: 'ডিজাইনার ফ্লোরাল অর্গানজা পার্টি থ্রি-পিস',
    subtitle: 'ডিজিটাল প্রিন্ট উইথ কাট-ওয়ার্ক দোপাট্টা ও সিল্ক ইনার',
    category: 'Three-Piece',
    price: 4200,
    originalPrice: 4800,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
    stock: 20,
    sku: 'BIS-3PC-003',
    rating: 4.8,
    reviewsCount: 39,
    description: 'আধুনিক ট্রেন্ডি কালার প্যালেট ও আকর্ষণীয় কাট-ওয়ার্ক কাজের বিলাসবহুল পার্টি থ্রি-পিস। ম্যাচিং সালোয়ার, দোপাট্টা ও সফট বাটার সিল্ক ইনার সহ ফুল রেডি সেট।',
    material: 'পিওর প্রিমিয়াম অর্গানজা ডিজিটাল প্রিন্ট ও বাটার সিল্ক বটম',
    careInstructions: 'মাইল্ড ওয়াশ অথবা ড্রাই ক্লিন। স্টিম আয়রন ব্যবহার করুন।',
    badges: ['Bestseller'],
    featured: true,
    createdAt: '2026-02-20'
  },
  {
    id: 'prod-panjabi-minimal',
    title: 'ক্লাসিক সেমি-লং সুতি পাঞ্জাবি (অলিভ গ্রিন)',
    subtitle: 'প্রতিদিনের ব্যবহারের জন্য ব্রিদেবল ও ১০০% আরামদায়ক',
    category: 'Panjabi',
    price: 1850,
    originalPrice: 2200,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['38', '40', '42', '44'],
    stock: 35,
    sku: 'BIS-PANJ-004',
    rating: 4.9,
    reviewsCount: 88,
    description: 'অফিস, জুমা কিংবা ক্যাজুয়াল আড্ডার জন্য পারফেক্ট মিনিমালিস্ট সুতি পাঞ্জাবি। সফট হ্যান্ডফিল ও লং-লাস্টিং কালার ফাস্টনেস গ্যারান্টি।',
    material: '১০০% কম্বড ব্রিদেবল কটন',
    careInstructions: 'মেশিন ওয়াশ কোল্ড। ছায়ায় শুকান।',
    badges: ['Sale'],
    featured: false,
    createdAt: '2026-02-10'
  },
  {
    id: 'prod-shirt-linen',
    title: 'প্রিমিয়াম পিউর লিনেন ক্যাজুয়াল শার্ট',
    subtitle: 'ব্রিদেবল লিনেন ফেব্রিক্সে আরামদায়ক রেগুলার ফিট',
    category: 'Tops',
    price: 2150,
    originalPrice: 2600,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
    stock: 22,
    sku: 'BIS-SHIRT-005',
    rating: 4.8,
    reviewsCount: 51,
    description: 'উষ্ণ আবহাওয়ায় সর্বোচ্চ শীতল অনুভূতি দিতে ফ্রেন্স লিনেন দিয়ে তৈরি এক্সক্লুসিভ ক্যাজুয়াল শার্ট। ফর্মাল ট্রাউজার বা ডেনিমের সাথে চমৎকার মানিয়ে যায়।',
    material: '১০০% ন্যাচারাল ফ্রেন্স ফ্ল্যাক্স লিনেন',
    careInstructions: 'মেশিন ওয়াশ ৩০° সেলসিয়াসে। হালকা ভেজা অবস্থায় ইস্ত্রি করুন।',
    badges: ['New'],
    featured: false,
    createdAt: '2026-02-22'
  },
  {
    id: 'prod-saree-silk',
    title: 'রাজশাহী পিওর সফট সিল্ক কন্ট্রাস্ট শাড়ি',
    subtitle: 'হালকা ওজনের খাঁটি রেশম সিল্ক উইথ গোল্ডেন জরি বর্ডার',
    category: 'Saree',
    price: 4600,
    originalPrice: 5200,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['Free Size (১৪ হাত ব্লাউজ সহ)'],
    stock: 16,
    sku: 'BIS-SAR-006',
    rating: 5.0,
    reviewsCount: 29,
    description: 'ঐতিহাসিক রাজশাহীর প্রাকৃতিক তুত রেশম দিয়ে তৈরি চমৎকার কন্ট্রাস্ট সিল্ক শাড়ি। উৎসবমুখর আভিজাত্য ফুটিয়ে তোলে।',
    material: '১০০% পিওর মালবেরি রাজশাহী রেশম সিল্ক',
    careInstructions: 'ড্রাই ওয়াশ আবশ্যক। সরাসরি রোদে শুকাবেন না।',
    badges: ['Limited'],
    featured: true,
    createdAt: '2026-02-14'
  },
  {
    id: 'prod-trousers-chino',
    title: 'টেইলরড স্ট্রেচ কটন চিনো ট্রাউজার্স',
    subtitle: 'অফিস ও সেমি-ফরমাল ব্যবহারের জন্য স্লিম ট্যাপারড ফিট',
    category: 'Bottoms',
    price: 1950,
    originalPrice: 2350,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['30', '32', '34', '36', '38'],
    stock: 25,
    sku: 'BIS-TR-007',
    rating: 4.8,
    reviewsCount: 46,
    description: 'হালকা স্ট্রেচেবল টুইল কটন দিয়ে তৈরি, যা সারাদিনের ব্যবহারে দেয় সর্বোচ্চ স্বস্তি। ডিপ পকেট ও মজবুত ওয়াইকেকে জিপার ফিনিশিং।',
    material: '৯৮% টুইল কটন, ২% ইলাস্টেন',
    careInstructions: 'উল্টো করে নরমাল ওয়াশ করুন।',
    badges: ['Bestseller'],
    featured: false,
    createdAt: '2026-02-05'
  },
  {
    id: 'prod-acc-wallet',
    title: 'হ্যান্ডক্রাফটেড প্রিমিয়াম লেদার মানিব্যাগ ও কি-চেইন সেট',
    subtitle: 'জেনুইন টপ-গ্রেইন লেদারে আরএফআইডি প্রটেকশন সহ',
    category: 'Accessories',
    price: 1450,
    originalPrice: 1850,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['One Size (গিফট বক্স সহ)'],
    stock: 30,
    sku: 'BIS-ACC-008',
    rating: 4.9,
    reviewsCount: 73,
    description: 'খাঁটি দেশীয় লেদারে তৈরি আকর্ষণীয় বাই-ফোল্ড ওয়ালেট। পর্যাপ্ত কার্ড স্লট, কয়েন পকেট ও আরএফআইডি ব্লকিং প্রযুক্তি সম্পন্ন। বিলাসবহুল উপহারের জন্য আদর্শ।',
    material: '১০০% ফুল-গ্রেইন কাউহাইড লেদার',
    careInstructions: 'লেদার কন্ডিশনার ব্যবহার করুন, পানিতে ভেজাবেন না।',
    badges: ['New', 'Sale'],
    featured: false,
    createdAt: '2026-02-12'
  }
];

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
        productId: 'prod-panjabi-royal',
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
        productId: 'prod-saree-jamdani',
        title: 'এক্সক্লুসিভ ঢাকাই মসলিন জামদানি শাড়ি',
        size: 'Free Size',
        price: 5400,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'
      }
    ],
    subtotal: 5400,
    discount: 1080,
    couponCode: 'EID20',
    tax: 0,
    shippingCost: 0,
    total: 4320,
    status: 'Processing',
    paymentMethod: 'বিকাশ পেমেন্ট (bKash Verified)',
    trackingNumber: '',
    createdAt: '2026-02-22T10:15:00Z'
  }
];
