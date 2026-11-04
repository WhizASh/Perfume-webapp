import { useState } from 'react';
import { X, Minus, Plus, Trash2, MessageCircle, ArrowRight, Check, Sparkles } from 'lucide-react';
import WhatsAppOrderModal from './WhatsAppOrderModal';

export default function CartDrawer({
  open,
  onClose,
  items,
  onQuantity,
  onClearCart,
}) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  if (!open) return null;

  const subtotal = items.reduce((s, i) => s + (Number(i.price ?? i.sellingPrice) || 0) * i.quantity, 0);
  const totalMrp = items.reduce((s, i) => s + (Number(i.mrp || (i.price ?? i.sellingPrice)) || 0) * i.quantity, 0);
  const totalSavings = totalMrp - subtotal;

  const handleOrderSuccess = (order) => {
    setOrderComplete(order);
    if (onClearCart) onClearCart();
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close cart"
        className="absolute inset-0 w-full bg-black/75 backdrop-blur-xs"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full sm:max-w-md flex-col border-l-2 border-[#D4AF37]/50 bg-[#F4EBD9] p-4 sm:p-6 shadow-2xl text-[#0D0C0A]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#D4AF37]/30 pb-4 sm:pb-5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#D4AF37]" />
            <h2 className="font-rakkas text-xl sm:text-2xl font-normal tracking-wide text-[#0D0C0A]">
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
            className="p-1 text-[#6B6256] hover:text-[#0D0C0A] transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Order Completion Notice */}
        {orderComplete ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 sm:py-10 text-center">
            <img
              src="/logo.png"
              alt="I.K.K Perfume"
              className="h-14 sm:h-16 w-auto object-contain mb-3"
            />
            <div className="grid size-12 place-items-center rounded-full border-2 border-[#D4AF37] bg-[#EFE3C8] text-[#9E781E] shadow-[0_0_15px_rgba(212,175,55,0.35)]">
              <Check size={24} />
            </div>
            <h3 className="mt-3 font-rakkas text-2xl sm:text-3xl font-normal text-[#0D0C0A]">
              Order Transmitted!
            </h3>
            <p className="mt-2 text-xs text-[#4A433A]">
              Order Reference: <strong className="text-[#9E781E]">#{orderComplete.orderId}</strong>
            </p>
            <p className="mt-3 max-w-xs text-xs leading-6 text-[#4A433A]">
              Your luxury order is prepared. You have been redirected to WhatsApp to confirm delivery details with the master perfumer.
            </p>
            <button
              onClick={() => {
                setOrderComplete(null);
                onClose();
              }}
              className="mt-6 border-2 border-[#D4AF37] bg-[#0D0C0A] px-6 py-2.5 text-xs font-kufi font-bold tracking-wider text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
            >
              CONTINUE BROWSING
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
            <p className="font-rakkas text-xl sm:text-2xl text-[#4A433A]">Your bag is currently empty.</p>
            <p className="mt-2 text-xs text-[#6B6256]">
              Explore our royal ouds and artisanal attars.
            </p>
            <button
              onClick={onClose}
              className="mt-6 border-2 border-[#D4AF37] bg-[#0D0C0A] px-6 py-2.5 text-xs font-kufi font-bold tracking-widest text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
            >
              EXPLORE COLLECTION
            </button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#C59B27]/20 pr-1 my-3 sm:my-4">
              {items.map((item) => {
                const itemKey = item.cartItemId || item.id;
                return (
                  <div key={itemKey} className="flex gap-3 sm:gap-4 py-3.5 sm:py-4 items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-14 sm:size-16 shrink-0 object-cover border-2 border-[#C59B27]/30 bg-[#EFE3C8]"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-rakkas text-lg sm:text-xl font-normal text-[#0D0C0A] truncate">
                        {item.name}
                      </h3>
                      <p className="font-kufi text-[9.5px] uppercase tracking-wider text-[#9E781E] font-bold">
                        {item.selectedVariant?.name || item.size || '50 ml'}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-sm font-bold text-[#0D0C0A]">
                          ₹{(Number(item.price) || 0).toLocaleString('en-IN')}
                        </span>
                        {item.mrp && Number(item.mrp) > Number(item.price) && (
                          <span className="text-[10px] text-[#6B6256] line-through">
                            ₹{Number(item.mrp).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border-2 border-[#C59B27]/40 bg-[#FAF6ED] rounded shrink-0">
                      <button
                        onClick={() => onQuantity(itemKey, -1)}
                        className="p-1.5 sm:p-2 text-[#4A433A] hover:text-[#0D0C0A]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-xs font-bold text-[#0D0C0A]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onQuantity(itemKey, 1)}
                        className="p-1.5 sm:p-2 text-[#4A433A] hover:text-[#0D0C0A]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtotal & Direct WhatsApp Checkout */}
            <div className="border-t-2 border-[#C59B27]/30 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
              <div className="space-y-1 text-xs">
                {totalSavings > 0 && (
                  <div className="flex justify-between text-[#6B6256]">
                    <span>Total MRP:</span>
                    <span className="line-through">₹{totalMrp.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Discount Savings:</span>
                    <span>-₹{totalSavings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-[#4A433A] font-semibold">Payable Amount:</span>
                  <span className="font-bold text-xl text-[#0D0C0A]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {subtotal >= 2999 ? (
                <p className="text-[11px] text-emerald-800 flex items-center gap-1 font-bold">
                  <Sparkles size={12} /> Eligible for Complimentary Royal Shipping
                </p>
              ) : (
                <p className="text-[11px] text-[#6B6256]">
                  Add ₹{(2999 - subtotal).toLocaleString('en-IN')} more for Complimentary Royal Shipping
                </p>
              )}

              <button
                onClick={() => setShowOrderModal(true)}
                disabled={items.length === 0}
                className="flex w-full items-center justify-center gap-2.5 border-2 border-[#D4AF37] bg-[#0D0C0A] py-3 sm:py-3.5 text-xs font-kufi font-bold tracking-[0.16em] sm:tracking-[0.18em] text-[#D4AF37] shadow-[0_4px_20px_rgba(212,175,55,0.35)] transition-all hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>ORDER VIA WHATSAPP</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}
      </aside>

      {/* Customer Contact & Address Modal */}
      <WhatsAppOrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        items={items}
        subtotal={subtotal}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}
