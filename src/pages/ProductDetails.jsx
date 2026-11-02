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
      <div className="px-6 py-24 text-center text-xs text-zinc-400">
        Loading royal fragrance specifications...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-6 py-24 text-center">
        <h1 className="font-editorial text-4xl text-[#F5F5F7]">
          Fragrance Not Found
        </h1>
        <Link to="/shop" className="mt-4 inline-block text-xs font-semibold tracking-wider text-[#D4AF37] underline">
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
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-8 text-[#F5F5F7]">
      {/* Breadcrumb */}
      <div className="mb-8 text-xs text-zinc-400 flex items-center gap-2">
        <Link to="/shop" className="hover:text-[#D4AF37] transition-colors">
          Fragrances
        </Link>
        <span>/</span>
        <span className="text-[#D4AF37]">{product.family}</span>
        <span>/</span>
        <span className="text-white">{product.name}</span>
      </div>

      {/* Product Details Section */}
      <div className="grid gap-10 md:grid-cols-2 lg:gap-16 items-start">
        {/* Product Image Frame */}
        <div className="relative overflow-hidden border border-[#D4AF37]/25 bg-[#141414] p-3 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover"
          />
          {hasDiscount && (
            <div className="absolute left-6 top-6 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 rounded bg-emerald-500 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black shadow-xl">
                <Tag size={12} className="stroke-[2.5]" /> SALE {percent}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2">
            <Sparkles size={13} className="text-[#D4AF37]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              {product.concentration} · {product.size} · {product.family}
            </p>
          </div>

          <h1 className="mt-3 font-editorial text-5xl sm:text-6xl md:text-7xl leading-tight text-[#F5F5F7]">
            {product.name}
          </h1>

          <p className="mt-2 text-sm text-[#E5C378] font-light tracking-wide">
            {product.notes}
          </p>

          {/* Pricing: Discounted Selling Price, Slashed MRP, and Green Sale Tag */}
          <div className="mt-6 flex flex-wrap items-baseline gap-3.5">
            <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F5F5F7]">
              ₹{selling.toLocaleString('en-IN')}
            </span>

            {hasDiscount && (
              <span className="text-lg text-zinc-400 line-through decoration-zinc-400">
                MRP: ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}

            {hasDiscount && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-3 py-1 text-xs font-bold text-emerald-400">
                <Tag size={12} className="stroke-[2.5]" /> SALE {percent}% OFF
              </span>
            )}
          </div>

          {hasDiscount && (
            <p className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <span>Special Offer:</span>
              <span>You save ₹{savings.toLocaleString('en-IN')} ({percent}% discount)</span>
            </p>
          )}

          <p className="mt-6 max-w-md text-sm leading-relaxed text-zinc-300 font-light">
            {product.description}
          </p>

          {/* Guarantee Badges */}
          <div className="my-6 grid grid-cols-2 gap-3 border-y border-[#D4AF37]/20 py-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#D4AF37]" />
              <span>100% Original Pure Concentrate</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-[#D4AF37]" />
              <span>Complimentary Shipping ₹2,999+</span>
            </div>
          </div>

          {/* Quantity Stepper */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              SELECT QUANTITY
            </p>
            <div className="flex w-fit items-center border border-[#D4AF37]/40 bg-[#141414]">
              <button
                className="px-4 py-2 text-zinc-300 hover:text-[#D4AF37]"
                aria-label="Decrease quantity"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span className="min-w-10 text-center text-sm font-bold text-white">
                {qty}
              </span>
              <button
                className="px-4 py-2 text-zinc-300 hover:text-[#D4AF37]"
                aria-label="Increase quantity"
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2.5 border border-[#D4AF37] bg-[#D4AF37] px-8 py-3.5 text-xs font-bold tracking-[0.2em] text-black shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:bg-[#E5C378]"
            >
              <ShoppingBag size={15} />
              <span>ADD TO BAG — ₹{(product.price * qty).toLocaleString('en-IN')}</span>
            </button>

            <button
              onClick={handleDirectWhatsAppOrder}
              disabled={orderingWhatsApp}
              className="flex items-center justify-center gap-2 border border-[#25D366] bg-[#25D366]/10 px-6 py-3.5 text-xs font-bold tracking-[0.16em] text-[#25D366] hover:bg-[#25D366] hover:text-black transition-colors disabled:opacity-50"
            >
              <MessageCircle size={16} />
              <span>ORDER VIA WHATSAPP</span>
            </button>
          </div>

          <p className="mt-4 text-[11px] text-zinc-500">
            Direct WhatsApp ordering allows seamless consultation and instant shipment confirmation with our boutique.
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {relatedProducts.length > 0 && (
        <section className="mt-28 border-t border-[#D4AF37]/15 pt-16">
          <div className="mb-10 text-center sm:text-left">
            <p className="text-[11px] font-semibold tracking-[0.3em] text-[#D4AF37] uppercase">
              COMPLEMENTARY CREATIONS
            </p>
            <h2 className="mt-1 font-editorial text-4xl sm:text-5xl text-[#F5F5F7]">
              You May Also Appreciate
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
