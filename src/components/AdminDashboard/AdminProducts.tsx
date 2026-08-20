import React, { useState } from 'react';
import { Product, StoreConfig } from '../../types';
import { GoogleDriveSheetService } from '../../services/googleDriveSheetService';
import { Plus, Edit2, Trash2, Upload, Image as ImageIcon, Check, X, Sparkles, Search, HardDrive, Link as LinkIcon } from 'lucide-react';

interface AdminProductsProps {
  products: Product[];
  config: StoreConfig;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  config,
  onSaveProduct,
  onDeleteProduct,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<Product['category']>('Tops');
  const [price, setPrice] = useState<number>(120);
  const [originalPrice, setOriginalPrice] = useState<number>(140);
  const [stock, setStock] = useState<number>(15);
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L']);
  const [badges, setBadges] = useState<('New' | 'Sale' | 'Bestseller' | 'Limited')[]>(['New']);
  const [featured, setFeatured] = useState(false);

  // Local Image Upload & Google Drive URL State
  const [imageBase64, setImageBase64] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [driveImageUrl, setDriveImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState<string | null>(null);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
  const categories: Product['category'][] = ['Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Accessories', 'Footwear'];

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setSubtitle('');
    setCategory('Tops');
    setPrice(150);
    setOriginalPrice(150);
    setStock(20);
    setSku(`AUR-${Math.floor(1000 + Math.random() * 9000)}`);
    setDescription('Tailored from sustainable organic fibers for modern architectural elegance.');
    setMaterial('100% Organic GOTS-Certified Cotton');
    setCareInstructions('Hand wash cold or dry clean.');
    setSizes(['S', 'M', 'L']);
    setBadges(['New']);
    setFeatured(false);
    setImageBase64('');
    setDriveImageUrl('');
    setAdditionalImages([]);
    setImageError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setSubtitle(p.subtitle || '');
    setCategory(p.category);
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
    setIsModalOpen(true);
  };

  // Direct Local Image Upload via FileReader API (Converts to Base64)
  const handlePrimaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, WEBP, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageBase64(event.target.result);
        setDriveImageUrl('');
        setImageError(null);
      }
    };
    reader.onerror = () => {
      setImageError('Failed to read file from local device.');
    };
    reader.readAsDataURL(file);
  };

  // Google Drive or Direct URL Input Handler
  const handleDriveUrlChange = (url: string) => {
    setDriveImageUrl(url);
    if (url.trim()) {
      const formatted = GoogleDriveSheetService.formatGoogleDriveImageUrl(url.trim());
      setImageBase64(formatted);
      setImageError(null);
    }
  };

  // Additional Gallery Photos Local Upload (Base64)
  const handleAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setAdditionalImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleSize = (s: string) => {
    setSizes((prev) => (prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]));
  };

  const toggleBadge = (b: 'New' | 'Sale' | 'Bestseller' | 'Limited') => {
    setBadges((prev) => (prev.includes(b) ? prev.filter((item) => item !== b) : [...prev, b]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageBase64) {
      setImageError('Please upload a product photo or provide a Google Drive / Web image URL.');
      return;
    }

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title,
      subtitle,
      category,
      price: Number(price),
      originalPrice: Number(originalPrice),
      image: imageBase64,
      additionalImages,
      sizes: sizes.length > 0 ? sizes : ['One Size'],
      stock: Number(stock),
      sku: sku || `AUR-${Date.now().toString().slice(-4)}`,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 1,
      description,
      material,
      careInstructions,
      badges,
      featured,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    onSaveProduct(newProduct);
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchSearch =
      !searchFilter ||
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchFilter.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top action & filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
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
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Add Product Button */}
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Garment (Local / Drive Upload)</span>
        </button>
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
                      <div className="w-12 h-14 rounded-lg bg-neutral-900 overflow-hidden border border-neutral-700 shrink-0">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                      </div>
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

                    {/* Stock */}
                    <td className="py-3 px-4">
                      {p.stock === 0 ? (
                        <span className="px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-800/60 rounded text-[10px] font-bold uppercase">
                          0 Units (Sold Out)
                        </span>
                      ) : p.stock <= 5 ? (
                        <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800/60 rounded text-[10px] font-bold uppercase">
                          {p.stock} Units (Low)
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-mono font-bold">{p.stock} in stock</span>
                      )}
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
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${p.title}" from store inventory?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
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

      {/* ADD / EDIT PRODUCT MODAL (WITH DIRECT LOCAL BASE64 & GOOGLE DRIVE IMAGE UPLOAD) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative bg-neutral-900 border border-neutral-800 text-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  {editingProduct ? 'Edit Garment Details' : 'Add New Atelier Garment'}
                </h3>
                <p className="text-xs text-neutral-400">
                  Upload directly from device or paste Google Drive share link
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
              
              {/* DIRECT LOCAL IMAGE UPLOAD OR GOOGLE DRIVE LINK SECTION */}
              <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Garment Photo (Device Upload or Google Drive)</span>
                  </label>
                  <span className="text-[10px] text-neutral-400">Auto-synced to Cloud</span>
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
                      <span className="text-[11px] text-neutral-300 font-semibold block mb-1">Option 1: Upload from Phone / PC</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePrimaryImageUpload}
                        className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-neutral-950 hover:file:bg-amber-300 cursor-pointer"
                      />
                    </div>

                    <div className="border-t border-neutral-800 pt-2">
                      <span className="text-[11px] text-blue-300 font-semibold block mb-1 flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Option 2: Google Drive Share Link or Image URL</span>
                      </span>
                      <input
                        type="text"
                        value={driveImageUrl}
                        onChange={(e) => handleDriveUrlChange(e.target.value)}
                        placeholder="e.g. https://drive.google.com/file/d/.../view"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
                      />
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
                            onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
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

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    Garment Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Silk Crepe Trench"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    Short Subtitle
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Double-breasted Italian Wool"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
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
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

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
                    Price ({config.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    Stock Level
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
                  <span className="text-neutral-300 font-semibold">Hero Capsule Featured</span>
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
    </div>
  );
};
