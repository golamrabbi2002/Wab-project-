import React, { useState, useEffect, useRef } from 'react';
import { HoneypotTelemetryService } from '../../services/honeypotTelemetryService';
import { HoneypotIntrusionLog } from '../../types';
import {
  Terminal,
  ShieldAlert,
  Database,
  KeyRound,
  FileCode,
  Globe,
  Radio,
  Send,
  Cpu,
  MapPin,
  MailCheck,
  CheckCircle,
  AlertTriangle,
  Flame,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface HoneypotPortalProps {
  onBackToStore?: () => void;
  trapRoute?: string;
}

export const HoneypotPortal: React.FC<HoneypotPortalProps> = ({ onBackToStore, trapRoute = '#/system-root-login' }) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'sql' | 'env' | 'live_telemetry'>('terminal');
  
  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: 'input' | 'output' | 'system' | 'alert'; text: string }>>([
    { type: 'system', text: '╔════════════════════════════════════════════════════════════════╗' },
    { type: 'system', text: '║  AURA ATELIER CORE LINUX KERNEL v6.8.0-45-generic (Ubuntu x64) ║' },
    { type: 'system', text: '║  RESTRICTED ENVIRONMENT - UNAUTHORIZED ACCESS STRICTLY FORBIDDEN║' },
    { type: 'system', text: '╚════════════════════════════════════════════════════════════════╝' },
    { type: 'output', text: 'Last failed login: Fri Aug 21 04:12:09 UTC 2026 from 103.145.74.18' },
    { type: 'output', text: 'Type "help" or run standard bash / SQL commands (e.g. whoami, ls -la, cat .env, sqlmap)' }
  ]);
  const [commandInput, setCommandInput] = useState('');
  
  // SQL Sandbox State
  const [sqlQuery, setSqlQuery] = useState("SELECT id, username, password_hash, role, email FROM system_admins WHERE role = 'SUPER_ADMIN';");
  const [sqlResults, setSqlResults] = useState<Array<Record<string, string>>>([
    { id: '1', username: 'root_admin', password_hash: '$2y$12$eK3sY.fake992jKlMnOp...', role: 'SUPER_ADMIN', email: 'golamrabbi4801@gmail.com' },
    { id: '2', username: 'db_operator', password_hash: '$2y$12$9uKpQ.decoy281aBcDe...', role: 'DBA_ACCESS', email: 'sec-ops@auraboutique.internal' }
  ]);

  // Telemetry Captured
  const [capturedLog, setCapturedLog] = useState<HoneypotIntrusionLog | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [alertSentNotice, setAlertSentNotice] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto capture on mount
  useEffect(() => {
    executeCanaryCapture('Hidden Canary Crawler', trapRoute, {
      injectedCommands: 'PAGE_VIEW_CANARY_TRAP_TRIGGERED'
    });
  }, [trapRoute]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const executeCanaryCapture = async (
    trapType: HoneypotIntrusionLog['trapType'],
    path: string,
    payload: HoneypotIntrusionLog['payload']
  ) => {
    setIsCapturing(true);
    try {
      const log = await HoneypotTelemetryService.captureIntrusion(trapType, path, payload, 'CRITICAL');
      setCapturedLog(log);
      setAlertSentNotice(true);
      setTimeout(() => setAlertSentNotice(false), 6000);
    } catch (err) {
      console.error('Honeypot capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    // Add command to history
    const newHistory = [...terminalHistory, { type: 'input' as const, text: `root@aura-core:~# ${cmd}` }];
    
    // Capture intrusion telemetry
    executeCanaryCapture('Fake Root Terminal', trapRoute, {
      injectedCommands: cmd,
      usernameAttempted: 'root',
      passwordAttempted: cmd.includes('pass') ? cmd : undefined
    });

    const lowerCmd = cmd.toLowerCase();

    // Simulated responses
    if (lowerCmd === 'help') {
      newHistory.push({
        type: 'output',
        text: 'Supported commands: help, ls, cat, whoami, id, uname, ps, env, sqlmap, curl, wget, clear'
      });
    } else if (lowerCmd === 'clear') {
      setTerminalHistory([]);
      setCommandInput('');
      return;
    } else if (lowerCmd.startsWith('ls')) {
      newHistory.push({
        type: 'output',
        text: 'drwxr-xr-x 2 root root 4096 Aug 21 04:00 .\ndrwxr-xr-x 4 root root 4096 Aug 21 03:30 ..\n-rw------- 1 root root 1842 Aug 21 03:45 .env\n-rw-r--r-- 1 root root  820 Aug 21 03:50 database_backup.sql\n-rw-r--r-- 1 root root 4210 Aug 21 04:02 server_config.json\n-rwxr-xr-x 1 root root 8920 Aug 21 04:05 deploy_secrets.sh'
      });
    } else if (lowerCmd.includes('cat .env') || lowerCmd.includes('cat /.env')) {
      newHistory.push({
        type: 'output',
        text: '# [HONEYPOT DECOY CANARY TOKEN]\nDB_HOST=127.0.0.1:5432\nDB_USER=aura_master\nDB_PASS=Sup3rS3cr3tP@ss2026!\nJWT_SECRET=aura_sec_canary_trap_token_0x992\nADMIN_EMAIL=golamrabbi4801@gmail.com\nSTRIPE_SECRET_KEY=sk_live_decoy_canary_token_51M'
      });
      newHistory.push({
        type: 'alert',
        text: '🚨 [SECURITY NOTICE] .env access intercepted. Forensic alert dispatched to golamrabbi4801@gmail.com'
      });
    } else if (lowerCmd.includes('whoami')) {
      newHistory.push({ type: 'output', text: 'root (uid=0 gid=0 groups=0(root))' });
    } else if (lowerCmd.includes('id')) {
      newHistory.push({ type: 'output', text: 'uid=0(root) gid=0(root) groups=0(root),27(sudo)' });
    } else if (lowerCmd.includes('uname')) {
      newHistory.push({ type: 'output', text: 'Linux aura-core-sg1 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux' });
    } else if (lowerCmd.includes('cat /etc/passwd')) {
      newHistory.push({
        type: 'output',
        text: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\naura_admin:x:1000:1000:Aura Store Admin:/home/aura_admin:/bin/bash\npostgres:x:1001:1001:PostgreSQL:/var/lib/postgresql:/bin/bash'
      });
    } else if (lowerCmd.includes('sqlmap') || lowerCmd.includes('select') || lowerCmd.includes('drop')) {
      newHistory.push({
        type: 'alert',
        text: '⚠️ [SQL INJECTION DETECTED] Injection payload analyzed. De-anonymization engine engaged.'
      });
      newHistory.push({
        type: 'output',
        text: `[+] Target URL: https://aura-atelier.internal/api/v1/auth\n[+] Parameter: username (GET/POST)\n[+] DBMS: PostgreSQL 16.2\n[+] Found 4 databases: [aura_production, aura_customers, aura_vault, honeypot_telemetry]`
      });
    } else {
      newHistory.push({
        type: 'output',
        text: `bash: ${cmd}: command executed. Output logged to security auditor /var/log/audit.log`
      });
    }

    setTerminalHistory(newHistory);
    setCommandInput('');
  };

  const handleSqlExecute = (e: React.FormEvent) => {
    e.preventDefault();
    executeCanaryCapture('SQL Injection Sandbox', trapRoute, {
      injectedCommands: sqlQuery,
      queryParameters: { query: sqlQuery }
    });

    if (sqlQuery.toLowerCase().includes('drop')) {
      setSqlResults([{ status: 'ERROR', message: 'ERROR: 42501: permission denied for database "aura_production"' }]);
    } else if (sqlQuery.toLowerCase().includes('union') || sqlQuery.toLowerCase().includes('version')) {
      setSqlResults([
        { version: 'PostgreSQL 16.2 (Ubuntu 16.2-1.pgdg22.04+1)', current_user: 'aura_root', current_db: 'aura_prod_db' }
      ]);
    } else {
      setSqlResults([
        { id: '101', customer: 'Farhan Rahman', phone: '+8801711223344', city: 'Gulshan, Dhaka', total_spent: '৳48,500' },
        { id: '102', customer: 'Nusrat Jahan', phone: '+8801819887766', city: 'Dhanmondi, Dhaka', total_spent: '৳32,100' },
        { id: '103', customer: 'Tariqul Islam', phone: '+8801912334455', city: 'Agrabad, Chattogram', total_spent: '৳19,800' }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-mono flex flex-col selection:bg-rose-500 selection:text-white">
      
      {/* Top Threat Alert Bar */}
      <header className="border-b border-rose-900/40 bg-neutral-900/90 backdrop-blur-md px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Active Honeypot Trap Vector
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px]">
                  Canary Node: {trapRoute}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                Silent De-anonymization & Anti-Evasion Telemetry Active • All Keystrokes & Payloads Logged
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {alertSentNotice && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs rounded-lg animate-bounce">
                <MailCheck className="w-4 h-4 text-emerald-400" />
                <span>Forensic Alert Emailed to golamrabbi4801@gmail.com</span>
              </div>
            )}

            {onBackToStore && (
              <button
                onClick={onBackToStore}
                className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-sans flex items-center gap-1.5 transition-colors border border-neutral-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Store</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Trap Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6 w-full">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-2">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'terminal'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-transparent'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Root Bash Terminal (Pseudo-Shell)</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'sql'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-transparent'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>SQL Injection Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('env')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'env'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-transparent'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Config & Env Decoy Dump</span>
          </button>

          <button
            onClick={() => setActiveTab('live_telemetry')}
            className={`ml-auto px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'live_telemetry'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                : 'bg-neutral-900 text-amber-400 hover:bg-neutral-850 border border-amber-400/20'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>View De-anonymized Threat Intel ({capturedLog ? capturedLog.ip : 'Acquiring...'})</span>
          </button>
        </div>

        {/* TAB 1: PSEUDO BASH TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex-1 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-neutral-300 text-xs">root@aura-core:~#</span>
              </div>
              <span className="text-[11px] text-neutral-500">TTY: /dev/pts/1 (Interactive Canary Trap)</span>
            </div>

            {/* Scrollable Terminal Output */}
            <div className="flex-1 overflow-y-auto space-y-2 text-xs font-mono pr-2 max-h-[420px]">
              {terminalHistory.map((item, idx) => (
                <div key={idx} className="leading-relaxed">
                  {item.type === 'input' && (
                    <span className="text-amber-400 font-bold">{item.text}</span>
                  )}
                  {item.type === 'output' && (
                    <pre className="text-neutral-300 whitespace-pre-wrap">{item.text}</pre>
                  )}
                  {item.type === 'system' && (
                    <pre className="text-cyan-400 font-bold whitespace-pre-wrap">{item.text}</pre>
                  )}
                  {item.type === 'alert' && (
                    <div className="p-2 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 font-bold">
                      {item.text}
                    </div>
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Input Prompt */}
            <form onSubmit={handleCommandSubmit} className="mt-4 pt-3 border-t border-neutral-800 flex items-center gap-2">
              <span className="text-rose-400 font-bold text-xs shrink-0">root@aura-core:~#</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Type command (e.g. ls, whoami, cat .env, id, sqlmap)..."
                autoFocus
                className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-neutral-600"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-sans font-semibold flex items-center gap-1 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Execute</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: SQL INJECTION SANDBOX */}
        {activeTab === 'sql' && (
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <Database className="w-4 h-4 text-rose-400" />
                  Direct SQL Query Console (Port 5432 Decoy)
                </h3>
                <p className="text-xs text-neutral-400 font-sans">
                  Simulates full SQL injection response while extracting attacker's real-time WebRTC and GPU fingerprint.
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-1 bg-neutral-800 text-emerald-400 border border-neutral-700 rounded-full font-mono">
                PostgreSQL 16.2 Emulation
              </span>
            </div>

            <form onSubmit={handleSqlExecute} className="space-y-3">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={4}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs font-mono text-amber-300 focus:outline-none focus:border-rose-400"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSqlQuery("SELECT * FROM system_admins WHERE username = 'admin' OR '1'='1';")}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-750 text-[11px] text-neutral-300 rounded border border-neutral-700"
                  >
                    Load SQLi Payload #1
                  </button>
                  <button
                    type="button"
                    onClick={() => setSqlQuery("SELECT version(), current_user, current_database();")}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-750 text-[11px] text-neutral-300 rounded border border-neutral-700"
                  >
                    Load DBMS Probe #2
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Query</span>
                </button>
              </div>
            </form>

            {/* Results Table */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/80">
              <div className="px-4 py-2 bg-neutral-900 text-xs font-bold text-neutral-400 border-b border-neutral-800 flex justify-between">
                <span>Query Result Set ({sqlResults.length} rows returned)</span>
                <span className="text-emerald-400">Execution Time: 1.4ms</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="text-neutral-500 border-b border-neutral-800">
                      {sqlResults.length > 0 &&
                        Object.keys(sqlResults[0]).map((key) => (
                          <th key={key} className="pb-2 px-3">{key}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sqlResults.map((row, i) => (
                      <tr key={i} className="border-b border-neutral-850 hover:bg-neutral-900/40">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="py-2.5 px-3 text-neutral-200">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONFIG & ENV LEAK DECOY */}
        {activeTab === 'env' && (
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex-1 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  Decoy Canary `.env` & Secrets Configuration
                </h3>
                <p className="text-xs text-neutral-400 font-sans">
                  Any automated scraper or tool attempting to download or query these tokens triggers an immediate alert.
                </p>
              </div>
              <button
                onClick={() => executeCanaryCapture('Config Dump Probe', '#/config.env', { injectedCommands: 'DOWNLOAD_CANARY_ENV_ATTEMPT' })}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate Canary Token Download</span>
              </button>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 leading-relaxed overflow-x-auto">
              <p className="text-cyan-400"># AURA ATELIER PRODUCTION SECRETS (CANARY TRAP HONEYPOT)</p>
              <p>NODE_ENV=production</p>
              <p>PORT=3000</p>
              <p className="text-rose-400">DATABASE_URL=postgres://aura_root:Sup3rS3cr3tP@ss2026@127.0.0.1:5432/aura_production</p>
              <p className="text-amber-400">JWT_SECRET_KEY=canary_trap_token_0x992_de_anonymize_hook</p>
              <p>ADMIN_NOTIFICATION_EMAIL=golamrabbi4801@gmail.com</p>
              <p>STRIPE_SECRET_KEY=sk_live_canary_honey_decoy_0091</p>
              <p>BKASH_API_KEY=bkash_sec_live_decoy_trap_token</p>
              <p>GOOGLE_OAUTH_SECRET=GOCSPX-decoy-canary-secret-hash</p>
            </div>
          </div>
        )}

        {/* TAB 4: DE-ANONYMIZED LIVE THREAT INTEL */}
        {activeTab === 'live_telemetry' && (
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex-1 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  De-Anonymized Attacker Profile (Forensic Telemetry)
                </h3>
                <p className="text-xs text-neutral-400 font-sans">
                  Real-time Ethical Hacking Analysis: VPN / Tor Bypasses, WebRTC Leak, GPU Chipset, and Physical Coordinates.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => executeCanaryCapture('Fake Root Terminal', trapRoute, { injectedCommands: 'MANUAL_TELEMETRY_REFRESH' })}
                  disabled={isCapturing}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-sans flex items-center gap-1.5 transition-colors border border-neutral-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCapturing ? 'animate-spin' : ''}`} />
                  <span>Refresh Forensic Scan</span>
                </button>
              </div>
            </div>

            {capturedLog ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. IP & Geo Location Card */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                    <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      IP & Geolocation
                    </span>
                    <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 rounded text-[10px] font-mono">
                      {capturedLog.countryCode}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Public IP:</span>
                      <span className="text-amber-400 font-bold font-mono">{capturedLog.ip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Location:</span>
                      <span className="text-neutral-200">{capturedLog.city}, {capturedLog.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Coordinates:</span>
                      <span className="text-neutral-300 font-mono text-[11px]">{capturedLog.latitude}, {capturedLog.longitude}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">ISP / Network:</span>
                      <span className="text-neutral-300 truncate max-w-[150px]">{capturedLog.isp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Timezone:</span>
                      <span className="text-neutral-300">{capturedLog.timezone}</span>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps?q=${capturedLog.latitude},${capturedLog.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-cyan-300 border border-neutral-750 rounded-lg text-xs font-sans flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Open Exact Google Maps Pin</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* 2. Anti-Evasion & VPN / Tor Unmasking */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                    <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      VPN / Tor De-anonymization
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      capturedLog.vpnTorDetection.isVpnOrProxy
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {capturedLog.vpnTorDetection.isVpnOrProxy ? 'VPN Disguise Detected' : 'Direct Residential IP'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Tor Browser Node:</span>
                      <span className={capturedLog.vpnTorDetection.isTor ? 'text-rose-400 font-bold' : 'text-neutral-400'}>
                        {capturedLog.vpnTorDetection.isTor ? 'YES (Tor Exit Node)' : 'NO'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Evasion Confidence:</span>
                      <span className="text-amber-400 font-mono font-bold">{capturedLog.vpnTorDetection.confidenceScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Timezone Skew:</span>
                      <span className={capturedLog.vpnTorDetection.timezoneMismatch ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {capturedLog.vpnTorDetection.timezoneMismatch ? 'MISMATCH (Bypassed)' : 'Synchronized'}
                      </span>
                    </div>
                    
                    {/* Reasons list */}
                    <div className="pt-2 border-t border-neutral-850 space-y-1">
                      <span className="text-[10px] text-neutral-500 block uppercase font-bold">Unmasking Evidence:</span>
                      {capturedLog.vpnTorDetection.reasons.map((r, i) => (
                        <p key={i} className="text-[11px] text-neutral-300 leading-tight flex items-start gap-1">
                          <span className="text-rose-400 shrink-0">•</span>
                          <span>{r}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Hardware & WebRTC Leak Fingerprint */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                    <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-amber-400" />
                      Hardware & WebRTC Leaks
                    </span>
                    <span className="px-2 py-0.5 bg-amber-950 text-amber-300 rounded text-[10px] font-mono">
                      Physical Rig
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div>
                      <span className="text-neutral-500 block text-[10px] font-sans">Physical GPU Renderer:</span>
                      <span className="text-cyan-300 text-[11px] break-words">{capturedLog.device.webglRenderer}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px] font-sans">WebRTC Subnet Candidate IPs:</span>
                      <span className="text-rose-300 text-[11px]">{capturedLog.device.webrtcCandidateIps?.join(', ') || 'No candidate leaked'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-sans">CPU Cores / RAM:</span>
                      <span className="text-neutral-300">{capturedLog.device.hardwareConcurrency} Cores / {capturedLog.device.deviceMemory || 8}GB RAM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-sans">Display Res:</span>
                      <span className="text-neutral-300">{capturedLog.device.screen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 font-sans">Audio Hash:</span>
                      <span className="text-neutral-300">{capturedLog.device.audioFingerprint}</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-neutral-500 text-xs">
                Scanning browser environment and intercepting telemetry...
              </div>
            )}

            {/* Email Notification Status */}
            <div className="p-4 bg-neutral-950 border border-emerald-900/50 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MailCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Automated Security Notification Configured</h4>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    Forensic incident report with Google Maps coordinates and unmasked GPU fingerprint dispatched to: <span className="text-amber-400 font-mono">golamrabbi4801@gmail.com</span>
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-bold font-sans">
                Status: Active & Listening
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
