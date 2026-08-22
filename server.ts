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

      const ai = getAi();
      if (!ai) {
        // Safe fallback if API key is not yet set in environment
        return res.json({
          reply: `ধন্যবাদ আপনার বার্তার জন্য! আমি "বিসমিল্লাহ কালেকশন"-এর স্মার্ট এআই শপিং অ্যাসিস্ট্যান্ট। আমাদের পাঞ্জাবি, শাড়ি, ও থ্রি-পিস কালেকশন থেকে আপনার পছন্দের পোশাকটি বাছাই করতে পারি।`,
          matchedProductIds: products.slice(0, 3).map((p: any) => p.id)
        });
      }

      // Compact catalog summary for Gemini grounding
      const catalogSummary = Array.isArray(products)
        ? products.map((p: any) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            price: p.price,
            inStock: p.inStock !== false && (p.inventoryCount === undefined || p.inventoryCount > 0),
            sizes: p.sizes || [],
            colors: p.colors || [],
            description: p.description || ''
          }))
        : [];

      const systemPrompt = `
You are "Bismillah AI Concierge" (বিসমিল্লাহ এআই শপিং অ্যাসিস্ট্যান্ট), the intelligent, courteous, and highly knowledgeable conversational shopping assistant for "Bismillah Collection" (বিসমিল্লাহ কালেকশন) — Bangladesh's premier online fashion boutique.

Store Policies & Information:
- Brand Name: ${storeConfig.brandName || 'Bismillah Collection (বিসমিল্লাহ কালেকশন)'}
- Delivery in Dhaka: ৳${storeConfig.deliveryDhakaCity || 70} (1-2 business days)
- Delivery outside Dhaka: ৳${storeConfig.deliveryOutsideDhaka || 130} (2-3 business days)
- Free Delivery: Orders over ৳${storeConfig.freeShippingThreshold || 3000}
- Payment Methods: Cash on Delivery (ক্যাশ অন ডেলিভারি), bKash (বিকাশ), Nagad (নগদ), Rocket (রকেট)
- Return/Exchange Policy: Check in front of delivery person or 7-day exchange window with original tags.
- Customer Care Phone: ${storeConfig.contactPhone || '+880 1712-345678'}

Current Live Available Products Catalog:
${JSON.stringify(catalogSummary, null, 2)}

Strict Guidelines for Responses:
1. Always respond in warm, natural, and polite Bengali (বাংলা).
2. Ground all answers STRICTLY in the provided product catalog and store policies.
3. If the user asks for a product or category that EXISTS in the catalog:
   - Recommend the specific item(s) by name, mention price in ৳ (BDT), available sizes, and why it's great.
   - Include their exact product IDs in the "matchedProductIds" JSON array.
4. If the user asks for a product that is UNAVAILABLE or NOT in the catalog (e.g. Shoes, Watches, or unlisted items):
   - Politely inform them that this specific item is currently not in the Bismillah Collection catalog.
   - Suggest related available items from our Punjabi, Saree, Three-Piece, or Shirt collections.
   - Leave "matchedProductIds" as an empty array or suggest available related product IDs.
5. If the user asks about order tracking, delivery charges, bKash payments, or sizing, explain clearly according to the store policies.
6. Output your response as a valid JSON object with exactly two keys:
   {
     "reply": "Your helpful response in polite Bengali...",
     "matchedProductIds": ["prod_1", "prod_2"]
   }
DO NOT output markdown code fences around the JSON. Return only the raw JSON.`;

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
        model: 'gemini-3.7-flash',
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
          reply: responseText || 'কীভাবে আপনাকে সাহায্য করতে পারি?',
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
