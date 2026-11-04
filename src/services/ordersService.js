import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config.js';

const COLLECTION_NAME = 'orders';

/**
 * Generates a clean customer-facing order reference number (e.g., #IKK-A4B7)
 */
export function generateOrderId() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `IKK-${code}`;
}

export const ORDERS_STORAGE_KEY = 'ikk_perfume_orders';

/**
 * Creates an order record in Firestore and localStorage.
 * @param {Object} orderData
 * @param {Array} orderData.items - Cart items
 * @param {number} orderData.subtotal - Total order price
 * @param {string} [orderData.customerName] - Customer name
 * @param {string} [orderData.customerPhone] - Customer phone
 * @param {string} [orderData.customerAddress] - Customer shipping / delivery address
 * @param {string} [orderData.notes] - Customer special instructions
 * @returns {Promise<Object>} Created order data including orderId
 */
export async function createOrder({
  items,
  subtotal,
  customerName = '',
  customerPhone = '',
  customerAddress = '',
  notes = '',
}) {
  const orderId = generateOrderId();
  const orderPayload = {
    orderId,
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      size: i.selectedVariant?.name || i.size || '50 ml',
      price: Number(i.price ?? i.sellingPrice) || 0,
      quantity: Number(i.quantity) || 1,
      image: i.image || '',
    })),
    subtotal: Number(subtotal) || 0,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerAddress: customerAddress.trim(),
    notes: notes.trim(),
    status: 'redirected_to_whatsapp',
    createdAtIso: new Date().toISOString(),
  };

  // 1. Instant local persistence for offline reliability & admin view
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const updated = [orderPayload, ...existing.filter((o) => o.orderId !== orderId)];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
    }
  } catch (storageErr) {
    console.warn('Failed to record order locally:', storageErr);
  }

  // 2. Persist to Cloud Firestore if connected
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, orderId);
      await setDoc(docRef, {
        ...orderPayload,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Failed to log order to Firestore (continuing to WhatsApp):', error);
    }
  }

  return orderPayload;
}

/**
 * Fetch all orders for the admin dashboard.
 * Merges Cloud Firestore records with locally cached orders so no order is lost.
 */
export async function fetchOrders() {
  let localOrders = [];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (raw) localOrders = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading local orders:', err);
  }

  if (!isFirebaseConfigured || !db) {
    return localOrders;
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const firestoreOrders = [];
    snapshot.forEach((d) => {
      firestoreOrders.push({ id: d.id, ...d.data() });
    });

    // Merge any local-only orders that haven't synced to Firestore yet
    const firestoreIds = new Set(firestoreOrders.map((o) => o.orderId || o.id));
    const merged = [...firestoreOrders];
    for (const localOrder of localOrders) {
      if (!firestoreIds.has(localOrder.orderId || localOrder.id)) {
        merged.push(localOrder);
      }
    }
    return merged;
  } catch (error) {
    console.warn('Failed to query ordered Firestore orders, trying unindexed fallback:', error);
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const firestoreOrders = [];
      snapshot.forEach((d) => {
        firestoreOrders.push({ id: d.id, ...d.data() });
      });
      firestoreOrders.reverse();

      const firestoreIds = new Set(firestoreOrders.map((o) => o.orderId || o.id));
      const merged = [...firestoreOrders];
      for (const localOrder of localOrders) {
        if (!firestoreIds.has(localOrder.orderId || localOrder.id)) {
          merged.push(localOrder);
        }
      }
      return merged;
    } catch (fallbackError) {
      console.warn('Failed to fetch orders from Firestore:', fallbackError);
      return localOrders;
    }
  }
}
