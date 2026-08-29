import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  ShoppingBag,
  Eye,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Minimize2,
  Maximize2,
  CheckCircle2,
  PhoneCall,
  X,
  Send,
  Radio,
  BookOpen,
  ShieldCheck,
  Truck,
  Activity,
  Layers,
  Cpu,
  Orbit,
  Compass,
  Zap,
  Flame,
  Scan,
  Terminal,
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
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [activeDeckTab, setActiveDeckTab] = useState<'console' | 'lore' | 'radar'>('console');
  const [telemetryTicks, setTelemetryTicks] = useState(0);

  const botDisplayName = config.aiBotName || 'ORBITAL-AI v3.7 / বিসমিল্লাহ এআই';
  const brandName = config.brandName || 'বিসমিল্লাহ কালেকশন';

  const welcomeText = `🛰️ [ORBITAL STATION ONLINE]: আসসালামু আলাইকুম! বিসমিল্লাহ ফ্যাশন স্পেস স্টেশন এআই কনসালট্যান্টে আপনাকে স্বাগতম। 🌌✨\n\nআমি আপনার পার্সোনাল কোয়ান্টাম ভয়েস ফ্যাশন গাইড। আমাদের স্টেশনে প্রতিটি পাঞ্জাবি, জামদানি ও সিল্ক শাড়ি এবং লাক্সারি থ্রি-পিস নিখুঁত নিপুণতায় তৈরি করা হয়েছে।\n\n🛡️ সিকিউরিটি প্রোটোকল: ১০০% ক্যাশ অন ডেলিভারি (ডেলিভারিম্যানের সামনে কাপড় ও সাইজ দেখে নেওয়ার সুযোগ) এবং ৭ দিনের ওয়ার্প-স্পিড ফ্রি সাইজ এক্সচেঞ্জ।\n\n🎙️ নিচের মাইক্রোফোন চেপে আপনার পছন্দের পোশাকের কথা বলুন অথবা এখানে মেসেজ পাঠান!`;
  const welcomeSpeech = `আসসালামু আলাইকুম! বিসমিল্লাহ ফ্যাশন স্পেস স্টেশন এআই এজেন্টে আপনাকে স্বাগতম। আমি আপনার ভয়েস ও ফ্যাশন কনসালট্যান্ট। আজ আপনার জন্য কী ধরনের রাজকীয় পোশাক পছন্দ করব বলুন?`;

  const initialGreeting: ChatMessage = {
    id: 'msg_welcome',
    sender: 'ai',
    text: welcomeText,
    spokenSummary: welcomeSpeech,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actionPills: [
      { label: '✨ প্রিমিয়াম পাঞ্জাবি স্ক্যান', action: 'show_panjabi' },
      { label: '🥻 এক্সক্লুসিভ শাড়ি কালেকশন', action: 'show_saree' },
      { label: '👗 ডিজাইনার থ্রি-পিস', action: 'show_three_piece' },
      { label: '🛡️ ক্যাশ অন ডেলিভারি প্রোটোকল', action: 'ask_rules' },
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSpokenWelcomeRef = useRef(false);

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

  // Open Sound FX and trigger voice welcome
  const handleOpenDeck = () => {
    setIsOpen(true);
    soundFx.playStartup();
  };

  useEffect(() => {
    if (isOpen && !hasSpokenWelcomeRef.current && !isMuted) {
      hasSpokenWelcomeRef.current = true;
      const timer = setTimeout(() => {
        speakResponse(welcomeSpeech);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMuted]);

  useEffect(() => {
    if (!isOpen) {
      VoiceService.stopSpeaking();
      VoiceService.stopListening();
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const speakResponse = (text: string) => {
    if (isMuted) return;
    VoiceService.speak(
      text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleToggleListening = () => {
    if (isListening) {
      VoiceService.stopListening();
      setIsListening(false);
      setLiveTranscript('');
      soundFx.playScanBlip();
      return;
    }

    VoiceService.stopSpeaking();
    setIsSpeaking(false);
    setVoiceError(null);
    setLiveTranscript('');
    soundFx.playScanBlip();

    const started = VoiceService.startListening(
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
        if (isFinal) {
          setIsListening(false);
          setLiveTranscript('');
          soundFx.playLockSuccess();
          handleSendMessage(transcript);
        }
      },
      (error) => {
        setVoiceError(error);
        setIsListening(false);
        setTimeout(() => setVoiceError(null), 4000);
      },
      () => {
        setIsListening(false);
      }
    );

    if (started) {
      setIsListening(true);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    VoiceService.stopSpeaking();
    setIsSpeaking(false);
    soundFx.playScanBlip();

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await AiShoppingService.queryAssistant(
        query,
        messages,
        products,
        config
      );

      const speechToPlay = aiResponse.spokenSummary || AiShoppingService.cleanTextForVoice(aiResponse.text).slice(0, 160);

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

      if (!isMuted) {
        speakResponse(speechToPlay);
      }
    } catch (err) {
      console.error('Space Station AI error:', err);
      const fallbackText = '🛰️ কোয়ান্টাম টেলিমেট্রি লিংক সাময়িক বাধাগ্রস্ত হয়েছে। অনুগ্রহ করে আবার বলুন।';
      const errorMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      if (!isMuted) {
        speakResponse(fallbackText);
      }
    } finally {
      setIsLoading(false);
    }
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
      const rawPhone = (config.contactPhone || '+880 1712-345678').replace(/[^0-9]/g, '');
      const cleanPhone = rawPhone.startsWith('88') ? rawPhone : `88${rawPhone}`;
      window.open(
        `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Bismillah Collection, I need space station fashion assistance.')}`,
        '_blank'
      );
      return;
    }
    handleSendMessage(label);
  };

  const handleAddToCartWithFeedback = (product: Product) => {
    soundFx.playLockSuccess();
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
    onAddToCart(product, defaultSize);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  const resetChat = () => {
    soundFx.playStartup();
    VoiceService.stopSpeaking();
    VoiceService.stopListening();
    setIsSpeaking(false);
    setIsListening(false);
    setMessages([initialGreeting]);
    hasSpokenWelcomeRef.current = false;
    if (!isMuted) {
      setTimeout(() => speakResponse(welcomeSpeech), 300);
    }
  };

  const toggleMute = () => {
    soundFx.setMuted(!isMuted);
    if (!isMuted) {
      VoiceService.stopSpeaking();
      setIsSpeaking(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      soundFx.playScanBlip();
    }
  };

  const formatPrice = (price: number) => {
    return `${config.currencySymbol || '৳'}${price.toLocaleString('en-BD')}`;
  };

  const coreState = isListening ? 'listening' : isSpeaking ? 'speaking' : isLoading ? 'processing' : 'idle';

  return (
    <div id="bismillah-space-station-ai-root" className="fixed bottom-5 right-5 z-50">
      {/* Floating Futuristic Space Station Quantum Orb Pod */}
      {!isOpen && (
        <motion.button
          id="btn-open-space-station-ai"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenDeck}
          className="relative flex items-center gap-3.5 px-5 py-4 bg-neutral-950/95 text-white rounded-full shadow-[0_0_40px_rgba(245,158,11,0.25)] border-2 border-amber-500/50 hover:border-amber-400 group transition-all backdrop-blur-xl cursor-pointer"
        >
          {/* Orbital Gyroscope Rotating Ring */}
          <div className="absolute -inset-1 rounded-full border border-cyan-500/30 animate-[spin_8s_linear_infinite] pointer-events-none"></div>
          <div className="absolute -inset-2.5 rounded-full border border-amber-500/20 animate-[spin_12s_linear_infinite_reverse] pointer-events-none"></div>

          {/* Futuristic Glowing Dot Status */}
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-black"></span>
          </div>

          {/* Mini Hologram Core Pod */}
          <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-600 via-amber-500 to-emerald-400 p-[2px] flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center text-amber-300 group-hover:text-cyan-300 transition-colors">
              <Orbit className="w-5 h-5 animate-[spin_6s_linear_infinite]" />
            </div>
          </div>

          {/* Cyber Telemetry Info Text */}
          <div className="text-left pr-1 hidden sm:block">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>SPACESTATION AI</span>
              </span>
              <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 text-[8px] font-bold rounded-sm border border-cyan-400/30">
                VOICE LIVE
              </span>
            </div>
            <p className="text-xs font-bold text-neutral-100 mt-0.5 flex items-center gap-1">
              <span>কথা বলুন ও অর্ডার করুন</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </motion.button>
      )}

      {/* Advanced Space Station Command Deck Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="space-station-command-deck"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`bg-neutral-950/95 text-white border border-cyan-500/30 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col backdrop-blur-2xl transition-all ${
              isFullScreenDeck
                ? 'fixed inset-2 sm:inset-6 z-50 rounded-3xl'
                : isMinimized
                ? 'w-[94vw] sm:w-[460px] h-auto rounded-3xl'
                : 'w-[94vw] sm:w-[480px] h-[660px] max-h-[90vh] rounded-3xl'
            }`}
          >
            {/* Top Space Station Telemetry Header */}
            <div className="bg-neutral-900/90 px-4 py-3 border-b border-cyan-500/20 flex items-center justify-between shrink-0 font-mono select-none">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-cyan-500 p-[1px] flex items-center justify-center">
                  <div className="w-full h-full bg-neutral-950 rounded-xl flex items-center justify-center text-cyan-400">
                    <Cpu className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-white tracking-wider font-sans">
                      {botDisplayName}
                    </h3>
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold rounded border border-emerald-400/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>ORBITAL LINK</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-neutral-400 mt-0.5">
                    <span>FREQ: {(94.2 + (telemetryTicks % 10) * 0.1).toFixed(1)} GHz</span>
                    <span>•</span>
                    <span className="text-amber-400 font-sans">{brandName}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMute}
                  title={isMuted ? 'ভয়েস চালু করুন' : 'ভয়েস মিউট করুন'}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isMuted
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'text-neutral-400 hover:text-cyan-300 hover:bg-white/10'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={resetChat}
                  title="রিসেট মিশন"
                  className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFullScreenDeck(!isFullScreenDeck)}
                  title={isFullScreenDeck ? 'নরমাল স্ক্রিন' : 'ফুল কমান্ড ডেক'}
                  className="p-2 text-neutral-400 hover:text-cyan-300 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isFullScreenDeck ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="কমান্ড ডেক বন্ধ করুন"
                  className="p-2 text-neutral-400 hover:text-rose-400 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Central Holographic Gyroscope Reactor Chamber */}
            {!isMinimized && (
              <div className="relative bg-gradient-to-b from-neutral-950 via-neutral-900/60 to-neutral-950 border-b border-cyan-500/20 py-2.5 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                {/* Background Cyber Grid Matrix Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none"></div>

                {/* Left Telemetry Radar Screen */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="shrink-0">
                    <QuantumCoreVisualizer state={coreState} />
                  </div>

                  <div className="flex-1 min-w-0 font-mono text-left">
                    <div className="flex items-center gap-1.5 text-[10px] text-cyan-400">
                      <Radio className="w-3 h-3 animate-pulse" />
                      <span className="uppercase font-bold tracking-wider">
                        {isListening
                          ? 'LISTENING TO FREQUENCY...'
                          : isSpeaking
                          ? 'TRANSMITTING NEURAL AUDIO...'
                          : isLoading
                          ? 'QUANTUM CALCULATING...'
                          : 'NEURAL SYSTEM READY'}
                      </span>
                    </div>

                    <p className="text-xs font-sans text-neutral-200 font-medium mt-1">
                      {isListening
                        ? '🎙️ আপনার কথা শুনছি... বলুন'
                        : isSpeaking
                        ? '🔊 এআই কথা বলছে...'
                        : 'কথা বলুন বা যেকোনো পছন্দের পোশাক জানতে চান'}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[9px] text-neutral-400">
                      <span className="px-1.5 py-0.2 bg-neutral-800 rounded text-amber-300 font-sans border border-amber-500/30">
                        ১০০,০০০+ সেলস আইডিয়া
                      </span>
                      <span className="px-1.5 py-0.2 bg-neutral-800 rounded text-emerald-300 font-sans border border-emerald-500/30">
                        ক্যাশ অন ডেলিভারি
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Protocol Pill Tabs */}
                <div className="flex sm:flex-col gap-1.5 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleActionPillClick('ask_rules', 'প্ল্যাটফর্মের নিয়ম ও গ্যারান্টি')}
                    className="px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 rounded-lg text-[10px] text-cyan-300 font-sans flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>ই-কমার্স পলিসি</span>
                  </button>
                  <button
                    onClick={() => handleActionPillClick('show_panjabi', 'পাঞ্জাবি কালেকশন স্ক্যান')}
                    className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 rounded-lg text-[10px] text-amber-300 font-sans flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>ট্রেন্ডিং পাঞ্জাবি</span>
                  </button>
                </div>
              </div>
            )}

            {/* Conversation Deck Scrollable Body */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/90 text-neutral-100 relative">
                  {/* Live Listening Frequency Banner */}
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-gradient-to-r from-rose-950/80 via-neutral-900 to-cyan-950/80 border border-rose-500/50 rounded-2xl flex items-center gap-3 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                    >
                      <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center animate-pulse shrink-0">
                        <Mic className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 font-mono">
                        <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                          DECODING VOICE FREQUENCY...
                        </p>
                        <p className="text-xs font-sans text-white italic truncate mt-0.5">
                          {liveTranscript ? `"${liveTranscript}"` : 'আপনার পছন্দের পোশাকের কথা বলুন...'}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Voice Error Banner */}
                  {voiceError && (
                    <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-xl flex items-center gap-2 font-sans">
                      <VolumeX className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{voiceError}</span>
                    </div>
                  )}

                  {/* Messages Feed */}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`flex items-start gap-2 max-w-[92%] ${
                          msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                            msg.sender === 'user'
                              ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                              : 'bg-gradient-to-tr from-amber-500 to-cyan-500 text-neutral-950 shadow-md font-bold'
                          }`}
                        >
                          {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>

                        {/* Speech Bubble with Cyber HUD Glass Styling */}
                        <div
                          className={`p-4 rounded-2xl text-xs leading-relaxed transition-all ${
                            msg.sender === 'user'
                              ? 'bg-neutral-800/90 text-neutral-100 border border-neutral-700 rounded-tr-none'
                              : 'bg-neutral-900/90 text-neutral-200 border border-cyan-500/30 rounded-tl-none shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                          }`}
                        >
                          <p className="whitespace-pre-line font-sans">{msg.text}</p>

                          {/* Voice Replay Controller */}
                          {msg.sender === 'ai' && (
                            <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between">
                              <button
                                onClick={() => speakResponse(msg.spokenSummary || msg.text)}
                                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 transition-colors cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>ভয়েস আবার শুনুন</span>
                              </button>
                              <span className="text-[9px] text-neutral-500 font-mono">{msg.timestamp}</span>
                            </div>
                          )}

                          {msg.sender === 'user' && (
                            <span className="text-[9px] block mt-1.5 text-neutral-400 text-right font-mono">
                              {msg.timestamp}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Holographic Quantum Product Telemetry Cards */}
                      {msg.matchedProducts && msg.matchedProducts.length > 0 && (
                        <div className="w-full mt-3 pl-9 space-y-2.5">
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                            <Scan className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span>QUANTUM PRODUCT TELEMETRY MATRIX:</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2.5">
                            {msg.matchedProducts.map((p) => {
                              const isAdded = addedProductId === p.id;
                              return (
                                <div
                                  key={p.id}
                                  className="flex items-center gap-3.5 p-3 bg-neutral-900/90 border border-cyan-500/30 hover:border-amber-400 rounded-2xl transition-all shadow-md group relative overflow-hidden"
                                >
                                  {/* Cyber Corner Accent */}
                                  <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-cyan-500/20 to-transparent pointer-events-none"></div>

                                  {/* Product Hologram Photo */}
                                  <img
                                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300'}
                                    alt={p.title}
                                    className="w-18 h-20 object-cover rounded-xl bg-neutral-950 shrink-0 border border-cyan-500/30 group-hover:scale-105 transition-transform"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300';
                                    }}
                                  />

                                  {/* Product Details & Telemetry */}
                                  <div className="flex-1 min-w-0 font-sans">
                                    <div className="flex items-center gap-1.5">
                                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded border border-amber-500/30">
                                        {p.category}
                                      </span>
                                      {p.material && (
                                        <span className="text-[9px] text-neutral-400 truncate">{p.material}</span>
                                      )}
                                    </div>
                                    <h4 className="text-xs font-bold text-white truncate mt-1 group-hover:text-cyan-300 transition-colors">
                                      {p.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-sm font-extrabold text-amber-400">
                                        {formatPrice(p.price)}
                                      </span>
                                      {p.originalPrice && p.originalPrice > p.price && (
                                        <span className="text-[10px] text-neutral-500 line-through">
                                          {formatPrice(p.originalPrice)}
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

                {/* Cyber Deck Voice & Command Input Footer */}
                <div className="p-3.5 bg-neutral-950 border-t border-cyan-500/20 shrink-0 space-y-3">
                  {/* Big Quantum Voice Record Button */}
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-voice-record-space-deck"
                      onClick={handleToggleListening}
                      className={`flex-1 py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-xs transition-all shadow-lg cursor-pointer ${
                        isListening
                          ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30 animate-pulse'
                          : 'bg-gradient-to-r from-cyan-600 via-amber-500 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-neutral-950 font-sans shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4 animate-bounce" />
                          <span>🎙️ শুনছি... কথা বলা শেষ করতে এখানে চাপুন</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          <span>🎙️ কথা বলুন (ভয়েস ইনপুট চালু করুন)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={toggleMute}
                      title={isMuted ? 'ভয়েস আউটপুট চালু করুন' : 'ভয়েস বন্ধ রাখুন'}
                      className={`p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                        isMuted
                          ? 'bg-rose-950/60 text-rose-400 border-rose-500/40'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border-neutral-700'
                      }`}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Fallback Command Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="relative flex items-center"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="অথবা এখানে টাইপ করে লিখুন..."
                      className="w-full py-2.5 pl-3.5 pr-11 bg-neutral-900 focus:bg-neutral-800 text-xs text-white rounded-2xl border border-neutral-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-hidden transition-all placeholder:text-neutral-500 font-sans"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isLoading}
                      className="absolute right-1.5 p-2 bg-gradient-to-tr from-amber-500 to-cyan-500 disabled:opacity-30 text-neutral-950 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Bottom Safety & Direct WhatsApp Comms */}
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1 font-sans">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>১০০% নিরাপদ ক্যাশ অন ডেলিভারি</span>
                    </span>
                    <button
                      onClick={() => handleActionPillClick('open_whatsapp', 'WhatsApp')}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>হোয়াটসঅ্যাপ কনসালট্যান্ট</span>
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
