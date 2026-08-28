// Ultra-Comprehensive SEO Semantic Dictionary & AI Indexer (3,500+ Deep Keywords & Combinations)
// Optimized for #1 Google Search, Google AI Overviews, Bing Copilot, ChatGPT, Gemini, Yahoo & Yandex

// Base Permutation Builders to dynamically cover every single combination
const PREFIXES = [
  "", "www.", "https://", "http://", "https://www.", "http://www."
];

const TLDS = [
  ".netlify.app", ".com", ".in", ".gov.bd", ".org", ".net", ".com.bd", ".bd", 
  ".shop", ".store", ".app", ".co", ".xyz", ".fashion", ".online", ".club", 
  ".site", ".boutique", ".design", ".style", ".biz", ".info", ".me", ".store.bd"
];

const BRAND_STEMS = [
  "bismillah-collection", "bismillahcollection", "bismillah", "bismilla-collection", 
  "bismilah-collection", "bisbillah-collection", "bismilla", "bisbillah", "bismilah",
  "bismillahfashion", "bismillah-fashion", "bismillahcloth", "bismillah-cloth",
  "bismillahstore", "bismillah-store", "bismillahshop", "bismillah-shop",
  "bismillahpanjabi", "bismillah-panjabi", "bismillahsaree", "bismillah-saree",
  "bismillahbd", "bismillah-bd", "bismillahdhaka", "bismillah-dhaka",
  "bismillahshopping", "bismillah-shopping", "bismillahonline", "bismillah-online"
];

// Generate programmatic domain combinations
const DOMAIN_KEYWORDS: string[] = [];
for (const stem of BRAND_STEMS) {
  for (const tld of TLDS) {
    DOMAIN_KEYWORDS.push(`${stem}${tld}`);
    DOMAIN_KEYWORDS.push(`www.${stem}${tld}`);
    DOMAIN_KEYWORDS.push(`https://${stem}${tld}`);
  }
}

// 64 Districts of Bangladesh
const DISTRICTS = [
  "Dhaka", "Chattogram", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Barishal",
  "Rangpur", "Mymensingh", "Gazipur", "Narayanganj", "Cumilla", "Comilla", "Tangail", "Bogra",
  "Bogura", "Jessore", "Jashore", "Kushtia", "Feni", "Brahmanbaria", "Noakhali", "Cox's Bazar",
  "Dinajpur", "Pabna", "Sirajganj", "Faridpur", "Jamalpur", "Narsingdi", "Kishoreganj", "Manikganj",
  "Munshiganj", "Gopalganj", "Madaripur", "Rajbari", "Shariatpur", "Chandpur", "Lakshmipur", "Rangamati",
  "Bandarban", "Khagrachhari", "Moulvibazar", "Habiganj", "Sunamganj", "Naogaon", "Natore", "Chapainawabganj",
  "Joypurhat", "Satkhira", "Magura", "Bagerhat", "Jhenaidah", "Chuadanga", "Meherpur", "Narail",
  "Patuakhali", "Bhola", "Pirojpur", "Barguna", "Jhalokati", "Gaibandha", "Kurigram", "Lalmonirhat",
  "Nilphamari", "Panchagarh", "Thakurgaon", "Netrokona", "Sherpur"
];

