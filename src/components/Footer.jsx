import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function Footer() {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to I.K.K Perfume VIP Gazette.');
  };

  return (
    <footer className="border-t border-[#D4AF37]/20 bg-[#080808] text-[#F5F5F7]">
      {/* Value Proposition Highlights Banner */}
      

      {/* Main Footer Links */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4 md:px-8">
        {/* Brand Info */}
        <div className="md:col-span-1">
          <h2 className="font-editorial text-3xl font-bold tracking-wider text-[#F5F5F7]">
            I.K.K PERFUME
          </h2>
          <p className="mt-2 text-[10px] tracking-[0.25em] text-[#D4AF37] uppercase font-semibold">
            Haute Parfumerie & Attars
          </p>
          <p className="mt-4 max-w-xs text-xs leading-6 text-zinc-400 font-light">
            An exploration of extraordinary essences, pure aged oud, and alcohol-free attars designed to leave an unforgettable impression.
          </p>
        </div>

        {/* Collections */}
        <div>
          <h3 className="mb-4 text-xs font-semibold tracking-[0.25em] text-[#D4AF37] uppercase">
            COLLECTIONS
          </h3>
          <ul className="space-y-2.5 text-xs text-zinc-400">
            <li>
              <Link className="hover:text-[#D4AF37] transition-colors" to="/shop">
                All Fragrances
              </Link>
            </li>
            <li>
              <Link className="hover:text-[#D4AF37] transition-colors" to="/shop?family=Oud">
                The Royal Oud Line
              </Link>
            </li>
            <li>
              <Link className="hover:text-[#D4AF37] transition-colors" to="/shop?family=Attar">
                Alcohol-Free Attars
              </Link>
            </li>
            <li>
              <Link className="hover:text-[#D4AF37] transition-colors" to="/shop?family=Floral">
                Velvet Florals
              </Link>
            </li>
          </ul>
        </div>

        {/* Experience */}
        <div>
          <h3 className="mb-4 text-xs font-semibold tracking-[0.25em] text-[#D4AF37] uppercase">
            THE HOUSE
          </h3>
          <ul className="space-y-2.5 text-xs text-zinc-400">
            <li>
              <a href="/#story" className="hover:text-[#D4AF37] transition-colors">
                Our Heritage & Story
              </a>
            </li>
            <li>
              <a href="/#philosophy" className="hover:text-[#D4AF37] transition-colors">
                The Olfactory Philosophy
              </a>
            </li>
            <li>
              <Link to="/admin" className="text-[#D4AF37] hover:underline flex items-center gap-1">
                Admin Portal ↗
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3 className="mb-4 text-xs font-semibold tracking-[0.25em] text-[#D4AF37] uppercase">
            VIP PRIVILEGES
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-zinc-400 font-light">
            Subscribe for private releases, seasonal markdowns, and bespoke scent recommendations.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
            <input
              required
              type="email"
              aria-label="Email for newsletter"
              placeholder="Enter your email"
              className="min-w-0 flex-1 border border-[#D4AF37]/30 bg-[#141414] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#D4AF37] focus:outline-none"
            />
            <button
              type="submit"
              className="border border-[#D4AF37] bg-[#D4AF37] px-4 py-2.5 text-xs font-bold text-black hover:bg-[#E5C378]"
            >
              JOIN
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Notice */}
      <div className="border-t border-[#D4AF37]/10 bg-[#050505] py-6 px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} I.K.K Perfume · All Rights Reserved.</p>
          <p className="text-[10px] text-[#A38438]">
            Inspired by haute oriental perfumery traditions.
          </p>
        </div>
      </div>
    </footer>
  );
}
