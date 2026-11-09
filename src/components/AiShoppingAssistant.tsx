import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Eye,
  RotateCcw,
  Minimize2,
  Maximize2,
  CheckCircle2,
  X,
  Send,
  MessageSquare,
  Bot,
  User,
  ShieldCheck,
  Truck,
  Scan,
  Check,
  ArrowRight,
  GripHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, StoreConfig } from '../types';
import { AiShoppingService, ChatMessage } from '../services/aiService';
import { soundFx } from '../services/soundFx';

interface AiShoppingAssistantProps {
  products: Product[];
  config: StoreConfig;
  onQuickViewProduct: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onOpenOrderTracking?: () => void;
  onOpenSizeGuide?: () => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export const AiShoppingAssistant: React.FC<AiShoppingAssistantProps> = ({
  products,
  config,
  onQuickViewProduct,
  onAddToCart,
  onOpenOrderTracking,
  onOpenSizeGuide,
  isOpenExternal,
  onCloseExternal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);


  const botDisplayName = config.aiBotName || 'বিসমিল্লাহ এআই';
  const brandName = config.brandName || 'বিসমিল্লাহ কালেকশন';

  // Chat message thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `আসসালামু আলাইকুম! ${brandName}-এর স্মার্ট এআই শপিং অ্যাসিস্ট্যান্টে আপনাকে স্বাগতম। 🛍️✨\n\nআমাদের স্টোরের পাঞ্জাবি, শাড়ি, থ্রি-পিস, কিংবা যেকোনো পণ্য, সঠিক সাইজ, দাম, স্টক ও ক্যাশ অন ডেলিভারি সম্পর্কে যা জানতে চান নিচে লিখে জানান!`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      actionPills: [
        { label: '👑 সেরা পাঞ্জাবি কালেকশন', action: 'show_panjabi' },
        { label: '🥻 আকর্ষণীয় শাড়ি', action: 'show_saree' },
        { label: '🚚 ডেলিভারি চার্জ কত?', action: 'ask_delivery' },
        { label: '🛡️ ক্যাশ অন ডেলিভারির নিয়ম', action: 'ask_cod' },
      ],
    },
  ]);

  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external open triggers if passed
  useEffect(() => {
    if (typeof isOpenExternal === 'boolean') {
      setIsOpen(isOpenExternal);
      if (isOpenExternal) {
        setIsMinimized(false);
      }
    }
  }, [isOpenExternal]);

  // Initial showcase products
  useEffect(() => {
    if (products && products.length > 0 && displayProducts.length === 0) {
      setDisplayProducts(products.slice(0, 4));
    }
  }, [products, displayProducts.length]);

  // Auto scroll to latest chat message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Send Customer Text Query to AI
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    soundFx.playScanBlip();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await AiShoppingService.queryAssistant(
        query,
        messages,
        products,
        config
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        matchedProducts: response.matchedProducts,
        actionPills: response.actionPills,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (response.matchedProducts && response.matchedProducts.length > 0) {
        setDisplayProducts(response.matchedProducts);
      }
    } catch (err) {
      console.warn('AI Query notice:', err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `আসসালামু আলাইকুম! ${brandName}-এর সকল পণ্যে সারা দেশে ক্যাশ অন ডেলিভারি এবং ৭ দিনের সহজ সাইজ এক্সচেঞ্জ সুবিধা রয়েছে। কোন পণ্যটি সম্পর্কে জানতে চান লিখে জানান!`,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleActionPillClick = (action: string, label: string) => {
    if (action === 'open_tracking' && onOpenOrderTracking) {
      onOpenOrderTracking();
      return;
    }
    if (action === 'open_size_guide' && onOpenSizeGuide) {
      onOpenSizeGuide();
      return;
    }
    handleSendMessage(label.replace(/[👑🥻👗✨🚚🛡️💬📏📦]/g, '').trim());
  };

  const handleAddToCartWithFeedback = (product: Product) => {
    soundFx.playLockSuccess();
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  const handleResetChat = () => {
    soundFx.playStartup();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `আসসালামু আলাইকুম! নতুন চ্যাট শুরু হয়েছে। ${brandName}-এর কালেকশন, অর্ডার ও সাইজ সংক্রান্ত যে কোনো প্রশ্ন লিখে জানান।`,
        timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setDisplayProducts(products.slice(0, 4));
  };

  const handleClose = () => {
    setIsOpen(false);
    onCloseExternal?.();
  };

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* DRAGGABLE / SWAPPABLE FLOATING LAUNCHER BUTTON */}
      {/* ------------------------------------------------------------- */}
      {!isOpen && (
        <motion.div
          drag
          dragMomentum={false}
          dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 }}
          className="fixed bottom-5 right-5 z-50 select-none touch-none"
        >
          <div className="relative group cursor-grab active:cursor-grabbing">
            {/* Subtle glow ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-[#febd69] to-cyan-500 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />

            <button
              id="btn-open-ai-chat"
              onClick={() => {
                soundFx.playStartup();
                setIsOpen(true);
                setIsMinimized(false);
              }}
              className="relative flex items-center gap-2.5 px-4 py-2.5 bg-neutral-950/95 hover:bg-neutral-900 text-white rounded-full border border-amber-400/50 shadow-2xl backdrop-blur-md transition-all group-hover:scale-105 cursor-pointer"
            >
              {/* Drag Grip Handle indicator */}
              <GripHorizontal className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-300 transition-colors shrink-0" />

              {/* Bot Avatar Icon */}
              <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-[#febd69] p-[1.5px] shadow-sm flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              </div>

              {/* Compact Typography Label optimized for Mobile */}
              <div className="text-left pr-1">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    {botDisplayName}
                  </span>
                  <span className="px-1 py-0.2 bg-amber-500/20 text-[#febd69] border border-amber-500/40 rounded text-[9px] font-mono font-bold">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-neutral-300 flex items-center gap-1 font-medium">
                  <span>মেসেজ দিন • সহায়তা</span>
                </p>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN TEXT-BASED AI CONVERSATIONAL MODAL */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              height: isMinimized ? 'auto' : isFullScreen ? '95vh' : '560px',
              width: isMinimized ? '300px' : isFullScreen ? '95vw' : '400px',
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col bg-neutral-950/98 border border-amber-500/40 text-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.95)] rounded-2xl overflow-hidden backdrop-blur-2xl transition-all ${
              isFullScreen ? 'fixed inset-3 sm:inset-6 m-auto' : ''
            }`}
          >
            {/* Header Toolbar */}
            <div className="p-3 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-[#febd69] p-[1.5px] flex items-center justify-center">
                  <div className="w-full h-full bg-neutral-950 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white tracking-wide">
                      {botDisplayName}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    {brandName} স্মার্ট শপিং সহকারী
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="নতুন চ্যাট শুরু করুন"
                  className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  title={isFullScreen ? 'ছোট করুন' : 'বড় করুন'}
                  className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer hidden sm:block"
                >
                  {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'ম্যাক্সিমাইজ' : 'মিনিমাইজ'}
                  className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  title="বন্ধ করুন"
                  className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Body & Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs custom-scrollbar bg-neutral-950/70">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[88%]">
                        {msg.sender === 'ai' && (
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mb-1">
                            <Bot className="w-3 h-3 text-amber-300" />
                          </div>
                        )}

                        <div
                          className={`p-3 rounded-2xl leading-relaxed whitespace-pre-line text-xs ${
                            msg.sender === 'user'
                              ? 'bg-amber-500 text-neutral-950 font-semibold rounded-br-sm shadow-md'
                              : 'bg-neutral-900/90 text-neutral-200 border border-neutral-800 rounded-bl-sm shadow'
                          }`}
                        >
                          {msg.text}

                          <span
                            className={`block text-[9px] mt-1.5 text-right font-mono ${
                              msg.sender === 'user' ? 'text-neutral-900/70' : 'text-neutral-500'
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>

                        {msg.sender === 'user' && (
                          <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 mb-1 text-neutral-400">
                            <User className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Matched Products Card inside message if applicable */}
                      {msg.matchedProducts && msg.matchedProducts.length > 0 && (
                        <div className="w-full mt-2 grid grid-cols-2 gap-2">
                          {msg.matchedProducts.slice(0, 2).map((p) => {
                            const isJustAdded = addedProductId === p.id;
                            return (
                              <div
                                key={p.id}
                                className="bg-neutral-900 border border-neutral-800 rounded-xl p-2 flex flex-col justify-between"
                              >
                                <div className="aspect-[4/3] bg-neutral-950 rounded-lg overflow-hidden mb-1.5">
                                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                                </div>
                                <h5 className="font-bold text-neutral-100 text-[11px] line-clamp-1">{p.title}</h5>
                                <div className="flex items-center justify-between mt-1 text-[11px]">
                                  <span className="font-bold text-[#febd69]">
                                    {config.currencySymbol || '৳'}{p.price}
                                  </span>
                                  <button
                                    onClick={() => handleAddToCartWithFeedback(p)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      isJustAdded
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-amber-400 text-neutral-950 hover:bg-amber-300'
                                    }`}
                                  >
                                    {isJustAdded ? 'যুক্ত হয়েছে' : 'কার্ট'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Quick Action Suggestion Pills */}
                      {msg.actionPills && msg.actionPills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {msg.actionPills.map((pill, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleActionPillClick(pill.action, pill.label)}
                              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border border-neutral-800 rounded-lg text-[10px] transition-colors cursor-pointer"
                            >
                              {pill.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* AI Typing Animation */}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-neutral-400 text-xs">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                      </div>
                      <span className="font-mono text-[11px] text-amber-300/80 animate-pulse">
                        {botDisplayName} উত্তর লিখছে...
                      </span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Direct Text Chat Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-2.5 bg-neutral-950 border-t border-neutral-800 shrink-0"
                >
                  <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/80 rounded-xl px-3 py-1.5 focus-within:border-amber-400 transition-colors">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="এখানে লিখুন (যেমন: পাঞ্জাবির দাম কত?)..."
                      className="flex-1 bg-transparent text-xs text-white placeholder:text-neutral-500 focus:outline-none"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim() || isLoading}
                      className="p-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-40 text-neutral-950 transition-all cursor-pointer"
                      title="মেসেজ পাঠান"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1.5 px-1 font-mono">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      <span>১০০% ক্যাশ অন ডেলিভারি</span>
                    </span>
                    <span>সরাসরি স্টোর ডাটাবেজ কানেক্টেড</span>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
