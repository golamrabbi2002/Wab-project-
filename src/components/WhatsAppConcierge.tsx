import React, { useState } from 'react';
import { MessageCircle, X, Sparkles, Send, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { StoreConfig } from '../types';

interface WhatsAppConciergeProps {
  config: StoreConfig;
  onOpenOrderTracking?: () => void;
  onOpenSizeGuide?: () => void;
}

export const WhatsAppConcierge: React.FC<WhatsAppConciergeProps> = ({
  config,
  onOpenOrderTracking,
  onOpenSizeGuide,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const rawPhone = (config.contactPhone || '+880 1712-345678').replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('88') ? rawPhone : `88${rawPhone}`;

  const sendWhatsApp = (presetText?: string) => {
    const textToSend = presetText || customMsg || 'Hello Aura Atelier Concierge, I would like to inquire about your collection.';
    const encoded = encodeURIComponent(textToSend);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setCustomMsg('');
  };

  const quickPrompts = [
    { title: 'Chat with Personal Stylist', icon: '✨', text: 'Hello! I would like personal styling recommendations from Aura Atelier.' },
    { title: 'bKash / Payment Inquiries', icon: '💳', text: 'Hello! I need assistance with bKash/Nagad payment or confirmation for my order.' },
    { title: 'Bespoke Sizing & Alterations', icon: '✂️', text: 'Hello! I have a question regarding custom measurements and sizing.' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Expanded Luxury Concierge Drawer */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-fadeIn text-neutral-900">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Atelier Private Concierge</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="font-serif text-lg font-bold text-white mb-1">
              How May We Assist You Today?
            </h4>
            <p className="text-xs text-neutral-300">
              Direct connection with our Dhaka atelier stylists & customer care.
            </p>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-neutral-50/50">
            
            {/* Quick Actions */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block px-1">
                Quick Assistance Topics
              </span>

              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendWhatsApp(q.text)}
                  className="w-full p-2.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl text-left flex items-center justify-between text-xs transition-all group shadow-sm"
                >
                  <span className="flex items-center gap-2 text-neutral-800 font-medium group-hover:text-neutral-950">
                    <span>{q.icon}</span>
                    <span>{q.title}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-950 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            {/* In-app Triggers */}
            <div className="pt-2 border-t border-neutral-200 flex gap-2">
              {onOpenOrderTracking && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenOrderTracking();
                  }}
                  className="flex-1 py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-[11px] font-bold transition-all"
                >
                  📦 Track Order
                </button>
              )}

              {onOpenSizeGuide && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenSizeGuide();
                  }}
                  className="flex-1 py-2 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-xl text-[11px] font-bold transition-all"
                >
                  📏 Size Guide
                </button>
              )}
            </div>

            {/* Custom Message Input */}
            <div className="pt-2">
              <div className="relative">
                <input
                  type="text"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendWhatsApp();
                  }}
                  placeholder="Type a bespoke question..."
                  className="w-full pl-3 pr-10 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
                <button
                  onClick={() => sendWhatsApp()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Footer note */}
          <div className="p-3 bg-neutral-100 border-t border-neutral-200 text-center text-[10px] text-neutral-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>End-to-End Encrypted Live WhatsApp Concierge</span>
          </div>

        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 group border-2 border-white/20"
        title="WhatsApp Concierge"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-emerald-600 animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-emerald-600"></span>
        </div>
        <span className="font-bold text-xs tracking-wider uppercase pr-1">
          WhatsApp Concierge
        </span>
      </button>

    </div>
  );
};
