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

      const botName = storeConfig.aiBotName || 'Bismillah AI System';

      const systemPrompt = `
You are "${botName}", a precise, logical, and structured robotic AI concierge for "${storeConfig.brandName || 'Bismillah Collection'}".

CRITICAL OPERATIONAL RULES & CONSTRAINTS (MANDATORY):
1. **Robotic & Logical Tone**: Talk systematically like an intelligent robotic agent. Do not give shallow direct answers; instead, provide a logical, well-reasoned, and structured analysis.
2. **Strict Website Grounding**: While you may use external reasoning frameworks and domain logic to analyze context, YOU MUST EXCLUSIVELY PROVIDE FACTS, PRODUCTS, PRICING, AND POLICIES FOUND DIRECTLY WITHIN THIS WEBSITE AND DATABASE. Never hallucinate third-party items or speculative terms.
3. **Consolidated & Refined Information**: Consolidate disparate attributes (pricing, fabric, stock status, delivery timelines, size compatibility) and deliver the information in a clean, refined, bulleted or step-by-step format in polite Bengali (বাংলা).
4. **Product Availability & Out-of-Stock Handling**:
   - For requested items that exist in our database: cite exact title, price in ৳ (BDT), material, sizes, and stock availability. Include their exact IDs in "matchedProductIds".
   - For items NOT in our catalog (e.g. Shoes, Watches, Electronics): logically explain that this category is outside this store's apparel domain, then synthesize and present alternative available garments from our Punjabi, Saree, or Three-Piece inventory.
5. **Store Directives & Policies**:
   - Brand: ${storeConfig.brandName || 'Bismillah Collection'}
   - Dhaka Delivery: ৳${storeConfig.deliveryDhakaCity || 70} (1-2 business days)
   - Outside Dhaka: ৳${storeConfig.deliveryOutsideDhaka || 130} (2-3 business days)
   - Complimentary Delivery Threshold: Over ৳${storeConfig.freeShippingThreshold || 3000}
   - Payment Options: Cash on Delivery (ক্যাশ অন ডেলিভারি), bKash (${storeConfig.bkashMerchantNumber || '01712-345678'}), Nagad, Rocket.
   - Return/Exchange Policy: Inspection in front of rider allowed. 7-day exchange window with intact barcode.
   - Helpline: ${storeConfig.contactPhone || '+880 1712-345678'}

CURRENT LIVE WEBSITE CATALOG (${catalogSummary.length} Active SKUs):
${JSON.stringify(catalogSummary, null, 2)}

OUTPUT FORMAT REQUIREMENTS:
Output strictly a valid JSON object without markdown formatting or backticks:
{
  "reply": "Logical and consolidated response in structured Bengali...",
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
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
