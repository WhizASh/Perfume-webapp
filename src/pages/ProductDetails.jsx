import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle, ShoppingBag, Sparkles, ShieldCheck, Truck, Tag } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { proceedToWhatsAppCheckout } from '../services/whatsappService';
import { getProductDiscount } from '../services/productsService';

export default function ProductDetails({ onAddToCart }) {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const [orderingWhatsApp, setOrderingWhatsApp] = useState(false);

  if (loading && !product) {
    return (
      <div className="px-6 py-24 text-center text-xs text-[#78716C]">
        Loading royal fragrance specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-6 py-24 text-center">
        <h1 className="font-editorial text-4xl text-[#141311]">
          Fragrance Not Found
        </h1>
        <Link to="/shop" className="mt-4 inline-block text-xs font-semibold tracking-wider text-[#996515] underline">
          Return to All Fragrances
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      onAddToCart(product);
    }
  };

  const handleDirectWhatsAppOrder = async () => {
    setOrderingWhatsApp(true);
    try {
      await proceedToWhatsAppCheckout({
        items: [{ ...product, quantity: qty }],
        subtotal: product.price * qty,
      });
    } catch (err) {
      alert('Could not open WhatsApp: ' + err.message);
    } finally {
      setOrderingWhatsApp(false);
    }
  };

  const relatedProducts = products
    .filter((p) => p.id !== id)
    .slice(0, 4);

  const { hasDiscount, percent, savings, mrp, selling } = getProductDiscount(product);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 md:px-8 md:py-12 text-[#141311]">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-8 text-xs text-[#78716C] flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Link to="/shop" className="hover:text-[#C59B27] transition-colors">
          Fragrances
        </Link>
        <span>/</span>
        <span className="text-[#9E781E] font-medium">{product.family}</span>
        <span>/</span>
        <span className="text-[#141311] font-semibold truncate max-w-[180px] sm:max-w-none">{product.name}</span>
      </div>

      {/* Product Details Section */}
      <div className="grid gap-6 sm:gap-10 md:grid-cols-2 lg:gap-16 items-start">
        {/* Product Image Frame */}
        <div className="relative overflow-hidden border-2 border-[#C59B27]/40 bg-[#FAF6ED] p-2.5 sm:p-3.5 shadow-[0_10px_35px_rgba(212,175,55,0.2)]">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover"
          />
          {hasDiscount && (
            <div className="absolute left-3 top-3 sm:left-6 sm:top-6 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded bg-[#0D0C0A] border border-emerald-500 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-400 shadow-xl">
                <Tag size={11} className="stroke-[2.5]" /> SALE {percent}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2">
            <Sparkles size={13} className="text-[#D4AF37]" />
            <p className="font-kufi text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#9E781E]">
              {product.concentration} · {product.size} · {product.family}
            </p>
          </div>

          <h1 className="mt-2 sm:mt-3 font-rakkas text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-[#0D0C0A]">
            {product.name}
          </h1>

          <p className="font-messiri mt-1.5 sm:mt-2 text-sm sm:text-base text-[#9E781E] font-semibold tracking-wide">
            {product.notes}
          </p>

          {/* Pricing: Discounted Selling Price, Slashed MRP, and Green Sale Tag */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#0D0C0A]">
              ₹{selling.toLocaleString('en-IN')}
            </span>

            {hasDiscount && (
              <span className="text-base sm:text-lg text-[#6B6256] line-through decoration-[#8C8376]">
                MRP: ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}

            {hasDiscount && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0D0C0A] border border-emerald-500 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold text-emerald-400">
                <Tag size={11} className="stroke-[2.5]" /> SALE {percent}% OFF
              </span>
            )}
          </div>

          {hasDiscount && (
            <p className="mt-2 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <span>Special Offer:</span>
              <span>You save ₹{savings.toLocaleString('en-IN')} ({percent}% discount)</span>
            </p>
          )}

          <p className="mt-4 sm:mt-6 max-w-md text-xs sm:text-sm leading-relaxed text-[#4A433A] font-light">
            {product.description}
          </p>

          {/* Guarantee Badges */}
          <div className="my-5 sm:my-6 grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 border-y-2 border-[#C59B27]/30 py-3.5 sm:py-4 text-xs text-[#4A433A]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
              <span>100% Original Pure Concentrate</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-[#D4AF37] shrink-0" />
              <span>Complimentary Shipping ₹2,999+</span>
            </div>
          </div>

          {/* Quantity Stepper */}
          <div>
            <p className="font-kufi mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E781E]">
              SELECT QUANTITY
            </p>
            <div className="flex w-fit items-center border-2 border-[#C59B27]/40 bg-white rounded">
              <button
                className="px-4 py-2 text-[#4A433A] hover:text-[#0D0C0A]"
                aria-label="Decrease quantity"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span className="min-w-10 text-center text-sm font-bold text-[#0D0C0A]">
                {qty}
              </span>
              <button
                className="px-4 py-2 text-[#4A433A] hover:text-[#0D0C0A]"
                aria-label="Increase quantity"
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Action CTAs (Bold Black & Gold) */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-3.5 w-full">
            <button
              onClick={handleAddToCart}
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 border-2 border-[#D4AF37] bg-[#0D0C0A] px-6 sm:px-8 py-3.5 text-xs font-bold font-kufi tracking-[0.16em] sm:tracking-[0.2em] text-[#D4AF37] shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black transition-all text-center"
            >
              <ShoppingBag size={15} />
              <span>ADD TO BAG — ₹{(product.price * qty).toLocaleString('en-IN')}</span>
            </button>

            <button
              onClick={handleDirectWhatsAppOrder}
              disabled={orderingWhatsApp}
              className="flex w-full sm:w-auto items-center justify-center gap-2 border-2 border-[#25D366] bg-[#25D366]/10 px-6 py-3.5 text-xs font-bold font-kufi tracking-[0.14em] sm:tracking-[0.16em] text-emerald-800 hover:bg-[#25D366] hover:text-white transition-colors disabled:opacity-50 text-center"
            >
              <MessageCircle size={16} />
              <span>ORDER VIA WHATSAPP</span>
            </button>
          </div>

          <p className="mt-3 sm:mt-4 text-[11px] text-[#6B6256]">
            Direct WhatsApp ordering allows seamless consultation and instant shipment confirmation with our boutique.
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 sm:mt-24 md:mt-28 border-t-2 border-[#C59B27]/30 pt-10 sm:pt-16">
          <div className="mb-6 sm:mb-10 text-center sm:text-left">
            <p className="font-kufi text-[10px] sm:text-[11px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#9E781E] uppercase">
              COMPLEMENTARY CREATIONS
            </p>
            <h2 className="mt-1 font-rakkas text-3xl sm:text-4xl md:text-5xl text-[#0D0C0A]">
              You May Also Appreciate
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
