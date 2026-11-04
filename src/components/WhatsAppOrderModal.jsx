import { useState, useEffect } from 'react';
import { MessageCircle, X, MapPin, User, Phone, FileText, ShoppingBag, Sparkles, AlertCircle } from 'lucide-react';
import { proceedToWhatsAppCheckout } from '../services/whatsappService';

const SAVED_CUSTOMER_KEY = 'ikk_customer_checkout_info';

export default function WhatsAppOrderModal({
  isOpen,
  onClose,
  items = [],
  subtotal = 0,
  onOrderSuccess,
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Pre-populate with previously entered customer details if available
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(SAVED_CUSTOMER_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({
            name: parsed.name || prev.name,
            phone: parsed.phone || prev.phone,
            address: parsed.address || prev.address,
            notes: prev.notes || '',
          }));
        }
      } catch (err) {
        // ignore
      }
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    const nameTrimmed = formData.name.trim();
    const phoneCleaned = formData.phone.replace(/[^0-9]/g, '');
    const addressTrimmed = formData.address.trim();

    if (!nameTrimmed) {
      newErrors.name = 'Full name is required';
    } else if (nameTrimmed.length < 2) {
      newErrors.name = 'Please enter a valid full name';
    }

    if (!phoneCleaned) {
      newErrors.phone = 'Phone number is required';
    } else if (phoneCleaned.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!addressTrimmed) {
      newErrors.address = 'Delivery address is required';
    } else if (addressTrimmed.length < 8) {
      newErrors.address = 'Please include complete address (House, Street, City, Pincode)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      // Save customer info for future checkout convenience
      try {
        localStorage.setItem(
          SAVED_CUSTOMER_KEY,
          JSON.stringify({
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
          })
        );
      } catch (err) {
        // ignore storage quota error
      }

      // Proceed to WhatsApp checkout and persist order
      const order = await proceedToWhatsAppCheckout({
        items,
        subtotal,
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerAddress: formData.address.trim(),
        notes: formData.notes.trim(),
      });

      if (onOrderSuccess) {
        onOrderSuccess(order);
      }
      onClose();
    } catch (err) {
      console.error('WhatsApp order submission error:', err);
      alert('Unable to process order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-lg border-2 border-[#D4AF37]/50 bg-[#FAF6ED] p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)] text-[#141311] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute right-3.5 top-3.5 p-1.5 text-[#57524A] hover:text-[#0D0C0A] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 border-b border-[#C59B27]/25 pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
            <MessageCircle size={22} className="fill-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 font-kufi text-[10px] font-bold uppercase tracking-widest text-[#996515]">
              <Sparkles size={11} className="text-[#D4AF37]" /> DIRECT ATELIER CHECKOUT
            </div>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#0D0C0A] leading-tight">
              Order via WhatsApp
            </h3>
            <p className="mt-0.5 text-xs text-[#57524A]">
              Enter your delivery details to finalize your order directly with our fragrance concierge.
            </p>
          </div>
        </div>

        {/* Order Summary Strip */}
        <div className="mt-4 rounded border border-[#C59B27]/30 bg-[#F4EBD9]/60 p-3 text-xs">
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5 text-[#57524A]">
              <ShoppingBag size={14} className="text-[#996515]" />
              {itemCount} {itemCount === 1 ? 'Item' : 'Items'} Selected:
            </span>
            <span className="font-editorial text-base font-bold text-[#0D0C0A]">
              Total: ₹{Number(subtotal).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 max-h-24 overflow-y-auto space-y-1 divide-y divide-[#C59B27]/15 pt-1 text-[11px] text-[#57524A]">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between pt-1">
                <span className="truncate pr-2">
                  • {item.name} <span className="text-[#996515]">({item.selectedVariant?.name || item.size || '50 ml'})</span> × {item.quantity}
                </span>
                <span className="font-semibold text-[#0D0C0A] shrink-0">
                  ₹{((Number(item.price ?? item.sellingPrice) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Details Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Full Name */}
          <div>
            <label className="font-kufi mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#996515]">
              <User size={13} /> Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Tariq Mansoori"
              disabled={submitting}
              className={`w-full border bg-white p-2.5 text-sm sm:text-xs text-[#0D0C0A] placeholder-[#8A8175] transition-colors focus:outline-none ${
                errors.name
                  ? 'border-red-500 focus:border-red-600 bg-red-50/20'
                  : 'border-[#C59B27]/40 focus:border-[#D4AF37]'
              }`}
            />
            {errors.name && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600 font-medium">
                <AlertCircle size={11} /> {errors.name}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="font-kufi mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#996515]">
              <Phone size={13} /> WhatsApp / Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              inputMode="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              disabled={submitting}
              className={`w-full border bg-white p-2.5 text-sm sm:text-xs text-[#0D0C0A] placeholder-[#8A8175] transition-colors focus:outline-none ${
                errors.phone
                  ? 'border-red-500 focus:border-red-600 bg-red-50/20'
                  : 'border-[#C59B27]/40 focus:border-[#D4AF37]'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600 font-medium">
                <AlertCircle size={11} /> {errors.phone}
              </p>
            )}
          </div>

          {/* Delivery Address */}
          <div>
            <label className="font-kufi mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#996515]">
              <MapPin size={13} /> Complete Delivery Address <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Flat/House No., Building, Street, Landmark, City, State, PIN Code"
              disabled={submitting}
              className={`w-full border bg-white p-2.5 text-sm sm:text-xs text-[#0D0C0A] placeholder-[#8A8175] transition-colors focus:outline-none resize-none ${
                errors.address
                  ? 'border-red-500 focus:border-red-600 bg-red-50/20'
                  : 'border-[#C59B27]/40 focus:border-[#D4AF37]'
              }`}
            />
            {errors.address && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600 font-medium">
                <AlertCircle size={11} /> {errors.address}
              </p>
            )}
          </div>

          {/* Special Notes / Instructions (Optional) */}
          <div>
            <label className="font-kufi mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#57524A]">
              <FileText size={13} /> Delivery Instructions (Optional)
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Call before delivery, gift wrap, preferred timing..."
              disabled={submitting}
              className="w-full border border-[#C59B27]/40 bg-white p-2.5 text-sm sm:text-xs text-[#0D0C0A] placeholder-[#8A8175] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 border-2 border-emerald-600 bg-emerald-600 py-3 text-xs font-kufi font-bold uppercase tracking-wider text-white shadow-md hover:bg-emerald-700 hover:border-emerald-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <MessageCircle size={16} className="fill-white" />
              <span>{submitting ? 'RECORDING ORDER & OPENING WHATSAPP...' : 'CONFIRM & ORDER ON WHATSAPP'}</span>
            </button>
            <p className="mt-2 text-center text-[10.5px] text-[#78716C]">
              Your details will be recorded in our orders registry and formatted directly into your WhatsApp message.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
