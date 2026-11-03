import { Link } from 'react-router-dom';
import { MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#D4AF37]/20 bg-[#080808] text-[#F5F5F7]">
      {/* Main Footer Links - Balanced 3 Column Luxury Grid */}
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-3 md:gap-14 lg:gap-20 md:px-8">
        {/* Brand Info & Store Address */}
        <div className="md:col-span-1">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="I.K.K Perfume Logo"
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-wider text-[#F5F5F7] group-hover:text-[#D4AF37] transition-colors">
                I.K.K PERFUME
              </h2>
              <p className="text-[9.5px] tracking-[0.28em] text-[#D4AF37] uppercase font-semibold">
                Haute Parfumerie & Islamic Books
              </p>
            </div>
          </Link>

          <p className="mt-4 max-w-sm text-xs leading-6 text-zinc-400 font-light">
            An exploration of extraordinary essences, pure aged oud, alcohol-free attars, and sacred classical literature.
          </p>

          {/* Store Address */}
          <div className="mt-6 border-t border-[#D4AF37]/15 pt-5">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.2em] text-[#D4AF37] uppercase">
              <MapPin size={13} className="text-[#D4AF37] shrink-0" />
              <span>BOUTIQUE STORE ADDRESS</span>
            </div>
            <address className="mt-2.5 not-italic text-xs leading-relaxed text-zinc-300 font-light">
              <p className="font-medium text-[#F5F5F7]">I.K.K. Perfume & Islamic Books</p>
              <p>Jafar Nagar, Nagpur,</p>
              <p>Maharashtra 440013, India</p>
            </address>
            <a
              href="https://share.google/hJQ49t3GO0tRoePDo"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#D4AF37] hover:text-[#E5C378] transition-colors group"
            >
              <span>Get Directions on Google Maps</span>
              <ExternalLink size={12} className="transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* Collections (Categorized Strictly Under the 5 Departments) */}
        <div>
          <h3 className="mb-4 text-xs font-semibold tracking-[0.25em] text-[#D4AF37] uppercase">
            COLLECTIONS
          </h3>
          <ul className="space-y-3 text-xs text-zinc-400">
            <li>
              <Link className="hover:text-[#D4AF37] transition-colors" to="/shop?family=Perfume">
                Perfumes
              </Link>
            </li>
            <li>
              <Link className="hover:text-[#D4AF37] transition-colors" to="/shop?family=Attar">
                Concentrated Attars
              </Link>
            </li>
            <li>
              <Link className="hover:text-[#D4AF37] transition-colors" to="/shop?family=Bakhoor">
                Ceremonial Bakhoor
              </Link>
            </li>
            <li>
              <Link className="hover:text-[#D4AF37] transition-colors" to="/shop?family=Topi">
                Handcrafted Topis
              </Link>
            </li>
            <li>
              <Link className="hover:text-[#D4AF37] transition-colors" to="/shop?family=Books">
                Islamic Books
              </Link>
            </li>
            <li className="pt-2 border-t border-white/5">
              <Link className="hover:text-[#D4AF37] text-zinc-300 transition-colors font-medium" to="/shop">
                View All Creations ↗
              </Link>
            </li>
          </ul>
        </div>

        {/* The House (Only Home Page Components) */}
        <div>
          <h3 className="mb-4 text-xs font-semibold tracking-[0.25em] text-[#D4AF37] uppercase">
            THE HOUSE
          </h3>
          <ul className="space-y-3 text-xs text-zinc-400">
            <li>
              <a href="/#hero" className="hover:text-[#D4AF37] transition-colors">
                Featured Showcase
              </a>
            </li>
            <li>
              <a href="/#collections" className="hover:text-[#D4AF37] transition-colors">
                Curated Collections
              </a>
            </li>
            <li>
              <a href="/#bestsellers" className="hover:text-[#D4AF37] transition-colors">
                Bestselling Fragrances
              </a>
            </li>
            <li>
              <a href="/#story" className="hover:text-[#D4AF37] transition-colors">
                Our Heritage & Story
              </a>
            </li>
            <li>
              <a href="/#advisory" className="hover:text-[#D4AF37] transition-colors">
                Bespoke Scent Advisory
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Notice */}
      <div className="border-t border-[#D4AF37]/10 bg-[#050505] py-6 px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} I.K.K Perfume · All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <p className="text-[10px] text-[#A38438]">
              Inspired by haute oriental perfumery traditions.
            </p>
            <Link to="/admin" className="text-zinc-500 hover:text-[#D4AF37] transition-colors">
              Admin Portal ↗
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
