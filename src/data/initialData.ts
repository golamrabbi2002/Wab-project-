import { Product, StoreConfig, Coupon, Order } from '../types';

// High-fidelity curated fashion imagery and SVG silhouettes that render anywhere offline or online
export const initialStoreConfig: StoreConfig = {
  brandName: 'BISMILLAH COLLECTION',
  tagline: 'সেরা অনলাইন শপিং ও এক্সক্লুসিভ ফ্যাশন কালেকশন',
  logoText: 'BISMILLAH',
  logoImage: '',
  heroHeadline: 'EID & FESTIVE COLLECTION 2026',
  heroSubheadline: 'প্রিমিয়াম প্রি-ওয়াশড কটন পাঞ্জাবি, এক্সক্লুসিভ সিল্ক শাড়ি, ডিজাইনার থ্রি-পিস ও ক্যাজুয়াল কালেকশন। সারা বাংলাদেশে হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি।',
  heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
  announcementText: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা • ৩০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি! • কোড: BISMILLAH10',
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
  studioAddress: 'ঢাকা, বাংলাদেশ',
  shippingPolicy: 'ঢাকার মধ্যে ১-২ কর্মদিবসে এবং ঢাকার বাইরে ২-৩ কর্মদিবসে ক্যাশ অন ডেলিভারিতে পার্সেল পৌঁছে দেওয়া হয়।',
  returnPolicy: 'পণ্য হাতে পেয়ে কোনো ত্রুটি থাকলে ডেলিভারি ম্যানের উপস্থিতিতে চেক করে ইনস্ট্যান্ট রিটার্ন বা ৭ দিনের মধ্যে এক্সচেঞ্জ সুবিধা পাবেন।',
  privacyPolicy: 'গ্রাহকের নাম, মোবাইল নম্বর এবং ডেলিভারি ঠিকানা ১০০% সুরক্ষিত রাখা হয়।',
  termsOfService: 'বিসমিল্লাহ কালেকশনের সমস্ত পণ্য শতভাগ আসল ও কোয়ালিটি নিশ্চিত করে ডেলিভারি করা হয়।',
  adminPin: 'admin123',
  googleClientId: '461741220295-rqq6hdsnrijiopvkc8j2g6j39ch0h33o.apps.googleusercontent.com'
};

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    title: 'Monochrome Wool Trench Coat',
    subtitle: 'Double-breasted tailored outerwear in Virgin Wool',
    category: 'Outerwear',
    price: 380,
    originalPrice: 450,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 12,
    sku: 'AUR-TRN-001',
    rating: 4.9,
    reviewsCount: 38,
    description: 'A masterclass in modern draping. Featuring dropped shoulders, horn buttons, deep storm storm flaps, and a removable waist belt for customizable structuring.',
    material: '90% Virgin Wool, 10% Cashmere blend (Cupro lining)',
    careInstructions: 'Dry clean only with mild solvents. Steam gently.',
    badges: ['Bestseller', 'Sale'],
    featured: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'prod-2',
    title: 'Structured Poplin Oversized Shirt',
    subtitle: 'Crisp 120-thread Egyptian cotton shirt',
    category: 'Tops',
    price: 145,
    originalPrice: 165,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 24,
    sku: 'AUR-TOP-002',
    rating: 4.8,
    reviewsCount: 52,
    description: 'The definitive architectural white shirt. Cut with relaxed armholes, mother-of-pearl buttons, and a sharp point collar that stays defined all day.',
    material: '100% GOTS-Certified Organic Egyptian Cotton',
    careInstructions: 'Machine wash delicate at 30°C. Hang dry and warm iron.',
    badges: ['New'],
    featured: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'prod-3',
    title: 'Pleated Wide-Leg Wool Trousers',
    subtitle: 'High-waisted tailored trousers with pressed front crease',
    category: 'Bottoms',
    price: 220,
    originalPrice: 220,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 8,
    sku: 'AUR-BOT-003',
    rating: 4.9,
    reviewsCount: 27,
    description: 'Engineered for seamless movement with high-rise waistline, double front pleats, hidden zip fly, and deep angled side pockets.',
    material: '100% Fine Merino Wool with silk pocket bags',
    careInstructions: 'Specialist dry clean. Store on wooden clamp hangers.',
    badges: ['Bestseller'],
    featured: true,
    createdAt: '2026-01-20'
  },
  {
    id: 'prod-4',
    title: 'Silk Slip Midi Dress in Obsidian',
    subtitle: 'Bias-cut mulberry silk dress with delicate straps',
    category: 'Dresses',
    price: 290,
    originalPrice: 320,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 4,
    sku: 'AUR-DRS-004',
    rating: 5.0,
    reviewsCount: 19,
    description: 'Effortless evening drama. Cut on the bias to gently hug natural contours with an alluring low cowl back and side hem slit.',
    material: '100% Grade 6A 22-Momme Mulberry Silk',
    careInstructions: 'Hand wash cold with silk detergent or dry clean.',
    badges: ['Limited'],
    featured: true,
    createdAt: '2026-02-10'
  },
  {
    id: 'prod-5',
    title: 'Heavyweight Ribbed Cashmere Knit',
    subtitle: 'Seamless mock-neck sweater in natural heather beige',
    category: 'Tops',
    price: 265,
    originalPrice: 295,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 15,
    sku: 'AUR-TOP-005',
    rating: 4.9,
    reviewsCount: 44,
    description: 'Spun from Mongolian grade-A cashmere. Chunky 5-gauge knit that provides unmatched thermal insulation while remaining featherlight.',
    material: '100% Sustainable Mongolian Cashmere',
    careInstructions: 'Hand wash gently in lukewarm water. Dry flat on towels.',
    badges: ['Bestseller'],
    featured: false,
    createdAt: '2026-01-25'
  },
  {
    id: 'prod-6',
    title: 'Minimalist Leather Crossbody Bag',
    subtitle: 'Full-grain Italian calfskin with brushed palladium hardware',
    category: 'Accessories',
    price: 340,
    originalPrice: 340,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['One Size'],
    stock: 9,
    sku: 'AUR-ACC-006',
    rating: 4.8,
    reviewsCount: 31,
    description: 'Sleek geometric silhouette engineered with magnetic accordion closure, internal card organizer, and adjustable shoulder strap.',
    material: 'Vegetable-tanned full-grain calf leather with suede interior',
    careInstructions: 'Apply organic leather balm twice annually. Store in dust bag.',
    badges: ['New'],
    featured: false,
    createdAt: '2026-02-14'
  },
  {
    id: 'prod-7',
    title: 'Raw Selvedge Denim Straight Jeans',
    subtitle: '13.5oz Japanese Kuroki mill selvedge denim',
    category: 'Bottoms',
    price: 195,
    originalPrice: 215,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 18,
    sku: 'AUR-BOT-007',
    rating: 4.7,
    reviewsCount: 22,
    description: 'Woven on vintage shuttle looms in Okayama. Pure indigo dyed to develop a deeply personal patina over years of wear.',
    material: '100% Cotton (13.5oz Unwashed Selvedge)',
    careInstructions: 'Soak inside-out in cold water. Air dry naturally.',
    badges: [],
    featured: false,
    createdAt: '2026-01-10'
  },
  {
    id: 'prod-8',
    title: 'Chunky Lug-Sole Chelsea Boots',
    subtitle: 'Handcrafted Goodyear-welted water-repellent leather',
    category: 'Footwear',
    price: 360,
    originalPrice: 420,
    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=800&auto=format&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=800&auto=format&fit=crop'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 6,
    sku: 'AUR-FTW-008',
    rating: 4.9,
    reviewsCount: 16,
    description: 'Modern utilitarian edge meets timeless shoemaking. Fitted with Vibram rubber lug soles and elasticated side gussets.',
    material: 'Full-grain waxed cowhide, Vibram rubber sole',
    careInstructions: 'Wipe with damp cloth and condition with natural wax.',
    badges: ['Sale'],
    featured: false,
    createdAt: '2026-02-05'
  }
];

