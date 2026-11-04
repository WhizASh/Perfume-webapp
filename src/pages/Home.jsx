import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';
import { useProducts } from '../context/ProductContext';
import { initialCategories } from '../data/categories';

export default function Home({ onAddToCart }) {
  const { products, categories } = useProducts();

  // If dynamic categories are present, use them; otherwise fallback to default list
  const displayCategories =
    categories && categories.length > 0 ? categories : initialCategories;

  return (
    <div className="bg-[#F4EBD9] text-[#0D0C0A]">
      {/* 1. Dynamic Hero Section Carousel */}
      <HeroCarousel />

      {/* 2. Fragrance Families / Curated Categories */}
      <section id="collections" className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-18">
        <div className="mb-6 sm:mb-8 md:mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-1.5 sm:mb-2">
            <Sparkles size={13} className="text-[#D4AF37]" />
            <p className="font-kufi text-[10px] sm:text-[11px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#9E781E] uppercase">
              CURATED FOR CONNOISSEURS
            </p>
            <Sparkles size={13} className="text-[#D4AF37]" />
          </div>
          <h2 className="mt-1 font-rakkas text-3xl sm:text-5xl md:text-6xl text-[#0D0C0A]">
            Explore Our Collections
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-[#4A433A] font-light px-2">
            From bespoke perfumes and pure attars to ceremonial bakhoor, handcrafted topis, and sacred books.
          </p>
        </div>

        {/* 1. Mobile View: Instagram Stories Style Circles in One Line */}
        <div className="flex md:hidden overflow-x-auto no-scrollbar gap-4 sm:gap-5 pb-2 pt-1 -mx-4 px-4 items-center">
          {displayCategories.map((c) => {
            const catImage =
              c.image ||
              products.find((p) => p.family?.toLowerCase() === c.name?.toLowerCase())?.image ||
              'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85';

            return (
              <Link
                key={c.id || c.name}
                to={'/shop?family=' + encodeURIComponent(c.name)}
                className="flex flex-col items-center shrink-0 group gap-1.5 focus:outline-none"
              >
                {/* Instagram Story Golden Ring Avatar */}
                <div className="rounded-full p-[2.5px] bg-gradient-to-tr from-[#9E781E] via-[#D4AF37] to-[#F5DE93] shadow-[0_3px_10px_rgba(212,175,55,0.35)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                  <div className="size-16 xs:size-18 rounded-full overflow-hidden border-2 border-[#FAF6ED] bg-[#FAF6ED]">
                    <img
                      src={catImage}
                      alt={c.name}
                      className="h-full w-full object-cover rounded-full transition-transform duration-500 group-hover:scale-115"
                    />
                  </div>
                </div>

                {/* Category Name Label */}
                <span className="font-kufi text-[11px] font-bold tracking-wider text-[#0D0C0A] group-hover:text-[#9E781E] transition-colors text-center max-w-[72px] truncate">
                  {c.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* 2. Desktop View: Staggered Horizontal Brick Masonry Formation */}
        <div className="hidden md:grid grid-cols-12 gap-3.5 sm:gap-4 md:gap-5">
          {displayCategories.map((c, idx) => {
            const catImage =
              c.image ||
              products.find((p) => p.family?.toLowerCase() === c.name?.toLowerCase())?.image ||
              'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85';

            // Staggered brick column spanning:
            // For 5 categories: Row 1 has 2 wide bricks (6 cols each), Row 2 has 3 bricks (4 cols each).
            // On tablet (sm): 2 columns, with 5th item spanning full width.
            const total = displayCategories.length;
            let colSpan = 'col-span-12 sm:col-span-6 lg:col-span-4';
            if (total === 5) {
              if (idx < 2) {
                colSpan = 'col-span-12 sm:col-span-6 lg:col-span-6';
              } else if (idx === 4) {
                colSpan = 'col-span-12 sm:col-span-12 lg:col-span-4';
              }
            } else {
              const cycle = idx % 5;
              if (cycle < 2) {
                colSpan = 'col-span-12 sm:col-span-6 lg:col-span-6';
              }
            }

            return (
              <Link
                key={c.id || c.name}
                to={'/shop?family=' + encodeURIComponent(c.name)}
                className={`group relative overflow-hidden border-2 border-[#C59B27]/40 bg-[#0D0C0A] ${colSpan} h-40 xs:h-44 sm:h-48 md:h-52 lg:h-56 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[#D4AF37] hover:shadow-[0_14px_36px_rgba(212,175,55,0.32)] block`}
              >
                {/* 1. Background Photography with Smooth Parallax Zoom */}
                <img
                  src={catImage}
                  alt={c.name}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-105"
                />

                {/* 2. Atmospheric Dark Luxury Vignette & Contrast Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/60 to-black/30 transition-opacity duration-500 group-hover:via-black/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                {/* 3. Golden Light Sheen Sweep Animation on Hover */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full pointer-events-none" />

                {/* 4. Delicate Inner Border Frame that Glows on Hover */}
                <div className="absolute inset-2 sm:inset-3 border border-[#D4AF37]/0 group-hover:border-[#D4AF37]/40 transition-colors duration-500 pointer-events-none" />

                {/* 5. Horizontal Brick Content Layout */}
                <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-5 md:p-6 text-white">
                  {/* Top Bar: Eyebrow + Department Pill */}
                  <div className="flex items-center justify-between">
                    <span className="font-kufi text-[8px] sm:text-[9px] font-bold tracking-[0.25em] text-[#D4AF37] uppercase flex items-center gap-1.5">
                      <Sparkles size={11} className="text-[#D4AF37] transition-transform duration-500 group-hover:rotate-45" />
                      COLLECTION
                    </span>
                    <span className="font-kufi text-[9px] tracking-widest text-[#E5C378]/80 uppercase hidden xs:inline-block">
                      HAUTE VAULT
                    </span>
                  </div>

                  {/* Bottom Area: Name, Expanding Divider, Description & Floating Arrow */}
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-rakkas text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-normal capitalize text-white group-hover:text-[#E5C378] transition-colors duration-300 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        {c.name}
                      </h3>

                      {/* Expanding Gold Accent Line Animation */}
                      <div className="my-1.5 h-0.5 w-7 bg-[#D4AF37] transition-all duration-300 group-hover:w-16" />

                      <p className="font-messiri text-xs sm:text-sm text-zinc-200 font-light line-clamp-1 max-w-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                        {c.sub || 'Curated Signature Blends'}
                      </p>
                    </div>

                    {/* Interactive Arrow Button with Hover Motion */}
                    <div className="shrink-0 flex items-center gap-1.5 font-kufi text-[10px] font-bold tracking-widest text-[#D4AF37]">
                      <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:inline-block text-[#E5C378]">
                        EXPLORE
                      </span>
                      <div className="grid size-8 sm:size-9 place-items-center rounded-full border border-[#D4AF37]/60 bg-black/70 text-[#D4AF37] shadow-lg transition-all duration-300 group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.7)]">
                        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Bestsellers Section */}
      <section id="bestsellers" className="border-y-2 border-[#C59B27]/25 bg-[#F4EBD9] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-[#C59B27]/25 pb-5 sm:pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 font-kufi text-[10px] sm:text-[11px] font-bold tracking-[0.25em] sm:tracking-[0.28em] text-[#9E781E] uppercase">
                <Sparkles size={12} /> THE HOUSE FAVOURITES
              </div>
              <h2 className="mt-1 sm:mt-2 font-rakkas text-3xl sm:text-5xl md:text-6xl text-[#0D0C0A]">
                Bestselling Fragrances
              </h2>
            </div>

            <Link
              className="group inline-flex items-center gap-1.5 border-b-2 border-[#0D0C0A] pb-1 text-xs font-bold font-kufi tracking-[0.2em] text-[#0D0C0A] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors self-start sm:self-auto"
              to="/shop"
            >
              VIEW ALL SCENTS
              <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Brand Story Section (Heritage & Fine Art) */}
      <section
        id="story"
        className="grid border-b-2 border-[#C59B27]/30 bg-[#F4EBD9] lg:grid-cols-2"
      >
        <div className="relative min-h-[250px] xs:min-h-[300px] sm:min-h-[360px] lg:min-h-[460px] overflow-hidden">
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1400&q=85"
            alt="Fine perfumery artisanal craftsmanship"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F4EBD9] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#F4EBD9]" />
        </div>

        <div className="flex flex-col justify-center px-5 py-10 xs:px-7 xs:py-14 sm:px-12 sm:py-16 lg:px-20 lg:py-24">
          <img
            src="/logo.png"
            alt="I.K.K Perfume Official Emblem"
            className="h-12 sm:h-16 w-auto object-contain self-start mb-3 sm:mb-4"
          />

          <p className="font-kufi text-[10px] sm:text-[11px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#9E781E] uppercase">
            OUR PHILOSOPHY & CRAFT
          </p>

          <h2 className="mt-2 sm:mt-4 font-rakkas text-3xl sm:text-5xl md:text-6xl font-normal leading-tight text-[#0D0C0A]">
            More than a fragrance.
            <br />
            <em className="text-[#9E781E] not-italic">A Sovereign Identity.</em>
          </h2>

          <p className="mt-4 sm:mt-6 max-w-md text-xs sm:text-sm leading-relaxed text-[#4A433A] font-light">
            At I.K.K Perfume, fragrance is elevated into pure emotion. We merge the timeless grandeur of Arabian resin distillation with the delicate finesse of French haute perfumery.
          </p>

          <p className="mt-3 sm:mt-4 max-w-md text-xs leading-relaxed text-[#6B6256]">
            Every bottle is hand-poured in small batches, featuring rare agarwood, Turkish rose, and crystalline amber to create an enduring, memorable sillage.
          </p>

          <Link
            to="/shop"
            className="mt-6 sm:mt-8 inline-flex items-center gap-2 border-b-2 border-[#0D0C0A] pb-1 text-xs font-bold font-kufi tracking-[0.2em] text-[#0D0C0A] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors self-start"
          >
            DISCOVER THE COMPLETE VAULT ↗
          </Link>
        </div>
      </section>

      {/* 5. Call to Action Section (Prominent Black & Gold Jewel Box) */}
      <section id="advisory" className="relative overflow-hidden bg-gradient-to-b from-[#14120E] via-[#0D0C0A] to-[#080706] px-4 py-14 sm:px-6 sm:py-20 md:py-24 text-center border-y-2 border-[#D4AF37]/50 text-white">
        <div className="relative z-10 mx-auto max-w-2xl">
          <p className="font-kufi text-[10px] sm:text-[11px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#D4AF37] uppercase">
            BESPOKE SCENT ADVISORY
          </p>

          <h2 className="mt-2 sm:mt-3 font-rakkas text-3xl sm:text-5xl md:text-6xl text-white">
            Find Your Signature Essence
          </h2>

          <p className="mx-auto mt-3 sm:mt-4 max-w-md text-xs sm:text-sm leading-relaxed text-zinc-300 font-light px-2">
            From smoky resinous ouds to luminous floral bouquets, immerse yourself in our curated collection.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row justify-center items-stretch xs:items-center gap-3 sm:gap-4 w-full xs:w-auto">
            <Link
              to="/shop"
              className="border-2 border-[#D4AF37] bg-[#D4AF37] px-6 sm:px-9 py-3 sm:py-3.5 text-xs font-bold font-kufi tracking-[0.18em] sm:tracking-[0.2em] text-[#0D0C0A] shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:bg-[#0D0C0A] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all text-center"
            >
              EXPLORE ALL FRAGRANCES
            </Link>
            <Link
              to="/shop?family=Oud"
              className="border-2 border-[#D4AF37]/60 bg-black/60 px-6 sm:px-8 py-3 sm:py-3.5 text-xs font-bold font-kufi tracking-[0.18em] sm:tracking-[0.2em] text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all text-center"
            >
              THE OUD COLLECTION
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
