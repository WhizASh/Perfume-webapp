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
import {
  uploadProductImage,
  uploadProductVideo,
  uploadMultipleProductImages,
} from './storageService.js';

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
 * Detects if a given URL is a video source (direct video or video host)
 */
export function isVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.m4v') ||
    clean.endsWith('.mkv') ||
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com')
  );
}

/**
 * Parses video URL to determine playback strategy (HTML5 vs YouTube vs Vimeo)
 */
export function parseVideoUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // YouTube matchers:
  // e.g. https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&playsinline=1&rel=0`,
      id: ytMatch[1],
    };
  }

  // Vimeo matchers:
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      id: vimeoMatch[1],
    };
  }

  // Standard direct video stream/file
  return {
    type: 'html5',
    url: trimmed,
  };
}

/**
 * Extracts all media items (photos & video) for a product in an ordered list
 */
export function getProductMedia(product) {
  if (!product) return [];
  const items = [];

  const addIfUnique = (entry) => {
    if (!entry || !entry.url) return;
    const cleanUrl = entry.url.trim();
    if (!cleanUrl) return;
    const exists = items.some((i) => i.url === cleanUrl);
    if (!exists) {
      items.push({
        id: `media-${items.length}`,
        type: entry.type || (isVideoUrl(cleanUrl) ? 'video' : 'image'),
        url: cleanUrl,
        title: entry.title || '',
        poster: entry.poster || product.image || '',
      });
    }
  };

  // 1. Primary image
  if (product.image) {
    addIfUnique({ url: product.image, type: 'image', title: product.name });
  }

  // 2. Additional images list
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === 'string' && img.trim()) {
        addIfUnique({ url: img.trim(), type: 'image' });
      }
    }
  }

  // 3. Video field
  if (product.video && typeof product.video === 'string' && product.video.trim()) {
    addIfUnique({
      url: product.video.trim(),
      type: 'video',
      title: `${product.name} Video Showcase`,
      poster: product.image,
    });
  }

  // Fallback if empty
  if (items.length === 0 && product.image) {
    items.push({
      id: 'media-0',
      type: 'image',
      url: product.image,
      title: product.name,
      poster: product.image,
    });
  }

  return items;
}

/**
 * Helper to normalize product pricing (MRP and Price), Variants, and Media
 */
export function normalizeProduct(p) {
  const price = Number(p.price ?? p.sellingPrice) || 0;
  const mrp = p.mrp !== undefined && p.mrp !== null && p.mrp !== '' ? Number(p.mrp) : price;

  // Enrich missing images/video from initial demo catalog if matched
  const matchingInitial = initialProducts.find((ip) => ip.id === p.id);

  const images =
    Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : matchingInitial?.images || (p.image ? [p.image] : []);

  const video = p.video || matchingInitial?.video || '';

  const variants =
    Array.isArray(p.variants) && p.variants.length > 0
      ? p.variants
          .map((v, i) => ({
            id: v.id || `var-${i + 1}`,
            name: String(v.name || '').trim(),
            price: Number(v.price) || 0,
            mrp:
              v.mrp !== undefined && v.mrp !== null && v.mrp !== ''
                ? Number(v.mrp)
                : Number(v.price) || 0,
          }))
          .filter((v) => v.name)
      : matchingInitial?.variants || [];

  return {
    ...p,
    price,
    sellingPrice: price, // Non-breaking alias for backward compatibility
    mrp,
    size: p.size || variants[0]?.name || '50 ml',
    image: p.image || images[0] || '',
    images,
    video,
    variants,
  };
}

/**
 * Helper to compute discount metadata (percentage, savings, boolean flag)
 */
export function getProductDiscount(product) {
  if (!product) return { hasDiscount: false, percent: 0, savings: 0, mrp: 0, selling: 0 };
  const selling = Number(product.price ?? product.sellingPrice) || 0;
  const mrp = Number(product.mrp) || 0;
  if (mrp > selling && selling > 0) {
    const savings = mrp - selling;
    const percent = Math.round((savings / mrp) * 100);
    return { hasDiscount: true, percent, savings, mrp, selling };
  }
  return { hasDiscount: false, percent: 0, savings: 0, mrp, selling };
}

/**
 * Strips all legacy, duplicate, and redundant fields from a product object
 * before persisting to Firestore or localStorage.
 */
export function sanitizeProductForStorage(p) {
  const normalized = normalizeProduct(p);
  return {
    id: normalized.id,
    name: normalized.name || '',
    price: Number(normalized.price) || 0,
    mrp: Number(normalized.mrp) || Number(normalized.price) || 0,
    concentration: normalized.concentration || 'Eau de Parfum',
    notes: normalized.notes || '',
    family: normalized.family || 'Perfume',
    size: normalized.size || normalized.variants?.[0]?.name || '50 ml',
    description: normalized.description || '',
    image: normalized.image || normalized.images?.[0] || '',
    images:
      Array.isArray(normalized.images) && normalized.images.length > 0
        ? normalized.images
        : normalized.image
        ? [normalized.image]
        : [],
    video: normalized.video || '',
    variants: Array.isArray(normalized.variants) ? normalized.variants : [],
  };
}

/**
 * Retrieve products from localStorage, falling back to initial catalog.
 * Automatically performs client-side schema migration if legacy fields or version 1 are detected.
 */
export function getLocalProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const schemaVersion = localStorage.getItem('ikk_perfume_schema_version');

    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If local storage has legacy families like Woody/Floral, update to new demo catalog
        const hasLegacyFamilies = parsed.some((p) =>
          ['Woody', 'Floral', 'Fresh', 'Oud'].includes(p.family)
        );
        if (!hasLegacyFamilies) {
          // Automatic migration: strip sellingPrice, media, badge, and backfill variants
          if (schemaVersion !== '2') {
            const sanitized = parsed.map(sanitizeProductForStorage);
            saveLocalProducts(sanitized);
            return sanitized.map(normalizeProduct);
          }
          return parsed.map(normalizeProduct);
        }
      }
    }
  } catch (e) {
    console.warn('Could not read products from localStorage:', e);
  }

  saveLocalProducts(initialProducts);
  return initialProducts.map(normalizeProduct);
}

