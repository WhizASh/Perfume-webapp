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
export function formatOrderMessage({
  orderId,
  items,
  subtotal,
  customerName = '',
  customerPhone = '',
  customerAddress = '',
  notes = '',
}) {
  const lines = [
    '✨ *NEW ORDER — I.K.K PERFUME* ✨',
    '',
    `*Order Reference:* #${orderId}`,
    '--------------------------------',
  ];

  if (customerName && customerName.trim()) {
    lines.push(`👤 *Customer:* ${customerName.trim()}`);
  }
  if (customerPhone && customerPhone.trim()) {
    lines.push(`📞 *Phone:* ${customerPhone.trim()}`);
  }
  if (customerAddress && customerAddress.trim()) {
    lines.push(`📍 *Delivery Address:* ${customerAddress.trim()}`);
  }
  if (customerName || customerPhone || customerAddress) {
    lines.push('--------------------------------');
  }

  lines.push('*Ordered Items:*');
  items.forEach((item) => {
    const unitPrice = Number(item.price ?? item.sellingPrice) || 0;
    const itemTotal = (unitPrice * item.quantity).toLocaleString('en-IN');
    const sizeLabel = item.selectedVariant?.name || item.size || '50 ml';
    lines.push(`• *${item.name}* (${sizeLabel})`);
    lines.push(`  Qty: ${item.quantity} × ₹${unitPrice.toLocaleString('en-IN')} = ₹${itemTotal}`);
  });

  lines.push('--------------------------------');
  lines.push(`*Total Amount:* ₹${subtotal.toLocaleString('en-IN')}`);

  if (notes && notes.trim()) {
    lines.push(`*Delivery Instructions:* ${notes.trim()}`);
  }

  lines.push('');
  lines.push('Please confirm order availability and share payment/dispatch details. Thank you!');

  return lines.join('\n');
}

/**
 * Initiates the WhatsApp checkout flow:
 * 1. Creates an order record in Firestore & localStorage for the store owner.
 * 2. Formats order items and customer contact/shipping details into a pre-filled WhatsApp message.
 * 3. Redirects customer directly to the owner's WhatsApp number.
 */
export async function proceedToWhatsAppCheckout({
  items,
  subtotal,
  customerName = '',
  customerPhone = '',
  customerAddress = '',
  notes = '',
}) {
  if (!items || items.length === 0) {
    throw new Error('Your cart is empty.');
  }

  // 1. Log order to database (returns order with unique orderId)
  const order = await createOrder({
    items,
    subtotal,
    customerName,
    customerPhone,
    customerAddress,
    notes,
  });

  // 2. Prepare message
  const message = formatOrderMessage({
    orderId: order.orderId,
    items,
    subtotal,
    customerName,
    customerPhone,
    customerAddress,
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
