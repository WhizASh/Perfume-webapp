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

/**
 * Fetch all products from Cloud Firestore.
 * Seamlessly falls back to local catalog if Firestore is empty or unconfigured.
 */
export async function fetchProducts() {
  if (!isFirebaseConfigured || !db) {
    return initialProducts;
  }

  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    if (querySnapshot.empty) {
      return initialProducts;
    }

    const items = [];
    querySnapshot.forEach((docSnapshot) => {
      items.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      });
    });

    return items;
  } catch (error) {
    console.warn('Error fetching products from Firestore. Using fallback data:', error);
    return initialProducts;
  }
}

/**
 * Create or update a product.
 * @param {Object} productData - Product fields
 * @param {File} [imageFile] - Optional image file to upload to Firebase Storage
 */
export async function createProduct(productData, imageFile) {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      'Firebase is not configured. Please supply your Firebase settings in .env.'
    );
  }

  let imageUrl = productData.image || '';

  // If a new image file was provided, upload it to Firebase Storage
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

  const payload = {
    name: productData.name || '',
    price: Number(productData.price) || 0,
    concentration: productData.concentration || 'Eau de Parfum',
    notes: productData.notes || '',
    family: productData.family || 'Woody',
    size: productData.size || '50 ml',
    badge: productData.badge || '',
    description: productData.description || '',
    image: imageUrl,
    updatedAt: serverTimestamp(),
  };

  const docRef = doc(db, COLLECTION_NAME, id);
  await setDoc(docRef, payload, { merge: true });

  return { id, ...payload };
}

/**
 * Delete a product from Firestore.
 * @param {string} id - Product ID
 */
export async function deleteProduct(id) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }

  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
  return id;
}

/**
 * Seed initial sample catalog into Firestore.
 */
export async function seedProductsToFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new Error(
      'Firebase is not configured. Add credentials to .env before seeding.'
    );
  }

  const results = [];
  for (const item of initialProducts) {
    const { id, ...data } = item;
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
  }

  return results;
}
