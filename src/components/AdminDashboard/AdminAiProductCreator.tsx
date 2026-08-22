import React, { useState, useRef } from 'react';
import { Product, StoreConfig } from '../../types';
import { AiProductGeneratorService, AiGeneratedProductDraft } from '../../services/aiProductGenerator';
import { ImageOptimizer } from '../../utils/imageOptimizer';
import { GoogleDriveSheetService } from '../../services/googleDriveSheetService';
import {
  Sparkles,
  Upload,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  X,
  RefreshCw,
  Zap,
  Tag,
  Layers,
  ArrowRight,
  Sliders,
  Check,
  Plus,
  Trash2,
  HardDrive
} from 'lucide-react';

interface AdminAiProductCreatorProps {
  config: StoreConfig;
  onSaveProduct: (product: Product) => void;
  onOpenManualModal?: (draft: Partial<Product>) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  images?: string[];
  generatedDraft?: AiGeneratedProductDraft;
  timestamp: string;
}

export const AdminAiProductCreator: React.FC<AdminAiProductCreatorProps> = ({
  config,
  onSaveProduct,
  onOpenManualModal,
}) => {
  // Input States
  const [heading, setHeading] = useState('');
  const [priceInput, setPriceInput] = useState('1850');
  const [selectedCategory, setSelectedCategory] = useState('Auto');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Draft state for quick view
  const [latestDraft, setLatestDraft] = useState<AiGeneratedProductDraft | null>(null);

  // Conversational Chat History
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `স্বাগতম এডমিন প্যানেলে! 🤖✨\n\nআমি আপনার **এআই মার্চেন্ডাইজিং কো-পাইলট**। নতুন পোশাক যুক্ত করতে আপনার কোনো লম্বা ফর্ম পূরণ করতে হবে না:\n\n১. **১টি বা একাধিক ছবি** আপলোড করুন\n২. শুধু **হেডিং/নাম** ও **দাম (৳)** লিখুন\n\nবাকি চমৎকার বিবরণী (Description), কাপড়ের ধরন (Material), সাইজ (Sizes), এসকেইউ (SKU), অরিজিনাল ডিসকাউন্ট প্রাইস ইত্যাদি এআই স্বয়ংক্রিয়ভাবে লিখে দেবে!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleImageFiles = async (files: FileList | File[]) => {
    setIsCompressing(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        try {
          const opt = await ImageOptimizer.optimizeFile(file, 1200, 0.82);
          newImages.push(opt.base64);
        } catch (err) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
              setUploadedImages((prev) => [...prev, e.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
      if (newImages.length > 0) {
        setUploadedImages((prev) => [...prev, ...newImages]);
      }
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAddDriveUrl = () => {
    if (!driveUrlInput.trim()) return;
    const formatted = GoogleDriveSheetService.formatGoogleDriveImageUrl(driveUrlInput.trim());
    setUploadedImages((prev) => [...prev, formatted]);
    setDriveUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const applyPresetImage = (url: string, presetTitle: string, presetPrice: number) => {
    setUploadedImages([url]);
    if (!heading) setHeading(presetTitle);
    if (!priceInput || priceInput === '0') setPriceInput(presetPrice.toString());
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const titleToUse = heading.trim();
    if (!titleToUse && uploadedImages.length === 0) {
      showToast('⚠️ অনুগ্রহ করে একটি হেডিং/শিরোনাম লিখুন অথবা ছবি আপলোড করুন');
      return;
    }

    const parsed = AiProductGeneratorService.parsePrompt(titleToUse || 'প্রিমিয়াম ডিজাইনার পোশাক');
    const finalPrice = Number(priceInput) > 0 ? Number(priceInput) : parsed.price;
    const finalTitle = parsed.title;

    setIsProcessing(true);

    // Add user message to chat feed
    const userMsgId = `usr-${Date.now()}`;
    const userImages = [...uploadedImages];
    setChatHistory((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: `শিরোনাম: ${finalTitle}\nদাম: ৳${finalPrice}${selectedCategory !== 'Auto' ? `\nক্যাটাগরি: ${selectedCategory}` : ''}`,
        images: userImages.length > 0 ? userImages : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      const draft = await AiProductGeneratorService.generateGarment(
        finalTitle,
        finalPrice,
        userImages,
        config,
        selectedCategory !== 'Auto' ? selectedCategory : undefined
      );

      setLatestDraft(draft);

      // Append AI response
      setChatHistory((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `✨ আপনার পোশাকের যাবতীয় তথ্য সম্পন্ন হয়েছে!\n\n**${draft.title}** (${draft.category})\n- বিক্রয় মূল্য: ৳${draft.price} (মূল মূল্য: ৳${draft.originalPrice})\n- কোড (SKU): ${draft.sku}\n- সাইজ: ${draft.sizes.join(', ')}\n\nনিচের **"পাবলিশ করুন"** বাটনে ক্লিক করলেই সরাসরি স্টোরে যুক্ত হয়ে যাবে।`,
          generatedDraft: draft,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // Clear input fields for next prompt
      setHeading('');
      setUploadedImages([]);

      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      showToast('⚠️ এআই জেনারেশনে ত্রুটি হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublishDraft = (draft: AiGeneratedProductDraft, customImage?: string) => {
    const primaryImg = customImage || (draft as any).image || (uploadedImages[0] || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop');
    
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      title: draft.title,
      subtitle: draft.subtitle,
      category: draft.category,
      price: draft.price,
      originalPrice: draft.originalPrice,
      image: primaryImg,
      additionalImages: uploadedImages.length > 1 ? uploadedImages.slice(1) : [],
      sizes: draft.sizes,
      stock: draft.stock,
      sku: draft.sku,
      rating: 5.0,
      reviewsCount: 1,
      description: draft.description,
      material: draft.material,
      careInstructions: draft.careInstructions,
      badges: draft.badges,
      featured: draft.featured,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveProduct(newProd);
    showToast(`✓ সফলভাবে লাইভ স্টোরে যুক্ত হয়েছে: "${draft.title}" (SKU: ${draft.sku})!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs font-semibold shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Quick Interactive Chat & Direct Generator (7 Cols) */}
        <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-xl flex flex-col h-[700px] overflow-hidden">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                  <span>AI Product Auto-Writer & Chatbot</span>
                  <span className="px-2 py-0.5 bg-amber-400 text-neutral-950 text-[9px] font-mono font-bold rounded-full uppercase">
                    Admin Gemini Copilot
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-400">
                  ছবি ও শিরোনাম দিন — যাবতীয় ডেসক্রিপশন ও সাইজ এআই স্বয়ংক্রিয়ভাবে লিখবে
                </p>
              </div>
            </div>
          </div>

          {/* Chat Stream Viewport */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-sans">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0 mt-0.5 shadow-sm font-bold text-[11px]">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-400 text-neutral-950 font-medium shadow-md rounded-tr-sm'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200 shadow-md rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Uploaded pictures in user message */}
                  {msg.images && msg.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5 pt-2 border-t border-neutral-950/20">
                      {msg.images.map((img, i) => (
                        <div key={i} className="w-14 h-16 rounded-lg overflow-hidden border border-neutral-950/30 bg-neutral-900 shrink-0">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action card if message produced a product draft */}
                  {msg.generatedDraft && (
                    <div className="mt-3.5 pt-3 border-t border-neutral-800 bg-neutral-950/80 p-3.5 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-300">
                          {msg.generatedDraft.title}
                        </span>
                        <span className="font-mono font-bold text-white">
                          {config.currencySymbol}{msg.generatedDraft.price}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-2">
                        {msg.generatedDraft.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handlePublishDraft(msg.generatedDraft!)}
                          className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>1-Click স্টোরে পাবলিশ করুন</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1.5 font-mono ${
                      msg.sender === 'user' ? 'text-neutral-800 text-right' : 'text-neutral-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-3 items-start animate-fadeIn">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  AI
                </div>
                <div className="p-4 bg-neutral-900 border border-amber-500/30 rounded-2xl rounded-tl-sm text-neutral-300 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Gemini AI ই-কমার্স কনটেন্ট তৈরি করছে...</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    ছবি বিশ্লেষণ, বাংলা ডেসক্রিপশন, ফেব্রিক স্পেসিফিকেশন ও সাইজ চার্ট সংকলন করা হচ্ছে...
                  </p>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Interactive Input Controls */}
          <div className="p-4 bg-neutral-900/90 border-t border-neutral-800 space-y-3">
            
            {/* Uploaded Images Thumbnails Strip */}
            {uploadedImages.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase shrink-0">
                  যুক্ত ছবি ({uploadedImages.length}):
                </span>
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative w-12 h-14 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 shrink-0 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-neutral-950/80 text-rose-400 hover:text-white p-0.5 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Upload Action Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
                className="hidden"
              />

              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{isCompressing ? 'অপটিমাইজ হচ্ছে...' : 'ছবি আপলোড (PC/Phone)'}</span>
              </button>

              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded-lg py-1.5 px-2.5 focus:outline-none focus:border-amber-400"
              >
                <option value="Auto">Auto-Detect Category</option>
                <option value="Panjabi">Panjabi (পাঞ্জাবি)</option>
                <option value="Saree">Saree (শাড়ি)</option>
                <option value="Three-Piece">Three-Piece (থ্রি-পিস)</option>
                <option value="Kurtis">Kurtis (কুর্তি)</option>
                <option value="Tops">Tops / Shirts</option>
                <option value="Outerwear">Outerwear / Jackets</option>
              </select>

              {/* Quick Preset Buttons */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyPresetImage('https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop', 'কটন পাঞ্জাবি ব্লু', 1850)}
                  className="px-2 py-1 bg-neutral-850 hover:bg-neutral-800 text-[10px] text-amber-300 rounded border border-neutral-750"
                >
                  + পাঞ্জাবি
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetImage('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop', 'বেনারসি সিল্ক শাড়ি লাল', 3500)}
                  className="px-2 py-1 bg-neutral-850 hover:bg-neutral-800 text-[10px] text-amber-300 rounded border border-neutral-750"
                >
                  + শাড়ি
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', 'ডিজাইনার লন থ্রি-পিস', 2400)}
                  className="px-2 py-1 bg-neutral-850 hover:bg-neutral-800 text-[10px] text-amber-300 rounded border border-neutral-750"
                >
                  + থ্রি-পিস
                </button>
              </div>
            </div>

            {/* Google Drive Link Quick Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={driveUrlInput}
                onChange={(e) => setDriveUrlInput(e.target.value)}
                placeholder="বা Google Drive ছবির লিংক পেস্ট করুন..."
                className="flex-1 bg-neutral-950 border border-neutral-750 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAddDriveUrl}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold"
              >
                যুক্ত করুন
              </button>
            </div>

            {/* Main Prompt & Price Form Bar */}
            <form onSubmit={handleGenerate} className="flex gap-2">
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="পোশাকের নাম লিখুন (যেমন: রয়েল ব্লু কটন পাঞ্জাবি)..."
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
              />

              <div className="w-24 sm:w-28 relative">
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="দাম ৳"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-6 pr-2 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
                <span className="absolute left-2.5 top-2.5 text-xs text-amber-400 font-mono font-bold">
                  {config.currencySymbol}
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">AI Generate</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Draft Preview & Instant Publishing Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-850">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <h4 className="font-serif font-bold text-sm text-white">Live Garment Draft Preview</h4>
                </div>
                {latestDraft && (
                  <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-700/60 text-emerald-400 rounded text-[10px] font-mono font-bold">
                    AI Ready
                  </span>
                )}
              </div>

              {latestDraft ? (
                <div className="mt-4 space-y-4">
                  {/* Photo & Titles */}
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-32 rounded-xl bg-neutral-900 border border-neutral-700 overflow-hidden shrink-0">
                      <img
                        src={(latestDraft as any).image || (uploadedImages[0] || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop')}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <span className="inline-block px-2 py-0.5 bg-neutral-850 text-amber-300 text-[10px] font-bold rounded uppercase">
                        {latestDraft.category}
                      </span>
                      <h5 className="font-bold text-sm text-white leading-snug">
                        {latestDraft.title}
                      </h5>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">
                        {latestDraft.subtitle}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-base font-bold text-white font-mono">
                          {config.currencySymbol}{latestDraft.price}
                        </span>
                        {latestDraft.originalPrice > latestDraft.price && (
                          <span className="text-xs text-neutral-500 line-through font-mono">
                            {config.currencySymbol}{latestDraft.originalPrice}
                          </span>
                        )}
                        <span className="text-[10px] text-amber-400 font-mono">
                          SKU: {latestDraft.sku}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1.5">
                      সাইজসমূহ (Sizes):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {latestDraft.sizes.map((s) => (
                        <span key={s} className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-neutral-200 rounded text-[10px] font-mono font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      বিবরণী (Description):
                    </span>
                    <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl text-neutral-300 text-xs leading-relaxed max-h-36 overflow-y-auto">
                      {latestDraft.description}
                    </div>
                  </div>

                  {/* Fabric & Care */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg">
                      <span className="text-neutral-500 font-bold block mb-0.5">কাপড় (Material):</span>
                      <span className="text-neutral-200">{latestDraft.material}</span>
                    </div>
                    <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg">
                      <span className="text-neutral-500 font-bold block mb-0.5">যত্ন (Care):</span>
                      <span className="text-neutral-200">{latestDraft.careInstructions}</span>
                    </div>
                  </div>

                  {/* Direct Publish Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handlePublishDraft(latestDraft)}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold uppercase tracking-wider rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98"
                    >
                      <Check className="w-4 h-4" />
                      <span>✓ Publish to Live Storefront</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-amber-400 mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-neutral-300 text-xs">নো একটিভ ড্রাফট</h5>
                    <p className="text-[11px] text-neutral-500 max-w-xs mx-auto mt-1">
                      বামে ছবি দিন, হেডিং ও দাম লিখে AI Generate চাপুন — সাথে সাথে সম্পূর্ণ পোশাকের ড্রাফট তৈরি হয়ে যাবে!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Helper Notes */}
            <div className="mt-4 pt-4 border-t border-neutral-850 text-[11px] text-neutral-500 leading-relaxed">
              💡 <strong>টিপস:</strong> আপনি যেকোনো সময় একাধিক ছবি আপলোড করতে পারবেন। এআই স্বয়ংক্রিয়ভাবে ছবি অপটিমাইজ করে দ্রুততম স্পিডে লোড করাবে।
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
