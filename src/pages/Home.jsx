import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';

export default function Home({ onAddToCart }) {
  const { products } = useProducts();

  const featuredCategories = [
    {
      name: 'Woody',
      image:
        products.find((p) => p.family === 'Woody')?.image ||
        'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85',
      sub: 'Warm · Deep · Sensual',
    },
    {
      name: 'Floral',
      image:
        products.find((p) => p.family === 'Floral')?.image ||
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85',
      sub: 'Soft · Refined · Romantic',
    },
    {
      name: 'Fresh',
      image:
        products.find((p) => p.family === 'Fresh')?.image ||
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85',
      sub: 'Bright · Clean · Uplifting',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="grid min-h-[610px] bg-[#E9DED0] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-16 md:px-16 lg:px-[12%]">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-xs font-semibold tracking-[.25em] text-[#8C7044]"
          >
            THE SIGNATURE COLLECTION
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="font-editorial text-6xl leading-[.95] text-[#581F2A] md:text-8xl"
          >
            A scent that
            <br />
            <em>speaks of you.</em>
          </motion.h1>

          <p className="mt-8 max-w-sm text-sm leading-8 text-[#4C3A35]">
            Discover fragrances crafted to leave an unforgettable impression. An
            invitation to find your signature.
          </p>

          <Link
            to="/shop"
            className="mt-9 w-fit bg-[#581F2A] px-9 py-4 text-xs font-semibold tracking-[.16em] text-white hover:bg-[#3f151d]"
          >
            DISCOVER SCENTS ↗
          </Link>
        </div>

        <div className="min-h-[380px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1500&q=90"
            alt="Luxury fragrance campaign"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Fragrance Families */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs tracking-[.25em] text-[#8C7044]">
            CURATED FOR YOU
          </p>
          <h2 className="mt-3 font-editorial text-5xl text-[#581F2A] md:text-6xl">
            Explore by fragrance
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredCategories.map((c) => (
            <Link
              key={c.name}
              to={'/shop?family=' + c.name}
              className="group relative overflow-hidden"
            >
              <img
                src={c.image}
                alt={c.name}
                className="aspect-[4/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="font-editorial text-4xl">{c.name}</h3>
                <p className="mt-1 text-xs tracking-wide">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="bg-[#F2EAE0] py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs tracking-[.25em] text-[#8C7044]">
                THE HOUSE FAVOURITES
              </p>
              <h2 className="mt-3 font-editorial text-5xl text-[#581F2A] md:text-6xl">
                Bestselling fragrances
              </h2>
            </div>
            <Link
              className="border-b border-[#581F2A] pb-1 text-xs font-semibold tracking-wider"
              to="/shop"
            >
              VIEW ALL FRAGRANCES ↗
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section
        id="story"
        className="grid bg-[#29211F] text-[#F7F1E8] lg:grid-cols-2"
      >
        <img
          className="h-full min-h-[360px] w-full object-cover"
          src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1400&q=85"
          alt="Fine perfumery"
        />
        <div className="flex flex-col justify-center px-8 py-20 md:px-20">
          <p className="text-xs tracking-[.25em] text-[#B99A5F]">
            OUR PHILOSOPHY
          </p>
          <h2 className="mt-5 font-editorial text-5xl leading-tight md:text-7xl">
            More than a fragrance.
            <br />
            <em>An identity.</em>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-8 text-[#D9CBBB]">
            Every note tells a story. Our collection celebrates character,
            craftsmanship, and the power of scent to evoke memories.
          </p>
          <Link
            to="/shop"
            className="mt-8 w-fit border-b border-[#B99A5F] pb-2 text-xs tracking-widest text-[#B99A5F]"
          >
            EXPLORE THE COLLECTION ↗
          </Link>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="px-6 py-20 text-center">
        <p className="text-xs tracking-[.25em] text-[#8C7044]">
          DISCOVER YOUR SIGNATURE
        </p>
        <h2 className="mt-3 font-editorial text-5xl text-[#581F2A]">
          Your next favourite awaits.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#75665A]">
          From luminous florals to rich, mysterious woods, explore a fragrance
          for every mood.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-block bg-[#581F2A] px-10 py-4 text-xs font-semibold tracking-widest text-white"
        >
          SHOP ALL FRAGRANCES
        </Link>
      </section>
    </>
  );
}
