import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config.js';

/**
 * Authenticate admin with email and password.
 * Password is encrypted in-transit (HTTPS/TLS) and hashed with Firebase scrypt.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function loginAdmin(email, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(
      'Firebase Authentication is not configured. Please add your Firebase keys to .env.'
    );
  }

  return await signInWithEmailAndPassword(auth, email.trim(), password);
}

/**
 * Terminate admin session.
 */
export async function logoutAdmin() {
  if (!auth) return;
  return await signOut(auth);
}

/**
 * Subscribe to admin authentication state changes.
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToAuth(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

/**
 * Get the currently logged-in admin user.
 */
export function getCurrentAdmin() {
  return auth?.currentUser || null;
}
