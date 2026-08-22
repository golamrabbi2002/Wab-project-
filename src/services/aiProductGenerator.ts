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
    const lower = (title + ' ' + (categoryHint || '')).toLowerCase();

    let category = 'Panjabi';
    let sizes = ['M (38)', 'L (40)', 'XL (42)', 'XXL (44)'];
    let prefix = 'PAN';
    let material = '১০০% প্রি-ওয়াশড ফাইন কম্বড কটন | সূক্ষ্ম এমব্রয়ডারি';
    let subtitle = 'অভিজাত প্রিমিয়াম কারুকাজ ও আরামদায়ক নরম ফেব্রিক';
    let care = 'হ্যান্ড ওয়াশ অথবা ড্রাই ক্লিন। মডারেট আয়রন করুন।';
    let description = `${title} — আপনার আভিজাত্য ও ব্যক্তিত্বকে অনন্য মাত্রায় পৌঁছে দিতে নিখুঁত হাতের কাজের এই গর্জিয়াস পোশাক। আরামদায়ক ও ব্রিদেবল প্রিমিয়াম কটন ফেব্রিক দিয়ে তৈরি, যা আপনাকে দিনভর রাখবে সতেজ ও স্বাচ্ছন্দ্যময়। জুম্মাহর নামাজ, ঈদ কিংবা যেকোনো পারিবারিক উৎসবে পরার জন্য শতভাগ উপযুক্ত।`;

    if (lower.includes('শাড়ি') || lower.includes('saree') || lower.includes('shari') || lower.includes('silk') || lower.includes('jamdani')) {
      category = 'Saree';
      sizes = ['Free Size (১২ হাত + ব্লাউজ পিস)'];
      prefix = 'SAR';
      material = 'খাঁটি সিল্ক / প্রিমিয়াম জামদানি সুতা ও জরি কারুকাজ';
      subtitle = 'ঐতিহ্যবাহী বুনন ও নজরকাড়া রাজকীয় আঁচল';
      care = 'ড্রাই ওয়াশ আবশ্যক। ঠাণ্ডা ছায়াযুক্ত স্থানে শুকান।';
      description = `${title} — উৎসবের প্রতিটি মুহূর্তে আপনার রূপ ও সৌন্দর্যকে আরও মনমাতানো করে তুলতে তৈরি এই রাজকীয় শাড়ি। প্রিমিয়াম সিল্ক ও সূক্ষ্ম কারুকাজে বোনা এই পোশাকটি পরলে আপনি পাবেন সবার হৃদয়ছোঁয়া প্রশংসা। সাথে রয়েছে ম্যাচিং ব্লাউজ পিস।`;
    } else if (lower.includes('থ্রি') || lower.includes('three') || lower.includes('কামিজ') || lower.includes('salwar') || lower.includes('lawn')) {
      category = 'Three-Piece';
      sizes = ['M (38)', 'L (40)', 'XL (42)', 'XXL (44)'];
      prefix = 'THR';
      material = '১০০% পিওর কটন / লাক্সারি সুইস লন ও শিফন ওড়না';
      subtitle = 'ডিজাইনার ডিজিটাল প্রিন্ট ও আকর্ষণীয় এমব্রয়ডারি নেক';
      care = 'হালকা ডিটারজেন্টে নরম ওয়াশ। কড়া রোদে রাখবেন না।';
      description = `${title} — আধুনিক ফ্যাশন ও রুচিশীলতার অনন্য নিদর্শন। সেরা মানের ফেব্রিক ও দীর্ঘস্থায়ী রঙের নিশ্চয়তা সহ আকর্ষণীয় ডিজাইনের কামিজ, আরামদায়ক সেলোয়ার ও গর্জিয়াস ওড়নার পারফেক্ট কম্বিনেশন।`;
    } else if (lower.includes('কুর্তি') || lower.includes('kurti') || lower.includes('tunic')) {
      category = 'Kurtis';
      sizes = ['S (36)', 'M (38)', 'L (40)', 'XL (42)'];
      prefix = 'KRT';
      material = 'সফট জর্জেট / ফাইন রেয়ন কটন';
      subtitle = 'স্টাইলিশ রেগুলার ও ক্যাজুয়াল আউটফিট';
      care = 'নরমাল ওয়াশ ও হালকা আয়রন।';
      description = `${title} — ক্যাজুয়াল আড্ডা, অফিস কিংবা ভার্সিটির জন্য আরামদায়ক ও নজরকাড়া কুর্তি। অত্যন্ত সফট এবং ব্রিদেবল ফেব্রিকে তৈরি।`;
    } else if (lower.includes('শার্ট') || lower.includes('shirt') || lower.includes('polo') || lower.includes('top')) {
      category = 'Tops';
      sizes = ['S', 'M', 'L', 'XL', 'XXL'];
      prefix = 'TOP';
      material = '১০০% পিওর অক্সফোর্ড কটন';
      subtitle = 'স্মার্ট ক্যাজুয়াল ও ফরমাল ফিটিং';
      care = 'মেশিন ওয়াশ উপযোগী।';
      description = `${title} — স্মার্ট ও আত্মবিশ্বাসী লুক দিতে নিখুঁত সেলাই ও টেকসই সুতায় প্রস্তুত।`;
    }

    const calculatedOrigPrice = Math.round(price * 1.25);
    const sku = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      title,
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
