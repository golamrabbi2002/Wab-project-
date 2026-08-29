import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShoppingBag,
  Eye,
  RotateCcw,
  Minimize2,
  Maximize2,
  CheckCircle2,
  X,
  ShieldCheck,
  Truck,
  Activity,
  Cpu,
  Orbit,
  Zap,
  Flame,
  Scan,
  AudioWaveform as WaveformIcon,
  Headphones,
  Check,
  ShoppingBasket,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, StoreConfig } from '../types';
import { AiShoppingService, ChatMessage } from '../services/aiService';
import { VoiceService } from '../services/voiceService';
import { soundFx } from '../services/soundFx';
import { QuantumCoreVisualizer } from './SpaceStation/QuantumCoreVisualizer';

interface AiShoppingAssistantProps {
  products: Product[];
  config: StoreConfig;
  onQuickViewProduct: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onOpenOrderTracking?: () => void;
  onOpenSizeGuide?: () => void;
}

export const AiShoppingAssistant: React.FC<AiShoppingAssistantProps> = ({
  products,
  config,
  onQuickViewProduct,
  onAddToCart,
  onOpenOrderTracking,
  onOpenSizeGuide,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreenDeck, setIsFullScreenDeck] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicPaused, setIsMicPaused] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [telemetryTicks, setTelemetryTicks] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const botDisplayName = config.aiBotName || 'বিসমিল্লাহ কোয়ান্টাম এআই ভয়েস';
  const brandName = config.brandName || 'বিসমিল্লাহ কালেকশন';

  // Current Active AI Speech & Display State (Pure Voice Display, No Chat Clutter)
  const [currentAiStatement, setCurrentAiStatement] = useState<string>(
    'আসসালামু আলাইকুম! বিসমিল্লাহ কালেকশন ভয়েস স্টেশনে আপনাকে স্বাগতম। আমি আপনার পার্সোনাল লাইভ ফ্যাশন অ্যাসিস্ট্যান্ট। যে কোনো পাঞ্জাবি, শাড়ি বা থ্রি-পিসের কথা সরাসরি মুখে বলুন!'
  );
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [lastUserSpeech, setLastUserSpeech] = useState<string>('');

  const welcomeSpeech = `আসসালামু আলাইকুম! বিসমিল্লাহ কালেকশনে আপনাকে স্বাগতম। আমি আপনার লাইভ ভয়েস শপিং অ্যাসিস্ট্যান্ট। আজ আপনার জন্য কী ধরনের রাজকীয় পাঞ্জাবি বা শাড়ি দেখাব? সরাসরি মুখে বলুন!`;

  const hasSpokenWelcomeRef = useRef(false);
  const isExecutingQueryRef = useRef(false);
  const keepListeningRef = useRef(true);

  // Background Telemetry Clock Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTicks((t) => (t + 1) % 1000);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Initialize display products on mount or when product list updates
  useEffect(() => {
    if (products && products.length > 0 && displayProducts.length === 0) {
      setDisplayProducts(products.slice(0, 4));
    }
  }, [products, displayProducts.length]);

  // Continuous Voice Lifecycle
  const startLiveListening = useCallback(() => {
    if (isMicPaused || !isOpen || isExecutingQueryRef.current) return;

    VoiceService.stopSpeaking();
    setIsSpeaking(false);
    setVoiceError(null);
    setLiveTranscript('');

    const started = VoiceService.startListening(
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
        if (isFinal && transcript.trim()) {
          setLiveTranscript('');
          soundFx.playLockSuccess();
          handleVoiceQuery(transcript.trim());
        }
      },
      (error) => {
        setVoiceError(error);
        setIsListening(false);
        // Automatically attempt retry if error was temporary
        if (error.includes('সাময়িক') && isOpen && !isMicPaused && keepListeningRef.current) {
          setTimeout(() => {
            if (isOpen && !isMicPaused && !isSpeaking && !isExecutingQueryRef.current) {
              startLiveListening();
            }
          }, 2000);
        }
      },
      () => {
        setIsListening(false);
        // Auto-rearm if still open, not paused, and not speaking or executing query
        if (
          isOpen &&
          !isMicPaused &&
          !isSpeaking &&
          !isExecutingQueryRef.current &&
          keepListeningRef.current
        ) {
          setTimeout(() => {
            if (isOpen && !isMicPaused && !isSpeaking && !isExecutingQueryRef.current) {
              startLiveListening();
            }
          }, 600);
        }
      },
      true
    );

    if (started) {
      setIsListening(true);
    }
  }, [isMicPaused, isOpen, isSpeaking]);

  const speakResponse = useCallback(
    (text: string) => {
      VoiceService.stopListening();
      setIsListening(false);

      if (isMuted) {
        if (isOpen && !isMicPaused) {
          setTimeout(() => startLiveListening(), 600);
        }
        return;
      }

      VoiceService.speak(
        text,
        () => {
          setIsSpeaking(true);
        },
        () => {
          setIsSpeaking(false);
          // When AI finishes speaking, instantly auto-activate live mic to listen to customer!
          if (isOpen && !isMicPaused && keepListeningRef.current) {
            soundFx.playScanBlip();
            setTimeout(() => {
              startLiveListening();
            }, 400);
          }
        }
      );
    },
    [isMuted, isOpen, isMicPaused, startLiveListening]
  );

  const handleVoiceQuery = useCallback(
    async (queryText: string) => {
      const query = queryText.trim();
      if (!query || isLoading || isExecutingQueryRef.current) return;

      isExecutingQueryRef.current = true;
      VoiceService.stopSpeaking();
      VoiceService.stopListening();
      setIsListening(false);
      setIsSpeaking(false);
      soundFx.playScanBlip();
      setLastUserSpeech(query);
      setIsLoading(true);

      try {
        const aiResponse = await AiShoppingService.queryAssistant(
          query,
          [],
          products,
          config
        );

        const speechToPlay =
          aiResponse.spokenSummary ||
          AiShoppingService.cleanTextForVoice(aiResponse.text).slice(0, 180);

        setCurrentAiStatement(aiResponse.text);

        // Update holographic product display
        if (aiResponse.matchedProducts && aiResponse.matchedProducts.length > 0) {
          setDisplayProducts(aiResponse.matchedProducts);
        } else {
          // Fallback to contextual filtering
          const lower = query.toLowerCase();
          if (lower.includes('পাঞ্জাবি') || lower.includes('panjabi')) {
            setDisplayProducts(products.filter((p) => (p.category || '').toLowerCase().includes('panjabi') || p.title.toLowerCase().includes('panjabi')));
          } else if (lower.includes('শাড়ি') || lower.includes('saree')) {
            setDisplayProducts(products.filter((p) => (p.category || '').toLowerCase().includes('saree') || p.title.toLowerCase().includes('saree')));
          } else if (lower.includes('থ্রি') || lower.includes('three')) {
            setDisplayProducts(products.filter((p) => (p.category || '').toLowerCase().includes('three') || p.title.toLowerCase().includes('three')));
          }
        }

        isExecutingQueryRef.current = false;
        setIsLoading(false);

        // Speak aloud, then auto-listen resumes on speech end
        speakResponse(speechToPlay);
      } catch (err) {
        console.warn('Voice AI error, using resilient response:', err);
        const fallbackText =
          'আসসালামু আলাইকুম! আমাদের সকল পাঞ্জাবি ও শাড়িতে ক্যাশ অন ডেলিভারি এবং ৭ দিনের সাইজ এক্সচেঞ্জ সুবিধা রয়েছে। কোন পোশাকটি দেখতে চান মুখে বলুন!';
        setCurrentAiStatement(fallbackText);
        isExecutingQueryRef.current = false;
        setIsLoading(false);
        speakResponse(fallbackText);
      }
    },
    [isLoading, products, config, speakResponse]
  );

  // Trigger startup on open & speak welcome
  const handleOpenDeck = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setIsMicPaused(false);
    keepListeningRef.current = true;
    soundFx.playStartup();
  };

  useEffect(() => {
    if (isOpen && !hasSpokenWelcomeRef.current) {
      hasSpokenWelcomeRef.current = true;
      const timer = setTimeout(() => {
        speakResponse(welcomeSpeech);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, speakResponse, welcomeSpeech]);

  // Clean shutdown when closed
  useEffect(() => {
    if (!isOpen) {
      keepListeningRef.current = false;
      VoiceService.stopSpeaking();
      VoiceService.stopListening();
      setIsListening(false);
      setIsSpeaking(false);
      hasSpokenWelcomeRef.current = false;
    }
  }, [isOpen]);

  const toggleMicPause = () => {
    soundFx.playScanBlip();
    if (isListening) {
      VoiceService.stopListening();
      setIsListening(false);
      setIsMicPaused(true);
      keepListeningRef.current = false;
    } else {
      setIsMicPaused(false);
      keepListeningRef.current = true;
      startLiveListening();
    }
  };

  const toggleMute = () => {
    soundFx.playScanBlip();
    if (!isMuted) {
      VoiceService.stopSpeaking();
      setIsSpeaking(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleResetSession = () => {
    soundFx.playStartup();
    VoiceService.stopSpeaking();
    VoiceService.stopListening();
    setIsListening(false);
    setIsSpeaking(false);
    setLastUserSpeech('');
    setDisplayProducts(products.slice(0, 4));
    setCurrentAiStatement(
      'আসসালামু আলাইকুম! বিসমিল্লাহ কালেকশন ভয়েস স্টেশনে আপনাকে স্বাগতম। আপনি সরাসরি মুখে কথা বলে যে কোনো পোশাকের খোঁজ নিতে পারেন।'
    );
    hasSpokenWelcomeRef.current = true;
    speakResponse('নতুন সেশন প্রস্তুত। আপনার যে কোনো প্রশ্ন বা পছন্দের পোশাকের কথা সরাসরি বলুন।');
  };

  const handleTriggerVoicePrompt = (spokenPrompt: string) => {
    soundFx.playScanBlip();
    handleVoiceQuery(spokenPrompt);
  };

  const handleAddToCartWithFeedback = (product: Product) => {
    soundFx.playLockSuccess();
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2500);
  };

  const filterProductsByCategory = (cat: string) => {
    setActiveCategoryFilter(cat);
    soundFx.playScanBlip();
    if (cat === 'all') {
      setDisplayProducts(products.slice(0, 6));
      handleVoiceQuery('সকল সেরা কালেকশন দেখান');
    } else if (cat === 'panjabi') {
      const filtered = products.filter((p) => (p.category || '').toLowerCase().includes('panjabi') || p.title.toLowerCase().includes('panjabi'));
      setDisplayProducts(filtered.length > 0 ? filtered : products.slice(0, 4));
      handleVoiceQuery('প্রিমিয়াম পাঞ্জাবি কালেকশন দেখান');
    } else if (cat === 'saree') {
      const filtered = products.filter((p) => (p.category || '').toLowerCase().includes('saree') || p.title.toLowerCase().includes('saree'));
      setDisplayProducts(filtered.length > 0 ? filtered : products.slice(0, 4));
      handleVoiceQuery('এক্সক্লুসিভ কাতান ও জামদানি শাড়ি দেখান');
    } else if (cat === 'three_piece') {
      const filtered = products.filter((p) => (p.category || '').toLowerCase().includes('three') || p.title.toLowerCase().includes('three'));
      setDisplayProducts(filtered.length > 0 ? filtered : products.slice(0, 4));
      handleVoiceQuery('ডিজাইনার থ্রি-পিস কালেকশন দেখান');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none font-sans">
      {/* Floating Holographic Planetary Orb Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="relative group"
        >
          {/* Orbital Radar Glow Wave Ring */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-500 rounded-full blur-md opacity-70 group-hover:opacity-100 animate-pulse transition duration-500"></div>

          {/* Planetary Orbit Ring */}
          <div className="absolute -inset-4 rounded-full border border-cyan-400/40 animate-[spin_12s_linear_infinite] pointer-events-none">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#06b6d4]"></span>
          </div>

          <button
            id="btn-open-space-station-deck"
            onClick={handleOpenDeck}
            className="relative flex items-center gap-3 px-5 py-3.5 bg-neutral-950/95 hover:bg-neutral-900 text-white rounded-full border border-cyan-400/60 shadow-[0_10px_30px_rgba(0,0,0,0.85),0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            {/* Holographic Solar Core Icon */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 via-amber-500 to-emerald-400 p-[2px] shadow-inner flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center overflow-hidden">
                <Mic className="w-5 h-5 text-cyan-400 group-hover:text-amber-300 animate-pulse" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>

            {/* Title & Live Status */}
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] tracking-wider uppercase text-cyan-400 font-bold">
                  {brandName} AI VOICE
                </span>
                <span className="px-1.5 py-0.2 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full text-[9px] font-mono">
                  LIVE
                </span>
              </div>
              <p className="text-xs font-bold text-neutral-100 flex items-center gap-1">
                <span>মুখে কথা বলে অর্ডার করুন</span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </p>
            </div>
          </button>
        </motion.div>
      )}

      {/* Main Holographic Solar Station & Product Display HUD */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              height: isMinimized ? 'auto' : isFullScreenDeck ? '92vh' : '640px',
              width: isMinimized ? '320px' : isFullScreenDeck ? '95vw' : '460px',
            }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className={`flex flex-col bg-neutral-950/98 border border-cyan-500/40 text-neutral-100 shadow-[0_25px_70px_rgba(0,0,0,0.98),0_0_40px_rgba(6,182,212,0.25)] rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-300 z-50 ${
              isFullScreenDeck ? 'fixed inset-4 sm:inset-6 m-auto' : ''
            }`}
          >
            {/* Top Telemetry Header */}
            <div className="p-3.5 bg-gradient-to-r from-neutral-950 via-cyan-950/40 to-neutral-950 border-b border-cyan-500/30 flex items-center justify-between shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#08334415_1px,transparent_1px),linear-gradient(to_bottom,#08334415_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

              {/* Station Brand and Live Status */}
              <div className="flex items-center gap-2.5 relative z-10">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-600 via-neutral-900 to-amber-500 p-[2px] shadow-lg flex items-center justify-center">
                    <div className="w-full h-full bg-neutral-950 rounded-2xl flex items-center justify-center">
                      <Orbit className="w-4.5 h-4.5 text-cyan-400 animate-[spin_10s_linear_infinite]" />
                    </div>
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-neutral-950 flex items-center justify-center ${
                      isSpeaking
                        ? 'bg-emerald-400 animate-ping'
                        : isListening
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-cyan-400'
                    }`}
                  ></span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                      {botDisplayName}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      VOICE
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-sans flex items-center gap-1.5 mt-0.5">
                    <span>{brandName}</span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-amber-400 font-mono text-[9px]">
                      ORBIT #{telemetryTicks.toString().padStart(3, '0')}
                    </span>
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1 relative z-10">
                <button
                  type="button"
                  onClick={handleResetSession}
                  title="নতুন সেশন শুরু করুন"
                  className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-cyan-400 border border-neutral-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  title={isMuted ? 'ভয়েস চালু করুন' : 'ভয়েস মিউট করুন'}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isMuted
                      ? 'bg-rose-950/80 text-rose-400 border-rose-500/50'
                      : 'bg-neutral-900/80 text-emerald-400 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullScreenDeck(!isFullScreenDeck)}
                  title={isFullScreenDeck ? 'ছোট করুন' : 'ফুলস্ক্রিন'}
                  className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-800 transition-colors cursor-pointer hidden sm:flex"
                >
                  {isFullScreenDeck ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'বড় করুন' : 'মিনিমাইজ'}
                  className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-cyan-400 border border-neutral-800 transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="বন্ধ করুন"
                  className="p-2 rounded-xl bg-neutral-900/80 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-500/40 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Interactive Holographic Body */}
            {!isMinimized && (
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-neutral-950 to-neutral-950">
                {/* 1. 3D Solar Quantum Core & Planetary Orbits Reactor */}
                <div className="relative shrink-0 border-b border-cyan-500/20 bg-neutral-950 overflow-hidden">
                  <QuantumCoreVisualizer
                    mode={isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle'}
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                  />

                  {/* Core Diagnostic HUD Overlay */}
                  <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-cyan-400/80 pointer-events-none">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
                      <span>{brandName.toUpperCase()} VOICE RADAR</span>
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Zap className="w-3 h-3" />
                      <span>SOLAR POWER 100%</span>
                    </span>
                  </div>

                  {/* Live Status Overlay Badge */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <div
                      className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-2 border shadow-lg backdrop-blur-md transition-all ${
                        isSpeaking
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.35)]'
                          : isListening
                          ? 'bg-rose-950/90 text-rose-300 border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.45)] animate-pulse'
                          : isLoading
                          ? 'bg-amber-950/90 text-amber-300 border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                          : isMicPaused
                          ? 'bg-neutral-900/90 text-neutral-400 border-neutral-700'
                          : 'bg-cyan-950/90 text-cyan-300 border-cyan-400/40'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                          <span>🔊 এআই কথা বলছে...</span>
                        </>
                      ) : isListening ? (
                        <>
                          <Mic className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                          <span>🎙️ সরাসরি মুখে বলুন, শুনছি...</span>
                        </>
                      ) : isLoading ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                          <span>🌌 প্রসেসিং হচ্ছে...</span>
                        </>
                      ) : isMicPaused ? (
                        <>
                          <MicOff className="w-3.5 h-3.5 text-neutral-400" />
                          <span>⏸️ মাইক পজ করা আছে</span>
                        </>
                      ) : (
                        <>
                          <Headphones className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                          <span>🛰️ লাইভ ভয়েস মোড সক্রিয়</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Holographic Speech & Display Screen */}
                <div className="p-4 space-y-4">
                  {/* Real-time Customer Speech Live Badge */}
                  {(liveTranscript || lastUserSpeech) && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-start gap-2.5 shadow-md"
                    >
                      <span className="p-1.5 rounded-lg bg-cyan-900/80 text-cyan-300 shrink-0 mt-0.5">
                        <Mic className="w-3.5 h-3.5 animate-pulse" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                            আপনার কথা (VOICE INPUT):
                          </span>
                          {liveTranscript && (
                            <span className="text-[9px] text-rose-400 font-mono flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              লাইভ ক্যাপচার
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-100 font-medium mt-0.5">
                          "{liveTranscript || lastUserSpeech}"
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* AI Holographic Response Display Card */}
                  <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                          {botDisplayName}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        ১০০% খাঁটি পণ্য
                      </span>
                    </div>

                    <p className="text-xs sm:text-[13px] text-neutral-200 leading-relaxed font-sans whitespace-pre-line">
                      {currentAiStatement}
                    </p>
                  </div>

                  {/* 3. Category Filter Navigation Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => filterProductsByCategory('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeCategoryFilter === 'all'
                          ? 'bg-cyan-500 text-neutral-950 font-bold shadow-md shadow-cyan-500/30'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>সব কালেকশন</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => filterProductsByCategory('panjabi')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeCategoryFilter === 'panjabi'
                          ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/30'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      <span>👑 প্রিমিয়াম পাঞ্জাবি</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => filterProductsByCategory('saree')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeCategoryFilter === 'saree'
                          ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      <span>🥻 কাতান ও শাড়ি</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => filterProductsByCategory('three_piece')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeCategoryFilter === 'three_piece'
                          ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md shadow-emerald-500/30'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      <span>👗 থ্রি-পিস</span>
                    </button>
                  </div>

                  {/* 4. Holographic Matched Products Showcase */}
                  {displayProducts.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-cyan-400 px-1">
                        <span className="flex items-center gap-1.5 uppercase font-bold tracking-wider">
                          <Scan className="w-3.5 h-3.5 text-amber-400" />
                          প্রদর্শিত পোশাক কালেকশন ({displayProducts.length})
                        </span>
                        <span className="text-[10px] text-neutral-500">হোলো-ডিসপ্লে</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {displayProducts.map((p) => {
                          const primaryImg =
                            p.images?.[0] ||
                            (p as any).image ||
                            'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop';
                          const isJustAdded = addedProductId === p.id;

                          return (
                            <div
                              key={p.id}
                              className="p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-cyan-400/60 transition-all flex gap-2.5 group shadow-md"
                            >
                              {/* Product Image */}
                              <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-neutral-950 shrink-0 border border-neutral-800">
                                <img
                                  src={primaryImg}
                                  alt={p.name || p.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {p.discount && p.discount > 0 && (
                                  <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-rose-600 text-white font-bold text-[9px] rounded shadow">
                                    -{p.discount}%
                                  </span>
                                )}
                              </div>

                              {/* Product Details & Actions */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <h4 className="text-xs font-bold text-neutral-100 line-clamp-1 group-hover:text-cyan-300 transition-colors">
                                    {p.name || p.title}
                                  </h4>
                                  <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                                    {p.category || 'এক্সক্লুসিভ কালেকশন'}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-1 font-mono">
                                    <span className="text-sm font-bold text-amber-400">
                                      {config.currencySymbol || '৳'}{p.price}
                                    </span>
                                    {p.originalPrice && p.originalPrice > p.price && (
                                      <span className="text-[10px] text-neutral-500 line-through">
                                        {config.currencySymbol || '৳'}{p.originalPrice}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1.5 mt-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCartWithFeedback(p)}
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                      isJustAdded
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-cyan-600 hover:bg-cyan-500 text-neutral-950 shadow-md shadow-cyan-600/30'
                                    }`}
                                  >
                                    {isJustAdded ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>যুক্ত হয়েছে!</span>
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingBag className="w-3 h-3" />
                                        <span>ব্যাগ-এ নিন</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onQuickViewProduct(p)}
                                    title="বিস্তারিত দেখুন"
                                    className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 5. Direct Voice Trigger Chips */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Mic className="w-3 h-3 text-cyan-400" />
                      <span>দ্রুত মুখে বলুন বা ক্লিক করুন:</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTriggerVoicePrompt('সেরা পাঞ্জাবি কালেকশন ও সাইজ দেখান')}
                        className="px-2.5 py-1 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border border-neutral-800 hover:border-amber-500/40 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>🎙️ সেরা পাঞ্জাবি</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriggerVoicePrompt('কাতান ও জামদানি শাড়ি দেখান')}
                        className="px-2.5 py-1 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-rose-300 border border-neutral-800 hover:border-rose-500/40 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>🎙️ এক্সক্লুসিভ শাড়ি</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriggerVoicePrompt('ক্যাশ অন ডেলিভারি এবং ডেলিভারি চার্জ কত?')}
                        className="px-2.5 py-1 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-cyan-300 border border-neutral-800 hover:border-cyan-500/40 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>🎙️ ডেলিভারির নিয়ম</span>
                      </button>

                      {onOpenOrderTracking && (
                        <button
                          type="button"
                          onClick={onOpenOrderTracking}
                          className="px-2.5 py-1 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-300 border border-neutral-800 hover:border-emerald-500/40 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3 text-emerald-400" />
                          <span>অর্ডার ট্র্যাকিং</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 6. Bottom Master Voice Radar & Mic Controller */}
                <div className="p-3.5 bg-neutral-950 border-t border-cyan-500/20 shrink-0 space-y-2.5 mt-auto">
                  {/* Voice Status & Waveform Deck */}
                  <div
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isListening
                        ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                        : isSpeaking
                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.25)]'
                        : 'bg-neutral-900/80 border-neutral-800'
                    }`}
                  >
                    {/* Pulsing Audio Waveform Bars */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center gap-1 h-6 shrink-0">
                        {[40, 75, 100, 60, 90, 45, 80, 55].map((height, idx) => (
                          <span
                            key={idx}
                            style={{
                              height: isListening || isSpeaking ? `${height}%` : '20%',
                              animationDelay: `${idx * 0.1}s`,
                            }}
                            className={`w-1 rounded-full transition-all duration-200 ${
                              isListening
                                ? 'bg-rose-400 animate-pulse'
                                : isSpeaking
                                ? 'bg-emerald-400 animate-pulse'
                                : 'bg-neutral-600'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-mono font-bold flex items-center gap-1.5">
                          {isSpeaking ? (
                            <span className="text-emerald-300">🔊 এআই উত্তর দিচ্ছে...</span>
                          ) : isListening ? (
                            <span className="text-rose-300">🔴 লাইভ শুনছি... মুখে বলুন!</span>
                          ) : isMicPaused ? (
                            <span className="text-neutral-400">মাইক সাময়িক পজ করা আছে</span>
                          ) : (
                            <span className="text-cyan-300">লাইভ ভয়েস রেডি</span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 font-mono truncate">
                          {isListening
                            ? 'আপনি কথা শেষ করলেই এআই উত্তর দেবে'
                            : isSpeaking
                            ? 'কথা শেষ হলে স্বয়ংক্রিয়ভাবে আবার মাইক শুনবে'
                            : 'সরাসরি বাংলায় কথা বলুন'}
                        </p>
                      </div>
                    </div>

                    {/* Master Mic Button */}
                    <button
                      id="btn-toggle-live-mic"
                      type="button"
                      onClick={toggleMicPause}
                      className={`py-2 px-3.5 rounded-xl flex items-center gap-1.5 font-bold text-xs transition-all shadow-md cursor-pointer shrink-0 ${
                        isListening
                          ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                          : isMicPaused
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-neutral-950'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5" />
                          <span>পজ</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          <span>মাইক অন</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Delivery & Security Badges */}
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1 font-sans">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                      <span>১০০% ক্যাশ অন ডেলিভারি ও ওপেন বক্স চেক</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const waUrl = `https://wa.me/${(config.supportPhone || '+8801700000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          'আসসালামু আলাইকুম! বিসমিল্লাহ কালেকশন থেকে পোশাক অর্ডার করতে চাই।'
                        )}`;
                        window.open(waUrl, '_blank');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>হোয়াটসঅ্যাপে অর্ডার</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
