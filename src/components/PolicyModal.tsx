import React from 'react';
import { StoreConfig } from '../types';
import { X, Shield, Truck, RotateCcw, FileText } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyType: 'shipping' | 'returns' | 'privacy' | 'terms' | null;
  config: StoreConfig;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  policyType,
  config,
}) => {
  if (!isOpen || !policyType) return null;

  const getPolicyDetails = () => {
    switch (policyType) {
      case 'shipping':
        return {
          title: 'Shipping & White-Glove Courier Policy',
          icon: Truck,
          content:
            config.shippingPolicy ||
            `Complimentary climate-controlled carbon-neutral courier delivery is included on all orders exceeding ${config.currencySymbol}${config.freeShippingThreshold}. Standard domestic transit takes 2-4 business days. Express overnight priority dispatch is available at checkout. All garments are enveloped in organic linen dustbags and recyclable luxury packaging.`,
        };
      case 'returns':
        return {
          title: 'Returns & Concierge Exchanges',
          icon: RotateCcw,
          content:
            config.returnPolicy ||
            'We accept returns and size exchanges within 30 days of delivery. Garments must be unworn, unwashed, and retained with original artisan tags attached. Complimentary courier pick-up can be scheduled via your Atelier account or by contacting our concierge.',
        };
      case 'privacy':
        return {
          title: 'Privacy & Data Protection',
          icon: Shield,
          content:
            config.privacyPolicy ||
            'Your privacy and data sovereignty are paramount. All transaction details and customer addresses are encrypted and stored solely within your local device persistence. We do not sell or monetize personal shopping activity.',
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          icon: FileText,
          content:
            config.termsOfService ||
            `Welcome to ${config.brandName}. By acquiring our handcrafted capsules and utilizing our storefront, you agree to our standard artisanal terms of service and trade representations.`,
        };
    }
  };

  const { title, icon: Icon, content } = getPolicyDetails();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 text-neutral-950">
          <div className="p-2.5 bg-neutral-100 rounded-xl">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold">{title}</h3>
        </div>

        <div className="text-neutral-600 text-xs sm:text-sm leading-relaxed space-y-4 pt-2 border-t border-neutral-100">
          <p className="whitespace-pre-line">{content}</p>
        </div>

        <div className="mt-8 pt-4 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
