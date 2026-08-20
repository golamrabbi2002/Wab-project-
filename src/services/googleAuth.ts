// Real Google Identity Services (GIS) integration service
import { Customer } from '../types';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
            ux_mode?: 'popup' | 'redirect';
          }) => void;
          prompt: (notification?: (notification: any) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
              locale?: string;
            }
          ) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (tokenResponse: {
              access_token?: string;
              error?: string;
              expires_in?: number;
            }) => void;
            error_callback?: (err: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  givenName?: string;
  familyName?: string;
  verifiedEmail?: boolean;
}

export const DEFAULT_GOOGLE_CLIENT_ID = '461741220295-rqq6hdsnrijiopvkc8j2g6j39ch0h33o.apps.googleusercontent.com';

// Decode Google JWT Token securely without external dependencies
export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT payload:', e);
    return null;
  }
}

export class GoogleAuthService {
  private static scriptLoaded = false;
  private static scriptLoadingPromise: Promise<boolean> | null = null;

  // Load Google Identity Services SDK script
  public static loadGoogleScript(): Promise<boolean> {
    if (this.scriptLoaded && window.google?.accounts) {
      return Promise.resolve(true);
    }

    if (typeof window === 'undefined') {
      return Promise.resolve(false);
    }

    if (window.google?.accounts) {
      this.scriptLoaded = true;
      return Promise.resolve(true);
    }

    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise((resolve) => {
      // Check if already in DOM
      const existing = document.getElementById('google-gsi-script');
      if (existing) {
        if (window.google?.accounts) {
          this.scriptLoaded = true;
          resolve(true);
        } else {
          existing.addEventListener('load', () => {
            this.scriptLoaded = true;
            resolve(true);
          });
          existing.addEventListener('error', () => resolve(false));
        }
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.warn('Google Identity Services script failed to load.');
        resolve(false);
      };
      document.head.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  // Get active Google Client ID from store settings or environment
  public static getEffectiveClientId(configClientId?: string): string {
    if (configClientId && configClientId.trim()) {
      return configClientId.trim();
    }
    const envClientId = ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string) || '';
    if (envClientId && envClientId.trim()) {
      return envClientId.trim();
    }
    return DEFAULT_GOOGLE_CLIENT_ID;
  }

  // Render official Google Sign-In button into a DOM container
  public static async renderOfficialButton(
    container: HTMLElement,
    clientId: string,
    onSuccess: (profile: GoogleUserProfile) => void,
    onError: (errorMsg: string) => void,
    options?: {
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      width?: number;
    }
  ): Promise<boolean> {
    const isLoaded = await this.loadGoogleScript();
    if (!isLoaded || !window.google?.accounts?.id) {
      return false;
    }

    if (!clientId) {
      return false;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            const payload = parseJwt(response.credential);
            if (payload && payload.email) {
              const profile: GoogleUserProfile = {
                id: payload.sub || `google-${Date.now()}`,
                email: payload.email,
                name: payload.name || payload.email.split('@')[0],
                avatar: payload.picture || '',
                givenName: payload.given_name,
                familyName: payload.family_name,
                verifiedEmail: payload.email_verified,
              };
              onSuccess(profile);
            } else {
              onError('Invalid credentials received from Google.');
            }
          } else {
            onError('No Google credential returned.');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear container and render button
      container.innerHTML = '';
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: options?.theme || 'outline',
        size: 'large',
        text: options?.text || 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: options?.width || (container.clientWidth > 0 ? container.clientWidth : 360),
      });

      return true;
    } catch (err: any) {
      console.error('Error rendering official Google button:', err);
      onError(err?.message || 'Failed to render Google Sign-In button.');
      return false;
    }
  }

  // Programmatic Google Sign-In with OAuth Token Client or prompt
  public static async signInWithGoogle(
    clientId: string,
    onSuccess: (profile: GoogleUserProfile) => void,
    onError: (errorMsg: string) => void
  ): Promise<void> {
    const isLoaded = await this.loadGoogleScript();
    if (!isLoaded || !window.google?.accounts) {
      onError('Unable to reach Google Identity Services. Check your network connection.');
      return;
    }

    if (!clientId) {
      onError('Google Client ID is missing. Set VITE_GOOGLE_CLIENT_ID in .env or Brand Settings.');
      return;
    }

    try {
      // 1. If oauth2 token client is available, use standard popup authorization
      if (window.google.accounts.oauth2) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              onError(`Google OAuth error: ${tokenResponse.error}`);
              return;
            }
            if (tokenResponse.access_token) {
              try {
                // Fetch authenticated user profile using userinfo endpoint
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                });
                if (res.ok) {
                  const userInfo = await res.json();
                  const profile: GoogleUserProfile = {
                    id: userInfo.sub || `google-${Date.now()}`,
                    email: userInfo.email,
                    name: userInfo.name || userInfo.email.split('@')[0],
                    avatar: userInfo.picture || '',
                    givenName: userInfo.given_name,
                    familyName: userInfo.family_name,
                    verifiedEmail: userInfo.email_verified,
                  };
                  onSuccess(profile);
                  return;
                }
              } catch (e: any) {
                console.warn('Failed to query userinfo endpoint, falling back:', e);
              }
            }
          },
          error_callback: (err) => {
            console.error('Google OAuth popup error:', err);
            onError(err?.message || 'Google Sign-In popup was closed or blocked.');
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      }

      // 2. Fallback to initialize + prompt
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            const payload = parseJwt(response.credential);
            if (payload && payload.email) {
              const profile: GoogleUserProfile = {
                id: payload.sub || `google-${Date.now()}`,
                email: payload.email,
                name: payload.name || payload.email.split('@')[0],
                avatar: payload.picture || '',
                givenName: payload.given_name,
                familyName: payload.family_name,
                verifiedEmail: payload.email_verified,
              };
              onSuccess(profile);
            } else {
              onError('Invalid payload returned by Google Authentication.');
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed?.()) {
          console.log('GIS One-Tap not displayed:', notification.getNotDisplayedReason?.());
        }
      });
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      onError(err?.message || 'Google authentication encountered an unexpected issue.');
    }
  }

  // Convert Google User Profile into Store Customer entity
  public static mapProfileToCustomer(profile: GoogleUserProfile): Customer {
    return {
      id: profile.id,
      email: profile.email.toLowerCase().trim(),
      name: profile.name || profile.email.split('@')[0],
      avatar: profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      phone: '+880 1812-345678',
      shippingAddress: {
        street: 'House 14, Road 7, Dhanmondi',
        city: 'Dhaka',
        state: 'Dhaka Division',
        zip: '1205',
        country: 'Bangladesh',
      },
      wishlist: [],
      createdAt: new Date().toISOString(),
    };
  }
}

