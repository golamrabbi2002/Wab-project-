import { Product, StoreConfig } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  matchedProducts?: Product[];
  actionPills?: { label: string; action: string }[];
}

export class AiShoppingService {
  /**
   * Main query method that connects to the server-side Gemini API with smart resilient client fallback.
   */
  static async queryAssistant(
    userMessage: string,
    history: ChatMessage[],
    products: Product[],
    storeConfig: StoreConfig
  ): Promise<{ text: string; matchedProducts: Product[]; actionPills?: { label: string; action: string }[] }> {
    const trimmed = userMessage.trim();
    if (!trimmed) {
      return {
        text: 'অনুগ্রহ করে আপনার পছন্দের পোশাক বা কোনো প্রশ্ন লিখুন।',
        matchedProducts: [],
      };
    }

    // Try server-side Gemini API route first
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
            matchedProducts: matched.length > 0 ? matched : this.findRelevantProducts(trimmed, products),
            actionPills: this.generateActionPills(trimmed),
          };
        }
      }
    } catch (err) {
      console.warn('Server Gemini API unreachable, transitioning to local AI knowledge engine:', err);
    }

    // Fallback: Client-side AI Knowledge Assistant (Zero-Downtime Guarantee)
    return this.localKnowledgeAssistant(trimmed, products, storeConfig);
  }

  /**
   * Resilient local knowledge engine for static deploys (Netlify) & instant responses.
   */
  private static localKnowledgeAssistant(
    query: string,
    products: Product[],
    config: StoreConfig
  ): { text: string; matchedProducts: Product[]; actionPills?: { label: string; action: string }[] } {
    const q = query.toLowerCase();

    // 1. Check for unavailable product queries
    const unavailableKeywords = [
      'জুতা', 'জুতো', 'shoes', 'shoe', 'shoe collection', 'স্যান্ডেল', 'sandals',
      'ঘড়ি', 'ঘড়ি', 'watch', 'watches',
      'ব্যাগ', 'হ্যান্ডব্যাগ', 'bag', 'handbag',
      'সানগ্লাস', 'sunglass', 'sunglasses', 'চশমা',
      'মেকআপ', 'makeup', 'কসমেটিকস', 'cosmetics',
      'পারফিউম', 'perfume', 'আতর', 'attar',
      'মোবাইল', 'ফোন', 'phone', 'mobile'
    ];

    const isAskingUnavailable = unavailableKeywords.some((k) => q.includes(k));
    if (isAskingUnavailable) {
      const suggestions = products.slice(0, 3);
      return {
        text: `দুঃখিত! আমাদের বিসমিল্লাহ কালেকশনে বর্তমানে এই পণ্যটি উপলব্ধ নেই। তবে আপনি আমাদের আকর্ষণীয় পাঞ্জাবি, প্রিমিয়াম শাড়ি, ডিজাইনার থ্রি-পিস ও ক্যাজুয়াল কালেকশনগুলো দেখতে পারেন।`,
        matchedProducts: suggestions,
        actionPills: [
          { label: '✨ পাঞ্জাবি কালেকশন', action: 'show_panjabi' },
          { label: '🥻 শাড়ি কালেকশন', action: 'show_saree' },
          { label: '👗 থ্রি-পিস কালেকশন', action: 'show_three_piece' },
        ],
      };
    }

    // 2. Delivery queries
    if (q.includes('ডেলিভারি') || q.includes('delivery') || q.includes('চার্জ') || q.includes('charge') || q.includes('shipping')) {
      const dhaka = config.deliveryDhakaCity || 70;
      const outside = config.deliveryOutsideDhaka || 130;
      const freeOver = config.freeShippingThreshold || 3000;
      return {
        text: `আমাদের ডেলিভারি পলিসি:\n• ঢাকার ভেতরে ডেলিভারি চার্জ ৳${dhaka} (১-২ কর্মদিবস)\n• ঢাকার বাইরে ডেলিভারি চার্জ ৳${outside} (২-৩ কর্মদিবস)\n• ৳${freeOver} টাকার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি!\n• আমরা সম্পূর্ণ ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা প্রদান করে থাকি।`,
        matchedProducts: [],
        actionPills: [
          { label: '📦 অর্ডার ট্র্যাক করুন', action: 'open_tracking' },
          { label: '🛍️ শপিং শুরু করুন', action: 'browse_all' },
        ],
      };
    }

    // 3. Payment queries
    if (q.includes('পেমেন্ট') || q.includes('payment') || q.includes('বিকাশ') || q.includes('bkash') || q.includes('নগদ') || q.includes('nagad') || q.includes('টাকা')) {
      return {
        text: `আমাদের পেমেন্ট সুবিধা:\n• ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ)\n• বিকাশ ও নগদ ম্যানুয়াল মার্চেন্ট পেমেন্ট সুবিধা।\nঅর্ডার কনফার্ম করার সময় আপনি পছন্দের পেমেন্ট মেথড বেছে নিতে পারবেন।`,
        matchedProducts: [],
        actionPills: [
          { label: '🛍️ প্রোডাক্ট দেখুন', action: 'browse_all' },
          { label: '💬 হোয়াটসঅ্যাপ হেল্পলাইন', action: 'open_whatsapp' },
        ],
      };
    }

    // 4. Return & Exchange queries
    if (q.includes('রিটার্ন') || q.includes('return') || q.includes('বদল') || q.includes('exchange') || q.includes('চেঞ্জ')) {
      return {
        text: `রিটার্ন ও এক্সচেঞ্জ নিয়মাবলী:\n• পার্সেল পৌঁছানোর পর ডেলিভারিম্যানের সামনে চেক করে দেখে নেওয়ার সুযোগ রয়েছে।\n• সাইজ বা পণ্যে কোনো সমস্যা থাকলে ৭ দিনের মধ্যে ক্যাশ মেমোসহ ইনস্ট্যান্ট এক্সচেঞ্জ বা রিটার্ন সুবিধা পাবেন।`,
        matchedProducts: [],
        actionPills: [
          { label: '📏 সাইজ গাইড', action: 'open_size_guide' },
          { label: '💬 হোয়াটসঅ্যাপ সাপোর্ট', action: 'open_whatsapp' },
        ],
      };
    }

    // 5. Size Guide queries
    if (q.includes('সাইজ') || q.includes('size') || q.includes('মাপ') || q.includes('ফিটিং')) {
      return {
        text: `আমাদের পাঞ্জাবি ও পোশাকের সাইজসমূহ: ৩৮ (M), ৪০ (L), ৪২ (XL), ৪৪ (XXL)। বিস্তারিত বডি মেজারমেন্ট দেখতে নিচে "সাইজ গাইড" বাটনে ক্লিক করুন।`,
        matchedProducts: [],
        actionPills: [
          { label: '📏 বিস্তারিত সাইজ গাইড দেখুন', action: 'open_size_guide' },
        ],
      };
    }

    // 6. Product Searches
    const matched = this.findRelevantProducts(query, products);
    if (matched.length > 0) {
      const topMatch = matched[0];
      return {
        text: `আপনার জন্য বিসমিল্লাহ কালেকশনের নির্বাচিত পণ্যগুলো নিচে দেওয়া হলো। "${topMatch.title}" সহ পছন্দের পোশাকে ক্লিক করে সরাসরি বিস্তারিত দেখতে বা কার্টে যোগ করতে পারেন:`,
        matchedProducts: matched.slice(0, 4),
        actionPills: [
          { label: '🛍️ সব প্রোডাক্ট দেখুন', action: 'browse_all' },
          { label: '📦 ডেলিভারি তথ্য', action: 'ask_delivery' },
        ],
      };
    }

    // 7. General Welcome / Fallback
    const popular = products.slice(0, 3);
    return {
      text: `আসসালামু আলাইকুম! আমি "বিসমিল্লাহ কালেকশন"-এর এআই শপিং অ্যাসিস্ট্যান্ট।\nআমি আপনাকে কীভাবে সাহায্য করতে পারি? আপনি পাঞ্জাবি, শাড়ি, থ্রি-পিস বা ডেলিভারি নিয়ম সম্পর্কে জানতে পারেন।`,
      matchedProducts: popular,
      actionPills: [
        { label: '✨ সেরা পাঞ্জাবি কালেকশন', action: 'show_panjabi' },
        { label: '🥻 আকর্ষণীয় শাড়ি', action: 'show_saree' },
        { label: '🚚 ডেলিভারি চার্জ কত?', action: 'ask_delivery' },
      ],
    };
  }

  /**
   * Helper to find relevant products based on keywords in title, category, tags, or description.
   */
  private static findRelevantProducts(query: string, products: Product[]): Product[] {
    const q = query.toLowerCase();
    const tokens = q.split(/\s+/).filter((t) => t.length > 1);

    return products.filter((product) => {
      const title = (product.title || '').toLowerCase();
      const subtitle = (product.subtitle || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const desc = (product.description || '').toLowerCase();
      const material = (product.material || '').toLowerCase();
      const badges = (product.badges || []).join(' ').toLowerCase();
      const targetStr = `${title} ${subtitle} ${category} ${desc} ${material} ${badges}`;

      // Check category match
      if (q.includes('পাঞ্জাবি') || q.includes('panjabi') || q.includes('punjabi')) {
        if (targetStr.includes('পাঞ্জাবি') || targetStr.includes('panjabi') || category.includes('men') || targetStr.includes('kurta')) {
          return true;
        }
      }

      if (q.includes('শাড়ি') || q.includes('saree') || q.includes('shari') || q.includes('সিল্ক')) {
        if (targetStr.includes('শাড়ি') || targetStr.includes('saree') || targetStr.includes('silk')) {
          return true;
        }
      }

      if (q.includes('থ্রি পিস') || q.includes('three piece') || q.includes('three-piece') || q.includes('dress') || q.includes('কামিজ')) {
        if (targetStr.includes('three') || targetStr.includes('dress') || targetStr.includes('থ্রি') || targetStr.includes('কামিজ')) {
          return true;
        }
      }

      // Check tokens
      return tokens.some((token) => targetStr.includes(token));
    });
  }

  private static generateActionPills(query: string): { label: string; action: string }[] {
    const q = query.toLowerCase();
    if (q.includes('পাঞ্জাবি') || q.includes('panjabi')) {
      return [
        { label: '📏 সাইজ গাইড', action: 'open_size_guide' },
        { label: '🚚 ডেলিভারি চার্জ', action: 'ask_delivery' },
        { label: '💬 হোয়াটসঅ্যাপ অর্ডার', action: 'open_whatsapp' },
      ];
    }
    return [
      { label: '✨ পাঞ্জাবি', action: 'show_panjabi' },
      { label: '🥻 শাড়ি', action: 'show_saree' },
      { label: '🚚 ডেলিভারি নিয়ম', action: 'ask_delivery' },
    ];
  }
}