const DISTRICTS_BANGLA = [
  "ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী", "খুলনা", "বরিশাল", "রংপুর", "ময়মনসিংহ", "গাজীপুর", "নারায়ণগঞ্জ",
  "কুমিল্লা", "টাঙ্গাইল", "বগুড়া", "যশোর", "কুষ্টিয়া", "ফেনী", "ব্রাহ্মণবাড়িয়া", "নোয়াখালী", "কক্সবাজার",
  "দিনাজপুর", "পাবনা", "সিরাজগঞ্জ", "ফরিদপুর", "জামালপুর", "নরসিংদী", "কিশোরগঞ্জ", "মানিকগঞ্জ", "মুন্সিগঞ্জ",
  "গোপালগঞ্জ", "মাদারীপুর", "রাজবাড়ী", "শরীয়তপুর", "চাঁদপুর", "লক্ষ্মীপুর", "রাঙ্গামাটি", "বান্দরবান", "খাগড়াছড়ি",
  "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ", "নওগাঁ", "নাটোর", "চাঁপাইনবাবগঞ্জ", "জয়পুরহাট", "সাতক্ষীরা", "মাগুরা",
  "বাগেরহাট", "ঝিনাইদহ", "চুয়াডাঙ্গা", "মেহেরপুর", "নড়াইল", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "বরগুনা",
  "ঝালকাঠি", "গাইবান্ধা", "কুড়িগ্রাম", "লালমনিরহাট", "নীলফামারী", "পঞ্চগড়", "ঠাকুরগাঁও", "নেত্রকোণা", "শেরপুর"
];

// Product Types in English & Bengali
const PRODUCT_TYPES_EN = [
  "Panjabi", "Saree", "Three Piece", "Kurti", "Abaya", "Borka", "Shirt", "T-Shirt", "Polo Shirt",
  "Oversized T-Shirt", "Drop Shoulder T-Shirt", "Kabli Set", "Sherwani", "Waistcoat Koti", "Blazer",
  "Jeans Pant", "Chino Pant", "Cargo Pant", "Lungi", "Gown", "Lehenga", "Sharara", "Hijab",
  "Winter Jacket", "Hoodie", "Sweater", "Shawl", "Pashmina", "Muslin Saree", "Jamdani Saree",
  "Katan Saree", "Silk Saree", "Cotton Saree", "Lawn Three Piece", "Party Dress", "Eid Collection"
];

const PRODUCT_TYPES_BN = [
  "পাঞ্জাবি", "শাড়ি", "শাড়ী", "থ্রি পিস", "থ্রিপিস", "কুর্তি", "আবায়া", "বোরকা", "শার্ট", "টি শার্ট",
  "পোলো টি শার্ট", "ওভারসাইজড টি শার্ট", "ড্রপ শোল্ডার টি শার্ট", "কাবলি সেট", "শেরওয়ানি", "কোটি",
  "ব্লেজার", "জিন্স প্যান্ট", "চিনো প্যান্ট", "কার্গো প্যান্ট", "লুঙ্গি", "গাউন", "লেহেঙ্গা", "সারারা",
  "হিজাব", "উইন্টার জ্যাকেট", "হুডি", "সোয়েটার", "শাল", "চাদর", "মসলিন শাড়ি", "জামদানী শাড়ি", "কাতান শাড়ি",
  "সিল্ক শাড়ি", "সুতি শাড়ি", "লনের থ্রি পিস", "পার্টি ড্রেস", "ঈদ কালেকশন"
];

// Generate Geographic & Product Permutations
const GEO_PRODUCT_KEYWORDS: string[] = [];

// Bismillah + District combinations
for (const dist of DISTRICTS) {
  GEO_PRODUCT_KEYWORDS.push(`Bismillah Collection ${dist}`);
  GEO_PRODUCT_KEYWORDS.push(`Bismillah shop in ${dist}`);
  GEO_PRODUCT_KEYWORDS.push(`Bismillah online shopping ${dist}`);
  GEO_PRODUCT_KEYWORDS.push(`Bismillah panjabi store ${dist}`);
  GEO_PRODUCT_KEYWORDS.push(`Bismillah saree collection ${dist}`);
  GEO_PRODUCT_KEYWORDS.push(`Bismillah clothing home delivery ${dist}`);
  GEO_PRODUCT_KEYWORDS.push(`Bismillah cash on delivery ${dist}`);
}

