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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-14 text-[#0D0C0A]">
      {/* Header Banner */}
      <div className="border-b-2 border-[#C59B27]/30 pb-6 sm:pb-8">
        <div className="inline-flex items-center gap-1.5 font-kufi text-[10px] sm:text-[11px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#9E781E] uppercase">
          <Sparkles size={13} className="text-[#D4AF37]" /> THE COMPLETE ARCHIVE
        </div>
        <h1 className="mt-1 sm:mt-2 font-rakkas text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#0D0C0A]">
          All Fragrances
        </h1>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#4A433A] font-light max-w-xl">
          Discover our full spectrum of fine eaux de parfum, pure extrait concentrates, and artisanal attars.
        </p>
      </div>

      <div className="mt-6 sm:mt-10 flex gap-6 lg:gap-10">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden w-52 shrink-0 md:block">
          <p className="font-kufi mb-5 text-[11px] font-bold tracking-[0.25em] text-[#9E781E] uppercase">
            FRAGRANCE FAMILY
          </p>
          <div className="flex flex-col items-start gap-3">
            {families.map((f) => {
              const isSelected = family.toLowerCase() === f.toLowerCase();
              return (
                <button
                  key={f}
                  onClick={() => setFamily(f)}
                  className={`text-xs uppercase font-kufi tracking-wider transition-all duration-200 py-1 ${
                    isSelected
                      ? 'border-l-4 border-[#D4AF37] pl-3 font-bold text-[#0D0C0A]'
                      : 'text-[#4A433A] hover:text-[#9E781E] pl-0'
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
          <div className="mb-6 sm:mb-8 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 border-b-2 border-[#C59B27]/25 pb-4">
            <div className="flex items-center justify-between xs:justify-start gap-3">
              <button
                className="flex items-center gap-2 border-2 border-[#C59B27]/40 bg-[#FAF6ED] px-3.5 py-2 text-xs font-kufi font-bold text-[#9E781E] md:hidden shadow-xs hover:border-[#D4AF37]"
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal size={14} /> FILTER {family !== 'All' ? `(${family})` : ''}
              </button>
              <span className="text-xs text-[#4A433A]">
                {filtered.length} {filtered.length === 1 ? 'fragrance' : 'fragrances'}
                {q ? ` matching “${q}”` : ''}
              </span>
            </div>

            <label className="flex items-center justify-between xs:justify-end gap-2 text-xs text-[#4A433A]">
              <span>SORT BY</span>
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border-2 border-[#C59B27]/40 bg-[#FAF6ED] px-3 py-1.5 text-xs text-[#0D0C0A] font-medium focus:border-[#D4AF37] focus:outline-none shadow-xs"
              >
                <option value="featured">Featured Selection</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </label>
          </div>

          {loading && products.length === 0 ? (
            <div className="py-24 text-center text-xs text-[#6B6256]">
              Loading the royal perfume vault...
            </div>
          ) : filtered.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 sm:py-24 text-center border-2 border-[#C59B27]/30 bg-[#FAF6ED] p-6 sm:p-8 shadow-sm">
              <h2 className="font-rakkas text-2xl sm:text-3xl text-[#0D0C0A]">No fragrances matched your criteria</h2>
              <p className="mt-2 text-xs text-[#4A433A]">
                Try selecting a different fragrance family or clearing search terms.
              </p>
              <button
                className="mt-6 border-2 border-[#D4AF37] bg-[#0D0C0A] px-6 py-2.5 text-xs font-bold font-kufi tracking-widest text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
                onClick={() => setParams({})}
              >
                RESET FILTERS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer with Full Backdrop Overlay */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setFiltersOpen(false)}
          />

          <aside className="fixed inset-y-0 left-0 w-[290px] max-w-[85vw] border-r-2 border-[#D4AF37]/50 bg-[#F4EBD9] p-6 text-[#0D0C0A] shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
            <div>
              <div className="mb-6 flex items-center justify-between border-b-2 border-[#C59B27]/30 pb-4">
                <h2 className="font-rakkas text-2xl text-[#0D0C0A]">Fragrance Filters</h2>
                <button
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                  className="p-1.5 text-[#6B6256] hover:text-[#0D0C0A]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col items-stretch gap-2">
                {families.map((f) => {
                  const isSelected = family.toLowerCase() === f.toLowerCase();
                  return (
                    <button
                      key={f}
                      onClick={() => setFamily(f)}
                      className={`text-xs uppercase font-kufi tracking-wider py-3 px-3 rounded flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'font-bold bg-[#D4AF37]/25 text-[#0D0C0A] border-l-4 border-[#D4AF37]'
                          : 'text-[#4A433A] hover:bg-[#FAF6ED]'
                      }`}
                    >
                      <span>{f}</span>
                      {isSelected && <span className="text-[#9E781E] font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t-2 border-[#C59B27]/25">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full border-2 border-[#D4AF37] bg-[#0D0C0A] py-3 text-xs font-bold font-kufi tracking-widest text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
              >
                APPLY FILTERS ({filtered.length})
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
