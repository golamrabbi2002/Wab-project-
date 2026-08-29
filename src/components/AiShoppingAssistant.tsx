import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShoppingBag,
  Eye,
  ChevronRight,
  RotateCcw,
  Minimize2,
  Maximize2,
  CheckCircle2,
  PhoneCall,
  X,
  Radio,
  BookOpen,
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
  const [activeDeckTab, setActiveDeckTab] = useState<'console' | 'lore' | 'radar'>('console');
  const [telemetryTicks, setTelemetryTicks] = useState(0);

  const botDisplayName = config.aiBotName || 'ORBITAL-AI v3.7 / বিসমিল্লাহ এআই';
  const brandName = config.brandName || 'বিসমিল্লাহ কালেকশন';

  const welcomeText = `🛰️ [ORBITAL STATION LIVE VOICE]: আসসালামু আলাইকুম! বিসমিল্লাহ কালেকশনে আপনাকে স্বাগতম। 🌌✨\n\nআমি আপনার পার্সোনাল জেমিনি লাইভ ভয়েস ফ্যাশন কনসালট্যান্ট। আপনি সরাসরি মুখে কথা বলে যে কোনো পাঞ্জাবি, জামদানি শাড়ি, সিল্ক শাড়ি বা থ্রি-পিসের কথা জিজ্ঞেস করতে পারেন।\n\n🛡️ প্রোটোকল: ১০০% ক্যাশ অন ডেলিভারি, ডেলিভারিম্যানের সামনে চেক করার সুবিধা ও ৭ দিনের ফ্রি এক্সচেঞ্জ।`;
  const welcomeSpeech = `আসসালামু আলাইকুম! বিসমিল্লাহ কালেকশনে আপনাকে স্বাগতম। আমি আপনার লাইভ ভয়েস ও ফ্যাশন কনসালট্যান্ট। আজ আপনার জন্য কী ধরনের রাজকীয় পোশাক বা পাঞ্জাবি খুঁজব? মুখে সরাসরি বলুন!`;

  const initialGreeting: ChatMessage = {
    id: 'msg_welcome',
    sender: 'ai',
    text: welcomeText,
    spokenSummary: welcomeSpeech,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actionPills: [
      { label: '✨ প্রিমিয়াম পাঞ্জাবি দেখান', action: 'show_panjabi' },
      { label: '🥻 এক্সক্লুসিভ শাড়ি কালেকশন', action: 'show_saree' },
      { label: '👗 ডিজাইনার থ্রি-পিস', action: 'show_three_piece' },
      { label: '🛡️ ক্যাশ অন ডেলিভারি নিয়ম', action: 'ask_rules' },
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, liveTranscript]);

  // Forward declarations for speech cycle
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
          handleSendMessage(transcript.trim());
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
          }, 800);
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
        // If muted, jump directly back to live listening
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
            }, 500);
          }
        }
      );
    },
    [isMuted, isOpen, isMicPaused, startLiveListening]
  );

  const handleSendMessage = useCallback(
    async (queryText: string) => {
      const query = queryText.trim();
      if (!query || isLoading || isExecutingQueryRef.current) return;

      isExecutingQueryRef.current = true;
      VoiceService.stopSpeaking();
      VoiceService.stopListening();
      setIsListening(false);
      setIsSpeaking(false);
      soundFx.playScanBlip();

      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const aiResponse = await AiShoppingService.queryAssistant(
          query,
          messages,
          products,
          config
        );

        const speechToPlay =
          aiResponse.spokenSummary ||
          AiShoppingService.cleanTextForVoice(aiResponse.text).slice(0, 160);

        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: aiResponse.text,
          spokenSummary: speechToPlay,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          matchedProducts: aiResponse.matchedProducts,
          actionPills: aiResponse.actionPills,
        };

        setMessages((prev) => [...prev, aiMsg]);
        isExecutingQueryRef.current = false;
        setIsLoading(false);

        // Speak aloud, then it will auto-listen on end!
        speakResponse(speechToPlay);
      } catch (err) {
        console.error('Space Station Live AI error:', err);
        const fallbackText =
          '🛰️ কোয়ান্টাম টেলিমেট্রি লিংক সাময়িক বাধাগ্রস্ত হয়েছে। দয়া করে আবার বলুন।';
        const errorMsg: ChatMessage = {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
        isExecutingQueryRef.current = false;
        setIsLoading(false);
        speakResponse(fallbackText);
      }
    },
    [isLoading, messages, products, config, speakResponse]
  );

  // Trigger startup on open & start greeting audio
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
      }, 500);
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
    setMessages([initialGreeting]);
    setIsListening(false);
    setIsSpeaking(false);
    hasSpokenWelcomeRef.current = true;
    speakResponse('নতুন সেশন প্রস্তুত। আপনার যে কোনো প্রশ্ন বা পছন্দের পোশাকের কথা সরাসরি বলুন।');
  };

  const handleActionPillClick = (action: string, label: string) => {
    soundFx.playScanBlip();
    if (action === 'open_tracking' && onOpenOrderTracking) {
      onOpenOrderTracking();
      return;
    }
    if (action === 'open_size_guide' && onOpenSizeGuide) {
      onOpenSizeGuide();
      return;
    }
    if (action === 'open_whatsapp') {
      const waUrl = `https://wa.me/${(config.supportPhone || '+8801700000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        'আসসালামু আলাইকুম! বিসমিল্লাহ কালেকশন থেকে পছন্দের পোশাক অর্ডার করতে সহায়তা চাই।'
      )}`;
      window.open(waUrl, '_blank');
      return;
    }
    handleSendMessage(label);
  };

  const handleAddToCartWithFeedback = (product: Product) => {
    soundFx.playLockSuccess();
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none font-sans">
      {/* Floating Space Station Quantum Orb Trigger Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="relative group"
        >
          {/* Orbital Radar Glow Wave Ring */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-500 rounded-full blur-md opacity-70 group-hover:opacity-100 animate-pulse transition duration-500"></div>

          {/* Orbit Indicator Ring */}
          <div className="absolute -inset-4 rounded-full border border-cyan-400/40 animate-[spin_12s_linear_infinite] pointer-events-none">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#06b6d4]"></span>
          </div>

          <button
            id="btn-open-space-station-deck"
            onClick={handleOpenDeck}
            className="relative flex items-center gap-3 px-5 py-3.5 bg-neutral-950/95 hover:bg-neutral-900 text-white rounded-full border border-cyan-400/60 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.35)] backdrop-blur-xl transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            {/* Holographic Orb Core */}
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 via-neutral-950 to-amber-500 p-[2px] shadow-inner flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center overflow-hidden">
                <Mic className="w-5 h-5 text-cyan-400 group-hover:text-amber-300 animate-pulse" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            {/* Title & Live Status */}
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] tracking-wider uppercase text-cyan-400 font-bold">
                  GEMINI LIVE VOICE
                </span>
                <span className="px-1.5 py-0.2 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full text-[9px] font-mono">
                  ONLINE
                </span>
              </div>
              <p className="text-xs font-bold text-neutral-100 flex items-center gap-1">
                <span>কথা বলে শপিং করুন</span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </p>
            </div>
          </button>
        </motion.div>
      )}

      {/* Main Holographic Space Station Command HUD */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              height: isMinimized ? 'auto' : isFullScreenDeck ? '92vh' : '620px',
              width: isMinimized ? '320px' : isFullScreenDeck ? '95vw' : '440px',
            }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className={`flex flex-col bg-neutral-950/95 border border-cyan-500/40 text-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(6,182,212,0.25)] rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-300 z-50 ${
              isFullScreenDeck ? 'fixed inset-4 sm:inset-6 m-auto' : ''
            }`}
          >
            {/* Top Telemetry Space Station Banner & Command Controls */}
            <div className="p-4 bg-gradient-to-r from-neutral-950 via-cyan-950/40 to-neutral-950 border-b border-cyan-500/30 flex items-center justify-between shrink-0 relative overflow-hidden">
              {/* Scanline Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#08334415_1px,transparent_1px),linear-gradient(to_bottom,#08334415_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

              {/* Station Brand and Live Status */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-neutral-900 to-amber-500 p-[2px] shadow-lg flex items-center justify-center">
                    <div className="w-full h-full bg-neutral-950 rounded-2xl flex items-center justify-center">
                      <Orbit className="w-5 h-5 text-cyan-400 animate-[spin_10s_linear_infinite]" />
                    </div>
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-neutral-950 flex items-center justify-center ${
                      isSpeaking
                        ? 'bg-emerald-400 animate-ping'
                        : isListening
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-cyan-400'
                    }`}
                  ></span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                      {botDisplayName}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans flex items-center gap-1.5 mt-0.5">
                    <span>{brandName}</span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-amber-400 font-mono text-[10px]">
                      TLM #{telemetryTicks.toString().padStart(3, '0')}
                    </span>
                  </p>
                </div>
              </div>

              {/* Control Deck Action Buttons */}
              <div className="flex items-center gap-1.5 relative z-10">
                <button
                  onClick={handleResetSession}
                  title="নতুন আলোচনা শুরু করুন"
                  className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-cyan-400 border border-neutral-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={toggleMute}
                  title={isMuted ? 'ভয়েস চালু করুন' : 'ভয়েস বন্ধ রাখুন'}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isMuted
                      ? 'bg-rose-950/80 text-rose-400 border-rose-500/50'
                      : 'bg-neutral-900/80 text-emerald-400 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsFullScreenDeck(!isFullScreenDeck)}
                  title={isFullScreenDeck ? 'পপআপ ভিউ' : 'ফুলস্ক্রিন কমান্ড ডেক'}
                  className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-800 transition-colors cursor-pointer hidden sm:flex"
                >
                  {isFullScreenDeck ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'বড় করুন' : 'মিনিমাইজ'}
                  className="p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-cyan-400 border border-neutral-800 transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  title="বন্ধ করুন"
                  className="p-2 rounded-xl bg-neutral-900/80 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-500/40 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Interactive Deck Body */}
            {!isMinimized && (
              <>
                {/* 3D Quantum Core Reactor Visualizer Canvas */}
                <div className="relative shrink-0 border-b border-cyan-500/20 bg-neutral-950">
                  <QuantumCoreVisualizer
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    mode={isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle'}
                  />

                  {/* Core Diagnostic Readout HUD Overlay */}
                  <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-cyan-400/80 pointer-events-none">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
                      <span>GEMINI LIVE NEURAL LINK</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Zap className="w-3 h-3" />
                      <span>WARP SPEED 100%</span>
                    </span>
                  </div>

                  {/* Live Status Overlay Badge */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-2 border shadow-lg backdrop-blur-md transition-all ${
                        isSpeaking
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                          : isListening
                          ? 'bg-rose-950/90 text-rose-300 border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
                          : isLoading
                          ? 'bg-amber-950/90 text-amber-300 border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
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
                          <span>🌌 কোয়ান্টাম প্রসেসিং চলছে...</span>
                        </>
                      ) : isMicPaused ? (
                        <>
                          <MicOff className="w-3.5 h-3.5 text-neutral-400" />
                          <span>⏸️ মাইক পজ করা আছে</span>
                        </>
                      ) : (
                        <>
                          <Headphones className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                          <span>🛰️ লাইভ ভয়েস কানেক্টেড</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Pills Bar for Quick Actions & Telemetry Filter */}
                <div className="px-3.5 py-2 bg-neutral-900/80 border-b border-cyan-500/20 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveDeckTab('console')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                        activeDeckTab === 'console'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <Activity className="w-3 h-3" />
                      <span>টেলিমেট্রি হিস্ট্রি</span>
                    </button>
                    <button
                      onClick={() => setActiveDeckTab('radar')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                        activeDeckTab === 'radar'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <Scan className="w-3 h-3" />
                      <span>প্রোডাক্ট স্ক্যানার ({products.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveDeckTab('lore')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
                        activeDeckTab === 'lore'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>পলিসি & ঐতিহ্য</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline-block">
                    LIVE STREAM V3.7
                  </span>
                </div>

                {/* Holographic Log Feed / Dynamic Dialogue Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/15 via-neutral-950 to-neutral-950 custom-scrollbar">
                  {/* Live Transcript Bubble when customer is speaking */}
                  {isListening && liveTranscript && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-center gap-3 text-xs shadow-lg"
                    >
                      <Mic className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                      <div className="flex-1">
                        <span className="font-mono text-[10px] uppercase text-rose-400 font-bold block">
                          লাইভ ভয়েস ডিকোডিং...
                        </span>
                        <p className="font-medium mt-0.5">{liveTranscript}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Voice Error Notice if microphone issue occurs */}
                  {voiceError && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-amber-950/50 border border-amber-500/40 rounded-2xl text-amber-200 text-xs flex items-center justify-between gap-2 font-sans"
                    >
                      <span>⚠️ {voiceError}</span>
                      <button
                        onClick={startLiveListening}
                        className="px-2 py-1 bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        আবার চেষ্টা করুন
                      </button>
                    </motion.div>
                  )}

                  {/* Lore / Storytelling Tab View */}
                  {activeDeckTab === 'lore' && (
                    <div className="space-y-3 p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs">
                      <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
                        <Flame className="w-4 h-4" />
                        <span>বিসমিল্লাহ কালেকশন এর কাপড়ের ঐতিহ্য ও গ্যারান্টি</span>
                      </div>
                      <p className="text-neutral-300 leading-relaxed font-sans">
                        আমাদের প্রতিটি সুতি, সিল্ক ও কাতান কাপড় সেরা তাঁতিদের হাতে পরম যত্নে বোনা। রঙের স্থায়িত্ব ও আরামদায়ক টেক্সচার বজায় রাখতে প্রিমিয়াম কোয়ালিটি ফিনিশিং করা হয়।
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-sans">
                        <div className="p-2.5 rounded-xl bg-neutral-950 border border-emerald-500/30 text-emerald-300">
                          <span className="font-bold block text-white mb-1">🛡️ ক্যাশ অন ডেলিভারি</span>
                          পার্সেল খুলে দেখে ও সাইজ নিশ্চিত হয়ে টাকা দেওয়ার পূর্ণ স্বাধীনতা।
                        </div>
                        <div className="p-2.5 rounded-xl bg-neutral-950 border border-cyan-500/30 text-cyan-300">
                          <span className="font-bold block text-white mb-1">🔄 ৭ দিনের ফ্রি এক্সচেঞ্জ</span>
                          সাইজ বা ফিটিংসে কোনো সমস্যা হলে বিনা দ্বিধায় এক্সচেঞ্জ করে দেওয়া হবে।
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Radar Tab View (Quick Product Catalog Scan) */}
                  {activeDeckTab === 'radar' && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                        🛰️ স্টেশনের সকল এক্সক্লুসিভ কালেকশন ({products.length} টি আইটেম)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {products.slice(0, 6).map((p) => (
                          <div
                            key={p.id}
                            className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-cyan-400/50 flex items-center gap-2.5 transition-all"
                          >
                            <img
                              src={p.images?.[0] || (p as any).image || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop'}
                              alt={p.name}
                              className="w-12 h-12 rounded-lg object-cover bg-neutral-950 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                              <p className="text-[11px] text-amber-400 font-bold font-mono">
                                ৳{p.price.toLocaleString('en-BD')}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() => onQuickViewProduct(p)}
                                  className="text-[10px] text-cyan-300 hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                  <Eye className="w-2.5 h-2.5" /> ডিটেইলস
                                </button>
                                <button
                                  onClick={() => handleAddToCartWithFeedback(p)}
                                  className="text-[10px] text-emerald-400 hover:underline cursor-pointer flex items-center gap-0.5 font-bold"
                                >
                                  <ShoppingBag className="w-2.5 h-2.5" /> কার্টে নিন
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standard Console Dialogue Chat Stream */}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`flex items-start gap-2.5 max-w-[92%] ${
                          msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {/* Avatar Indicator */}
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 shadow-md font-mono ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-tr from-cyan-600 to-cyan-400 text-neutral-950 font-bold'
                              : 'bg-gradient-to-tr from-amber-500 via-neutral-900 to-cyan-500 text-cyan-300 border border-cyan-400/40'
                          }`}
                        >
                          {msg.sender === 'user' ? <Mic className="w-3.5 h-3.5" /> : <Orbit className="w-3.5 h-3.5" />}
                        </div>

                        {/* Message Balloon */}
                        <div
                          className={`p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-cyan-950/80 border border-cyan-400/50 text-cyan-100 rounded-tr-none'
                              : 'bg-neutral-900/90 border border-neutral-800 text-neutral-200 rounded-tl-none font-sans'
                          }`}
                        >
                          {/* Sender and Time HUD */}
                          <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-neutral-400 mb-1 border-b border-neutral-800 pb-1">
                            <span className="font-bold text-cyan-400">
                              {msg.sender === 'user' ? 'YOU (VOICE)' : 'GEMINI ORBITAL AI'}
                            </span>
                            <span>{msg.timestamp}</span>
                          </div>

                          {/* Formatted Text */}
                          <div className="whitespace-pre-wrap font-sans text-neutral-200">
                            {msg.text}
                          </div>
                        </div>
                      </div>

                      {/* Matched Product Hologram Cards */}
                      {msg.matchedProducts && msg.matchedProducts.length > 0 && (
                        <div className="w-full mt-3 pl-9 pr-2 space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 uppercase tracking-wider">
                            <Scan className="w-3.5 h-3.5 animate-pulse" />
                            <span>কোয়ান্টাম রিকমেন্ডেড প্রোডাক্টস ({msg.matchedProducts.length})</span>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {msg.matchedProducts.map((p) => {
                              const isAdded = addedProductId === p.id;
                              return (
                                <div
                                  key={p.id}
                                  className="p-3 bg-neutral-900/90 hover:bg-neutral-800/90 border border-cyan-500/30 hover:border-cyan-400 rounded-2xl flex items-center gap-3 transition-all shadow-md group"
                                >
                                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-950 shrink-0 border border-neutral-800">
                                    <img
                                      src={p.images?.[0] || (p as any).image || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop'}
                                      alt={p.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {p.badge && (
                                      <span className="absolute top-1 left-1 bg-amber-500 text-neutral-950 text-[8px] font-bold px-1 rounded-sm">
                                        {p.badge}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                                      {p.name}
                                    </h4>
                                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                                      {p.fabric || p.category}
                                    </p>

                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs font-bold text-amber-400 font-mono">
                                        ৳{p.price.toLocaleString('en-BD')}
                                      </span>
                                      {p.originalPrice && (
                                        <span className="text-[10px] text-neutral-500 line-through font-mono">
                                          ৳{p.originalPrice.toLocaleString('en-BD')}
                                        </span>
                                      )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 mt-2">
                                      <button
                                        onClick={() => onQuickViewProduct(p)}
                                        className="py-1 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-semibold flex items-center gap-1 border border-neutral-700 transition-colors cursor-pointer"
                                      >
                                        <Eye className="w-3 h-3 text-cyan-400" />
                                        <span>ডিটেইলস</span>
                                      </button>
                                      {p.stock > 0 ? (
                                        <button
                                          onClick={() => handleAddToCartWithFeedback(p)}
                                          className={`py-1 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                            isAdded
                                              ? 'bg-emerald-600 text-white'
                                              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-md'
                                          }`}
                                        >
                                          {isAdded ? (
                                            <>
                                              <CheckCircle2 className="w-3 h-3" />
                                              <span>যুক্ত হয়েছে</span>
                                            </>
                                          ) : (
                                            <>
                                              <ShoppingBag className="w-3 h-3" />
                                              <span>কার্টে যোগ করুন</span>
                                            </>
                                          )}
                                        </button>
                                      ) : (
                                        <span className="text-[10px] font-medium text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                                          স্টক আউট
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Suggestion Pills */}
                      {msg.actionPills && msg.actionPills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5 pl-9">
                          {msg.actionPills.map((pill, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleActionPillClick(pill.action, pill.label)}
                              className="px-3 py-1.5 bg-neutral-900 hover:bg-cyan-950/80 border border-neutral-700 hover:border-cyan-400 rounded-full text-[11px] font-medium text-neutral-300 hover:text-cyan-300 transition-all shadow-xs flex items-center gap-1 cursor-pointer font-sans"
                            >
                              <span>{pill.label}</span>
                              <ChevronRight className="w-3 h-3 text-neutral-500 group-hover:text-cyan-400" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* AI Quantum Processing Indicator */}
                  {isLoading && (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-amber-500 text-neutral-950 flex items-center justify-center text-[10px] shrink-0 font-bold">
                        <Sparkles className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="p-3.5 bg-neutral-900/90 border border-cyan-500/30 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-2 font-mono">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        <span className="text-xs text-neutral-300 font-sans ml-1">
                          কোয়ান্টাম ফ্যাশন অ্যানালাইসিস চলছে...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Pure Gemini Live Voice Control Deck (Zero Text Inputs) */}
                <div className="p-4 bg-neutral-950 border-t border-cyan-500/20 shrink-0 space-y-3">
                  {/* Dynamic Live Voice Waveform Bar */}
                  <div
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isListening
                        ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                        : isSpeaking
                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.25)]'
                        : 'bg-neutral-900/90 border-neutral-800'
                    }`}
                  >
                    {/* Live Frequency Waves Indicator */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span
                          className={`w-1 rounded-full ${
                            isListening
                              ? 'h-6 bg-rose-400 animate-pulse'
                              : isSpeaking
                              ? 'h-5 bg-emerald-400 animate-bounce'
                              : 'h-2 bg-neutral-600'
                          }`}
                        ></span>
                        <span
                          className={`w-1 rounded-full ${
                            isListening
                              ? 'h-8 bg-rose-300 animate-pulse [animation-delay:0.1s]'
                              : isSpeaking
                              ? 'h-7 bg-emerald-300 animate-bounce [animation-delay:0.2s]'
                              : 'h-3 bg-neutral-600'
                          }`}
                        ></span>
                        <span
                          className={`w-1 rounded-full ${
                            isListening
                              ? 'h-5 bg-rose-400 animate-pulse [animation-delay:0.2s]'
                              : isSpeaking
                              ? 'h-6 bg-emerald-400 animate-bounce [animation-delay:0.1s]'
                              : 'h-2 bg-neutral-600'
                          }`}
                        ></span>
                        <span
                          className={`w-1 rounded-full ${
                            isListening
                              ? 'h-7 bg-rose-300 animate-pulse [animation-delay:0.3s]'
                              : isSpeaking
                              ? 'h-4 bg-emerald-300 animate-bounce [animation-delay:0.3s]'
                              : 'h-3 bg-neutral-600'
                          }`}
                        ></span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                          {isSpeaking ? (
                            <span className="text-emerald-400">এআই কথা বলছে (শুনুন)...</span>
                          ) : isListening ? (
                            <span className="text-rose-300">🔴 লাইভ শুনছি... মুখে বলুন!</span>
                          ) : isMicPaused ? (
                            <span className="text-neutral-400">মাইক সাময়িক বন্ধ রাখা হয়েছে</span>
                          ) : (
                            <span className="text-cyan-300">লাইভ ভয়েস মোড সক্রিয়</span>
                          )}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-mono truncate">
                          {isListening
                            ? 'আপনি কথা শেষ করলেই এআই উত্তর দেবে'
                            : isSpeaking
                            ? 'কথা শেষ হলে স্বয়ংক্রিয়ভাবে মাইক শুনবে'
                            : 'হ্যান্ডস-ফ্রি রিয়েল-টাইম কথোপকথন'}
                        </p>
                      </div>
                    </div>

                    {/* Mic Toggle Button */}
                    <button
                      id="btn-toggle-live-mic"
                      onClick={toggleMicPause}
                      className={`py-2.5 px-4 rounded-xl flex items-center gap-2 font-bold text-xs transition-all shadow-md cursor-pointer shrink-0 ${
                        isListening
                          ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                          : isMicPaused
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-sans'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5" />
                          <span>পজ করুন</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          <span>মাইক চালু করুন</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Safety Protocol & WhatsApp Live Chat */}
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1 font-sans">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>১০০% ক্যাশ অন ডেলিভারি ও ওপেন বক্স চেক</span>
                    </span>
                    <button
                      onClick={() => handleActionPillClick('open_whatsapp', 'WhatsApp')}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>হোয়াটসঅ্যাপে কথা বলুন</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
