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
   * Synthesizes the wisdom of the world's top 20 sales authorities (Brian Tracy, Zig Ziglar, Chris Voss, Robert Cialdini, Dale Carnegie, Jordan Belfort, etc.).
   */
  private static localKnowledgeAssistant(
    query: string,
    products: Product[],
    config: StoreConfig
  ): { text: string; matchedProducts: Product[]; actionPills?: { label: string; action: string }[] } {
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
      return {
        text: `আলহামদুলিল্লাহ, মহান আল্লাহর অশেষ রহমতে আমি অনেক ভালো আছি! ❤️\n\nআশা করি আপনি এবং আপনার পরিবারের সকলেই সুস্থ ও সুন্দর আছেন।\n\nআপনার যেকোনো উৎসব, জুম্মাহ, বিবাহ কিংবা স্পেশাল দিনের জন্য আমাদের নিজস্ব কারিগরদের নিখুঁত হাতের কাজের প্রিমিয়াম পোশাকগুলো সাজিয়ে রেখেছি। আজ আপনার জন্য কোন আকর্ষণীয় পোশাকটি বাছাই করতে পারি বলুন?`,
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
    // A. Islamic Greetings
    if (
      q.includes('সালাম') || q.includes('salam') || q.includes('assalamu') ||
      q.includes('আসসালামু') || q.includes('assalam') || q.includes('as-salamu')
    ) {
      return {
        text: `ওয়া আলাইকুমুস সালাম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহু! 🌸✨\n\nআপনার উপর এবং আপনার পরিবারের উপর মহান আল্লাহর অফুরন্ত শান্তি ও বরকত বর্ষিত হোক।\n\nবিসমিল্লাহ কালেকশনে আপনাকে আন্তরিক সম্ভাষণ জানাচ্ছি। আমাদের প্রিমিয়াম পাঞ্জাবি, জামদানি ও সিল্ক শাড়ি এবং এক্সক্লুসিভ থ্রি-পিস কালেকশনগুলো গ্রাহকদের মাঝে অত্যন্ত জনপ্রিয়। আজকে আপনার পছন্দের কালেকশনটি বেছে নিতে আমি কীভাবে সাহায্য করতে পারি?`,
        matchedProducts: popular,
        actionPills: [
          { label: '✨ প্রিমিয়াম পাঞ্জাবি', action: 'show_panjabi' },
          { label: '🥻 আকর্ষণীয় শাড়ি', action: 'show_saree' },
          { label: '👗 সেরা থ্রি-পিস', action: 'show_three_piece' },
        ],
      };
    }

    // B. Hindu / Sanatan Greetings
    if (
      q.includes('নমস্কার') || q.includes('নমস্তে') || q.includes('প্রণাম') ||
      q.includes('namaskar') || q.includes('namaste') || q.includes('pranam') ||
      q.includes('হরে কৃষ্ণ') || q.includes('জয় শ্রী')
    ) {
      return {
        text: `নমস্কার! ঈশ্বর আপনার ও আপনার পরিবারের সর্বাঙ্গীন মঙ্গল করুন। 🙏✨\n\nবিসমিল্লাহ কালেকশনে আপনাকে আন্তরিক স্বাগতম। আপনার যেকোনো পূজা-পার্বণ, উৎসব বা বিশেষ পারিবারিক অনুষ্ঠানের জন্য আমাদের প্রতিটি পোশাকের ডিজাইন ও ফেব্রিকে আভিজাত্যের অনন্য ছোঁয়া রাখা হয়েছে। আপনার পছন্দ অনুযায়ী সেরা পোশাকটি সাজেস্ট করতে পেরে আমি অত্যন্ত আনন্দিত হব!`,
        matchedProducts: popular,
        actionPills: [
          { label: '🥻 গর্জিয়াস শাড়ি কালেকশন', action: 'show_saree' },
          { label: '✨ ঐতিহ্যবাহী পাঞ্জাবি', action: 'show_panjabi' },
          { label: '👗 ডিজাইনার থ্রি-পিস', action: 'show_three_piece' },
        ],
      };
    }

    // C. General / Universal Greetings
    if (
      q === 'হাই' || q === 'হ্যালো' || q === 'hello' || q === 'hi' || q === 'hey' ||
      q.includes('শুভ সকাল') || q.includes('শুভ দুপুর') || q.includes('শুভ সন্ধ্যা') ||
      q.includes('good morning') || q.includes('good evening') || q.includes('আদাব')
    ) {
      return {
        text: `শুভ দিন! বিসমিল্লাহ কালেকশনে আপনাকে সাদর সম্ভাষণ ও আন্তরিক স্বাগতম। ✨\n\nআমি আপনার পার্সোনাল ফ্যাশন ও সেলস কনসালট্যান্ট। আপনার ব্যক্তিত্বকে সবচেয়ে আকর্ষণীয়ভাবে ফুটিয়ে তুলতে আমাদের সেরা কোয়ালিটির আউটফিটগুলো প্রস্তুত রয়েছে।\n\nআজকে আপনার জন্য কোন স্পেশাল কালেকশনটি দেখতে চান?`,
        matchedProducts: popular,
        actionPills: [
          { label: '✨ পাঞ্জাবি কালেকশন', action: 'show_panjabi' },
          { label: '🥻 এক্সক্লুসিভ শাড়ি', action: 'show_saree' },
          { label: '👗 থ্রি-পিস কালেকশন', action: 'show_three_piece' },
        ],
      };
    }

    // 3. Fabric, Quality & Authenticity Guarantee (Belfort Certainty & Tracy Value)
    if (
      q.includes('কাপড়') || q.includes('ফেব্রিক') || q.includes('fabric') ||
      q.includes('রং উঠবে') || q.includes('কোয়ালিটি') || q.includes('quality') ||
      q.includes('সুতি') || q.includes('cotton') || q.includes('মান কেমন')
    ) {
      return {
        text: `আমাদের কাপড়ের প্রিমিয়াম কোয়ালিটি নিয়ে আপনি শতভাগ নিশ্চিন্ত থাকতে পারেন! 💎✨\n\n• 🧵 ১০০% পিওর ফাইন কম্বড কটন ও লাক্সারি সিল্ক ফেব্রিক ব্যবহৃত হয়, যা সারাদিন পরলেও অত্যন্ত আরামদায়ক ও ব্রিদেবল।\n• 🛡️ কালার ফাস্টনেস গ্যারান্টি: সঠিক ওয়াশে রং উঠবে না এবং কলারের শেইপ থাকবে নিখুঁত।\n• 📦 ১০০% সেফটি রুল: পার্সেল পৌঁছালে ডেলিভারিম্যানের সামনে ফেব্রিক ও ফিনিশিং হাত দিয়ে ছুঁয়ে দেখে নেওয়ার সুযোগ রয়েছে।\n\nনিচে আমাদের সর্বোচ্চ প্রশংসিত কিছু ফেব্রিক কালেকশন দেওয়া হলো:`,
        matchedProducts: popular,
        actionPills: [
          { label: '✨ ট্রেন্ডিং কালেকশন', action: 'browse_all' },
          { label: '📏 সাইজ গাইড', action: 'open_size_guide' },
          { label: '💬 হোয়াটসঅ্যাপে ছবি দেখুন', action: 'open_whatsapp' },
        ],
      };
    }

    // 4. Check for unavailable product queries (Redirecting with high sales persuasion)
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
      return {
        text: `আন্তরিক ধন্যবাদ আপনার পছন্দের কথা জানানোর জন্য! ❤️\n\nআমাদের নিজস্ব ফ্যাশন হাউজে প্রতিটি পোশাকে ১০০% নিখুঁত কোয়ালিটি ও ফিনিশিং নিশ্চিত করার জন্য আমরা বর্তমানে প্রিমিয়াম পাঞ্জাবি, এক্সক্লুসিভ শাড়ি ও ডিজাইনার থ্রি-পিস কালেকশনের ওপর বিশেষ মনোযোগ দিচ্ছি।\n\nআপনার যেকোনো উৎসব বা স্পেশাল দিনের জন্য আমাদের সবচেয়ে জনপ্রিয় ও আভিজাত্যপূর্ণ কিছু কালেকশন নিচে দেখে নিতে পারেন—যা আপনাকে এক অনন্য ব্যক্তিত্ব এনে দেবে!`,
        matchedProducts: popular,
        actionPills: [
          { label: '✨ ট্রেন্ডিং পাঞ্জাবি কালেকশন', action: 'show_panjabi' },
          { label: '🥻 এক্সক্লুসিভ শাড়ি', action: 'show_saree' },
          { label: '👗 ডিজাইনার থ্রি-পিস', action: 'show_three_piece' },
        ],
      };
    }

    // 5. Delivery queries (Eliminating buying friction)
    if (q.includes('ডেলিভারি') || q.includes('delivery') || q.includes('চার্জ') || q.includes('charge') || q.includes('shipping')) {
      const dhaka = config.deliveryDhakaCity ?? 70;
      const outside = config.deliveryOutsideDhaka ?? 130;
      const freeOver = config.freeShippingThreshold ?? 3000;
      return {
        text: `আপনার সুবিধাজনক ও আনন্দদায়ক শপিংয়ের জন্য আমাদের সুপারফাস্ট ডেলিভারি ব্যবস্থা: 🚀\n\n• 📍 ঢাকা সিটির ভেতরে: মাত্র ৳${dhaka} (১-২ দিনের মধ্যে সুপার ফাস্ট হোম ডেলিভারি)\n• 🚚 ঢাকার বাইরে সারা বাংলাদেশে: মাত্র ৳${outside} (২-৩ দিনে নিরাপদ হোম ডেলিভারি)\n• 🎁 মেগা অফার: ৳${freeOver} বা তার বেশি শপিং করলেই সারা বাংলাদেশে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!\n\nসবচেয়ে বড় স্বস্তি হলো—ক্যাশ অন ডেলিভারিতে পার্সেল হাতে পেয়ে ডেলিভারিম্যানের সামনে দেখে মূল্য পরিশোধ করতে পারবেন। এখনই পছন্দের পোশাকটি অর্ডার করুন!`,
        matchedProducts: [],
        actionPills: [
          { label: '📦 অর্ডার ট্র্যাক করুন', action: 'open_tracking' },
          { label: '🛍️ শপিং শুরু করুন', action: 'browse_all' },
        ],
      };
    }

    // 6. Payment queries
    if (q.includes('পেমেন্ট') || q.includes('payment') || q.includes('বিকাশ') || q.includes('bkash') || q.includes('নগদ') || q.includes('nagad') || q.includes('টাকা')) {
      const bkash = config.bkashMerchantNumber || '01712-345678';
      const nagad = config.nagadMerchantNumber || '01812-345678';
      return {
        text: `আপনার সুবিধার জন্য সব ধরনের নিরাপদ পেমেন্ট সুবিধা উন্মুক্ত রয়েছে: 💳\n\n১. ক্যাশ অন ডেলিভারি (Cash on Delivery): পণ্য হাতে পেয়ে ডেলিভারিম্যানকে মূল্য পরিশোধ করুন—কোনো অগ্রিম পেমেন্টের ঝুঁকি নেই।\n২. বিকাশ মার্চেন্ট পেমেন্ট: ${bkash}\n৩. নগদ মার্চেন্ট পেমেন্ট: ${nagad}\n\nচেকআউট পৃষ্ঠায় কোনো বাড়তি ঝামেলা ছাড়াই আপনি সরাসরি পছন্দের পেমেন্ট অপশনটি বেছে নিতে পারবেন!`,
        matchedProducts: [],
        actionPills: [
          { label: '🛍️ কালেকশন ব্রাউজ করুন', action: 'browse_all' },
          { label: '💬 হোয়াটসঅ্যাপে সরাসরি কথা বলুন', action: 'open_whatsapp' },
        ],
      };
    }

    // 7. Return & Exchange queries
    if (q.includes('রিটার্ন') || q.includes('return') || q.includes('বদল') || q.includes('exchange') || q.includes('চেঞ্জ')) {
      return {
        text: `আমাদের সাথে আপনার প্রতিটি শপিং শতভাগ ঝুঁকিমুক্ত ও আনন্দদায়ক: 🛡️✨\n\n• 📦 পার্সেল রিসিভ করার সময় ডেলিভারিম্যানের সামনে কাপড় ও সাইজ চেক করে নেওয়ার পূর্ণ সুবিধা রয়েছে।\n• 🔄 সাইজ বা ফিটিংসে কোনো সমস্যা হলে ৭ দিনের মধ্যে তাৎক্ষণিক ফ্রি সাইজ এক্সচেঞ্জ ও রিটার্ন গ্যারান্টি পাবেন।\n\nআমরা সবসময় চাই আমাদের প্রতিটি পোশাক পরে আপনি সবার প্রশংসা ও পরম স্বাচ্ছন্দ্য পান!`,
        matchedProducts: [],
        actionPills: [
          { label: '📏 সাইজ গাইড চার্ট', action: 'open_size_guide' },
          { label: '💬 কাস্টমার কেয়ার হেল্পলাইন', action: 'open_whatsapp' },
        ],
      };
    }

    // 8. Size Guide queries
    if (q.includes('সাইজ') || q.includes('size') || q.includes('মাপ') || q.includes('ফিটিং')) {
      return {
        text: `নিখুঁত ফিটিং আপনার আভিজাত্যকে আরও আকর্ষণীয় করে তুলবে! 👔\n\nআমাদের স্ট্যান্ডার্ড সাইজ পরিমাপ:\n• মিডিয়াম (M / ৩৮): বুক ৩৮-৩৯ ইঞ্চি, লম্বা ৪০ ইঞ্চি\n• লার্জ (L / ৪০): বুক ৪০-৪১ ইঞ্চি, লম্বা ৪২ ইঞ্চি\n• এক্সেল (XL / ৪২): বুক ৪২-৪৩ ইঞ্চি, লম্বা ৪৪ ইঞ্চি\n• ডাবল এক্সেল (XXL / ৪৪): বুক ৪৪-৪৫ ইঞ্চি, লম্বা ৪৫ ইঞ্চি\n\nনিচের "সাইজ গাইড চার্ট" বাটনে ক্লিক করে আপনি বিস্তারিত সাইজ ড্যাশবোর্ডটি দেখে নিতে পারেন।`,
        matchedProducts: [],
        actionPills: [
          { label: '📏 সাইজ গাইড চার্ট', action: 'open_size_guide' },
        ],
      };
    }

    // 9. Product Searches & High-Converting Recommendations
    const matched = this.findRelevantProducts(query, products);
    if (matched.length > 0) {
      const available = matched.filter(p => p.stock > 0);
      const itemsToDisplay = available.length > 0 ? available : matched;
      return {
        text: `আপনার চমৎকার ও রুচিশীল পছন্দের সাথে মানানসই সেরা কালেকশনগুলো বাছাই করেছি! ✨\n\nএই পোশাকগুলোর আরামদায়ক প্রিমিয়াম ফেব্রিক ও আকর্ষণীয় ফিনিশিং আমাদের ক্রেতাদের অত্যন্ত প্রিয়। লিমিটেড স্টক থাকায় দ্রুত আপনার সাইজটি সিলেক্ট করে অর্ডার কনফার্ম করে নিতে পারেন:`,
        matchedProducts: itemsToDisplay.slice(0, 4),
        actionPills: [
          { label: '🛍️ সব কালেকশন দেখুন', action: 'browse_all' },
          { label: '🚚 ডেলিভারি সুবিধা', action: 'ask_delivery' },
        ],
      };
    }

    // 10. General Welcome & Flattering Sales Invitation
    return {
      text: `আসসালামু আলাইকুম! ${brand}-এ আপনাকে আন্তরিক স্বাগতম। 🌸\n\nআমি আপনার পার্সোনাল ফ্যাশন ও সেলস কনসালট্যান্ট। বিয়ে, ঈদ বা যেকোনো স্পেশাল অনুষ্ঠানের জন্য আকর্ষণীয় পাঞ্জাবি, এক্সক্লুসিভ শাড়ি ও ডিজাইনার থ্রি-পিস কালেকশন থেকে আপনার মনের মতো পোশাকটি বাছাই করতে আমি সবসময় আপনার পাশে আছি।\n\nআজকে আপনার জন্য কোন স্পেশাল পোশাকটি দেখতে চান বলুন?`,
      matchedProducts: popular,
      actionPills: [
        { label: '✨ সেরা পাঞ্জাবি কালেকশন', action: 'show_panjabi' },
        { label: '🥻 আকর্ষণীয় শাড়ি কালেকশন', action: 'show_saree' },
        { label: '👗 ডিজাইনার থ্রি-পিস', action: 'show_three_piece' },
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
