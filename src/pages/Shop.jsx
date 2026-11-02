import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Sparkles } from 'lucide-react';
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
        (family === 'All' || p.family?.toLowerCase() === family.toLowerCase()) &&
        (!q ||
          [p.name, p.notes, p.family, p.description]
            .join(' ')
            .toLowerCase()
            .includes(q.toLowerCase()))
    );

    if (sort === 'price-asc') data.sort((a, b) => (Number(a.sellingPrice ?? a.price) || 0) - (Number(b.sellingPrice ?? b.price) || 0));
    if (sort === 'price-desc') data.sort((a, b) => (Number(b.sellingPrice ?? b.price) || 0) - (Number(a.sellingPrice ?? a.price) || 0));
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
    <main className="mx-auto max-w-7xl px-6 py-14 md:px-8 text-[#F5F5F7]">
      {/* Header Banner */}
      <div className="border-b border-[#D4AF37]/15 pb-8">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.3em] text-[#D4AF37] uppercase">
          <Sparkles size={13} /> THE COMPLETE ARCHIVE
        </div>
        <h1 className="mt-2 font-editorial text-5xl sm:text-6xl md:text-7xl text-[#F5F5F7]">
          All Fragrances
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-zinc-400 font-light max-w-xl">
          Discover our full spectrum of fine eaux de parfum, pure extrait concentrates, and artisanal attars.
        </p>
      </div>

      <div className="mt-10 flex gap-10">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden w-52 shrink-0 md:block">
          <p className="mb-5 text-[11px] font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
            FRAGRANCE FAMILY
          </p>
          <div className="flex flex-col items-start gap-3">
            {families.map((f) => {
              const isSelected = family.toLowerCase() === f.toLowerCase();
              return (
                <button
                  key={f}
                  onClick={() => setFamily(f)}
                  className={`text-xs uppercase tracking-wider transition-all duration-200 py-1 ${
                    isSelected
                      ? 'border-l-2 border-[#D4AF37] pl-3 font-bold text-[#E5C378]'
                      : 'text-zinc-400 hover:text-white pl-0'
                  }`}
                >
                  {f} {f === 'All' ? `(${products.length})` : ''}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="min-w-0 flex-1">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#D4AF37]/15 pb-4">
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 border border-[#D4AF37]/30 bg-[#161616] px-3.5 py-1.5 text-xs text-[#D4AF37] md:hidden"
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal size={14} /> FILTER
              </button>
              <span className="text-xs text-zinc-400">
                {filtered.length} {filtered.length === 1 ? 'fragrance' : 'fragrances'}
                {q ? ` matching “${q}”` : ''}
              </span>
            </div>

            <label className="flex items-center gap-2 text-xs text-zinc-300">
              SORT BY{' '}
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-[#D4AF37]/30 bg-[#161616] px-3 py-1.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="featured">Featured Selection</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </label>
          </div>

          {loading && products.length === 0 ? (
            <div className="py-24 text-center text-xs text-zinc-400">
              Loading the royal perfume vault...
            </div>
          ) : filtered.length ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border border-[#D4AF37]/20 bg-[#121212] p-8">
              <h2 className="font-editorial text-3xl text-zinc-300">No fragrances matched your criteria</h2>
              <p className="mt-2 text-xs text-zinc-400">
                Try selecting a different fragrance family or clearing search terms.
              </p>
              <button
                className="mt-6 border border-[#D4AF37] bg-[#D4AF37] px-6 py-2.5 text-xs font-bold tracking-widest text-black hover:bg-[#E5C378]"
                onClick={() => setParams({})}
              >
                RESET FILTERS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs md:hidden">
          <div className="absolute inset-y-0 left-0 w-72 border-r border-[#D4AF37]/25 bg-[#121212] p-6 text-white shadow-2xl">
            <div className="mb-8 flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <h2 className="font-editorial text-2xl text-[#F5F5F7]">Fragrance Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="text-zinc-400 hover:text-[#D4AF37]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-start gap-4">
              {families.map((f) => {
                const isSelected = family.toLowerCase() === f.toLowerCase();
                return (
                  <button
                    key={f}
                    onClick={() => setFamily(f)}
                    className={`text-xs uppercase tracking-wider py-1 ${
                      isSelected ? 'font-bold text-[#E5C378]' : 'text-zinc-400'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
