import { auth, db, ensureFirebaseAuth, OperationType } from './firestoreService';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  limit, 
  query 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export interface AuthDiagnosticInfo {
  isAuthenticated: boolean;
  isAnonymous: boolean;
  uid: string | null;
  email: string | null;
  emailVerified: boolean | null;
  tenantId: string | null;
  providerIds: string[];
  idTokenSnippet: string | null;
  tokenExpiration: string | null;
  lastSignInTime: string | null;
  creationTime: string | null;
  authInitState: 'authenticated' | 'anonymous' | 'unauthenticated' | 'authorizing' | 'error';
  lastAuthError: string | null;
}

export interface CollectionProbeResult {
  collectionName: string;
  rulePath: string;
  readStatus: 'granted' | 'denied' | 'error' | 'pending';
  readError: string | null;
  readLatencyMs: number;
  writeStatus: 'granted' | 'denied' | 'error' | 'pending';
  writeError: string | null;
  writeLatencyMs: number;
  itemCount?: number;
}

export interface DiagnosticErrorLog {
  id: string;
  timestamp: string;
  operationType: OperationType;
  path: string | null;
  error: string;
  authSnapshot: {
    isAuthenticated: boolean;
    isAnonymous: boolean;
    uid: string | null;
    email: string | null;
  };
  possibleRootCause: string;
  suggestedFix: string;
}

export interface FullDiagnosticReport {
  timestamp: string;
  firebaseConfig: {
    projectId: string;
    authDomain: string;
    firestoreDatabaseId: string;
  };
  authInfo: AuthDiagnosticInfo;
  collectionProbes: CollectionProbeResult[];
  securityRuleSummary: {
    activeRulePattern: string;
    authRequirementMet: boolean;
    verdict: 'ALL_PASS' | 'PARTIAL_FAIL' | 'AUTH_DENIED' | 'OFFLINE';
    summaryMessage: string;
  };
  recentErrors: DiagnosticErrorLog[];
}

type DiagnosticsListener = (report: FullDiagnosticReport) => void;

class FirebaseDiagnosticsService {
  private errorLogs: DiagnosticErrorLog[] = [];
  private listeners: Set<DiagnosticsListener> = new Set();
  private lastAuthError: string | null = null;
  private isProbing = false;

  constructor() {
    this.initAuthListener();
    this.exposeToWindow();
  }

  private initAuthListener() {
    let authAttempted = false;
    onAuthStateChanged(auth, async (user) => {
      if (!user && !authAttempted) {
        authAttempted = true;
        try {
          await signInAnonymously(auth);
          this.lastAuthError = null;
        } catch (err: any) {
          if (err?.code === 'auth/admin-restricted-operation') {
            this.lastAuthError = 'Anonymous Authentication is disabled in Firebase Console (Public Security Rules Mode Active).';
          } else {
            this.lastAuthError = err?.message || String(err);
          }
        }
      } else if (user) {
        this.lastAuthError = null;
      }
    });
  }

  private exposeToWindow() {
    if (typeof window !== 'undefined') {
      (window as any).runFirebaseDiagnostics = async () => {
        return await this.runConsoleDiagnostics();
      };
      (window as any).firebaseDiagnostics = this;
      console.log(
        '%c🔥 Firebase Diagnostics Ready %cRun %cwindow.runFirebaseDiagnostics()%c in console to test Auth & Security Rules',
        'background: #f59e0b; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #9ca3af;',
        'color: #38bdf8; font-weight: bold; text-decoration: underline;',
        'color: #9ca3af;'
      );
    }
  }

