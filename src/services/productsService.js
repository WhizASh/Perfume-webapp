import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config.js';
import { products as initialProducts } from '../data/products.js';
import { uploadProductImage } from './storageService.js';

const COLLECTION_NAME = 'products';
const LOCAL_STORAGE_KEY = 'ikk_perfume_products';

/**
 * Helper to race a promise against a timeout (default 3.5 seconds).
 */
function withTimeout(promise, ms = 3500) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Helper to normalize product pricing (MRP and Selling Price)
 */
export function normalizeProduct(p) {
  const sellingPrice = Number(p.sellingPrice ?? p.price) || 0;
  const mrp = p.mrp !== undefined && p.mrp !== null && p.mrp !== '' ? Number(p.mrp) : sellingPrice;
  return {
    ...p,
    price: sellingPrice,
    sellingPrice,
    mrp,
  };
}

/**
 * Helper to compute discount metadata (percentage, savings, boolean flag)
 */
export function getProductDiscount(product) {
  if (!product) return { hasDiscount: false, percent: 0, savings: 0, mrp: 0, selling: 0 };
  const selling = Number(product.sellingPrice ?? product.price) || 0;
  const mrp = Number(product.mrp) || 0;
  if (mrp > selling && selling > 0) {
    const savings = mrp - selling;
    const percent = Math.round((savings / mrp) * 100);
    return { hasDiscount: true, percent, savings, mrp, selling };
  }
  return { hasDiscount: false, percent: 0, savings: 0, mrp, selling };
}

/**
 * Retrieve products from localStorage, falling back to initial catalog.
 */
export function getLocalProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If local storage has legacy families like Woody/Floral, update to new demo catalog
        const hasLegacyFamilies = parsed.some((p) =>
          ['Woody', 'Floral', 'Fresh', 'Oud'].includes(p.family)
        );
        if (!hasLegacyFamilies) {
          return parsed.map(normalizeProduct);
        }
      }
    }
  } catch (e) {
    console.warn('Could not read products from localStorage:', e);
  }
  return initialProducts.map(normalizeProduct);
}

/**
 * Persist products array to localStorage.
 */
export function saveLocalProducts(items) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not write products to localStorage:', e);
  }
}

/**
 * Fetch all products from Cloud Firestore.
 * Seamlessly falls back to local catalog if Firestore is empty, slow, or unconfigured.
 */
export async function fetchProducts() {
  if (!isFirebaseConfigured || !db) {
    return getLocalProducts();
  }

  try {
    const querySnapshot = await withTimeout(getDocs(collection(db, COLLECTION_NAME)), 3500);
    if (querySnapshot.empty) {
      return getLocalProducts();
    }

    const items = [];
    querySnapshot.forEach((docSnapshot) => {
      items.push(
        normalizeProduct({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        })
      );
    });

    saveLocalProducts(items);
    return items;
  } catch (error) {
    console.warn('Firestore fetch products slow or unavailable. Using cached/local data:', error.message);
    return getLocalProducts();
  }
}

/**
 * Create or update a product.
 * Saves to localStorage immediately, and attempts to sync to Firestore in the background.
 * @param {Object} productData - Product fields
 * @param {File} [imageFile] - Optional image file to upload
 */
export async function createProduct(productData, imageFile) {
  let imageUrl = productData.image || '';

  // If a new image file was provided, upload or convert to base64
  if (imageFile) {
    const slug = (productData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    imageUrl = await uploadProductImage(imageFile, slug);
  }

  const id =
    productData.id ||
    (productData.name || 'perfume')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36);

  const sellingPrice = Number(productData.price ?? productData.sellingPrice) || 0;
  const mrp =
    productData.mrp !== undefined && productData.mrp !== null && productData.mrp !== ''
      ? Number(productData.mrp)
      : sellingPrice;

  const payload = {
    id,
    name: productData.name?.trim() || '',
    price: sellingPrice,
    sellingPrice,
    mrp,
    concentration: productData.concentration || 'Eau de Parfum',
    notes: productData.notes?.trim() || '',
    family: productData.family || 'Perfume',
    size: productData.size || '50 ml',
    badge: productData.badge?.trim() || '',
    description: productData.description?.trim() || '',
    image: imageUrl || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85',
  };

  // 1. Immediately persist to localStorage
  const current = getLocalProducts();
  const existingIdx = current.findIndex((p) => p.id === id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = payload;
  } else {
    updated = [payload, ...current];
  }
  saveLocalProducts(updated);

  // 2. Sync to Cloud Firestore if connected and permissible
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(docRef, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.warn('Could not sync created product to Firestore (permissions or network):', err.message);
    }
  }

  return payload;
}

/**
 * Delete a product by ID.
 * Removes from localStorage and syncs deletion to Firestore.
 * @param {string} id - Product ID
 */
export async function deleteProduct(id) {
  // 1. Immediately remove from localStorage
  const current = getLocalProducts();
  const filtered = current.filter((p) => p.id !== id);
  saveLocalProducts(filtered);

  // 2. Sync deletion to Cloud Firestore if connected
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Could not delete product from Firestore (permissions or network):', err.message);
    }
  }

  return id;
}

/**
 * Seed initial sample catalog into Firestore and localStorage.
 */
export async function seedProductsToFirestore() {
  saveLocalProducts(initialProducts);

  if (!isFirebaseConfigured || !db) {
    return initialProducts.map((p) => p.id);
  }

  const results = [];
  for (const item of initialProducts) {
    const { id, ...data } = item;
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(
        docRef,
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      results.push(id);
    } catch (err) {
      console.warn('Could not seed product to Firestore:', err.message);
    }
  }

  return results;
}
