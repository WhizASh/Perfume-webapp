import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config.js';
import { initialSlides } from '../data/carousel.js';
import { uploadCarouselImage } from './storageService.js';

const COLLECTION_NAME = 'carousel';
const LOCAL_STORAGE_KEY = 'ikk_perfume_carousel_slides';

function withTimeout(promise, ms = 3500) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore carousel request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export function getLocalSlides() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Could not read carousel slides from localStorage:', e);
  }
  return initialSlides;
}

export function saveLocalSlides(slides) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(slides));
  } catch (e) {
    console.warn('Could not write carousel slides to localStorage:', e);
  }
}

/**
 * Fetch all carousel slides from Firestore with localStorage fallback.
 */
export async function fetchCarouselSlides() {
  if (!isFirebaseConfigured || !db) {
    return getLocalSlides();
  }

  try {
    const querySnapshot = await withTimeout(getDocs(collection(db, COLLECTION_NAME)), 3500);
    if (querySnapshot.empty) {
      return getLocalSlides();
    }

    const items = [];
    querySnapshot.forEach((docSnapshot) => {
      items.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      });
    });

    saveLocalSlides(items);
    return items;
  } catch (error) {
    console.warn('Firestore carousel slides slow or unavailable. Using cached/local data:', error.message);
    return getLocalSlides();
  }
}

/**
 * Create or update a carousel slide.
 * Saves to localStorage immediately, and attempts to sync to Firestore in the background.
 * @param {Object} slideData
 * @param {File} [imageFile]
 */
export async function createCarouselSlide(slideData, imageFile) {
  let imageUrl = slideData.image || '';

  if (imageFile) {
    const slug = (slideData.title || 'slide')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    imageUrl = await uploadCarouselImage(imageFile, slug);
  }

  const id =
    slideData.id ||
    'slide-' +
      (slideData.title || 'hero')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString(36);

  const payload = {
    id,
    tag: slideData.tag?.trim() || '',
    title: slideData.title?.trim() || '',
    subtitle: slideData.subtitle?.trim() || '',
    description: slideData.description?.trim() || '',
    image:
      imageUrl ||
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1920&q=90',
    ctaText: slideData.ctaText?.trim() || 'DISCOVER MORE',
    ctaLink: slideData.ctaLink?.trim() || '/shop',
    active: slideData.active !== undefined ? Boolean(slideData.active) : true,
  };

  // 1. Immediately update localStorage
  const current = getLocalSlides();
  const existingIdx = current.findIndex((s) => s.id === id);
  let updated;
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = payload;
  } else {
    updated = [...current, payload];
  }
  saveLocalSlides(updated);

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
      console.warn('Could not sync carousel slide to Firestore (permissions or network):', err.message);
    }
  }

  return payload;
}

/**
 * Delete a carousel slide by ID.
 * Removes from localStorage and syncs deletion to Firestore.
 * @param {string} id
 */
export async function deleteCarouselSlide(id) {
  // 1. Immediately remove from localStorage
  const current = getLocalSlides();
  const filtered = current.filter((s) => s.id !== id);
  saveLocalSlides(filtered);

  // 2. Sync deletion to Firestore if available
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Could not delete carousel slide from Firestore (permissions or network):', err.message);
    }
  }

  return id;
}

/**
 * Seed initial sample carousel slides into Firestore and localStorage.
 */
export async function seedCarouselToFirestore() {
  saveLocalSlides(initialSlides);

  if (!isFirebaseConfigured || !db) {
    return initialSlides.map((s) => s.id);
  }

  const results = [];
  for (const item of initialSlides) {
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
      console.warn('Could not seed carousel slide to Firestore:', err.message);
    }
  }

  return results;
}
