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
   * Parse quick merchant text like "Navy Blue Silk Punjabi 1950" or "প্লাস্টিক বালতি ৪০০ টাকা"
   * Returns empty title if nothing was provided so AI can auto-detect object from image.
   */
  static parsePrompt(prompt: string): { title: string; price: number; categoryHint?: string } {
    const raw = (prompt || '').trim();
    if (!raw) {
      return { title: '', price: 0 };
    }

    // Extract price number (supports English and Bengali digits)
    const banglaToEnglishMap: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    };

    const normalizedDigits = raw.replace(/[০-৯]/g, (w) => banglaToEnglishMap[w] || w);

    // Match price patterns like 1850, 1850/-, ৳1850, 1850 taka, price 1850
    const priceMatch = normalizedDigits.match(
      /(?:price\s*[:=]?\s*|tk\.?\s*|৳\s*|টাকা\s*|price\s+)?(\d{2,6})(?:\s*(?:tk|taka|bdt|টাকা|\/-))?/i
    );
    let price = 0;
    let cleanTitle = raw;

    if (priceMatch && priceMatch[1]) {
      const parsedNum = Number(priceMatch[1]);
      if (parsedNum >= 50 && parsedNum <= 500000) {
        price = parsedNum;
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
      title: cleanTitle,
      price,
    };
  }

  /**
   * Main generation method:
   * 1. Calls server-side Gemini endpoint `/api/ai/generate-product` (with multimodal vision).
   * 2. If running on a static host like Netlify where server route isn't available,
   *    and storeConfig has geminiApiKey, calls Gemini REST API directly with the image!
   * 3. Gracefully falls back to open-domain universal local intelligence.
   */
  static async generateGarment(
    title: string,
    price: number,
    images: string[],
    config: StoreConfig,
    categoryHint?: string,
    notes?: string
  ): Promise<AiGeneratedProductDraft> {
    const titleClean = (title || '').trim();
    const basePrice = Math.max(0, price || 0);

    // Strategy 1: Server-side Gemini API route
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);

      const res = await fetch('/api/ai/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleClean,
          price: basePrice,
          images: images.slice(0, 3),
          category: categoryHint,
          notes,
          storeConfig: config,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data && (data.title || data.description)) {
            return {
              title: SecurityService.sanitizeText(data.title || 'প্রিমিয়াম প্রোডাক্ট', 120),
              subtitle: SecurityService.sanitizeText(data.subtitle || '', 150),
              category: data.category || 'General',
              price: Number(data.price) > 0 ? Number(data.price) : (basePrice > 0 ? basePrice : 1250),
              originalPrice: Number(data.originalPrice) || Math.round((Number(data.price) || 1250) * 1.25),
              sku: SecurityService.sanitizeText(data.sku || `SKU-${Date.now().toString().slice(-4)}`, 50),
              sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ['Standard'],
              stock: Number(data.stock) || 25,
              description: SecurityService.sanitizeText(data.description || '', 3000),
              material: SecurityService.sanitizeText(data.material || '', 200),
              careInstructions: SecurityService.sanitizeText(data.careInstructions || '', 300),
              badges: Array.isArray(data.badges) ? data.badges : ['New'],
              featured: data.featured ?? true,
            };
          }
        }
      }
    } catch (err) {
      console.warn('Backend server AI route notice (likely static deploy):', err);
    }

    // Strategy 2: Direct Client-Side Gemini Vision if API key is in Store Settings
    const directApiKey = (config.geminiApiKey || '').trim();
    if (directApiKey) {
      try {
        const directDraft = await this.generateWithDirectGeminiRest(
          directApiKey,
          titleClean,
          basePrice,
          images,
          categoryHint,
          config
        );
        if (directDraft) {
          return directDraft;
        }
      } catch (geminiDirectErr) {
        console.warn('Direct client Gemini call error:', geminiDirectErr);
      }
    }

    // Strategy 3: Universal Intelligent Open-Domain Fallback
    return this.fallbackUniversalGenerator(titleClean, basePrice, categoryHint, images.length > 0);
  }

  /**
   * Direct Gemini REST API caller for client-side static environments (Netlify)
   */
  private static async generateWithDirectGeminiRest(
    apiKey: string,
    title: string,
    price: number,
    images: string[],
    categoryHint?: string,
    config?: StoreConfig
  ): Promise<AiGeneratedProductDraft | null> {
    const parts: any[] = [];

    // Convert Base64 images to Gemini inlineData parts
    for (const img of images.slice(0, 2)) {
      if (typeof img === 'string' && img.startsWith('data:image/')) {
        const matches = img.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches[1] && matches[2]) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }
    }

    const systemPrompt = `
You are an expert universal e-commerce merchandiser and copywriter.
Analyze the uploaded image(s) or merchant title.
Identify the EXACT real-world product (e.g. bucket/বালতি, cookware, shoes, panjabi, saree, shirts, electronics, accessories, tools, etc.).
DO NOT restrict yourself to clothing. If it is a bucket, category is "Household & Living", sizes are capacities like ["১৬ লিটার", "২০ লিটার"], and material is "ভার্জিন প্লাস্টিক".
If merchant title was empty, GENERATE a descriptive, authentic commercial Bengali title.
Return valid JSON only.

OUTPUT FORMAT:
{
  "title": "string (Bengali)",
  "subtitle": "string (Bengali)",
  "category": "Household & Living | Panjabi | Saree | Three-Piece | Kurtis | Tops | Footwear | Accessories | Electronics | General",
  "price": number,
  "originalPrice": number,
  "sku": "string",
  "sizes": ["string"],
  "stock": number,
  "description": "string (Bengali)",
  "material": "string (Bengali)",
  "careInstructions": "string (Bengali)",
  "badges": ["New", "Bestseller"],
  "featured": true
}
`;

    parts.push({
      text: `${systemPrompt}\n\nMerchant title: "${title || '(Empty - detect from image)'}". Suggested price: ${price > 0 ? price : 0} BDT. Category hint: ${categoryHint || 'Auto'}. Output JSON.`
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (response.ok) {
      const result = await response.json();
      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const data = JSON.parse(rawText);
        return {
          title: SecurityService.sanitizeText(data.title || title || 'প্রিমিয়াম প্রোডাক্ট', 120),
          subtitle: SecurityService.sanitizeText(data.subtitle || '', 150),
          category: data.category || 'General',
          price: Number(data.price) > 0 ? Number(data.price) : (price > 0 ? price : 1250),
          originalPrice: Number(data.originalPrice) || Math.round((Number(data.price) || 1250) * 1.25),
          sku: SecurityService.sanitizeText(data.sku || `SKU-${Date.now().toString().slice(-4)}`, 50),
          sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ['Standard'],
          stock: Number(data.stock) || 25,
          description: SecurityService.sanitizeText(data.description || '', 3000),
          material: SecurityService.sanitizeText(data.material || '', 200),
          careInstructions: SecurityService.sanitizeText(data.careInstructions || '', 300),
          badges: Array.isArray(data.badges) ? data.badges : ['New'],
          featured: data.featured ?? true,
        };
      }
    }
    return null;
  }

  /**
   * Deterministic Open-Domain Universal Knowledge Generator
   */
  private static fallbackUniversalGenerator(
    title: string,
    price: number,
    categoryHint?: string,
    hasImage: boolean = false
  ): AiGeneratedProductDraft {
    const text = (title || '').toLowerCase();
    const hint = (categoryHint || '').toLowerCase();
    const basePrice = price > 0 ? price : 1250;
    const calcOrig = Math.round(basePrice * 1.25);

    // 1. Bucket & Household
    if (
      text.includes('বালতি') ||
      text.includes('bucket') ||
      text.includes('মগ') ||
      text.includes('ঝুড়ি') ||
      text.includes('ঝুড়ি') ||
      text.includes('প্লাস্টিক') ||
      hint.includes('household') ||
      hint.includes('home')
    ) {
      return {
        title: title || 'প্রিমিয়াম হেভি-ডিউটি ভার্জিন প্লাস্টিক বালতি (১৬ লিটার)',
        subtitle: 'টেকসই বডি, মজবুত স্টিল হ্যান্ডেল ও মসৃণ গ্রিপ',
        category: 'Household & Living',
        price: price > 0 ? price : 450,
        originalPrice: price > 0 ? calcOrig : 550,
        sku: `BLT-${Math.floor(1000 + Math.random() * 9000)}`,
        sizes: ['১৬ লিটার', '২০ লিটার'],
        stock: 40,
        description: `${title || 'প্রিমিয়াম প্লাস্টিক বালতি'} — দৈনন্দিন ব্যবহারের জন্য সর্বোচ্চ স্থায়িত্ব নিশ্চিত করতে প্রস্তুত। ১০০% ভার্জিন প্লাস্টিকে তৈরি হওয়ায় দীর্ঘস্থায়ী এবং মরিচারোধী অ্যালয় মেটাল হ্যান্ডেল ভারী পানি বহনে দেয় আরামদায়ক গ্রিপ। ক্যাশ অন ডেলিভারিতে চেক করে নেওয়ার শতভাগ সুবিধা।`,
        material: 'ফুড-গ্রেড ভার্জিন আনব্রেকেবল প্লাস্টিক ও অ্যালয় স্টিল হ্যান্ডেল',
        careInstructions: 'ব্যবহারের পর পরিষ্কার পানি দিয়ে ধুয়ে রাখুন। অতিরিক্ত তাপ থেকে দূরে রাখুন।',
        badges: ['New', 'Bestseller'],
        featured: true,
      };
    }

    // 2. Footwear
    if (
      text.includes('জুতো') ||
      text.includes('জুতা') ||
      text.includes('shoe') ||
      text.includes('sneaker') ||
      text.includes('sandal') ||
      hint.includes('footwear')
    ) {
      return {
        title: title || 'প্রিমিয়াম স্টাইলিশ ক্যাজুয়াল স্নিকার্স',
        subtitle: 'ব্রিদেবল মেশ, সফট কুশনিং ও অ্যান্টি-স্লিপ গ্রিপ',
        category: 'Footwear',
        price: price > 0 ? price : 2200,
        originalPrice: price > 0 ? calcOrig : 2800,
        sku: `SHOE-${Math.floor(1000 + Math.random() * 9000)}`,
        sizes: ['৩৯', '৪০', '৪১', '৪২', '৪৩'],
        stock: 20,
        description: `${title || 'প্রিমিয়াম ফুটওয়্যার'} — সারাদিনের স্বস্তি ও নিখুঁত ফ্যাশনের সমন্বয়। অ্যান্টি-স্লিপ রাবার সোল যেকোনো রাস্তায় দেয় সেরা গ্রিপ। ক্যাশ অন ডেলিভারিতে দেখে ট্রায়াল করার সুযোগ।`,
        material: 'ব্রিদেবল মেশ আপার ও হাই-গ্রিপ রাবার সোল',
        careInstructions: 'শুকনো ব্রাশ দিয়ে পরিষ্কার করুন। কড়া রোদে শুকাবেন না।',
        badges: ['New'],
        featured: true,
      };
    }

    // 3. Saree
    if (
      text.includes('শাড়ি') ||
      text.includes('শাড়ি') ||
      text.includes('saree') ||
      text.includes('জামদানি') ||
      text.includes('বেনারসি') ||
      hint.includes('saree')
    ) {
      return {
        title: title || 'ঐতিহ্যবাহী লাক্সারি ডিজাইনার শাড়ি',
        subtitle: 'নিখুঁত জামদানি উইভিং ও গর্জিয়াস জরি আঁচল',
        category: 'Saree',
        price: price > 0 ? price : 3500,
        originalPrice: price > 0 ? calcOrig : 4500,
        sku: `SAR-${Math.floor(1000 + Math.random() * 9000)}`,
        sizes: ['Free Size (১২ হাত + ব্লাউজ পিস)'],
        stock: 15,
        description: `${title || 'লাক্সারি শাড়ি কালেকশন'} — উৎসব ও ঘরোয়া আয়োজনে আভিজাত্যের পূর্ণ প্রকাশ। প্রিমিয়াম সিল্ক ও মসৃণ সুতার বুননে বোনা, সাথে পাচ্ছেন ম্যাচিং ব্লাউজ পিস।`,
        material: 'প্রিমিয়াম সফট সিল্ক ও ঐতিহ্যবাহী সুতা বুনন',
        careInstructions: 'ড্রাই ক্লিন ওয়াশ আবশ্যক। ছায়ায় শুকান।',
        badges: ['New', 'Bestseller'],
        featured: true,
      };
    }

    // 4. Panjabi
    if (
      text.includes('পাঞ্জাবি') ||
      text.includes('পাঞ্জাবী') ||
      text.includes('panjabi') ||
      text.includes('punjabi') ||
      hint.includes('panjabi')
    ) {
      return {
        title: title || 'রয়্যাল ডিজাইনার কটন পাঞ্জাবি',
        subtitle: 'অভিজাত এমব্রয়ডারি কারুকাজ ও আরামদায়ক রেগুলার ফিট',
        category: 'Panjabi',
        price: price > 0 ? price : 1850,
        originalPrice: price > 0 ? calcOrig : 2350,
        sku: `PAN-${Math.floor(1000 + Math.random() * 9000)}`,
        sizes: ['M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
        stock: 30,
        description: `${title || 'ডিজাইনার পাঞ্জাবি'} — জুম্মাহ ও যেকোনো অনুষ্ঠানে ব্যক্তিত্বের রাজকীয় প্রতিফলন। ১০০% ফাইন কটন ফেব্রিক নিশ্চিত করে দিনভর সর্বোচ্চ আরাম। কালার ও ফিটিং শতভাগ গ্যারান্টিযুক্ত।`,
        material: '১০০% প্রি-ওয়াশড ফাইন কম্বড কটন',
        careInstructions: 'হ্যান্ড ওয়াশ অথবা ড্রাই ক্লিন। মাঝারি তাপে আয়রন করুন।',
        badges: ['New', 'Bestseller'],
        featured: true,
      };
    }

    // 5. Open-Domain General Merchandise
    const autoTitle = title || (hasImage ? 'প্রিমিয়াম এক্সক্লুসিভ প্রোডাক্ট' : 'প্রিমিয়াম কালেকশন');
    return {
      title: autoTitle,
      subtitle: 'সেরা মান, আধুনিক ডিজাইন ও দীর্ঘস্থায়ী স্থায়িত্ব',
      category: hint && hint !== 'auto' ? hint : 'General',
      price: basePrice,
      originalPrice: calcOrig,
      sku: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      sizes: ['স্ট্যান্ডার্ড / ফ্রি সাইজ'],
      stock: 25,
      description: `${autoTitle} — দৈনন্দিন ব্যবহারের জন্য উন্নত কোয়ালিটি এবং নিখুঁত ফিনিশিং নিয়ে প্রস্তুত। গ্রাহক সন্তুষ্টি নিশ্চিত করতে ক্যাশ অন ডেলিভারিতে পার্সেল চেক করে দেখে নেওয়ার শতভাগ সুযোগ রয়েছে।`,
      material: 'উচ্চমানের টেকসই ও নিরাপদ উপাদান',
      careInstructions: 'পরিষ্কার ও শুকনো স্থানে সংরক্ষণ করুন।',
      badges: ['New', 'Bestseller'],
      featured: true,
    };
  }
}
