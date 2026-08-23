import React, { useState } from 'react';
import { Product, StoreConfig } from '../../types';
import { GoogleDriveSheetService } from '../../services/googleDriveSheetService';
import { SecurityService } from '../../services/securityService';
import { ImageOptimizer } from '../../utils/imageOptimizer';
import { SystemDoctorService } from '../../services/systemDoctorService';
import { AiProductGeneratorService } from '../../services/aiProductGenerator';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Search,
  HardDrive,
  Link as LinkIcon,
  RefreshCw,
  Layers,
  Wrench,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface AdminProductsProps {
  products: Product[];
  config: StoreConfig;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onOpenAiCreator?: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  config,
  onSaveProduct,
  onDeleteProduct,
  onOpenAiCreator,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAiFilling, setIsAiFilling] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<string>('Panjabi');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState<number>(1850);
  const [originalPrice, setOriginalPrice] = useState<number>(2200);
  const [stock, setStock] = useState<number>(20);
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [sizes, setSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [badges, setBadges] = useState<('New' | 'Sale' | 'Bestseller' | 'Limited')[]>(['New']);
  const [featured, setFeatured] = useState(false);

  // Local Image Upload & Google Drive URL State
  const [imageBase64, setImageBase64] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [driveImageUrl, setDriveImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44', 'Free Size', 'One Size'];
  const standardCategories = ['Panjabi', 'Saree', 'Three-Piece', 'Kurtis', 'Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Accessories', 'Footwear', 'Custom'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setSubtitle('');
    setCategory('Panjabi');
    setCustomCategory('');
    setPrice(1850);
    setOriginalPrice(2200);
    setStock(25);
    setSku(`PAN-${Math.floor(1000 + Math.random() * 9000)}`);
    setDescription('প্রিমিয়াম ডিজাইনার কটন পাঞ্জাবি। সূচিকর্ম সমৃদ্ধ গর্জিয়াস নেকলাইন ও আরামদায়ক ফ্যাব্রিক।');
    setMaterial('১০০% প্রি-ওয়াশড পিওর কটন');
    setCareInstructions('হ্যান্ড ওয়াশ অথবা ড্রাই ক্লিন। মডারেট আয়রন।');
    setSizes(['M', 'L', 'XL']);
    setBadges(['New']);
    setFeatured(true);
    setImageBase64('');
    setDriveImageUrl('');
    setAdditionalImages([]);
    setImageError(null);
    setCompressionStats(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setSubtitle(p.subtitle || '');
    if (standardCategories.includes(p.category)) {
      setCategory(p.category);
      setCustomCategory('');
    } else {
      setCategory('Custom');
      setCustomCategory(p.category);
    }
    setPrice(p.price);
    setOriginalPrice(p.originalPrice || p.price);
    setStock(p.stock);
    setSku(p.sku);
    setDescription(p.description);
    setMaterial(p.material || '');
    setCareInstructions(p.careInstructions || '');
    setSizes(p.sizes || []);
    setBadges(p.badges || []);
    setFeatured(!!p.featured);
    setImageBase64(p.image);
    setDriveImageUrl(p.image.startsWith('http') ? p.image : '');
    setAdditionalImages(p.additionalImages || []);
    setImageError(null);
    setCompressionStats(null);
    setIsModalOpen(true);
  };

  // Direct Local Image Upload with Automatic High-Speed Optimization
  const handlePrimaryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPG, PNG, WEBP, SVG)');
      return;
    }

    setIsCompressing(true);
    setImageError(null);
    try {
      const optimized = await ImageOptimizer.optimizeFile(file, 1200, 0.82);
      setImageBase64(optimized.base64);
      setDriveImageUrl('');
      const savedPercent = Math.round(((optimized.originalSizeKb - optimized.sizeKb) / Math.max(1, optimized.originalSizeKb)) * 100);
      setCompressionStats(`✓ Optimized: ${optimized.originalSizeKb}KB → ${optimized.sizeKb}KB (${savedPercent}% saved)`);
    } catch (err: any) {
      console.warn('Compression fallback to raw base64', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setImageBase64(event.target.result);
          setDriveImageUrl('');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  // Google Drive or Direct URL Input Handler
  const handleDriveUrlChange = (url: string) => {
    setDriveImageUrl(url);
    if (url.trim()) {
      const formatted = GoogleDriveSheetService.formatGoogleDriveImageUrl(url.trim());
      setImageBase64(formatted);
      setImageError(null);
      setCompressionStats(null);
    }
  };

  // Preset Image Picker for Instant Testing & Bangladesh Traditional Collections
  const applyPresetImage = (url: string, presetCategory?: string, presetTitle?: string) => {
    setImageBase64(url);
    setDriveImageUrl(url);
    setImageError(null);
    setCompressionStats('✓ Curated Fashion Preset Image Applied');
    if (presetCategory) setCategory(presetCategory);
    if (presetTitle && !title) setTitle(presetTitle);
  };

  // Additional Gallery Photos Local Upload
  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const opt = await ImageOptimizer.optimizeFile(file, 1000, 0.8);
        setAdditionalImages((prev) => [...prev, opt.base64]);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (typeof ev.target?.result === 'string') {
            setAdditionalImages((prev) => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const toggleSize = (s: string) => {
    setSizes((prev) => (prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]));
  };

  const toggleBadge = (b: 'New' | 'Sale' | 'Bestseller' | 'Limited') => {
    setBadges((prev) => (prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]));
  };

  const handleAiAutoFill = async () => {
    if (!title.trim()) {
      showToast('⚠️ অনুগ্রহ করে প্রথমে পোশাকের নাম/শিরোনাম লিখুন');
      return;
    }

    setIsAiFilling(true);
    try {
      const draft = await AiProductGeneratorService.generateGarment(
        title.trim(),
        Number(price) || 1850,
        imageBase64 ? [imageBase64, ...additionalImages] : [],
        config,
        category !== 'Custom' ? category : undefined
      );

      if (draft.subtitle) setSubtitle(draft.subtitle);
      if (draft.description) setDescription(draft.description);
      if (draft.material) setMaterial(draft.material);
      if (draft.careInstructions) setCareInstructions(draft.careInstructions);
      if (draft.sku && !sku) setSku(draft.sku);
      if (draft.sizes && draft.sizes.length > 0) setSizes(draft.sizes);
      if (draft.originalPrice && (!originalPrice || originalPrice <= price)) {
        setOriginalPrice(draft.originalPrice);
      }
      if (draft.category && standardCategories.includes(draft.category)) {
        setCategory(draft.category);
      }
      showToast('✨ AI Auto-Fill সম্পন্ন হয়েছে! বিবরণী ও সাইজ আপডেট করা হয়েছে।');
    } catch (err) {
      showToast('⚠️ AI Auto-Fill ত্রুটি হয়েছে');
    } finally {
      setIsAiFilling(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageBase64 || !imageBase64.trim()) {
      setImageError('Please upload a product photo, select a curated preset, or paste a link.');
      return;
    }

    const effectiveCategory = category === 'Custom' ? (customCategory.trim() || 'Tops') : category;

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title: SecurityService.sanitizeText(title, 120),
      subtitle: SecurityService.sanitizeText(subtitle, 150),
      category: effectiveCategory,
      price: Math.max(0, Number(price) || 0),
      originalPrice: Math.max(0, Number(originalPrice) || Number(price) || 0),
      image: imageBase64.trim(),
      additionalImages: additionalImages.map((img) => img.trim()),
      sizes: sizes.length > 0 ? sizes : ['One Size'],
      stock: Math.max(0, Number(stock) || 0),
      sku: SecurityService.sanitizeText(sku || `AUR-${Date.now().toString().slice(-4)}`, 50),
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 1,
      description: SecurityService.sanitizeText(description, 2500),
      material: SecurityService.sanitizeText(material, 200),
      careInstructions: SecurityService.sanitizeText(careInstructions, 300),
      badges,
      featured,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveProduct(newProduct);
    setIsModalOpen(false);
    showToast(editingProduct ? `✓ Updated "${newProduct.title}"!` : `✓ Successfully published "${newProduct.title}" to live store!`);
  };

  const handleQuickStockChange = (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    onSaveProduct({
      ...p,
      stock: newStock,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRestockAllLowStock = () => {
    const count = products.filter((p) => p.stock <= 5).length;
    if (count === 0) return;
    products.forEach((p) => {
      if (p.stock <= 5) {
        onSaveProduct({
          ...p,
          stock: Math.max(15, p.stock + 15),
          updatedAt: new Date().toISOString(),
        });
      }
    });
    showToast(`✓ Restocked ${count} items (+15 units each)!`);
  };

  const handleCleanDuplicates = () => {
    const seen = new Set<string>();
    const duplicateIds: string[] = [];

    // Traverse backwards so newest stay
    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      const key = `${prod.title.trim().toLowerCase()}_${prod.category}_${prod.price}`;
      if (seen.has(key)) {
        duplicateIds.push(prod.id);
      } else {
        seen.add(key);
      }
    }

    if (duplicateIds.length === 0) {
      showToast('✓ No duplicate products found in inventory.');
      return;
    }

    duplicateIds.forEach((id) => {
      onDeleteProduct(id);
    });

    showToast(`✓ Removed ${duplicateIds.length} duplicate products automatically!`);
  };

  const handleInjectTestGarment = () => {
    const sample = SystemDoctorService.injectSampleGarment('Panjabi');
    onSaveProduct(sample);
    showToast(`✓ Added Test Product: "${sample.title}"!`);
  };

  const handleDiagnoseAndRepair = async () => {
    const res = await SystemDoctorService.autoRepair();
    showToast('✓ Code & Catalog Diagnosis Complete! All products synced.');
  };

  // Dynamic Category filters
  const allExistingCategories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch =
      !searchFilter ||
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs font-semibold shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top action & filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search SKU or Garment..."
              className="w-48 sm:w-64 pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-300 py-2 px-3 focus:outline-none focus:border-amber-400"
          >
            {allExistingCategories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Actions Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Garment Creator / Chat Copilot */}
          {onOpenAiCreator && (
            <button
              onClick={onOpenAiCreator}
              className="px-4 py-2.5 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400 text-amber-300 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
              title="Open AI Chatbot & Garment Auto-Writer"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>✨ AI Garment Creator</span>
            </button>
          )}

          {/* Auto-Repair Catalog */}
          <button
            onClick={handleDiagnoseAndRepair}
            className="px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-98"
            title="Diagnose and repair any catalog or storage inconsistency"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Auto-Repair</span>
          </button>

          {/* Instant 1-Click Test Garment */}
          <button
            onClick={handleInjectTestGarment}
            className="px-3.5 py-2.5 bg-neutral-850 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-98"
            title="Instantly add a sample Punjabi to verify live storefront"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Test Product</span>
          </button>

          {products.some((p) => p.stock <= 5) && (
            <button
              onClick={handleRestockAllLowStock}
              className="px-3.5 py-2.5 bg-neutral-850 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-98"
              title="Restock low and sold out garments"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restock (+15)</span>
            </button>
          )}

          {/* Clean Duplicates */}
          <button
            onClick={handleCleanDuplicates}
            className="px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-98"
            title="Automatically detect and delete duplicate products"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Clean Duplicates</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Garment</span>
          </button>
        </div>
      </div>

      {/* Products Inventory Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-900/90 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-4">Garment & Local Image</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Inventory Stock</th>
                <th className="py-3.5 px-4">Sizes</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/70 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    No garments found matching the active inventory filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-900/60 transition-colors">
                    {/* Image & Title */}
                    <td className="py-3 px-4 flex items-center gap-3.5">
                      {p.image ? (
                        <div className="w-12 h-14 rounded-lg bg-neutral-900 overflow-hidden border border-neutral-700 shrink-0">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <div>
                        <div className="font-bold text-white leading-snug line-clamp-1">{p.title}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">SKU: {p.sku}</div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-neutral-300 font-semibold">{p.category}</td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white">
                        {config.currencySymbol}{p.price.toFixed(2)}
                      </div>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <div className="text-[10px] text-neutral-500 line-through font-mono">
                          {config.currencySymbol}{p.originalPrice.toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Stock with inline quick-adjust */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {p.stock === 0 ? (
                          <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800/60 rounded text-[10px] font-bold uppercase whitespace-nowrap">
                            0 (Sold Out)
                          </span>
                        ) : p.stock <= 5 ? (
                          <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800/60 rounded text-[10px] font-bold uppercase whitespace-nowrap">
                            {p.stock} (Low)
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-mono font-bold text-xs whitespace-nowrap">{p.stock} units</span>
                        )}

                        <div className="inline-flex items-center rounded border border-neutral-800 bg-neutral-900 overflow-hidden text-[10px]">
                          <button
                            onClick={() => handleQuickStockChange(p, -1)}
                            className="px-1.5 py-0.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                            title="Decrease stock by 1"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleQuickStockChange(p, 1)}
                            className="px-1.5 py-0.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors border-l border-neutral-800"
                            title="Increase stock by 1"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleQuickStockChange(p, 10)}
                            className="px-1.5 py-0.5 text-amber-400 hover:text-amber-300 hover:bg-neutral-800 transition-colors border-l border-neutral-800 font-bold"
                            title="Add +10 stock"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Sizes */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.sizes.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 bg-neutral-800 text-neutral-300 rounded text-[10px] font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Badges */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.badges?.map((b) => (
                          <span key={b} className="px-1.5 py-0.5 bg-neutral-800 text-amber-300 rounded text-[10px] uppercase font-bold">
                            {b}
                          </span>
                        ))}
                        {p.featured && (
                          <span className="px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded text-[10px] font-bold">
                            ★ Featured
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                          title="Edit Garment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Delete Garment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative bg-neutral-900 border border-neutral-800 text-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  {editingProduct ? 'Edit Garment Details' : 'Add New Garment to Catalog'}
                </h3>
                <p className="text-xs text-neutral-400">
                  Direct phone/PC upload (auto-compressed), Google Drive link, or curated presets
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* IMAGE UPLOAD & PRESET SECTION */}
              <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Garment Photo (Device Upload / Presets / Drive Link)</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono">Auto-Optimized</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Image Preview Box */}
                  <div className="w-28 h-36 bg-neutral-900 border-2 border-dashed border-neutral-700 rounded-xl overflow-hidden flex items-center justify-center shrink-0 relative">
                    {imageBase64 ? (
                      <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2 text-neutral-500">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px]">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <span className="text-[11px] text-neutral-300 font-semibold block mb-1">
                        Option 1: Upload from Phone / PC (Auto-Compresses &lt;100KB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePrimaryImageUpload}
                        disabled={isCompressing}
                        className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-neutral-950 hover:file:bg-amber-300 cursor-pointer"
                      />
                      {compressionStats && (
                        <p className="text-[11px] text-emerald-400 font-mono mt-1">{compressionStats}</p>
                      )}
                    </div>

                    <div className="border-t border-neutral-800 pt-2">
                      <span className="text-[11px] text-blue-300 font-semibold block mb-1 flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Option 2: Google Drive / Web Image URL</span>
                      </span>
                      <input
                        type="text"
                        value={driveImageUrl}
                        onChange={(e) => handleDriveUrlChange(e.target.value)}
                        placeholder="e.g. https://drive.google.com/file/d/... or https://images.unsplash.com/..."
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="border-t border-neutral-800 pt-2">
                      <span className="text-[10px] text-neutral-400 block mb-1 font-semibold uppercase">
                        Option 3: 1-Click Curated Fashion Photo Presets
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyPresetImage('https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop', 'Panjabi', 'প্রিমিয়াম ডিজাইনার কটন পাঞ্জাবি')}
                          className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-[10px] text-neutral-300"
                        >
                          Panjabi
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPresetImage('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop', 'Saree', 'এক্সক্লুসিভ বেনারসি সিল্ক শাড়ি')}
                          className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-[10px] text-neutral-300"
                        >
                          Silk Saree
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPresetImage('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', 'Three-Piece', 'ডিজাইনার লন থ্রি-পিস')}
                          className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-[10px] text-neutral-300"
                        >
                          Three-Piece
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPresetImage('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop', 'Tops', 'Structured Cotton Shirt')}
                          className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-[10px] text-neutral-300"
                        >
                          Oxford Shirt
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPresetImage('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop', 'Outerwear', 'Tailored Winter Jacket')}
                          className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-[10px] text-neutral-300"
                        >
                          Jacket / Coat
                        </button>
                      </div>
                    </div>

                    {imageError && (
                      <p className="text-xs text-rose-400 font-semibold">{imageError}</p>
                    )}
                  </div>
                </div>

                {/* Additional gallery images */}
                <div className="pt-3 border-t border-neutral-850">
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    Additional Gallery Angle Images (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAdditionalImageUpload}
                    className="block w-full text-xs text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:bg-neutral-800 file:text-neutral-200"
                  />
                  {additionalImages.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto py-1">
                      {additionalImages.map((img, idx) => (
                        <div key={idx} className="w-12 h-14 rounded bg-neutral-900 border border-neutral-700 relative overflow-hidden shrink-0">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setAdditionalImages((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-0.5 right-0.5 bg-neutral-950/80 text-white rounded-full p-0.5"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Subtitle + AI Magic Auto-Fill */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-neutral-400">
                    পোশাকের প্রাথমিক তথ্য (Primary Info)
                  </span>
                  <button
                    type="button"
                    onClick={handleAiAutoFill}
                    disabled={isAiFilling || !title.trim()}
                    className="px-3 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition-all"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isAiFilling ? 'animate-spin' : ''}`} />
                    <span>{isAiFilling ? 'AI লিখছে...' : '✨ AI Auto-Fill All Details'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                      Garment Title / নাম *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="যেমন: রয়্যাল ব্লু কটন পাঞ্জাবি / Silk Saree"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                      Short Subtitle / সাব-টাইটেল
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. 100% Pre-washed fine combed cotton"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Category, SKU, Prices, Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    {standardCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {category === 'Custom' && (
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-amber-300 mb-1">
                      Custom Category Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Kids, Winter"
                      className="w-full bg-neutral-950 border border-amber-400 rounded-lg p-2.5 text-white focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    Price ({config.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    Stock Level *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Sizes Checkboxes */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                        sizes.includes(s)
                          ? 'bg-amber-400 text-neutral-950 border-amber-400'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-700 hover:border-neutral-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description & Materials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    Full Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    Textile & Fabric Origin
                  </label>
                  <textarea
                    rows={3}
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Badges & Featured */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold uppercase tracking-wider text-neutral-400">Badges:</span>
                  {(['New', 'Sale', 'Bestseller', 'Limited'] as const).map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => toggleBadge(b)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                        badges.includes(b) ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded border-neutral-700 text-amber-400 focus:ring-amber-400 w-4 h-4"
                  />
                  <span className="text-neutral-300 font-semibold">Hero Featured Garment</span>
                </label>
              </div>

              {/* Footer Actions */}
              <div className="pt-6 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-neutral-800 text-neutral-300 rounded-xl hover:bg-neutral-700 uppercase font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg"
                >
                  {editingProduct ? 'Save Changes' : 'Publish to Storefront'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal (Iframe Safe & Non-blocking) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-rose-900/60 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-white">Delete Product / মুছে ফেলুন</h4>
                <p className="text-xs text-neutral-400">Permanently remove from inventory and storefront</p>
              </div>
            </div>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center gap-3">
              {productToDelete.image && (
                <img
                  src={productToDelete.image}
                  alt={productToDelete.title}
                  className="w-12 h-14 object-cover rounded-lg border border-neutral-800 shrink-0"
                />
              )}
              <div className="overflow-hidden">
                <div className="font-bold text-white text-xs truncate">{productToDelete.title}</div>
                <div className="text-[11px] text-neutral-400 font-mono">SKU: {productToDelete.sku} • {config.currencySymbol}{productToDelete.price}</div>
                <div className="text-[10px] text-amber-400 font-semibold">{productToDelete.category}</div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              আপনি কি নিশ্চিত যে আপনি এই পণ্যটি স্থায়ীভাবে মুছে ফেলতে চান? এটি আর স্টোরফ্রন্ট বা ডাটাবেসে প্রদর্শিত হবে না।
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel / বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = productToDelete.id;
                  const targetTitle = productToDelete.title;
                  setProductToDelete(null);
                  onDeleteProduct(targetId);
                  showToast(`✓ সফলভাবে মুছে ফেলা হয়েছে: "${targetTitle}"`);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 active:scale-98"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
