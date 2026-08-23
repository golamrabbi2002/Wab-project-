import { Product, StoreConfig } from '../types';
import { SecurityService } from './securityService';

export interface AiGeneratedProductDraft {
  title: string;
  subtitle: string;
  category: string;
  price: number;
  originalPrice: number;
  sku: string;
  sizes: string[];
  stock: number;
  description: string;
  material: string;
  careInstructions: string;
  badges: ('New' | 'Sale' | 'Bestseller' | 'Limited')[];
  featured: boolean;
}

export class AiProductGeneratorService {
  /**
   * Parse quick merchant text like "Navy Blue Silk Punjabi 1950" or "কালো জামদানি শাড়ি ৩৫০০ টাকা"
   */
  static parsePrompt(prompt: string): { title: string; price: number; categoryHint?: string } {
    const raw = prompt.trim();
    
    // Extract price number (supports English and Bengali digits)
    const banglaToEnglishMap: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    
    const normalizedDigits = raw.replace(/[০-৯]/g, (w) => banglaToEnglishMap[w] || w);
    
    // Match price patterns like 1850, 1850/-, ৳1850, 1850 taka, price 1850
    const priceMatch = normalizedDigits.match(/(?:price\s*[:=]?\s*|tk\.?\s*|৳\s*|টাকা\s*|price\s+)?(\d{2,6})(?:\s*(?:tk|taka|bdt|টাকা|\/-))?/i);
    let price = 1850;
    let cleanTitle = raw;

    if (priceMatch && priceMatch[1]) {
      const parsedNum = Number(priceMatch[1]);
      if (parsedNum >= 50 && parsedNum <= 500000) {
        price = parsedNum;
        // Clean price portion out of title string
        cleanTitle = raw
          .replace(new RegExp(priceMatch[0], 'i'), '')
          .replace(/price\s*[:=]?/gi, '')
          .replace(/দাম\s*[:=]?/gi, '')
          .replace(/টাকা/g, '')
          .replace(/tk/gi, '')
          .replace(/bdt/gi, '')
          .replace(/৳/g, '')
          .trim();
      }
    }

    // Clean leading/trailing punctuation
    cleanTitle = cleanTitle.replace(/^[-–—:,.\s]+|[-–—:,.\s]+$/g, '').trim();

    return {
      title: cleanTitle || 'প্রিমিয়াম ডিজাইনার পোশাক',
      price,
    };
  }

  /**
   * Main generation method: tries server-side Gemini API (with multimodal images) first,
   * then gracefully falls back to instant client template engine.
   */
  static async generateGarment(
    title: string,
    price: number,
    images: string[],
    config: StoreConfig,
    categoryHint?: string,
    notes?: string
  ): Promise<AiGeneratedProductDraft> {
    const basePrice = Math.max(0, price || 1850);

    try {
      const res = await fetch('/api/ai/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price: basePrice,
          images: images.slice(0, 3),
          category: categoryHint,
          notes,
          storeConfig: config,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.title) {
          return {
            title: SecurityService.sanitizeText(data.title, 120),
            subtitle: SecurityService.sanitizeText(data.subtitle || '', 150),
            category: data.category || 'Panjabi',
            price: Number(data.price) || basePrice,
            originalPrice: Number(data.originalPrice) || Math.round(basePrice * 1.25),
            sku: SecurityService.sanitizeText(data.sku || `SKU-${Date.now().toString().slice(-4)}`, 50),
            sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ['M', 'L', 'XL'],
            stock: Number(data.stock) || 25,
            description: SecurityService.sanitizeText(data.description || '', 3000),
            material: SecurityService.sanitizeText(data.material || '', 200),
            careInstructions: SecurityService.sanitizeText(data.careInstructions || '', 300),
            badges: Array.isArray(data.badges) ? data.badges : ['New'],
            featured: data.featured ?? true,
          };
        }
      }
    } catch (err) {
      console.warn('Backend AI Product Generator endpoint unreachable, utilizing local high-precision generator:', err);
    }