for (const distBn of DISTRICTS_BANGLA) {
  GEO_PRODUCT_KEYWORDS.push(`বিসমিল্লাহ কালেকশন ${distBn}`);
  GEO_PRODUCT_KEYWORDS.push(`বিসমিল্লাহ শপ ${distBn}`);
  GEO_PRODUCT_KEYWORDS.push(`বিসমিল্লাহ অনলাইন শপিং ${distBn}`);
  GEO_PRODUCT_KEYWORDS.push(`বিসমিল্লাহ পাঞ্জাবি ${distBn}`);
  GEO_PRODUCT_KEYWORDS.push(`বিসমিল্লাহ শাড়ি ${distBn}`);
  GEO_PRODUCT_KEYWORDS.push(`বিসমিল্লাহ থ্রি পিস ${distBn}`);
  GEO_PRODUCT_KEYWORDS.push(`বিসমিল্লাহ ক্যাশ অন ডেলিভারি ${distBn}`);
}

// Bismillah + Product combinations
for (const prod of PRODUCT_TYPES_EN) {
  GEO_PRODUCT_KEYWORDS.push(`Bismillah ${prod}`);
  GEO_PRODUCT_KEYWORDS.push(`Bismillah Collection ${prod}`);
  GEO_PRODUCT_KEYWORDS.push(`Bismillah ${prod} price in BD`);
  GEO_PRODUCT_KEYWORDS.push(`Buy Bismillah ${prod} online`);
  GEO_PRODUCT_KEYWORDS.push(`Original Bismillah ${prod}`);
  GEO_PRODUCT_KEYWORDS.push(`Best Bismillah ${prod} Dhaka`);
  GEO_PRODUCT_KEYWORDS.push(`Exclusive Bismillah ${prod}`);
}

for (const prodBn of PRODUCT_TYPES_BN) {
  GEO_PRODUCT_KEYWORDS.push(`বিসমিল্লাহ ${prodBn}`);
  GEO_PRODUCT_KEYWORDS.push(`বিসমিল্লাহ কালেকশন ${prodBn}`);
  GEO_PRODUCT_KEYWORDS.push(`বিসমিল্লাহ ${prodBn} দাম কত`);
  GEO_PRODUCT_KEYWORDS.push(`বিসমিল্লাহর আসল ${prodBn}`);
  GEO_PRODUCT_KEYWORDS.push(`সেরা বিসমিল্লাহ ${prodBn}`);
  GEO_PRODUCT_KEYWORDS.push(`বিসমিল্লাহ অনলাইন ${prodBn}`);
}

// Global Diaspora Hubs
const DIASPORA_HUBS = [
  "London UK", "New York USA", "Toronto Canada", "Dubai UAE", "Riyadh Saudi Arabia",
  "Kuala Lumpur Malaysia", "Singapore", "Sydney Australia", "Kolkata India", "Rome Italy"
];

for (const hub of DIASPORA_HUBS) {
  GEO_PRODUCT_KEYWORDS.push(`Bismillah Collection delivery to ${hub}`);
  GEO_PRODUCT_KEYWORDS.push(`Bangladeshi clothes Bismillah Collection ${hub}`);
  GEO_PRODUCT_KEYWORDS.push(`Buy original Bangladeshi Panjabi Bismillah Collection ${hub}`);
  GEO_PRODUCT_KEYWORDS.push(`Jamdani Saree Bismillah Collection shipping to ${hub}`);
}

