import { Link } from 'react-router-dom';
import { ShoppingBag, Tag } from 'lucide-react';
import { getProductDiscount } from '../services/productsService';

export default function ProductCard({ product, onAddToCart }) {
  const { hasDiscount, percent, mrp, selling } = getProductDiscount(product);

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden border-2 border-[#C59B27]/40 bg-[#FAF6ED] p-3.5 transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_8px_30px_rgba(212,175,55,0.22)]">
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-[#EFE3C8]">
        <Link to={'/product/' + product.id}>
          <img
            loading="lazy"
            src={product.image}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Discount Tag (Preserved Sale Tag) */}
        {hasDiscount && (
          <div className="absolute left-2.5 top-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 rounded bg-[#0D0C0A] border border-emerald-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 shadow-md">
              <Tag size={10} className="stroke-[2.5]" /> SALE {percent}% OFF
            </span>
          </div>
        )}

        {/* Add to Bag Quick Button (Bold Black & Gold) */}
        <button
          onClick={() => onAddToCart(product)}
          className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-center gap-2 border-2 border-[#D4AF37] bg-[#0D0C0A] py-2.5 text-[11px] font-kufi font-bold tracking-[0.16em] text-[#D4AF37] shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition-all duration-300 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black opacity-90 group-hover:opacity-100"
        >
          <ShoppingBag size={13} /> ADD TO BAG
        </button>
      </div>

      {/* Details */}
      <div className="space-y-1 pt-3.5 pb-1">
        <p className="font-kufi text-[9.5px] uppercase tracking-[0.2em] text-[#9E781E] font-bold">
          {product.concentration} · {product.size}
        </p>

        <Link to={'/product/' + product.id}>
          <h3 className="font-rakkas text-2xl font-normal text-[#0D0C0A] transition-colors group-hover:text-[#9E781E] leading-snug">
            {product.name}
          </h3>
        </Link>

        <p className="line-clamp-1 text-xs text-[#4A433A] font-light">{product.notes}</p>

        {/* Pricing: Discounted Selling Price, Slashed MRP, and Sale Tag */}
        <div className="pt-2 flex flex-wrap items-baseline gap-2">
          {/* Selling Price */}
          <span className="text-lg font-bold tracking-wide text-[#0D0C0A]">
            ₹{selling.toLocaleString('en-IN')}
          </span>

          {/* Slashed MRP */}
          {hasDiscount && (
            <span className="text-xs text-[#6B6256] line-through decoration-[#8C8376]">
              ₹{mrp.toLocaleString('en-IN')}
            </span>
          )}

          {/* Sale Tag */}
          {hasDiscount && (
            <span className="inline-flex items-center rounded bg-[#0D0C0A] border border-emerald-500/60 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-400">
              {percent}% OFF
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
