import React, { useState, useEffect } from 'react';
import { StoreConfig, Customer } from '../types';
import { Search, ShoppingBag, User, Heart, X, Package, Ruler, MoreVertical, ChevronRight, Sparkles, Phone, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  config: StoreConfig;
  cartCount: number;
  wishlistCount?: number;
  customer?: Customer | null;
  onOpenCart?: () => void;
  onOpenAuth?: () => void;
  onOpenWishlist?: () => void;
  onOpenOrderTracking?: () => void;
  onOpenSizeGuide?: () => void;
  onSelectCategory?: (cat: string) => void;
  onCategorySelect?: (cat: string) => void;
  selectedCategory?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  cartCount,
  wishlistCount = 0,
  customer = null,
  onOpenCart,
  onOpenAuth,
  onOpenWishlist,
  onOpenOrderTracking,
  onOpenSizeGuide,
  onSelectCategory,
  onCategorySelect,
  selectedCategory = 'All',
  searchQuery = '',
  onSearchChange,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Close drawer on ESC key and prevent body scroll when open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else if (onCategorySelect) {
      onCategorySelect(cat);
    }
  };

  const categories = ['All', 'Tops', 'Outerwear', 'Bottoms', 'Dresses', 'Accessories'];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between gap-3">
            
            {/* Mobile 3-Dot Icon Trigger for Slide-out Sidebar Drawer */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-200/60 active:scale-95 rounded-full transition-all focus:outline-none"
                aria-label="Open Navigation Menu"
                title="Menu"
              >
                <MoreVertical className="w-6 h-6 text-neutral-900" />
              </button>
            </div>

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  handleCategoryClick('All');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-3 text-left group"
              >
                {config.logoImage ? (
                  <img
                    src={config.logoImage}
                    alt={config.brandName}
                    className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                ) : null}
                <div>
                  <span className="font-serif text-2xl tracking-[0.25em] font-semibold text-neutral-950 block transition-colors group-hover:text-neutral-800">
                    {config.brandName || 'BISMILLAH COLLECTION'}
                  </span>
                  {config.tagline ? (
                    <span className="text-[9px] tracking-widest text-neutral-500 uppercase font-medium hidden sm:block">
                      {config.tagline}
                    </span>
                  ) : null}
                </div>
              </button>
            </div>

            {/* Desktop Navigation Category Links - Preserved untouched for PC */}
            <nav className="hidden md:flex items-center space-x-7 text-xs font-medium uppercase tracking-widest text-neutral-600">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    handleCategoryClick(cat);
                    const el = document.getElementById('shop') || document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`py-2 border-b-2 transition-all ${
                    selectedCategory === cat
                      ? 'border-neutral-950 text-neutral-950 font-bold'
                      : 'border-transparent hover:border-neutral-400 hover:text-neutral-950'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>

            {/* Action Utilities */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Bar */}
              <div className="relative">
                <div className="hidden lg:flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    placeholder="Search garments..."
                    className="w-48 xl:w-60 pl-9 pr-4 py-2 text-xs bg-white/80 border border-neutral-300 rounded-full focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all placeholder:text-neutral-400 text-neutral-900"
                  />
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange?.('')}
                      className="absolute right-3 text-neutral-400 hover:text-neutral-900 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Mobile Search Toggle */}
                <button
                  onClick={() => setShowSearchInput(!showSearchInput)}
                  className="p-2 text-neutral-700 hover:text-neutral-950 lg:hidden rounded-full hover:bg-neutral-100"
                  title="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Wishlist */}
              <button
                onClick={() => onOpenWishlist?.()}
                className="p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors relative"
                title="Saved Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-neutral-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Track Order Button */}
              {onOpenOrderTracking && (
                <button
                  onClick={() => onOpenOrderTracking()}
                  className="hidden sm:flex items-center gap-1.5 p-1.5 px-3 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors border border-neutral-200 text-xs font-semibold"
                  title="Track Parcel Delivery"
                >
                  <Package className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Track Order</span>
                </button>
              )}

              {/* Customer Account / Google Sign-in */}
              <button
                onClick={() => onOpenAuth?.()}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors border border-transparent hover:border-neutral-200"
                title={customer ? `Signed in as ${customer.name}` : 'Customer Sign In'}
              >
                {customer?.avatar ? (
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-6 h-6 rounded-full object-cover border border-neutral-300 ring-1 ring-emerald-500"
                  />
                ) : (
                  <div className="relative">
                    <User className="w-5 h-5 text-neutral-700" />
                    {customer && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                    )}
                  </div>
                )}
                {customer ? (
                  <span className="text-xs font-semibold max-w-[80px] truncate hidden sm:inline-block">
                    {customer.name.split(' ')[0]}
                  </span>
                ) : (
                  <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline-block">
                    Sign In
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={() => onOpenCart?.()}
                className="flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 bg-neutral-950 text-white rounded-full hover:bg-neutral-800 transition-all shadow-sm"
                title="View Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs font-bold font-mono">{cartCount}</span>
              </button>
            </div>
          </div>

          {/* Mobile Search input expand */}
          {showSearchInput && (
            <div className="pb-3 lg:hidden">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="Search collection by name, category, fabric..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Slide-out Sidebar Drawer (Full Height, Slides in from Left) */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          sidebarOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop Overlay */}
        <div 
          onClick={() => setSidebarOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Sidebar Panel - Full Height, slides out from left */}
        <aside 
          className={`absolute top-0 bottom-0 left-0 w-[80%] max-w-xs sm:w-80 h-full bg-[#faf9f6] shadow-2xl flex flex-col justify-between z-10 transform transition-transform duration-300 ease-out border-r border-neutral-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Top Header of Sidebar */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              {config.logoImage ? (
                <img
                  src={config.logoImage}
                  alt={config.brandName}
                  className="h-8 w-auto object-contain"
                />
              ) : null}
              <div>
                <span className="font-serif text-lg tracking-[0.18em] font-bold text-neutral-950 block">
                  {config.brandName || 'BISMILLAH'}
                </span>
                <span className="text-[9px] tracking-widest text-neutral-500 uppercase font-medium">
                  {config.tagline || 'Excellence in Apparel'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-full text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items & Categories */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Category Navigation */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-3 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-neutral-500" />
                <span>Categories</span>
              </div>
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        handleCategoryClick(cat);
                        setSidebarOpen(false);
                        const el = document.getElementById('shop') || document.getElementById('catalog-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
                        isSelected
                          ? 'bg-neutral-950 text-white shadow-sm'
                          : 'text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-950'
                      }`}
                    >
                      <span>{cat}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & Utilities */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-3 mb-2">
                Services & Features
              </div>
              <div className="space-y-1.5">
                {onOpenOrderTracking && (
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      onOpenOrderTracking();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-white border border-neutral-200/80 text-neutral-800 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors text-left"
                  >
                    <Package className="w-4 h-4 text-neutral-700 shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold">Track Order</div>
                      <div className="text-[10px] text-neutral-500 font-normal">Real-time parcel delivery status</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                )}

                {onOpenSizeGuide && (
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      onOpenSizeGuide();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-white border border-neutral-200/80 text-neutral-800 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors text-left"
                  >
                    <Ruler className="w-4 h-4 text-neutral-700 shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold">Size & Fit Guide</div>
                      <div className="text-[10px] text-neutral-500 font-normal">Chest, length & waist measurements</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    onOpenWishlist?.();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-white border border-neutral-200/80 text-neutral-800 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors text-left"
                >
                  <Heart className="w-4 h-4 text-neutral-700 shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold">My Wishlist</div>
                    <div className="text-[10px] text-neutral-500 font-normal">{wishlistCount} items saved</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Footer Section of Sidebar */}
          <div className="p-4 border-t border-neutral-200 bg-white/60 space-y-3">
            {/* Customer Status / Sign in */}
            <div className="flex items-center justify-between p-2.5 bg-neutral-100 rounded-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                {customer?.avatar ? (
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-300 ring-1 ring-emerald-500 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-neutral-900 truncate">
                    {customer ? customer.name : 'Welcome, Guest'}
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">
                    {customer ? customer.email || customer.phone : 'Sign in for personal perks'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  onOpenAuth?.();
                }}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-[11px] font-bold hover:bg-neutral-800 transition-colors shrink-0"
              >
                {customer ? 'Account' : 'Sign In'}
              </button>
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-500 font-medium pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> 100% Genuine
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-neutral-600" /> 24/7 Helpline
              </span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

