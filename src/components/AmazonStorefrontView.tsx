import React, { useState, useEffect, useRef } from 'react';
import { Product, StoreConfig, Customer } from '../types';
import {
  Search,
  ShoppingCart,
  User,
  MapPin,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Phone,
  ShieldCheck,
  Truck,
  RotateCcw,
  SlidersHorizontal,
  Star,
  Check,
  Heart,
  Eye,
  Layers,
  ShoppingBag,
  ExternalLink,
  CreditCard,
  QrCode,
  Home
} from 'lucide-react';

import kitchenImg from '../assets/images/kitchen_appliances_aesthetic_1794162224458.jpg';
import beautyImg from '../assets/images/beauty_cosmetics_flatlay_1794162241486.jpg';
import fashionImg from '../assets/images/fashion_sharp_wardrobe_1794162255103.jpg';
import laptopImg from '../assets/images/modern_laptop_gadget_1794162272491.jpg';
import toysImg from '../assets/images/toys_little_ones_1794162289501.jpg';
import booksImg from '../assets/images/discover_books_shelf_1794162307720.jpg';

interface AmazonStorefrontViewProps {
  products: Product[];
  config: StoreConfig;
  cartCount: number;
  wishlistCount: number;
  customer: Customer | null;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenWishlist: () => void;
  onOpenOrderTracking: () => void;
  onOpenSizeGuide: () => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: string[];
  onOpenAiAssistant: () => void;
  onSwitchTheme?: (theme: 'amazon' | 'classic') => void;
}