export const initialCoupons: Coupon[] = [
  {
    id: 'c-1',
    code: 'WELCOME15',
    discountPercent: 15,
    minSpend: 50,
    description: '15% off your first luxury order',
    isActive: true
  },
  {
    id: 'c-2',
    code: 'AURA20',
    discountPercent: 20,
    minSpend: 200,
    description: '20% off on orders over $200',
    isActive: true
  },
  {
    id: 'c-3',
    code: 'VIP50',
    discountPercent: 0,
    discountFixed: 50,
    minSpend: 300,
    description: '$50 off luxury capsule collections over $300',
    isActive: true
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'AUR-2026-8941',
    customerId: 'cust-demo-1',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@atelier.com',
    customerPhone: '+1 (212) 555-0199',
    shippingAddress: {
      street: '740 Park Avenue, Apt 14B',
      city: 'New York',
      state: 'NY',
      zip: '10021',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-1',
        title: 'Monochrome Wool Trench Coat',
        size: 'M',
        price: 380,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop'
      },
      {
        productId: 'prod-2',
        title: 'Structured Poplin Oversized Shirt',
        size: 'S',
        price: 145,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop'
      }
    ],
    subtotal: 525,
    discount: 78.75,
    couponCode: 'WELCOME15',
    tax: 35.7,
    shippingCost: 0,
    total: 481.95,
    status: 'Shipped',
    paymentMethod: 'Google Pay (Simulated)',
    trackingNumber: '1Z9999999294682741',
    createdAt: '2026-02-18T14:32:00Z',
    notes: 'Please leave with concierge if unavailable.'
  },
  {
    id: 'ord-102',
    orderNumber: 'AUR-2026-8942',
    customerId: 'cust-demo-2',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.v@designstudio.org',
    customerPhone: '+1 (415) 890-3412',
    shippingAddress: {
      street: '1200 Pacific Heights Blvd',
      city: 'San Francisco',
      state: 'CA',
      zip: '94109',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-3',
        title: 'Pleated Wide-Leg Wool Trousers',
        size: 'L',
        price: 220,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop'
      }
    ],
    subtotal: 440,
    discount: 88,
    couponCode: 'AURA20',
    tax: 28.16,
    shippingCost: 0,
    total: 380.16,
    status: 'Processing',
    paymentMethod: 'Credit Card (**** 4242)',
    trackingNumber: '',
    createdAt: '2026-02-19T09:15:00Z'
  }
];
