import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';

export default function Shop({ onAddToCart }) {
  const { products, families, loading } = useProducts();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const family = params.get('family') || 'All';
  const q = params.get('q') || '';

  const filtered = useMemo(() => {
    const data = products.filter(
      (p) =>
        (family === 'All' || p.family === family) &&
        (!q ||
          [p.name, p.notes, p.family]
            .join(' ')
            .toLowerCase()
            .includes(q.toLowerCase()))
    );

    if (sort === 'price-asc') data.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') data.sort((a, b) => b.price - a.price);
    if (sort === 'name') data.sort((a, b) => a.name.localeCompare(b.name));

    return data;
  }, [products, family, q, sort]);

  const setFamily = (f) => {
    const next = new URLSearchParams(params);
    if (f === 'All') {
      next.delete('family');
    } else {
      next.set('family', f);
    }
    setParams(next);
    setFiltersOpen(false);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-14 md:px-8">
      <p className="text-xs tracking-[.2em] text-[#8C7044]">THE COLLECTION</p>
      <h1 className="mt-2 font-editorial text-6xl text-[#581F2A]">
        All fragrances
      </h1>
      <p className="mt-3 text-sm text-[#75665A]">
        Discover your next signature scent.
      </p>

      <div className="mt-12 flex gap-10">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden w-48 shrink-0 md:block">
          <p className="mb-5 text-xs font-semibold tracking-widest">
            FRAGRANCE FAMILY
          </p>
          <div className="flex flex-col items-start gap-4">
            {families.map((f) => (
              <button
                key={f}
                onClick={() => setFamily(f)}
                className={
                  'text-sm ' +
                  (family === f
                    ? 'font-semibold text-[#581F2A]'
                    : 'text-[#75665A] hover:text-[#581F2A]')
                }
              >
                {f}
              </button>
            ))}
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="min-w-0 flex-1">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-[#D9CBBB] pb-5">
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 text-xs md:hidden"
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal size={17} /> FILTER
              </button>
              <span className="text-xs text-[#75665A]">
                {filtered.length} fragrances{q ? ` matching “${q}”` : ''}
              </span>
            </div>

            <label className="flex items-center gap-2 text-xs">
              SORT BY{' '}
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-[#D9CBBB] bg-transparent px-3 py-2"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>

          {loading && products.length === 0 ? (
            <div className="py-20 text-center text-xs text-[#75665A]">
              Loading our collection...
            </div>
          ) : filtered.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <h2 className="font-editorial text-3xl">No fragrances found</h2>
              <button
                className="mt-4 text-sm underline"
                onClick={() => setParams({})}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden">
          <div className="absolute inset-y-0 left-0 w-72 bg-[#F7F1E8] p-6">
            <div className="mb-8 flex justify-between">
              <h2 className="font-editorial text-3xl">Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X />
              </button>
            </div>

            <div className="flex flex-col items-start gap-5">
              {families.map((f) => (
                <button
                  key={f}
                  onClick={() => setFamily(f)}
                  className={family === f ? 'font-semibold text-[#581F2A]' : ''}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
