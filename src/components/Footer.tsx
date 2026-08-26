import React, { useState } from 'react';
import { StoreConfig } from '../types';
import { Sparkles, Mail, Phone, MapPin, Check, Truck, ShieldCheck, Code2, Heart } from 'lucide-react';

interface FooterProps {
  config: StoreConfig;
  onOpenPolicy: (type: 'shipping' | 'returns' | 'privacy' | 'terms') => void;
  onOpenOrderTracking?: () => void;
  onOpenSizeGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  onOpenPolicy,
  onOpenOrderTracking,
  onOpenSizeGuide,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#111111] text-neutral-400 text-xs border-t border-neutral-800">
      
      {/* Upper Footer: Value Props */}
      <div className="border-b border-neutral-800/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-white uppercase text-xs tracking-widest">
              Artisanal Craftsmanship
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Every garment is patterned, cut, and assembled with architectural precision using certified organic fibers.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif font-bold text-white uppercase text-xs tracking-widest">
              Nationwide Delivery Across Bangladesh
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Fast courier delivery across Dhaka & all 64 districts with Cash on Delivery and verified mobile payment support.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif font-bold text-white uppercase text-xs tracking-widest">
              Concierge Exchanges
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              7-day effortless size adjustments with fast doorstep courier exchange assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand identity column */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            {config.logoImage ? (
              <img src={config.logoImage} alt={config.brandName} className="h-7 object-contain brightness-0 invert" />
            ) : (
              <span className="font-serif font-bold tracking-[0.2em] text-white text-lg uppercase">
                {config.brandName}
              </span>
            )}
          </div>
          <p className="text-neutral-400 leading-relaxed text-xs">
            {config.tagline || 'Modern luxury clothing engineered for quiet elegance and longevity.'}
          </p>
          <div className="text-[11px] text-neutral-400 space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>Studio: {config.studioAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>Concierge: {config.contactEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>Direct: {config.contactPhone}</span>
            </div>
          </div>
        </div>

        {/* Collections */}
        <div className="space-y-3">
          <h5 className="font-bold uppercase tracking-widest text-neutral-200 text-[11px]">
            Garment Capsules
          </h5>
          <ul className="space-y-2 text-neutral-400">
            <li><a href="#outerwear" className="hover:text-white transition-colors">Architectural Outerwear</a></li>
            <li><a href="#tops" className="hover:text-white transition-colors">Fine Silk & Cashmere Tops</a></li>
            <li><a href="#bottoms" className="hover:text-white transition-colors">Pleated & Tailored Trousers</a></li>
            <li><a href="#dresses" className="hover:text-white transition-colors">Occasion & Evening Dresses</a></li>
            <li><a href="#accessories" className="hover:text-white transition-colors">Leathercraft & Accessories</a></li>
          </ul>
        </div>

        {/* Policies & Concierge */}
        <div className="space-y-3">
          <h5 className="font-bold uppercase tracking-widest text-neutral-200 text-[11px]">
            Client Services
          </h5>
          <ul className="space-y-2 text-neutral-400">
            {onOpenOrderTracking && (
              <li>
                <button onClick={() => onOpenOrderTracking()} className="text-amber-400 hover:text-amber-300 font-semibold transition-colors text-left flex items-center gap-1.5">
                  <span>📦 Live Parcel Tracking</span>
                </button>
              </li>
            )}
            {onOpenSizeGuide && (
              <li>
                <button onClick={() => onOpenSizeGuide()} className="hover:text-white transition-colors text-left flex items-center gap-1.5">
                  <span>📏 Size & Measurement Guide</span>
                </button>
              </li>
            )}
            <li>
              <button onClick={() => onOpenPolicy('shipping')} className="hover:text-white transition-colors text-left">
                Courier & Transit Schedule
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('returns')} className="hover:text-white transition-colors text-left">
                Complimentary 7-Day Returns
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('privacy')} className="hover:text-white transition-colors text-left">
                Encrypted Client Privacy
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('terms')} className="hover:text-white transition-colors text-left">
                Terms of Craft & Sale
              </button>
            </li>
          </ul>
        </div>

        {/* Private Newsletter / VIP Atelier Invitations */}
        <div className="space-y-4 md:col-span-1 bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-neutral-200 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold uppercase text-[11px] tracking-wider text-white">VIP Atelier Invitations</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Subscribe to receive private collection previews, seasonal capsule releases, and exclusive member discounts.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full bg-neutral-950 border border-neutral-750 text-neutral-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-neutral-500 placeholder:text-neutral-600"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Join Atelier</span>
            </button>
          </form>

          {newsletterSubscribed && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Thank you! You are now on our VIP priority list.</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-neutral-850 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span>© {new Date().getFullYear()} {config.brandName}. All rights reserved.</span>
          <span className="hidden sm:inline text-neutral-700">•</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
            <Code2 className="w-3 h-3 text-amber-400" />
            <span>Developed by</span>
            <span className="font-semibold text-amber-400 font-serif tracking-wide">Golam Rabbi</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-neutral-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure 256-Bit SSL Encrypted Checkout</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Delivery in 24–72 Hours</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
