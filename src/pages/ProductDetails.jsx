import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { proceedToWhatsAppCheckout } from '../services/whatsappService';

export default function ProductDetails({ onAddToCart }) {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const [orderingWhatsApp, setOrderingWhatsApp] = useState(false);

  if (loading && !product) {
    return (
      <div className="px-6 py-24 text-center text-xs text-[#75665A]">
        Loading fragrance details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-6 py-24 text-center">
        <h1 className="font-editorial text-4xl text-[#581F2A]">
          Fragrance not found
        </h1>
        <Link to="/shop" className="mt-4 inline-block underline text-sm text-[#75665A]">
          Back to shop
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

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-8">
      {/* Breadcrumb */}
      <div className="mb-8 text-xs text-[#75665A]">
        <Link to="/shop" className="hover:text-[#581F2A]">
          Fragrances
        </Link>{' '}
        / {product.name}
      </div>

      {/* Product Details Section */}
      <div className="grid gap-10 md:grid-cols-2 lg:gap-20">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-[4/5] w-full bg-[#E9DED0] object-cover"
        />

        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[.2em] text-[#8C7044]">
            {product.concentration} · {product.size}
          </p>

          <h1 className="mt-3 font-editorial text-6xl text-[#581F2A] md:text-7xl">
            {product.name}
          </h1>

          <p className="mt-3 text-sm text-[#75665A]">{product.notes}</p>

          <p className="mt-8 text-2xl font-semibold">
            ₹{product.price.toLocaleString('en-IN')}
          </p>

          <p className="mt-8 max-w-md text-sm leading-8 text-[#75665A]">
            {product.description}
          </p>

          {/* Quantity Selector */}
          <div className="mt-8 border-y border-[#D9CBBB] py-5">
            <p className="mb-3 text-xs font-semibold tracking-widest">
              QUANTITY
            </p>
            <div className="flex w-fit items-center border border-[#D9CBBB]">
              <button
                className="px-4 py-2 hover:bg-[#E9DED0]"
                aria-label="Decrease quantity"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                −
              </button>
              <span className="min-w-8 text-center text-sm font-semibold">
                {qty}
              </span>
              <button
                className="px-4 py-2 hover:bg-[#E9DED0]"
                aria-label="Increase quantity"
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 bg-[#581F2A] px-8 py-4 text-xs font-semibold tracking-widest text-white hover:bg-[#3f151d]"
            >
              <ShoppingBag size={15} />
              <span>ADD TO BAG — ₹{(product.price * qty).toLocaleString('en-IN')}</span>
            </button>

            <button
              onClick={handleDirectWhatsAppOrder}
              disabled={orderingWhatsApp}
              className="flex items-center justify-center gap-2 bg-[#25D366] px-6 py-4 text-xs font-semibold tracking-wider text-white hover:bg-[#20ba5a] disabled:opacity-50"
            >
              <MessageCircle size={16} />
              <span>BUY VIA WHATSAPP</span>
            </button>
          </div>

          <p className="mt-5 text-xs text-[#75665A]">
            Customer checkout is completed directly with the owner on WhatsApp.
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {relatedProducts.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-editorial text-5xl text-[#581F2A]">
            You may also love
          </h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
