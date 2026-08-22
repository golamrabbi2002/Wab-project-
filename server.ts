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
