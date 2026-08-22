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
   * Humanized, high-converting client knowledge engine.
   * Synthesizes the wisdom of top sales authorities (Brian Tracy, Zig Ziglar, Chris Voss, Robert Cialdini, Dale Carnegie).
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
      'মোবাইল', 'ফোন', 'phone', 'mobile', 'ল্যাপটপ', 'laptop'
    ];

    const isAskingUnavailable = unavailableKeywords.some((k) => q.includes(k));
    if (isAskingUnavailable) {
      const suggestions = products.filter(p => p.stock > 0).slice(0, 3);
      return {
        text: `আন্তরিক ধন্যবাদ আপনার পছন্দের কথা জানানোর জন্য! ❤️\n\nআমাদের নিজস্ব ফ্যাশন হাউজে প্রতিটি পোশাকে সেরা কোয়ালিটি ও ফিনিশিং নিশ্চিত করার জন্য আমরা বর্তমানে প্রিমিয়াম পাঞ্জাবি, এক্সক্লুসিভ শাড়ি ও ডিজাইনার থ্রি-পিস কালেকশনের ওপর বিশেষ মনোযোগ দিচ্ছি।\n\nআপনার যেকোনো উৎসব বা স্পেশাল দিনের জন্য আমাদের সবচেয়ে জনপ্রিয় ও ক্লাসি কিছু কালেকশন নিচে দেখে নিতে পারেন—যা আপনাকে এক অনন্য আভিজাত্য এনে দেবে!`,
        matchedProducts: suggestions,
        actionPills: [
          { label: '✨ ট্রেন্ডিং পাঞ্জাবি কালেকশন', action: 'show_panjabi' },
          { label: '🥻 এক্সক্লুসিভ শাড়ি', action: 'show_saree' },
          { label: '👗 ডিজাইনার থ্রি-পিস', action: 'show_three_piece' },
        ],
      };
    }

    // 2. Delivery queries
    if (q.includes('ডেলিভারি') || q.includes('delivery') || q.includes('চার্জ') || q.includes('charge') || q.includes('shipping')) {
      const dhaka = config.deliveryDhakaCity ?? 70;
      const outside = config.deliveryOutsideDhaka ?? 130;
      const freeOver = config.freeShippingThreshold ?? 3000;
      return {
        text: `আপনার নিশ্চিন্ত শপিং অভিজ্ঞতার জন্য আমাদের ডেলিভারি সেবা অত্যন্ত দ্রুত ও নিরাপদ: 🚀\n\n• 📍 ঢাকা সিটির ভেতরে: মাত্র ৳${dhaka} (১-২ দিনের মধ্যে সুপার ফাস্ট ডেলিভারি)\n• 🚚 ঢাকার বাইরে সারা বাংলাদেশে: মাত্র ৳${outside} (২-৩ দিনে হোম ডেলিভারি)\n• 🎁 স্পেশাল অফার: ৳${freeOver} বা তার বেশি শপিং করলেই ডেলিভারি সম্পূর্ণ ফ্রি!\n\nসবচেয়ে বড় সুবিধা হলো—পার্সেল হাতে পেয়ে ডেলিভারিম্যানের সামনে দেখে মূল্য পরিশোধের ক্যাশ অন ডেলিভারি সুবিধা রয়েছে।`,
        matchedProducts: [],
        actionPills: [
          { label: '📦 অর্ডার ট্র্যাক করুন', action: 'open_tracking' },
          { label: '🛍️ শপিং শুরু করুন', action: 'browse_all' },
        ],
      };
    }

    // 3. Payment queries
    if (q.includes('পেমেন্ট') || q.includes('payment') || q.includes('বিকাশ') || q.includes('bkash') || q.includes('নগদ') || q.includes('nagad') || q.includes('টাকা')) {
      const bkash = config.bkashMerchantNumber || '01712-345678';
      const nagad = config.nagadMerchantNumber || '01812-345678';
      return {
        text: `আপনার সুবিধার্থে আমাদের সব ধরনের পেমেন্ট সুবিধা উন্মুক্ত রাখা হয়েছে: 💳\n\n১. ক্যাশ অন ডেলিভারি (Cash on Delivery): পণ্য হাতে পেয়ে ডেলিভারিম্যানকে টাকা দিন—কোনো অগ্রিম পেমেন্টের ঝামেলা নেই।\n২. বিকাশ মার্চেন্ট পেমেন্ট: ${bkash}\n৩. নগদ মার্চেন্ট পেমেন্ট: ${nagad}\n\nচেকআউট করার সময় আপনি আপনার পছন্দের পেমেন্ট মেথডটি এক ক্লিকেই বেছে নিতে পারবেন!`,
        matchedProducts: [],
        actionPills: [
          { label: '🛍️ কালেকশন ব্রাউজ করুন', action: 'browse_all' },
          { label: '💬 হোয়াটসঅ্যাপে সরাসরি কথা বলুন', action: 'open_whatsapp' },
        ],
      };
    }

    // 4. Return & Exchange queries
    if (q.includes('রিটার্ন') || q.includes('return') || q.includes('বদল') || q.includes('exchange') || q.includes('চেঞ্জ')) {
      return {
        text: `আমাদের সাথে আপনার শপিং শতভাগ ঝুঁকিমুক্ত ও নিরাপদ: 🛡️\n\n• 📦 পার্সেল রিসিভ করার সময় ডেলিভারিম্যানের সামনে ফেব্রিক ও সাইজ চেক করে নেওয়ার পূর্ণ সুবিধা রয়েছে।\n• 🔄 সাইজ বা ফিটিংসে কোনো পরিবর্তন চাইলে ৭ দিনের মধ্যে ইনস্ট্যান্ট ফ্রি এক্সচেঞ্জ ও রিটার্ন গ্যারান্টি পাবেন।\n\nআমরা সবসময় চাই আমাদের প্রতিটি পোশাক পরে আপনি সর্বোচ্চ তৃপ্তি ও স্বাচ্ছন্দ্য পান!`,
        matchedProducts: [],
        actionPills: [
          { label: '📏 সাইজ গাইড দেখুন', action: 'open_size_guide' },
          { label: '💬 কাস্টমার কেয়ার হেল্পলাইন', action: 'open_whatsapp' },
        ],
      };
    }

    // 5. Size Guide queries
    if (q.includes('সাইজ') || q.includes('size') || q.includes('মাপ') || q.includes('ফিটিং')) {
      return {
        text: `সঠিক ফিটিং আপনার ব্যক্তিত্বকে আকর্ষণীয় করে তোলে! 👔\n\nআমাদের স্ট্যান্ডার্ড সাইজ পরিমাপ:\n• মিডিয়াম (M / ৩৮): বুক ৩৮-৩৯ ইঞ্চি, লম্বা ৪০ ইঞ্চি\n• লার্জ (L / ৪০): বুক ৪০-৪১ ইঞ্চি, লম্বা ৪২ ইঞ্চি\n• এক্সেল (XL / ৪২): বুক ৪২-৪৩ ইঞ্চি, লম্বা ৪৪ ইঞ্চি\n• ডাবল এক্সেল (XXL / ৪৪): বুক ৪৪-৪৫ ইঞ্চি, লম্বা ৪৫ ইঞ্চি\n\nনিচের "সাইজ গাইড" বাটনে চাপ দিয়ে আপনার পারফেক্ট মাপটি এক নজরে মিলিয়ে নিতে পারেন।`,
        matchedProducts: [],
        actionPills: [
          { label: '📏 সাইজ গাইড চার্ট', action: 'open_size_guide' },
        ],
      };
    }

    // 6. Product Searches & High-Converting Recommendations
    const matched = this.findRelevantProducts(query, products);
    if (matched.length > 0) {
      const available = matched.filter(p => p.stock > 0);
      const itemsToDisplay = available.length > 0 ? available : matched;
      return {
        text: `আপনার চমৎকার পছন্দের সাথে মানানসই সেরা কালেকশনগুলো খুঁজে পেয়েছি! ✨\n\nএই পোশাকগুলোর আরামদায়ক ফেব্রিক, প্রিমিয়াম ফিনিশিং এবং আকর্ষণীয় ডিজাইন গ্রাহকদের কাছে অত্যন্ত প্রশংসিত। নিচের কার্ডে ক্লিক করে সরাসরি প্রিভিউ দেখতে বা কার্টে যুক্ত করতে পারেন:`,
        matchedProducts: itemsToDisplay.slice(0, 4),
        actionPills: [
          { label: '🛍️ সব কালেকশন দেখুন', action: 'browse_all' },
          { label: '🚚 ডেলিভারি সুবিধা', action: 'ask_delivery' },
        ],
      };
    }

    // 7. General Welcome / High Touch Human Greeting
    const popular = products.filter(p => p.stock > 0).slice(0, 3);
    return {
      text: `আসসালামু আলাইকুম! বিসমিল্লাহ কালেকশনে আপনাকে আন্তরিক স্বাগতম। 🌸\n\nআমি আপনার পার্সোনাল ফ্যাশন ও সেলস কনসালট্যান্ট। আপনার স্পেশাল দিন বা উৎসবের জন্য মনের মতো পোশাক বাছাই করতে, সঠিক সাইজ নির্বাচন করতে বা ডেলিভারি নিয়ম জানতে আমাকে যেকোনো কিছু জিজ্ঞাসা করতে পারেন।\n\nআজকে আপনার জন্য কী ধরনের পোশাক খুঁজে দেব বলুন?`,
      matchedProducts: popular.length > 0 ? popular : products.slice(0, 3),
      actionPills: [
        { label: '✨ সেরা পাঞ্জাবি কালেকশন', action: 'show_panjabi' },
        { label: '🥻 আকর্ষণীয় শাড়ি কালেকশন', action: 'show_saree' },
        { label: '🚚 ডেলিভারি ও ক্যাশ অন ডেলিভারি', action: 'ask_delivery' },
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