export const AmazonStorefrontView: React.FC<AmazonStorefrontViewProps> = ({
  products,
  config,
  cartCount,
  wishlistCount,
  customer,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenAuth,
  onOpenWishlist,
  onOpenOrderTracking,
  onOpenSizeGuide,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  onOpenAiAssistant,
  onSwitchTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState('All');
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [priceSort, setPriceSort] = useState<'featured' | 'low-high' | 'high-low' | 'rating'>('featured');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const categories = [
    'All',
    'Panjabi',
    'Saree',
    'Three-Piece',
    'Tops',
    'Bottoms',
    'Outerwear',
    'Footwear',
    'Accessories',
    'Household & Living',
  ];

  // Filter products by selected department/category & search query
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      if (!p.category?.toLowerCase().includes(selectedCategory.toLowerCase())) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      const matchSub = (p.subtitle || '').toLowerCase().includes(q);
      const matchCat = (p.category || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchMat = (p.material || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchCat && !matchDesc && !matchMat) return false;
    }
    return true;
  }).sort((a, b) => {
    if (priceSort === 'low-high') return a.price - b.price;
    if (priceSort === 'high-low') return b.price - a.price;
    if (priceSort === 'rating') return (b.rating || 5) - (a.rating || 5);
    return 0;
  });

  // Marketplace Curated Deal Rows
  const featuredPanjabis = products.filter((p) => (p.category || '').toLowerCase().includes('panjabi')).slice(0, 4);
  const featuredSarees = products.filter((p) => (p.category || '').toLowerCase().includes('saree')).slice(0, 4);
  const bestsellers = products.filter((p) => p.badges?.includes('Bestseller') || (p.stock || 0) > 0).slice(0, 4);
  const budgetDeals = products.filter((p) => p.price <= 2500).slice(0, 4);
  const householdItems = products.filter((p) => (p.category || '').toLowerCase().includes('house') || (p.category || '').toLowerCase().includes('living'));
  const trendingFestive = products.filter((p) => (p.category || '').toLowerCase().includes('panjabi') || (p.category || '').toLowerCase().includes('saree')).slice(0, 10);

  const heroSlides = [
    {
      id: 'slide-kitchen',
      title: 'Shop kitchen\nmust-haves',
      bengaliTag: 'আধুনিক কিচেনওয়্যার ও হোম অ্যাপ্লায়েন্স',
      category: 'Household & Living',
      image: kitchenImg,
      bgColor: '#edf4f2',
      badge: 'Featured Deal',
    },
    {
      id: 'slide-beauty',
      title: 'Shop all\nthings beauty',
      bengaliTag: 'প্রিমিয়াম স্কিনকেয়ার ও কসমেটিকস',
      category: 'Accessories',
      image: beautyImg,
      bgColor: '#fdf1ec',
      badge: 'Trending Now',
    },
    {
      id: 'slide-sharp',
      title: 'Start looking\nsharp',
      bengaliTag: 'অভিজাত রাজকীয় পাঞ্জাবি ও স্টাইলিশ কালেকশন',
      category: 'Panjabi',
      image: fashionImg,
      bgColor: '#f6f3ee',
      badge: 'Best Sellers',
    },
    {
      id: 'slide-toys',
      title: 'Toys for\nlittle ones',
      bengaliTag: 'শিশুদের নিরাপদ ও প্রিয় খেলনা সামগ্রী',
      category: 'Household & Living',
      image: toysImg,
      bgColor: '#ebf5fb',
      badge: 'Top Rated',
    },
    {
      id: 'slide-pc',
      title: 'Level up\nyour PC here',
      bengaliTag: 'স্মার্ট ল্যাপটপ, গ্যাজেট ও টেক এক্সেসরিজ',
      category: 'Accessories',
      image: laptopImg,
      bgColor: '#f3ecf9',
      badge: 'Hot Deal',
    },
    {
      id: 'slide-books',
      title: "Discover books\nyou can't put down",
      bengaliTag: 'সেরা বই ও জীবনঘনিষ্ঠ সাহিত্য',
      category: 'Household & Living',
      image: booksImg,
      bgColor: '#fbf8f3',
      badge: 'Popular Reads',
    },
  ];

  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const slideTimerRef = useRef<any>(null);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCarouselTransform = () => {
    if (windowWidth < 640) {
      // Mobile peek mode: 84vw width card, 12px gap, 7vw left margin
      return `translateX(calc(7vw - ${activeSlideIdx} * (84vw + 12px)))`;
    } else if (windowWidth < 1024) {
      // Tablet peek mode: 68vw width card, 16px gap, 16vw peek margin
      return `translateX(calc(16vw - ${activeSlideIdx} * (68vw + 16px)))`;
    } else {
      // Desktop: centered full slide
      return `translateX(-${activeSlideIdx * 100}%)`;
    }
  };

  // Auto-slide forward smoothly
  useEffect(() => {
    slideTimerRef.current = setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [heroSlides.length]);

  const handleNextSlide = () => {
    if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    setActiveSlideIdx((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    setActiveSlideIdx((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleAddToCartQuick = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(p, p.sizes?.[0] || 'Standard');
    setJustAddedId(p.id);
    setTimeout(() => setJustAddedId(null), 1800);
  };

  return (
    <div className="min-h-screen bg-[#eaeded] text-[#0f1111] font-sans antialiased flex flex-col selection:bg-[#febd69] selection:text-[#111]">
      {/* ------------------------------------------------------------------ */}
      {/* TOP HEADER 1: AMAZON DARK NAV BAR (#131921) */}
      {/* ------------------------------------------------------------------ */}
      {/* ------------------------------------------------------------------ */}
      {/* TOP HEADER 1: AMAZON DARK NAV BAR (#131921) */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-40 bg-[#131921] text-white shadow-md w-full">
        {/* Row 1: Brand Logo + Desktop Search + Utilities (Login, Wishlist, Cart) */}
        <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-between gap-1 sm:gap-4 w-full">
          
          {/* Left: Mobile Menu Trigger + Brand Logo */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 hover:border hover:border-white rounded text-white lg:hidden flex items-center"
              aria-label="All Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Amazon Style Brand Lockup */}
            <button
              onClick={() => {
                onSelectCategory('All');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 hover:border hover:border-white rounded transition-all text-left"
            >
              {config.logoImage ? (
                <img src={config.logoImage} alt={config.brandName} className="h-6 sm:h-8 w-auto object-contain brightness-110" />
              ) : null}
              <div>
                <span className="font-black text-sm sm:text-lg tracking-wider text-white block leading-none">
                  {config.brandName || 'BISMILLAH'}
                  <span className="text-[#febd69] font-normal text-xs sm:text-sm">.bd</span>
                </span>
                <span className="text-[8px] sm:text-[9px] text-neutral-400 block tracking-tight truncate max-w-[110px] sm:max-w-none">
                  {config.tagline || 'অনলাইন মার্কেটপ্লেস'}
                </span>
              </div>
            </button>
          </div>

          {/* Delivery Location Widget (Amazon Desktop Style: Visible on large screens) */}
          <button
            onClick={onOpenOrderTracking}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 hover:border hover:border-white rounded text-left text-xs transition-all shrink-0"
            title="ডেলিভারি লোকেশন ও ট্র্যাকিং"
          >
            <MapPin className="w-4 h-4 text-[#febd69] shrink-0" />
            <div className="leading-tight">
              <span className="text-[10px] text-neutral-400 block">ডেলিভারি এলাকা</span>
              <span className="font-bold text-xs text-white block">সারা বাংলাদেশ (ক্যাশ অন)</span>
            </div>
          </button>

          {/* Center: Amazon Global Omnibar Search (DESKTOP & TABLET: Keeps Tablet & PC View Spacious) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-2">
            <div className="flex items-center rounded-md overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-[#f90] w-full">
              {/* Category Dropdown inside Search Bar */}
              <select
                value={selectedCategory}
                onChange={(e) => onSelectCategory(e.target.value)}
                className="bg-[#e6e6e6] hover:bg-[#dadada] text-[#333] font-medium text-xs px-2 sm:px-3 py-2.5 border-r border-[#cdcdcd] focus:outline-none cursor-pointer hidden sm:block max-w-[120px]"
              >
                <option value="All">সকল বিভাগ</option>
                {categories.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Main Search Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="বিসমিল্লাহ কালেকশনে পাঞ্জাবি, শাড়ি, থ্রি-পিস ও যে কোনো পণ্য খুঁজুন..."
                className="flex-1 px-3 py-2 text-xs sm:text-sm text-[#111] placeholder:text-neutral-500 focus:outline-none min-w-0"
              />

              {/* Amazon Orange Search Submit Button */}
              <button
                type="button"
                className="bg-[#febd69] hover:bg-[#f3a847] text-[#111] px-4 py-2.5 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                title="Search"
              >
                <Search className="w-5 h-5 text-[#111]" />
              </button>
            </div>
          </div>

          {/* Right Utilities: Account, Orders, Wishlist, Cart */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* Account & Lists */}
            <button
              onClick={onOpenAuth}
              className="px-1.5 sm:px-2 py-1 hover:border hover:border-white rounded text-left text-xs transition-all flex items-center gap-1"
              title="অ্যাকাউন্ট"
            >
              <div className="sm:hidden flex items-center gap-1 text-neutral-200">
                <User className="w-4 h-4 text-neutral-300" />
                <span className="text-[11px] font-bold text-white max-w-[55px] truncate">
                  {customer ? customer.name?.split(' ')[0] : 'লগইন'}
                </span>
              </div>
              <div className="hidden sm:block leading-tight">
                <span className="text-[10px] text-neutral-400 block">
                  {customer ? `হ্যালো, ${customer.name?.split(' ')[0]}` : 'লগইন করুন'}
                </span>
                <span className="font-bold text-xs text-white flex items-center gap-0.5">
                  অ্যাকাউন্ট ও লিস্ট <ChevronDown className="w-3 h-3 text-neutral-400" />
                </span>
              </div>
            </button>

            {/* Orders & Tracking (Desktop) */}
            <button
              onClick={onOpenOrderTracking}
              className="hidden lg:block px-2 py-1 hover:border hover:border-white rounded text-left text-xs transition-all"
            >
              <span className="text-[10px] text-neutral-400 block">রিটার্ন ও</span>
              <span className="font-bold text-xs text-white block">অর্ডার সমূহ</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="p-1.5 sm:px-2 sm:py-1 hover:border hover:border-white rounded text-left text-xs transition-all relative flex items-center"
              title="পছন্দের তালিকা"
            >
              <Heart className="w-5 h-5 text-neutral-300 hover:text-rose-400" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f08804] text-[#111] font-bold text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-mono">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Amazon Yellow Cart */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1 px-2 py-1 hover:border hover:border-white rounded transition-all text-xs cursor-pointer group"
              title="কার্ট"
            >
              <div className="relative">
                <ShoppingCart className="w-5 sm:w-6 h-5 sm:h-6 text-white group-hover:text-[#febd69] transition-colors" />
                <span className="absolute -top-1.5 left-2 sm:left-2.5 font-bold text-[11px] sm:text-xs text-[#f08804] font-mono">
                  {cartCount}
                </span>
              </div>
              <span className="font-bold text-xs text-white hidden sm:inline mt-2">কার্ট</span>
            </button>
          </div>
        </div>

        {/* Row 2 (MOBILE ONLY): Full-Width Amazon Mobile Search Omnibar */}
        <div className="md:hidden px-2.5 pb-2">
          <div className="flex items-center rounded-md overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-[#f90] w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="পাঞ্জাবি, শাড়ি, থ্রি-পিস ও যেকোনো পণ্য খুঁজুন..."
              className="flex-1 px-3 py-2 text-xs text-[#111] placeholder:text-neutral-500 focus:outline-none min-w-0"
            />
            <button
              type="button"
              className="bg-[#febd69] hover:bg-[#f3a847] text-[#111] px-3.5 py-2 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title="Search"
            >
              <Search className="w-4 h-4 text-[#111]" />
            </button>
          </div>
        </div>

        {/* Deliver to Bangladesh Sub-Strip (অর্ডার ও কুরিয়ার ট্র্যাকিং: Mobile & Tablet, lg:hidden) */}
        <button
          onClick={onOpenOrderTracking}
          className="w-full bg-[#37475a] hover:bg-[#485b73] text-white text-xs px-3 sm:px-6 py-2 flex items-center justify-between transition-colors cursor-pointer border-t border-neutral-700/60 lg:hidden"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#febd69] shrink-0" />
            <span className="font-medium text-xs sm:text-sm text-neutral-100 flex items-center gap-1">
              Deliver to Bangladesh <ChevronDown className="w-3.5 h-3.5 text-neutral-300" />
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#febd69] hidden xs:inline">
            সারা দেশে ক্যাশ অন ডেলিভারি
          </span>
        </button>

        {/* ------------------------------------------------------------------ */}
        {/* ৩ নম্বর সাব-মেনু: AMAZON SECONDARY STRIP (#232f3e) */}
        {/* ------------------------------------------------------------------ */}
        <div className="bg-[#232f3e] border-t border-neutral-700/60 text-white text-xs font-medium px-2 sm:px-4 py-1.5 overflow-x-auto no-scrollbar flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* All Departments Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-1 px-2 py-1 hover:border hover:border-white rounded font-bold text-white transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>সকল ক্যাটাগরি</span>
            </button>

            {/* Quick Links matching Screenshot style */}
            <button
              onClick={() => {
                onSelectCategory('All');
                const el = document.getElementById('amazon-deals-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-2 py-1 hover:border hover:border-white rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'All' ? 'bg-[#37475a] border border-white font-bold text-[#febd69]' : 'text-neutral-200'
              }`}
            >
              Deals
            </button>
            <button
              onClick={onOpenWishlist}
              className="px-2 py-1 hover:border hover:border-white rounded transition-colors whitespace-nowrap cursor-pointer text-neutral-200"
            >
              Lists
            </button>
            <button
              onClick={() => {
                onSelectCategory('All');
                setPriceSort('rating');
                const el = document.getElementById('amazon-deals-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2 py-1 hover:border hover:border-white rounded transition-colors whitespace-nowrap cursor-pointer text-neutral-200"
            >
              Best Sellers
            </button>
            <button
              onClick={() => onSelectCategory('Panjabi')}
              className={`px-2 py-1 hover:border hover:border-white rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'Panjabi' ? 'bg-[#37475a] border border-white font-bold text-[#febd69]' : 'text-neutral-200'
              }`}
            >
              Panjabi
            </button>
            <button
              onClick={() => onSelectCategory('Saree')}
              className={`px-2 py-1 hover:border hover:border-white rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'Saree' ? 'bg-[#37475a] border border-white font-bold text-[#febd69]' : 'text-neutral-200'
              }`}
            >
              Saree
            </button>
            <button
              onClick={() => onSelectCategory('Three-Piece')}
              className={`px-2 py-1 hover:border hover:border-white rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'Three-Piece' ? 'bg-[#37475a] border border-white font-bold text-[#febd69]' : 'text-neutral-200'
              }`}
            >
              Three-Piece
            </button>
            <button
              onClick={() => onSelectCategory('Household & Living')}
              className={`px-2 py-1 hover:border hover:border-white rounded transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'Household & Living' ? 'bg-[#37475a] border border-white font-bold text-[#febd69]' : 'text-neutral-200'
              }`}
            >
              Household & Living
            </button>

            <button
              onClick={onOpenOrderTracking}
              className="hidden lg:flex items-center gap-1 px-2 py-1 hover:border hover:border-white rounded text-neutral-200 hover:text-white whitespace-nowrap"
            >
              <Truck className="w-3.5 h-3.5 text-[#febd69]" />
              <span>কুরিয়ার ট্র্যাকিং</span>
            </button>

            <button
              onClick={onOpenSizeGuide}
              className="hidden xl:flex items-center gap-1 px-2 py-1 hover:border hover:border-white rounded text-neutral-200 hover:text-white whitespace-nowrap"
            >
              <span>সাইজ গাইড</span>
            </button>
          </div>

          {/* Right Strip Highlights */}
          <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#febd69]">
            <span className="hidden md:inline font-bold">
              🚚 ৳{config.freeShippingThreshold || 3000}+ অর্ডারে সারা দেশে ফ্রি ডেলিভারি!
            </span>
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#37475a] hover:bg-[#485b73] text-white rounded font-bold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#febd69]" />
              <span>এআই শপিং অ্যাসিস্ট্যান্ট</span>
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* AUTHENTIC MOBILE SLIDING CAROUSEL (PEEK CARDS MATCHING SCREENSHOTS) */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-[#eaeded] pb-2">

        {/* Sliding Rounded Cards Track with Left & Right Card Peeking */}
        <div className="w-full pt-3 sm:pt-4">
          <div className="relative group max-w-[1450px] mx-auto">
            
            {/* Desktop Left / Right Arrow Chevrons */}
            <button
              onClick={handlePrevSlide}
              className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-[#111] rounded-full shadow-lg border border-neutral-300 items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6 text-[#111]" />
            </button>
            <button
              onClick={handleNextSlide}
              className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-[#111] rounded-full shadow-lg border border-neutral-300 items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6 text-[#111]" />
            </button>

            {/* Mobile Peek & Desktop Slide Viewport */}
            <div
              className="w-full max-w-full overflow-hidden py-1"
              onTouchStart={(e) => {
                const touchDown = e.touches[0].clientX;
                (e.currentTarget as any)._touchDown = touchDown;
              }}
              onTouchEnd={(e) => {
                const touchDown = (e.currentTarget as any)._touchDown;
                if (!touchDown) return;
                const touchUp = e.changedTouches[0].clientX;
                const diff = touchDown - touchUp;
                if (diff > 45) {
                  handleNextSlide();
                } else if (diff < -45) {
                  handlePrevSlide();
                }
              }}
            >
              {/* Mobile uses peek translate, Tablet uses medium peek, Desktop centers cleanly */}
              <div
                className="flex transition-transform duration-500 ease-out will-change-transform"
                style={{
                  transform: getCarouselTransform(),
                }}
              >
                {heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="w-[84vw] sm:w-[68vw] lg:w-full max-w-[420px] sm:max-w-[560px] lg:max-w-none shrink-0 mr-3 sm:mr-4 lg:mr-0 lg:px-4"
                  >
                    <div
                      onClick={() => {
                        onSelectCategory(slide.category);
                        const el = document.getElementById('amazon-deals-grid');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{ backgroundColor: slide.bgColor }}
                      className="relative rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden cursor-pointer group/card flex flex-col justify-between min-h-[460px] sm:min-h-[500px] lg:min-h-[520px] max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto transition-transform active:scale-[0.99]"
                    >
                      {/* Top Header on Card */}
                      <div className="p-5 sm:p-7 z-10">
                        <span className="inline-block px-2.5 py-0.5 bg-[#0f1111]/80 text-[#febd69] font-bold text-[10px] uppercase tracking-wider rounded-md mb-2 shadow-sm">
                          {slide.badge}
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0f1111] tracking-tight leading-[1.12] whitespace-pre-line mb-1">
                          {slide.title}
                        </h2>
                        <span className="text-xs sm:text-sm text-neutral-600 font-medium block">
                          {slide.bengaliTag}
                        </span>
                      </div>

                      {/* Image Frame */}
                      <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden flex items-end justify-center px-4 pb-2">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-contain object-bottom drop-shadow-md group-hover/card:scale-103 transition-transform duration-300"
                          loading={idx === 0 ? 'eager' : 'lazy'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Dot Indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (slideTimerRef.current) clearInterval(slideTimerRef.current);
                    setActiveSlideIdx(i);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeSlideIdx === i ? 'w-7 bg-[#007185]' : 'w-2 bg-neutral-400 hover:bg-neutral-600'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Amazon Standard "Sign in for the best experience" (Prominently visible on both PC & Mobile) */}
          <div className="mt-4 mb-2 text-center max-w-md sm:max-w-lg mx-auto px-4 py-4 bg-white rounded-2xl border border-neutral-300 shadow-sm">
            <h3 className="font-extrabold text-lg sm:text-2xl text-[#0f1111] tracking-tight">
              {customer ? `হ্যালো, ${customer.name}!` : 'Sign in for the best experience'}
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
              {customer
                ? 'আপনার সেভ করা উইশলিস্ট, কার্ট ও লাইভ অর্ডার সহজে দেখুন'
                : 'আপনার পছন্দের পোশাক সহজে অর্ডার ও ডেলিভারি ট্র্যাক করতে নিরাপদে লগইন করুন'}
            </p>
            <button
              type="button"
              onClick={onOpenAuth}
              className="mt-3 w-full max-w-sm mx-auto py-3 px-6 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-[#0f1111] font-bold text-xs sm:text-sm rounded-full shadow-sm border border-[#fcd200] transition-all cursor-pointer block text-center"
            >
              {customer ? 'আমার অ্যাকাউন্ট ও অর্ডার সমূহ' : 'Sign in securely'}
            </button>
          </div>
        </div>
      </section>

      {/* AMAZON 4-CARD SHOWCASE TILES (CLEAN FLOW WITHOUT COVERING SIGN-IN ON PC) */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-6 relative z-10 max-w-[1450px] mx-auto px-2.5 sm:px-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Festive Panjabi */}
          <div className="bg-white p-4 rounded-sm shadow-md border border-neutral-300 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-[#0f1111] mb-2">
                প্রিমিয়াম পাঞ্জাবি কালেকশন
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {featuredPanjabis.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onQuickView(p)}
                    className="cursor-pointer group flex flex-col relative"
                  >
                    <div className="aspect-square bg-neutral-100 rounded overflow-hidden border border-neutral-200 relative">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <button
                        type="button"
                        onClick={(e) => handleAddToCartQuick(p, e)}
                        className="absolute bottom-1 right-1 p-1 sm:p-1.5 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-[#0f1111] rounded-full shadow border border-[#fcd200] transition-transform active:scale-90"
                        title="কার্ট-এ যোগ করুন"
                      >
                        <ShoppingCart className="w-3 h-3 text-[#111]" />
                      </button>
                    </div>
                    <span className="text-[11px] text-neutral-700 line-clamp-1 mt-1">{p.title}</span>
                    <span className="text-[11px] font-bold text-[#b12704]">{config.currencySymbol || '৳'}{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('Panjabi')}
              className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline text-left mt-2"
            >
              আরও দেখুন →
            </button>
          </div>

          {/* Card 2: Exclusive Sarees */}
          <div className="bg-white p-4 rounded-sm shadow-md border border-neutral-300 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-[#0f1111] mb-2">
                এক্সক্লুসিভ কাতান ও সিল্ক শাড়ি
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {featuredSarees.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onQuickView(p)}
                    className="cursor-pointer group flex flex-col relative"
                  >
                    <div className="aspect-square bg-neutral-100 rounded overflow-hidden border border-neutral-200 relative">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <button
                        type="button"
                        onClick={(e) => handleAddToCartQuick(p, e)}
                        className="absolute bottom-1 right-1 p-1 sm:p-1.5 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-[#0f1111] rounded-full shadow border border-[#fcd200] transition-transform active:scale-90"
                        title="কার্ট-এ যোগ করুন"
                      >
                        <ShoppingCart className="w-3 h-3 text-[#111]" />
                      </button>
                    </div>
                    <span className="text-[11px] text-neutral-700 line-clamp-1 mt-1">{p.title}</span>
                    <span className="text-[11px] font-bold text-[#b12704]">{config.currencySymbol || '৳'}{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('Saree')}
              className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline text-left mt-2"
            >
              সকল শাড়ি দেখুন →
            </button>
          </div>

          {/* Card 3: Top Bestsellers */}
          <div className="bg-white p-4 rounded-sm shadow-md border border-neutral-300 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-[#0f1111] mb-2 flex items-center gap-1.5">
                <span>বেস্টসেলার আইটেম</span>
                <span className="bg-[#febd69] text-[9px] font-bold text-[#111] px-1.5 py-0.5 rounded">#১ ট্রেন্ডিং</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {bestsellers.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onQuickView(p)}
                    className="cursor-pointer group flex flex-col relative"
                  >
                    <div className="aspect-square bg-neutral-100 rounded overflow-hidden border border-neutral-200 relative">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <button
                        type="button"
                        onClick={(e) => handleAddToCartQuick(p, e)}
                        className="absolute bottom-1 right-1 p-1 sm:p-1.5 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-[#0f1111] rounded-full shadow border border-[#fcd200] transition-transform active:scale-90"
                        title="কার্ট-এ যোগ করুন"
                      >
                        <ShoppingCart className="w-3 h-3 text-[#111]" />
                      </button>
                    </div>
                    <span className="text-[11px] text-neutral-700 line-clamp-1 mt-1">{p.title}</span>
                    <span className="text-[11px] font-bold text-[#b12704]">{config.currencySymbol || '৳'}{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('All')}
              className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline text-left mt-2"
            >
              টপ চার্ট এক্সপ্লোর করুন →
            </button>
          </div>

          {/* Card 4: Under ৳2500 Budget Zone & COD */}
          <div className="bg-white p-4 rounded-sm shadow-md border border-neutral-300 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-[#0f1111] mb-1">
                সাশ্রয়ী বাজেট জোন (৳২৫০০ এর নিচে)
              </h3>
              <p className="text-[11px] text-neutral-500 mb-2">
                ১০০% ক্যাশ অন ডেলিভারি এবং পার্সেল দেখে নেওয়ার নিশ্চয়তা
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {budgetDeals.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onQuickView(p)}
                    className="cursor-pointer group flex flex-col relative"
                  >
                    <div className="aspect-square bg-neutral-100 rounded overflow-hidden border border-neutral-200 relative">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <button
                        type="button"
                        onClick={(e) => handleAddToCartQuick(p, e)}
                        className="absolute bottom-1 right-1 p-1 sm:p-1.5 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-[#0f1111] rounded-full shadow border border-[#fcd200] transition-transform active:scale-90"
                        title="কার্ট-এ যোগ করুন"
                      >
                        <ShoppingCart className="w-3 h-3 text-[#111]" />
                      </button>
                    </div>
                    <span className="text-[11px] text-neutral-700 line-clamp-1 mt-1">{p.title}</span>
                    <span className="text-[11px] font-bold text-[#b12704]">{config.currencySymbol || '৳'}{p.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => onSelectCategory('All')}
              className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline text-left mt-2"
            >
              সকল ডিল দেখুন →
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* HORIZONTAL CAROUSEL SHELF 1: HOUSEHOLD & LIVING / বালতি ও কিচেনওয়্যার */}
      {/* ------------------------------------------------------------------ */}
      {householdItems.length > 0 && selectedCategory === 'All' && !searchQuery && (
        <section className="max-w-[1450px] mx-auto px-3 sm:px-6 pt-6 w-full">
          <div className="bg-white p-4 rounded-sm border border-neutral-300 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0f1111] flex items-center gap-2">
                  <span>গৃহস্থালি, বালতি ও কিচেনওয়্যার সেরা ডিল</span>
                  <span className="text-[10px] bg-[#cc0c39] text-white px-2 py-0.5 font-bold rounded">
                    বিশেষ অফার
                  </span>
                </h3>
                <p className="text-xs text-neutral-500">
                  আরএফএল বালতি, মেলামাইন ডিনার সেট, ফ্রাই প্যান ও কিচেন অ্যাপ্লায়েন্স
                </p>
              </div>
              <button
                onClick={() => onSelectCategory('Household & Living')}
                className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline whitespace-nowrap cursor-pointer"
              >
                সবগুলো দেখুন ({householdItems.length}) →
              </button>
            </div>

            {/* Horizontal Scroll Track */}
            <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth no-scrollbar">
              {householdItems.map((p) => {
                const isJustAdded = justAddedId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onQuickView(p)}
                    className="min-w-[170px] sm:min-w-[190px] max-w-[190px] bg-white border border-neutral-200 hover:border-neutral-400 p-2.5 rounded-sm flex flex-col justify-between cursor-pointer group transition-all shrink-0 hover:shadow-md"
                  >
                    <div>
                      <div className="aspect-square bg-neutral-100 rounded overflow-hidden mb-2">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <h4 className="text-xs font-semibold text-[#0f1111] line-clamp-2 leading-snug group-hover:text-[#007185]">
                        {p.title}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-[#de7921]">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-[#de7921]" />
                          ))}
                        </div>
                        <span className="text-neutral-500">({p.reviewsCount || 40})</span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-sm font-bold text-[#b12704]">
                          {config.currencySymbol || '৳'}{p.price}
                        </span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-[10px] text-neutral-400 line-through">
                            {config.currencySymbol || '৳'}{p.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAddToCartQuick(p, e)}
                      className={`mt-2 w-full py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200]'
                      }`}
                    >
                      {isJustAdded ? 'যুক্ত হয়েছে' : '+ কার্ট'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* HORIZONTAL CAROUSEL SHELF 2: TRENDING PANJABI & SAREE */}
      {/* ------------------------------------------------------------------ */}
      {trendingFestive.length > 0 && selectedCategory === 'All' && !searchQuery && (
        <section className="max-w-[1450px] mx-auto px-3 sm:px-6 pt-4 w-full">
          <div className="bg-white p-4 rounded-sm border border-neutral-300 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0f1111] flex items-center gap-2">
                  <span>জনপ্রিয় পাঞ্জাবি ও এক্সক্লুসিভ শাড়ি কালেকশন</span>
                  <span className="text-[10px] bg-[#febd69] text-[#111] px-2 py-0.5 font-bold rounded">
                    #১ ট্রেন্ডিং
                  </span>
                </h3>
                <p className="text-xs text-neutral-500">
                  ১০০% পিওর সুতি, জামদানি ও রয়্যাল জ্যাকার্ড ফেব্রিক
                </p>
              </div>
              <button
                onClick={() => onSelectCategory('Panjabi')}
                className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline whitespace-nowrap cursor-pointer"
              >
                সব পাঞ্জাবি ও শাড়ি দেখুন →
              </button>
            </div>

            {/* Horizontal Scroll Track */}
            <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth no-scrollbar">
              {trendingFestive.map((p) => {
                const isJustAdded = justAddedId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onQuickView(p)}
                    className="min-w-[170px] sm:min-w-[190px] max-w-[190px] bg-white border border-neutral-200 hover:border-neutral-400 p-2.5 rounded-sm flex flex-col justify-between cursor-pointer group transition-all shrink-0 hover:shadow-md"
                  >
                    <div>
                      <div className="aspect-[3/4] bg-neutral-100 rounded overflow-hidden mb-2">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <h4 className="text-xs font-semibold text-[#0f1111] line-clamp-2 leading-snug group-hover:text-[#007185]">
                        {p.title}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-[#de7921]">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-[#de7921]" />
                          ))}
                        </div>
                        <span className="text-neutral-500">({p.reviewsCount || 50})</span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-sm font-bold text-[#b12704]">
                          {config.currencySymbol || '৳'}{p.price}
                        </span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-[10px] text-neutral-400 line-through">
                            {config.currencySymbol || '৳'}{p.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAddToCartQuick(p, e)}
                      className={`mt-2 w-full py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200]'
                      }`}
                    >
                      {isJustAdded ? 'যুক্ত হয়েছে' : '+ কার্ট'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MAIN CATALOG & PRODUCT GRID (ALL 100 PRODUCTS) */}
      {/* ------------------------------------------------------------------ */}
      <main id="amazon-deals-grid" className="max-w-[1450px] mx-auto px-3 sm:px-6 py-8 w-full">
        {/* Results Toolbar */}
        <div className="bg-white p-3 rounded-sm border border-neutral-300 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-neutral-600">
            <span className="font-bold text-[#0f1111] text-sm">
              {filteredProducts.length} টি পণ্য পাওয়া গেছে
            </span>
            {selectedCategory !== 'All' && (
              <span className="ml-2 font-medium text-[#007185]">
                ক্যাটাগরি: <strong className="text-neutral-900">{selectedCategory}</strong>
              </span>
            )}
            {searchQuery && (
              <span className="ml-2">
                খোঁজা হচ্ছে: "<strong>{searchQuery}</strong>"
              </span>
            )}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-600">বাছাই করুন:</span>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as any)}
              className="bg-[#f0f2f2] hover:bg-[#e3e6e6] border border-[#d5d9d9] rounded-md px-3 py-1.5 text-xs text-[#0f1111] font-medium focus:ring-1 focus:ring-[#f90] focus:outline-none cursor-pointer"
            >
              <option value="featured">ফিচার্ড (Featured)</option>
              <option value="low-high">মূল্য: কম থেকে বেশি</option>
              <option value="high-low">মূল্য: বেশি থেকে কম</option>
              <option value="rating">গড় কাস্টমার রিভিউ</option>
            </select>
          </div>
        </div>

        {/* Amazon Standard Product Listing Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredProducts.map((p) => {
            const isWish = wishlist.includes(p.id);
            const isJustAdded = justAddedId === p.id;
            const discountPct = p.originalPrice && p.originalPrice > p.price
              ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
              : null;

            return (
              <div
                key={p.id}
                onClick={() => onQuickView(p)}
                className="bg-white border border-neutral-200 hover:border-neutral-400 hover:shadow-lg rounded-sm p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer group relative select-none"
              >
                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(p.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-neutral-100 text-neutral-400 hover:text-rose-500 shadow-sm border border-neutral-200 z-10 transition-colors"
                  title="উইশলিস্টে যোগ করুন"
                >
                  <Heart className={`w-4 h-4 ${isWish ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                {/* Badge Overlay */}
                {discountPct && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#cc0c39] text-white text-[10px] font-black rounded-sm shadow z-10">
                    -{discountPct}% ডিল
                  </span>
                )}

                <div>
                  {/* Product Image */}
                  <div className="aspect-[4/5] bg-neutral-100 rounded overflow-hidden mb-2.5 flex items-center justify-center">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Title & Brand */}
                  <h4 className="text-xs sm:text-[13px] font-semibold text-[#0f1111] line-clamp-2 leading-snug group-hover:text-[#007185] transition-colors">
                    {p.title}
                  </h4>

                  <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                    {p.subtitle || p.category}
                  </p>

                  {/* Amazon Star Rating */}
                  <div className="flex items-center gap-1 mt-1 text-[11px]">
                    <div className="flex text-[#de7921]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#de7921]" />
                      ))}
                    </div>
                    <span className="text-[#007185] font-medium text-[10px]">
                      {p.reviewsCount || 48}
                    </span>
                  </div>

                  {/* Pricing (Amazon Currency Stack) */}
                  <div className="mt-1.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-lg font-bold text-[#0f1111]">
                        {config.currencySymbol || '৳'}{p.price.toLocaleString('en-BD')}
                      </span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-[11px] text-neutral-500 line-through">
                          {config.currencySymbol || '৳'}{p.originalPrice.toLocaleString('en-BD')}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      ক্যাশ অন ডেলিভারি প্রযোজ্য
                    </span>
                  </div>
                </div>

                {/* Amazon Yellow Add to Cart Button */}
                <div className="pt-2.5 mt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={(e) => handleAddToCartQuick(p, e)}
                    className={`w-full py-1.5 px-1.5 sm:px-2 rounded-full font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-sm cursor-pointer ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] text-[#0f1111] border border-[#fcd200]'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>যুক্ত হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">কার্ট-এ যোগ করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* AMAZON FOOTER: BACK TO TOP + DARK STRIP */}
      {/* ------------------------------------------------------------------ */}
      <footer className="mt-auto bg-[#232f3e] text-white text-xs border-t border-neutral-700">
        {/* Back to top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full py-3 bg-[#37475a] hover:bg-[#485b73] text-center text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          পৃষ্ঠার শীর্ষে ফিরে যান (Back to top)
        </button>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-neutral-300">
          <div>
            <h4 className="font-bold text-white mb-2 text-sm">আমাদের জানুন</h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li>{config.brandName} পরিচিতি</li>
              <li>১০০% জেনুইন ফেব্রিক গ্যারান্টি</li>
              <li>কারিগরদের গল্প</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 text-sm">পেমেন্ট ও ডেলিভারি</h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li>সারা বাংলাদেশে ক্যাশ অন ডেলিভারি</li>
              <li>বিকাশ / নগদ ইনস্ট্যান্ট পেমেন্ট</li>
              <li>৭ দিনের ফ্রি সাইজ এক্সচেঞ্জ পলিসি</li>
              <li>ঢাকা সিটিতে ২৪-৪৮ ঘণ্টায় হোম ডেলিভারি</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 text-sm">সহায়তা ও যোগাযোগ</h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li>হটলাইন: {config.contactPhone}</li>
              <li>ইমেইল: {config.contactEmail}</li>
              <li>ঠিকানা: {config.studioAddress}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 text-sm">নিরাপত্তা ও বিশ্বাসযোগ্যতা</h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li>✓ ১০০% আসল কোয়ালিটি পণ্য</li>
              <li>✓ পার্সেল খুলে কাপড় দেখে নেওয়ার সুযোগ</li>
              <li>✓ ঢাকা সিটিতে ২৪-৪৮ ঘণ্টায় ডেলিভারি</li>
              <li>✓ ৭ দিনের ফ্রি সাইজ এক্সচেঞ্জ সুবিধা</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700/80 py-6 text-center text-[11px] text-neutral-400">
          <p>© 2026 {config.brandName}. সর্বস্বত্ব সংরক্ষিত • আধুনিক ই-কমার্স মার্কেটপ্লেস</p>
        </div>
      </footer>

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE FULL DRAWER NAVIGATION */}
      {/* ------------------------------------------------------------------ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-full max-w-xs bg-white text-[#111] flex flex-col z-10 shadow-2xl h-full overflow-y-auto">
            {/* Drawer Header */}
            <div className="bg-[#232f3e] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#febd69]" />
                <span className="font-bold text-sm">
                  {customer ? `হ্যালো, ${customer.name}` : 'লগইন বা রেজিস্টার করুন'}
                </span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#febd69]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department List */}
            <div className="p-4 space-y-4 text-xs">
              <div>
                <h5 className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider mb-2">
                  ক্যাটাগরি সমূহ
                </h5>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => {
                          onSelectCategory(cat);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left py-1.5 px-2 rounded hover:bg-neutral-100 font-medium ${
                          selectedCategory === cat ? 'bg-[#eaeded] font-bold text-[#007185]' : 'text-[#0f1111]'
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-neutral-200 pt-3 space-y-2">
                <button
                  onClick={() => {
                    onOpenOrderTracking();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-1.5 px-2 rounded hover:bg-neutral-100 font-medium text-[#0f1111] flex items-center gap-2"
                >
                  <Truck className="w-4 h-4 text-[#febd69]" />
                  <span>অর্ডার ট্র্যাকিং</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
