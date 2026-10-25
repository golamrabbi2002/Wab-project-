import React, { useState } from 'react';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Phone,
  MapPin,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  Navigation,
  Compass,
  Calendar,
  Building2,
  Bike
} from 'lucide-react';
import { Order, StoreConfig } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  config: StoreConfig;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  config,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'timeline'>('map');

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleaned = searchQuery.trim().toLowerCase();

    if (!cleaned) {
      setSearchedOrder(null);
      return;
    }

    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase().includes(cleaned) ||
        (o.customerPhone && o.customerPhone.includes(cleaned)) ||
        o.customerEmail.toLowerCase().includes(cleaned) ||
        (o.transactionId && o.transactionId.toLowerCase().includes(cleaned)) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(cleaned))
    );

    setSearchedOrder(found || null);
  };

  // Status mapping
  const steps = [
    {
      title: 'Order Confirmed & Approved',
      banglaTitle: 'অর্ডার নিশ্চিত ও অনুমোদিত',
      desc: 'অর্ডারটি গ্রহণ করা হয়েছে এবং সিস্টেম দ্বারা ভেরিফাইড',
      status: 'Pending',
    },
    {
      title: 'Signature Quality & Packing',
      banglaTitle: 'সিগনেচার প্যাকিং ও কিউসি সম্পন্ন',
      desc: 'পোশাক নিখুঁতভাবে চেক ও লাক্সারি বক্স প্যাকিং সম্পন্ন',
      status: 'Processing',
    },
    {
      title: 'Handed to Courier Partner',
      banglaTitle: 'কুরিয়ার হাবে হ্যান্ডওভার ও ইন-ট্রানজিট',
      desc: 'পাঠাও / স্টেডফাস্ট কুরিয়ারের মাধ্যমে গন্তব্যের উদ্দেশ্যে রওনা হয়েছে',
      status: 'Shipped',
    },
    {
      title: 'Delivered to Doorstep',
      banglaTitle: 'সফলভাবে কাস্টমারের হাতে ডেলিভার্ড',
      desc: 'পার্সেলটি গ্রাহকের ঠিকানায় পৌঁছে দেওয়া হয়েছে',
      status: 'Delivered',
    },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Processing':
        return 1;
      case 'Shipped':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = searchedOrder ? getStepIndex(searchedOrder.status) : 0;

  // Dynamic ETA calculation if not provided by admin
  const getCalculatedETA = (order: Order) => {
    if (order.estimatedDeliveryDate && order.estimatedDeliveryDate.trim()) {
      return order.estimatedDeliveryDate;
    }
    const orderDate = new Date(order.createdAt);
    const isDhaka =
      (order.deliveryZone && order.deliveryZone.toLowerCase().includes('inside')) ||
      (order.shippingAddress?.city && order.shippingAddress.city.toLowerCase().includes('dhaka'));

    if (order.status === 'Delivered') {
      return 'ডেলিভারি সম্পন্ন (Successfully Delivered)';
    }

    if (isDhaka) {
      const eta = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
      return `২৪ থেকে ৪৮ ঘণ্টার মধ্যে (${eta.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
      })} এর মধ্যে)`;
    } else {
      const eta = new Date(orderDate.getTime() + 72 * 60 * 60 * 1000);
      return `৪৮ থেকে ৭২ ঘণ্টার মধ্যে (${eta.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
      })} এর মধ্যে)`;
    }
  };

  // Dynamic Location description
  const getCurrentLocationDescription = (order: Order) => {
    if (order.currentLocationName && order.currentLocationName.trim()) {
      return order.currentLocationName;
    }
    const city = order.shippingAddress?.city || 'Dhaka';
    switch (order.status) {
      case 'Pending':
        return 'আউরা অলিয়ার সেন্ট্রাল স্টুডিও ও ওয়্যারহাউস (বনানী / ঢাকা)';
      case 'Processing':
        return 'আউরা ওয়্যারহাউস কোয়ালিটি কন্ট্রোল ও প্যাকিং হাব (ঢাকা)';
      case 'Shipped':
        return `ঢাকা তেজগাঁও সেন্ট্রাল সর্টিং হাব হতে ${city} লোকাল ডিস্ট্রিবিউশন হাবের পথে (ইন-ট্রানজিট)`;
      case 'Delivered':
        return `কাস্টমারের ডেলিভারি ঠিকানা (${city})`;
      default:
        return 'সেন্ট্রাল প্রসেসিং সেন্টার';
    }
  };

  const handleCopyTracking = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2500);
    }
  };

  const getCourierPortalLink = (partner: string = '', code: string = '') => {
    const p = partner.toLowerCase();
    if (p.includes('pathao')) {
      return `https://pathao.com/courier/`;
    }
    if (p.includes('steadfast')) {
      return `https://steadfast.com.bd/t/${encodeURIComponent(code)}`;
    }
    if (p.includes('redx')) {
      return `https://redx.com.bd/track/`;
    }
    return `https://pathao.com/courier/`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-neutral-950 rounded-2xl shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>লাইভ অর্ডার ও কুরিয়ার ট্র্যাকিং</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider">
                  Live Radar
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                রিয়েল-টাইম পার্সেল ট্র্যাকিং, লোকেশন আপডেট ও সম্ভাব্য ডেলিভারি সময়
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="অর্ডার নম্বর (যেমন: AUR-123456) বা মোবাইল নম্বর বা ট্র্যাকিং কোড লিখুন..."
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:bg-white transition-all text-neutral-900"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shrink-0 active:scale-95 shadow-md flex items-center gap-2"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>ট্র্যাক করুন</span>
            </button>
          </form>

          {/* Results Display */}
          {searchedOrder ? (
            <div className="space-y-6 animate-fadeIn">
              
              {/* PRIMARY ORDER & ETA BANNER */}
              <div className="p-5 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white rounded-3xl shadow-xl border border-neutral-800">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest block font-bold">
                      Order Identification
                    </span>
                    <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wide">
                      {searchedOrder.orderNumber}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full border shadow-sm ${
                        searchedOrder.status === 'Delivered'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : searchedOrder.status === 'Shipped'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : searchedOrder.status === 'Processing'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                      <span>
                        {searchedOrder.status === 'Delivered'
                          ? 'ডেলিভার্ড (Delivered)'
                          : searchedOrder.status === 'Shipped'
                          ? 'কুরিয়ারে ট্রানজিটে (Shipped)'
                          : searchedOrder.status === 'Processing'
                          ? 'প্যাকিং ও ভেরিফাইড (Approved)'
                          : 'পেন্ডিং (Pending)'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Recipient & ETA grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">গ্রাহকের নাম:</span>
                    <span className="font-semibold text-neutral-200">{searchedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">মোবাইল:</span>
                    <span className="font-semibold text-neutral-200">{searchedOrder.customerPhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">গন্তব্য জেলা/শহর:</span>
                    <span className="font-semibold text-neutral-200">{searchedOrder.shippingAddress?.city || 'Dhaka'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">সর্বমোট মূল্য:</span>
                    <span className="font-bold text-amber-400 font-mono text-sm">
                      {config.currencySymbol}{searchedOrder.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Robotic Auto-Approved Badge */}
                {searchedOrder.autoVerified && (
                  <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>রোবোটিক অটো-অ্যাপ্রুভাল: TrxID যাচাইপূর্বক অর্ডারটি তাৎক্ষণিক অনুমোদিত</span>
                    </span>
                    {searchedOrder.transactionId && (
                      <span className="font-mono text-[11px] bg-emerald-950 px-2.5 py-0.5 rounded-lg border border-emerald-800/80">
                        TrxID: {searchedOrder.transactionId}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* COURIER WAYBILL & LIVE LOCATION HIGHLIGHT CARD */}
              <div className="p-5 bg-gradient-to-r from-neutral-900 to-neutral-950 text-white rounded-3xl border border-neutral-800 shadow-lg space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-bold">
                        কুরিয়ার সার্ভিস পার্টনার
                      </span>
                      <h4 className="font-bold text-sm text-white">
                        {searchedOrder.courierPartner || 'Pathao Courier'}
                      </h4>
                    </div>
                  </div>

                  {/* Waybill / Tracking ID Block */}
                  {searchedOrder.trackingNumber ? (
                    <div className="flex items-center gap-2 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-700">
                      <div>
                        <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">কুরিয়ার ট্র্যাকিং কোড</span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 select-all">
                          {searchedOrder.trackingNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyTracking(searchedOrder.trackingNumber!)}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors"
                        title="Copy tracking code"
                      >
                        {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-300/80 bg-amber-950/60 border border-amber-800/50 px-3 py-1.5 rounded-xl">
                      📦 পার্সেল প্যাকিং সম্পন্ন হলেই ট্র্যাকিং কোড দৃশ্যমান হবে
                    </span>
                  )}
                </div>

                {/* CURRENT LIVE LOCATION & ESTIMATED DELIVERY TIME */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800 flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-medium">বর্তমান অবস্থান (Live Location):</span>
                      <span className="text-xs font-bold text-neutral-100 block mt-0.5">
                        {getCurrentLocationDescription(searchedOrder)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800 flex items-start gap-3">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block font-medium">সম্ভাব্য ডেলিভারি (Estimated Delivery):</span>
                      <span className="text-xs font-bold text-amber-300 block mt-0.5">
                        {getCalculatedETA(searchedOrder)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Official Courier Tracking Link Button */}
                {searchedOrder.trackingNumber && (
                  <div className="pt-1 flex justify-end">
                    <a
                      href={getCourierPortalLink(searchedOrder.courierPartner, searchedOrder.trackingNumber)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border border-neutral-700"
                    >
                      <span>{searchedOrder.courierPartner || 'কুরিয়ারের'} অফিশিয়াল পোর্টালে বিস্তারিত দেখুন</span>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    </a>
                  </div>
                )}
              </div>

              {/* TABS: Visual Route Map vs Timeline */}
              <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'map'
                      ? 'bg-neutral-950 text-white shadow'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>লাইভ রুট ম্যাপ (Visual Transit Map)</span>
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'timeline'
                      ? 'bg-neutral-950 text-white shadow'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>শিপমেন্ট পর্যায় ও বিবরণ (Milestones)</span>
                </button>
              </div>

              {/* VIEW 1: INTERACTIVE BANGLADESH VISUAL TRANSIT MAP */}
              {activeTab === 'map' && (
                <div className="p-5 bg-gradient-to-b from-neutral-900 to-neutral-950 text-white rounded-3xl border border-neutral-800 space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      <span>বাংলাদেশ কুরিয়ার ডেলিভারি করিডোর ও রাডার ম্যাপ</span>
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      গন্তব্য: <strong className="text-white">{searchedOrder.shippingAddress?.city || 'Dhaka'}</strong>
                    </span>
                  </div>

                  {/* Visual Route Diagram */}
                  <div className="relative py-4 px-2 sm:px-4">
                    {/* Background Route Bar */}
                    <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1.5 bg-neutral-800 rounded-full"></div>
                    {/* Active Transit Fill */}
                    <div
                      className="absolute top-1/2 left-6 -translate-y-1/2 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700"
                      style={{
                        width:
                          searchedOrder.status === 'Delivered'
                            ? 'calc(100% - 3rem)'
                            : searchedOrder.status === 'Shipped'
                            ? '68%'
                            : searchedOrder.status === 'Processing'
                            ? '35%'
                            : '5%',
                      }}
                    ></div>

                    {/* Transit Nodes */}
                    <div className="relative flex justify-between items-center z-10">
                      
                      {/* Node 1: Origin Warehouse */}
                      <div className="flex flex-col items-center text-center max-w-[75px] sm:max-w-[100px]">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shadow-lg transition-transform ${
                            currentStep >= 0
                              ? 'bg-emerald-500 text-neutral-950 ring-4 ring-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          <Building2 className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[10px] sm:text-xs text-white mt-2">আউরা ওয়্যারহাউস</span>
                        <span className="text-[9px] text-neutral-400">বনানী / ঢাকা</span>
                      </div>

                      {/* Node 2: Central Sorting Hub */}
                      <div className="flex flex-col items-center text-center max-w-[75px] sm:max-w-[100px]">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shadow-lg transition-transform ${
                            currentStep >= 1
                              ? 'bg-emerald-500 text-neutral-950 ring-4 ring-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[10px] sm:text-xs text-white mt-2">সেন্ট্রাল সর্টিং</span>
                        <span className="text-[9px] text-neutral-400">তেজগাঁও হাব</span>
                      </div>

                      {/* Node 3: Regional Hub */}
                      <div className="flex flex-col items-center text-center max-w-[75px] sm:max-w-[100px]">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shadow-lg transition-transform relative ${
                            currentStep >= 2
                              ? currentStep === 2
                                ? 'bg-amber-400 text-neutral-950 ring-4 ring-amber-400/40 animate-bounce'
                                : 'bg-emerald-500 text-neutral-950 ring-4 ring-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          <Truck className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[10px] sm:text-xs text-white mt-2">রিজিওনাল হাব</span>
                        <span className="text-[9px] text-neutral-400">{searchedOrder.shippingAddress?.city || 'ডেলিভারি হাব'}</span>
                      </div>

                      {/* Node 4: Doorstep Delivery */}
                      <div className="flex flex-col items-center text-center max-w-[75px] sm:max-w-[100px]">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shadow-lg transition-transform ${
                            currentStep >= 3
                              ? 'bg-emerald-400 text-neutral-950 ring-4 ring-emerald-400/40'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          <Bike className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[10px] sm:text-xs text-white mt-2">কাস্টমার ডোরস্টেপ</span>
                        <span className="text-[9px] text-neutral-400">ডেলিভারি সম্পন্ন</span>
                      </div>

                    </div>
                  </div>

                  {/* Active Radar Details Card */}
                  <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800/90 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-amber-400" />
                        <span>লাইভ স্ট্যাটাস সারসংক্ষেপ</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        সর্বশেষ আপডেট: {new Date(searchedOrder.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed text-[11px] sm:text-xs">
                      {searchedOrder.status === 'Delivered'
                        ? `পার্সেলটি সফলভাবে আপনার ঠিকানায় (${searchedOrder.shippingAddress?.street}, ${searchedOrder.shippingAddress?.city}) ডেলিভারি সম্পন্ন হয়েছে। Aura Atelier এ শপিং করার জন্য ধন্যবাদ!`
                        : searchedOrder.status === 'Shipped'
                        ? `পার্সেলটি বর্তমানে ${searchedOrder.courierPartner || 'কুরিয়ারের'} মাধ্যমে গন্তব্যের পথে রয়েছে। লাইভ লোকেশন: "${getCurrentLocationDescription(searchedOrder)}"। আনুমানিক ${getCalculatedETA(searchedOrder)} আপনার হাতে পৌঁছে যাবে।`
                        : `অর্ডারটি বর্তমানে প্যাকেজিং ও কোয়ালিটি চেকে রয়েছে। প্রস্তুত হওয়ামাত্রই কুরিয়ারে হ্যান্ডওভার করা হবে।`}
                    </p>
                  </div>
                </div>
              )}

              {/* VIEW 2: DETAILED STEPPER TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="p-5 bg-neutral-50 rounded-3xl border border-neutral-200 animate-fadeIn">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-6 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-neutral-700" />
                    <span>শিপমেন্ট পর্যায় ও বিবরণ (Progress Milestones)</span>
                  </h4>

                  <div className="relative">
                    {/* Vertical Progress Line */}
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-neutral-200 -z-0"></div>
                    <div
                      className="absolute left-4 top-4 w-0.5 bg-emerald-500 transition-all duration-700 -z-0"
                      style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {/* Milestones */}
                    <div className="space-y-6">
                      {steps.map((step, idx) => {
                        const isDone = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div key={idx} className="flex items-start gap-4 relative z-10">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                                isDone
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                  : 'bg-white text-neutral-400 border-2 border-neutral-300'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h5
                                  className={`text-xs font-bold ${
                                    isCurrent ? 'text-neutral-950 font-serif text-sm' : 'text-neutral-700'
                                  }`}
                                >
                                  {step.banglaTitle}
                                </h5>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                                    বর্তমান ধাপ (Current Stage)
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-neutral-500 mt-0.5">{step.desc}</p>
                              <span className="text-[10px] text-neutral-400 block mt-0.5">{step.title}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Purchased Garments in Parcel */}
              <div className="p-4 bg-white rounded-3xl border border-neutral-200">
                <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3 flex items-center justify-between">
                  <span>পার্সেলের অন্তর্ভুক্ত পোশাকসমূহ ({searchedOrder.items.length}টি)</span>
                  <span className="text-[11px] font-normal text-neutral-500">
                    শিপিং ঠিকানা: {searchedOrder.shippingAddress?.street}, {searchedOrder.shippingAddress?.city}
                  </span>
                </h5>
                <div className="divide-y divide-neutral-100">
                  {searchedOrder.items.map((item, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-10 h-12 object-cover rounded-xl border border-neutral-200"
                          />
                        ) : null}
                        <div>
                          <span className="font-semibold text-neutral-900 block">{item.title}</span>
                          <span className="text-[10px] text-neutral-500">
                            সাইজ: {item.size} • পরিমাণ: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold font-mono text-neutral-950">
                        {config.currencySymbol}{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : hasSearched ? (
            <div className="text-center py-10 px-4 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
              <Clock className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-neutral-800 mb-1">অর্ডার তথ্য পাওয়া যায়নি</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                অনুগ্রহ করে আপনার অর্ডার নম্বর (যেমনঃ AUR-123456) অথবা অর্ডারে ব্যবহৃত সঠিক মোবাইল নম্বরটি দিয়ে পুনরায় চেষ্টা করুন।
              </p>
              <a
                href={`https://wa.me/${(config.contactPhone || '8801700000000').replace(
                  /[^0-9]/g,
                  ''
                )}?text=Hello%20Aura%20Atelier,%20I%20would%20like%20to%20inquire%20about%20my%20order`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow"
              >
                <span>হোয়াটসঅ্যাপ সাপোর্টে যোগাযোগ করুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500 text-xs">
              <p>আপনার অর্ডার নম্বর বা অর্ডারে দেওয়া ফোন নম্বরটি উপরে দিয়ে 'ট্র্যাক করুন' বাটনে চাপ দিন।</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>
            যেকোনো প্রয়োজনে সরাসরি কল করুন: <strong className="text-neutral-900">{config.contactPhone || '+880 1712-345678'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-950 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
