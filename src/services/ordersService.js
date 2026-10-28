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

/**
 * Creates an order record in Firestore.
 * @param {Object} orderData
 * @param {Array} orderData.items - Cart items
 * @param {number} orderData.subtotal - Total order price
 * @param {string} [orderData.customerName] - Customer name
 * @param {string} [orderData.customerPhone] - Customer phone
 * @param {string} [orderData.notes] - Customer special instructions
 * @returns {Promise<Object>} Created order data including orderId
 */
export async function createOrder({
  items,
  subtotal,
  customerName = '',
  customerPhone = '',
  notes = '',
}) {
  const orderId = generateOrderId();
  const orderPayload = {
    orderId,
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      size: i.size || '50 ml',
      price: i.price,
      quantity: i.quantity,
      image: i.image || '',
    })),
    subtotal,
    customerName,
    customerPhone,
    notes,
    status: 'redirected_to_whatsapp',
    createdAtIso: new Date().toISOString(),
  };

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
 */
export async function fetchOrders() {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const list = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (error) {
    // If composite index is missing or orderBy fails, fallback to unordered getDocs
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      return list.reverse();
    } catch (fallbackError) {
      console.warn('Failed to fetch orders from Firestore:', fallbackError);
      return [];
    }
  }
}
