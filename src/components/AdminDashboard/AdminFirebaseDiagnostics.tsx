import React, { useState, useEffect } from 'react';
import { 
  firebaseDiagnosticsService, 
  FullDiagnosticReport, 
  DiagnosticErrorLog 
} from '../../services/firebaseDiagnosticsService';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  AlertTriangle,
  Key,
  Database,
  Lock,
  Unlock,
  Info,
  Clock,
  Trash2,
  ExternalLink,
  UserCheck,
  UserX,
  Server
} from 'lucide-react';

export const AdminFirebaseDiagnostics: React.FC = () => {
  const [report, setReport] = useState<FullDiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isReAuthing, setIsReAuthing] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedConsoleCode, setCopiedConsoleCode] = useState(false);
  const [selectedError, setSelectedError] = useState<DiagnosticErrorLog | null>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const res = await firebaseDiagnosticsService.runFullDiagnostics();
      setReport(res);
    } catch (err) {
      console.error('Error running diagnostics:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
    const unsubscribe = firebaseDiagnosticsService.subscribe((updatedReport) => {
      setReport(updatedReport);
    });
    return () => unsubscribe();
  }, []);

  const handleForceReAuth = async () => {
    setIsReAuthing(true);
    try {
      await firebaseDiagnosticsService.forceReAuthenticate();
      await runDiagnostics();
    } finally {
      setIsReAuthing(false);
    }
  };

  const handleCopyJson = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleCopyConsoleCode = () => {
    navigator.clipboard.writeText('window.runFirebaseDiagnostics()');
    setCopiedConsoleCode(true);
    setTimeout(() => setCopiedConsoleCode(false), 2500);
  };

  const handleClearErrors = () => {
    firebaseDiagnosticsService.clearErrors();
    if (report) {
      setReport({
        ...report,
        recentErrors: []
      });
    }
  };

  const authInfo = report?.authInfo;
  const isAuth = !!authInfo?.isAuthenticated;
  const hasDeniedRules = report?.collectionProbes.some(p => p.readStatus === 'denied' || p.writeStatus === 'denied');

  return (
    <div className="space-y-6 text-xs animate-fadeIn" id="firebase-diagnostics-panel">
      
      {/* Top Header Card */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-850">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
              isAuth && !hasDeniedRules
                ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/20'
                : 'bg-amber-400 text-neutral-950 shadow-amber-400/20'
            } shadow-lg`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif font-bold text-base text-white">
                  Firebase Auth & Security Rules Diagnostic
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  isAuth && !hasDeniedRules
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                    : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                }`}>
                  {isAuth && !hasDeniedRules ? 'All Rules Passing' : 'Access Denied / Action Needed'}
                </span>
              </div>
              <p className="text-neutral-400 text-xs mt-1">
                রিয়েল-টাইম অথেন্টিকেশন স্ট্যাটাস, ফায়ারস্টোর সিকিউরিটি রুলস এক্সেস পারমিশন ও এরর ডিটেকশন প্যানেল
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold rounded-xl transition-all flex items-center gap-2 active:scale-98"
              title="Re-run live security probe against all collections"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Probing...' : 'Run Live Probe'}</span>
            </button>

            <button
              onClick={handleForceReAuth}
              disabled={isReAuthing}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-300 font-semibold rounded-xl transition-all flex items-center gap-2 active:scale-98"
              title="Force anonymous session refresh or reload credentials"
            >
              <Key className={`w-3.5 h-3.5 text-amber-400 ${isReAuthing ? 'animate-spin' : ''}`} />
              <span>{isReAuthing ? 'Re-Authenticating...' : 'Refresh Auth Token'}</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-semibold rounded-xl transition-all flex items-center gap-2 active:scale-98"
              title="Copy complete JSON diagnostic report"
            >
              {copiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied JSON!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Console Command Quick Bar */}
        <div className="mt-4 p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2 text-neutral-300">
            <Terminal className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-[11px] text-neutral-400">DevTools Console Helper:</span>
            <code className="px-2 py-0.5 bg-neutral-950 rounded border border-neutral-750 text-sky-300 text-xs">
              window.runFirebaseDiagnostics()
            </code>
          </div>
          <button
            onClick={handleCopyConsoleCode}
            className="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 font-sans transition-colors"
          >
            {copiedConsoleCode ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Command Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Command</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Auth Status & Rule Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Firebase Auth Status Card */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-850">
            <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Firebase Auth Status</span>
            </h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
              isAuth
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                : 'bg-rose-950 text-rose-300 border border-rose-700/60'
            }`}>
              {isAuth ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
              <span>{isAuth ? (authInfo?.isAnonymous ? 'Anonymous Auth' : 'User Account') : 'Unauthenticated'}</span>
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Current User UID</span>
              <div className="font-mono text-xs text-amber-300 break-all">
                {authInfo?.uid || <span className="text-rose-400">null (request.auth is empty)</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Auth Type</span>
                <div className="font-mono text-xs text-neutral-200">
                  {authInfo?.isAnonymous ? 'Anonymous' : (authInfo?.email ? 'Email/Password' : 'None')}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400">request.auth != null</span>
                <div className={`font-mono text-xs font-bold ${isAuth ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isAuth ? 'TRUE (Satisfied)' : 'FALSE (Denied)'}
                </div>
              </div>
            </div>

            {authInfo?.email && (
              <div className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Email & Verification</span>
                <div className="font-mono text-xs text-neutral-200">
                  {authInfo.email} ({authInfo.emailVerified ? 'Verified' : 'Unverified'})
                </div>
              </div>
            )}

            {authInfo?.lastAuthError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Auth Initialization Notice</span>
                </div>
                <p className="font-mono text-[10px] break-all">{authInfo.lastAuthError}</p>
                <p className="text-[10px] text-rose-300">
                  💡 If Anonymous Sign-in is disabled in Firebase Console, enable it under <strong>Authentication &gt; Sign-in method &gt; Anonymous</strong>.
                </p>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1 text-neutral-400">
              <div className="flex justify-between text-[10px]">
                <span>Project ID:</span>
                <span className="font-mono text-neutral-300">{report?.firebaseConfig.projectId}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Database ID:</span>
                <span className="font-mono text-neutral-300">{report?.firebaseConfig.firestoreDatabaseId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Permissions Matrix */}
        <div className="lg:col-span-2 bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-850">
            <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              <span>Firestore Collection Security Probes</span>
            </h4>
            <span className="text-[10px] text-neutral-400 font-mono">
              Tested: {report?.collectionProbes.length || 0} Collections
            </span>
          </div>

          <div className="space-y-2.5">
            {report?.collectionProbes.map((probe) => {
              const readGranted = probe.readStatus === 'granted';
              const writeGranted = probe.writeStatus === 'granted';
              const isAllGood = readGranted && writeGranted;

              return (
                <div
                  key={probe.collectionName}
                  className={`p-3 rounded-xl border transition-all ${
                    isAllGood
                      ? 'bg-neutral-900/60 border-neutral-800'
                      : 'bg-rose-950/20 border-rose-800/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${
                        isAllGood ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}>
                        {isAllGood ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-white">{probe.rulePath}</span>
                          <span className="text-[10px] text-neutral-400">({probe.collectionName})</span>
                        </div>
                        {probe.itemCount !== undefined && (
                          <span className="text-[10px] text-neutral-400">
                            Live records found: {probe.itemCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Read Status */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-neutral-400">Read:</span>
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          readGranted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        }`}>
                          {readGranted ? `✓ Granted (${probe.readLatencyMs}ms)` : '✕ Denied'}
                        </span>
                      </div>

                      {/* Write Status */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-neutral-400">Write:</span>
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          writeGranted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        }`}>
                          {writeGranted ? `✓ Granted (${probe.writeLatencyMs}ms)` : '✕ Denied'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Error explanations if denied */}
                  {(probe.readError || probe.writeError) && (
                    <div className="mt-2 pt-2 border-t border-neutral-800/60 text-[10px] font-mono text-rose-300 space-y-1">
                      {probe.readError && (
                        <div>
                          <span className="text-rose-400 font-bold">Read Error:</span> {probe.readError}
                        </div>
                      )}
                      {probe.writeError && (
                        <div>
                          <span className="text-rose-400 font-bold">Write Error:</span> {probe.writeError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Root Cause Analysis & Guidance Card */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Security Rules Architecture & Resolution Guide</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <h5 className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Why "Missing or insufficient permissions" Happens</span>
            </h5>
            <p className="text-neutral-300 leading-relaxed text-[11px]">
              When Firestore rules contain <code className="px-1.5 py-0.5 bg-neutral-950 text-amber-300 rounded">allow read, write: if request.auth != null;</code>, every request must have an active Firebase Auth user token.
            </p>
            <ul className="list-disc list-inside text-neutral-400 space-y-1 text-[11px]">
              <li>If the user is a new visitor and hasn't logged in, <code className="text-neutral-300">request.auth</code> will be <code className="text-rose-400">null</code>.</li>
              <li>The app automatically initiates an Anonymous session to satisfy this requirement.</li>
              <li>If Anonymous Auth is disabled in the Firebase Console, the login fails and Firestore denies access.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <h5 className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>How to Ensure 100% Reliable Access</span>
            </h5>
            <div className="space-y-2 text-[11px] text-neutral-300">
              <p>
                <strong>Option A (Recommended for Public E-Commerce):</strong> In Firebase Console, go to <em>Authentication &gt; Sign-in method</em>, click <em>Anonymous</em>, and turn on <strong>Enable</strong>.
              </p>
              <p>
                <strong>Option B:</strong> For public read-only storefronts where customers don't need to log in to browse clothes, configure rules so products and store config are readable:
              </p>
              <pre className="p-2 bg-neutral-950 rounded border border-neutral-800 font-mono text-[10px] text-sky-300 overflow-x-auto">
{`match /products/{id} { allow read: if true; allow write: if request.auth != null; }`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Captured Error Log Stream */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-850">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h4 className="font-serif font-bold text-sm text-white">
              Captured Firestore Security Notices ({report?.recentErrors.length || 0})
            </h4>
          </div>

          {report && report.recentErrors.length > 0 && (
            <button
              onClick={handleClearErrors}
              className="px-2.5 py-1 text-[11px] text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {report?.recentErrors && report.recentErrors.length > 0 ? (
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {report.recentErrors.map((err) => (
              <div
                key={err.id}
                onClick={() => setSelectedError(selectedError?.id === err.id ? null : err)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedError?.id === err.id
                    ? 'bg-neutral-900 border-amber-400/80 shadow-lg'
                    : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 rounded font-mono font-bold text-[10px] uppercase">
                      {err.operationType}
                    </span>
                    <span className="font-mono text-neutral-200 font-bold">{err.path || 'unknown'}</span>
                  </div>
                  <span className="text-neutral-500 font-mono text-[10px]">{err.timestamp}</span>
                </div>

                <p className="mt-1.5 font-mono text-rose-300 text-[11px] truncate">
                  {err.error}
                </p>

                {selectedError?.id === err.id && (
                  <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2 text-[11px] animate-fadeIn">
                    <div>
                      <span className="text-neutral-400 font-semibold">Root Cause:</span>
                      <p className="text-amber-300 font-mono mt-0.5">{err.possibleRootCause}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400 font-semibold">Suggested Fix:</span>
                      <pre className="text-neutral-300 font-mono bg-neutral-950 p-2 rounded mt-0.5 whitespace-pre-wrap text-[10px]">
                        {err.suggestedFix}
                      </pre>
                    </div>
                    <div>
                      <span className="text-neutral-400 font-semibold">Auth State During Error:</span>
                      <div className="text-neutral-300 font-mono text-[10px] mt-0.5">
                        IsAuthenticated: {err.authSnapshot.isAuthenticated ? 'YES' : 'NO'} | UID: {err.authSnapshot.uid || 'null'} | IsAnon: {err.authSnapshot.isAnonymous ? 'YES' : 'NO'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-neutral-900/40 rounded-xl border border-neutral-800/60 space-y-1">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-neutral-200">No Security Rule Denials Recorded</p>
            <p className="text-[11px] text-neutral-400">
              All recent Firestore operations executed cleanly without permission violations.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
