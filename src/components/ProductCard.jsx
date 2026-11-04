import { Link } from 'react-router-dom';
import { ShoppingBag, Tag, Play } from 'lucide-react';
import { getProductDiscount } from '../services/productsService';

export default function ProductCard({ product, onAddToCart }) {
  const variants = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : [];
  const minPrice = variants.length > 0
    ? Math.min(...variants.map((v) => Number(v.price) || 0))
    : Number(product.price) || 0;

  const defaultVariant = variants[0] || null;
  const { hasDiscount, percent, mrp, selling } = defaultVariant
    ? {
        hasDiscount: Boolean(defaultVariant.mrp && Number(defaultVariant.mrp) > Number(defaultVariant.price)),
        percent:
          defaultVariant.mrp && Number(defaultVariant.mrp) > Number(defaultVariant.price)
            ? Math.round(((Number(defaultVariant.mrp) - Number(defaultVariant.price)) / Number(defaultVariant.mrp)) * 100)
            : 0,
        mrp: Number(defaultVariant.mrp || defaultVariant.price),
        selling: Number(defaultVariant.price),
      }
    : getProductDiscount(product);

  const handleQuickAdd = () => {
    if (defaultVariant) {
      onAddToCart({
        ...product,
        selectedVariant: defaultVariant,
        price: Number(defaultVariant.price),
        mrp: Number(defaultVariant.mrp || defaultVariant.price),
        size: defaultVariant.name,
        cartItemId: `${product.id}-${defaultVariant.name}`,
        quantity: 1,
      });
    } else {
      onAddToCart(product);
    }
  };

  return (
    <article className="group relative flex flex-row items-stretch justify-between overflow-hidden border-2 border-[#C59B27]/40 bg-[#FAF6ED] p-2.5 sm:p-4 transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_12px_36px_rgba(212,175,55,0.25)] hover:-translate-y-0.5">
      {/* Product Image Container (Horizontal landscape card thumbnail) */}
      <div className="relative w-32 xs:w-36 sm:w-44 md:w-48 lg:w-52 shrink-0 overflow-hidden bg-[#EFE3C8] aspect-[4/5] sm:aspect-square md:aspect-[4/5]">
        <Link to={'/product/' + product.id} className="block h-full">
          <img
            loading="lazy"
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        </Link>

        {/* Video badge indicator */}
        {product.video && (
          <div className="absolute right-2 top-2 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 rounded bg-[#0D0C0A]/85 backdrop-blur-xs border border-[#D4AF37]/60 px-1.5 py-0.5 text-[8.5px] font-kufi font-bold text-[#D4AF37] shadow-sm">
              <Play size={8} className="fill-[#D4AF37]" /> VIDEO
            </span>
          </div>
        )}

        {/* Discount Tag (Preserved Sale Tag) */}
        {hasDiscount && (
          <div className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 rounded bg-[#0D0C0A] border border-emerald-500 px-1.5 py-0.5 sm:px-2 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-emerald-400 shadow-md">
              <Tag size={9} className="stroke-[2.5]" /> SALE {percent}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="flex flex-1 flex-col justify-between pl-3 sm:pl-5 min-w-0 py-0.5 sm:py-1">
        <div className="space-y-1">
          <p className="font-kufi text-[8.5px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.22em] text-[#9E781E] font-bold">
            {product.concentration} · {variants.length > 1 ? `${variants.length} Sizes (${variants.map((v) => v.name).join(', ')})` : (defaultVariant ? defaultVariant.name : product.size)}
          </p>

          <Link to={'/product/' + product.id}>
            <h3 className="font-rakkas text-xl sm:text-2xl lg:text-3xl font-normal text-[#0D0C0A] transition-colors group-hover:text-[#9E781E] leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="font-messiri line-clamp-1 sm:line-clamp-2 text-xs sm:text-sm text-[#4A433A] font-light mt-0.5">
            {product.notes}
          </p>
        </div>

        {/* Bottom Section: Pricing & Add to Bag CTA */}
        <div className="pt-2 sm:pt-3">
          {/* Pricing: Discounted Selling Price, Slashed MRP, and Sale Tag */}
          <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2.5">
            {/* Selling Price */}
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-[#0D0C0A]">
              {variants.length > 1 ? `From ₹${minPrice.toLocaleString('en-IN')}` : `₹${selling.toLocaleString('en-IN')}`}
            </span>

            {/* Slashed MRP */}
            {hasDiscount && (
              <span className="text-[11px] sm:text-sm text-[#6B6256] line-through decoration-[#8C8376]">
                MRP: ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}

            {/* Sale Tag */}
            {hasDiscount && (
              <span className="inline-flex items-center rounded bg-[#0D0C0A] border border-emerald-500/60 px-1 sm:px-1.5 py-0.2 sm:py-0.5 text-[8.5px] sm:text-[9.5px] font-bold text-emerald-400">
                {percent}% OFF
              </span>
            )}
          </div>

          {/* Add to Bag Quick Button */}
          <button
            onClick={handleQuickAdd}
            className="mt-2.5 sm:mt-3 flex w-full sm:w-fit items-center justify-center gap-2 border-2 border-[#D4AF37] bg-[#0D0C0A] px-4 sm:px-6 py-2 sm:py-2.5 text-[10.5px] sm:text-xs font-kufi font-bold tracking-[0.14em] sm:tracking-[0.18em] text-[#D4AF37] shadow-sm transition-all duration-300 hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black active:scale-98"
          >
            <ShoppingBag size={13} className="shrink-0" />
            <span>ADD TO BAG</span>
          </button>
        </div>
      </div>
    </article>
  );
}