  public subscribe(listener: DiagnosticsListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(report: FullDiagnosticReport) {
    this.listeners.forEach((listener) => {
      try {
        listener(report);
      } catch (err) {
        console.error('Error in diagnostics listener', err);
      }
    });
  }

  public recordError(
    error: unknown,
    operationType: OperationType,
    path: string | null,
    authContext?: {
      userId?: string | null;
      email?: string | null;
      isAnonymous?: boolean | null;
    }
  ) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const currentUser = auth.currentUser;
    const isAuth = !!(currentUser || authContext?.userId);
    const isAnon = currentUser ? currentUser.isAnonymous : !!authContext?.isAnonymous;
    const uid = currentUser?.uid || authContext?.userId || null;
    const email = currentUser?.email || authContext?.email || null;

    let rootCause = 'Unknown Firestore Error';
    let suggestedFix = 'Check Firestore error message and browser network connection.';

    if (errorMsg.includes('Missing or insufficient permissions') || errorMsg.includes('permission-denied')) {
      if (!isAuth || uid === null) {
        rootCause = 'Unauthenticated Request (request.auth == null). Firestore rule requires "request.auth != null".';
        suggestedFix = '1. Enable "Anonymous" sign-in in Firebase Console (Authentication > Sign-in method > Anonymous)\n2. Or update firestore.rules to "allow read, write: if true;" for public stores.';
      } else {
        rootCause = `Authenticated as ${isAnon ? 'Anonymous User' : email || 'User'} (UID: ${uid}), but the specific collection rule denied this ${operationType} operation.`;
        suggestedFix = `Verify firestore.rules for path "/${path || '*'}" allows ${operationType} for user UID: ${uid}`;
      }
    } else if (errorMsg.includes('offline') || errorMsg.includes('unavailable')) {
      rootCause = 'Client network is offline or unable to reach Google Cloud Firestore servers.';
      suggestedFix = 'Check internet connection or DNS / firewall proxy filters.';
    }

    const logEntry: DiagnosticErrorLog = {
      id: 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString() + '.' + new Date().getMilliseconds(),
      operationType,
      path,
      error: errorMsg,
      authSnapshot: {
        isAuthenticated: isAuth,
        isAnonymous: isAnon,
        uid,
        email
      },
      possibleRootCause: rootCause,
      suggestedFix
    };

    this.errorLogs.unshift(logEntry);
    if (this.errorLogs.length > 50) {
      this.errorLogs.pop();
    }
  }

  public getRecentErrors(): DiagnosticErrorLog[] {
    return [...this.errorLogs];
  }

  public clearErrors() {
    this.errorLogs = [];
  }

  public async getAuthInfo(): Promise<AuthDiagnosticInfo> {
    const user = auth.currentUser;
    let idTokenSnippet: string | null = null;
    let tokenExpiration: string | null = null;

    if (user) {
      try {
        const idTokenResult = await user.getIdTokenResult();
        idTokenSnippet = idTokenResult.token ? idTokenResult.token.slice(0, 16) + '...' + idTokenResult.token.slice(-8) : null;
        tokenExpiration = idTokenResult.expirationTime;
      } catch (err) {
        console.warn('Could not fetch token details', err);
      }
    }

    let authInitState: AuthDiagnosticInfo['authInitState'] = 'unauthenticated';
    if (user) {
      authInitState = user.isAnonymous ? 'anonymous' : 'authenticated';
    } else if (this.lastAuthError) {
      authInitState = 'error';
    }

    return {
      isAuthenticated: !!user,
      isAnonymous: !!user?.isAnonymous,
      uid: user?.uid || null,
      email: user?.email || null,
      emailVerified: user?.emailVerified || null,
      tenantId: user?.tenantId || null,
      providerIds: user?.providerData?.map(p => p.providerId) || (user?.isAnonymous ? ['anonymous'] : []),
      idTokenSnippet,
      tokenExpiration,
      lastSignInTime: user?.metadata?.lastSignInTime || null,
      creationTime: user?.metadata?.creationTime || null,
      authInitState,
      lastAuthError: this.lastAuthError
    };
  }

