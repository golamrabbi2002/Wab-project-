import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Ensure persistent public upload directory exists
  const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Serve uploads statically with high-performance caching
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads'), {
    maxAge: '7d',
    immutable: true
  }));

  // Helper to instantiate Gemini client with proper telemetry
  function createGeminiClient(apiKey: string): GoogleGenAI {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Dedicated High-Resolution Image Cloud Upload Endpoint (for Phone & PC)
  app.post('/api/upload/image', async (req, res) => {
    try {
      const { image, filename } = req.body;
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: 'No image data provided' });
      }

      // If already a hosted URL, return as-is
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return res.json({ success: true, url: image, sizeKb: 0 });
      }

      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!matches || !matches[1] || !matches[2]) {
        return res.status(400).json({ error: 'Invalid Base64 Data URL format' });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      let ext = 'webp';
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
      else if (mimeType.includes('gif')) ext = 'gif';
      else if (mimeType.includes('svg')) ext = 'svg';

      const prefix = (filename || 'prod').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
      const uniqueFilename = `${prefix}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
      const targetFilePath = path.join(UPLOADS_DIR, uniqueFilename);

      await fs.promises.writeFile(targetFilePath, buffer);

      const publicUrl = `/uploads/products/${uniqueFilename}`;
      const sizeKb = Math.round(buffer.length / 1024);

      console.log(`[Upload Cloud] Saved high-res image: ${publicUrl} (${sizeKb} KB)`);

      return res.json({
        success: true,
        url: publicUrl,
        sizeKb,
        mimeType
      });
    } catch (uploadErr: any) {
      console.error('Image Cloud Upload Error:', uploadErr);
      return res.status(500).json({ error: uploadErr?.message || 'Failed to save uploaded image' });
    }
  });

  // --- Universal Intelligent Product Catalog Engine ---
  interface ProductCatalogInfo {
    category: string;
    sizes: string[];
    skuPrefix: string;
    material: string;
    subtitle: string;
    descriptionSnippet: string;
    careInstructions: string;
  }

  function resolveUniversalProductInfo(rawTitle: string, hintCategory?: string): ProductCatalogInfo {
    const text = (rawTitle || '').toLowerCase();
    const hint = (hintCategory || '').toLowerCase();

    // 1. Bucket & Household plastic/home living items (Explicit user request)
    if (text.includes('বালতি') || text.includes('bucket') || text.includes('মগ') || text.includes('bowl') || text.includes('ঝুড়ি') || text.includes('ঝুড়ি') || text.includes('প্লাস্টিক') || hint.includes('household') || hint.includes('home')) {
      const isBucket = text.includes('বালতি') || text.includes('bucket');
      return {
        category: 'Household & Living',
        sizes: ['স্ট্যান্ডার্ড (১৬ লিটার)', 'বড় (২০ লিটার)'],
        skuPrefix: 'BLT',
        material: 'ফুড-গ্রেড ভার্জিন আনব্রেকেবল প্লাস্টিক ও অ্যালয় স্টিল হ্যান্ডেল',
        subtitle: isBucket ? 'হেভি-ডিউটি মজবুত গ্রিপ ও দীর্ঘস্থায়ী কোয়ালিটি' : 'টেকসই গৃহস্থালী সামগ্রী',
        descriptionSnippet: isBucket
          ? `${rawTitle || 'প্রিমিয়াম প্লাস্টিক বালতি'} — দৈনন্দিন গৃহস্থালী ব্যবহারে সর্বোচ্চ স্থায়িত্ব নিশ্চিত করতে তৈরি। ১০০% ভার্জিন প্লাস্টিক মেটেরিয়াল হওয়ায় সহজে ভাঙে না এবং মরিচারোধী অ্যালয় মেটাল হ্যান্ডেল ভারী পানি বহনে দেয় মসৃণ ও আরামদায়ক গ্রিপ।`
          : `${rawTitle || 'প্রিমিয়াম গৃহস্থালী পণ্য'} — উন্নত মেটেরিয়ালে প্রস্তুত টেকসই ও ব্যবহারবান্ধব হোম এক্সেসরিজ।`,
        careInstructions: 'ব্যবহারের পর পরিষ্কার পানি দিয়ে ধুয়ে রাখুন। অতিরিক্ত তাপে রাখবেন না।'
      };
    }

    // 2. Footwear / Shoes
    if (text.includes('জুতো') || text.includes('জুতা') || text.includes('shoe') || text.includes('sneaker') || text.includes('sandal') || text.includes('loafer') || hint.includes('footwear')) {
      return {
        category: 'Footwear',
        sizes: ['39', '40', '41', '42', '43', '44'],
        skuPrefix: 'SHOE',
        material: 'প্রিমিয়াম পিইউ লেদার / ব্রিদেবল মেশ ও অ্যান্টি-স্লিপ রাবার সোল',
        subtitle: 'স্টাইলিশ লুক, সফট কুশনিং ও দীর্ঘস্থায়ী আরামদায়ক ফিটিং',
        descriptionSnippet: `${rawTitle || 'প্রিমিয়াম ফুটওয়্যার'} — প্রতিদিনের হাঁটাচলা ও ফরমাল বা ক্যাজুয়াল আউটফিটের সাথে মানানসই। হাই-গ্রিপ অ্যান্টি-স্লিপ সোল প্রতিটি কদমে দেয় আত্মবিশ্বাস।`,
        careInstructions: 'শুকনো নরম কাপড় দিয়ে মুছে রাখুন। সরাসরি পানিতে বেশিক্ষণ ভিজিয়ে রাখবেন না।'
      };
    }

    // 3. Saree
    if (hint === 'saree' || hint === 'shari' || text.includes('শাড়ি') || text.includes('শাড়ি') || text.includes('saree') || text.includes('জামদানি') || text.includes('বেনারসি') || text.includes('কাতান')) {
      return {
        category: 'Saree',
        sizes: ['Free Size (১২ হাত + ব্লাউজ পিস)'],
        skuPrefix: 'SAR',
        material: 'প্রিমিয়াম সফট সিল্ক / ঐতিহ্যবাহী জামদানি উইভিং ও গর্জিয়াস জরি আঁচল',
        subtitle: 'ঐতিহ্যবাহী নিখুঁত বুনন ও রাজকীয় আঁচল ডিজাইন',
        descriptionSnippet: `${rawTitle || 'এক্সক্লুসিভ ডিজাইনার শাড়ি'} — প্রতিটি উৎসবে আপনার রূপ ও আভিজাত্যকে আরও মনমাতানো করে তুলতে তৈরি এই ঐতিহ্যবাহী শাড়ি। প্রিমিয়াম সিল্ক ও সূক্ষ্ম সুতার বুননে বোনা, সাথে পাচ্ছেন ম্যাচিং ব্লাউজ পিস।`,
        careInstructions: 'ড্রাই ক্লিন ওয়াশ আবশ্যক। সরাসরি রোদে না শুকিয়ে ছায়ায় শুকান।'
      };
    }

    // 4. Three-Piece
    if (hint.includes('three') || text.includes('থ্রি-পিস') || text.includes('থ্রিপিস') || text.includes('কামিজ') || text.includes('three piece')) {
      return {
        category: 'Three-Piece',
        sizes: ['M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
        skuPrefix: 'THR',
        material: 'লাক্সারি সুইস লন / ডিজিটাল প্রিন্ট কটন কামিজ, কমফোর্ট সেলোয়ার ও গর্জিয়াস ওড়না',
        subtitle: 'ডিজাইনার ডিজিটাল প্রিন্ট ও গর্জিয়াস এমব্রয়ডারি কারুকাজ',
        descriptionSnippet: `${rawTitle || 'লাক্সারি থ্রি-পিস কালেকশন'} — আধুনিক ফ্যাশন ও রুচিশীলতার অনন্য নিদর্শন। সেরা মানের ফেব্রিক ও দীর্ঘস্থায়ী রঙের নিশ্চয়তা সহ আকর্ষণীয় ডিজাইনের কামিজ, আরামদায়ক সেলোয়ার ও ওড়নার পারফেক্ট কম্বিনেশন।`,
        careInstructions: 'হালকা ডিটারজেন্টে নরম ওয়াশ। কড়া রোদে বেশিক্ষণ রাখবেন না।'
      };
    }

    // 5. Kurtis
    if (hint.includes('kurti') || text.includes('কুর্তি') || text.includes('kurti') || text.includes('টিউনিক')) {
      return {
        category: 'Kurtis',
        sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
        skuPrefix: 'KRT',
        material: '১০০% প্রিমিয়াম রেয়ন কটন / সফট জর্জেট',
        subtitle: 'স্মার্ট ও আকর্ষণীয় আধুনিক ক্যাজুয়াল আউটফিট',
        descriptionSnippet: `${rawTitle || 'স্টাইলিশ ডিজাইনার কুর্তি'} — ক্যাজুয়াল আড্ডা, অফিস কিংবা ভার্সিটির জন্য আরামদায়ক ও নজরকাড়া কুর্তি। অত্যন্ত সফট এবং ব্রিদেবল ফেব্রিকে তৈরি।`,
        careInstructions: 'মেশিন বা হ্যান্ড ওয়াশ উপযোগী। হালকা তাপে আয়রন করুন।'
      };
    }

    // 6. Tops / Shirts
    if (hint.includes('top') || text.includes('শার্ট') || text.includes('shirt') || text.includes('টি-শার্ট') || text.includes('polo')) {
      return {
        category: 'Tops',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        skuPrefix: 'TOP',
        material: '১০০% পিওর ফাইন অক্সফোর্ড কটন',
        subtitle: 'স্মার্ট ক্যাজুয়াল ও অফিসিয়াল রেগুলার ফিট',
        descriptionSnippet: `${rawTitle || 'প্রিমিয়াম ক্যাজুয়াল শার্ট'} — স্মার্ট ও আত্মবিশ্বাসী লুক দিতে নিখুঁত সেলাই ও প্রিমিয়াম ফেব্রিকে প্রস্তুত।`,
        careInstructions: 'মেশিন ওয়াশ উপযোগী। স্বাভাবিক রোদে শুকান।'
      };
    }

    // 7. Panjabi
    if (hint.includes('panjabi') || text.includes('পাঞ্জাবি') || text.includes('পাঞ্জাবী') || text.includes('panjabi') || text.includes('punjabi') || text.includes('kabli')) {
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

    // 8. General / Accessories / Other Goods
    return {
      category: hint && hint !== 'auto' ? hint : 'General',
      sizes: ['Standard / এক সাইজ'],
      skuPrefix: 'GEN',
      material: 'উচ্চমানের টেকসই ও প্রিমিয়াম উপাদান',
      subtitle: 'সেরা মান ও আধুনিক কার্যকারিতার নিশ্চয়তা',
      descriptionSnippet: `${rawTitle || 'প্রিমিয়াম প্রডাক্ট'} — আধুনিক জীবনযাত্রার উপযোগী গুণগত মান ও দীর্ঘস্থায়ী স্থায়িত্বের নিশ্চয়তা নিয়ে তৈরি এই পণ্যটি আপনাকে দেবে সেরা অভিজ্ঞতা। ক্যাশ অন ডেলিভারিতে চেক করে নেওয়ার সুবিধা।`,
      careInstructions: 'পরিষ্কার ও শুষ্ক স্থানে সংরক্ষণ করুন।'
    };
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

      const titleClean = (title || '').trim();
      const basePrice = Math.max(0, Number(price) || 0);
      const calculatedOrigPrice = basePrice > 0 ? Math.round(basePrice * 1.25) : 0;
      const templateInfo = resolveUniversalProductInfo(titleClean, category);

      const effectiveApiKey = (storeConfig.geminiApiKey && typeof storeConfig.geminiApiKey === 'string' && storeConfig.geminiApiKey.trim())
        ? storeConfig.geminiApiKey.trim()
        : process.env.GEMINI_API_KEY;

      if (!effectiveApiKey) {
        // Fallback response structure using universal deterministic knowledge base
        const cleanSku = `${templateInfo.skuPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
        return res.json({
          title: titleClean || templateInfo.subtitle,
          subtitle: templateInfo.subtitle,
          category: templateInfo.category,
          price: basePrice || 1250,
          originalPrice: calculatedOrigPrice || 1550,
          sku: cleanSku,
          sizes: templateInfo.sizes,
          stock: 25,
          description: `${templateInfo.descriptionSnippet}\n\nপ্রিমিয়াম ফিনিশিং এবং ক্যাশ অন ডেলিভারিতে পার্সেল চেক করে দেখে নেওয়ার শতভাগ সুযোগ।`,
          material: templateInfo.material,
          careInstructions: templateInfo.careInstructions,
          badges: ['New', 'Bestseller'],
          featured: true,
        });
      }

      const ai = createGeminiClient(effectiveApiKey);
      const promptParts: any[] = [];

      // Add image parts if provided (supports Base64 and local uploaded files)
      if (Array.isArray(images) && images.length > 0) {
        images.slice(0, 3).forEach((imgStr: string) => {
          if (typeof imgStr === 'string') {
            if (imgStr.startsWith('data:image/')) {
              const matches = imgStr.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
              if (matches && matches[1] && matches[2]) {
                promptParts.push({
                  inlineData: {
                    mimeType: matches[1],
                    data: matches[2]
                  }
                });
              }
            } else if (imgStr.startsWith('/uploads/')) {
              try {
                const localPath = path.join(process.cwd(), 'public', imgStr);
                if (fs.existsSync(localPath)) {
                  const buffer = fs.readFileSync(localPath);
                  const ext = path.extname(localPath).toLowerCase().replace('.', '');
                  const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/webp';
                  promptParts.push({
                    inlineData: {
                      mimeType: mime,
                      data: buffer.toString('base64')
                    }
                  });
                }
              } catch (readErr) {
                console.warn('Could not read local uploaded image for AI inspection:', readErr);
              }
            }
          }
        });
      }

      const systemInstruction = `
You are an expert universal e-commerce merchandiser, product vision analyzer, and professional copywriter for "${storeConfig.brandName || 'বিসমিল্লাহ কালেকশন'}".
You analyze product images and merchant prompts for ANY and ALL categories of products:
- Household & Living (e.g. buckets/বালতি, plasticware, cookware, mops, kitchenware, home storage)
- Fashion & Garments (e.g. Panjabi, Saree, Three-Piece, Kurtis, Shirts, T-Shirts, Pants, Winter wear)
- Footwear (e.g. Sneakers, Formal Shoes, Loafers, Sandals)
- Accessories (e.g. Bags, Belts, Watches, Jewelry, Wallets)
- Electronics & Gadgets (e.g. Irons, Lights, Chargers, Blenders)
- General & Departmental goods.

CRITICAL REAL-TIME OBJECT RECOGNITION RULES:
1. Examine the provided photo(s) with high visual precision. Identify the EXACT real-world object:
   - If the photo shows a plastic bucket (বালতি), tub, or water container:
     * category MUST be "Household & Living" or "গৃহস্থালী সামগ্রী" (NEVER clothing, NEVER Panjabi!).
     * title: If the merchant provided a title, polish it. If merchant title was empty/omitted, GENERATE an authentic Bengali title like "প্রিমিয়াম হেভি-ডিউটি প্লাস্টিক বালতি (১৬ লিটার)" or based on visual appearance.
     * material: "ফুড-গ্রেড ভার্জিন প্লাস্টিক ও অ্যালয় স্টিল হ্যান্ডেল" or real plastic/steel composition.
     * sizes: Capacity/volume measurements like ["১২ লিটার", "১৬ লিটার", "২০ লিটার"] or ["স্ট্যান্ডার্ড (১৬ লিটার)"] (NEVER clothing sizes like M/L/XL for a bucket!).
     * careInstructions: Cleaning and handling instructions for home plasticware.
   - If the photo shows Footwear:
     * category: "Footwear", sizes: ["39", "40", "41", "42", "43"].
   - If the photo shows clothing:
     * visually differentiate Saree (draped fabric), Panjabi (collar placket tunic), Three-Piece, Kurti, or Western shirt.
   - For ANY other object (iron, clock, sunglasses, perfume, etc.):
     * name the exact object truthfully, choose an accurate category, and write realistic Bengali specifications.
2. Custom title ("${titleClean}") is OPTIONAL:
   - If the merchant gave a title, respect and polish it.
   - If the merchant left the title blank or wrote a generic note, GENERATE a high-converting, accurate Bengali product title directly from the photo.
3. Realistic Pricing in BDT (৳): If merchant gave price (${basePrice}), use it; otherwise provide a realistic retail price.
4. Output MUST be strictly valid JSON without markdown code fences.

OUTPUT SCHEMA:
{
  "title": "Precise, attractive Bengali product title",
  "subtitle": "Short Bengali subtitle highlighting main USP",
  "category": "Household & Living | Panjabi | Saree | Three-Piece | Kurtis | Tops | Bottoms | Footwear | Accessories | Electronics | General",
  "price": number,
  "originalPrice": number,
  "sku": "string (e.g. BLT-1029, SHOE-3012, PAN-4012)",
  "sizes": ["string"],
  "stock": number,
  "description": "Engaging 2-3 paragraph Bengali product description highlighting quality, utility, durability, and cash on delivery guarantee.",
  "material": "Specific authentic material in Bengali",
  "careInstructions": "Care & usage guidelines in Bengali",
  "badges": ["New", "Bestseller"],
  "featured": true
}`;

      promptParts.push({
        text: `Analyze the uploaded product image(s) or description. Merchant provided title: "${titleClean || '(Empty - please detect object from image)'}". Merchant price hint: ${basePrice > 0 ? `${basePrice} BDT` : 'Suggest realistic market price'}. Category hint: ${category || 'Auto-detect'}. Notes: ${notes || 'None'}. Return JSON.`
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
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
        const resolvedPrice = Number(parsed.price) > 0 ? Number(parsed.price) : (basePrice > 0 ? basePrice : 1250);
        const resolvedOrigPrice = Number(parsed.originalPrice) > resolvedPrice ? Number(parsed.originalPrice) : Math.round(resolvedPrice * 1.25);

        return res.json({
          title: parsed.title || titleClean || templateInfo.subtitle,
          subtitle: parsed.subtitle || templateInfo.subtitle,
          category: parsed.category || templateInfo.category,
          price: resolvedPrice,
          originalPrice: resolvedOrigPrice,
          sku: parsed.sku || `${templateInfo.skuPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
          sizes: (Array.isArray(parsed.sizes) && parsed.sizes.length > 0) ? parsed.sizes : templateInfo.sizes,
          stock: Number(parsed.stock) || 25,
          description: parsed.description || templateInfo.descriptionSnippet,
          material: parsed.material || templateInfo.material,
          careInstructions: parsed.careInstructions || templateInfo.careInstructions,
          badges: Array.isArray(parsed.badges) ? parsed.badges : ['New'],
          featured: typeof parsed.featured === 'boolean' ? parsed.featured : true
        });
      } catch (parseErr) {
        console.warn('Could not parse Gemini JSON, returning formatted template', parseErr);
        return res.json({
          title: titleClean || `প্রিমিয়াম ${templateInfo.category} কালেকশন`,
          subtitle: templateInfo.subtitle,
          category: templateInfo.category,
          price: basePrice || 1250,
          originalPrice: calculatedOrigPrice || 1550,
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
    } catch (err: any) {
      console.error('AI Product Generation Error:', err);
      const basePrice = Math.max(0, Number(req.body?.price) || 1250);
      const titleClean = (req.body?.title || '').trim();
      const templateInfo = resolveUniversalProductInfo(titleClean, req.body?.category);
      return res.json({
        title: titleClean || templateInfo.subtitle,
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

      const ai = createGeminiClient(effectiveApiKey);

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

      const ai = createGeminiClient(effectiveApiKey);
      const prompt = `Read the following with a warm, welcoming, respectful, and crystal-clear sales voice:\n\n${text.slice(0, 500)}`;

      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
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