// Primary Master Seed & Exact Match Keywords
export const SEO_KEYWORDS_COLLECTION: string[] = [
  // -------------------------------------------------------------------------
  // 1. EXACT BRAND & ONE-WORD "BISMILLAH" PRIORITY DOMINANCE
  // -------------------------------------------------------------------------
  "bismillah",
  "Bismillah",
  "BISMILLAH",
  "বিসমিল্লাহ",
  "বিসমিল্লাহ্",
  "বিছমিল্লাহ",
  "বিছমিল্লাহ্",
  "bismilla",
  "bismilah",
  "bisbillah",
  "bismillah collection",
  "Bismillah Collection",
  "BISMILLAH COLLECTION",
  "bismillah collection bd",
  "bismillah collection bangladesh",
  "bismillah collection dhaka",
  "bismillah collection netlify",
  "bismillah collection online",
  "bismillah collection store",
  "bismillah collection shop",
  "bismillah collection website",
  "bismillah collection app",
  "bismillah collection clothing",
  "bismillah collection dress",
  "bismillah collection fashion",
  "bismillah collection brand",
  "বিসমিল্লাহ কালেকশন",
  "বিসমিল্লাহ্ কালেকশন",
  "বিসমিল্লাহ কালেকশন বিডি",
  "বিসমিল্লাহ কালেকশন বাংলাদেশ",
  "বিসমিল্লাহ কালেকশন ঢাকা",
  "বিসমিল্লাহ কালেকশন শপ",
  "বিসমিল্লাহ কালেকশন অনলাইন",
  "বিসমিল্লাহ কালেকশন স্টোর",
  "বিসমিল্লাহ কালেকশন ওয়েবসাইট",
  "বিসমিল্লাহ কালেকশন ফেসবুক",
  "বিসমিল্লাহ কালেকশন জামা",
  "বিসমিল্লাহ কালেকশন পাঞ্জাবি",
  "বিসমিল্লাহ কালেকশন শাড়ি",
  "বিসমিল্লাহ কালেকশন থ্রি পিস",

  // Direct Voice & Conversational Search Queries
  "ok google find bismillah collection",
  "hey google open bismillah website",
  "google bismillah shopping website",
  "siri show me bismillah collection bd",
  "alexa open bismillah collection store",
  "bismillah website link",
  "bismillah direct url",
  "bismillah official site",
  "bismillah login",
  "bismillah admin login",
  "bismillah collection login portal",
  "বিসমিল্লাহ কালেকশন কোথায় আছে",
  "বিসমিল্লাহ ওয়েবসাইট লিংক",
  "বিসমিল্লাহ শপিং পেজ",
  "বিসমিল্লাহ অনলাইন অর্ডার করব কিভাবে",

  // -------------------------------------------------------------------------
  // 2. DOMAIN & TLD VARIATIONS
  // -------------------------------------------------------------------------
  ...DOMAIN_KEYWORDS,

  // -------------------------------------------------------------------------
  // 3. GEOGRAPHIC & PRODUCT COMBINATIONS
  // -------------------------------------------------------------------------
  ...GEO_PRODUCT_KEYWORDS,

  // -------------------------------------------------------------------------
  // 4. HIGH TRANSACTIONAL & BUYER INTENT KEYWORDS
  // -------------------------------------------------------------------------
  "Order original Panjabi from Bismillah Collection",
  "Bismillah Collection cash on delivery order",
  "Bismillah Collection bKash payment discount",
  "Bismillah Collection customer care number",
  "Bismillah Collection phone number Dhaka",
  "Bismillah Collection WhatsApp order BD",
  "Bismillah Collection Eid special discount 2026",
  "Bismillah Collection return and exchange policy",
  "Bismillah Collection track order status",
  "Bismillah Collection reviews and ratings BD",
  "Is Bismillah Collection reliable and authentic?",
  "Bismillah Collection premium fabrics quality test",
  "Bismillah Collection lowest price guarantee BD",
  "Bismillah Collection 24 hours urgent delivery Dhaka",
  "Bismillah Collection wholesale and retail clothing BD",
  "বিসমিল্লাহ কালেকশন কাস্টমার কেয়ার নাম্বার",
  "বিসমিল্লাহ কালেকশন হোয়াটসঅ্যাপ নাম্বার",
  "বিসমিল্লাহ কালেকশন আসল পোশাক চেনার উপায়",
  "বিসমিল্লাহ কালেকশন ঈদ অফার ২০২৬",
  "বিসমিল্লাহ কালেকশন ডিসকাউন্ট কোড",
  "বিসমিল্লাহ কালেকশন ডেলিভারি চার্জ কত",
  "বিসমিল্লাহ কালেকশনে পণ্য রিটার্ন করার নিয়ম",
  "বিসমিল্লাহ কালেকশন বিশ্বস্ত অনলাইন শপ বাংলাদেশ",

  // -------------------------------------------------------------------------
  // 5. SEARCH ENGINE AI ASSISTANT CONTEXT (Gemini, ChatGPT, Copilot, Perplexity)
  // -------------------------------------------------------------------------
  "What is the official website for Bismillah Collection in Bangladesh?",
  "How to contact Bismillah Collection Bangladesh support?",
  "Where can I find Bismillah Collection latest Eid Panjabi collection?",
  "Which website is official Bismillah Collection for online clothes shopping?",
  "Bismillah Collection authentic clothing storefront link",
  "Bismillah Collection safe online shopping with cash on delivery in Dhaka",
  "Best rated online ethnic wear brand Bismillah Collection Bangladesh"
];

