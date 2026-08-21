import React, { useState } from 'react';
import { CartItem, StoreConfig, Coupon, Customer, Order } from '../types';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, Sparkles, Download, Lock, Smartphone, MapPin, AlertCircle } from 'lucide-react';
import { SecurityService } from '../services/securityService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  config: StoreConfig;
  appliedCoupon: Coupon | null;
  customer: Customer | null;
  onSaveCustomerShipping?: (address: any) => void;
  onOrderPlaced: (order: Order) => void;
  onOpenOrderTracking?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  config,
  appliedCoupon,
  customer,
  onSaveCustomerShipping,
  onOrderPlaced,
  onOpenOrderTracking,
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Form Fields
  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [street, setStreet] = useState(customer?.shippingAddress?.street || '');
  const [city, setCity] = useState(customer?.shippingAddress?.city || 'Dhaka');
  const [state, setState] = useState(customer?.shippingAddress?.state || 'Dhaka Division');
  const [zip, setZip] = useState(customer?.shippingAddress?.zip || '1212');
  const [country, setCountry] = useState(customer?.shippingAddress?.country || 'Bangladesh');
  
  // Luxury Gift Packaging Option
  const [includeGiftWrap, setIncludeGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Delivery Zone
  const [deliveryZone, setDeliveryZone] = useState<'dhaka' | 'outside_dhaka' | 'express'>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'cod' | 'card'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [saveProfile, setSaveProfile] = useState(true);

  // Card info
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  if (!isOpen) return null;

  // Pricing calculation
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent > 0) {
      discount = (subtotal * appliedCoupon.discountPercent) / 100;
    } else if (appliedCoupon.discountFixed) {
      discount = Math.min(subtotal, appliedCoupon.discountFixed);
    }
  }

  const isFreeStandard = subtotal >= (config.freeShippingThreshold || 3000);
  const dhakaFee = config.deliveryDhakaCity ?? 70;
  const outsideDhakaFee = config.deliveryOutsideDhaka ?? 130;
  const giftWrapFee = includeGiftWrap ? 150 : 0;

  const shippingCost =
    deliveryZone === 'dhaka'
      ? (isFreeStandard ? 0 : dhakaFee)
      : deliveryZone === 'outside_dhaka'
      ? (isFreeStandard ? 0 : outsideDhakaFee)
      : 200; // Urgent express

  const tax = (subtotal - discount) * (config.taxRate || 0.05);
  const total = Math.max(0, subtotal - discount + shippingCost + tax + giftWrapFee);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveProfile && onSaveCustomerShipping) {
      onSaveCustomerShipping({ street, city, state, zip, country });
    }
    setStep('payment');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const orderNumber = `ATL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const paymentLabel =
      paymentMethod === 'bkash'
        ? `bKash (TrxID: ${transactionId || 'Pending'})`
        : paymentMethod === 'nagad'
        ? `Nagad (TrxID: ${transactionId || 'Pending'})`
        : paymentMethod === 'rocket'
        ? `Rocket (TrxID: ${transactionId || 'Pending'})`
        : paymentMethod === 'cod'
        ? 'Cash on Delivery (ক্যাশ অন ডেলিভারি)'
        : 'Credit / Debit Card';

    const cleanName = SecurityService.sanitizeText(name, 80);
    const cleanEmail = SecurityService.sanitizeEmail(email) || 'customer@guest.com';
    const cleanPhone = SecurityService.sanitizePhone(phone);
    const cleanStreet = SecurityService.sanitizeText(street, 200);
    const cleanCity = SecurityService.sanitizeText(city, 80);
    const cleanState = SecurityService.sanitizeText(state, 80);
    const cleanZip = SecurityService.sanitizeText(zip, 20);
    const cleanTxId = SecurityService.sanitizeTransactionId(transactionId);
    const cleanGiftMessage = giftMessage ? SecurityService.sanitizeText(giftMessage, 300) : '';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: customer?.id || `guest-${Date.now()}`,
      customerName: cleanName,
      customerEmail: cleanEmail,
      customerPhone: cleanPhone,
      shippingAddress: { street: cleanStreet, city: cleanCity, state: cleanState, zip: cleanZip, country: country || 'Bangladesh' },
      items: cart.map((c) => ({
        productId: c.product.id,
        title: SecurityService.sanitizeText(c.product.title, 120),
        size: c.selectedSize,
        price: Number(c.product.price) || 0,
        quantity: Math.max(1, Math.min(99, Number(c.quantity) || 1)),
        image: c.product.image,
      })),
      subtotal: Math.max(0, Number(subtotal) || 0),
      discount: Math.max(0, Number(discount) || 0),
      couponCode: appliedCoupon?.code ? SecurityService.sanitizeText(appliedCoupon.code, 30) : undefined,
      tax: Math.max(0, Number(tax) || 0),
      shippingCost: Math.max(0, Number(shippingCost) || 0),
      total: Math.max(0, Number(total) || 0),
      status: 'Pending',
      paymentMethod: paymentLabel,
      transactionId: cleanTxId || undefined,
      notes: includeGiftWrap ? `[Signature Gift Packaging & Calligraphy Note]: ${cleanGiftMessage || 'Complimentary Gift Ribbon'}` : undefined,
      deliveryZone:
        deliveryZone === 'dhaka'
          ? 'Inside Dhaka (ঢাকা সিটি)'
          : deliveryZone === 'outside_dhaka'
          ? 'Outside Dhaka (সারাদেশ)'
          : 'Express Same-Day',
      trackingNumber: `BD-STEADFAST-${Math.floor(10000000 + Math.random() * 90000000)}`,
      createdAt: new Date().toISOString(),
    };

    setPlacedOrder(newOrder);
    onOrderPlaced(newOrder);
    setStep('confirmation');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 bg-[#faf9f6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-950 text-white rounded-lg">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-neutral-950 tracking-wide">
                {step === 'confirmation' ? 'Order Confirmed' : 'Checkout & Express Delivery'}
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                {step === 'details'
                  ? 'Step 1 of 2: Shipping Destination & Courier Service'
                  : step === 'payment'
                  ? 'Step 2 of 2: bKash / Nagad / Card Payment Authorization'
                  : 'Fulfillment & Packing Initiated'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-950 rounded-full hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          
          {/* STEP 1: SHIPPING DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              
              {/* Order items preview summary */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  <span>Order Items ({cart.reduce((s, i) => s + i.quantity, 0)} garments)</span>
                  <span className="font-mono text-neutral-950 font-bold">{config.currencySymbol}{total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto py-1">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.selectedSize}`} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-neutral-200 shrink-0 text-xs">
                      {item.product.image ? (
                        <img src={item.product.image} alt="" className="w-7 h-8 object-cover rounded" />
                      ) : null}
                      <div>
                        <span className="font-semibold text-neutral-900 block truncate max-w-[120px]">{item.product.title}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">Size {item.selectedSize} × {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  1. Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tanzim Ahmed"
                      className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tanzim@example.com"
                      className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Mobile Number (For Courier Call & SMS) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1712-345678"
                    className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  2. Shipping Destination Address
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Street Address / House / Flat *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House 42, Road 11, Block D, Banani"
                    className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">City / Thana *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Dhaka"
                      className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Division / State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Dhaka Division"
                      className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="1213"
                      className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none"
                    />
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 pt-2 cursor-pointer select-none text-xs text-neutral-700">
                  <input
                    type="checkbox"
                    checked={saveProfile}
                    onChange={(e) => setSaveProfile(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
                  />
                  <span>Save this shipping address for one-click future atelier orders</span>
                </label>
              </div>

              {/* Shipping Zone Selector */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  3. Select Delivery Zone & Courier
                </h4>
                <div className="space-y-2 text-xs">
                  <label
                    onClick={() => setDeliveryZone('dhaka')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryZone === 'dhaka' ? 'border-neutral-950 bg-neutral-50 ring-1 ring-neutral-950' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-neutral-700" />
                      <div>
                        <div className="font-semibold text-neutral-900">Inside Dhaka City Delivery (ঢাকা সিটির ভেতরে)</div>
                        <div className="text-[11px] text-neutral-500">Fast 24-48 Hours Doorstep Delivery (Steadfast / Pathao / RedX)</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-950">
                      {isFreeStandard ? <span className="text-emerald-700 font-bold uppercase text-[11px]">Free Shipping</span> : `${config.currencySymbol}${dhakaFee}`}
                    </span>
                  </label>

                  <label
                    onClick={() => setDeliveryZone('outside_dhaka')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryZone === 'outside_dhaka' ? 'border-neutral-950 bg-neutral-50 ring-1 ring-neutral-950' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-neutral-700" />
                      <div>
                        <div className="font-semibold text-neutral-900">Outside Dhaka / Nationwide (ঢাকার বাইরে সারা বাংলাদেশ)</div>
                        <div className="text-[11px] text-neutral-500">2-4 Days Express Home Delivery across all districts</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-950">
                      {isFreeStandard ? <span className="text-emerald-700 font-bold uppercase text-[11px]">Free Shipping</span> : `${config.currencySymbol}${outsideDhakaFee}`}
                    </span>
                  </label>

                  <label
                    onClick={() => setDeliveryZone('express')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryZone === 'express' ? 'border-neutral-950 bg-neutral-50 ring-1 ring-neutral-950' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="font-semibold text-neutral-900">Urgent Same-Day Express (জরুরি ডেলিভারি)</div>
                        <div className="text-[11px] text-neutral-500">Hand-delivered within 4-6 hours (Dhaka Metro only)</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-neutral-950">{config.currencySymbol}200.00</span>
                  </label>
                </div>
              </div>

              {/* Luxury Gift Packaging Section */}
              <div className="p-4 bg-gradient-to-r from-amber-50/70 to-neutral-50 rounded-2xl border border-amber-200/80 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeGiftWrap}
                    onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-950 uppercase tracking-wide flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Luxury Atelier Signature Gift Packaging</span>
                      </span>
                      <span className="text-xs font-bold font-mono text-amber-900">+৳150.00</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Handcrafted rigid gift box, satin gold ribbon tie, scented tissue lining & handwritten calligraphy message card.
                    </p>
                  </div>
                </label>

                {includeGiftWrap && (
                  <div className="pt-2 animate-fadeIn">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Personalized Message for Calligraphy Card:
                    </label>
                    <textarea
                      rows={2}
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="e.g. Happy Anniversary my love! Wishing you endless grace and joy."
                      className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-xl focus:ring-1 focus:ring-neutral-950 focus:outline-none placeholder:text-neutral-400"
                    />
                  </div>
                )}
              </div>

              {/* Submit to Step 2 */}
              <div className="pt-6 border-t border-neutral-200 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-all shadow-md"
                >
                  Proceed to Payment Selection
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD SELECTION */}
          {step === 'payment' && (
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              
              {/* Payment Method Selector */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Select Payment Method
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {/* bKash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'bkash' ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold ring-2 ring-pink-500' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xs">
                      b
                    </div>
                    <span>bKash (বিকাশ)</span>
                  </button>

                  {/* Nagad */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'nagad' ? 'border-orange-600 bg-orange-50 text-orange-700 font-bold ring-2 ring-orange-500' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                      ন
                    </div>
                    <span>Nagad (নগদ)</span>
                  </button>

                  {/* Rocket */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('rocket')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'rocket' ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold ring-2 ring-purple-500' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      R
                    </div>
                    <span>Rocket (রকেট)</span>
                  </button>

                  {/* Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'cod' ? 'border-neutral-950 bg-neutral-900 text-white font-bold' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    <span>Cash on Delivery</span>
                  </button>

                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'card' ? 'border-neutral-950 bg-neutral-900 text-white font-bold' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Debit/Credit Card</span>
                  </button>
                </div>
              </div>

              {/* bKash Instructions Box */}
              {paymentMethod === 'bkash' && (
                <div className="bg-pink-50/80 border border-pink-200 rounded-2xl p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-pink-200">
                    <span className="font-bold text-pink-900 uppercase tracking-wider text-[11px]">
                      bKash Payment Instructions
                    </span>
                    <span className="bg-pink-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      Merchant / Send Money
                    </span>
                  </div>

                  <div className="space-y-1.5 text-neutral-700 leading-relaxed">
                    <p>1. Open your bKash app and choose <span className="font-bold text-pink-800">Send Money / Payment</span>.</p>
                    <p>2. Enter our number: <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-pink-300 text-pink-900">{config.bkashMerchantNumber || '01712-345678'}</span></p>
                    <p>3. Enter total amount: <span className="font-mono font-bold text-pink-900">{config.currencySymbol}{total.toFixed(2)}</span></p>
                    <p>4. Complete payment with PIN and enter the 10-character Transaction ID (TrxID) below:</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-semibold text-pink-900 mb-1">bKash Transaction ID (TrxID) *</label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                        placeholder="e.g. 9J8B7C6X5Y"
                        className="w-full bg-white border border-pink-300 rounded-lg p-2.5 text-xs font-mono uppercase focus:outline-none focus:border-pink-600"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-pink-900 mb-1">Your Sender bKash Number</label>
                      <input
                        type="tel"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-white border border-pink-300 rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-pink-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Nagad Instructions Box */}
              {paymentMethod === 'nagad' && (
                <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-orange-200">
                    <span className="font-bold text-orange-900 uppercase tracking-wider text-[11px]">
                      Nagad Payment Instructions
                    </span>
                    <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      Merchant / Send Money
                    </span>
                  </div>

                  <div className="space-y-1.5 text-neutral-700 leading-relaxed">
                    <p>1. Open Nagad app and select <span className="font-bold text-orange-800">Send Money / Merchant Pay</span>.</p>
                    <p>2. Enter Nagad number: <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-orange-300 text-orange-900">{config.nagadMerchantNumber || '01812-345678'}</span></p>
                    <p>3. Enter total amount: <span className="font-mono font-bold text-orange-900">{config.currencySymbol}{total.toFixed(2)}</span></p>
                    <p>4. After confirmation, enter your Transaction ID below:</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-semibold text-orange-900 mb-1">Nagad Transaction ID (TrxID) *</label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                        placeholder="e.g. 7K2M9N3P"
                        className="w-full bg-white border border-orange-300 rounded-lg p-2.5 text-xs font-mono uppercase focus:outline-none focus:border-orange-600"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-orange-900 mb-1">Your Sender Nagad Number</label>
                      <input
                        type="tel"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-white border border-orange-300 rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-orange-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Rocket Instructions Box */}
              {paymentMethod === 'rocket' && (
                <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                    <span className="font-bold text-purple-900 uppercase tracking-wider text-[11px]">
                      Rocket Payment Instructions
                    </span>
                  </div>
                  <div className="space-y-1.5 text-neutral-700">
                    <p>Send <span className="font-mono font-bold text-purple-900">{config.currencySymbol}{total.toFixed(2)}</span> to Rocket Account: <span className="font-mono font-bold text-purple-900">{config.rocketMerchantNumber || '01912-345678'}</span></p>
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-900 mb-1">Rocket Transaction ID (TrxID) *</label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      placeholder="e.g. RCKT-4938201"
                      className="w-full bg-white border border-purple-300 rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              )}

              {/* COD Box */}
              {paymentMethod === 'cod' && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-neutral-900 font-bold">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery (ক্যাশ অন ডেলিভারি)</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    You can pay the full order amount in cash to the courier delivery rider upon inspecting and receiving your package at your doorstep.
                  </p>
                </div>
              )}

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <div className="bg-neutral-900 text-white p-5 rounded-2xl shadow-xl space-y-4 font-mono text-xs">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="text-[10px] uppercase tracking-widest font-sans">Secure Visa / Mastercard</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-sans">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white tracking-widest text-sm focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-sans">Expires</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white text-center focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-sans">CVC / CVV</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white text-center focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Final Totals Breakdown */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Address:</span>
                  <span className="font-semibold text-neutral-900">{street}, {city}, {country}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Grand Total to Pay:</span>
                  <span className="text-base font-bold font-mono text-neutral-950">
                    {config.currencySymbol}{total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs text-neutral-600 hover:text-neutral-950 font-semibold"
                >
                  ← Back to Details
                </button>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all shadow-xl flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm Order ({config.currencySymbol}{total.toFixed(2)})</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER CONFIRMATION RECEIPT */}
          {step === 'confirmation' && placedOrder && (
            <div className="text-center py-6 space-y-6 animate-fadeIn">
              
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Order Successfully Placed
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-light text-neutral-950 mt-3">
                  Thank You for Your Order
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                  Your garments have been scheduled for fulfillment and doorstep courier delivery.
                </p>
              </div>

              {/* Receipt Summary Box */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 text-left text-xs space-y-4 max-w-lg mx-auto">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-200 font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">Order Reference</span>
                    <span className="font-bold text-sm text-neutral-950">{placedOrder.orderNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block uppercase">Courier Tracking</span>
                    <span className="text-amber-700 font-bold">{placedOrder.trackingNumber}</span>
                  </div>
                </div>

                <div className="space-y-1 text-neutral-600 pb-2 border-b border-neutral-200 text-[11px]">
                  <div><span className="font-semibold text-neutral-900">Recipient:</span> {placedOrder.customerName} ({placedOrder.customerPhone})</div>
                  <div><span className="font-semibold text-neutral-900">Destination:</span> {placedOrder.shippingAddress.street}, {placedOrder.shippingAddress.city}</div>
                  <div><span className="font-semibold text-neutral-900">Payment:</span> {placedOrder.paymentMethod}</div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-neutral-400">Purchased Garments:</span>
                  {placedOrder.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between items-center text-neutral-800">
                      <span>{i.title} (Size {i.size}) × {i.quantity}</span>
                      <span className="font-mono font-semibold">{config.currencySymbol}{(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-200 flex justify-between font-bold text-neutral-950 text-sm">
                  <span>Grand Total</span>
                  <span className="font-mono">{config.currencySymbol}{placedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {onOpenOrderTracking && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenOrderTracking();
                    }}
                    className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track This Parcel Live</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-8 py-3.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-colors shadow-md"
                >
                  Continue Browsing Atelier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

