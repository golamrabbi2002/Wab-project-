import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareText,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Minimize2,
  Maximize2,
  CheckCircle2,
  PhoneCall,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, StoreConfig } from '../types';
import { AiShoppingService, ChatMessage } from '../services/aiService';

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
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const initialGreeting: ChatMessage = {
    id: 'msg_welcome',
    sender: 'ai',
    text: `আসসালামু আলাইকুম! আমি "বিসমিল্লাহ কালেকশন"-এর স্মার্ট এআই শপিং অ্যাসিস্ট্যান্ট 🤖✨\n\nআমাদের সেরা পাঞ্জাবি, এক্সক্লুসিভ শাড়ি, ডিজাইনার থ্রি-পিস, ডেলিভারি চার্জ বা যেকোনো বিষয়ে আমাকে সরাসরি প্রশ্ন করতে পারেন।`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actionPills: [
      { label: '✨ পাঞ্জাবি কালেকশন দেখান', action: 'show_panjabi' },
      { label: '🥻 এক্সক্লুসিভ শাড়ি', action: 'show_saree' },
      { label: '👗 থ্রি-পিস কালেকশন', action: 'show_three_piece' },
      { label: '🚚 ডেলিভারি চার্জ কত?', action: 'ask_delivery' },
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

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

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiResponse.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedProducts: aiResponse.matchedProducts,
        actionPills: aiResponse.actionPills,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        sender: 'ai',
        text: 'দুঃখিত, এই মুহূর্তে উত্তর দিতে সমস্যা হচ্ছে। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন বা সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionPillClick = (action: string, label: string) => {
    if (action === 'open_size_guide' && onOpenSizeGuide) {
      onOpenSizeGuide();
      return;
    }
    if (action === 'open_tracking' && onOpenOrderTracking) {
      onOpenOrderTracking();
      return;
    }
    if (action === 'open_whatsapp') {
      const rawPhone = (config.contactPhone || '+880 1712-345678').replace(/[^0-9]/g, '');
      const cleanPhone = rawPhone.startsWith('88') ? rawPhone : `88${rawPhone}`;
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello Bismillah Collection, I have an inquiry.')}`, '_blank');
      return;
    }
    handleSendMessage(label);
  };

  const handleAddToCartWithFeedback = (product: Product) => {
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  const resetChat = () => {
    setMessages([initialGreeting]);
  };

  const formatPrice = (price: number) => {
    return `${config.currencySymbol || '৳'}${price.toLocaleString('en-BD')}`;
  };

  return (
    <div id="bismillah-ai-concierge-root" className="fixed bottom-5 right-5 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          id="btn-open-ai-chat"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950 text-white rounded-full shadow-2xl border border-amber-500/30 hover:border-amber-400 group transition-all"
        >
          {/* Animated Glow Pill */}
          <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </div>

          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>

          <div className="text-left pr-1 hidden sm:block">
            <p className="text-[10px] uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1">
              <span>Bismillah AI</span>
              <span className="px-1 py-0.2 bg-amber-400/20 text-[8px] rounded text-amber-300 font-mono">Live</span>
            </p>
            <p className="text-xs font-semibold text-neutral-100">এআই শপিং অ্যাসিস্ট্যান্ট</p>
          </div>
        </motion.button>
      )}

      {/* Expanded Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : '580px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`w-[92vw] sm:w-[410px] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col text-neutral-900 transition-all ${
              isMinimized ? 'h-auto' : 'h-[580px] max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950 p-4 text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-neutral-950 rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white">বিসমিল্লাহ এআই কনসিয়ার্জ</h3>
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 font-semibold px-1.5 py-0.5 rounded-full border border-amber-400/30">
                      Gemini
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300">২৪/৭ স্মার্ট ক্যাটালগ ও শপিং গাইড</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  id="btn-reset-ai-chat"
                  onClick={resetChat}
                  title="চ্যাট রিসেট করুন"
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  id="btn-minimize-ai-chat"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'বড় করুন' : 'মিনিমাইজ'}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  id="btn-close-ai-chat"
                  onClick={() => setIsOpen(false)}
                  title="বন্ধ করুন"
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body (Hidden when minimized) */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/80">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`flex items-start gap-2 max-w-[88%] ${
                          msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                            msg.sender === 'user'
                              ? 'bg-neutral-900 text-white'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            msg.sender === 'user'
                              ? 'bg-neutral-900 text-white rounded-tr-none'
                              : 'bg-white text-neutral-800 border border-neutral-200/90 rounded-tl-none'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.text}</p>
                          <span
                            className={`text-[9px] block mt-1.5 ${
                              msg.sender === 'user' ? 'text-neutral-400 text-right' : 'text-neutral-400'
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Matched Interactive Product Cards */}
                      {msg.matchedProducts && msg.matchedProducts.length > 0 && (
                        <div className="w-full mt-2.5 pl-8 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            সংশ্লিষ্ট পোশাক সমূহ:
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {msg.matchedProducts.map((p) => {
                              const isAdded = addedProductId === p.id;
                              return (
                                <div
                                  key={p.id}
                                  className="flex items-center gap-3 p-2.5 bg-white border border-neutral-200 rounded-2xl hover:border-amber-400 transition-all shadow-xs group"
                                >
                                  {/* Product Thumbnail */}
                                  <img
                                    src={p.image}
                                    alt={p.title}
                                    className="w-14 h-16 object-cover rounded-xl bg-neutral-100 shrink-0 border border-neutral-100"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop';
                                    }}
                                  />

                                  {/* Product Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:text-amber-600 transition-colors">
                                      {p.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs font-bold text-neutral-950">
                                        {formatPrice(p.price)}
                                      </span>
                                      {p.originalPrice && p.originalPrice > p.price && (
                                        <span className="text-[10px] text-neutral-400 line-through">
                                          {formatPrice(p.originalPrice)}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                                      {p.category}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 mt-2">
                                      <button
                                        onClick={() => onQuickViewProduct(p)}
                                        className="py-1 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>বিস্তারিত</span>
                                      </button>
                                      {p.stock > 0 ? (
                                        <button
                                          onClick={() => handleAddToCartWithFeedback(p)}
                                          className={`py-1 px-2.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all ${
                                            isAdded
                                              ? 'bg-emerald-600 text-white'
                                              : 'bg-neutral-950 hover:bg-neutral-800 text-white'
                                          }`}
                                        >
                                          {isAdded ? (
                                            <>
                                              <CheckCircle2 className="w-3 h-3" />
                                              <span>কার্টে যুক্ত!</span>
                                            </>
                                          ) : (
                                            <>
                                              <ShoppingBag className="w-3 h-3" />
                                              <span>কার্টে যোগ</span>
                                            </>
                                          )}
                                        </button>
                                      ) : (
                                        <span className="py-1 px-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold">
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
                        <div className="flex flex-wrap gap-1.5 mt-2 pl-8">
                          {msg.actionPills.map((pill, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleActionPillClick(pill.action, pill.label)}
                              className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-neutral-200 hover:border-amber-300 rounded-full text-[10px] font-medium text-neutral-700 hover:text-amber-800 transition-all shadow-2xs flex items-center gap-1"
                            >
                              <span>{pill.label}</span>
                              <ChevronRight className="w-2.5 h-2.5 text-neutral-400" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading Typing Indicator */}
                  {isLoading && (
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] shrink-0">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      </div>
                      <div className="p-3 bg-white border border-neutral-200 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        <span className="text-[10px] text-neutral-400 font-medium ml-1">এআই লিখছে...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Footer Input Bar */}
                <div className="p-3 bg-white border-t border-neutral-200 shrink-0 space-y-2">
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
                      placeholder="পোশাক খুঁজুন বা প্রশ্ন করুন..."
                      className="w-full py-2.5 pl-3.5 pr-11 bg-neutral-100 focus:bg-white text-xs text-neutral-900 rounded-2xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-hidden transition-all placeholder:text-neutral-400"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isLoading}
                      className="absolute right-1.5 p-2 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </form>

                  {/* Footer Safety & WhatsApp Connect */}
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>গুগল জেমিনাই দ্বারা পরিচালিত</span>
                    </span>
                    <button
                      onClick={() => handleActionPillClick('open_whatsapp', 'WhatsApp')}
                      className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-0.5 transition-colors"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>হোয়াটসঅ্যাপ সাপোর্ট</span>
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
