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
   * Configured with strict robotic logical reasoning, refined consolidation, and exclusive website grounding.
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
        text: `[যৌক্তিক বিশ্লেষণ ও ফলাফল]:\n১. অনুসন্ধান বিশ্লেষণ: আপনি যে পণ্যটি খুঁজছেন তা এই অনলাইন স্টোরের পোশাক ক্যাটালগ বহির্ভূত।\n২. বর্তমান ডাটাবেজ স্থিতি: আমাদের সিস্টেমে শুধুমাত্র প্রিমিয়াম ফ্যাশন পোশাক (পাঞ্জাবি, শাড়ি, থ্রি-পিস ও শার্ট) সংরক্ষিত আছে।\n৩. সমন্বিত বিকল্প সুপারিশ: আপনার জন্য আমাদের স্টোরের সর্বোচ্চ রেটিংপ্রাপ্ত রেডি-টু-শিপ কালেকশন নিচে প্রদর্শন করা হলো:`,
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
      const dhaka = config.deliveryDhakaCity ?? 70;
      const outside = config.deliveryOutsideDhaka ?? 130;
      const freeOver = config.freeShippingThreshold ?? 3000;
      return {
        text: `[লজিস্টিকস ও শিপিং প্যারামিটার]:\n• মেট্রো ঢাকা কুরিয়ার চার্জ: ৳${dhaka} (প্রত্যাশিত সময়: ২৪-৪৮ ঘণ্টা)\n• জাতীয় কভারেজ (ঢাকার বাইরে): ৳${outside} (প্রত্যাশিত সময়: ৪৮-৭২ ঘণ্টা)\n• ফ্রি ডেলিভারি ইনসেন্টিভ: ৳${freeOver}+ অর্ডারে শতভাগ ফ্রি ডেলিভারি প্রযোজ্য।\n• সিকিউরিটি প্রোটোকল: ক্যাশ অন ডেলিভারি (COD) এবং পার্সেল আনবক্সিং ভেরিফিকেশন অনুমোদিত।`,
        matchedProducts: [],
        actionPills: [
          { label: '📦 অর্ডার ট্র্যাক করুন', action: 'open_tracking' },
          { label: '🛍️ ক্যাটালগ ব্রাউজ করুন', action: 'browse_all' },
        ],
      };
    }

    // 3. Payment queries
    if (q.includes('পেমেন্ট') || q.includes('payment') || q.includes('বিকাশ') || q.includes('bkash') || q.includes('নগদ') || q.includes('nagad') || q.includes('টাকা')) {
      const bkash = config.bkashMerchantNumber || '01712-345678';
      const nagad = config.nagadMerchantNumber || '01812-345678';
      return {
        text: `[পেমেন্ট গেটওয়ে স্পেসিফিকেশন]:\n১. ক্যাশ অন ডেলিভারি (COD): পার্সেল গ্রহণকালে নগদ পরিশোধ।\n২. বিকাশ মার্চেন্ট পেমেন্ট: ${bkash}\n৩. নগদ মার্চেন্ট পেমেন্ট: ${nagad}\n৪. নিরাপত্তা: চেকআউট পৃষ্ঠায় কোনো পূর্ব-পেমেন্ট বা ওটিপি প্রদান ছাড়াই সম্পূর্ণ নিরাপদ ও নির্ভরযোগ্য অর্ডার কনফার্মেশন।`,
        matchedProducts: [],
        actionPills: [
          { label: '🛍️ পোশাক পছন্দ করুন', action: 'browse_all' },
          { label: '💬 অফিশিয়াল হেল্পলাইন', action: 'open_whatsapp' },
        ],
      };
    }

    // 4. Return & Exchange queries
    if (q.includes('রিটার্ন') || q.includes('return') || q.includes('বদল') || q.includes('exchange') || q.includes('চেঞ্জ')) {
      return {
        text: `[এক্সচেঞ্জ ও কোয়ালিটি পলিসি]:\n১. তাৎক্ষণিক নিরীক্ষণ: ডেলিভারি প্রতিনিধির উপস্থিতিতে ফেব্রিক ও ফিটিংস যাচাই করার সুবিধা রয়েছে।\n২. মেয়াদ: সাইজ অমিল বা ডিফেক্টের ক্ষেত্রে ৭ দিনের মধ্যে ইনস্ট্যান্ট ফ্রি এক্সচেঞ্জ উইন্ডো সক্রিয়।\n৩. শর্তাবলী: মূল ট্যাগ ও অক্ষত চালানপত্র সংরক্ষণ বাধ্যতামূলক।`,
        matchedProducts: [],
        actionPills: [
          { label: '📏 সাইজ মেজারমেন্ট', action: 'open_size_guide' },
          { label: '💬 কাস্টমার কেয়ার', action: 'open_whatsapp' },
        ],
      };
    }

    // 5. Size Guide queries
    if (q.includes('সাইজ') || q.includes('size') || q.includes('মাপ') || q.includes('ফিটিং')) {
      return {
        text: `[সাইজ ম্যাট্রিক্স ও বডি ডাইমেনশন]:\n• মিডিয়াম (M / ৩৮): চেস্ট ৩৮-৩৯ ইঞ্চি, লেন্থ ৪০ ইঞ্চি\n• লার্জ (L / ৪০): চেস্ট ৪০-৪১ ইঞ্চি, লেন্থ ৪২ ইঞ্চি\n• এক্সট্রা লার্জ (XL / ৪২): চেস্ট ৪২-৪৩ ইঞ্চি, লেন্থ ৪৪ ইঞ্চি\n• ডাবল এক্সট্রা লার্জ (XXL / ৪৪): চেস্ট ৪৪-৪৫ ইঞ্চি, লেন্থ ৪৫ ইঞ্চি\nবিস্তারিত স্পেসিফিকেশনের জন্য নিচের সাইজ গাইড বাটনে ক্লিক করুন।`,
        matchedProducts: [],
        actionPills: [
          { label: '📏 সাইজ গাইড ড্যাশবোর্ড', action: 'open_size_guide' },
        ],
      };
    }

    // 6. Product Searches & Logical Analysis
    const matched = this.findRelevantProducts(query, products);
    if (matched.length > 0) {
      const available = matched.filter(p => p.stock > 0);
      const itemsToDisplay = available.length > 0 ? available : matched;
      return {
        text: `[ক্যাটালগ ম্যাচিং ও প্রোডাক্ট এনালিসিস]:\n• অনুসন্ধানের ফলাফলে মোট ${matched.length} টি প্রাসঙ্গিক পোশাক শনাক্ত করা হয়েছে।\n• ফেব্রিক গুণমান, স্টক স্ট্যাটাস এবং মূল্য তালিকা যাচাই করে নিচে সংক্ষিপ্ত আকারে তালিকাভুক্ত করা হলো:`,
        matchedProducts: itemsToDisplay.slice(0, 4),
        actionPills: [
          { label: '🛍️ সম্পূর্ণ স্টোর ভিউ', action: 'browse_all' },
          { label: '📦 ডেলিভারি রেট', action: 'ask_delivery' },
        ],
      };
    }

    // 7. General Welcome / Fallback
    const popular = products.filter(p => p.stock > 0).slice(0, 3);
    return {
      text: `[সিস্টেম রেডি]: আমি "বিসমিল্লাহ কালেকশন"-এর এআই ইনটেলিজেন্স সিস্টেম।\nআমি শুধুমাত্র এই ওয়েবসাইটের সংরক্ষিত ডাটাবেজ থেকে সুনির্দিষ্ট ও পরিশীলিত তথ্য পরিবেশন করি। পাঞ্জাবি, শাড়ি, থ্রি-পিস বা ডেলিভারি রুলস সম্পর্কে যৌক্তিক সমাধান জানতে আপনার প্রশ্ন লিখুন।`,
      matchedProducts: popular.length > 0 ? popular : products.slice(0, 3),
      actionPills: [
        { label: '✨ পাঞ্জাবি কালেকশন', action: 'show_panjabi' },
        { label: '🥻 শাড়ি কালেকশন', action: 'show_saree' },
        { label: '🚚 ডেলিভারি ও পেমেন্ট রুলস', action: 'ask_delivery' },
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
