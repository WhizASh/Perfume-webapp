import { useState } from 'react';
import { X, Minus, Plus, Trash2, MessageCircle, ArrowRight, Check, Sparkles } from 'lucide-react';
import { proceedToWhatsAppCheckout } from '../services/whatsappService';

export default function CartDrawer({
  open,
  onClose,
  items,
  onQuantity,
  onClearCart,
}) {
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  if (!open) return null;

  const subtotal = items.reduce((s, i) => s + (Number(i.sellingPrice ?? i.price) || 0) * i.quantity, 0);
  const totalMrp = items.reduce((s, i) => s + (Number(i.mrp || i.sellingPrice || i.price) || 0) * i.quantity, 0);
  const totalSavings = totalMrp - subtotal;

  const handleWhatsAppCheckout = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const order = await proceedToWhatsAppCheckout({
        items,
        subtotal,
        customerName,
        notes,
      });

      setOrderComplete(order);
      if (onClearCart) onClearCart();

      // Reset form states
      setCustomerName('');
      setNotes('');
      setShowCheckoutForm(false);
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Unable to initiate WhatsApp checkout: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close cart"
        className="absolute inset-0 w-full bg-black/75 backdrop-blur-xs"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[#D4AF37]/25 bg-[#121212] p-6 shadow-2xl text-[#F5F5F7]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#D4AF37]" />
            <h2 className="font-editorial text-2xl font-semibold tracking-wider text-white">
              Your Fragrance Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={() => {
              setOrderComplete(null);
              setShowCheckoutForm(false);
              onClose();
            }}
            aria-label="Close cart"
            className="text-zinc-400 hover:text-[#D4AF37] transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Order Completion Notice */}
        {orderComplete ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <img
              src="/logo.png"
              alt="I.K.K Perfume"
              className="h-16 w-auto object-contain mb-3"
            />
            <div className="grid size-12 place-items-center rounded-full border border-[#D4AF37] bg-[#1A1A1A] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <Check size={24} />
            </div>
            <h3 className="mt-3 font-editorial text-3xl text-[#F5F5F7]">
              Order Transmitted!
            </h3>
            <p className="mt-2 text-xs text-zinc-400">
              Order Reference: <strong className="text-[#E5C378]">#{orderComplete.orderId}</strong>
            </p>
            <p className="mt-3 max-w-xs text-xs leading-6 text-zinc-400">
              Your luxury order is prepared. You have been redirected to WhatsApp to confirm delivery details with the master perfumer.
            </p>
            <button
              onClick={() => {
                setOrderComplete(null);
                onClose();
              }}
              className="mt-6 border border-[#D4AF37] bg-[#D4AF37] px-6 py-2.5 text-xs font-bold tracking-wider text-black hover:bg-[#E5C378]"
            >
              CONTINUE BROWSING
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="font-editorial text-2xl text-zinc-400">Your bag is currently empty.</p>
            <p className="mt-2 text-xs text-zinc-500">
              Explore our royal ouds and artisanal attars.
            </p>
            <button
              onClick={onClose}
              className="mt-6 border border-[#D4AF37] bg-[#161616] px-6 py-2.5 text-xs font-bold tracking-widest text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
            >
              EXPLORE COLLECTION
            </button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#D4AF37]/10 pr-1 my-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-16 shrink-0 object-cover border border-[#D4AF37]/20 bg-[#0A0A0A]"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-editorial text-lg text-[#F5F5F7] truncate">
                      {item.name}
                    </h3>
                    <p className="text-[10px] uppercase tracking-wider text-[#D4AF37]">
                      {item.size || '50 ml'}
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-xs font-semibold text-[#E5C378]">
                        ₹{(Number(item.sellingPrice ?? item.price) || 0).toLocaleString('en-IN')}
                      </span>
                      {item.mrp && Number(item.mrp) > Number(item.sellingPrice ?? item.price) && (
                        <span className="text-[10.5px] text-zinc-500 line-through">
                          ₹{Number(item.mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[#D4AF37]/30 bg-[#0A0A0A]">
                    <button
                      onClick={() => onQuantity(item.id, -1)}
                      className="p-1.5 text-zinc-400 hover:text-[#D4AF37]"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-2 text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onQuantity(item.id, 1)}
                      className="p-1.5 text-zinc-400 hover:text-[#D4AF37]"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal & Direct WhatsApp Checkout */}
            <div className="border-t border-[#D4AF37]/20 pt-4 space-y-4">
              <div className="space-y-1">
                {totalSavings > 0 && (
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Total MRP:</span>
                    <span className="line-through">₹{totalMrp.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {totalSavings > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                    <span>Discount Savings:</span>
                    <span>-₹{totalSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-zinc-300 font-medium">Payable Amount:</span>
                  <span className="font-semibold text-lg text-[#E5C378]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {subtotal >= 2999 ? (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <Sparkles size={12} /> Eligible for Complimentary Royal Shipping
                </p>
              ) : (
                <p className="text-[11px] text-zinc-400">
                  Add ₹{(2999 - subtotal).toLocaleString('en-IN')} more for Complimentary Royal Shipping
                </p>
              )}

              {/* Optional Name/Notes dropdown */}
              {!showCheckoutForm ? (
                <button
                  type="button"
                  onClick={() => setShowCheckoutForm(true)}
                  className="text-[11px] text-[#D4AF37] hover:underline block"
                >
                  + Add Name & Delivery Notes (Optional)
                </button>
              ) : (
                <div className="space-y-2 border border-[#D4AF37]/20 bg-[#161616] p-3 text-xs">
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full border border-zinc-700 bg-[#0A0A0A] p-2 text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                  />
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Delivery City / Special Instructions"
                    className="w-full border border-zinc-700 bg-[#0A0A0A] p-2 text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              )}

              <button
                onClick={handleWhatsAppCheckout}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2.5 border border-[#D4AF37] bg-[#D4AF37] py-3.5 text-xs font-bold tracking-[0.18em] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:bg-[#E5C378]"
              >
                <MessageCircle size={16} />
                <span>{isSubmitting ? 'CONNECTING...' : 'ORDER VIA WHATSAPP'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
