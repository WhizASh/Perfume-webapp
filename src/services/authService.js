import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config.js';

export const DEMO_ADMIN_EMAIL = 'admin@ikkperfume.com';
export const DEMO_ADMIN_PASSWORD = 'admin123';
const DEMO_SESSION_KEY = 'ikk_demo_admin_session';

/**
 * Authenticate admin with email and password.
 * - When Firebase is configured: Uses Firebase Auth (encrypted over TLS, salted scrypt hash).
 * - When in demo mode: Uses pre-configured demo admin credentials.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object }>}
 */
export async function loginAdmin(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. If Firebase Auth is configured in .env, attempt Firebase Auth
  if (isFirebaseConfigured && auth) {
    try {
      return await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (firebaseErr) {
      console.warn('Firebase Auth login failed, checking demo fallback:', firebaseErr.code || firebaseErr.message);
      // Fall back to demo mode if matching default credentials
      if (
        normalizedEmail === DEMO_ADMIN_EMAIL.toLowerCase() &&
        password === DEMO_ADMIN_PASSWORD
      ) {
        const demoUser = {
          email: DEMO_ADMIN_EMAIL,
          uid: 'demo-admin-uid',
          isDemo: true,
        };
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
        }
        return { user: demoUser };
      }
      throw firebaseErr;
    }
  }

  // 2. Offline / Demo Mode fallback
  if (
    normalizedEmail === DEMO_ADMIN_EMAIL.toLowerCase() &&
    password === DEMO_ADMIN_PASSWORD
  ) {
    const demoUser = {
      email: DEMO_ADMIN_EMAIL,
      uid: 'demo-admin-uid',
      isDemo: true,
    };
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
    }
    return { user: demoUser };
  }

  throw new Error(
    `Invalid credentials. For demo mode use: ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`
  );
}

/**
 * Terminate admin session.
 */
export async function logoutAdmin() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  }
  if (auth) {
    return await signOut(auth);
  }
}

/**
 * Subscribe to admin authentication state changes.
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToAuth(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, callback);
  }

  // Check demo session storage
  if (typeof sessionStorage !== 'undefined') {
    const saved = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (saved) {
      try {
        callback(JSON.parse(saved));
        return () => {};
      } catch (err) {
        // ignore parse error
      }
    }
  }

  callback(null);
  return () => {};
}

/**
 * Get the currently logged-in admin user.
 */
export function getCurrentAdmin() {
  if (isFirebaseConfigured && auth?.currentUser) {
    return auth.currentUser;
  }
  if (typeof sessionStorage !== 'undefined') {
    const saved = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        // ignore parse error
      }
    }
  }
  return null;
}
