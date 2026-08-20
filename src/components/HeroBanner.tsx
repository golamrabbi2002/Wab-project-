import React from 'react';
import { StoreConfig } from '../types';
import { ArrowDown, Sparkles, Feather, ShieldCheck, RefreshCw } from 'lucide-react';

interface HeroBannerProps {
  config: StoreConfig;
  onExplore?: () => void;
  onExploreClick?: () => void;
  onSignIn?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  config,
  onExplore,
  onExploreClick,
  onSignIn,
}) => {
  const bgImage =
    config.heroImage ||
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop';

  const handleExplore = () => {
    if (onExplore) {
      onExplore();
    } else if (onExploreClick) {
      onExploreClick();
    }
  };

  return (
    <div className="relative bg-neutral-950 text-white overflow-hidden">
      {/* Background Image Layer with Luxury Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-45 mix-blend-luminosity scale-105"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 flex flex-col justify-center min-h-[580px]">
        <div className="max-w-2xl">
          
          {/* Capsule Tag */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-widest text-neutral-200 mb-6 border border-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Spring / Summer 2026 Collection</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl font-light tracking-wide leading-[1.15] mb-6 text-neutral-50 drop-shadow-sm">
            {config.heroHeadline || 'SPRING / SUMMER 2026'}
          </h1>

          {/* Subheadline */}
          <p className="text-neutral-300 text-sm sm:text-base font-light leading-relaxed mb-10 max-w-xl">
            {config.heroSubheadline ||
              'Engineered silhouettes cut from organic Italian cotton, regenerative linen, and raw Japanese denim. Designed for enduring elegance.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleExplore}
              className="px-8 py-4 bg-white text-neutral-950 hover:bg-neutral-100 font-semibold text-xs tracking-widest uppercase rounded-sm transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 group"
            >
              <span>Explore Atelier</span>
              <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </button>

            <button
              onClick={() => onSignIn?.()}
              className="px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-widest uppercase rounded-sm backdrop-blur-md border border-white/20 transition-all"
            >
              Member Sign-In / Rewards
            </button>
          </div>
        </div>
      </div>

      {/* Value Proposition Ribbon */}
      <div className="relative border-t border-white/10 bg-neutral-900/90 backdrop-blur-md py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block text-xs font-semibold tracking-wider uppercase text-neutral-200">
                Artisanal Tailoring
              </span>
              <span className="text-[11px] text-neutral-400 font-light">
                Ethical European Mills
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Feather className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block text-xs font-semibold tracking-wider uppercase text-neutral-200">
                100% Organic Fibers
              </span>
              <span className="text-[11px] text-neutral-400 font-light">
                Certified Sustainable
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block text-xs font-semibold tracking-wider uppercase text-neutral-200">
                30-Day Atelier Trial
              </span>
              <span className="text-[11px] text-neutral-400 font-light">
                Complimentary returns
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-left">
              <span className="block text-xs font-semibold tracking-wider uppercase text-neutral-200">
                Encrypted Checkout
              </span>
              <span className="text-[11px] text-neutral-400 font-light">
                Zero data tracking
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
