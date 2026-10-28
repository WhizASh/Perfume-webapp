import { createOrder } from './ordersService.js';

const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta?.env?.[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  return '';
};

/**
 * Get the configured owner WhatsApp phone number.
 */
export function getWhatsAppNumber() {
  const envNumber = getEnv('VITE_WHATSAPP_NUMBER') || '919876543210';
  // Strip non-digits (+, spaces, hyphens)
  return envNumber.replace(/[^0-9]/g, '');
}

/**
 * Builds a clean, professional WhatsApp message for customer orders.
 */
export function formatOrderMessage({ orderId, items, subtotal, customerName, notes }) {
  const lines = [
    '✨ *NEW ORDER — I.K.K PERFUME* ✨',
    '',
    `*Order Reference:* #${orderId}`,
    '--------------------------------',
  ];

  items.forEach((item) => {
    const itemTotal = (item.price * item.quantity).toLocaleString('en-IN');
    lines.push(`• *${item.name}* (${item.size || '50 ml'})`);
    lines.push(`  Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')} = ₹${itemTotal}`);
  });

  lines.push('--------------------------------');
  lines.push(`*Total Amount:* ₹${subtotal.toLocaleString('en-IN')}`);

  if (customerName && customerName.trim()) {
    lines.push(`*Customer Name:* ${customerName.trim()}`);
  }

  if (notes && notes.trim()) {
    lines.push(`*Notes/Address:* ${notes.trim()}`);
  }

  lines.push('');
  lines.push('Please let me know the payment details and estimated delivery time. Thank you!');

  return lines.join('\n');
}

/**
 * Initiates the WhatsApp checkout flow:
 * 1. Creates an order record in Firestore for the store owner.
 * 2. Formats order items into a pre-filled WhatsApp message.
 * 3. Redirects customer directly to the owner's WhatsApp number.
 */
export async function proceedToWhatsAppCheckout({
  items,
  subtotal,
  customerName = '',
  customerPhone = '',
  notes = '',
}) {
  if (!items || items.length === 0) {
    throw new Error('Your cart is empty.');
  }

  // 1. Log order to Firestore (returns order with unique orderId)
  const order = await createOrder({
    items,
    subtotal,
    customerName,
    customerPhone,
    notes,
  });

  // 2. Prepare message
  const message = formatOrderMessage({
    orderId: order.orderId,
    items,
    subtotal,
    customerName,
    notes,
  });

  // 3. Construct WhatsApp URL
  const phoneNumber = getWhatsAppNumber();
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // 4. Open WhatsApp in new tab / app
  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank');
  }

  return order;
}
