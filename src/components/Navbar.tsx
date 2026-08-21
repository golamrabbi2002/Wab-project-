import React, { useState } from 'react';
import { StoreConfig, Customer } from '../types';
import { Search, ShoppingBag, User, Heart, Menu, X, Package, Ruler } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else if (onCategorySelect) {
      onCategorySelect(cat);
    }
  };

  const categories = ['All', 'Tops', 'Outerwear', 'Bottoms', 'Dresses', 'Accessories'];

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-4">
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-800 hover:text-neutral-950 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                  {config.brandName || 'AURA ATELIER'}
                </span>
                {config.tagline ? (
                  <span className="text-[9px] tracking-widest text-neutral-500 uppercase font-medium hidden sm:block">
                    {config.tagline}
                  </span>
                ) : null}
              </div>
            </button>
          </div>

          {/* Desktop Navigation Category Links */}
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
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>
        )}

        {/* Mobile Category Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-3 py-1">
              Garment Categories
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  handleCategoryClick(cat);
                  setMobileMenuOpen(false);
                  const el = document.getElementById('shop') || document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`block w-full text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-md ${
                  selectedCategory === cat
                    ? 'bg-neutral-950 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            ))}

            <div className="pt-2 border-t border-neutral-100 space-y-1.5 px-2">
              {onOpenOrderTracking && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenOrderTracking();
                  }}
                  className="w-full py-2.5 px-3 bg-neutral-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Track Parcel / Order</span>
                </button>
              )}
              {onOpenSizeGuide && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSizeGuide();
                  }}
                  className="w-full py-2.5 px-3 bg-white border border-neutral-300 text-neutral-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Ruler className="w-4 h-4" />
                  <span>Size & Fitting Guide</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
