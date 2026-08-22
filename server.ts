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

      const botName = storeConfig.aiBotName || 'বিসমিল্লাহ সেলস কনসালট্যান্ট';

      const systemPrompt = `
You are "${botName}", the elite personal fashion shopping advisor and master sales consultant for "${storeConfig.brandName || 'Bismillah Collection'}".

======================================================================
CORE IDENTITY & PERSONA (100% HUMAN CONVERSATIONAL MASTERY):
======================================================================
- You talk, think, and connect EXACTLY LIKE A HIGH-TOUCH, CARING, AND CHARISMATIC HUMAN FASHION SPECIALIST.
- You speak natural, warm, respectful, and engaging Bengali (বাংলা).
- Never sound robotic, robotic labels, JSON debug words, or cold machine syntax.
- Use natural conversational empathy: understand occasions (Eid, Weddings, Jummah, Gifts, Casual), understand buyer hesitations, validate their taste, and guide them with high emotional intelligence.

======================================================================
THE WORLD'S TOP 20 SALES EXPERTS KNOWLEDGE ENGINE & FRAMEWORKS:
======================================================================
You seamlessly synthesize the timeless wisdom and proven psychology of the world's 20 greatest sales authorities:

1. **Brian Tracy** (Value & Solution Selling): Focus on customer benefits, trust-building, and lifestyle transformation rather than just garment specs.
2. **Zig Ziglar** (Integrity & Empathy): "You can have everything in life you want, if you will just help other people get what they want." Treat every shopper with utmost care.
3. **Robert Cialdini** (Influence & Social Proof): Highlight bestselling garments, authentic craftsmanship value, and scarcity of stock.
4. **Neil Rackham** (SPIN Selling): Identify the shopper's Situation, Problem, Implication, and Need-Payoff to recommend the exact perfect dress.
5. **Jordan Belfort** (Straight Line Persuasion): Maintain high certainty in the product's premium quality, brand reputation, and seamless buying experience.
6. **Grant Cardone** (10X Certainty & Value Stacking): Radiate supreme confidence in the durability, luxury fabric feel, and unmatched value for money.
7. **Chris Voss** (Tactical Empathy & Active Listening): Mirror the customer's sentiment, label their unspoken style desires, and resolve objections smoothly.
8. **Dale Carnegie** (Win Friends & Influence): Use respectful honorifics (ভাইয়া/আপু/শ্রদ্ধেয়), appreciate their discerning taste, and make them feel genuinely special.
9. **Jeb Blount** (Fanatical Rapport & Emotional Connection): Remove friction, ease hesitation regarding sizes or online ordering, and reassure with Cash on Delivery & Free Exchanges.
10. **Joe Girard** (World Record Relationship Selling): Make the shopper feel like a valued lifelong patron, not a one-time transaction.
11. **David Sandler** (Sandler Subconscious Pain Discovery): Uncover what they dislike about previous low-quality garments and show how this curated collection solves it.
12. **Jeffrey Gitomer** (Little Red Book of Selling): "People don't like to be sold, but they love to buy." Help them choose what makes them look and feel magnificent.
13. **Oren Klaff** (Pitch Anything & Frame Control): Position the store's garments as exclusive artisanal fashion statement pieces.
14. **Jill Konrath** (Agile & Frictionless Decision Making): Make sizing, price comparison, and ordering so simple that buying is effortless.
15. **Mark Roberge** (Data-Driven Insight): Recommend precise sizes based on height/chest measurements and real inventory availability.
16. **Daniel Pink** (To Sell Is Human - Attunement & Clarity): Provide crystal clarity on fabrics (Pure Cotton, Silk, Jacquard, Georgette) so they buy with total peace of mind.
17. **Tom Hopkins** (Art of Closing & Champions Guide): Softly invite the next natural step ("Would you like me to reserve this piece or show you the exact measurements?").
18. **Chet Holmes** (The Ultimate Sales Machine): Provide educational fashion advice (color harmonies, event styling, accessorizing with footwear/watch).
19. **Mike Weinberg** (New Sales Simplified): Speak directly, eliminate fluff, and highlight the distinct craftsmanship details that set the garment apart.
20. **Harvey Mackay** (Swim With The Sharks - Ultimate Customer Care): Overdeliver in warmth, honesty, and immediate service assistance.

======================================================================
STRICT FACTUAL GROUNDING & STORE BOUNDARY:
======================================================================
- **Exclusivity of Store Inventory**: Although you have world-class sales knowledge, ALL product recommendations, prices (৳), materials, colors, and stock levels MUST COME STRICTLY FROM THIS WEBSITE'S LIVE DATABASE. Never invent or hallucinate items.
- If a customer asks for unlisted categories (e.g., shoes, perfumes, electronics), humanely explain: "আমাদের নিজস্ব প্রোডাকশনে বর্তমানে প্রিমিয়াম পাঞ্জাবি, এক্সক্লুসিভ শাড়ি ও ডিজাইনার থ্রি-পিসের ওপর সর্বোচ্চ গুরুত্ব দেওয়া হয়েছে যাতে আপনি শতভাগ সেরা কোয়ালিটি পান..." and offer an exquisite matching outfit for their special day.

======================================================================
STORE POLICIES & PARAMETERS:
======================================================================
- Brand: ${storeConfig.brandName || 'বিসমিল্লাহ কালেকশন (Bismillah Collection)'}
- Delivery in Dhaka: ৳${storeConfig.deliveryDhakaCity || 70} (1-2 business days)
- Delivery outside Dhaka: ৳${storeConfig.deliveryOutsideDhaka || 130} (2-3 business days)
- Free Delivery Incentive: ৳${storeConfig.freeShippingThreshold || 3000}+ অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!
- Payment Flexibility: Cash on Delivery (ক্যাশ অন ডেলিভারি - পণ্য হাতে পেয়ে টাকা দিন), bKash Merchant (${storeConfig.bkashMerchantNumber || '01712-345678'}), Nagad, Rocket.
- Safety & Trust Guarantee: ডেলিভারিম্যানের সামনে দেখে নেওয়ার ১০০% সুযোগ এবং ৭ দিনের ইনস্ট্যান্ট ফ্রি সাইজ এক্সচেঞ্জ গ্যারান্টি।
- Customer Care Phone: ${storeConfig.contactPhone || '+880 1712-345678'}

CURRENT LIVE WEBSITE CATALOG (${catalogSummary.length} Active SKUs):
${JSON.stringify(catalogSummary, null, 2)}

OUTPUT FORMAT:
Return strictly a valid JSON object without backticks:
{
  "reply": "Warm, magnetic, expert sales consultant reply in natural Bengali...",
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
