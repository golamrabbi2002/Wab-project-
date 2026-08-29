# 🛍️ Bismillah Collection - E-Commerce with AI Shopping Assistant

বিসমিল্লাহ কালেকশন একটি অত্যাধুনিক প্রিমিয়াম ই-কমার্স ফ্যাশন প্ল্যাটফর্ম এবং জেমিনি লাইভ এআই ভয়েস শপিং অ্যাসিস্ট্যান্ট সমৃদ্ধ ওয়েব অ্যাপ্লিকেশন।

---

## 🚀 ওয়েবসাইট লাইভ করার উপায় (How to Deploy & Make Live)

শুধু GitHub-এ কোড পুশ করলেই স্বয়ংক্রিয়ভাবে কোনো সার্ভার রান হয় না, তবে নিচের যে কোনো একটি সহজ উপায়ে **১ মিনিটে সম্পূর্ণ ফ্রিতে** ওয়েবসাইট লাইভ করতে পারবেন:

### 🌟 অপশন ১: Vercel দিয়ে ১ ক্লিকে লাইভ (সবচেয়ে সহজ ও দ্রুত)
1. **[vercel.com](https://vercel.com)**-এ যান এবং আপনার **GitHub** অ্যাকাউন্ট দিয়ে লগইন করুন।
2. **"Add New..."** -> **"Project"**-এ ক্লিক করুন।
3. আপনার এই GitHub রিপোজিটরিটি সিলেক্ট করে **"Import"** করুন।
4. **Environment Variables** সেকশনে চাইলে `GEMINI_API_KEY` যুক্ত করতে পারেন (ঐচ্ছিক)।
5. **"Deploy"** বাটনে ক্লিক করুন! ৩০ সেকেন্ডের মধ্যে ওয়েবসাইট সম্পূর্ণ লাইভ হয়ে যাবে এবং একটি ফ্রি ডোমেইন লিঙ্ক পাবেন।

---

### 🌟 অপশন ২: GitHub Pages দিয়ে অটোমেটিক লাইভ
আমরা এই প্রজেক্টে `.github/workflows/deploy.yml` অটোমেশন কনফিগার করে দিয়েছি।
1. আপনার GitHub রিপোজিটরির **Settings** ট্যাবে যান।
2. বাঁপাশের মেনু থেকে **Pages**-এ ক্লিক করুন।
3. **Build and deployment** সেকশনের **Source** ড্রপডাউন থেকে **"GitHub Actions"** অথবা **Deploy from a branch (gh-pages)** সিলেক্ট করুন।
4. এরপর যখনই GitHub-এ কোনো কোড পুশ করবেন, GitHub Actions স্বয়ংক্রিয়ভাবে বিল্ড করে লাইভ করে দেবে!

---

### 🌟 অপশন ৩: Netlify দিয়ে লাইভ
1. **[netlify.com](https://netlify.com)**-এ গিয়ে GitHub দিয়ে লগইন করুন।
2. **"Add new site"** -> **"Import an existing project"** -> GitHub রিপোজিটরি সিলেক্ট করুন।
3. Build command: `npm run build`, Publish directory: `dist`
4. **"Deploy Site"** ক্লিক করুন।

---

### 🌟 অপশন ৪: Render / Railway (ফুল-স্ট্যাক নোড সার্ভার সহ)
1. **[render.com](https://render.com)**-এ গিয়ে **Web Service** তৈরি করুন।
2. Build Command: `npm run build`
3. Start Command: `npm start`
4. Environment Variables-এ `GEMINI_API_KEY` ও `PORT=3000` সেট করুন।

---

## 🛠️ লোকাল ডেভেলপমেন্ট (Local Development)

```bash
# ১. ডিপেন্ডেন্সি ইনস্টল করুন
npm install

# ২. ডেভেলপমেন্ট সার্ভার চালু করুন
npm run dev

# ৩. প্রোডাকশন বিল্ড টেস্ট করুন
npm run build
```

---

## ✨ প্রধান ফিচারসমূহ:
- 🎤 **Gemini AI Live Voice & Chat**: ভয়েস কথা বলা এবং টেক্সট মেসেজ দুটোই সাপোর্ট করে।
- 🛒 **ই-কমার্স শপ**: প্রিমিয়াম পাঞ্জাবি, শাড়ি ও থ্রি-পিস কালেকশন, কুইক ভিউ ও কার্ট সিস্টেম।
- 📦 **রিয়েল-টাইম অর্ডার ট্র্যাকিং**: স্টেপ-বাই-স্টেপ প্রোগ্রেস ট্র্যাকিং।
- 📱 **১০০% মোবাইল ও রেসপন্সিভ ডিজাইন**: আধুনিক ডার্ক ও লাইট থিম সাপোর্ট।
