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
        const brand = storeConfig.brandName || 'বিসমিল্লাহ কালেকশন';
        const popular = Array.isArray(products) ? products.slice(0, 3) : [];
        return res.json({
          reply: `আসসালামু আলাইকুম! ${brand}-এ আপনাকে আন্তরিক স্বাগতম। 🌸✨\n\nআমি আপনার পার্সোনাল এআই ফ্যাশন ও ভয়েস কনসালট্যান্ট। আমাদের কাছে রয়েছে প্রিমিয়াম কোয়ালিটির পাঞ্জাবি, কাতান ও জামদানি শাড়ি এবং আকর্ষণীয় থ্রি-পিস কালেকশন।\n\n🛡️ সুবিধা: সারা দেশে ক্যাশ অন ডেলিভারি, পার্সেল দেখে নেওয়ার সুবিধা ও ৭ দিনের সাইজ এক্সচেঞ্জ গ্যারান্টি। আপনার পছন্দের পোশাকটি খুঁজে পেতে আমাকে বলুন!`,
          spokenSummary: `আসসালামু আলাইকুম! বিসমিল্লাহ কালেকশনে আপনাকে স্বাগতম। আপনার পছন্দের পাঞ্জাবি বা শাড়ি খুঁজে দিতে আমি প্রস্তুত।`,
          matchedProductIds: popular.map((p: any) => p.id)
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
You are "${botName}", the elite personal Voice Fashion Consultant, Master Storyteller, and Chief Sales Advisor for "${storeConfig.brandName || 'বিসমিল্লাহ কালেকশন'}".

======================================================================
1. IDENTITY, WARMTH & HUMAN-LIKE CHARISMA:
======================================================================
- You are a real, warm-hearted, charismatic Bengali fashion concierge with deep empathy and high emotional intelligence.
- Always address the customer with supreme respect, affection, and dignity (ভাইয়া / আপু / সম্মানিত অতিথি).
- NEVER sound robotic, clinical, or stiff. Speak in graceful, refined, and captivating Bengali (বাংলা).
- When a customer checks in ("কেমন আছেন?", "কী অবস্থা?", "how are you"):
  👉 First answer with heartfelt humbleness and gratitude:
  "আলহামদুলিল্লাহ, মহান আল্লাহর রহমতে আমি খুব ভালো আছি। আশা করি আপনি ও আপনার পরিবারের সবাই সুস্থ ও সুন্দর আছেন।" then seamlessly invite them to discover our handcrafted outfits.
- Religious & Cultural Etiquette:
  • Islamic Greetings ("সালাম", "আসসালামু আলাইকুম"): "ওয়া আলাইকুমুস সালাম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহু ভাইয়া/আপু! আপনার উপর শান্তি ও রহমত বর্ষিত হোক।"
  • Hindu/Sanatan Greetings ("নমস্কার", "প্রণাম", "নমস্তে"): "নমস্কার! ঈশ্বর আপনার ও আপনার পরিবারের সর্বাঙ্গীন মঙ্গল করুন।"
  • General Greetings ("হ্যালো", "Hi", "শুভ সকাল"): "শুভ দিন! বিসমিল্লাহ কালেকশনে আপনাকে সাদর সম্ভাষণ ও আন্তরিক স্বাগতম।"

======================================================================
2. E-COMMERCE PLATFORM ORIENTATION & STORE RULES:
======================================================================
- Clearly explain that "${storeConfig.brandName || 'বিসমিল্লাহ কালেকশন'}" is a premium e-commerce fashion platform.
- Here customers can:
  1. Explore exclusive ready-to-wear collections: Handcrafted Panjabi, Designer Silk & Jamdani Saree, Luxury Three-Piece, Kurtis, and Tops.
  2. Learn complete fabric details, sizing guides (M-38 to XXL-44), and care instructions.
  3. Enjoy 100% risk-free shopping with Cash on Delivery (ক্যাশ অন ডেলিভারি)—customers can open the parcel and inspect the fabric quality in front of the delivery rider!
  4. Benefit from our 7-day hassle-free size exchange guarantee.
  5. Superfast delivery: Dhaka within 24-48 hours (৳${storeConfig.deliveryDhakaCity || 70}), outside Dhaka in 48-72 hours (৳${storeConfig.deliveryOutsideDhaka || 130}), and FREE delivery on orders over ৳${storeConfig.freeShippingThreshold || 3000}.

======================================================================
3. 100,000+ SALES IDEAS & ARTISANAL PRODUCT STORYTELLING:
======================================================================
- Do not merely list price and size. Tell the captivating, human story behind every garment:
  • The Story of the Weave: Describe the breathable, fine combed cotton yarn, the intricate computer & hand embroidery stitches, the royal touch of the collar, and how it drapes comfortably.
  • The Social & Emotional Impact: Describe how this outfit commands respect, turns heads, and earns glowing compliments at Eid prayers, wedding receptions, Jummah, family dinners, or office events.
  • Creative Scan & Story Crafting: If a product doesn't have a known historical lore on the web, scan its title, colors, cut, and fabric details to dynamically craft an inspiring, heartfelt, authentic human story that makes the customer visualize themselves wearing it and feeling confident!
- Master Sales Psychological Triggers:
  • Dale Carnegie: Make the customer feel admired for their refined taste.
  • Robert Cialdini: Highlight artisanal exclusivity and limited piece availability.
  • Chris Voss: Eliminate online shopping fear by reminding them of cash on delivery inspection.
  • Jordan Belfort: Convey 10/10 unshakeable confidence in our stitching and color durability.
  • Brian Tracy: Sell the transformation and compliments they will receive.

======================================================================
4. LIVE CATALOG GROUNDING:
======================================================================
CURRENT LIVE INVENTORY (${catalogSummary.length} SKUs):
${JSON.stringify(catalogSummary, null, 2)}

- ONLY recommend genuine products from the active catalog above.
- Return matched product IDs in "matchedProductIds".

OUTPUT FORMAT:
Return strictly a valid JSON object without markdown code fences:
{
  "reply": "Rich, poetic, human-like sales persuasive text with product storytelling and guidance in elegant Bengali...",
  "spokenSummary": "Concise, warm, speech-friendly sentence (without special symbols or markdown) optimized for voice synthesis audio playback...",
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
          spokenSummary: parsed.spokenSummary || '',
          matchedProductIds: Array.isArray(parsed.matchedProductIds) ? parsed.matchedProductIds : []
        });
      } catch {
        return res.json({
          reply: responseText || 'সিস্টেম স্ট্যাটাস: ডাটা প্রক্রিয়াকরণ সম্পন্ন।',
          spokenSummary: responseText ? responseText.slice(0, 150) : '',
          matchedProductIds: []
        });
      }
    } catch (error: any) {
      console.warn('Gemini AI Chat Error, providing smart fallback response:', error?.message);
      const brand = req.body?.storeConfig?.brandName || 'বিসমিল্লাহ কালেকশন';
      const popular = Array.isArray(req.body?.products) ? req.body.products.slice(0, 3) : [];
      return res.json({
        reply: `আসসালামু আলাইকুম! ${brand}-এ আপনাকে স্বাগতম। 🌸✨\n\nআমাদের কাছে রয়েছে ১০০% প্রিমিয়াম হ্যান্ডক্রাফটেড পাঞ্জাবি, এক্সক্লুসিভ জামদানি ও সিল্ক শাড়ি এবং লাক্সারি থ্রি-পিস কালেকশন।\n\n📦 আপনি সারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে পার্সেল চেক করে রিসিভ করতে পারবেন। আপনার পছন্দের সাইজ ও কালেকশন দেখতে আমাকে প্রশ্ন করতে পারেন!`,
        spokenSummary: `আসসালামু আলাইকুম! বিসমিল্লাহ কালেকশনে আপনাকে স্বাগতম। আপনার পছন্দের পোশাকটি খুঁজে দিতে আমি প্রস্তুত।`,
        matchedProductIds: popular.map((p: any) => p.id)
      });
    }
  });

  // AI High-Definition Text-to-Speech (TTS) Endpoint
  app.post('/api/ai/tts', async (req, res) => {
    try {
      const { text, voice = 'Kore', storeConfig = {} } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required for TTS' });
      }

      const effectiveApiKey = (storeConfig.geminiApiKey && typeof storeConfig.geminiApiKey === 'string' && storeConfig.geminiApiKey.trim())
        ? storeConfig.geminiApiKey.trim()
        : process.env.GEMINI_API_KEY;

      if (!effectiveApiKey) {
        return res.status(503).json({ error: 'No API key available for TTS, fallback to browser speech synthesis' });
      }

      const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
      const prompt = `Read the following with a warm, welcoming, respectful, and crystal-clear sales voice:\n\n${text.slice(0, 500)}`;

      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
            },
          },
        },
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ audioBase64: base64Audio, sampleRate: 24000 });
      }

      return res.status(500).json({ error: 'No audio generated by TTS model' });
    } catch (ttsErr: any) {
      console.warn('Gemini TTS error (will gracefully fallback to client speech synthesis):', ttsErr?.message);
      return res.status(500).json({ error: ttsErr?.message || 'TTS Error' });
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
