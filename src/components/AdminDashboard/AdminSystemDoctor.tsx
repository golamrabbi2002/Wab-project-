import React, { useState, useEffect } from 'react';
import { Product, StoreConfig } from '../../types';
import { SystemDoctorService, SystemHealthReport } from '../../services/systemDoctorService';
import { StorageService } from '../../services/storageService';
import { GoogleDriveSheetService } from '../../services/googleDriveSheetService';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  HardDrive,
  Activity,
  Trash2,
  Shield,
  Database,
  Link as LinkIcon
} from 'lucide-react';

interface AdminSystemDoctorProps {
  products: Product[];
  config: StoreConfig;
  onRefreshData: () => void;
  onSaveProduct: (p: Product) => void;
}

export const AdminSystemDoctor: React.FC<AdminSystemDoctorProps> = ({
  products,
  config,
  onRefreshData,
  onSaveProduct,
}) => {
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [testDriveUrl, setTestDriveUrl] = useState('');
  const [formattedDriveResult, setFormattedDriveResult] = useState<string | null>(null);

  const runDiagnostics = () => {
    setIsDiagnosing(true);
    try {
      const res = SystemDoctorService.diagnose();
      setReport(res);
    } finally {
      setIsDiagnosing(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, [products]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleAutoRepair = async () => {
    setIsRepairing(true);
    try {
      const res = await SystemDoctorService.autoRepair();
      showToast(`✓ Auto-Repair Complete! ${res.fixesApplied.length} fixes applied.`);
      onRefreshData();
      runDiagnostics();
    } catch (err: any) {
      showToast('⚠️ Auto-repair failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsRepairing(false);
    }
  };

  const handleInjectSample = (category: string) => {
    const sample = SystemDoctorService.injectSampleGarment(category);
    onSaveProduct(sample);
    showToast(`✓ Added Sample ${category}: "${sample.title}" to catalog!`);
    onRefreshData();
  };

  const handleClearStaleCache = () => {
    if (confirm('Do you want to clean temporary thumbnail cache and optimize browser storage? (Catalog items will remain safe)')) {
      const currentProds = StorageService.getProducts();
      StorageService.saveProducts(currentProds);
      showToast('✓ Storage Cache Refreshed and Optimized!');
      runDiagnostics();
    }
  };

  const handleTestDriveFormat = () => {
    if (!testDriveUrl.trim()) return;
    const formatted = GoogleDriveSheetService.formatGoogleDriveImageUrl(testDriveUrl.trim());
    setFormattedDriveResult(formatted);
  };

  const isHealthy = report?.status === 'healthy';

  return (
    <div className="space-y-6 animate-fadeIn text-xs">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs font-semibold shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Main Status Header Card */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-850">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-neutral-950 font-bold ${
              isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
            }`}>
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-white">
                  System Doctor & Catalog Auto-Repair
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  isHealthy
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                    : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                }`}>
                  {isHealthy ? 'System 100% Healthy' : 'Optimization Recommended'}
                </span>
              </div>
              <p className="text-neutral-400 text-xs mt-1">
                স্বয়ংক্রিয় কোড ডায়াগনস্টিকস, লোকালস্টোরেজ কোটা অপ্টিমাইজেশন ও ক্যাটালগ সিঙ্ক ইঞ্জিন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={runDiagnostics}
              disabled={isDiagnosing}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold rounded-xl transition-all flex items-center gap-2 active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isDiagnosing ? 'animate-spin' : ''}`} />
              <span>{isDiagnosing ? 'Checking...' : 'Re-Run Diagnostic'}</span>
            </button>

            <button
              onClick={handleAutoRepair}
              disabled={isRepairing}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 active:scale-98"
            >
              <Zap className={`w-4 h-4 ${isRepairing ? 'animate-spin' : ''}`} />
              <span>{isRepairing ? 'Repairing...' : '1-Click Auto-Repair Everything'}</span>
            </button>
          </div>
        </div>

        {/* Diagnostics Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-neutral-900/70 border border-neutral-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Garments</span>
            </span>
            <div className="text-xl font-mono font-bold text-white">
              {report?.metrics.productCount ?? products.length}
            </div>
            <span className="text-[10px] text-emerald-400">All registered SKUs</span>
          </div>

          <div className="p-4 bg-neutral-900/70 border border-neutral-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              <span>Storage Quota</span>
            </span>
            <div className="text-xl font-mono font-bold text-white">
              {report?.metrics.localStorageEstimatedQuotaPercent ?? 0}%
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              {report?.metrics.localStorageUsageKb ?? 0} KB Used
            </span>
          </div>

          <div className="p-4 bg-neutral-900/70 border border-neutral-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Stock Units</span>
            </span>
            <div className="text-xl font-mono font-bold text-white">
              {report?.metrics.totalStockUnits ?? 0}
            </div>
            <span className="text-[10px] text-emerald-400">Total available units</span>
          </div>

          <div className="p-4 bg-neutral-900/70 border border-neutral-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Integrity Issues</span>
            </span>
            <div className={`text-xl font-mono font-bold ${
              (report?.issues.length ?? 0) > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {report?.issues.length ?? 0}
            </div>
            <span className="text-[10px] text-neutral-400">
              {(report?.issues.length ?? 0) === 0 ? 'Zero defects' : 'Auto-fixable'}
            </span>
          </div>
        </div>
      </div>

      {/* Issues & Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Detected Issues / Clean Status */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Catalog Health Checks</span>
          </h4>

          {report?.issues && report.issues.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {report.issues.map((iss, i) => (
                <div key={i} className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-xs">{iss}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center space-y-2 bg-neutral-900/50 rounded-xl border border-neutral-800/60">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-neutral-200">All checks passed!</p>
              <p className="text-[11px] text-neutral-400">
                Products have valid SKUs, clean prices, optimized images, and active category indexing.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-neutral-850 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">LocalStorage & Cache Maintenance:</span>
            <button
              onClick={handleClearStaleCache}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clean Cache Buffer</span>
            </button>
          </div>
        </div>

        {/* 1-Click Sample Garment Injector */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>1-Click Test Garment Generator</span>
          </h4>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            স্টোরফ্রন্ট ও কার্ট টেস্ট করার জন্য ১ ক্লিকে প্রিমিয়াম ডামি কালেকশন যুক্ত করুন:
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleInjectSample('Panjabi')}
              className="p-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-400 rounded-xl text-left transition-all group"
            >
              <span className="font-bold text-white block group-hover:text-amber-300">+ পাঞ্জাবি (Panjabi)</span>
              <span className="text-[10px] text-neutral-400">৳১৮৫০ • ১০০% কটন</span>
            </button>

            <button
              onClick={() => handleInjectSample('Saree')}
              className="p-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-400 rounded-xl text-left transition-all group"
            >
              <span className="font-bold text-white block group-hover:text-amber-300">+ সিল্ক শাড়ি (Saree)</span>
              <span className="text-[10px] text-neutral-400">৳৩৫০০ • বেনারসি</span>
            </button>

            <button
              onClick={() => handleInjectSample('Three-Piece')}
              className="p-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-400 rounded-xl text-left transition-all group"
            >
              <span className="font-bold text-white block group-hover:text-amber-300">+ থ্রি-পিস (3-Piece)</span>
              <span className="text-[10px] text-neutral-400">৳২৪০০ • সুইস লন</span>
            </button>

            <button
              onClick={() => handleInjectSample('Tops')}
              className="p-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-700 hover:border-amber-400 rounded-xl text-left transition-all group"
            >
              <span className="font-bold text-white block group-hover:text-amber-300">+ শার্ট (Oxford Top)</span>
              <span className="text-[10px] text-neutral-400">৳১২৫০ • কটন</span>
            </button>
          </div>

          {/* Google Drive URL Converter Tool */}
          <div className="pt-4 border-t border-neutral-850 space-y-2">
            <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Drive Image Link Converter</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testDriveUrl}
                onChange={(e) => setTestDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 font-mono focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleTestDriveFormat}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-semibold"
              >
                Convert
              </button>
            </div>
            {formattedDriveResult && (
              <div className="p-2.5 bg-neutral-900 border border-neutral-750 rounded-lg text-[10px] font-mono text-emerald-400 break-all select-all">
                {formattedDriveResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
