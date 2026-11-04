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
      <section id="collections" className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-14 md:py-18">
        <div className="mb-8 md:mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[#D4AF37]" />
            <p className="font-kufi text-[11px] font-bold tracking-[0.3em] text-[#9E781E] uppercase">
              CURATED FOR CONNOISSEURS
            </p>
            <Sparkles size={14} className="text-[#D4AF37]" />
          </div>
          <h2 className="mt-1 font-rakkas text-4xl sm:text-5xl md:text-6xl text-[#0D0C0A]">
            Explore Our Collections
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-[#4A433A] font-light">
            From bespoke perfumes and pure attars to ceremonial bakhoor, handcrafted topis, and sacred books.
          </p>
        </div>

        {/* Single Row Compact Category Grid (Never spans two rows) */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {displayCategories.map((c) => {
            const catImage =
              c.image ||
              products.find((p) => p.family?.toLowerCase() === c.name?.toLowerCase())?.image ||
              'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85';

            return (
              <Link
                key={c.id || c.name}
                to={'/shop?family=' + encodeURIComponent(c.name)}
                className="group relative overflow-hidden border-2 border-[#C59B27]/40 bg-[#FAF6ED] transition-all duration-500 hover:border-[#D4AF37] hover:shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={catImage}
                    alt={c.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  <div className="absolute inset-0 border border-transparent transition-colors duration-300 group-hover:border-[#D4AF37]/60" />
                </div>

                <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 md:bottom-4 md:left-4 md:right-4 text-white">
                  <span className="hidden sm:inline-block font-kufi text-[8px] sm:text-[9px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                    COLLECTION
                  </span>
                  <h3 className="font-rakkas text-sm sm:text-lg md:text-2xl font-normal capitalize text-white group-hover:text-[#E5C378] transition-colors leading-tight truncate">
                    {c.name}
                  </h3>
                  <p className="hidden md:block mt-0.5 text-[10px] lg:text-xs tracking-wide text-zinc-300 font-light truncate">
                    {c.sub || 'Curated Signature Blends'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Bestsellers Section */}
      <section id="bestsellers" className="border-y-2 border-[#C59B27]/30 bg-[#EFE3C8] py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-5 border-b-2 border-[#C59B27]/25 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 font-kufi text-[11px] font-bold tracking-[0.28em] text-[#9E781E] uppercase">
                <Sparkles size={12} /> THE HOUSE FAVOURITES
              </div>
              <h2 className="mt-2 font-rakkas text-4xl sm:text-5xl md:text-6xl text-[#0D0C0A]">
                Bestselling Fragrances
              </h2>
            </div>

            <Link
              className="group inline-flex items-center gap-1.5 border-b-2 border-[#0D0C0A] pb-1 text-xs font-bold font-kufi tracking-[0.2em] text-[#0D0C0A] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
              to="/shop"
            >
              VIEW ALL SCENTS
              <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
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
        <div className="relative min-h-[420px] overflow-hidden">
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1400&q=85"
            alt="Fine perfumery artisanal craftsmanship"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#F4EBD9]/60 lg:to-[#F4EBD9]" />
        </div>

        <div className="flex flex-col justify-center px-8 py-20 sm:px-16 lg:px-20">
          <img
            src="/logo.png"
            alt="I.K.K Perfume Official Emblem"
            className="h-16 w-auto object-contain self-start mb-4"
          />

          <p className="font-kufi text-[11px] font-bold tracking-[0.3em] text-[#9E781E] uppercase">
            OUR PHILOSOPHY & CRAFT
          </p>

          <h2 className="mt-4 font-rakkas text-4xl sm:text-5xl md:text-6xl font-normal leading-tight text-[#0D0C0A]">
            More than a fragrance.
            <br />
            <em className="text-[#9E781E] not-italic">A Sovereign Identity.</em>
          </h2>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-[#4A433A] font-light">
            At I.K.K Perfume, fragrance is elevated into pure emotion. We merge the timeless grandeur of Arabian resin distillation with the delicate finesse of French haute perfumery.
          </p>

          <p className="mt-4 max-w-md text-xs leading-relaxed text-[#6B6256]">
            Every bottle is hand-poured in small batches, featuring rare agarwood, Turkish rose, and crystalline amber to create an enduring, memorable sillage.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-2 border-b-2 border-[#0D0C0A] pb-1 text-xs font-bold font-kufi tracking-[0.2em] text-[#0D0C0A] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
          >
            DISCOVER THE COMPLETE VAULT ↗
          </Link>
        </div>
      </section>

      {/* 5. Call to Action Section (Prominent Black & Gold Jewel Box) */}
      <section id="advisory" className="relative overflow-hidden bg-gradient-to-b from-[#14120E] via-[#0D0C0A] to-[#080706] px-6 py-24 text-center border-y-2 border-[#D4AF37]/50 text-white">
        <div className="relative z-10 mx-auto max-w-2xl">
          <p className="font-kufi text-[11px] font-bold tracking-[0.3em] text-[#D4AF37] uppercase">
            BESPOKE SCENT ADVISORY
          </p>

          <h2 className="mt-3 font-rakkas text-4xl sm:text-5xl md:text-6xl text-white">
            Find Your Signature Essence
          </h2>

          <p className="mx-auto mt-4 max-w-md text-xs sm:text-sm leading-relaxed text-zinc-300 font-light">
            From smoky resinous ouds to luminous floral bouquets, immerse yourself in our curated collection.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="border-2 border-[#D4AF37] bg-[#D4AF37] px-9 py-3.5 text-xs font-bold font-kufi tracking-[0.2em] text-[#0D0C0A] shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:bg-[#0D0C0A] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
            >
              EXPLORE ALL FRAGRANCES
            </Link>
            <Link
              to="/shop?family=Oud"
              className="border-2 border-[#D4AF37]/60 bg-black/60 px-8 py-3.5 text-xs font-bold font-kufi tracking-[0.2em] text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
            >
              THE OUD COLLECTION
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
