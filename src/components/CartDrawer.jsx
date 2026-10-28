import { useState } from 'react';
import { X, Minus, Plus, Trash2, MessageCircle, ArrowRight, Check } from 'lucide-react';
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

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

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
        className="absolute inset-0 w-full bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#F7F1E8] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D9CBBB] pb-5">
          <h2 className="font-editorial text-3xl text-[#581F2A]">
            Your Bag ({items.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button
            onClick={() => {
              setOrderComplete(null);
              setShowCheckoutForm(false);
              onClose();
            }}
            aria-label="Close cart"
            className="hover:text-[#581F2A]"
          >
            <X />
          </button>
        </div>

        {/* Order Completion Notice */}
        {orderComplete ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-800">
              <Check size={28} />
            </div>
            <h3 className="mt-4 font-editorial text-3xl text-[#581F2A]">
              Order Prepared!
            </h3>
            <p className="mt-2 text-xs text-[#75665A]">
              Order Reference: <strong className="text-[#29211F]">#{orderComplete.orderId}</strong>
            </p>
            <p className="mt-3 max-w-xs text-xs leading-6 text-[#75665A]">
              We have redirected you to WhatsApp to finalize your delivery and payment directly with the store owner.
            </p>
            <button
              onClick={() => {
                setOrderComplete(null);
                onClose();
              }}
              className="mt-6 bg-[#581F2A] px-6 py-2.5 text-xs font-semibold tracking-wider text-white"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="flex-1 space-y-5 overflow-auto py-6">
              {items.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#75665A]">
                    Your bag is empty. Discover your signature fragrance.
                  </p>
                </div>
              ) : (
                items.map((i) => (
                  <div
                    key={i.id}
                    className="flex gap-4 border-b border-[#E9DED0] pb-4"
                  >
                    <img
                      src={i.image}
                      alt={i.name}
                      className="h-28 w-24 bg-[#E9DED0] object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-editorial text-2xl text-[#581F2A]">
                        {i.name}
                      </h3>
                      <p className="text-xs text-[#75665A]">{i.size || '50 ml'}</p>
                      <p className="mt-1 text-sm font-semibold">
                        ₹{(i.price * i.quantity).toLocaleString('en-IN')}
                      </p>

                      <div className="mt-3 flex items-center gap-4">
                        <button
                          aria-label="Decrease quantity"
                          className="hover:text-[#581F2A]"
                          onClick={() => onQuantity(i.id, -1)}
                        >
                          <Minus size={15} />
                        </button>
                        <span className="min-w-4 text-center text-xs font-semibold">
                          {i.quantity}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          className="hover:text-[#581F2A]"
                          onClick={() => onQuantity(i.id, 1)}
                        >
                          <Plus size={15} />
                        </button>
                        <button
                          aria-label="Remove item"
                          className="ml-auto text-[#75665A] hover:text-red-700"
                          onClick={() => onQuantity(i.id, -i.quantity)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Checkout Area */}
            {items.length > 0 && (
              <div className="border-t border-[#D9CBBB] pt-5">
                <div className="mb-3 flex justify-between font-semibold">
                  <span className="text-xs tracking-wider uppercase text-[#75665A]">
                    Subtotal
                  </span>
                  <span className="font-editorial text-2xl text-[#581F2A]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Optional Customer Details for WhatsApp Message */}
                {showCheckoutForm ? (
                  <form onSubmit={handleWhatsAppCheckout} className="space-y-3 mb-3">
                    <div>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your Name (Optional)"
                        className="w-full border border-[#D9CBBB] bg-white px-3 py-2 text-xs outline-[#581F2A]"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Delivery City / Address / Special Notes"
                        className="w-full border border-[#D9CBBB] bg-white px-3 py-2 text-xs outline-[#581F2A]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 bg-[#25D366] py-3.5 text-xs font-semibold tracking-wider text-white shadow-sm hover:bg-[#20ba5a] disabled:opacity-50"
                    >
                      <MessageCircle size={16} />
                      {isSubmitting ? 'PREPARING ORDER...' : 'SEND ORDER ON WHATSAPP'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCheckoutForm(false)}
                      className="w-full text-center text-[11px] text-[#75665A] hover:underline"
                    >
                      Back
                    </button>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowCheckoutForm(true)}
                      className="flex w-full items-center justify-center gap-2 bg-[#581F2A] py-4 text-xs font-semibold tracking-widest text-white hover:bg-[#3f151d]"
                    >
                      <span>ORDER VIA WHATSAPP</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => handleWhatsAppCheckout()}
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 bg-[#25D366] py-3 text-xs font-semibold tracking-wider text-white hover:bg-[#20ba5a] disabled:opacity-50"
                    >
                      <MessageCircle size={15} />
                      <span>QUICK ORDER (1-CLICK)</span>
                    </button>

                    <p className="pt-1 text-center text-[11px] text-[#75665A]">
                      No account required. Redirects directly to store owner on WhatsApp.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