  public async probeCollection(
    name: 'store' | 'products' | 'orders' | 'customers' | 'threat_logs'
  ): Promise<CollectionProbeResult> {
    const probeDocId = `_diagnostics_probe_${Date.now()}`;
    const result: CollectionProbeResult = {
      collectionName: name,
      rulePath: `/${name}`,
      readStatus: 'pending',
      readError: null,
      readLatencyMs: 0,
      writeStatus: 'pending',
      writeError: null,
      writeLatencyMs: 0,
      itemCount: 0
    };

    // 1. Test Read
    const startRead = performance.now();
    try {
      if (name === 'store') {
        const docRef = doc(db, 'store', 'config');
        const snap = await getDoc(docRef);
        result.readLatencyMs = Math.round(performance.now() - startRead);
        result.readStatus = 'granted';
        result.itemCount = snap.exists() ? 1 : 0;
      } else {
        const colRef = collection(db, name);
        const q = query(colRef, limit(3));
        const snap = await getDocs(q);
        result.readLatencyMs = Math.round(performance.now() - startRead);
        result.readStatus = 'granted';
        result.itemCount = snap.size;
      }
    } catch (err: any) {
      result.readLatencyMs = Math.round(performance.now() - startRead);
      result.readStatus = 'denied';
      result.readError = err?.message || String(err);
      this.recordError(err, OperationType.GET, `/${name}`);
    }

    // 2. Test Write (and auto-clean probe)
    const startWrite = performance.now();
    try {
      if (name === 'store') {
        const probeRef = doc(db, 'store', probeDocId);
        await setDoc(probeRef, { probe: true, timestamp: Date.now() });
        await deleteDoc(probeRef);
        result.writeLatencyMs = Math.round(performance.now() - startWrite);
        result.writeStatus = 'granted';
      } else {
        const probeRef = doc(db, name, probeDocId);
        await setDoc(probeRef, { probe: true, test: 'diagnostics', createdAt: new Date().toISOString() });
        await deleteDoc(probeRef);
        result.writeLatencyMs = Math.round(performance.now() - startWrite);
        result.writeStatus = 'granted';
      }
    } catch (err: any) {
      result.writeLatencyMs = Math.round(performance.now() - startWrite);
      result.writeStatus = 'denied';
      result.writeError = err?.message || String(err);
      this.recordError(err, OperationType.WRITE, `/${name}/${probeDocId}`);
    }

    return result;
  }

  public async runFullDiagnostics(): Promise<FullDiagnosticReport> {
    if (this.isProbing) {
      // Return previous snapshot or wait
    }
    this.isProbing = true;

    try {
      await ensureFirebaseAuth();
      const authInfo = await this.getAuthInfo();

      const collectionsToTest: ('store' | 'products' | 'orders' | 'customers' | 'threat_logs')[] = [
        'store',
        'products',
        'orders',
        'customers',
        'threat_logs'
      ];

      const probes: CollectionProbeResult[] = [];
      for (const col of collectionsToTest) {
        const probeRes = await this.probeCollection(col);
        probes.push(probeRes);
      }

      const anyDenials = probes.some(p => p.readStatus === 'denied' || p.writeStatus === 'denied');
      const allPassed = probes.every(p => p.readStatus === 'granted' && p.writeStatus === 'granted');

      let verdict: FullDiagnosticReport['securityRuleSummary']['verdict'] = 'ALL_PASS';
      let summaryMessage = 'All collections passed read and write security rule tests.';

      if (allPassed) {
        verdict = 'ALL_PASS';
        summaryMessage = `Full access verified! All Firestore collections (store, products, orders, customers) are accessible without permission barriers.`;
      } else if (anyDenials && !authInfo.isAuthenticated) {
        verdict = 'AUTH_DENIED';
        summaryMessage = 'Firebase Auth is currently unauthenticated (request.auth == null) and security rules require authentication.';
      } else if (anyDenials) {
        verdict = 'PARTIAL_FAIL';
        summaryMessage = 'Some collections denied read or write operations. Review the collection-specific errors below.';
      }

      const report: FullDiagnosticReport = {
        timestamp: new Date().toISOString(),
        firebaseConfig: {
          projectId: firebaseConfig.projectId,
          authDomain: firebaseConfig.authDomain,
          firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || '(default)'
        },
        authInfo,
        collectionProbes: probes,
        securityRuleSummary: {
          activeRulePattern: 'allow read, write: if true;',
          authRequirementMet: authInfo.isAuthenticated || allPassed,
          verdict,
          summaryMessage
        },
        recentErrors: this.getRecentErrors()
      };

      this.notifyListeners(report);
      return report;
    } finally {
      this.isProbing = false;
    }
  }

