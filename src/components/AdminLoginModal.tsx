import React, { useState, useEffect } from 'react';
import { StoreConfig } from '../types';
import { X, Lock, Shield, Eye, EyeOff, KeyRound, AlertCircle, ShieldAlert, Timer } from 'lucide-react';
import { SecurityService } from '../services/securityService';

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockoutSec, setLockoutSec] = useState(0);

  // Check lockout on mount and tick down
  useEffect(() => {
    if (!isOpen) return;
    const status = SecurityService.getLockoutStatus();
    if (status.isLocked) {
      setLockoutSec(status.remainingSeconds);
    }
  }, [isOpen]);

  useEffect(() => {
    if (lockoutSec <= 0) return;
    const timer = setInterval(() => {
      setLockoutSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSec]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying || lockoutSec > 0) return;

    // Check lockout first
    const status = SecurityService.getLockoutStatus();
    if (status.isLocked) {
      setLockoutSec(status.remainingSeconds);
      setError(`Too many failed attempts. Security cooldown active (${status.remainingSeconds}s).`);
      return;
    }

    setIsVerifying(true);
    setError(null);

    // Artificial timing delay (500ms) to defeat automated rapid brute-force dictionary attacks
    await new Promise((r) => setTimeout(r, 500));

    const cleanInput = pin.trim();
    const correctPin = config.adminPin || 'admin123';

    if (cleanInput === correctPin) {
      setError(null);
      setPin('');
      await SecurityService.createAdminSession();
      setIsVerifying(false);
      onSuccessLogin();
    } else {
      const record = SecurityService.recordFailedAttempt();
      if (record.isLocked) {
        setLockoutSec(record.remainingSeconds);
        setError(`Access Denied! Security Lockout activated for 15 minutes.`);
      } else {
        setError(`Invalid Master PIN. Attempts remaining: ${record.attemptsRemaining}/5`);
      }
      setIsVerifying(false);
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
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner transition-colors ${
          lockoutSec > 0 
            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
            : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
        }`}>
          {lockoutSec > 0 ? <ShieldAlert className="w-7 h-7" /> : <KeyRound className="w-7 h-7" />}
        </div>

        <div className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-widest mb-3 border ${
          lockoutSec > 0 
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        }`}>
          {lockoutSec > 0 ? 'Brute-Force Lockout Active' : 'Restricted Access • Zero-Trust Shield'}
        </div>

        <h3 className="font-serif text-2xl font-bold tracking-wide text-white mb-2">
          Shop Owner Portal
        </h3>
        
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed max-w-xs mx-auto">
          Enter the master administrative PIN to access inventory management, order fulfillment, and brand customizations.
        </p>

        {lockoutSec > 0 ? (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-center space-y-2 mb-4">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm">
              <Timer className="w-4 h-4 animate-spin" />
              <span>Cooldown Timer: {Math.floor(lockoutSec / 60)}m {lockoutSec % 60}s</span>
            </div>
            <p className="text-[11px] text-rose-300/80">
              Multiple unauthorized login attempts detected. System has temporarily locked the portal to prevent brute-force attacks.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                disabled={isVerifying}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter Master PIN"
                autoFocus
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-3 px-4 text-center text-lg tracking-[0.2em] font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all disabled:opacity-50"
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
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/50 text-left">
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
                disabled={isVerifying || !pin.trim()}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-98 disabled:opacity-50"
              >
                {isVerifying ? 'Authenticating...' : 'Verify & Enter'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
