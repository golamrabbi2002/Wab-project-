import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini Client Lazily
  let aiClient: GoogleGenAI | null = null;
  function getAi(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // --- Intelligent Garment Classification Engine ---
  interface GarmentCategoryInfo {
    category: 'Panjabi' | 'Saree' | 'Three-Piece' | 'Kurtis' | 'Tops' | 'Bottoms' | 'Outerwear' | 'Accessories' | 'Footwear';
    sizes: string[];
    skuPrefix: string;
    material: string;
    subtitle: string;
    descriptionSnippet: string;
    careInstructions: string;
  }

  function getCategoryTemplate(category: GarmentCategoryInfo['category'], rawTitle: string): GarmentCategoryInfo {
    switch (category) {
      case 'Saree':
        return {
          category: 'Saree',
          sizes: ['Free Size (১২ হাত + ব্লাউজ পিস)'],
          skuPrefix: 'SAR',
          material: 'প্রিমিয়াম সফট সিল্ক / ঐতিহ্যবাহী জামদানি উইভিং ও গর্জিয়াস জরি আঁচল',
          subtitle: 'ঐতিহ্যবাহী নিখুঁত বুনন ও রাজকীয় আঁচল ডিজাইন',
          descriptionSnippet: `${rawTitle || 'এক্সক্লুসিভ ডিজাইনার শাড়ি'} — প্রতিটি উৎসবে আপনার রূপ ও আভিজাত্যকে আরও মনমাতানো করে তুলতে তৈরি এই ঐতিহ্যবাহী শাড়ি। প্রিমিয়াম সিল্ক ও সূক্ষ্ম সুতার বুননে বোনা, সাথে পাচ্ছেন ম্যাচিং ব্লাউজ পিস।`,
          careInstructions: 'ড্রাই ক্লিন ওয়াশ আবশ্যক। সরাসরি রোদে না শুকিয়ে ছায়ায় শুকান।'
        };
      case 'Three-Piece':
        return {
          category: 'Three-Piece',
          sizes: ['M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
          skuPrefix: 'THR',
          material: 'লাক্সারি সুইস লন / ডিজিটাল প্রিন্ট কটন কামিজ, কমফোর্ট সেলোয়ার ও গর্জিয়াস ওড়না',
          subtitle: 'ডিজাইনার ডিজিটাল প্রিন্ট ও গর্জিয়াস এমব্রয়ডারি কারুকাজ',
          descriptionSnippet: `${rawTitle || 'লাক্সারি থ্রি-পিস কালেকশন'} — আধুনিক ফ্যাশন ও রুচিশীলতার অনন্য নিদর্শন। সেরা মানের ফেব্রিক ও দীর্ঘস্থায়ী রঙের নিশ্চয়তা সহ আকর্ষণীয় ডিজাইনের কামিজ, আরামদায়ক সেলোয়ার ও ওড়নার পারফেক্ট কম্বিনেশন।`,
          careInstructions: 'হালকা ডিটারজেন্টে নরম ওয়াশ। কড়া রোদে বেশিক্ষণ রাখবেন না।'
        };
      case 'Kurtis':
        return {
          category: 'Kurtis',
          sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
          skuPrefix: 'KRT',
          material: '১০০% প্রিমিয়াম রেয়ন কটন / সফট জর্জেট',
          subtitle: 'স্মার্ট ও আকর্ষণীয় আধুনিক ক্যাজুয়াল আউটফিট',
          descriptionSnippet: `${rawTitle || 'স্টাইলিশ ডিজাইনার কুর্তি'} — ক্যাজুয়াল আড্ডা, অফিস কিংবা ভার্সিটির জন্য আরামদায়ক ও নজরকাড়া কুর্তি। অত্যন্ত সফট এবং ব্রিদেবল ফেব্রিকে তৈরি।`,
          careInstructions: 'মেশিন বা হ্যান্ড ওয়াশ উপযোগী। হালকা তাপে আয়রন করুন।'
        };
      case 'Tops':
        return {
          category: 'Tops',
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          skuPrefix: 'TOP',
          material: '১০০% পিওর ফাইন অক্সফোর্ড কটন',
          subtitle: 'স্মার্ট ক্যাজুয়াল ও অফিসিয়াল রেগুলার ফিট',
          descriptionSnippet: `${rawTitle || 'প্রিমিয়াম ক্যাজুয়াল শার্ট'} — স্মার্ট ও আত্মবিশ্বাসী লুক দিতে নিখুঁত সেলাই ও প্রিমিয়াম ফেব্রিকে প্রস্তুত।`,
          careInstructions: 'মেশিন ওয়াশ উপযোগী। স্বাভাবিক রোদে শুকান।'
        };
      case 'Bottoms':
        return {
          category: 'Bottoms',
          sizes: ['30', '32', '34', '36', '38'],
          skuPrefix: 'BOT',
          material: 'প্রিমিয়াম স্ট্রেচ টুইল / সফট কটন',
          subtitle: 'আরামদায়ক রেগুলার ও স্লিম ফিট বটমওয়্যার',
          descriptionSnippet: `${rawTitle || 'ক্লাসিক ডিজাইনার বটমস'} — আরামদায়ক ফিটিং এবং টেকসই ফেব্রিক যা দীর্ঘসময় পরিধানে স্বস্তি দেয়।`,
          careInstructions: 'মেশিন ওয়াশ উপযোগী।'
        };
      case 'Panjabi':
      default:
        return {
          category: 'Panjabi',
          sizes: ['M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
          skuPrefix: 'PAN',
          material: '১০০% প্রি-ওয়াশড ফাইন কম্বড কটন | সূক্ষ্ম কম্পিউটার ও হ্যান্ড এমব্রয়ডারি',
          subtitle: 'অভিজাত প্রিমিয়াম কারুকাজ, সফট কলার ও নিখুঁত ফিটিং',
          descriptionSnippet: `${rawTitle || 'এক্সক্লুসিভ ডিজাইনার পাঞ্জাবি'} — জুম্মাহর নামাজ, ঈদ কিংবা যেকোনো পারিবারিক উৎসবে আপনার ব্যক্তিত্বকে ফুটিয়ে তুলতে নিখুঁত কারুকাজের এই রাজকীয় পাঞ্জাবি। ১০০% কটন ফেব্রিক আপনাকে দেবে দিনভর আরাম ও স্বস্তি।`,
          careInstructions: 'হ্যান্ড ওয়াশ অথবা ড্রাই ক্লিন। রোদে বেশিক্ষণ রাখবেন না। মাঝারি তাপে আয়রন করুন।'
        };
    }
  }

  function resolveGarmentCategory(rawTitle: string, hintCategory?: string): GarmentCategoryInfo {
    const text = (rawTitle || '').toLowerCase();
    const hint = (hintCategory || '').toLowerCase();

    // 1. If user provided a specific manual category choice (other than Auto)
    if (hint && hint !== 'auto') {
      if (hint === 'saree' || hint === 'shari' || hint.includes('শাড়ি') || hint.includes('শাড়ি')) {
        return getCategoryTemplate('Saree', rawTitle);
      }
      if (hint === 'panjabi' || hint === 'punjabi' || hint.includes('পাঞ্জাবি') || hint.includes('পাঞ্জাবী')) {
        return getCategoryTemplate('Panjabi', rawTitle);
      }
      if (hint.includes('three') || hint.includes('thri') || hint.includes('থ্রি') || hint.includes('kameez')) {
        return getCategoryTemplate('Three-Piece', rawTitle);
      }
      if (hint.includes('kurti') || hint.includes('কুর্তি')) {
        return getCategoryTemplate('Kurtis', rawTitle);
      }
      if (hint.includes('top') || hint.includes('shirt') || hint.includes('শার্ট')) {
        return getCategoryTemplate('Tops', rawTitle);
      }
      if (hint.includes('bottom') || hint.includes('pant') || hint.includes('প্যান্ট')) {
        return getCategoryTemplate('Bottoms', rawTitle);
      }
    }

    // 2. High-precision Bengali & English Keywords
    const panjabiMatches = ['পাঞ্জাবি', 'পাঞ্জাবী', 'panjabi', 'punjabi', 'kabli', 'কাবলি', 'পায়জামা পাঞ্জাবি', 'কুর্তা', 'kurta', 'jubba', 'জুব্বা'];
    const sareeMatches = ['শাড়ি', 'শাড়ি', 'saree', 'sari', 'shari', 'sharee', 'জামদানি', 'jamdani', 'বেনারসি', 'banarasi', 'কাতান', 'katan', 'তসর', 'tussar', 'টাঙ্গাইল'];
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

    // Specific disambiguation rules:
    // "Silk Panjabi" -> Panjabi (not Saree)
    if (hasPanjabi && !hasSaree) return getCategoryTemplate('Panjabi', rawTitle);
    // "Banarasi Saree" / "Jamdani Saree" -> Saree (not Panjabi)
    if (hasSaree && !hasPanjabi) return getCategoryTemplate('Saree', rawTitle);
    if (hasThreePiece) return getCategoryTemplate('Three-Piece', rawTitle);
    if (hasKurti) return getCategoryTemplate('Kurtis', rawTitle);
    if (hasTops) return getCategoryTemplate('Tops', rawTitle);
    if (hasBottoms) return getCategoryTemplate('Bottoms', rawTitle);
    if (hasPanjabi) return getCategoryTemplate('Panjabi', rawTitle);
    if (hasSaree) return getCategoryTemplate('Saree', rawTitle);

    return getCategoryTemplate('Panjabi', rawTitle);
  }

  // AI Product Details & Content Generator Endpoint (Admin Copilot)
  app.post('/api/ai/generate-product', async (req, res) => {
    try {
      const {
        title = '',
        price = 0,
        category = '',
        images = [],
        notes = '',
        storeConfig = {}
      } = req.body;

      const basePrice = Math.max(0, Number(price) || 1850);
      const calculatedOrigPrice = Math.round(basePrice * 1.25);
      const templateInfo = resolveGarmentCategory(title, category);

      const effectiveApiKey = (storeConfig.geminiApiKey && typeof storeConfig.geminiApiKey === 'string' && storeConfig.geminiApiKey.trim())
        ? storeConfig.geminiApiKey.trim()
        : process.env.GEMINI_API_KEY;

      if (!effectiveApiKey) {
        // Fallback response structure using deterministic knowledge base
        const cleanSku = `${templateInfo.skuPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
        return res.json({
          title: title.trim() || `এক্সক্লুসিভ ${templateInfo.category} কালেকশন`,
          subtitle: templateInfo.subtitle,
          category: templateInfo.category,
          price: basePrice,
          originalPrice: calculatedOrigPrice,
          sku: cleanSku,
          sizes: templateInfo.sizes,
          stock: 25,
          description: `${templateInfo.descriptionSnippet}\n\n১০০% কালার গ্যারান্টি, প্রিমিয়াম ফিনিশিং এবং ক্যাশ অন ডেলিভারিতে পার্সেল খুলে দেখে নেওয়ার সুযোগ।`,
          material: templateInfo.material,
          careInstructions: templateInfo.careInstructions,
          badges: ['New', 'Bestseller'],
          featured: true,
        });
      }

      const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
      const promptParts: any[] = [];

      // Add image parts if provided
      if (Array.isArray(images) && images.length > 0) {
        images.slice(0, 3).forEach((imgStr: string) => {
          if (typeof imgStr === 'string' && imgStr.startsWith('data:image/')) {
            const matches = imgStr.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            if (matches && matches[1] && matches[2]) {
              promptParts.push({
                inlineData: {
                  mimeType: matches[1],
                  data: matches[2]
                }
              });
            }
          }
        });
      }

      const systemInstruction = `
You are the world-class Luxury Fashion Merchandiser and Copywriter for "${storeConfig.brandName || 'বিসমিল্লাহ কালেকশন'}".
Your task is to take the merchant's heading, price, photos, and generate a complete, accurate, high-converting product catalog entry in Bengali.

CRITICAL PRODUCT IDENTIFICATION RULES (DO NOT MIX UP):
1. SAREE (শাড়ি / শাড়ি):
   - Unstitched 6-yard or 12-haath draped female garment with aanchal/pallu (e.g. Jamdani, Banarasi, Katan, Silk Saree, Cotton Saree).
   - Category MUST be strictly "Saree".
   - Sizes MUST be: ["Free Size (১২ হাত + ব্লাউজ পিস)"] or ["Free Size"].
   - SKU prefix MUST start with "SAR-".
   - NEVER call a Saree a Panjabi!

2. PANJABI (পাঞ্জাবি / পাঞ্জাবী):
   - Traditional long male tunic/kurta with a collar and chest button placket (e.g. Cotton Panjabi, Silk Panjabi, Kabli).
   - Note: "Silk Panjabi" is a PANJABI made of Silk fabric, NOT a Saree!
   - Category MUST be strictly "Panjabi".
   - Sizes MUST be: ["M (38)", "L (40)", "XL (42)", "XXL (44)"].
   - SKU prefix MUST start with "PAN-".
   - NEVER call a Panjabi a Saree!

3. THREE-PIECE (থ্রি-পিস / সালোয়ার কামিজ):
   - 3-piece female suit with kameez, salwar/pants, and dupatta/orna.
   - Category MUST be strictly "Three-Piece".
   - Sizes MUST be: ["M (38)", "L (40)", "XL (42)", "XXL (44)"].
   - SKU prefix MUST start with "THR-".

4. KURTIS (কুর্তি / টিউনিক):
   - Single piece female top/kurti. Category: "Kurtis". Sizes: ["S (36)", "M (38)", "L (40)", "XL (42)"]. SKU prefix: "KRT-".

5. TOPS (শার্ট / টি-শার্ট / টপস):
   - Western shirts, polos, tops. Category: "Tops". Sizes: ["S", "M", "L", "XL", "XXL"]. SKU prefix: "TOP-".

6. Multimodal Vision:
   - If photo is provided, visually identify whether it's a draped Saree on a woman/mannequin, a male Panjabi with collar/cuffs, or a Three-Piece.

OUTPUT FORMAT STRICTLY VALID JSON (NO MARKDOWN CODEBLOCKS):
{
  "title": "Polished Bengali Title",
  "subtitle": "Short Bengali Subtitle",
  "category": "Saree | Panjabi | Three-Piece | Kurtis | Tops | Bottoms",
  "price": number,
  "originalPrice": number,
  "sku": "string",
  "sizes": ["string"],
  "stock": number,
  "description": "Rich 2-3 paragraph Bengali description highlighting elegance, fabric comfort, Eid/wedding occasion, and cash on delivery assurance.",
  "material": "Specific fabric in Bengali",
  "careInstructions": "Care guidelines in Bengali",
  "badges": ["New"],
  "featured": true
}`;

      promptParts.push({
        text: `Please generate the product catalog JSON for garment titled: "${title || templateInfo.category}" with price ${basePrice} BDT. Target Category Hint: ${category || templateInfo.category}.`
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: promptParts
          }
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      });

      const textResponse = response.text || '';
      try {
        const parsed = JSON.parse(textResponse);
        const resolved = resolveGarmentCategory(parsed.title || title, parsed.category || category);
        
        return res.json({
          title: parsed.title || title || resolved.category,
          subtitle: parsed.subtitle || resolved.subtitle,
          category: parsed.category || resolved.category,
          price: Number(parsed.price) || basePrice,
          originalPrice: Number(parsed.originalPrice) || calculatedOrigPrice,
          sku: parsed.sku || `${resolved.skuPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
          sizes: (Array.isArray(parsed.sizes) && parsed.sizes.length > 0) ? parsed.sizes : resolved.sizes,
          stock: Number(parsed.stock) || 25,
          description: parsed.description || resolved.descriptionSnippet,
          material: parsed.material || resolved.material,
          careInstructions: parsed.careInstructions || resolved.careInstructions,
          badges: Array.isArray(parsed.badges) ? parsed.badges : ['New'],
          featured: typeof parsed.featured === 'boolean' ? parsed.featured : true
        });
      } catch (parseErr) {
        console.warn('Could not parse Gemini JSON, returning formatted template', parseErr);
        return res.json({
          title: title || `প্রিমিয়াম ${templateInfo.category} কালেকশন`,
          subtitle: templateInfo.subtitle,
          category: templateInfo.category,
          price: basePrice,
          originalPrice: calculatedOrigPrice,
          sku: `${templateInfo.skuPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
          sizes: templateInfo.sizes,
          stock: 25,
          description: textResponse || templateInfo.descriptionSnippet,
          material: templateInfo.material,
          careInstructions: templateInfo.careInstructions,
          badges: ['New'],
          featured: true
        });
      }
    } catch (err: any) {
      console.error('AI Product Generation Error:', err);
      const basePrice = Math.max(0, Number(req.body?.price) || 1850);
      const templateInfo = resolveGarmentCategory(req.body?.title || '', req.body?.category);
      return res.json({
        title: req.body?.title || `প্রিমিয়াম ${templateInfo.category} কালেকশন`,
        subtitle: templateInfo.subtitle,
        category: templateInfo.category,
        price: basePrice,
        originalPrice: Math.round(basePrice * 1.25),
        sku: `${templateInfo.skuPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
        sizes: templateInfo.sizes,
        stock: 25,
        description: templateInfo.descriptionSnippet,
        material: templateInfo.material,
        careInstructions: templateInfo.careInstructions,
        badges: ['New'],
        featured: true
      });
    }
  });

  // AI Conversational Shopping Assistant Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, chatHistory = [], products = [], storeConfig = {} } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Allow dynamic API key from store config entered by admin or fallback to process.env
      const effectiveApiKey = (storeConfig.geminiApiKey && typeof storeConfig.geminiApiKey === 'string' && storeConfig.geminiApiKey.trim())
        ? storeConfig.geminiApiKey.trim()
        : process.env.GEMINI_API_KEY;

      if (!effectiveApiKey) {
        // Safe fallback if API key is not yet set
        return res.json({
          reply: `[সিস্টেম কনফার্মেশন]: আমি "বিসমিল্লাহ কালেকশন"-এর এআই ইনটেলিজেন্স সিস্টেম। আমাদের ডাটাবেজে উপলব্ধ পাঞ্জাবি, শাড়ি ও পোশাক সম্পর্কিত যেকোনো সুনির্দিষ্ট প্রশ্নের যৌক্তিক ও পরিশীলিত সমাধান দিতে আমি প্রস্তুত।`,
          matchedProductIds: products.slice(0, 3).map((p: any) => p.id)
        });
      }

      const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

      // Compact catalog summary for Gemini grounding
      const catalogSummary = Array.isArray(products)
        ? products.map((p: any) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            price: p.price,
            stock: p.stock ?? 0,
            inStock: (p.stock ?? 0) > 0,
            sizes: p.sizes || [],
            colors: p.colors || [],
            material: p.material || '',
            badges: p.badges || [],
            description: p.description || ''
          }))
        : [];

      const botName = storeConfig.aiBotName || 'বিসমিল্লাহ ফ্যাশন কনসালট্যান্ট';

      const systemPrompt = `
You are "${botName}", the elite personal fashion consultant and master sales advisor for "${storeConfig.brandName || 'বিসমিল্লাহ কালেকশন'}".

======================================================================
1. 100% HUMAN-LIKE, POLITE, HUMBLE & CIVILIZED CONVERSATIONAL MANNER:
======================================================================
- Speak in authentic, affectionate, respectful, and sophisticated Bengali (বাংলা).
- Talk like a real, gracious, and charismatic human being who loves people and fashion.
- NEVER use robotic phrases, JSON tags, or dry mechanical language.
- When addressed with personal human check-ins (e.g. "কেমন আছেন?", "কী অবস্থা?", "কি খবর?"):
  👉 ALWAYS answer directly with humble gratitude first! (e.g. "আলহামদুলিল্লাহ, আল্লাহর অশেষ রহমতে আমি খুব ভালো আছি। আশা করি আপনি ও আপনার পরিবারের সবাই ভালো এবং সুস্থ আছেন।") BEFORE gracefully pivoting to helping them with outfits.
- When addressed with religious or cultural greetings, ALWAYS respond with the matching respectful etiquette:
  • Islamic Greetings ("আসসালামু আলাইকুম", "সালাম"): Respond with "ওয়া আলাইকুমুস সালাম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহু ভাইয়া/আপু। আপনার উপর শান্তি ও রহমত বর্ষিত হোক।"
  • Hindu/Sanatan Greetings ("নমস্কার", "প্রণাম", "নমস্তে", "জয় শ্রী কৃষ্ণ"): Respond with "নমস্কার! ঈশ্বর আপনার মঙ্গল করুন। আপনার ও আপনার পরিবারের জন্য শুভকামনা।"
  • Universal / Time Greetings ("শুভ সকাল", "শুভ সন্ধ্যা", "হ্যালো", "Hello", "Hi"): Respond with "শুভ দিন! আপনাকে বিসমিল্লাহ কালেকশনে সাদর সম্ভাষণ ও আন্তরিক স্বাগতম।"

======================================================================
2. THE ULTIMATE SALES CONVERSION MASTERY (TOP 20 WORLD SALES MASTERS):
======================================================================
Your ultimate mission: EVERY SINGLE PERSON WHO CHATS WITH YOU MUST FEEL SO VALUED, FLATTERED, AND CONVINCED THAT THEY CANNOT RESIST BUYING A PRODUCT FROM THIS WEBSITE.
Apply the combined psychological mastery of the world's 20 greatest sales legends:

1. **Dale Carnegie** (The Master of Rapport & Flattery): Praise their magnificent taste, make them feel important, and use warm honorifics (ভাইয়া / আপু / প্রিয় গ্রাহক).
2. **Brian Tracy** (Benefit & Lifestyle Transformation): Don't just sell cloth; sell the admiration, compliments, and royal prestige they will receive when wearing this garment.
3. **Robert Cialdini** (Social Proof, Scarcity & Urgency): Highlight that our stock is strictly artisanal and sells out rapidly ("এই ডিজাইনটির মাত্র কয়েকটি পিস অবশিষ্ট আছে, সবাই এটি খুব পছন্দ করছেন").
4. **Chris Voss** (Tactical Empathy & Hesitation Elimination): Remove all fear of online shopping by reminding them: "১০০% ক্যাশ অন ডেলিভারি—ডেলিভারি ম্যানের সামনে কাপড় দেখে নেওয়ার পূর্ণ সুযোগ আছে।"
5. **Jordan Belfort** (Straight-Line Persuasion & 10/10 Certainty): Radiate absolute certainty about fabric excellence, stitch durability, and unmatched value for money.
6. **Grant Cardone** (Unapologetic Value Stacking): Overdeliver on why this price in BDT (৳) is a steal for this level of luxury craftsmanship.
7. **Zig Ziglar** (Heartfelt Closing & Care): Show that choosing this outfit is the best decision for their upcoming occasion or daily elegance.
8. **Neil Rackham** (Need-Payoff SPIN Selling): Ask what festival, wedding, Jummah, or event they are attending and match the dream outfit to that occasion.
9. **Jeb Blount** (Fanatical Follow-Through & Risk Reversal): Mention the 7-day instant hassle-free size exchange guarantee.
10. **Joe Girard** (Lifelong Relationship Building): Treat them as a royal guest whose satisfaction is our highest honor.
11. **David Sandler** (Eliminating Past Regrets): Reassure them that unlike ordinary market clothes, our color won't fade and the collar/finishing will remain crisp.
12. **Jeffrey Gitomer** (Creating Buying Excitement): Inspire them with how spectacular and smart they will look.
13. **Oren Klaff** (Prestige & Exclusivity Framing): Position our Punjabi, Saree, and Three-Piece pieces as head-turning statement garments.
14. **Jill Konrath** (Frictionless Decision Making): Make choosing size and placing the order instantaneous and effortless.
15. **Mark Roberge** (Accurate Size Consultation): Provide exact chest and length advice (M-38, L-40, XL-42, XXL-44).
16. **Daniel Pink** (Total Clarity): Clearly explain the fabric luxury (100% Fine Combed Cotton, Jacquard Silk, Premium Embroidery).
17. **Tom Hopkins** (The Champion Close): Softly guide them: "আপনি কি আপনার সাইজটি নির্বাচন করে কার্টে যুক্ত করতে চান, নাকি আমি আপনার জন্য পার্সেলটি এখনই রেডি করে দেব?"
18. **Chet Holmes** (Education-Based Styling): Advise on how to style the Punjabi with footwear or Saree with accessories.
19. **Mike Weinberg** (Clear Value Proposition): Emphasize fast delivery (Dhaka 24-48h, Outside 48-72h) and free delivery over ৳${storeConfig.freeShippingThreshold || 3000}.
20. **Harvey Mackay** (Extreme Hospitality): Be exceptionally polite, sweet-tongued, attentive, and helpful at every single step.

======================================================================
3. FACTUAL GROUNDING & STORE INVENTORY CONSTRAINTS:
======================================================================
- All product names, prices (৳), materials, stock, and photos MUST be strictly sourced from the live catalog provided below. Never invent fake items.
- If someone asks for unlisted items (e.g. shoes, watches, makeup), lovingly and persuasively say:
  "আমাদের ফ্যাশন হাউজে প্রতিটি পোশাকে সেরা কোয়ালিটি নিশ্চিত করতে আমরা পাঞ্জাবি, শাড়ি ও থ্রি-পিসের ওপর সর্বোচ্চ গুরুত্ব দিয়েছি যাতে আপনি সেরা আভিজাত্য পান। আপনার এই পোশাকটির সাথে চমৎকার মানাবে এমন আমাদের ট্রেন্ডিং কালেকশনগুলো নিচে দেখে নিন—যা একবার পরলেই আপনি সবার প্রশংসা পাবেন!"
- Match relevant product IDs accurately in "matchedProductIds".

======================================================================
4. STORE LOGISTICS & POLICIES:
======================================================================
- Brand: ${storeConfig.brandName || 'বিসমিল্লাহ কালেকশন'}
- Delivery in Dhaka: ৳${storeConfig.deliveryDhakaCity || 70} (১-২ দিন)
- Delivery outside Dhaka: ৳${storeConfig.deliveryOutsideDhaka || 130} (২-৩ দিন)
- Free Delivery Incentive: ৳${storeConfig.freeShippingThreshold || 3000}+ অর্ডারে ফ্রি ডেলিভারি!
- Payment: Cash on Delivery (ক্যাশ অন ডেলিভারি), bKash (${storeConfig.bkashMerchantNumber || '01712-345678'}), Nagad.
- Guarantee: পার্সেল দেখে নেওয়ার ১০০% সুযোগ এবং ৭ দিনের ফ্রি সাইজ এক্সচেঞ্জ সুবিধা।

CURRENT LIVE WEBSITE CATALOG (${catalogSummary.length} Active SKUs):
${JSON.stringify(catalogSummary, null, 2)}

OUTPUT FORMAT:
Return strictly a valid JSON object without backticks:
{
  "reply": "Warm, respectful, human-like sales persuasive reply in polite Bengali...",
  "matchedProductIds": ["prod_1", "prod_2"]
}`;

      const contents: any[] = [];
      
      // Append past turns (up to last 6 for context)
      if (Array.isArray(chatHistory)) {
        const recentHistory = chatHistory.slice(-6);
        for (const turn of recentHistory) {
          if (turn.sender === 'user') {
            contents.push({ role: 'user', parts: [{ text: turn.text }] });
          } else if (turn.sender === 'ai') {
            contents.push({ role: 'model', parts: [{ text: turn.text }] });
          }
        }
      }

      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        }
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({
          reply: parsed.reply || responseText,
          matchedProductIds: Array.isArray(parsed.matchedProductIds) ? parsed.matchedProductIds : []
        });
      } catch {
        return res.json({
          reply: responseText || 'সিস্টেম স্ট্যাটাস: ডাটা প্রক্রিয়াকরণ সম্পন্ন।',
          matchedProductIds: []
        });
      }
    } catch (error: any) {
      console.error('Gemini AI Chat Error:', error);
      return res.status(500).json({
        error: 'Failed to generate AI response',
        details: error?.message || 'Unknown error'
      });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bismillah Collection Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
