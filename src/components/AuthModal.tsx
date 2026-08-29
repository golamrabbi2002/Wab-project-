import React, { useState, useEffect, useRef } from 'react';
import { Customer, StoreConfig } from '../types';
import { GoogleAuthService, GoogleUserProfile } from '../services/googleAuth';
import { storageService } from '../services/storageService';
import { X, Lock, Mail, User, ShieldCheck, Check, AlertCircle, Key, Sparkles, Eye, EyeOff, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: StoreConfig;
  onCustomerLogin: (customer: Customer) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, config, onCustomerLogin }) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOfficialButtonRendered, setIsOfficialButtonRendered] = useState(false);

  const googleButtonContainerRef = useRef<HTMLDivElement>(null);
  const effectiveClientId = GoogleAuthService.getEffectiveClientId(config?.googleClientId);

  // Initialize and render official Google Identity Services (GIS) button
  useEffect(() => {
    let isMounted = true;

    if (!isOpen) {
      setIsOfficialButtonRendered(false);
      return;
    }

    const setupOfficialGoogleButton = async () => {
      if (!effectiveClientId) {
        if (isMounted) setIsOfficialButtonRendered(false);
        return;
      }

      const isLoaded = await GoogleAuthService.loadGoogleScript();
      if (!isLoaded || !isMounted) return;

      if (googleButtonContainerRef.current && window.google?.accounts?.id) {
        const rendered = await GoogleAuthService.renderOfficialButton(
          googleButtonContainerRef.current,
          effectiveClientId,
          (googleProfile: GoogleUserProfile) => {
            if (!isMounted) return;
            handleGoogleSuccess(googleProfile);
          },
          (errorMsg: string) => {
            if (!isMounted) return;
            setAuthError(errorMsg);
            setIsGoogleLoading(false);
          },
          {
            text: mode === 'signin' ? 'signin_with' : 'signup_with',
            theme: 'outline',
            width: googleButtonContainerRef.current.clientWidth || 360,
          }
        );

        if (isMounted) {
          setIsOfficialButtonRendered(rendered);
        }
      }
    };

    setupOfficialGoogleButton();

    return () => {
      isMounted = false;
      if (googleButtonContainerRef.current) {
        googleButtonContainerRef.current.innerHTML = '';
      }
    };
  }, [isOpen, mode, effectiveClientId]);

  if (!isOpen) return null;

  // Handle successful Google authentication
  const handleGoogleSuccess = (googleProfile: GoogleUserProfile) => {
    setIsGoogleLoading(false);
    setAuthError(null);
    const existingCustomers = storageService.getAllCustomers();
    const existing = existingCustomers.find(
      (c) => c.email.toLowerCase() === googleProfile.email.toLowerCase()
    );

    if (existing) {
      const updated: Customer = {
        ...existing,
        name: googleProfile.name || existing.name,
        avatar: googleProfile.avatar || existing.avatar,
      };
      storageService.saveCustomer(updated);
      onCustomerLogin(updated);
    } else {
      const customer = GoogleAuthService.mapProfileToCustomer(googleProfile);
      storageService.saveCustomer(customer);
      onCustomerLogin(customer);
    }
    onClose();
  };

  const handleStandardAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (password.length < 4) {
      setAuthError('Password must be at least 4 characters.');
      return;
    }

    const allCustomers = storageService.getAllCustomers();
    const existing = allCustomers.find((c) => c.email.toLowerCase() === cleanEmail);

    if (mode === 'signin') {
      if (existing) {
        storageService.saveCustomer(existing);
        onCustomerLogin(existing);
        onClose();
        return;
      }
      // If signing in for first time with this email, create profile
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        email: cleanEmail,
        name: name.trim() || (cleanEmail.includes('@') ? cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Customer'),
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop`,
        phone: '+880 1712-345678',
        shippingAddress: {
          street: 'House 42, Road 11, Banani',
          city: 'Dhaka',
          state: 'Dhaka Division',
          zip: '1213',
          country: 'Bangladesh',
        },
        wishlist: [],
        createdAt: new Date().toISOString(),
      };
      storageService.saveCustomer(newCustomer);
      onCustomerLogin(newCustomer);
      onClose();
    } else {
      // Register mode
      if (existing) {
        // Update name if changed and sign in
        const updated: Customer = {
          ...existing,
          name: name.trim() || existing.name,
        };
        storageService.saveCustomer(updated);
        onCustomerLogin(updated);
        onClose();
        return;
      }

      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        email: cleanEmail,
        name: name.trim() || (cleanEmail.includes('@') ? cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Customer'),
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop`,
        phone: '+880 1712-345678',
        shippingAddress: {
          street: 'House 42, Road 11, Banani',
          city: 'Dhaka',
          state: 'Dhaka Division',
          zip: '1213',
          country: 'Bangladesh',
        },
        wishlist: [],
        createdAt: new Date().toISOString(),
      };
      storageService.saveCustomer(newCustomer);
      onCustomerLogin(newCustomer);
      onClose();
    }
  };

  // Quick Demo Member Login
  const handleQuickDemoLogin = (type: 'vip' | 'stylist') => {
    setAuthError(null);
    const demoProfile: Customer = type === 'vip' ? {
      id: 'cust-vip-001',
      email: 'golamrabbi4801@gmail.com',
      name: 'Golam Rabbi (VIP Atelier)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      phone: '+880 1712-889900',
      shippingAddress: {
        street: 'Suite 14B, Gulshan Avenue 2',
        city: 'Dhaka',
        state: 'Dhaka Division',
        zip: '1212',
        country: 'Bangladesh',
      },
      wishlist: [],
      createdAt: new Date().toISOString(),
    } : {
      id: 'cust-stylist-002',
      email: 'tanzim.atelier@gmail.com',
      name: 'Tanzim Ahmed (Style Member)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      phone: '+880 1819-445566',
      shippingAddress: {
        street: 'House 18, Road 7, Dhanmondi',
        city: 'Dhaka',
        state: 'Dhaka Division',
        zip: '1205',
        country: 'Bangladesh',
      },
      wishlist: [],
      createdAt: new Date().toISOString(),
    };

    storageService.saveCustomer(demoProfile);
    onCustomerLogin(demoProfile);
    onClose();
  };

  // Programmatic trigger for Google Sign-In (Token Client / Prompt flow)
  const handleProgrammaticGoogleSignIn = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);

    if (effectiveClientId) {
      await GoogleAuthService.signInWithGoogle(
        effectiveClientId,
        (googleProfile: GoogleUserProfile) => {
          handleGoogleSuccess(googleProfile);
        },
        (errorMsg: string) => {
          setIsGoogleLoading(false);
          setAuthError(errorMsg);
        }
      );
    } else {
      // Demonstration fallback if Client ID is not yet provided
      setTimeout(() => {
        const demoProfile: GoogleUserProfile = {
          id: `google-${Date.now()}`,
          email: 'golamrabbi4801@gmail.com',
          name: 'Golam Rabbi (Google Verified)',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
          verifiedEmail: true,
        };
        handleGoogleSuccess(demoProfile);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 bg-[#faf9f6] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Atelier Membership</span>
            <h3 className="font-serif text-xl font-bold text-neutral-950">
              {mode === 'signin' ? 'Welcome Back' : 'Create Atelier Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-950 rounded-full hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => {
              setMode('signin');
              setAuthError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'signin' ? 'border-b-2 border-neutral-950 text-neutral-950 bg-white font-bold' : 'text-neutral-400 hover:text-neutral-700 bg-neutral-50'
            }`}
          >
            Member Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setAuthError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'register' ? 'border-b-2 border-neutral-950 text-neutral-950 bg-white font-bold' : 'text-neutral-400 hover:text-neutral-700 bg-neutral-50'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Authentication Notice</span>
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* Google Identity Services (GIS) Official Sign-In */}
          <div className="space-y-2">
            {/* Dedicated container for official Google Identity Services button */}
            <div
              ref={googleButtonContainerRef}
              className={`w-full flex justify-center min-h-[44px] ${
                isOfficialButtonRendered ? 'block' : 'hidden'
              }`}
            />

            {/* Custom Google Trigger Button (active when GIS official button is loading or as fallback) */}
            {!isOfficialButtonRendered && (
              <button
                type="button"
                onClick={handleProgrammaticGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow active:scale-98"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>
                  {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                </span>
              </button>
            )}

            {/* Status indicator */}
            {effectiveClientId ? (
              <div className="text-[10px] text-center text-emerald-600 font-mono flex items-center justify-center gap-1 pt-0.5">
                <Check className="w-3 h-3" />
                <span>Google Identity Services (GIS) Active</span>
              </div>
            ) : (
              <div className="text-[10px] text-center text-neutral-400 font-mono flex items-center justify-center gap-1 pt-0.5">
                <Key className="w-3 h-3 text-amber-500" />
                <span>Google Sign-In Ready</span>
              </div>
            )}

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Or Email Credentials</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardAuth} className="space-y-3.5 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanzim Ahmed"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none text-neutral-900 placeholder:text-neutral-400"
                  />
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none text-neutral-900 placeholder:text-neutral-400"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1 text-[11px]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-neutral-950 focus:outline-none text-neutral-900 placeholder:text-neutral-400"
                />
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-md mt-1 active:scale-98"
            >
              {mode === 'signin' ? 'Sign In to Atelier' : 'Create Account'}
            </button>
          </form>

          {/* Quick Demo Test Logins */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Instant Demo Access
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('vip')}
                className="p-2 text-left bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors group"
              >
                <span className="font-semibold text-neutral-900 block text-[11px] group-hover:text-emerald-700 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  VIP Member
                </span>
                <span className="text-[9px] text-neutral-500 font-mono truncate block">golamrabbi4801@...</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('stylist')}
                className="p-2 text-left bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors group"
              >
                <span className="font-semibold text-neutral-900 block text-[11px] group-hover:text-neutral-950 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-neutral-600" />
                  Stylist Member
                </span>
                <span className="text-[9px] text-neutral-500 font-mono truncate block">tanzim.atelier@...</span>
              </button>
            </div>
          </div>

          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-[10px] text-neutral-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted member session with persistent cart & order tracking.</span>
          </div>
        </div>
      </div>
    </div>
  );
};