/**
 * Persist clean sanitized products array to localStorage.
 */
export function saveLocalProducts(items) {
  try {
    const sanitized = (items || []).map(sanitizeProductForStorage);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
    localStorage.setItem('ikk_perfume_schema_version', '2');
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
 * @param {File} [imageFile] - Primary cover photo file to upload
 * @param {FileList|File[]} [additionalImageFiles] - Multiple gallery photo files to upload
 * @param {File} [videoFile] - Video file to upload
 */
export async function createProduct(productData, imageFile, additionalImageFiles, videoFile) {
  const slug = (productData.name || 'product')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');

  let imageUrl = productData.image || '';

  // 1. Upload primary cover photo file if provided
  if (imageFile) {
    imageUrl = await uploadProductImage(imageFile, `${slug}-cover`);
  }

  // 2. Upload additional gallery photo files if provided
  let uploadedGallery = [];
  if (additionalImageFiles && additionalImageFiles.length > 0) {
    uploadedGallery = await uploadMultipleProductImages(additionalImageFiles, slug);
  }

  // Combine existing images with newly uploaded ones
  let baseImages = Array.isArray(productData.images)
    ? productData.images.filter((img) => typeof img === 'string' && img.trim())
    : [];
  let images = [...baseImages, ...uploadedGallery];
  if (imageUrl && !images.includes(imageUrl)) {
    images = [imageUrl, ...images];
  }

  // 3. Upload product video file if provided
  let videoUrl = typeof productData.video === 'string' ? productData.video.trim() : '';
  if (videoFile) {
    videoUrl = await uploadProductVideo(videoFile, `${slug}-showcase`);
  }

  const id =
    productData.id ||
    (productData.name || 'perfume')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36);

  const price = Number(productData.price ?? productData.sellingPrice) || 0;
  const mrp =
    productData.mrp !== undefined && productData.mrp !== null && productData.mrp !== ''
      ? Number(productData.mrp)
      : price;

  const variants = Array.isArray(productData.variants)
    ? productData.variants
        .map((v, i) => ({
          id: v.id || `var-${i + 1}-${Date.now()}`,
          name: String(v.name || '').trim(),
          price: Number(v.price) || 0,
          mrp:
            v.mrp !== undefined && v.mrp !== null && v.mrp !== ''
              ? Number(v.mrp)
              : Number(v.price) || 0,
        }))
        .filter((v) => v.name && v.price > 0)
    : [];

  const primaryVariant = variants[0];
  const resolvedSize = primaryVariant?.name || productData.size || '50 ml';

  const payload = {
    id,
    name: productData.name?.trim() || '',
    price,
    mrp,
    concentration: productData.concentration || 'Eau de Parfum',
    notes: productData.notes?.trim() || '',
    family: productData.family || 'Perfume',
    size: resolvedSize,
    description: productData.description?.trim() || '',
    image: imageUrl || (images[0] || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85'),
    images: images.length > 0 ? images : [imageUrl || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85'],
    video: videoUrl,
    variants,
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
 * Seed clean sample catalog into Firestore and localStorage.
 * Overwrites documents to purge obsolete fields (sellingPrice, badge, media).
 */
export async function seedProductsToFirestore() {
  saveLocalProducts(initialProducts);

  if (!isFirebaseConfigured || !db) {
    return initialProducts.map((p) => p.id);
  }

  const results = [];
  for (const item of initialProducts) {
    const cleanData = sanitizeProductForStorage(item);
    const { id, ...data } = cleanData;
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(
        docRef,
        {
          ...data,
          updatedAt: serverTimestamp(),
          schemaVersion: 2,
        },
        { merge: false } // Purges any obsolete/redundant fields in Firestore
      );
      results.push(id);
    } catch (err) {
      console.warn('Could not seed product to Firestore:', err.message);
    }
  }

  return results;
}

/**
 * Runs a full database schema migration across Firestore and localStorage.
 * - Strips deprecated fields: sellingPrice, badge, media
 * - Ensures variants, price, and mrp conform to schema v2
 * - Overwrites all documents in the collection with clean schema
 */
export async function migrateFirestoreCatalog() {
  const localProducts = getLocalProducts();
  saveLocalProducts(localProducts);

  if (!isFirebaseConfigured || !db) {
    return {
      migratedCount: localProducts.length,
      storage: 'localStorage (Firebase credentials not in .env; offline catalog migrated)',
      items: localProducts,
    };
  }

  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    if (snapshot.empty) {
      const seeded = await seedProductsToFirestore();
      return {
        migratedCount: seeded.length,
        storage: 'Firestore (seeded clean catalog)',
      };
    }

    let count = 0;
    for (const docSnapshot of snapshot.docs) {
      const raw = docSnapshot.data();
      const clean = sanitizeProductForStorage({ id: docSnapshot.id, ...raw });
      const { id, ...data } = clean;
      const docRef = doc(db, COLLECTION_NAME, docSnapshot.id);

      await setDoc(
        docRef,
        {
          ...data,
          updatedAt: serverTimestamp(),
          schemaVersion: 2,
        },
        { merge: false } // Overwrite without merge to purge deprecated fields
      );
      count++;
    }

    return {
      migratedCount: count,
      storage: 'Cloud Firestore',
    };
  } catch (err) {
    console.error('Firestore migration error:', err);
    throw err;
  }
}
