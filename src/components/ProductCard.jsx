import { Link } from 'react-router-dom';
import { ShoppingBag, Tag } from 'lucide-react';
import { getProductDiscount } from '../services/productsService';

export default function ProductCard({ product, onAddToCart }) {
  const { hasDiscount, percent, mrp, selling } = getProductDiscount(product);

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden border border-[#D4AF37]/15 bg-[#141414] p-3 transition-all duration-300 hover:border-[#D4AF37]/40 hover:shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-[#0A0A0A]">
        <Link to={'/product/' + product.id}>
          <img
            loading="lazy"
            src={product.image}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Discount Tag (Preserved Green Sale Tag) */}
        {hasDiscount && (
          <div className="absolute left-2.5 top-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow-md">
              <Tag size={10} className="stroke-[2.5]" /> SALE {percent}% OFF
            </span>
          </div>
        )}

        {/* Add to Bag Quick Button */}
        <button
          onClick={() => onAddToCart(product)}
          className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-center gap-2 border border-[#D4AF37] bg-[#D4AF37] py-2.5 text-[11px] font-bold tracking-[0.16em] text-black shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-[#E5C378] hover:border-[#E5C378] opacity-90 group-hover:opacity-100"
        >
          <ShoppingBag size={13} /> ADD TO BAG
        </button>
      </div>

      {/* Details */}
      <div className="space-y-1 pt-3.5 pb-1">
        <p className="text-[9.5px] uppercase tracking-[0.2em] text-[#D4AF37] font-medium">
          {product.concentration} · {product.size}
        </p>

        <Link to={'/product/' + product.id}>
          <h3 className="font-editorial text-xl font-normal text-[#F5F5F7] transition-colors group-hover:text-[#D4AF37]">
            {product.name}
          </h3>
        </Link>

        <p className="line-clamp-1 text-xs text-zinc-400 font-light">{product.notes}</p>

        {/* Pricing: Discounted Selling Price, Slashed MRP, and Green Sale Tag */}
        <div className="pt-2 flex flex-wrap items-baseline gap-2">
          {/* Selling Price */}
          <span className="text-base font-bold tracking-wide text-[#E5C378]">
            ₹{selling.toLocaleString('en-IN')}
          </span>

          {/* Slashed MRP */}
          {hasDiscount && (
            <span className="text-xs text-zinc-500 line-through decoration-zinc-400">
              ₹{mrp.toLocaleString('en-IN')}
            </span>
          )}

          {/* Green Sale Tag */}
          {hasDiscount && (
            <span className="inline-flex items-center rounded bg-emerald-500/15 border border-emerald-500/40 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-400">
              {percent}% OFF
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
