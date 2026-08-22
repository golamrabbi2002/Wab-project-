import React, { useState } from 'react';
import { StoreConfig } from '../../types';
import { GoogleDriveSheetService } from '../../services/googleDriveSheetService';
import { SecurityService } from '../../services/securityService';
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
  Cloud,
  FileSpreadsheet,
  HardDrive,
  Database,
  RefreshCw,
  Sparkles,
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
  
  // Cloud, Google Sheets & Google Drive Integration
  const [googleSheetUrl, setGoogleSheetUrl] = useState(config.googleSheetUrl || '');
  const [googleDriveFolderUrl, setGoogleDriveFolderUrl] = useState(config.googleDriveFolderUrl || '');
  const [autoSyncGoogleSheets, setAutoSyncGoogleSheets] = useState(config.autoSyncGoogleSheets ?? true);
  const [autoSyncGoogleDrive, setAutoSyncGoogleDrive] = useState(config.autoSyncGoogleDrive ?? true);

  // Currency & Commerce
  const [currencySymbol, setCurrencySymbol] = useState(config.currencySymbol || '৳');
  const [currencyCode, setCurrencyCode] = useState(config.currencyCode || 'BDT');
  const [taxRate, setTaxRate] = useState(config.taxRate * 100);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(config.freeShippingThreshold || 3000);
  
  // Google OAuth Developer Client ID
  const [googleClientId, setGoogleClientId] = useState(config.googleClientId || '');

  // Gemini AI Free API Key & Configuration
  const [geminiApiKey, setGeminiApiKey] = useState(config.geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiBotName, setAiBotName] = useState(config.aiBotName || 'Bismillah AI');
  const [aiTone, setAiTone] = useState<'logical_robot' | 'polite_assistant' | 'formal'>(config.aiTone || 'logical_robot');

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

  // Sync state when config updates externally
  React.useEffect(() => {
    setBrandName(config.brandName);
    setTagline(config.tagline);
    setLogoImage(config.logoImage || '');
    setHeroHeadline(config.heroHeadline);
    setHeroSubheadline(config.heroSubheadline);
    setHeroImage(config.heroImage || '');
    setAnnouncementText(config.announcementText);
    setShowAnnouncement(config.showAnnouncement);
    setGoogleSheetUrl(config.googleSheetUrl || '');
    setGoogleDriveFolderUrl(config.googleDriveFolderUrl || '');
    setAutoSyncGoogleSheets(config.autoSyncGoogleSheets ?? true);
    setAutoSyncGoogleDrive(config.autoSyncGoogleDrive ?? true);
    setCurrencySymbol(config.currencySymbol || '৳');
    setCurrencyCode(config.currencyCode || 'BDT');
    setTaxRate(config.taxRate * 100);
    setFreeShippingThreshold(config.freeShippingThreshold || 3000);
    setGoogleClientId(config.googleClientId || '');
    setDeliveryDhakaCity(config.deliveryDhakaCity ?? 70);
    setDeliveryOutsideDhaka(config.deliveryOutsideDhaka ?? 130);
    setBkashMerchantNumber(config.bkashMerchantNumber || '01712-345678');
    setNagadMerchantNumber(config.nagadMerchantNumber || '01812-345678');
    setRocketMerchantNumber(config.rocketMerchantNumber || '01912-345678');
    setContactEmail(config.contactEmail);
    setContactPhone(config.contactPhone);
    setStudioAddress(config.studioAddress);
    setShippingPolicy(config.shippingPolicy);
    setReturnPolicy(config.returnPolicy);
    setPrivacyPolicy(config.privacyPolicy);
    setTermsOfService(config.termsOfService);
    setAdminPin(config.adminPin || 'admin123');
    setGeminiApiKey(config.geminiApiKey || '');
    setAiBotName(config.aiBotName || 'Bismillah AI');
    setAiTone(config.aiTone || 'logical_robot');
  }, [config]);

  // Quick Currency Preset handler
  const handleSelectCurrency = (sym: string, code: string) => {
    setCurrencySymbol(sym);
    setCurrencyCode(code);
  };

  // Direct Local Logo Upload via FileReader (with auto Google Drive URL format support)
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

  // Direct Local Hero Background Upload via FileReader
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
      brandName: SecurityService.sanitizeText(brandName, 100),
      tagline: SecurityService.sanitizeText(tagline, 200),
      logoText: SecurityService.sanitizeText(brandName.slice(0, 4).toUpperCase(), 10),
      logoImage: logoImage.trim(),
      heroHeadline: SecurityService.sanitizeText(heroHeadline, 200),
      heroSubheadline: SecurityService.sanitizeText(heroSubheadline, 500),
      heroImage: heroImage.trim(),
      announcementText: SecurityService.sanitizeText(announcementText, 300),
      showAnnouncement,
      currencySymbol: SecurityService.sanitizeText(currencySymbol, 10),
      currencyCode: SecurityService.sanitizeText(currencyCode, 10),
      taxRate: Math.max(0, Number(taxRate) / 100),
      freeShippingThreshold: Math.max(0, Number(freeShippingThreshold)),
      googleClientId: googleClientId.trim(),
      googleSheetUrl: googleSheetUrl.trim(),
      googleDriveFolderUrl: googleDriveFolderUrl.trim(),
      autoSyncGoogleSheets,
      autoSyncGoogleDrive,
      deliveryDhakaCity: Math.max(0, Number(deliveryDhakaCity)),
      deliveryOutsideDhaka: Math.max(0, Number(deliveryOutsideDhaka)),
      bkashMerchantNumber: SecurityService.sanitizePhone(bkashMerchantNumber),
      nagadMerchantNumber: SecurityService.sanitizePhone(nagadMerchantNumber),
      rocketMerchantNumber: SecurityService.sanitizePhone(rocketMerchantNumber),
      contactEmail: SecurityService.sanitizeEmail(contactEmail),
      contactPhone: SecurityService.sanitizePhone(contactPhone),
      studioAddress: SecurityService.sanitizeText(studioAddress, 300),
      shippingPolicy: SecurityService.sanitizeText(shippingPolicy, 2000),
      returnPolicy: SecurityService.sanitizeText(returnPolicy, 2000),
      privacyPolicy: SecurityService.sanitizeText(privacyPolicy, 2000),
      termsOfService: SecurityService.sanitizeText(termsOfService, 2000),
      adminPin: adminPin.trim() || 'admin123',
      geminiApiKey: geminiApiKey.trim(),
      aiBotName: SecurityService.sanitizeText(aiBotName || 'Bismillah AI', 50),
      aiTone: aiTone || 'logical_robot',
    };

    onSaveConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-fadeIn text-xs">
      
      {/* SECTION 0: CLOUD LIVE SYNC STATUS (FIRESTORE + GOOGLE DRIVE + GOOGLE SHEETS) */}
      <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  ক্লাউড লাইভ ডাটাবেজ & গুগল ড্রাইভ / শিট সিংক
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-emerald-500/30">
                  Firebase Live Active
                </span>
              </div>
              <p className="text-neutral-400 mt-0.5">
                অ্যাডমিন থেকে যা পরিবর্তন করবেন, তা সরাসরি ফায়ারবেস ক্লাউড ডাটাবেজে পার্মানেন্ট সেভ হবে এবং রিয়েল-টাইমে ভিজিটরদের কাছে আপডেট হবে।
              </p>
            </div>
          </div>
        </div>

        {/* Google Sheets & Drive Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-900/90 p-4 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Google Sheets Live Link</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">স্প্রেডশিট সিংক</span>
            </div>
            <input
              type="url"
              value={googleSheetUrl}
              onChange={(e) => setGoogleSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 text-xs font-mono"
            />
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              আপনার গুগল স্প্রেডশিট লিংক এখানে যুক্ত রাখলে সরাসরি অ্যাডমিন প্যানেল থেকে সমস্ত অর্ডার ও প্রোডাক্ট সিংক করা যাবে।
            </p>
          </div>

          <div className="bg-neutral-900/90 p-4 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
                <HardDrive className="w-4 h-4" />
                <span>Google Drive Assets Folder</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">ড্রাইভ স্টোরেজ</span>
            </div>
            <input
              type="url"
              value={googleDriveFolderUrl}
              onChange={(e) => setGoogleDriveFolderUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 text-xs font-mono"
            />
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              গুগল ড্রাইভ ফোল্ডার লিংক এখানে পেস্ট করলে প্রোডাক্ট ও লোগোর সরাসরি গুগল ড্রাইভ লিঙ্ক কোটার কোনো ঝামেলা ছাড়াই কাজ করবে।
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: GOOGLE GEMINI FREE AI API & ROBOT CONCIERGE SETTINGS */}
      <div className="bg-neutral-950 border border-purple-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  গুগল জেমিনি এআই এপিআই কি & রোবোটিক রুলস কনফিগ
                </h3>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-purple-500/30">
                  Google Gemini Free API
                </span>
              </div>
              <p className="text-neutral-400 mt-0.5">
                গিটহাবে পুশ করার পর সরাসরি এই অ্যাডমিন প্যানেল থেকে আপনার গুগল জেমিনি ফ্রি এপিআই কি (API Key) কানেক্ট করুন।
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center justify-between">
              <span>Google Gemini API Key (ফ্রি এপিআই কি)</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px] font-normal lowercase tracking-normal"
              >
                <span>Get Free Gemini Key (aistudio.google.com)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-purple-400 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
              💡 এটি ফায়ারবেস ক্লাউড ডাটাবেজে এনক্রিপ্ট হয়ে সেভ থাকে। এখানে একবার এপিআই কি দিলে নেটলিফাই বা যেকোনো হোস্টিং থেকে আপনার এআই অ্যাসিস্ট্যান্ট সক্রিয়ভাবে গুগল জেমিনির সাথে কাজ করবে।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                AI Assistant Name (বট নাম)
              </label>
              <input
                type="text"
                value={aiBotName}
                onChange={(e) => setAiBotName(e.target.value)}
                placeholder="Bismillah AI"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                AI Tone & Persona (আচরণ ও স্বভাব)
              </label>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value as any)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-400 text-xs"
              >
                <option value="logical_robot">🤖 Logical Robot (সংক্ষিপ্ত, যৌক্তিক ও স্টোর নির্দিষ্ট উত্তর)</option>
                <option value="polite_assistant">🛍️ Polite Shopping Assistant (নম্র ও সাহায্যকারী)</option>
                <option value="formal">👔 Formal Concierge (মার্জিত ও প্রাতিষ্ঠানিক)</option>
              </select>
            </div>
          </div>

          {/* AI Strict Core Directives Box */}
          <div className="bg-neutral-900/80 p-4 rounded-xl border border-purple-500/20 space-y-2 text-[11px] text-neutral-300">
            <div className="font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Core Logical Protocol & Boundary (সক্রিয় অভ্যন্তরীণ নিয়মাবলী):</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li><strong className="text-neutral-200">রোবোটিক ও যৌক্তিক উত্তর:</strong> এআই অপ্রয়োজনীয় কথা পরিহার করে যৌক্তিক ও পয়েন্ট-আকারে তথ্য প্রদান করবে।</li>
              <li><strong className="text-neutral-200">শুধুমাত্র এই ওয়েবসাইটের তথ্য:</strong> বাইরের তথ্য রেফারেন্স হিসেবে ব্যবহার করলেও, উত্তর সবসময় এই ওয়েবসাইটের লাইভ ডাটাবেজ ও প্রোডাক্ট ক্যাটালগের তথ্যের মধ্যে সীমাবদ্ধ রাখবে।</li>
              <li><strong className="text-neutral-200">পরিশীলিত ও সংক্ষিপ্ত একত্রীকরণ:</strong> বিভিন্ন তথ্যের উৎস একত্র করে অত্যন্ত পরিশীলিত (consolidated & refined) ভাবে উপস্থাপন করবে।</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 2: GOOGLE DEVELOPER OAUTH INTEGRATION */}
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

          {/* Local Brand Logo File Upload (Base64 or Direct Link) */}
          <div className="sm:col-span-2 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-3">
            <label className="block font-semibold uppercase tracking-wider text-amber-300">
              Direct Brand Logo (Upload File or Paste Drive URL)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="h-14 w-36 bg-neutral-950 border border-neutral-700 rounded-xl flex items-center justify-center p-2 overflow-hidden shrink-0">
                {logoImage ? (
                  <img src={logoImage} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-[11px] text-neutral-500">No Custom Logo</span>
                )}
              </div>
              <div className="flex-1 space-y-2 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-400 file:text-neutral-950 hover:file:bg-amber-300 font-semibold cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={logoImage}
                    onChange={(e) => {
                      const val = GoogleDriveSheetService.formatGoogleDriveImageUrl(e.target.value);
                      setLogoImage(val);
                    }}
                    placeholder="Or paste Direct Image / Google Drive Shareable Link"
                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white text-[11px] font-mono focus:outline-none focus:border-amber-400"
                  />
                  {logoImage && (
                    <button
                      type="button"
                      onClick={() => setLogoImage('')}
                      className="text-[11px] text-rose-400 hover:underline shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>
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
              Direct Hero Background Photo (Upload File or Paste Drive URL)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleHeroImageUpload}
              className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-400 file:text-neutral-950 hover:file:bg-amber-300 font-semibold cursor-pointer"
            />
            <input
              type="text"
              value={heroImage}
              onChange={(e) => {
                const val = GoogleDriveSheetService.formatGoogleDriveImageUrl(e.target.value);
                setHeroImage(val);
              }}
              placeholder="Or paste Direct Image / Google Drive Shareable Link"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-white text-[11px] font-mono focus:outline-none focus:border-amber-400"
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
              <Check className="w-4 h-4" /> Brand, Firestore Cloud & Google Drive settings saved live!
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
