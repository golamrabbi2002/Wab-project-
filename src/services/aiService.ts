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
   * Main query method that connects to the server-side Gemini API with smart resilient client fallback.
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
        text: 'অনুগ্রহ করে আপনার পছন্দের পোশাক বা কোনো প্রশ্ন বলুন বা লিখুন।',
        spokenSummary: 'অনুগ্রহ করে আপনার পছন্দের পোশাকের কথা বলুন।',
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
            spokenSummary: data.spokenSummary || this.cleanTextForVoice(data.reply).slice(0, 160),
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
   * Clean markdown asterisks, brackets, and emojis for smooth, human-like voice synthesis.
   */
  static cleanTextForVoice(raw: string): string {
    return raw
      .replace(/[*_#`~>\[\]]/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Humanized, high-converting client knowledge engine with storytelling and platform orientation.
   */
  private static localKnowledgeAssistant(
    query: string,
    products: Product[],
    config: StoreConfig
  ): { text: string; spokenSummary?: string; matchedProducts: Product[]; actionPills?: { label: string; action: string }[] } {
    const q = query.toLowerCase().trim();
    const brand = config.brandName || 'বিসমিল্লাহ কালেকশন';
    const topStocked = products.filter(p => p.stock > 0);
    const popular = topStocked.length > 0 ? topStocked.slice(0, 3) : products.slice(0, 3);

    // 1. Personal Inquiries & "How Are You?" Check-ins (Human Empathy First)
    if (
      q.includes('কেমন আছেন') || q.includes('কেমন আছো') || q.includes('kemon achen') ||
      q.includes('kemon aso') || q.includes('how are you') || q.includes('কী খবর') ||
      q.includes('কি খবর') || q.includes('ki khobor') || q.includes('কী অবস্থা') ||
      q.includes('ki obostha') || q.includes('ভাল আছেন') || q.includes('ভালো আছেন')
    ) {
      const text = `আলহামদুলিল্লাহ, মহান আল্লাহর অশেষ রহমতে আমি খুব ভালো আছি! ❤️\n\nআশা করি আপনি ও আপনার পরিবারের সকলেই সুস্থ ও সুন্দর আছেন।\n\nআমাদের ফ্যাশন হাউজে প্রতিটি পাঞ্জাবি ও শাড়ি নিখুঁত ভালোবাসায় ও প্রিমিয়াম ফেব্রিকে বোনা হয়েছে। আজ আপনার কোনো বিশেষ অনুষ্ঠান বা ঈদের জন্য পছন্দের পোশাকটি নির্বাচন করতে আমি সাহায্য করছি।`;
      return {
        text,
        spokenSummary: 'আলহামদুলিল্লাহ, আমি খুব ভালো আছি। আশা করি আপনিও ভালো আছেন। আজ আপনার জন্য কোন পোশাকটি পছন্দ করবো বলুন?',
        matchedProducts: popular,
        actionPills: [
          { label: '✨ ট্রেন্ডিং পাঞ্জাবি কালেকশন', action: 'show_panjabi' },
          { label: '🥻 এক্সক্লুসিভ শাড়ি', action: 'show_saree' },
          { label: '👗 ডিজাইনার থ্রি-পিস', action: 'show_three_piece' },
          { label: '🚚 ডেলিভারি ও ক্যাশ অন ডেলিভারি', action: 'ask_delivery' },
        ],
      };
    }

    // 2. Religious & Cultural Greetings
    if (
      q.includes('সালাম') || q.includes('salam') || q.includes('assalamu') ||
      q.includes('আসসালামু') || q.includes('assalam') || q.includes('as-salamu')
    ) {
      const text = `ওয়া আলাইকুমুস সালাম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহু ভাইয়া/আপু! 🌸✨\n\n${brand}-এ আপনাকে আন্তরিক সম্ভাষণ ও স্বাগতম। এটি একটি প্রিমিয়াম অনলাইন ফ্যাশন প্ল্যাটফর্ম যেখানে আপনি ঐতিহ্যবাহী পাঞ্জাবি, সিল্ক ও জামদানি শাড়ি এবং আকর্ষণীয় থ্রি-পিস কালেকশন পাবেন। সারা বাংলাদেশে ক্যাশ অন ডেলিভারিতে পার্সেল দেখে নেওয়ার ১০০% সুযোগ রয়েছে।\n\nআজকে আপনার জন্য কী ধরনের পোশাক খুঁজে দেব বলুন?`;
      return {
        text,
        spokenSummary: `ওয়া আলাইকুমুস সালাম ওয়া রাহমাতুল্লাহ! বিসমিল্লাহ কালেকশনে আপনাকে স্বাগতম। আজ আপনার জন্য কী ধরনের পোশাক প্রয়োজন বলুন?`,
        matchedProducts: popular,
        actionPills: [
          { label: '✨ প্রিমিয়াম পাঞ্জাবি', action: 'show_panjabi' },
          { label: '🥻 আকর্ষণীয় শাড়ি', action: 'show_saree' },
          { label: '👗 সেরা থ্রি-পিস', action: 'show_three_piece' },
        ],
      };
    }

    if (
      q.includes('নমস্কার') || q.includes('নমস্তে') || q.includes('প্রণাম') ||
      q.includes('namaskar') || q.includes('namaste') || q.includes('pranam')
    ) {
      const text = `নমস্কার! ঈশ্বর আপনার ও আপনার পরিবারের সর্বাঙ্গীন মঙ্গল করুন। 🙏✨\n\n${brand}-এ আপনাকে আন্তরিক স্বাগতম। পূজা, উৎসব বা পারিবারিক অনুষ্ঠানের জন্য আমাদের প্রতিটি পোশাকের বুনন ও সূক্ষ্ম কারুকাজে রয়েছে আভিজাত্যের অনন্য ছোঁয়া।\n\nআজকে আপনার পছন্দের কালেকশনটি দেখতে সাহায্য করতে পেরে আমি আনন্দিত হব!`;
      return {
        text,
        spokenSummary: 'নমস্কার! ঈশ্বর আপনার মঙ্গল করুন। আপনার বিশেষ আয়োজনের জন্য সেরা পোশাকটি বাছাই করতে আমি প্রস্তুত।',
        matchedProducts: popular,
        actionPills: [
          { label: '🥻 গর্জিয়াস শাড়ি কালেকশন', action: 'show_saree' },
          { label: '✨ ঐতিহ্যবাহী পাঞ্জাবি', action: 'show_panjabi' },
          { label: '👗 ডিজাইনার থ্রি-পিস', action: 'show_three_piece' },
        ],
      };
    }

    // 3. Platform & Website Features Explanation
    if (
      q.includes('ওয়েবসাইট') || q.includes('website') || q.includes('প্লাটফর্ম') ||
      q.includes('platform') || q.includes('নিয়ম') || q.includes('rules') ||
      q.includes('কীভাবে অর্ডার') || q.includes('how to order') || q.includes('সম্পর্কে')
    ) {
      const text = `বিসমিল্লাহ কালেকশন (${brand}) বাংলাদেশের একটি বিশ্বস্ত অনলাইন ই-কমার্স ফ্যাশন প্ল্যাটফর্ম! 🛍️✨\n\nএখানে আপনি পাবেন:\n১. 🧵 এক্সক্লুসিভ কালেকশন: হ্যান্ডক্রাফটেড পাঞ্জাবি, জামদানি ও সিল্ক শাড়ি এবং লাক্সারি থ্রি-পিস।\n২. 📦 নিরাপদ ক্যাশ অন ডেলিভারি: পার্সেল রিসিভ করার সময় ডেলিভারিম্যানের সামনে কাপড় ও সাইজ দেখে নেওয়ার ১০০% সুযোগ।\n৩. 🔄 ৭ দিনের ফ্রি সাইজ এক্সচেঞ্জ: সাইজে কোনো সমস্যা হলে সাথে সাথে এক্সচেঞ্জ সুবিধা।\n৪. 🚀 সুপারফাস্ট হোম ডেলিভারি: ঢাকায় ২৪-৪৮ ঘণ্টায় এবং সারা দেশে ২-৩ দিনে পৌঁছে যাবে।\n৫. 🎁 অফার: ৳${config.freeShippingThreshold || 3000}+ অর্ডারে সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি!`;
      return {
        text,
        spokenSummary: `বিসমিল্লাহ কালেকশন একটি প্রিমিয়াম ফ্যাশন ই-কমার্স শপ। এখানে ক্যাশ অন ডেলিভারি, পার্সেল দেখে নেওয়ার সুবিধা এবং ৭ দিনের সাইজ এক্সচেঞ্জ গ্যারান্টি রয়েছে।`,
        matchedProducts: popular,
        actionPills: [
          { label: '🛍️ সব কালেকশন দেখুন', action: 'browse_all' },
          { label: '📏 সাইজ গাইড', action: 'open_size_guide' },
          { label: '📦 অর্ডার ট্র্যাক করুন', action: 'open_tracking' },
        ],
      };
    }

    // 4. Fabric Quality & Artisanal Storytelling
    if (
      q.includes('কাপড়') || q.includes('ফেব্রিক') || q.includes('fabric') ||
      q.includes('রং উঠবে') || q.includes('কোয়ালিটি') || q.includes('quality') ||
      q.includes('সুতি') || q.includes('cotton') || q.includes('মান কেমন') || q.includes('গল্প')
    ) {
      const text = `আমাদের প্রতিটি পোশাকের পেছনে রয়েছে নিপুণ কারিগরি ও ভালোবাসার এক অনন্য গল্প! 💎✨\n\n• 🧵 ফাইন কম্বড কটন ও লাক্সারি সিল্ক: আমাদের সুতাগুলো বিশেষভাবে নির্বাচিত ও প্রাক-ধৌত করা, যা গরমে দেয় শীতল অনুভূতি ও দিনভর আরাম।\n• 🪡 সূক্ষ্ম এমব্রয়ডারি ও স্টিচিং: প্রতিটি কলার ও বুকপাটের ডিজাইন করা হয়েছে নিখুঁত কম্পিউটার ও অভিজ্ঞ কারিগরদের হাতে, যা দীর্ঘস্থায়ী এবং প্রিমিয়াম লুক দেয়।\n• 🛡️ কালার ফাস্টনেস গ্যারান্টি: রঙের স্থায়িত্ব শতভাগ নিশ্চিত।\n• 📦 পার্সেল দেখে নেওয়ার সুবিধা: ডেলিভারিম্যানের সামনে কাপড় ছুঁয়ে দেখে নিশ্চিন্তে রিসিভ করুন।`;
      return {
        text,
        spokenSummary: 'আমাদের কাপড়ে ১০০% ফাইন কম্বড কটন ও লাক্সারি সিল্ক ব্যবহৃত হয়। রঙের শতভাগ নিশ্চয়তা সহ ক্যাশ অন ডেলিভারিতে দেখে নেওয়ার সুযোগ রয়েছে।',
        matchedProducts: popular,
        actionPills: [
          { label: '✨ ট্রেন্ডিং কালেকশন', action: 'browse_all' },
          { label: '📏 সাইজ গাইড', action: 'open_size_guide' },
          { label: '💬 হোয়াটসঅ্যাপে ছবি দেখুন', action: 'open_whatsapp' },
        ],
      };
    }

    // 5. Product Specific Searches with dynamic human-like story creation
    const matched = this.findRelevantProducts(query, products);
    if (matched.length > 0) {
      const available = matched.filter(p => p.stock > 0);
      const itemsToDisplay = available.length > 0 ? available : matched;
      const featured = itemsToDisplay[0];

      // Dynamic artisanal story creation for the matched garment
      let productStory = '';
      if (featured.category === 'Panjabi') {
        productStory = `এই পাঞ্জাবিটি পরলে জুম্মাহ কিংবা যেকোনো পারিবারিক দাওয়াতে আপনার ব্যক্তিত্বে এক রাজকীয় আভিজাত্য ফুটে উঠবে। এর নরম সুতি কটন ফেব্রিক সারাদিনের গরম ও ব্যস্ততায় আপনাকে দেবে পরম স্বস্তি ও ফ্রেশ অনুভূতি।`;
      } else if (featured.category === 'Saree') {
        productStory = `ঐতিহ্যের নিপুণ বুনন আর জমকালো আঁচলের এই শাড়িটি যেকোনো বিয়ে বা উৎসবে আপনাকে কেন্দ্রবিন্দুতে পরিণত করবে। এর হালকা ওজন আর চোখ জুড়ানো জেল্লা আপনাকে এনে দেবে অজস্র আন্তরিক প্রশংসা।`;
      } else {
        productStory = `ডিজাইনার ডিজিটাল প্রিন্ট আর মার্জিত রঙের এই পোশাকটি আপনাকে প্রতিদিনের ফ্যাশনে অনন্য আত্মবিশ্বাস ও স্নিগ্ধ রূপ উপহার দেবে।`;
      }

      const text = `আপনার চমৎকার পছন্দের সাথে মানানসই অসাধারণ কালেকশন পেয়েছি! ✨\n\n📖 [পোশাকের কারিগরি গল্প]:\n${productStory}\n\n🏷️ ${featured.title} — মূল্য মাত্র ${config.currencySymbol || '৳'}${featured.price.toLocaleString('en-BD')}।\nআমাদের প্রতিটি পোশাকে পাচ্ছেন কালার গ্যারান্টি ও ক্যাশ অন ডেলিভারি সুবিধা। স্টক সীমিত থাকায় এখনই আপনার সাইজটি নির্বাচন করুন!`;

      return {
        text,
        spokenSummary: `আপনার পছন্দের সাথে মানানসই পোশাক পেয়েছি। ${featured.title}, এর সফট প্রিমিয়াম ফেব্রিক আপনাকে দারুণ মানাবে। আপনি কি এখনই অর্ডার করতে চান?`,
        matchedProducts: itemsToDisplay.slice(0, 4),
        actionPills: [
          { label: '🛍️ সব কালেকশন দেখুন', action: 'browse_all' },
          { label: '🚚 ডেলিভারি সুবিধা', action: 'ask_delivery' },
          { label: '📏 সাইজ গাইড', action: 'open_size_guide' },
        ],
      };
    }

    // 6. General Fallback
    const text = `আসসালামু আলাইকুম! ${brand}-এ আপনাকে আন্তরিক স্বাগতম। 🌸✨\n\nআমি আপনার পার্সোনাল এআই ফ্যাশন ও ভয়েস কনসালট্যান্ট। এটি আমাদের অফিশিয়াল ই-কমার্স শপ যেখানে বিয়ে, ঈদ ও যেকোনো স্পেশাল আয়োজনের জন্য আকর্ষণীয় পাঞ্জাবি, এক্সক্লুসিভ শাড়ি ও ডিজাইনার থ্রি-পিস পাওয়া যাচ্ছে।\n\nআজকে আপনার জন্য কোন পোশাকটি পছন্দ করবো বলুন?`;
    return {
      text,
      spokenSummary: `আসসালামু আলাইকুম! বিসমিল্লাহ কালেকশনে আপনাকে স্বাগতম। আজ আপনার জন্য কোন স্পেশাল পোশাকটি পছন্দ করবো বলুন?`,
      matchedProducts: popular,
      actionPills: [
        { label: '✨ সেরা পাঞ্জাবি কালেকশন', action: 'show_panjabi' },
        { label: '🥻 আকর্ষণীয় শাড়ি কালেকশন', action: 'show_saree' },
        { label: '👗 ডিজাইনার থ্রি-পিস', action: 'show_three_piece' },
        { label: '🚚 ডেলিভারি নিয়ম', action: 'ask_delivery' },
      ],
    };
  }

  /**
   * Helper to find relevant products based on keywords.
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
