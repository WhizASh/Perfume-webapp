import { Link } from 'react-router-dom';
import { ShoppingBag, Tag } from 'lucide-react';
import { getProductDiscount } from '../services/productsService';

export default function ProductCard({ product, onAddToCart }) {
  const { hasDiscount, percent, mrp, selling } = getProductDiscount(product);

  return (
    <article className="group relative flex flex-row sm:flex-col justify-between overflow-hidden border-2 border-[#C59B27]/40 bg-[#FAF6ED] p-2.5 sm:p-3.5 transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_8px_30px_rgba(212,175,55,0.22)]">
      {/* Product Image Container (Square thumbnail on mobile, 4:5 on desktop) */}
      <div className="relative w-32 xs:w-36 sm:w-full shrink-0 overflow-hidden bg-[#EFE3C8]">
        <Link to={'/product/' + product.id} className="block h-full">
          <img
            loading="lazy"
            src={product.image}
            alt={product.name}
            className="aspect-square sm:aspect-[4/5] w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Discount Tag (Preserved Sale Tag) */}
        {hasDiscount && (
          <div className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 rounded bg-[#0D0C0A] border border-emerald-500 px-1.5 py-0.5 sm:px-2 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-emerald-400 shadow-md">
              <Tag size={9} className="stroke-[2.5]" /> SALE {percent}% OFF
            </span>
          </div>
        )}

        {/* Desktop Add to Bag Quick Button (Overlaid on image on sm screens and larger) */}
        <button
          onClick={() => onAddToCart(product)}
          className="hidden sm:flex absolute bottom-2.5 left-2.5 right-2.5 items-center justify-center gap-2 border-2 border-[#D4AF37] bg-[#0D0C0A] py-2.5 text-[11px] font-kufi font-bold tracking-[0.16em] text-[#D4AF37] shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition-all duration-300 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black opacity-90 group-hover:opacity-100"
        >
          <ShoppingBag size={12} className="shrink-0" />
          <span className="truncate">ADD TO BAG</span>
        </button>
      </div>

      {/* Details (Right column on mobile, bottom area on desktop) */}
      <div className="flex flex-1 flex-col justify-between pl-3 sm:pl-0 sm:pt-3.5 pb-0.5 sm:pb-1 min-w-0">
        <div className="space-y-0.5 sm:space-y-1">
          <p className="font-kufi text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#9E781E] font-bold">
            {product.concentration} · {product.size}
          </p>

          <Link to={'/product/' + product.id}>
            <h3 className="font-rakkas text-xl sm:text-xl md:text-2xl font-normal text-[#0D0C0A] transition-colors group-hover:text-[#9E781E] leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="line-clamp-1 text-[11px] sm:text-xs text-[#4A433A] font-light">{product.notes}</p>
        </div>

        {/* Bottom Section: Pricing & Mobile Add to Bag Button */}
        <div className="pt-2 sm:pt-2">
          {/* Pricing: Discounted Selling Price, Slashed MRP, and Sale Tag */}
          <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
            {/* Selling Price */}
            <span className="text-base sm:text-lg font-bold tracking-wide text-[#0D0C0A]">
              ₹{selling.toLocaleString('en-IN')}
            </span>

            {/* Slashed MRP */}
            {hasDiscount && (
              <span className="text-[11px] sm:text-xs text-[#6B6256] line-through decoration-[#8C8376]">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}

            {/* Sale Tag */}
            {hasDiscount && (
              <span className="inline-flex items-center rounded bg-[#0D0C0A] border border-emerald-500/60 px-1 sm:px-1.5 py-0.2 sm:py-0.5 text-[8.5px] sm:text-[9.5px] font-bold text-emerald-400">
                {percent}% OFF
              </span>
            )}
          </div>

          {/* Mobile-only Add to Bag Button (Easy thumb tap on mobile horizontal cards) */}
          <button
            onClick={() => onAddToCart(product)}
            className="sm:hidden mt-2.5 flex w-full items-center justify-center gap-1.5 border border-[#D4AF37] bg-[#0D0C0A] py-2 text-[10px] font-kufi font-bold tracking-wider text-[#D4AF37] shadow-sm active:bg-[#D4AF37] active:text-black transition-colors"
          >
            <ShoppingBag size={11} className="shrink-0" />
            <span>ADD TO BAG</span>
          </button>
        </div>
      </div>
    </article>
  );
}
