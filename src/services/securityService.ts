/**
 * Security & Anti-Hacking Service
 * Features:
 * 1. Web Crypto SHA-256 Salted Hashing
 * 2. Anti-Brute-Force & Rate Limiting with Lockout
 * 3. Cryptographic Admin Session Tokens with Expiry
 * 4. Comprehensive HTML/Script Sanitization (Anti-XSS)
 * 5. Input Validation & Bounds Checking (Anti-Injection)
 */

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const SESSION_EXPIRY_MS = 4 * 60 * 60 * 1000; // 4 hours admin session

const STORAGE_KEYS = {
  ATTEMPTS: 'aura_sec_login_attempts',
  LOCKOUT_UNTIL: 'aura_sec_lockout_until',
  SESSION_TOKEN: 'aura_sec_admin_token',
  SESSION_EXPIRY: 'aura_sec_admin_exp',
  ADMIN_HASH: 'aura_sec_admin_hash'
};

export class SecurityService {
  /**
   * Cryptographically hash a string using Web Crypto SHA-256
   */
  static async hashString(input: string, salt: string = 'AURA_ATELIER_SEC_SALT_2026'): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(`${salt}:${input}:${salt}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback simple deterministic hash if Web Crypto unavailable
      let hash = 0;
      const str = `${salt}:${input}:${salt}`;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      return `h_${Math.abs(hash).toString(16)}`;
    }
  }

  /**
   * Check if login is currently locked due to too many failed attempts
   */
  static getLockoutStatus(): { isLocked: boolean; remainingSeconds: number } {
    const lockoutUntil = parseInt(sessionStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL) || '0', 10);
    const now = Date.now();
    if (lockoutUntil > now) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((lockoutUntil - now) / 1000)
      };
    }
    // Lockout expired
    if (lockoutUntil > 0) {
      sessionStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
      sessionStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    }
    return { isLocked: false, remainingSeconds: 0 };
  }

  /**
   * Record a failed login attempt; lock out if threshold exceeded
   */
  static recordFailedAttempt(): { attemptsRemaining: number; isLocked: boolean; remainingSeconds: number } {
    const attempts = parseInt(sessionStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '0', 10) + 1;
    sessionStorage.setItem(STORAGE_KEYS.ATTEMPTS, attempts.toString());

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      sessionStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, lockoutUntil.toString());
      return {
        attemptsRemaining: 0,
        isLocked: true,
        remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000)
      };
    }

    return {
      attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts),
      isLocked: false,
      remainingSeconds: 0
    };
  }

  /**
   * Reset failed login attempts on successful login
   */
  static resetAttempts(): void {
    sessionStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    sessionStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
  }

  /**
   * Create a cryptographically secure session token upon successful admin verification
   */
  static async createAdminSession(): Promise<string> {
    this.resetAttempts();
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const rawToken = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const expiry = Date.now() + SESSION_EXPIRY_MS;
    
    const signature = await this.hashString(`${rawToken}:${expiry}`);
    const tokenPayload = `${rawToken}.${expiry}.${signature}`;

    sessionStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, tokenPayload);
    sessionStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiry.toString());
    return tokenPayload;
  }

  /**
   * Validate current admin session token with cryptographic signature and expiry check
   */
  static async validateAdminSession(): Promise<boolean> {
    const tokenPayload = sessionStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (!tokenPayload) return false;

    const parts = tokenPayload.split('.');
    if (parts.length !== 3) return false;

    const [rawToken, expiryStr, signature] = parts;
    const expiry = parseInt(expiryStr, 10);

    if (Date.now() > expiry) {
      this.clearAdminSession();
      return false;
    }

    const expectedSignature = await this.hashString(`${rawToken}:${expiry}`);
    if (signature !== expectedSignature) {
      this.clearAdminSession();
      return false;
    }

    return true;
  }

  /**
   * Clear admin session
   */
  static clearAdminSession(): void {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
    sessionStorage.removeItem('aura_admin_authenticated');
  }

  /**
   * Anti-XSS Sanitization: Escapes malicious characters for HTML context
   */
  static escapeHtml(str: string | null | undefined): string {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Deep input sanitizer: Removes script tags, iframe, javascript: URLs, inline event handlers
   */
  static sanitizeText(input: string | null | undefined, maxLength = 1000): string {
    if (!input) return '';
    let clean = String(input).trim();
    // Truncate to max length to prevent Denial of Wallet / Memory buffer exploitation
    if (clean.length > maxLength) {
      clean = clean.substring(0, maxLength);
    }
    // Remove script tags and contents
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Remove iframe tags
    clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    // Remove javascript: URLs
    clean = clean.replace(/javascript\s*:/gi, '');
    // Remove on* event handlers (e.g. onerror=, onclick=)
    clean = clean.replace(/\son\w+\s*=/gi, '');
    return clean;
  }

  /**
   * Sanitize and validate Phone Number (Bangladesh & International format)
   */
  static sanitizePhone(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '').trim();
    return cleaned.substring(0, 20);
  }

  /**
   * Sanitize and validate Email address
   */
  static sanitizeEmail(email: string): string {
    const cleaned = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleaned)) return '';
    return cleaned.substring(0, 150);
  }

  /**
   * Sanitize Transaction IDs (alphanumeric only)
   */
  static sanitizeTransactionId(txId: string): string {
    return txId.replace(/[^a-zA-Z0-9_-]/g, '').trim().substring(0, 50);
  }
}