  public async forceReAuthenticate(): Promise<AuthDiagnosticInfo> {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      await signInAnonymously(auth);
      this.lastAuthError = null;
    } catch (err: any) {
      this.lastAuthError = err?.message || String(err);
      console.warn('[FirebaseDiagnostics] Force Re-Auth Error:', this.lastAuthError);
    }
    return await this.getAuthInfo();
  }

  public async runConsoleDiagnostics(): Promise<FullDiagnosticReport> {
    console.group('%c🔥 FIREBASE AUTH & SECURITY RULES DIAGNOSTIC REPORT', 'color: #f59e0b; font-size: 14px; font-weight: bold;');
    console.log('%cTimestamp:', 'color: #9ca3af;', new Date().toLocaleString());
    console.log('%cProject ID:', 'color: #9ca3af;', firebaseConfig.projectId);
    console.log('%cDatabase ID:', 'color: #9ca3af;', firebaseConfig.firestoreDatabaseId || '(default)');

    console.log('%cRunning live security probe...', 'color: #38bdf8; font-style: italic;');
    const report = await this.runFullDiagnostics();

    // 1. Auth Status Table
    console.group('%c1. Current Firebase Auth State', 'color: #10b981; font-weight: bold;');
    console.table({
      'Is Authenticated': report.authInfo.isAuthenticated ? '✅ YES' : '❌ NO (request.auth == null)',
      'Auth Type': report.authInfo.isAnonymous ? '👤 Anonymous Session' : (report.authInfo.email ? `📧 Logged In (${report.authInfo.email})` : '🚫 None'),
      'User UID': report.authInfo.uid || 'None',
      'Email Verified': report.authInfo.emailVerified !== null ? String(report.authInfo.emailVerified) : 'N/A',
      'Provider IDs': report.authInfo.providerIds.join(', ') || 'none',
      'Token Expiration': report.authInfo.tokenExpiration || 'N/A',
      'Last Auth Error': report.authInfo.lastAuthError || 'None (Healthy)'
    });
    console.groupEnd();

    // 2. Collection Probes Table
    console.group('%c2. Firestore Collection Security Probes', 'color: #38bdf8; font-weight: bold;');
    const probeRows = report.collectionProbes.map(p => ({
      Collection: p.collectionName,
      Path: p.rulePath,
      'Read Status': p.readStatus === 'granted' ? '✅ GRANTED' : '❌ DENIED',
      'Read Error': p.readError || 'None (200 OK)',
      'Read Latency': `${p.readLatencyMs}ms`,
      'Write Status': p.writeStatus === 'granted' ? '✅ GRANTED' : '❌ DENIED',
      'Write Error': p.writeError || 'None (200 OK)',
      'Write Latency': `${p.writeLatencyMs}ms`
    }));
    console.table(probeRows);
    console.groupEnd();

    // 3. Verdict & Actionable Guidance
    console.group('%c3. Diagnostic Verdict & Actionable Fixes', 'color: #f59e0b; font-weight: bold;');
    if (report.securityRuleSummary.verdict === 'ALL_PASS') {
      console.log('%c✅ SUCCESS: All Firestore collections are accessible and properly authorized!', 'color: #10b981; font-weight: bold;');
    } else {
      console.warn('%c⚠️ ACCESS DENIED DETECTED:', 'color: #ef4444; font-weight: bold;', report.securityRuleSummary.summaryMessage);
      
      if (!report.authInfo.isAuthenticated) {
        console.group('%c🚨 How to Fix "Missing or insufficient permissions":', 'color: #f97316; font-weight: bold;');
        console.log('1. Open Firebase Console: https://console.firebase.google.com/project/' + firebaseConfig.projectId + '/authentication/providers');
        console.log('2. Go to "Authentication" -> "Sign-in method".');
        console.log('3. Ensure "Anonymous" is ENABLED.');
        console.log('4. Or, if this store should allow public reading by visitors without signing in, update firestore.rules to:');
        console.log(`   match /{collectionName}/{id} {
     allow read, write: if true;
   }`);
        console.groupEnd();
      }
    }
    console.groupEnd();

    // 4. Recent Caught Errors
    if (report.recentErrors.length > 0) {
      console.group('%c4. Recent Caught Firestore Errors (' + report.recentErrors.length + ')', 'color: #ef4444; font-weight: bold;');
      console.table(report.recentErrors.map(e => ({
        Time: e.timestamp,
        Operation: e.operationType,
        Path: e.path,
        Error: e.error,
        'Auth Context': e.authSnapshot.isAuthenticated ? `UID: ${e.authSnapshot.uid}` : 'Unauthenticated',
        'Root Cause': e.possibleRootCause
      })));
      console.groupEnd();
    }

    console.groupEnd();
    return report;
  }
}

export const firebaseDiagnosticsService = new FirebaseDiagnosticsService();
