import { StoreConfig, Product, Coupon, Order, Customer } from '../types';

export interface StandaloneExportOptions {
  config: StoreConfig;
  products: Product[];
  coupons: Coupon[];
  orders: Order[];
  customers?: Customer[];
}

export function generateStandaloneHtml(
  optionsOrConfig: StandaloneExportOptions | StoreConfig,
  productsArg?: Product[],
  couponsArg?: Coupon[],
  ordersArg?: Order[]
): string {
  let config: StoreConfig;
  let products: Product[];
  let coupons: Coupon[];
  let orders: Order[];

  if ('config' in optionsOrConfig) {
    config = optionsOrConfig.config;
    products = optionsOrConfig.products;
    coupons = optionsOrConfig.coupons;
    orders = optionsOrConfig.orders;
  } else {
    config = optionsOrConfig;
    products = productsArg || [];
    coupons = couponsArg || [];
    orders = ordersArg || [];
  }

  const serializedConfig = JSON.stringify(config);
  const serializedProducts = JSON.stringify(products);
  const serializedCoupons = JSON.stringify(coupons);
  const serializedOrders = JSON.stringify(orders);

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.brandName} - Contemporary Fashion & Apparel</title>
  <meta name="description" content="${config.tagline}">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            serif: ['Cinzel', 'serif'],
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#faf8f5',
              100: '#f5f0eb',
              200: '#e6ded5',
              800: '#2c2825',
              900: '#1a1816',
              950: '#0f0e0d',
            }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-luxury { font-family: 'Cinzel', serif; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="bg-[#faf9f6] text-neutral-900 min-h-screen flex flex-col antialiased selection:bg-neutral-900 selection:text-white">

  <!-- NOTIFICATION BANNER -->
  <div id="announcement-bar" class="bg-neutral-950 text-white text-xs font-medium py-2.5 px-4 text-center tracking-widest uppercase transition-all duration-300">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <span class="w-6"></span>
      <span id="announcement-text" class="truncate">${config.announcementText}</span>
      <button onclick="document.getElementById('announcement-bar').style.display='none'" class="text-neutral-400 hover:text-white">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    </div>
  </div>

  <!-- MAIN NAVIGATION -->
  <header class="sticky top-0 z-40 bg-[#faf9f6]/90 backdrop-blur-md border-b border-neutral-200/80 transition-all">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
      <!-- Brand Logo / Name -->
      <div class="flex items-center gap-6">
        <a href="#storefront" onclick="switchView('storefront')" class="flex items-center gap-3 group">
          <div id="brand-logo-container">
            ${config.logoImage ? `<img src="${config.logoImage}" alt="Logo" class="h-9 w-auto object-contain">` : ''}
          </div>
          <div>
            <span id="brand-name-display" class="font-luxury text-2xl tracking-[0.25em] font-semibold text-neutral-950">${config.brandName}</span>
            <p id="brand-tagline-display" class="text-[10px] tracking-widest text-neutral-500 uppercase font-medium hidden sm:block">${config.tagline}</p>
          </div>
        </a>
      </div>

      <!-- Navigation Links -->
      <nav class="hidden md:flex items-center space-x-8 text-xs font-medium uppercase tracking-widest text-neutral-700">
        <button onclick="filterCategory('All')" class="hover:text-neutral-950 transition-colors py-1 border-b-2 border-transparent hover:border-neutral-950">All</button>
        <button onclick="filterCategory('Tops')" class="hover:text-neutral-950 transition-colors py-1 border-b-2 border-transparent hover:border-neutral-950">Tops</button>
        <button onclick="filterCategory('Outerwear')" class="hover:text-neutral-950 transition-colors py-1 border-b-2 border-transparent hover:border-neutral-950">Outerwear</button>
        <button onclick="filterCategory('Bottoms')" class="hover:text-neutral-950 transition-colors py-1 border-b-2 border-transparent hover:border-neutral-950">Bottoms</button>
        <button onclick="filterCategory('Dresses')" class="hover:text-neutral-950 transition-colors py-1 border-b-2 border-transparent hover:border-neutral-950">Dresses</button>
        <button onclick="filterCategory('Accessories')" class="hover:text-neutral-950 transition-colors py-1 border-b-2 border-transparent hover:border-neutral-950">Accessories</button>
      </nav>

      <!-- Action Utilities -->
      <div class="flex items-center gap-3">
        <!-- Search trigger -->
        <div class="relative hidden sm:block">
          <input type="text" id="global-search" oninput="handleSearch(this.value)" placeholder="Search collection..." class="w-48 lg:w-64 pl-9 pr-4 py-2 text-xs bg-white border border-neutral-300 rounded-full focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all">
          <i data-lucide="search" class="w-4 h-4 text-neutral-400 absolute left-3 top-2.5"></i>
        </div>

        <!-- Customer Account -->
        <button onclick="openCustomerAuthModal()" class="p-2 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors relative" title="Customer Profile">
          <i data-lucide="user" class="w-5 h-5"></i>
          <span id="auth-status-dot" class="hidden absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
        </button>

        <!-- Cart Trigger -->
        <button onclick="openCartDrawer()" class="p-2 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors relative" title="Shopping Bag">
          <i data-lucide="shopping-bag" class="w-5 h-5"></i>
          <span id="cart-count-badge" class="absolute -top-1 -right-1 bg-neutral-950 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">0</span>
        </button>

        <!-- Admin Gateway Button (Strictly Protected) -->
        <button onclick="openAdminGate()" class="p-2 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 rounded-full transition-colors border border-neutral-300/60" title="Shop Owner Admin Area">
          <i data-lucide="shield-check" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  </header>

  <!-- STOREFRONT VIEW -->
  <main id="storefront-view" class="flex-1">
    <!-- HERO SECTION -->
    <section class="relative bg-neutral-900 text-white overflow-hidden py-24 sm:py-32 px-4 sm:px-6 lg:px-8 flex items-center min-h-[520px]">
      <div id="hero-bg-layer" class="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity" style="background-image: url('${config.heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600'}')"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent"></div>
      <div class="relative max-w-7xl mx-auto w-full">
        <div class="max-w-2xl">
          <span class="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-widest text-neutral-200 mb-6 border border-white/10">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Spring / Summer 2026 Collection
          </span>
          <h1 id="hero-headline" class="font-luxury text-4xl sm:text-6xl font-light tracking-wide leading-tight mb-6">${config.heroHeadline}</h1>
          <p id="hero-subheadline" class="text-neutral-300 text-base sm:text-lg font-light leading-relaxed mb-8 max-w-xl">${config.heroSubheadline}</p>
          <div class="flex flex-wrap items-center gap-4">
            <a href="#product-catalog" class="px-8 py-3.5 bg-white text-neutral-950 hover:bg-neutral-100 font-medium text-xs tracking-widest uppercase rounded-sm transition-all shadow-lg hover:shadow-xl">
              Explore Atelier
            </a>
            <button onclick="openCustomerAuthModal()" class="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs tracking-widest uppercase rounded-sm backdrop-blur-md border border-white/20 transition-all">
              Sign In / Rewards
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- VALUE PROPOSITIONS -->
    <section class="border-y border-neutral-200 bg-white py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div class="flex flex-col items-center">
          <i data-lucide="sparkles" class="w-5 h-5 text-neutral-800 mb-2"></i>
          <span class="text-xs font-semibold tracking-wider uppercase text-neutral-900">Artisanal Tailoring</span>
          <p class="text-[11px] text-neutral-500 mt-0.5">Ethically sourced European textiles</p>
        </div>
        <div class="flex flex-col items-center">
          <i data-lucide="truck" class="w-5 h-5 text-neutral-800 mb-2"></i>
          <span class="text-xs font-semibold tracking-wider uppercase text-neutral-900">Carbon Neutral Courier</span>
          <p class="text-[11px] text-neutral-500 mt-0.5">Complimentary over $150</p>
        </div>
        <div class="flex flex-col items-center">
          <i data-lucide="rotate-ccw" class="w-5 h-5 text-neutral-800 mb-2"></i>
          <span class="text-xs font-semibold tracking-wider uppercase text-neutral-900">30-Day Atelier Trial</span>
          <p class="text-[11px] text-neutral-500 mt-0.5">Complimentary returns & swaps</p>
        </div>
        <div class="flex flex-col items-center">
          <i data-lucide="shield-check" class="w-5 h-5 text-neutral-800 mb-2"></i>
          <span class="text-xs font-semibold tracking-wider uppercase text-neutral-900">Encrypted Transactions</span>
          <p class="text-[11px] text-neutral-500 mt-0.5">256-bit secure checkout</p>
        </div>
      </div>
    </section>

    <!-- CATALOG GRID -->
    <section id="product-catalog" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-neutral-200 gap-4">
        <div>
          <span class="text-xs font-semibold tracking-widest text-neutral-400 uppercase">Handcrafted Garments</span>
          <h2 class="font-luxury text-3xl font-light tracking-wide text-neutral-950 mt-1">Ready-to-Wear Capsule</h2>
        </div>

        <!-- Filter tabs & Sort -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="inline-flex p-1 bg-neutral-200/60 rounded-lg text-xs font-medium">
            <button onclick="filterCategory('All')" id="tab-All" class="px-3 py-1.5 rounded-md bg-white text-neutral-950 shadow-sm transition-all">All</button>
            <button onclick="filterCategory('Tops')" id="tab-Tops" class="px-3 py-1.5 rounded-md text-neutral-600 hover:text-neutral-950 transition-all">Tops</button>
            <button onclick="filterCategory('Outerwear')" id="tab-Outerwear" class="px-3 py-1.5 rounded-md text-neutral-600 hover:text-neutral-950 transition-all">Outerwear</button>
            <button onclick="filterCategory('Bottoms')" id="tab-Bottoms" class="px-3 py-1.5 rounded-md text-neutral-600 hover:text-neutral-950 transition-all">Bottoms</button>
            <button onclick="filterCategory('Dresses')" id="tab-Dresses" class="px-3 py-1.5 rounded-md text-neutral-600 hover:text-neutral-950 transition-all">Dresses</button>
            <button onclick="filterCategory('Accessories')" id="tab-Accessories" class="px-3 py-1.5 rounded-md text-neutral-600 hover:text-neutral-950 transition-all">Accessories</button>
          </div>

          <select id="sort-select" onchange="handleSort(this.value)" class="text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-950">
            <option value="featured">Featured Collection</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <!-- PRODUCTS GRID CONTAINER -->
      <div id="products-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Rendered dynamically by JS -->
      </div>
    </section>
  </main>

  <!-- PROTECTED ADMIN VIEW (Isolated) -->
  <section id="admin-view" class="hidden flex-1 bg-neutral-900 text-neutral-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Admin Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-800 gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-neutral-800 rounded-xl border border-neutral-700">
            <i data-lucide="shield" class="w-6 h-6 text-amber-400"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold tracking-wider uppercase text-white">Owner Portal & Management</h1>
              <span class="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-mono">PROTECTED</span>
            </div>
            <p class="text-xs text-neutral-400 mt-0.5">Real-time inventory, local image uploads, brand styling, and customer orders</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="switchView('storefront')" class="px-4 py-2 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-neutral-700 transition-colors flex items-center gap-2">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Return to Storefront
          </button>
          <button onclick="lockAdminSession()" class="px-4 py-2 text-xs font-medium bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800/50 transition-colors flex items-center gap-2">
            <i data-lucide="lock" class="w-4 h-4"></i> Lock Portal
          </button>
        </div>
      </div>

      <!-- Admin Sub-Navigation Tabs -->
      <div class="flex overflow-x-auto gap-2 border-b border-neutral-800 pb-4 mb-8 no-scrollbar">
        <button onclick="switchAdminTab('products')" id="admin-tab-btn-products" class="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-neutral-950 flex items-center gap-2 transition-all">
          <i data-lucide="package" class="w-4 h-4"></i> Products & Inventory (<span id="admin-prod-count">0</span>)
        </button>
        <button onclick="switchAdminTab('orders')" id="admin-tab-btn-orders" class="px-4 py-2 text-xs font-semibold rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center gap-2 transition-all">
          <i data-lucide="shopping-cart" class="w-4 h-4"></i> Orders (<span id="admin-order-count">0</span>)
        </button>
        <button onclick="switchAdminTab('settings')" id="admin-tab-btn-settings" class="px-4 py-2 text-xs font-semibold rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center gap-2 transition-all">
          <i data-lucide="sliders" class="w-4 h-4"></i> Brand & Shop Customizer
        </button>
      </div>

      <!-- TAB: PRODUCTS & LOCAL IMAGE UPLOAD -->
      <div id="admin-tab-products" class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold tracking-wider uppercase text-neutral-300">Catalog Inventory</h2>
          <button onclick="openAddProductModal()" class="px-4 py-2 bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all">
            <i data-lucide="plus" class="w-4 h-4"></i> Add Product (Direct Image Upload)
          </button>
        </div>

        <!-- Admin Products Table -->
        <div class="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-neutral-300">
              <thead class="bg-neutral-900/80 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th class="py-3 px-4">Item & Local Photo</th>
                  <th class="py-3 px-4">Category</th>
                  <th class="py-3 px-4">Price</th>
                  <th class="py-3 px-4">Stock Level</th>
                  <th class="py-3 px-4">Sizes</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="admin-products-table-body" class="divide-y divide-neutral-800/60 font-medium">
                <!-- Dynamically injected -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB: ORDERS & INVENTORY TRACKING -->
      <div id="admin-tab-orders" class="hidden space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold tracking-wider uppercase text-neutral-300">Customer Orders</h2>
          <span class="text-xs text-neutral-400">All customer checkout orders synchronized locally</span>
        </div>
        <div class="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-neutral-300">
              <thead class="bg-neutral-900/80 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th class="py-3 px-4">Order ID & Date</th>
                  <th class="py-3 px-4">Customer</th>
                  <th class="py-3 px-4">Items</th>
                  <th class="py-3 px-4">Total</th>
                  <th class="py-3 px-4">Fulfillment Status</th>
                  <th class="py-3 px-4 text-right">Update</th>
                </tr>
              </thead>
              <tbody id="admin-orders-table-body" class="divide-y divide-neutral-800/60 font-medium">
                <!-- Injected via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB: BRAND & SHOP CUSTOMIZATION SETTINGS -->
      <div id="admin-tab-settings" class="hidden space-y-8">
        <form onsubmit="handleSaveStoreSettings(event)" class="bg-neutral-950 border border-neutral-800 rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 class="text-base font-bold text-white uppercase tracking-wider">Storefront Identity</h3>
            <p class="text-xs text-neutral-400 mt-1">Changes are saved to localStorage and instantly reflect on the public customer storefront.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">Brand Name</label>
              <input type="text" id="settings-brand-name" class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-white focus:outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">Brand Tagline</label>
              <input type="text" id="settings-brand-tagline" class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-white focus:outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">Top Notification Banner</label>
              <input type="text" id="settings-announcement" class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-white focus:outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">Admin Security PIN</label>
              <input type="password" id="settings-admin-pin" class="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-white focus:outline-none">
            </div>

            <!-- Local Brand Logo Upload (Base64) -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">Direct Local Brand Logo Upload (Base64)</label>
              <div class="flex items-center gap-4">
                <input type="file" id="settings-logo-file" accept="image/*" onchange="handleLocalLogoUpload(event)" class="text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700">
                <div id="settings-logo-preview" class="h-10 w-24 bg-neutral-900 border border-neutral-700 rounded-lg flex items-center justify-center overflow-hidden">
                  <span class="text-[10px] text-neutral-500">No Logo</span>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-neutral-800 flex justify-end">
            <button type="submit" class="px-6 py-2.5 bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-all">
              Save Brand Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="bg-neutral-950 text-white border-t border-neutral-800 pt-16 pb-12 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
      <div class="space-y-4">
        <span id="footer-brand-name" class="font-luxury text-xl tracking-[0.2em] font-semibold">${config.brandName}</span>
        <p class="text-xs text-neutral-400 font-light leading-relaxed">Contemporary tailoring and timeless silhouettes crafted from conscious materials.</p>
      </div>
      <div>
        <h4 class="text-xs font-semibold uppercase tracking-widest text-neutral-300 mb-4">Customer Care</h4>
        <ul class="space-y-2 text-xs text-neutral-400 font-light">
          <li><a href="#" class="hover:text-white transition-colors">Shipping & Returns</a></li>
          <li><a href="#" class="hover:text-white transition-colors">Garment Care Guide</a></li>
          <li><a href="#" class="hover:text-white transition-colors">Order Tracking</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-xs font-semibold uppercase tracking-widest text-neutral-300 mb-4">Atelier Contact</h4>
        <p class="text-xs text-neutral-400 font-light leading-relaxed">${config.studioAddress}<br>${config.contactEmail}<br>${config.contactPhone}</p>
      </div>
      <div>
        <h4 class="text-xs font-semibold uppercase tracking-widest text-neutral-300 mb-4">Shop Owner Portal</h4>
        <button onclick="openAdminGate()" class="text-xs text-neutral-400 hover:text-white flex items-center gap-2 p-2 bg-neutral-900 border border-neutral-800 rounded-lg">
          <i data-lucide="lock" class="w-3.5 h-3.5"></i> Protected Admin Management
        </button>
      </div>
    </div>
  </footer>

  <!-- CART SLIDE-OVER DRAWER -->
  <div id="cart-drawer-backdrop" onclick="closeCartDrawer()" class="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-50 hidden transition-opacity"></div>
  <div id="cart-drawer" class="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col translate-x-full transition-transform duration-300">
    <div class="p-6 border-b border-neutral-200 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <i data-lucide="shopping-bag" class="w-5 h-5 text-neutral-900"></i>
        <h3 class="font-luxury text-lg font-semibold tracking-wide text-neutral-950">Shopping Bag</h3>
      </div>
      <button onclick="closeCartDrawer()" class="p-2 text-neutral-500 hover:text-neutral-950 rounded-full hover:bg-neutral-100">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>

    <div id="cart-items-container" class="flex-1 overflow-y-auto p-6 space-y-4">
      <!-- Injected by JS -->
    </div>

    <div class="p-6 border-t border-neutral-200 bg-neutral-50 space-y-4">
      <div class="flex justify-between text-xs text-neutral-600">
        <span>Subtotal</span>
        <span id="cart-subtotal" class="font-semibold text-neutral-950">$0.00</span>
      </div>
      <button onclick="openCheckoutModal()" class="w-full py-3.5 bg-neutral-950 text-white text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-neutral-800 transition-all">
        Proceed to Checkout
      </button>
    </div>
  </div>

  <!-- CHECKOUT MODAL -->
  <div id="checkout-modal" class="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-50 hidden items-center justify-center p-4">
    <div class="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
        <h3 class="font-luxury text-xl font-bold text-neutral-950">Complete Your Order</h3>
        <button onclick="closeCheckoutModal()" class="text-neutral-400 hover:text-neutral-950"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>

      <form onsubmit="handlePlaceOrder(event)" class="space-y-4 text-xs">
        <div>
          <label class="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">Full Name</label>
          <input type="text" id="checkout-name" required class="w-full border border-neutral-300 rounded-lg p-2.5 focus:ring-1 focus:ring-neutral-950 focus:outline-none">
        </div>
        <div>
          <label class="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">Email Address</label>
          <input type="email" id="checkout-email" required class="w-full border border-neutral-300 rounded-lg p-2.5 focus:ring-1 focus:ring-neutral-950 focus:outline-none">
        </div>
        <div>
          <label class="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">Shipping Address</label>
          <input type="text" id="checkout-street" required placeholder="Street address" class="w-full border border-neutral-300 rounded-lg p-2.5 focus:ring-1 focus:ring-neutral-950 focus:outline-none">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">City</label>
            <input type="text" id="checkout-city" required class="w-full border border-neutral-300 rounded-lg p-2.5 focus:ring-1 focus:ring-neutral-950 focus:outline-none">
          </div>
          <div>
            <label class="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">Postal Code</label>
            <input type="text" id="checkout-zip" required class="w-full border border-neutral-300 rounded-lg p-2.5 focus:ring-1 focus:ring-neutral-950 focus:outline-none">
          </div>
        </div>
        <button type="submit" class="w-full py-3.5 bg-neutral-950 text-white font-bold tracking-widest uppercase rounded-lg hover:bg-neutral-800 transition-all mt-4">
          Place Secure Order
        </button>
      </form>
    </div>
  </div>

  <!-- ADMIN PIN LOGIN MODAL -->
  <div id="admin-login-modal" class="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 hidden items-center justify-center p-4">
    <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full text-white shadow-2xl text-center">
      <div class="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400">
        <i data-lucide="key" class="w-6 h-6"></i>
      </div>
      <h3 class="text-xl font-bold tracking-wider uppercase mb-2">Owner Authentication</h3>
      <p class="text-xs text-neutral-400 mb-6">Enter your protected admin security PIN (Default: <code class="bg-neutral-800 px-1 py-0.5 rounded text-amber-300 font-mono">admin123</code>)</p>
      
      <form onsubmit="handleAdminLogin(event)" class="space-y-4">
        <input type="password" id="admin-pin-input" placeholder="Enter PIN / Password" required class="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-center text-lg tracking-widest text-white focus:outline-none focus:border-amber-400 font-mono">
        <div class="flex gap-3">
          <button type="button" onclick="closeAdminGate()" class="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-semibold uppercase">Cancel</button>
          <button type="submit" class="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-bold uppercase tracking-wider">Authenticate</button>
        </div>
      </form>
    </div>
  </div>

  <!-- JAVASCRIPT ENGINE & LOCALSTORAGE PERSISTENCE -->
  <script>
    // State Store
    let storeConfig = ${serializedConfig};
    let products = ${serializedProducts};
    let coupons = ${serializedCoupons};
    let orders = ${serializedOrders};
    let cart = [];
    let currentCategory = 'All';
    let currentSort = 'featured';
    let searchQuery = '';

    // Initialize from localStorage if exists
    function initApp() {
      try {
        const localCfg = localStorage.getItem('aura_store_config');
        if (localCfg) storeConfig = JSON.parse(localCfg);
        const localProds = localStorage.getItem('aura_products');
        if (localProds) products = JSON.parse(localProds);
        const localOrders = localStorage.getItem('aura_orders');
        if (localOrders) orders = JSON.parse(localOrders);
        const localCart = localStorage.getItem('aura_cart_items');
        if (localCart) cart = JSON.parse(localCart);
      } catch(e) {
        console.warn('LocalStorage init fallback', e);
      }
      renderStorefront();
      renderCart();
      lucide.createIcons();
    }

    function renderStorefront() {
      // Update brand info
      document.getElementById('brand-name-display').innerText = storeConfig.brandName;
      document.getElementById('brand-tagline-display').innerText = storeConfig.tagline;
      document.getElementById('hero-headline').innerText = storeConfig.heroHeadline;
      document.getElementById('hero-subheadline').innerText = storeConfig.heroSubheadline;
      document.getElementById('announcement-text').innerText = storeConfig.announcementText;
      document.getElementById('footer-brand-name').innerText = storeConfig.brandName;

      // Filter and sort products
      let filtered = products.filter(p => {
        const matchesCat = currentCategory === 'All' || p.category === currentCategory;
        const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      });

      if (currentSort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
      else if (currentSort === 'price-desc') filtered.sort((a,b) => b.price - a.price);
      else if (currentSort === 'rating') filtered.sort((a,b) => b.rating - a.rating);

      const container = document.getElementById('products-container');
      if (filtered.length === 0) {
        container.innerHTML = '<div class="col-span-4 py-16 text-center text-neutral-400 text-sm">No garments found matching this selection.</div>';
        return;
      }

      container.innerHTML = filtered.map(p => \`
        <div class="group flex flex-col bg-white rounded-sm overflow-hidden border border-neutral-200/80 hover:shadow-xl transition-all duration-300">
          <div class="relative aspect-[3/4] overflow-hidden bg-neutral-100">
            <img src="\${p.image}" alt="\${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            \${p.badges && p.badges.length > 0 ? \`<span class="absolute top-3 left-3 bg-neutral-950 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-sm">\${p.badges[0]}</span>\` : ''}
          </div>
          <div class="p-5 flex flex-col flex-1">
            <span class="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">\${p.category}</span>
            <h3 class="text-sm font-semibold text-neutral-900 mt-1 mb-1 line-clamp-1">\${p.title}</h3>
            <p class="text-xs text-neutral-500 line-clamp-2 mb-4 font-light flex-1">\${p.subtitle || p.description}</p>
            <div class="flex items-center justify-between pt-3 border-t border-neutral-100 mt-auto">
              <div>
                <span class="text-sm font-bold text-neutral-950">\${storeConfig.currencySymbol}\${p.price}</span>
                \${p.originalPrice && p.originalPrice > p.price ? \`<span class="text-xs text-neutral-400 line-through ml-1.5">\${storeConfig.currencySymbol}\${p.originalPrice}</span>\` : ''}
              </div>
              <button onclick="addToCart('\${p.id}')" class="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1.5">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
              </button>
            </div>
          </div>
        </div>
      \`).join('');

      lucide.createIcons();
    }

    function filterCategory(cat) {
      currentCategory = cat;
      ['All', 'Tops', 'Outerwear', 'Bottoms', 'Dresses', 'Accessories'].forEach(c => {
        const btn = document.getElementById('tab-' + c);
        if (btn) {
          if (c === cat) {
            btn.className = 'px-3 py-1.5 rounded-md bg-white text-neutral-950 shadow-sm transition-all';
          } else {
            btn.className = 'px-3 py-1.5 rounded-md text-neutral-600 hover:text-neutral-950 transition-all';
          }
        }
      });
      renderStorefront();
    }

    function handleSort(val) {
      currentSort = val;
      renderStorefront();
    }

    function handleSearch(val) {
      searchQuery = val;
      renderStorefront();
    }

    function addToCart(productId) {
      const prod = products.find(p => p.id === productId);
      if (!prod) return;
      const existing = cart.find(item => item.product.id === productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ product: prod, selectedSize: prod.sizes[0] || 'M', quantity: 1 });
      }
      localStorage.setItem('aura_cart_items', JSON.stringify(cart));
      renderCart();
      openCartDrawer();
    }

    function renderCart() {
      const countBadge = document.getElementById('cart-count-badge');
      const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
      countBadge.innerText = totalCount;

      const container = document.getElementById('cart-items-container');
      if (cart.length === 0) {
        container.innerHTML = '<div class="py-12 text-center text-neutral-400 text-xs font-light">Your shopping bag is currently empty.</div>';
        document.getElementById('cart-subtotal').innerText = storeConfig.currencySymbol + '0.00';
        return;
      }

      let subtotal = 0;
      container.innerHTML = cart.map((item, idx) => {
        subtotal += item.product.price * item.quantity;
        return \`
          <div class="flex gap-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <img src="\${item.product.image}" class="w-16 h-20 object-cover rounded bg-neutral-200">
            <div class="flex-1 flex flex-col justify-between">
              <div>
                <h4 class="text-xs font-bold text-neutral-900">\${item.product.title}</h4>
                <span class="text-[10px] text-neutral-500 uppercase tracking-wider">Size: \${item.selectedSize}</span>
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs font-bold text-neutral-950">\${storeConfig.currencySymbol}\${item.product.price}</span>
                <div class="flex items-center gap-2">
                  <button onclick="updateCartQty(\${idx}, -1)" class="w-5 h-5 bg-white border border-neutral-300 rounded flex items-center justify-center text-xs">-</button>
                  <span class="text-xs font-semibold">\${item.quantity}</span>
                  <button onclick="updateCartQty(\${idx}, 1)" class="w-5 h-5 bg-white border border-neutral-300 rounded flex items-center justify-center text-xs">+</button>
                </div>
              </div>
            </div>
          </div>
        \`;
      }).join('');

      document.getElementById('cart-subtotal').innerText = storeConfig.currencySymbol + subtotal.toFixed(2);
      lucide.createIcons();
    }

    function updateCartQty(idx, change) {
      if (!cart[idx]) return;
      cart[idx].quantity += change;
      if (cart[idx].quantity <= 0) cart.splice(idx, 1);
      localStorage.setItem('aura_cart_items', JSON.stringify(cart));
      renderCart();
    }

    function openCartDrawer() {
      document.getElementById('cart-drawer-backdrop').classList.remove('hidden');
      document.getElementById('cart-drawer').classList.remove('translate-x-full');
    }

    function closeCartDrawer() {
      document.getElementById('cart-drawer-backdrop').classList.add('hidden');
      document.getElementById('cart-drawer').classList.add('translate-x-full');
    }

    function openCheckoutModal() {
      closeCartDrawer();
      document.getElementById('checkout-modal').classList.remove('hidden');
      document.getElementById('checkout-modal').classList.add('flex');
    }

    function closeCheckoutModal() {
      document.getElementById('checkout-modal').classList.add('hidden');
      document.getElementById('checkout-modal').classList.remove('flex');
    }

    function handlePlaceOrder(e) {
      e.preventDefault();
      if (cart.length === 0) return;
      const name = document.getElementById('checkout-name').value;
      const email = document.getElementById('checkout-email').value;
      const street = document.getElementById('checkout-street').value;
      const city = document.getElementById('checkout-city').value;
      const zip = document.getElementById('checkout-zip').value;

      const subtotal = cart.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);
      const newOrder = {
        id: 'ord-' + Date.now(),
        orderNumber: 'AUR-' + Math.floor(100000 + Math.random() * 900000),
        customerId: 'cust-local',
        customerName: name,
        customerEmail: email,
        shippingAddress: { street, city, state: 'Local', zip, country: 'USA' },
        items: cart.map(c => ({
          productId: c.product.id,
          title: c.product.title,
          size: c.selectedSize,
          price: c.product.price,
          quantity: c.quantity,
          image: c.product.image
        })),
        subtotal: subtotal,
        discount: 0,
        tax: subtotal * 0.08,
        shippingCost: subtotal >= 150 ? 0 : 15,
        total: subtotal + (subtotal * 0.08),
        status: 'Processing',
        paymentMethod: 'Simulated Online Pay',
        createdAt: new Date().toISOString()
      };

      orders.unshift(newOrder);
      localStorage.setItem('aura_orders', JSON.stringify(orders));
      cart = [];
      localStorage.setItem('aura_cart_items', JSON.stringify(cart));
      renderCart();
      closeCheckoutModal();
      alert('Order Confirmed! Order Number: ' + newOrder.orderNumber);
    }

    // ADMIN ROUTING & SECURITY
    function openAdminGate() {
      if (sessionStorage.getItem('aura_admin_auth') === 'true') {
        switchView('admin');
      } else {
        document.getElementById('admin-login-modal').classList.remove('hidden');
        document.getElementById('admin-login-modal').classList.add('flex');
      }
    }

    function closeAdminGate() {
      document.getElementById('admin-login-modal').classList.add('hidden');
      document.getElementById('admin-login-modal').classList.remove('flex');
    }

    function handleAdminLogin(e) {
      e.preventDefault();
      const pin = document.getElementById('admin-pin-input').value;
      if (pin === (storeConfig.adminPin || 'admin123')) {
        sessionStorage.setItem('aura_admin_auth', 'true');
        closeAdminGate();
        switchView('admin');
      } else {
        alert('Invalid Admin PIN. Default is: admin123');
      }
    }

    function lockAdminSession() {
      sessionStorage.removeItem('aura_admin_auth');
      switchView('storefront');
    }

    function switchView(view) {
      if (view === 'admin') {
        document.getElementById('storefront-view').classList.add('hidden');
        document.getElementById('admin-view').classList.remove('hidden');
        renderAdminDashboard();
      } else {
        document.getElementById('admin-view').classList.add('hidden');
        document.getElementById('storefront-view').classList.remove('hidden');
        renderStorefront();
      }
      window.scrollTo(0,0);
    }

    function switchAdminTab(tab) {
      ['products', 'orders', 'settings'].forEach(t => {
        document.getElementById('admin-tab-' + t).classList.add('hidden');
        document.getElementById('admin-tab-btn-' + t).className = 'px-4 py-2 text-xs font-semibold rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center gap-2 transition-all';
      });
      document.getElementById('admin-tab-' + tab).classList.remove('hidden');
      document.getElementById('admin-tab-btn-' + tab).className = 'px-4 py-2 text-xs font-semibold rounded-lg bg-white text-neutral-950 flex items-center gap-2 transition-all';
      lucide.createIcons();
    }

    function renderAdminDashboard() {
      document.getElementById('admin-prod-count').innerText = products.length;
      document.getElementById('admin-order-count').innerText = orders.length;

      // Render Admin Products Table
      const prodBody = document.getElementById('admin-products-table-body');
      prodBody.innerHTML = products.map(p => \`
        <tr class="hover:bg-neutral-900/50">
          <td class="py-3 px-4 flex items-center gap-3">
            <img src="\${p.image}" class="w-10 h-12 object-cover rounded bg-neutral-800 border border-neutral-700">
            <div>
              <div class="font-bold text-white">\${p.title}</div>
              <div class="text-[10px] text-neutral-500 font-mono">\${p.sku || 'SKU-NONE'}</div>
            </div>
          </td>
          <td class="py-3 px-4">\${p.category}</td>
          <td class="py-3 px-4 font-bold text-white">\${storeConfig.currencySymbol}\${p.price}</td>
          <td class="py-3 px-4">\${p.stock} units</td>
          <td class="py-3 px-4">\${p.sizes.join(', ')}</td>
          <td class="py-3 px-4 text-right">
            <button onclick="deleteProduct('\${p.id}')" class="text-rose-400 hover:text-rose-300 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
          </td>
        </tr>
      \`).join('');

      // Render Admin Orders Table
      const orderBody = document.getElementById('admin-orders-table-body');
      orderBody.innerHTML = orders.map(o => \`
        <tr class="hover:bg-neutral-900/50">
          <td class="py-3 px-4">
            <span class="font-mono text-amber-300 font-bold">\${o.orderNumber}</span>
            <div class="text-[10px] text-neutral-500">\${new Date(o.createdAt).toLocaleDateString()}</div>
          </td>
          <td class="py-3 px-4">
            <div class="text-white">\${o.customerName}</div>
            <div class="text-[10px] text-neutral-500">\${o.customerEmail}</div>
          </td>
          <td class="py-3 px-4">\${o.items.length} items</td>
          <td class="py-3 px-4 font-bold text-white">\${storeConfig.currencySymbol}\${o.total.toFixed(2)}</td>
          <td class="py-3 px-4"><span class="px-2 py-0.5 bg-neutral-800 rounded text-[10px] font-bold text-amber-300">\${o.status}</span></td>
          <td class="py-3 px-4 text-right">
            <select onchange="updateOrderStatus('\${o.id}', this.value)" class="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white">
              <option value="Processing" \${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="Shipped" \${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" \${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" \${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
        </tr>
      \`).join('');

      // Populate Settings inputs
      document.getElementById('settings-brand-name').value = storeConfig.brandName;
      document.getElementById('settings-brand-tagline').value = storeConfig.tagline;
      document.getElementById('settings-announcement').value = storeConfig.announcementText;
      document.getElementById('settings-admin-pin').value = storeConfig.adminPin || 'admin123';

      lucide.createIcons();
    }

    function deleteProduct(id) {
      if (confirm('Delete this product from inventory?')) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('aura_products', JSON.stringify(products));
        renderAdminDashboard();
      }
    }

    function updateOrderStatus(id, status) {
      const order = orders.find(o => o.id === id);
      if (order) {
        order.status = status;
        localStorage.setItem('aura_orders', JSON.stringify(orders));
        renderAdminDashboard();
      }
    }

    function handleSaveStoreSettings(e) {
      e.preventDefault();
      storeConfig.brandName = document.getElementById('settings-brand-name').value;
      storeConfig.tagline = document.getElementById('settings-brand-tagline').value;
      storeConfig.announcementText = document.getElementById('settings-announcement').value;
      storeConfig.adminPin = document.getElementById('settings-admin-pin').value;
      localStorage.setItem('aura_store_config', JSON.stringify(storeConfig));
      alert('Brand & Shop settings updated!');
      renderAdminDashboard();
    }

    function handleLocalLogoUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        storeConfig.logoImage = evt.target.result;
        document.getElementById('settings-logo-preview').innerHTML = '<img src="' + evt.target.result + '" class="h-full object-contain">';
      };
      reader.readAsDataURL(file);
    }

    function openCustomerAuthModal() {
      alert('Customer Account Portal: Simulated Google Sign-In and Shipping Profile ready in full React engine.');
    }

    // Startup
    window.addEventListener('DOMContentLoaded', initApp);
  </script>
</body>
</html>`;
}

export const generateStandaloneHTML = generateStandaloneHtml;
