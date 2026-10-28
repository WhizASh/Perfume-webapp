import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
  const [liked, setLiked] = useState(false);

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden bg-[#E9DED0]">
        <Link to={'/product/' + product.id}>
          <img
            loading="lazy"
            src={product.image}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          />
        </Link>

        {product.badge && (
          <span className="absolute left-3 top-3 bg-[#F7F1E8] px-2 py-1 text-[9px] uppercase tracking-[.14em]">
            {product.badge}
          </span>
        )}

        <button
          onClick={() => setLiked(!liked)}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-[#F7F1E8]"
        >
          <Heart size={17} fill={liked ? '#581F2A' : 'none'} />
        </button>

        <button
          onClick={() => onAddToCart(product)}
          className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 bg-[#581F2A] py-3 text-[11px] font-semibold tracking-wider text-white hover:bg-[#3f151d]"
        >
          <ShoppingBag size={14} /> ADD TO BAG
        </button>
      </div>

      <div className="space-y-1 pt-3">
        <p className="text-[10px] uppercase tracking-[.16em] text-[#8C7044]">
          {product.concentration} · {product.size}
        </p>

        <Link to={'/product/' + product.id}>
          <h3 className="font-editorial text-2xl text-[#581F2A]">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-[#75665A]">{product.notes}</p>

        <p className="pt-1 text-sm font-semibold">
          ₹{product.price.toLocaleString('en-IN')}
        </p>
      </div>
    </article>
  );
}