    // High-Precision Local Knowledge Generator Fallback
    return this.fallbackLocalGenerator(title, basePrice, categoryHint);
  }

  /**
   * Deterministic Bengali Fashion Knowledge Generator
   */
  private static fallbackLocalGenerator(title: string, price: number, categoryHint?: string): AiGeneratedProductDraft {
    const text = (title || '').toLowerCase();
    const hint = (categoryHint || '').toLowerCase();

    let category = 'Panjabi';
    let sizes = ['M (38)', 'L (40)', 'XL (42)', 'XXL (44)'];
    let prefix = 'PAN';
    let material = '১০০% প্রি-ওয়াশড ফাইন কম্বড কটন | সূক্ষ্ম কম্পিউটার ও হ্যান্ড এমব্রয়ডারি';
    let subtitle = 'অভিজাত প্রিমিয়াম কারুকাজ, সফট কলার ও আরামদায়ক ফিটিং';
    let care = 'হ্যান্ড ওয়াশ অথবা ড্রাই ক্লিন। রোদে বেশিক্ষণ রাখবেন না। মাঝারি তাপে আয়রন করুন।';
    let description = `${title || 'এক্সক্লুসিভ ডিজাইনার পাঞ্জাবি'} — জুম্মাহর নামাজ, ঈদ কিংবা যেকোনো পারিবারিক উৎসবে আপনার ব্যক্তিত্বকে ফুটিয়ে তুলতে নিখুঁত কারুকাজের এই রাজকীয় পাঞ্জাবি। ১০০% কটন ফেব্রিক আপনাকে দেবে দিনভর আরাম ও স্বস্তি। ১০০% কালার গ্যারান্টি।`;

    // 1. Manual hint takes priority if explicit
    if (hint && hint !== 'auto') {
      if (hint === 'saree' || hint === 'shari' || hint.includes('শাড়ি') || hint.includes('শাড়ি')) {
        category = 'Saree';
      } else if (hint === 'panjabi' || hint === 'punjabi' || hint.includes('পাঞ্জাবি') || hint.includes('পাঞ্জাবী')) {
        category = 'Panjabi';
      } else if (hint.includes('three') || hint.includes('thri') || hint.includes('থ্রি') || hint.includes('kameez')) {
        category = 'Three-Piece';
      } else if (hint.includes('kurti') || hint.includes('কুর্তি')) {
        category = 'Kurtis';
      } else if (hint.includes('top') || hint.includes('shirt') || hint.includes('শার্ট')) {
        category = 'Tops';
      } else if (hint.includes('bottom') || hint.includes('pant') || hint.includes('প্যান্ট')) {
        category = 'Bottoms';
      }
    } else {
      // 2. High-precision Bengali & English Keywords
      const panjabiMatches = ['পাঞ্জাবি', 'পাঞ্জাবী', 'panjabi', 'punjabi', 'kabli', 'কাবলি', 'পায়জামা পাঞ্জাবি', 'কুর্তা', 'kurta', 'jubba', 'জুব্বা'];
      const sareeMatches = ['শাড়ি', 'শাড়ি', 'saree', 'sari', 'shari', 'sharee', 'জামদানি', 'jamdani', 'বেনারসি', 'banarasi', 'কাতান', 'katan', 'তসর', 'tussar', 'টাঙ্গাইল শাড়ি'];
      const threePieceMatches = ['থ্রি-পিস', 'থ্রিপিস', 'থ্রি পিস', 'three piece', 'three-piece', '3 piece', '3-piece', 'কামিজ', 'kameez', 'salwar', 'সালোয়ার', 'সালোয়ার', 'সেলোয়ার', 'লেহেঙ্গা', 'lehenga', 'গাউন', 'gown', 'আনোয়ারকলি', 'anarkali'];
      const kurtiMatches = ['কুর্তি', 'kurti', 'kurtis', 'টিউনিক', 'tunic'];
      const topsMatches = ['শার্ট', 'shirt', 't-shirt', 'টি-শার্ট', 'polo', 'পোলো', 'টপ', 'top', 'blouse', 'ব্লাউজ', 'blazer', 'ব্লেজার'];
      const bottomsMatches = ['প্যান্ট', 'pant', 'trouser', 'ট্রাউজার', 'জিন্স', 'jeans', 'পালাজ্জো', 'palazzo'];

      const hasPanjabi = panjabiMatches.some(k => text.includes(k));
      const hasSaree = sareeMatches.some(k => text.includes(k));
      const hasThreePiece = threePieceMatches.some(k => text.includes(k));
      const hasKurti = kurtiMatches.some(k => text.includes(k));
      const hasTops = topsMatches.some(k => text.includes(k));
      const hasBottoms = bottomsMatches.some(k => text.includes(k));

      if (hasPanjabi && !hasSaree) {
        category = 'Panjabi';
      } else if (hasSaree && !hasPanjabi) {
        category = 'Saree';
      } else if (hasThreePiece) {
        category = 'Three-Piece';
      } else if (hasKurti) {
        category = 'Kurtis';
      } else if (hasTops) {
        category = 'Tops';
      } else if (hasBottoms) {
        category = 'Bottoms';
      } else if (hasPanjabi) {
        category = 'Panjabi';
      } else if (hasSaree) {
        category = 'Saree';
      }
    }

    if (category === 'Saree') {
      sizes = ['Free Size (১২ হাত + ব্লাউজ পিস)'];
      prefix = 'SAR';
      material = 'প্রিমিয়াম সফট সিল্ক / ঐতিহ্যবাহী জামদানি উইভিং ও গর্জিয়াস জরি আঁচল';
      subtitle = 'ঐতিহ্যবাহী নিখুঁত বুনন ও রাজকীয় আঁচল ডিজাইন';
      care = 'ড্রাই ক্লিন ওয়াশ আবশ্যক। সরাসরি রোদে না শুকিয়ে ছায়ায় শুকান।';
      description = `${title || 'এক্সক্লুসিভ ডিজাইনার শাড়ি'} — প্রতিটি উৎসবে আপনার রূপ ও আভিজাত্যকে আরও মনমাতানো করে তুলতে তৈরি এই ঐতিহ্যবাহী শাড়ি। প্রিমিয়াম সিল্ক ও সূক্ষ্ম সুতার বুননে বোনা, সাথে পাচ্ছেন ম্যাচিং ব্লাউজ পিস।`;
    } else if (category === 'Three-Piece') {
      sizes = ['M (38)', 'L (40)', 'XL (42)', 'XXL (44)'];
      prefix = 'THR';
      material = 'লাক্সারি সুইস লন / ডিজিটাল প্রিন্ট কটন কামিজ, কমফোর্ট সেলোয়ার ও গর্জিয়াস ওড়না';
      subtitle = 'ডিজাইনার ডিজিটাল প্রিন্ট ও গর্জিয়াস এমব্রয়ডারি কারুকাজ';
      care = 'হালকা ডিটারজেন্টে নরম ওয়াশ। কড়া রোদে বেশিক্ষণ রাখবেন না।';
      description = `${title || 'লাক্সারি থ্রি-পিস কালেকশন'} — আধুনিক ফ্যাশন ও রুচিশীলতার অনন্য নিদর্শন। সেরা মানের ফেব্রিক ও দীর্ঘস্থায়ী রঙের নিশ্চয়তা সহ আকর্ষণীয় ডিজাইনের কামিজ, আরামদায়ক সেলোয়ার ও ওড়নার পারফেক্ট কম্বিনেশন।`;
    } else if (category === 'Kurtis') {
      sizes = ['S (36)', 'M (38)', 'L (40)', 'XL (42)'];
      prefix = 'KRT';
      material = '১০০% প্রিমিয়াম রেয়ন কটন / সফট জর্জেট';
      subtitle = 'স্মার্ট ও আকর্ষণীয় আধুনিক ক্যাজুয়াল আউটফিট';
      care = 'মেশিন বা হ্যান্ড ওয়াশ উপযোগী। হালকা তাপে আয়রন করুন।';
      description = `${title || 'স্টাইলিশ ডিজাইনার কুর্তি'} — ক্যাজুয়াল আড্ডা, অফিস কিংবা ভার্সিটির জন্য আরামদায়ক ও নজরকাড়া কুর্তি। অত্যন্ত সফট এবং ব্রিদেবল ফেব্রিকে তৈরি।`;
    } else if (category === 'Tops') {
      sizes = ['S', 'M', 'L', 'XL', 'XXL'];
      prefix = 'TOP';
      material = '১০০% পিওর ফাইন অক্সফোর্ড কটন';
      subtitle = 'স্মার্ট ক্যাজুয়াল ও অফিসিয়াল রেগুলার ফিট';
      care = 'মেশিন ওয়াশ উপযোগী। স্বাভাবিক রোদে শুকান।';
      description = `${title || 'প্রিমিয়াম ক্যাজুয়াল শার্ট'} — স্মার্ট ও আত্মবিশ্বাসী লুক দিতে নিখুঁত সেলাই ও প্রিমিয়াম ফেব্রিকে প্রস্তুত।`;
    } else if (category === 'Bottoms') {
      sizes = ['30', '32', '34', '36', '38'];
      prefix = 'BOT';
      material = 'প্রিমিয়াম স্ট্রেচ টুইল / সফট কটন';
      subtitle = 'আরামদায়ক রেগুলার ও স্লিম ফিট বটমওয়্যার';
      care = 'মেশিন ওয়াশ উপযোগী।';
      description = `${title || 'ক্লাসিক ডিজাইনার বটমস'} — আরামদায়ক ফিটিং এবং টেকসই ফেব্রিক যা দীর্ঘসময় পরিধানে স্বস্তি দেয়।`;
    }

    const calculatedOrigPrice = Math.round(price * 1.25);
    const sku = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      title: title || `এক্সক্লুসিভ ${category} কালেকশন`,
      subtitle,
      category,
      price,
      originalPrice: calculatedOrigPrice,
      sku,
      sizes,
      stock: 25,
      description,
      material,
      careInstructions: care,
      badges: ['New', 'Bestseller'],
      featured: true,
    };
  }
}
