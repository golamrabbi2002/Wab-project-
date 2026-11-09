import { Product, StoreConfig } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  spokenSummary?: string;
  timestamp: string;
  matchedProducts?: Product[];
  actionPills?: { label: string; action: string }[];
}

export class AiShoppingService {
  /**
   * Main query method that connects to the server-side Gemini API,
   * falls back to direct client-side Gemini API (for Netlify/static hosting),
   * and falls back to a 100% universal client knowledge base.
   */
  static async queryAssistant(
    userMessage: string,
    history: ChatMessage[],
    products: Product[],
    storeConfig: StoreConfig
  ): Promise<{ text: string; spokenSummary?: string; matchedProducts: Product[]; actionPills?: { label: string; action: string }[] }> {
    const trimmed = userMessage.trim();
    if (!trimmed) {
      return {
        text: 'অনুগ্রহ করে আপনার প্রয়োজনীয় পণ্য বা কোনো প্রশ্ন বলুন বা লিখুন।',
        spokenSummary: 'অনুগ্রহ করে আপনার পছন্দের পণ্যের কথা বলুন।',
        matchedProducts: [],
      };
    }

    // 1. Try server-side Gemini API proxy route first (when running on Express/Full-Stack)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          chatHistory: history.slice(-6).map((h) => ({
            sender: h.sender,
            text: h.text,
          })),
          products,
          storeConfig,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          const matchedIds: string[] = Array.isArray(data.matchedProductIds) ? data.matchedProductIds : [];
          const matched = products.filter((p) => matchedIds.includes(p.id));
          return {
            text: data.reply,
            spokenSummary: data.spokenSummary || this.cleanTextForVoice(data.reply).slice(0, 160),
            matchedProducts: matched.length > 0 ? matched : this.findRelevantProducts(trimmed, products),
            actionPills: this.generateActionPills(trimmed, products),
          };
        }
      }
    } catch {
      // Backend not running (e.g. Netlify static hosting)
    }

    // 2. Direct Client-side Gemini API Call (Guarantees true AI on Netlify / Static hosting)
    const clientApiKey = (storeConfig.geminiApiKey && typeof storeConfig.geminiApiKey === 'string' && storeConfig.geminiApiKey.trim())
      ? storeConfig.geminiApiKey.trim()
      : (import.meta as any).env?.VITE_GEMINI_API_KEY;

    if (clientApiKey) {
      try {
        const brand = storeConfig.brandName || 'বিসমিল্লাহ কালেকশন';
        const catalogBrief = products.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          price: p.price,
          originalPrice: p.originalPrice,
          stock: p.stock,
          material: p.material || '',
          description: p.description ? p.description.slice(0, 180) : '',
        }));

        const systemPrompt = `You are the master intelligent Bengali AI sales consultant and customer advisor for "${brand}".
Current Live Catalog Inventory (${catalogBrief.length} items):
${JSON.stringify(catalogBrief, null, 2)}

Store Policies & Identity:
- Shop Name: "${brand}" (বিসমিল্লাহ কালেকশন)
- Cash on delivery available across all 64 districts of Bangladesh.
- 100% Open Box Inspection: Customers can inspect the product in front of the delivery rider before paying.
- Delivery charge: Inside Dhaka ৳${storeConfig.deliveryDhakaCity || 70}, Outside Dhaka ৳${storeConfig.deliveryOutsideDhaka || 130}.
- Free delivery on orders above ৳${storeConfig.freeShippingThreshold || 3000}.
- 7 days easy return/exchange policy.

CRITICAL BEHAVIOR & RECOMMENDATION DIRECTIVES:
1. EXCLUSIVE STORE PROMOTION: You represent ONLY "${brand}". NEVER suggest, mention, or recommend buying from external websites or marketplaces (like Daraz, Aarong, Amazon, Flipkart, etc.).
   - If a customer asks "অন্য কোন ওয়েবসাইট থেকে কিনলে ভালো হবে?" or "অন্য কোথাও কি কম দামে পাব?", politely and skillfully redirect them back to "${brand}". Highlight our authentic quality, direct manufacturer price, 100% cash on delivery with open box inspection, and 7-day hassle-free exchange guarantee.
2. HUMAN WARMTH & RESPECT: Address customers with genuine warmth (ভাইয়া / আপু / সম্মানিত অতিথি). If they offer salam (আসসালামু আলাইকুম), reply warmly (ওয়া আলাইকুমুস সালাম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহু).
3. CATALOG GROUNDING: Answer based strictly on the live catalog above. Quote exact prices (৳), stock status, materials, and sizes.
4. Output strictly valid JSON without markdown code fences:
{
  "reply": "Warm, respectful, persuasive Bengali response...",
  "matchedProductIds": ["id1", "id2"]
}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(clientApiKey)}`;
        const geminiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nCustomer Message: "${trimmed}"` }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            const matchedIds: string[] = Array.isArray(parsed.matchedProductIds) ? parsed.matchedProductIds : [];
            const matched = products.filter((p) => matchedIds.includes(p.id));
            return {
              text: parsed.reply || rawText,
              spokenSummary: parsed.spokenSummary || this.cleanTextForVoice(parsed.reply || rawText).slice(0, 160),
              matchedProducts: matched.length > 0 ? matched : this.findRelevantProducts(trimmed, products),
              actionPills: this.generateActionPills(trimmed, products),
            };
          }
        }
      } catch (clientGeminiErr) {
        console.warn('Client direct Gemini call failed, using universal local knowledge engine:', clientGeminiErr);
      }
    }

    // 3. Fallback: Universal Smart Knowledge Assistant (Works 100% offline & without API keys)
    return this.localKnowledgeAssistant(trimmed, products, storeConfig);
  }

  /**
   * Clean markdown asterisks, brackets, and emojis for smooth, human-like voice synthesis.
   */
  static cleanTextForVoice(raw: string): string {
    return (raw || '')
      .replace(/[*_#`~>\[\]\(\)\{\}\|=+]/g, ' ')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
      .replace(/[•●▪■◆★☆✓✔✕✖]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Universal client knowledge engine with real-time inventory and store policy grounding.
   */
  private static localKnowledgeAssistant(
    query: string,
    products: Product[],
    config: StoreConfig
  ): { text: string; spokenSummary?: string; matchedProducts: Product[]; actionPills?: { label: string; action: string }[] } {
    const q = query.toLowerCase().trim();
    const brand = config.brandName || 'বিসমিল্লাহ কালেকশন';
    const topStocked = products.filter((p) => (p.stock || 0) > 0);
    const popular = topStocked.length > 0 ? topStocked.slice(0, 4) : products.slice(0, 4);

    // 1. Personal Inquiries & "How Are You?" Check-ins
    if (
      q.includes('কেমন আছেন') || q.includes('কেমন আছো') || q.includes('kemon achen') ||
      q.includes('kemon aso') || q.includes('how are you') || q.includes('কী খবর') ||
      q.includes('কি খবর') || q.includes('ki khobor') || q.includes('কী অবস্থা') ||
      q.includes('ki obostha') || q.includes('ভাল আছেন') || q.includes('ভালো আছেন')
    ) {
      const text = `আলহামদুলিল্লাহ, মহান আল্লাহর অশেষ রহমতে আমি খুব ভালো আছি! ❤️\n\nআশা করি আপনি ও আপনার পরিবারের সকলেই সুস্থ ও সুন্দর আছেন।\n\n"${brand}"-এ আপনার প্রয়োজনীয় পণ্যটি সহজেই খুঁজে পেতে সাহায্য করতে আমি প্রস্তুত। আজ আপনার কী ধরনের পণ্য প্রয়োজন মুখে বলুন!`;
      return {
        text,
        spokenSummary: `আলহামদুলিল্লাহ, আমি খুব ভালো আছি। ${brand}-এ আপনার পছন্দের পণ্য খুঁজে দিতে আমি প্রস্তুত।`,
        matchedProducts: popular,
        actionPills: this.generateActionPills(query, products),
      };
    }

    // 2. Religious & Cultural Greetings
    if (
      q.includes('সালাম') || q.includes('salam') || q.includes('assalamu') ||
      q.includes('আসসালামু') || q.includes('assalam') || q.includes('as-salamu')
    ) {
      const text = `ওয়া আলাইকুমুস সালাম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহু ভাইয়া/আপু! 🌸✨\n\n"${brand}"-এ আপনাকে আন্তরিক স্বাগতম। আমাদের এখানে আপনি সেরা মানের পণ্য, ক্যাশ অন ডেলিভারি এবং পার্সেল দেখে নেওয়ার ১০০% গ্যারান্টি সুবিধা পাবেন।\n\nআজকে আপনার জন্য কী ধরনের পণ্য দেখাব বলুন?`;
      return {
        text,
        spokenSummary: `ওয়া আলাইকুমুস সালাম! ${brand}-এ আপনাকে স্বাগতম। আজ আপনার জন্য কোন পণ্যটি প্রয়োজন মুখে বলুন?`,
        matchedProducts: popular,
        actionPills: this.generateActionPills(query, products),
      };
    }

    if (
      q.includes('নমস্কার') || q.includes('নমস্তে') || q.includes('প্রণাম') ||
      q.includes('namaskar') || q.includes('namaste') || q.includes('pranam')
    ) {
      const text = `নমস্কার! ঈশ্বর আপনার ও আপনার পরিবারের মঙ্গল করুন। 🙏✨\n\n"${brand}"-এ আপনাকে আন্তরিক স্বাগতম। আপনার পছন্দের পণ্যটি বাছাই করতে আমি সর্বদা প্রস্তুত।`;
      return {
        text,
        spokenSummary: `নমস্কার! ${brand}-এ আপনাকে স্বাগতম। আপনার পছন্দের সেরা পণ্যটি খুঁজে দিতে আমি প্রস্তুত।`,
        matchedProducts: popular,
        actionPills: this.generateActionPills(query, products),
      };
    }

    // 3. Competitor Inquiries & External Website Suggestions ("অন্য কোন ওয়েবসাইট থেকে কিনব?", "দারাজ", "অন্য কোথাও পাব?")
    if (
      q.includes('অন্য কোন ওয়েবসাইট') || q.includes('অন্য ওয়েবসাইট') || q.includes('দারাজ') ||
      q.includes('daraz') || q.includes('aarong') || q.includes('আড়ং') ||
      q.includes('অন্য দোকান') || q.includes('অন্য কোথাও') || q.includes('অন্য কোথা থেকে') ||
      q.includes('কোথা থেকে কিনলে ভালো হবে') || q.includes('বাইরে থেকে')
    ) {
      const text = `ভাইয়া/আপু, আপনার সুবিধার কথা চিন্তা করেই বলছি — "${brand}" থেকে কেনাকাটা করাই আপনার জন্য সবচেয়ে নিরাপদ ও লাভজনক সিদ্ধান্ত হবে! 🛍️✨\n\nকেন অন্য কোথাও না গিয়ে ${brand} বেছে নেবেন?\n১. 📦 ১০০% ওপেন বক্স ডেলিভারি: ডেলিভারিম্যানের সামনে পার্সেল খুলে কোয়ালিটি ও সাইজ দেখে নিশ্চিত হয়ে টাকা পরিশোধ করার পূর্ণ নিশ্চয়তা।\n২. 🧵 প্রিমিয়াম ও খাঁটি কোয়ালিটি: কোনো মধ্যস্বত্বভোগী ছাড়া সরাসরি প্রস্তুতকারকের থেকে মানসম্মত কালেকশন।\n৩. 🔄 ৭ দিনের ইজি এক্সচেঞ্জ: সাইজে সমস্যা হলে কোনো রকম ঝামেলা ছাড়া এক্সচেঞ্জ সুবিধা।\n৪. 💰 সাশ্রয়ী মূল্য ও স্পেশাল অফার: সারা দেশে দ্রুততম ডেলিভারি এবং ৳${config.freeShippingThreshold || 3000}+ অর্ডারে ফ্রি ডেলিভারি!\n\nঅন্য কোনো জায়গায় ঝুঁকি না নিয়ে নিশ্চিন্তে আমাদের কালেকশন দেখুন। আপনার কী ধরনের পণ্য পছন্দ বলুন?`;

      return {
        text,
        spokenSummary: `${brand} থেকে কেনাকাটাই সবচেয়ে নিরাপদ। এখানে ক্যাশ অন ডেলিভারিতে চেক করে নেওয়ার সুবিধা এবং ৭ দিনের এক্সচেঞ্জ গ্যারান্টি রয়েছে।`,
        matchedProducts: popular,
        actionPills: this.generateActionPills(query, products),
      };
    }

    // 4. Delivery, Shipping, and Payment Rules
    if (
      q.includes('ডেলিভারি') || q.includes('কুরিয়ার') || q.includes('delivery') ||
      q.includes('চার্জ') || q.includes('ক্যাশ অন') || q.includes('cash on') ||
      q.includes('টাকা দিতে হবে') || q.includes('পেমেন্ট') || q.includes('payment') ||
      q.includes('বিকাশ') || q.includes('নগদ')
    ) {
      const insideDhaka = config.deliveryDhakaCity || 70;
      const outsideDhaka = config.deliveryOutsideDhaka || 130;
      const freeLimit = config.freeShippingThreshold || 3000;

      const text = `"${brand}"-এর ডেলিভারি ও পেমেন্ট নিয়মাবলী: 🚚📦\n\n• 📍 ঢাকা সিটির ভেতরে ডেলিভারি চার্জ: মাত্র ৳${insideDhaka} (২৪-৪৮ ঘণ্টায় হোম ডেলিভারি)\n• 🌍 ঢাকার বাইরে সারা দেশে ডেলিভারি চার্জ: মাত্র ৳${outsideDhaka} (২-৩ দিনে হোম ডেলিভারি)\n• 🎁 স্পেশাল অফার: ৳${freeLimit}+ অর্ডারে সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি!\n• 💵 ক্যাশ অন ডেলিভারি: পার্সেল রিসিভ করার সময় ডেলিভারিম্যানের সামনে পণ্য দেখে নেওয়ার ১০০% সুযোগ রয়েছে।\n• 📱 বিকাশ ও নগদে সরাসরি সুরক্ষিত পেমেন্ট করার সুবিধাও রয়েছে।`;

      return {
        text,
        spokenSummary: `ঢাকায় ডেলিভারি চার্জ ৳${insideDhaka}, ঢাকার বাইরে ৳${outsideDhaka}। ৳${freeLimit} টাকার বেশি অর্ডারে সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি।`,
        matchedProducts: popular,
        actionPills: [
          { label: '🛍️ সব পণ্য দেখুন', action: 'browse_all' },
          { label: '📦 অর্ডার ট্র্যাক করুন', action: 'open_tracking' },
        ],
      };
    }

    // 4. Return, Size Exchange, and Quality Guarantee
    if (
      q.includes('রিটার্ন') || q.includes('এক্সচেঞ্জ') || q.includes('ফেরত') ||
      q.includes('সাইজ না মিললে') || q.includes('সমস্যা হলে') || q.includes('গ্যারান্টি') ||
      q.includes('return') || q.includes('exchange')
    ) {
      const text = `আমাদের গ্রাহক সন্তুষ্টি শতভাগ নিশ্চিত! 🛡️✨\n\n১. 📦 পার্সেল দেখে নেওয়ার সুযোগ: ডেলিভারিম্যান থাকা অবস্থায় পার্সেল খুলে চেক করে নিশ্চিন্তে রিসিভ করতে পারবেন।\n২. 🔄 ৭ দিনের ইজি এক্সচেঞ্জ: সাইজ কিংবা পণ্যে কোনো অসঙ্গতি থাকলে ৭ দিনের মধ্যে দ্রুত এক্সচেঞ্জ সুবিধা পাবেন।\n৩. 📞 সরাসরি সাপোর্ট: যে কোনো প্রয়োজনে আমাদের হেল্পলাইন বা হোয়াটসঅ্যাপে যোগাযোগ করলেই সাথে সাথে সমাধান দেওয়া হয়।`;

      return {
        text,
        spokenSummary: `আমাদের সকল পণ্যে ক্যাশ অন ডেলিভারিতে চেক করে নেওয়ার সুযোগ এবং ৭ দিনের এক্সচেঞ্জ সুবিধা রয়েছে।`,
        matchedProducts: popular,
        actionPills: [
          { label: '🛍️ পণ্য কালেকশন', action: 'browse_all' },
          { label: '💬 হোয়াটসঅ্যাপ সাপোর্ট', action: 'open_whatsapp' },
        ],
      };
    }

    // 5. Store Contact & Identity Inquiries
    if (
      q.includes('যোগাযোগ') || q.includes('নাম্বার') || q.includes('ফোন') ||
      q.includes('ঠিকানা') || q.includes('contact') || q.includes('phone') ||
      q.includes('address') || q.includes('হোয়াটসঅ্যাপ') || q.includes('whatsapp')
    ) {
      const phone = config.contactPhone || '01XXXXXXXXX';
      const address = config.studioAddress || 'ঢাকা, বাংলাদেশ';
      const text = `"${brand}"-এর অফিশিয়াল যোগাযোগের তথ্য: 📞📍\n\n• 🏢 শপ / স্টুডিও ঠিকানা: ${address}\n• ☎️ ফোন / হটলাইন: ${phone}\n• 💬 হোয়াটসঅ্যাপ: ${phone}\n• 🌐 ওয়েবসাইট: সারা বাংলাদেশে ২৪/৭ অনলাইন অর্ডার চালু রয়েছে।`;

      return {
        text,
        spokenSummary: `${brand}-এর হটলাইন নাম্বার ${phone}। আপনি যেকোনো সময় কল বা হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।`,
        matchedProducts: popular,
        actionPills: [
          { label: '💬 হোয়াটসঅ্যাপে যোগাযোগ', action: 'open_whatsapp' },
          { label: '🛍️ সব পণ্য দেখুন', action: 'browse_all' },
        ],
      };
    }

    // 6. Dynamic Inventory Product Search (For ANY category: clothing, buckets, shoes, electronics, etc.)
    const matched = this.findRelevantProducts(query, products);
    if (matched.length > 0) {
      const featured = matched[0];
      const stockText = featured.stock > 0 ? `বর্তমানে ${featured.stock} টি স্টকে রয়েছে` : 'বর্তমানে সীমিত স্টকে আছে';
      const priceText = `${config.currencySymbol || '৳'}${featured.price.toLocaleString('en-BD')}`;
      const origPriceText = featured.originalPrice && featured.originalPrice > featured.price
        ? ` (আগের দাম ${config.currencySymbol || '৳'}${featured.originalPrice.toLocaleString('en-BD')})`
        : '';

      const text = `আপনার পছন্দের সাথে মানানসই পণ্য পেয়েছি! ✨\n\n🏷️ ${featured.title}\n• ক্যাটাগরি: ${featured.category}\n• মূল্য: মাত্র ${priceText}${origPriceText}\n• স্টক স্ট্যাটাস: ${stockText}\n• বিবরণ: ${featured.description || 'উচ্চমানের সেরা পণ্য'}\n${featured.material ? `• উপাদান / ম্যাটেরিয়াল: ${featured.material}\n` : ''}\n📦 আমাদের এখানে ক্যাশ অন ডেলিভারিতে চেক করে নেওয়ার সুবিধা রয়েছে। আপনি কি এটি অর্ডার করতে চান?`;

      return {
        text,
        spokenSummary: `আপনার পছন্দের পণ্য পেয়েছি: ${featured.title}, মূল্য মাত্র ${priceText}। ${stockText}। ক্যাশ অন ডেলিভারিতে অর্ডার করতে পারেন।`,
        matchedProducts: matched.slice(0, 4),
        actionPills: this.generateActionPills(query, products),
      };
    }

    // 7. General Friendly Universal Assistant Response
    const availableCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    const catListStr = availableCategories.length > 0 ? availableCategories.slice(0, 5).join(', ') : 'সকল আকর্ষণীয় পণ্য';

    const text = `আসসালামু আলাইকুম! "${brand}"-এ আপনাকে আন্তরিক স্বাগতম। 🌸✨\n\nআমি আপনার সার্বক্ষণিক ভয়েস ও শপিং অ্যাসিস্ট্যান্ট। আমাদের স্টোরে আপনি পাবেন ${catListStr} সহ আকর্ষণীয় সব কালেকশন।\n\n📦 সুবিধা: সারা দেশে ক্যাশ অন ডেলিভারি, পার্সেল চেক করে নেওয়ার সুযোগ ও ৭ দিনের এক্সচেঞ্জ সুবিধা।\n\nআপনি কী ধরনের পণ্য খুঁজছেন মুখে বলুন বা লিখে জানান!`;

    return {
      text,
      spokenSummary: `আসসালামু আলাইকুম! ${brand}-এ আপনাকে স্বাগতম। আপনার পছন্দের পণ্য খুঁজে পেতে সরাসরি মুখে বলুন।`,
      matchedProducts: popular,
      actionPills: this.generateActionPills(query, products),
    };
  }

  /**
   * Helper to find relevant products based on query tokens across all product attributes.
   */
  private static findRelevantProducts(query: string, products: Product[]): Product[] {
    const q = query.toLowerCase().trim();
    if (!q || !products || products.length === 0) return [];

    // Check exact matches or specific common keywords
    const tokens = q
      .replace(/[?.,!।]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !['আছে', 'কি', 'কত', 'দাম', 'দেখাও', 'দেখান', 'চাই', 'পাব'].includes(t));

    const scored = products.map((product) => {
      let score = 0;
      const title = (product.title || '').toLowerCase();
      const subtitle = (product.subtitle || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const desc = (product.description || '').toLowerCase();
      const material = (product.material || '').toLowerCase();
      const sku = (product.sku || '').toLowerCase();

      // Full phrase match
      if (title.includes(q)) score += 50;
      if (category.includes(q)) score += 40;

      // Token matches
      for (const token of tokens) {
        if (title.includes(token)) score += 15;
        if (category.includes(token)) score += 12;
        if (subtitle.includes(token)) score += 8;
        if (desc.includes(token)) score += 6;
        if (material.includes(token)) score += 5;
        if (sku.includes(token)) score += 20;
      }

      // Keyword Synonyms (e.g. বালতি, জুতো, পাঞ্জাবি, শাড়ি)
      if (q.includes('বালতি') || q.includes('bucket') || q.includes('প্লাস্টিক')) {
        if (title.includes('বালতি') || category.includes('living') || category.includes('household') || desc.includes('বালতি')) {
          score += 35;
        }
      }
      if (q.includes('পাঞ্জাবি') || q.includes('panjabi') || q.includes('punjabi')) {
        if (title.includes('পাঞ্জাবি') || category.toLowerCase().includes('panjabi')) score += 35;
      }
      if (q.includes('শাড়ি') || q.includes('saree') || q.includes('shari')) {
        if (title.includes('শাড়ি') || category.toLowerCase().includes('saree')) score += 35;
      }
      if (q.includes('জুতো') || q.includes('shoe') || q.includes('sneaker')) {
        if (category.toLowerCase().includes('footwear') || title.includes('জুতো')) score += 35;
      }

      return { product, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);
  }

  /**
   * Dynamically generate actionable quick-tap suggestion pills based on live store catalog.
   */
  private static generateActionPills(query: string, products: Product[]): { label: string; action: string }[] {
    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    const pills: { label: string; action: string }[] = [];

    // Add first 2 active store categories
    for (const cat of categories.slice(0, 2)) {
      pills.push({ label: `✨ ${cat}`, action: `filter_${cat.toLowerCase()}` });
    }

    pills.push({ label: '🚚 ডেলিভারি চার্জ কত?', action: 'ask_delivery' });
    pills.push({ label: '🛡️ ক্যাশ অন ডেলিভারি', action: 'ask_cod' });

    return pills;
  }
}

