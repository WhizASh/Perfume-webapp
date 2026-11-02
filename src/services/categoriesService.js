import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config.js';
import { initialCategories } from '../data/categories.js';

const COLLECTION_NAME = 'categories';
const LOCAL_STORAGE_KEY = 'ikk_perfume_categories';

function withTimeout(promise, ms = 3500) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore categories request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export function getLocalCategories() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If local storage still has deprecated scent categories, fallback to the 5 official categories
        const hasLegacyCategories = parsed.some((c) =>
          ['woody', 'floral', 'fresh', 'oud', 'oriental'].includes(c.id?.toLowerCase())
        );
        if (!hasLegacyCategories) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Could not read categories from localStorage:', e);
  }
  return initialCategories;
}

export function saveLocalCategories(cats) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cats));
  } catch (e) {
    console.warn('Could not write categories to localStorage:', e);
  }
}

/**
 * Fetch all categories from Firestore with localStorage fallback.
 */
export async function fetchCategories() {
  if (!isFirebaseConfigured || !db) {
    return getLocalCategories();
  }

  try {
    const querySnapshot = await withTimeout(getDocs(collection(db, COLLECTION_NAME)), 3500);
    if (querySnapshot.empty) {
      return getLocalCategories();
    }

    const items = [];
    querySnapshot.forEach((docSnapshot) => {
      items.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      });
    });

    saveLocalCategories(items);
    return items;
  } catch (error) {
    console.warn('Firestore categories slow or unavailable. Using cached/local data:', error.message);
    return getLocalCategories();
  }
}

/**
 * Create or update a category.
 * Saves to localStorage immediately, and attempts to sync to Firestore in the background.
 * @param {Object} categoryData
 */
export async function createCategory(categoryData) {
  const slug = (categoryData.name || 'category')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const id = categoryData.id || slug;

  const payload = {
    id,
    name: categoryData.name?.trim() || '',
    sub: categoryData.sub?.trim() || '',
    image:
      categoryData.image?.trim() ||
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=85',
  };

  // 1. Immediately update localStorage
  const current = getLocalCategories();
  const existingIdx = current.findIndex((c) => c.id === id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = payload;
  } else {
    updated = [...current, payload];
  }
  saveLocalCategories(updated);

  // 2. Sync to Firestore if available
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(
        docRef,
        {
          ...payload,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Could not sync category to Firestore (permissions or network):', err.message);
    }
  }

  return payload;
}

/**
 * Delete a category by ID.
 * Removes from localStorage and syncs deletion to Firestore.
 * @param {string} id
 */
export async function deleteCategory(id) {
  // 1. Immediately remove from localStorage
  const current = getLocalCategories();
  const filtered = current.filter((c) => c.id !== id);
  saveLocalCategories(filtered);

  // 2. Sync deletion to Firestore if available
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Could not delete category from Firestore (permissions or network):', err.message);
    }
  }

  return id;
}

/**
 * Seed initial sample categories into Firestore and localStorage.
 */
export async function seedCategoriesToFirestore() {
  saveLocalCategories(initialCategories);

  if (!isFirebaseConfigured || !db) {
    return initialCategories.map((c) => c.id);
  }

  const results = [];
  for (const item of initialCategories) {
    const { id, ...data } = item;
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(
        docRef,
        {
          id,
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      results.push(id);
    } catch (err) {
      console.warn('Could not seed category to Firestore:', err.message);
    }
  }

  return results;
}
