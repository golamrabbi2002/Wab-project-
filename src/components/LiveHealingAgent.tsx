import React, { useState, useEffect } from 'react';
import { SystemDoctorService, SystemHealthReport } from '../services/systemDoctorService';
import { StorageService } from '../services/storageService';
import { Product, StoreConfig } from '../types';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Activity,
  PlusCircle,
  HardDrive,
  Database,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles
} from 'lucide-react';

interface LiveHealingAgentProps {
  onRefreshCatalog?: () => void;
  config: StoreConfig;
}

export const LiveHealingAgent: React.FC<LiveHealingAgentProps> = ({ onRefreshCatalog, config }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [isHealing, setIsHealing] = useState(false);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [selectedSampleCat, setSelectedSampleCat] = useState('Panjabi');

  const runDiagnostics = () => {
    const rep = SystemDoctorService.diagnose();
    setReport(rep);
  };

  useEffect(() => {
    runDiagnostics();
    const interval = setInterval(runDiagnostics, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSelfHeal = async () => {
    setIsHealing(true);
    try {
      const repaired = await SystemDoctorService.autoRepair();
      setReport(repaired);
      setLastActionMessage('✓ Auto-Repair Successful! All products, schemas, and images verified.');
      if (onRefreshCatalog) onRefreshCatalog();
    } catch (err: any) {
      setLastActionMessage(`Auto-Repair note: ${err?.message || 'Done'}`);
    } finally {
      setIsHealing(false);
      setTimeout(() => setLastActionMessage(null), 6000);
    }
  };

  const handleAddSampleGarment = () => {
    try {
      const injected = SystemDoctorService.injectSampleGarment(selectedSampleCat);
      runDiagnostics();
      setLastActionMessage(`✓ Added "${injected.title}" to catalog!`);
      if (onRefreshCatalog) onRefreshCatalog();
      setTimeout(() => setLastActionMessage(null), 5000);
    } catch (err: any) {
      setLastActionMessage(`Error adding sample: ${err?.message}`);
    }
  };

  const handleResetCatalog = () => {
    if (confirm('Restore default curated garments catalog?')) {
      StorageService.resetToDefaults();
      runDiagnostics();
      setLastActionMessage('✓ Restored catalog to baseline.');
      if (onRefreshCatalog) onRefreshCatalog();
      setTimeout(() => setLastActionMessage(null), 5000);
    }
  };

  return (
    <>
      {/* Floating Trigger Badge on Bottom Left */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            runDiagnostics();
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-xl border text-xs font-semibold backdrop-blur-md transition-all active:scale-95 ${
            report?.status === 'critical'
              ? 'bg-rose-900/90 text-rose-200 border-rose-700 animate-pulse'
              : report?.status === 'warning'
              ? 'bg-amber-900/90 text-amber-200 border-amber-700'
              : 'bg-neutral-900/90 text-neutral-200 border-neutral-700 hover:border-amber-400/60 hover:text-white'
          }`}
          title="Open System Doctor & Auto-Repair Agent"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span className="hidden sm:inline">Auto-Healing Agent</span>
          <span className={`w-2 h-2 rounded-full ${report?.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        </button>
      </div>

      {/* Floating Agent Console Modal */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 z-50 w-[92vw] sm:w-[420px] bg-neutral-950/95 border border-neutral-800 text-white rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-fadeIn flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="p-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>AURA Code & Catalog Doctor</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    LIVE
                  </span>
                </h4>
                <p className="text-[10px] text-neutral-400">
                  Instant error detection, auto-repair & product sync
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 overflow-y-auto text-xs">
            {/* Status overview */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 text-[11px] font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Health Status
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    report?.status === 'healthy'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : report?.status === 'warning'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {report?.status || 'checking'}
                </span>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80 text-[10px]">
                <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-850">
                  <div className="text-neutral-500">Products</div>
                  <div className="font-mono font-bold text-white text-xs mt-0.5">
                    {report?.metrics.productCount ?? 0}
                  </div>
                </div>
                <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-850">
                  <div className="text-neutral-500">Total Stock</div>
                  <div className="font-mono font-bold text-white text-xs mt-0.5">
                    {report?.metrics.totalStockUnits ?? 0}
                  </div>
                </div>
                <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-850">
                  <div className="text-neutral-500">Storage Usage</div>
                  <div className="font-mono font-bold text-amber-400 text-xs mt-0.5">
                    {report?.metrics.localStorageUsageKb ?? 0} KB
                  </div>
                </div>
              </div>
            </div>

            {/* Notification message */}
            {lastActionMessage && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px] font-medium animate-fadeIn">
                {lastActionMessage}
              </div>
            )}

            {/* Auto-Repair Action */}
            <div className="space-y-2">
              <button
                onClick={handleSelfHeal}
                disabled={isHealing}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isHealing ? 'animate-spin' : ''}`} />
                <span>{isHealing ? 'Repairing System...' : '1-Click Auto-Repair Everything'}</span>
              </button>
              <p className="text-[10px] text-neutral-400 text-center">
                Validates schema, re-indexes products, and optimizes local storage & cloud database.
              </p>
            </div>

            {/* Instant Test Garment Injector */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 space-y-2">
              <div className="text-neutral-300 font-semibold text-[11px] flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Test Garment Injection</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedSampleCat}
                  onChange={(e) => setSelectedSampleCat(e.target.value)}
                  className="bg-neutral-950 border border-neutral-700 rounded-lg text-white text-xs px-2.5 py-1.5 flex-1 focus:outline-none focus:border-amber-400"
                >
                  <option value="Panjabi">Panjabi (Festive Edition)</option>
                  <option value="Saree">Banarasi Silk Saree</option>
                  <option value="Three-Piece">Lawn Three-Piece</option>
                  <option value="Tops">Oxford Cotton Shirt</option>
                </select>
                <button
                  onClick={handleAddSampleGarment}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                >
                  Add Now
                </button>
              </div>
            </div>

            {/* Baseline catalog reset */}
            <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-[11px]">
              <span className="text-neutral-500">Need a clean slate?</span>
              <button
                onClick={handleResetCatalog}
                className="text-neutral-400 hover:text-amber-400 underline"
              >
                Reset Default Garments
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