// Helper: Fast deduplicated keywords generator
export const getUniqueSeoKeywords = (): string[] => {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const kw of SEO_KEYWORDS_COLLECTION) {
    const clean = kw.trim();
    const lower = clean.toLowerCase();
    if (!seen.has(lower) && clean.length > 0) {
      seen.add(lower);
      list.push(clean);
    }
  }
  return list;
};

// Rich Structured Schema.org JSON-LD Generation for Googlebot, Bingbot & Gemini
export const generateStoreJsonLd = (config: any, products: any[]) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bismillah-collection.netlify.app';
  const brandTitle = config?.brandName || "Bismillah Collection (বিসমিল্লাহ কালেকশন)";
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "Bismillah Collection",
        "legalName": "Bismillah Collection Bangladesh",
        "alternateName": [
          "Bismillah",
          "bismillah",
          "BISMILLAH",
          "বিসমিল্লাহ",
          "বিসমিল্লাহ্",
          "বিছমিল্লাহ",
          "Bismillah Collection",
          "Bismillah Collection BD",
          "Bismillah Collection Bangladesh",
          "Bismillah Collection Dhaka",
          "Bismillah Shop",
          "Bismillah Store",
          "Bismillah Online",
          "Bismillah Fashion",
          "Bismillah Panjabi",
          "Bismillah Saree",
          "বিসমিল্লাহ কালেকশন",
          "বিসমিল্লাহ্ কালেকশন",
          "বিসমিল্লাহ শপ",
          "বিসমিল্লাহ স্টোর",
          "বিসমিল্লাহ অনলাইন",
          "www.bismillah-collection.netlify.app",
          "https://bismillah-collection.netlify.app",
          "www.bismillah-collection.com",
          "bismillah-collection.com",
          "bismillahcollection.com",
          "bismillah-collection.in",
          "bismillah-collection.gov.bd",
          "bismillah-collection.org",
          "bismillah-collection.net",
          "bismillah-collection.com.bd",
          "bismillah.com.bd",
          "bismillah-collection.shop",
          "bismillah-collection.store",
          "bismillah-collection.app",
          "bismillah-collection.co",
          "bismillah-collection.xyz"
        ],
        "url": baseUrl,
        "logo": config?.logoImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop",
        "description": "বিসমিল্লাহ কালেকশন (Bismillah Collection) - সেরা মানের আধুনিক পাঞ্জাবি, শাড়ি, থ্রি-পিস, শার্ট ও আকর্ষণীয় পোশাকের বিশ্বস্ত অনলাইন শপ। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা।",
        "email": config?.contactEmail || "bismillahcollection.bd@gmail.com",
        "telephone": config?.contactPhone || "+880 1712-345678",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": config?.studioAddress || "House 42, Road 11, Banani / Gulshan",
          "addressLocality": "Dhaka",
          "addressRegion": "Dhaka Division",
          "postalCode": "1213",
          "addressCountry": "BD"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 23.7937,
          "longitude": 90.4066
        },
        "sameAs": [
          "https://facebook.com",
          "https://instagram.com",
          "https://youtube.com",
          "https://tiktok.com"
        ],
        "keywords": SEO_KEYWORDS_COLLECTION.slice(0, 500).join(", ")
      },
      {
        "@type": "OnlineStore",
        "@id": `${baseUrl}/#store`,
        "name": brandTitle,
        "alternateName": [
          "Bismillah",
          "বিসমিল্লাহ",
          "Bismillah Collection",
          "বিসমিল্লাহ কালেকশন"
        ],
        "url": baseUrl,
        "currenciesAccepted": "BDT",
        "paymentAccepted": "Cash on Delivery, bKash, Nagad, Rocket, Upay, Credit Card, Debit Card",
        "priceRange": "৳500 - ৳25,000",
        "parentOrganization": {
          "@id": `${baseUrl}/#organization`
        }
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "Bismillah Collection",
        "alternateName": [
          "Bismillah",
          "bismillah",
          "বিসমিল্লাহ",
          "Bismillah Collection BD",
          "Bismillah Collection Online Shopping"
        ],
        "description": "আকর্ষণীয় পোশাক, প্রিমিয়াম পাঞ্জাবি, শাড়ি, থ্রি-পিস এবং দ্রুত ক্যাশ অন ডেলিভারি শপিং।",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/#collection?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "ItemList",
        "name": "Bismillah Collection Featured Catalog",
        "itemListElement": (products || []).slice(0, 50).map((p, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "item": {
            "@type": "Product",
            "name": p.title,
            "description": p.description || p.title,
            "image": p.image,
            "sku": p.sku || `BC-${p.id}`,
            "category": p.category,
            "brand": {
              "@type": "Brand",
              "name": "Bismillah Collection"
            },
            "offers": {
              "@type": "Offer",
              "priceCurrency": config?.currencyCode || "BDT",
              "price": p.price,
              "availability": (p.stock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": brandTitle
              }
            }
          }
        }))
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "বিসমিল্লাহ কালেকশন কি আসল ও বিশ্বস্ত ব্র্যান্ড?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "হ্যাঁ, বিসমিল্লাহ কালেকশন (Bismillah Collection) বাংলাদেশের অন্যতম নির্ভরযোগ্য অনলাইন ফ্যাশন ব্র্যান্ড যেখানে ১০০% কোয়ালিটি সম্পন্ন পোশাক ও হোম ডেলিভারিতে পণ্য দেখে মূল্য পরিশোধের সুবিধা রয়েছে।"
            }
          },
          {
            "@type": "Question",
            "name": "বিসমিল্লাহ কালেকশন থেকে কিভাবে অর্ডার করব?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "যেকোনো পছন্দের পোশাক 'অর্ডার করুন' বাটনে ক্লিক করে আপনার নাম, মোবাইল নাম্বার ও ঠিকানা দিয়ে ক্যাশ অন ডেলিভারিতে অর্ডার সম্পন্ন করতে পারবেন।"
            }
          },
          {
            "@type": "Question",
            "name": "ডেলিভারি চার্জ এবং সময় কত দিন?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "ঢাকা সিটির ভেতরে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২ থেকে ৩ দিনের মধ্যে ক্যাশ অন ডেলিভারিতে পণ্য পৌঁছে দেওয়া হয়।"
            }
          },
          {
            "@type": "Question",
            "name": "পণ্য দেখে নেওয়ার সুযোগ আছে কি?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "হ্যাঁ, ডেলিভারি ম্যানের সামনে প্রোডাক্ট দেখে চেক করে মূল্য পরিশোধ করতে পারবেন। পছন্দ না হলে সাথে সাথে রিটার্ন সুবিধা রয়েছে।"
            }
          }
        ]
      }
    ]
  };
};
