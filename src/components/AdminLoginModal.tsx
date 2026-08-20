import React, { useState } from 'react';
import { StoreConfig } from '../types';
import { X, Lock, Shield, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  onSuccessLogin: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  config,
  onSuccessLogin,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = config.adminPin || 'admin123';

    if (pin === correctPin) {
      setError(null);
      setPin('');
      onSuccessLogin();
    } else {
      setError('Access Denied: Invalid Admin PIN or Master Password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-neutral-900 border border-neutral-800 text-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8 text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Shield Icon */}
        <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-400 shadow-inner">
          <KeyRound className="w-7 h-7" />
        </div>

        <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] uppercase font-mono tracking-widest mb-3">
          Restricted Access
        </div>

        <h3 className="font-serif text-2xl font-bold tracking-wide text-white mb-2">
          Shop Owner Portal
        </h3>
        
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed max-w-xs mx-auto">
          Enter the master administrative PIN to access inventory management, order fulfillment, and brand customizations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter Master PIN"
              autoFocus
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-3 px-4 text-center text-lg tracking-[0.2em] font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-neutral-300"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-98"
            >
              Verify & Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
