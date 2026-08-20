import React, { useState } from 'react';
import { StoreConfig } from '../../types';
import {
  Save,
  Upload,
  Image as ImageIcon,
  Check,
  Sliders,
  Shield,
  FileText,
  Bell,
  Globe,
  DollarSign,
  Smartphone,
  Key,
  ExternalLink,
  Truck,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminStoreSettingsProps {
  config: StoreConfig;
  onSaveConfig: (updated: StoreConfig) => void;
}

export const AdminStoreSettings: React.FC<AdminStoreSettingsProps> = ({ config, onSaveConfig }) => {
  const [brandName, setBrandName] = useState(config.brandName);
  const [tagline, setTagline] = useState(config.tagline);
  const [logoImage, setLogoImage] = useState(config.logoImage || '');
  const [heroHeadline, setHeroHeadline] = useState(config.heroHeadline);
  const [heroSubheadline, setHeroSubheadline] = useState(config.heroSubheadline);
  const [heroImage, setHeroImage] = useState(config.heroImage || '');
  const [announcementText, setAnnouncementText] = useState(config.announcementText);
  const [showAnnouncement, setShowAnnouncement] = useState(config.showAnnouncement);
  
  // Currency & Commerce
  const [currencySymbol, setCurrencySymbol] = useState(config.currencySymbol || '৳');
  const [currencyCode, setCurrencyCode] = useState(config.currencyCode || 'BDT');
  const [taxRate, setTaxRate] = useState(config.taxRate * 100);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(config.freeShippingThreshold || 3000);
  
  // Google OAuth Developer Client ID
  const [googleClientId, setGoogleClientId] = useState(config.googleClientId || '');

  // Bangladesh & Global Delivery and Payment numbers
  const [deliveryDhakaCity, setDeliveryDhakaCity] = useState(config.deliveryDhakaCity ?? 70);
  const [deliveryOutsideDhaka, setDeliveryOutsideDhaka] = useState(config.deliveryOutsideDhaka ?? 130);
  const [bkashMerchantNumber, setBkashMerchantNumber] = useState(config.bkashMerchantNumber || '01712-345678');
  const [nagadMerchantNumber, setNagadMerchantNumber] = useState(config.nagadMerchantNumber || '01812-345678');
  const [rocketMerchantNumber, setRocketMerchantNumber] = useState(config.rocketMerchantNumber || '01912-345678');

  // Contact & Legal
  const [contactEmail, setContactEmail] = useState(config.contactEmail);
  const [contactPhone, setContactPhone] = useState(config.contactPhone);
  const [studioAddress, setStudioAddress] = useState(config.studioAddress);
  const [shippingPolicy, setShippingPolicy] = useState(config.shippingPolicy);
  const [returnPolicy, setReturnPolicy] = useState(config.returnPolicy);
  const [privacyPolicy, setPrivacyPolicy] = useState(config.privacyPolicy);
  const [termsOfService, setTermsOfService] = useState(config.termsOfService);
  const [adminPin, setAdminPin] = useState(config.adminPin || 'admin123');
  const [showAdminPin, setShowAdminPin] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Quick Currency Preset handler
  const handleSelectCurrency = (sym: string, code: string) => {
    setCurrencySymbol(sym);
    setCurrencyCode(code);
  };

  // Direct Local Logo Upload via FileReader (Base64)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setLogoImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Direct Local Hero Background Upload via FileReader (Base64)
  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setHeroImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreConfig = {
      ...config,
      brandName,
      tagline,
      logoText: brandName.slice(0, 4).toUpperCase(),
      logoImage,
      heroHeadline,
      heroSubheadline,
      heroImage,
      announcementText,
      showAnnouncement,
      currencySymbol,
      currencyCode,
      taxRate: Number(taxRate) / 100,
      freeShippingThreshold: Number(freeShippingThreshold),
      googleClientId: googleClientId.trim(),
      deliveryDhakaCity: Number(deliveryDhakaCity),
      deliveryOutsideDhaka: Number(deliveryOutsideDhaka),
      bkashMerchantNumber: bkashMerchantNumber.trim(),
      nagadMerchantNumber: nagadMerchantNumber.trim(),
      rocketMerchantNumber: rocketMerchantNumber.trim(),
      contactEmail,
      contactPhone,
      studioAddress,
      shippingPolicy,
      returnPolicy,
      privacyPolicy,
      termsOfService,
      adminPin,
    };

    onSaveConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-fadeIn text-xs">
      
      {/* SECTION 1: GOOGLE DEVELOPER OAUTH INTEGRATION */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Google Developer Account & Real OAuth 2.0</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono font-normal">
                Production Auth
              </span>
            </h3>
            <p className="text-neutral-400">
              Connect your official Google Cloud Console OAuth 2.0 Web Client ID for authentic one-click Google Sign-In.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Google OAuth 2.0 Client ID (Web Application)
            </label>
            <input
              type="text"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder="e.g. 1234567890-abcdefg12345.apps.googleusercontent.com"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 text-xs font-mono"
            />
            <p className="text-[11px] text-neutral-500 mt-1.5">
              Stored securely in local application settings. You can also specify it in <code className="text-amber-400 font-mono">.env</code> as <code className="text-amber-400 font-mono">VITE_GOOGLE_CLIENT_ID</code>.
            </p>
          </div>

          <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-2 text-[11px] text-neutral-400">
            <div className="font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Cloud Console Setup Instructions:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-neutral-300">
              <li>Open the <span className="text-white font-semibold">Google Cloud Console &gt; APIs & Services &gt; Credentials</span>.</li>
              <li>Create an <span className="text-white font-semibold">OAuth 2.0 Client ID</span> with type <span className="text-white font-semibold">Web application</span>.</li>
              <li>Add your current hosting URL (<code className="text-amber-300 font-mono">{window.location.origin}</code>) to <span className="text-white font-semibold">Authorized JavaScript origins</span>.</li>
              <li>Paste the generated Client ID above and click <span className="text-amber-400 font-semibold">Save Store Settings</span> below.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* SECTION 2: CURRENCY & PRICING PRESETS */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <div className="p-2 bg-emerald-400/10 text-emerald-400 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Store Currency & Regional Pricing
            </h3>
            <p className="text-neutral-400">
              Select Bangladeshi Taka (৳ BDT) or customize for international multi-currency markets.
            </p>
          </div>
        </div>

        {/* Currency Presets */}
        <div className="space-y-3">
          <label className="block font-semibold uppercase tracking-wider text-neutral-300">
            Quick Currency Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => handleSelectCurrency('৳', 'BDT')}
              className={`p-3 rounded-xl border text-left transition-all ${
                currencySymbol === '৳'
                  ? 'border-amber-400 bg-amber-400/10 text-white shadow-md'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>🇧🇩 ৳ BDT</span>
                {currencySymbol === '৳' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Bangladeshi Taka (টাকা)</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCurrency('$', 'USD')}
              className={`p-3 rounded-xl border text-left transition-all ${
                currencySymbol === '$'
                  ? 'border-amber-400 bg-amber-400/10 text-white shadow-md'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>🇺🇸 $ USD</span>
                {currencySymbol === '$' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">US Dollar</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCurrency('€', 'EUR')}
              className={`p-3 rounded-xl border text-left transition-all ${
                currencySymbol === '€'
                  ? 'border-amber-400 bg-amber-400/10 text-white shadow-md'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>🇪🇺 € EUR</span>
                {currencySymbol === '€' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Euro</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCurrency('£', 'GBP')}
              className={`p-3 rounded-xl border text-left transition-all ${
                currencySymbol === '£'
                  ? 'border-amber-400 bg-amber-400/10 text-white shadow-md'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>🇬🇧 £ GBP</span>
                {currencySymbol === '£' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">British Pound</div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Currency Symbol / Logo
            </label>
            <input
              type="text"
              required
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white font-mono text-base focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Currency Code (ISO)
            </label>
            <input
              type="text"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-400"
              placeholder="BDT"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Complimentary Free Delivery Over ({currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: BANGLADESH & REGIONAL DELIVERY & PAYMENT NUMBERS */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              bKash / Nagad / Rocket MFS & Courier Rates
            </h3>
            <p className="text-neutral-400">
              Provide merchant numbers for instant mobile payments and set localized courier delivery charges.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              bKash (বিকাশ) Number
            </label>
            <input
              type="text"
              value={bkashMerchantNumber}
              onChange={(e) => setBkashMerchantNumber(e.target.value)}
              placeholder="017XX-XXXXXX"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Nagad (নগদ) Number
            </label>
            <input
              type="text"
              value={nagadMerchantNumber}
              onChange={(e) => setNagadMerchantNumber(e.target.value)}
              placeholder="018XX-XXXXXX"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Rocket (রকেট) Number
            </label>
            <input
              type="text"
              value={rocketMerchantNumber}
              onChange={(e) => setRocketMerchantNumber(e.target.value)}
              placeholder="019XX-XXXXXX"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Inside Dhaka Delivery Fee ({currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              value={deliveryDhakaCity}
              onChange={(e) => setDeliveryDhakaCity(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Outside Dhaka / Nationwide Delivery Fee ({currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              value={deliveryOutsideDhaka}
              onChange={(e) => setDeliveryOutsideDhaka(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: BRAND IDENTITY & LOGO */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Brand Identity & Visual Assets
            </h3>
            <p className="text-neutral-400">
              Customize the name, slogan, and local logo image that appears on the public storefront.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Brand / Atelier Name
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 text-sm font-semibold tracking-wider"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Brand Tagline / Slogan
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 text-sm"
            />
          </div>

          {/* Local Brand Logo File Upload (Base64) */}
          <div className="sm:col-span-2 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-3">
            <label className="block font-semibold uppercase tracking-wider text-amber-300">
              Direct Local Brand Logo (Base64 File Upload)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="h-14 w-36 bg-neutral-950 border border-neutral-700 rounded-xl flex items-center justify-center p-2 overflow-hidden shrink-0">
                {logoImage ? (
                  <img src={logoImage} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-[11px] text-neutral-500">No Custom Logo</span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-400 file:text-neutral-950 hover:file:bg-amber-300 font-semibold cursor-pointer"
                />
                {logoImage && (
                  <button
                    type="button"
                    onClick={() => setLogoImage('')}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Remove custom logo image
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: TOP ANNOUNCEMENT BANNER */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <div className="p-2 bg-purple-400/10 text-purple-400 rounded-lg">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Storefront Notification Banner
            </h3>
            <p className="text-neutral-400">
              Set announcement notifications, promotional coupon hints, or seasonal notices.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAnnouncement}
              onChange={(e) => setShowAnnouncement(e.target.checked)}
              className="rounded border-neutral-700 text-amber-400 focus:ring-amber-400 w-4 h-4"
            />
            <span className="text-neutral-200 font-semibold">Enable Top Header Notification Banner</span>
          </label>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Announcement Message Copy
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 text-xs"
            />
          </div>
        </div>
      </div>

      {/* SECTION 6: HERO BANNER EDITORIAL */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <div className="p-2 bg-blue-400/10 text-blue-400 rounded-lg">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Hero Section Editorial Design
            </h3>
            <p className="text-neutral-400">
              Customize the front-page primary banner headline, narrative text, and local background image.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Hero Headline
            </label>
            <input
              type="text"
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 text-sm font-serif"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Hero Subheadline & Story Statement
            </label>
            <textarea
              rows={3}
              value={heroSubheadline}
              onChange={(e) => setHeroSubheadline(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 text-xs"
            />
          </div>

          {/* Hero background local upload */}
          <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-3">
            <label className="block font-semibold uppercase tracking-wider text-amber-300">
              Direct Hero Background Photo (Base64 File Upload)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleHeroImageUpload}
              className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-400 file:text-neutral-950 hover:file:bg-amber-300 font-semibold cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* SECTION 7: COMMERCE CONTACT & LEGAL POLICIES */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <div className="p-2 bg-emerald-400/10 text-emerald-400 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Studio Contact & Legal Policies
            </h3>
            <p className="text-neutral-400">
              Set customer service channels, physical studio address, and customer policy terms.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Concierge Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Customer Phone / Hotline
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Studio Address
            </label>
            <input
              type="text"
              value={studioAddress}
              onChange={(e) => setStudioAddress(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Shipping & Courier Policy
            </label>
            <textarea
              rows={3}
              value={shippingPolicy}
              onChange={(e) => setShippingPolicy(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
              Returns & Exchanges Policy
            </label>
            <textarea
              rows={3}
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 text-xs"
            />
          </div>
        </div>
      </div>

      {/* SECTION 8: ADMIN SECURITY PIN */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <div className="p-2 bg-rose-400/10 text-rose-400 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Admin Access Passcode / Security PIN
            </h3>
            <p className="text-neutral-400">
              Change the secret PIN required to access this dedicated admin portal link.
            </p>
          </div>
        </div>

        <div className="max-w-xs">
          <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
            Master Security PIN
          </label>
          <div className="relative">
            <input
              type={showAdminPin ? 'text' : 'password'}
              required
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 pr-10 text-white font-mono text-sm tracking-widest focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => setShowAdminPin(!showAdminPin)}
              className="absolute right-3 top-3 text-neutral-400 hover:text-white"
            >
              {showAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-6 z-20 flex items-center justify-between p-4 bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-neutral-700 shadow-2xl">
        <div>
          {savedSuccess && (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
              <Check className="w-4 h-4" /> Brand & OAuth settings saved & applied live!
            </span>
          )}
        </div>

        <button
          type="submit"
          className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center gap-2 active:scale-98"
        >
          <Save className="w-4 h-4" />
          <span>Save Store Settings</span>
        </button>
      </div>
    </form>
  );
};

