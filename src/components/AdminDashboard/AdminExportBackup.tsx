import React, { useState } from 'react';
import { Product, Order, StoreConfig, Coupon, Customer } from '../../types';
import { generateStandaloneHtml } from '../../services/htmlExporter';
import { storageService } from '../../services/storageService';
import { Download, Copy, Check, FileCode, Database, Upload, RefreshCw, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

interface AdminExportBackupProps {
  products: Product[];
  orders: Order[];
  config: StoreConfig;
  coupons: Coupon[];
  customers: Customer[];
  onRefreshData: () => void;
}

export const AdminExportBackup: React.FC<AdminExportBackupProps> = ({
  products,
  orders,
  config,
  coupons,
  customers,
  onRefreshData,
}) => {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Download Standalone HTML file
  const handleDownloadHtml = () => {
    const htmlString = generateStandaloneHtml({
      products,
      orders,
      config,
      coupons,
      customers,
    });

    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.brandName.toLowerCase().replace(/\s+/g, '-')}-standalone-storefront.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy HTML string to clipboard
  const handleCopyHtml = async () => {
    const htmlString = generateStandaloneHtml({
      products,
      orders,
      config,
      coupons,
      customers,
    });

    await navigator.clipboard.writeText(htmlString);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  // Export JSON Database
  const handleExportJson = () => {
    const data = storageService.exportFullDatabase();
    const blob = new Blob([data], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.brandName.toLowerCase().replace(/\s+/g, '-')}-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON Database
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = storageService.importFullDatabase(content);
        if (success) {
          setImportStatus('Database successfully restored from JSON file!');
          onRefreshData();
        } else {
          setImportStatus('Failed to parse database backup.');
        }
      } catch (err) {
        setImportStatus('Error importing database backup.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  // Reset to default seed
  const handleResetDefaults = () => {
    if (confirm('Warning: This will reset all inventory, orders, and brand configurations to initial factory seed data. Are you sure?')) {
      storageService.resetToDefaults();
      onRefreshData();
      alert('Store restored to initial luxury seed data.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-xs">
      
      {/* CARD 1: SINGLE-FILE STANDALONE HTML EXPORT */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Single-File Standalone HTML Deployment
            </h3>
            <p className="text-neutral-400">
              Export the entire fully-functional application as a self-contained single HTML file with embedded scripts, styling, and local persistence.
            </p>
          </div>
        </div>

        <div className="bg-neutral-900/70 p-5 rounded-xl border border-neutral-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Zero Build Tools Required • 100% Hostable on Any Static Server</span>
          </div>

          <p className="text-neutral-400 text-xs leading-relaxed">
            The exported file embeds all current products, custom brand assets, images (Base64), active coupons, and settings into one single portable <code className="text-amber-400 bg-neutral-950 px-1.5 py-0.5 rounded font-mono">.html</code> file. You can double-click it directly on your desktop or upload it to Netlify, Vercel, GitHub Pages, Cloudflare Pages, or Google AI Studio with zero backend configuration.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleDownloadHtml}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Download Standalone .HTML File</span>
            </button>

            <button
              onClick={handleCopyHtml}
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
            >
              {copiedHtml ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedHtml ? 'Copied HTML to Clipboard!' : 'Copy Raw HTML Source'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CARD 2: JSON DATABASE BACKUP & RESTORE */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <div className="p-2 bg-blue-400/10 text-blue-400 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              JSON Database Backup & Migration
            </h3>
            <p className="text-neutral-400">
              Save your entire store dataset (catalogue, customer orders, shipping addresses, coupons) as a JSON backup.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Export JSON */}
          <div className="bg-neutral-900/60 p-5 rounded-xl border border-neutral-800 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-1">Export Database Dump</h4>
              <p className="text-neutral-400 text-xs">
                Downloads a <code className="text-blue-300 font-mono">.json</code> snapshot of all localStorage keys.
              </p>
            </div>
            <button
              onClick={handleExportJson}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Store JSON</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="bg-neutral-900/60 p-5 rounded-xl border border-neutral-800 space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-1">Restore from JSON</h4>
              <p className="text-neutral-400 text-xs">
                Upload a previous JSON backup to replace or restore current store state.
              </p>
            </div>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="block w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white font-semibold cursor-pointer"
              />
              {importStatus && (
                <p className="text-xs text-emerald-400 font-semibold mt-2">{importStatus}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: FACTORY DEFAULTS */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <div className="p-2 bg-rose-400/10 text-rose-400 rounded-lg">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Factory Reset
            </h3>
            <p className="text-neutral-400">
              Clear all current modifications and restore pristine luxury brand seed data.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-neutral-400 text-xs max-w-md">
            Use this if you wish to reset your product list, orders, and test coupon codes back to the initial defaults.
          </p>
          <button
            onClick={handleResetDefaults}
            className="px-5 py-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            Reset Store Data
          </button>
        </div>
      </div>
    </div>
  );
};
