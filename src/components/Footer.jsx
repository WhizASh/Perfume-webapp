import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, ChevronDown } from 'lucide-react';

export default function Footer() {
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [houseOpen, setHouseOpen] = useState(false);

  return (
    <footer className="border-t-2 border-[#D4AF37]/40 bg-[#0A0908] text-[#F4EBD9]">
      {/* Main Footer Links */}
      <div className="mx-auto grid max-w-7xl gap-8 sm:gap-12 px-4 sm:px-6 md:px-8 py-10 sm:py-16 md:grid-cols-3 md:gap-12 lg:gap-16 items-start">
        {/* Brand Info & Store Address */}
        <div className="md:col-span-1">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="I.K.K Perfume Logo"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div>
              <h2 className="font-rakkas text-2xl sm:text-3xl font-normal tracking-wide text-white group-hover:text-[#D4AF37] transition-colors leading-tight">
                I.K.K PERFUME
              </h2>
              <p className="font-kufi text-[8.5px] sm:text-[9.5px] tracking-[0.24em] sm:tracking-[0.28em] text-[#D4AF37] uppercase font-bold">
                Haute Parfumerie & Islamic Books
              </p>
            </div>
          </Link>

          <p className="mt-4 max-w-sm text-xs leading-6 text-[#C4BCB0] font-light">
            An exploration of extraordinary essences, pure aged oud, alcohol-free attars, and sacred classical literature.
          </p>

          {/* Store Address */}
          <div className="mt-6 border-t border-[#D4AF37]/20 pt-5">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase font-kufi">
              <MapPin size={13} className="text-[#D4AF37] shrink-0" />
              <span>BOUTIQUE STORE ADDRESS</span>
            </div>
            <address className="mt-2.5 not-italic text-xs leading-relaxed text-[#C4BCB0] font-light">
              <p className="font-medium text-white">I.K.K. Perfume & Islamic Books</p>
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

        {/* Compressed Dropdown Menus Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:col-span-2 items-start">
          {/* 1. Collections Dropdown Menu */}
          <div>
            <button
              type="button"
              onClick={() => setCollectionsOpen(!collectionsOpen)}
              className="flex w-full items-center justify-between py-1 font-kufi text-xs font-bold tracking-[0.22em] text-[#D4AF37] uppercase transition-colors hover:text-[#FAF6ED] focus:outline-none group cursor-pointer"
              aria-expanded={collectionsOpen}
            >
              <span>COLLECTIONS</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 text-[#D4AF37] group-hover:text-white ${collectionsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {collectionsOpen && (
              <ul className="mt-3 space-y-2 text-xs text-[#C4BCB0]">
                <li>
                  <Link className="hover:text-[#D4AF37] transition-colors py-0.5 inline-block" to="/shop?family=Perfume">
                    Perfumes
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[#D4AF37] transition-colors py-0.5 inline-block" to="/shop?family=Attar">
                    Concentrated Attars
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[#D4AF37] transition-colors py-0.5 inline-block" to="/shop?family=Bakhoor">
                    Ceremonial Bakhoor
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[#D4AF37] transition-colors py-0.5 inline-block" to="/shop?family=Topi">
                    Handcrafted Topis
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[#D4AF37] transition-colors py-0.5 inline-block" to="/shop?family=Books">
                    Islamic Books
                  </Link>
                </li>
                <li className="pt-1.5">
                  <Link className="hover:text-[#D4AF37] text-white transition-colors font-medium py-0.5 inline-block" to="/shop">
                    View All Creations ↗
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* 2. The House Dropdown Menu */}
          <div>
            <button
              type="button"
              onClick={() => setHouseOpen(!houseOpen)}
              className="flex w-full items-center justify-between py-1 font-kufi text-xs font-bold tracking-[0.22em] text-[#D4AF37] uppercase transition-colors hover:text-[#FAF6ED] focus:outline-none group cursor-pointer"
              aria-expanded={houseOpen}
            >
              <span>THE HOUSE</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 text-[#D4AF37] group-hover:text-white ${houseOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {houseOpen && (
              <ul className="mt-3 space-y-2 text-xs text-[#C4BCB0]">
                <li>
                  <a href="/#hero" className="hover:text-[#D4AF37] transition-colors py-0.5 inline-block">
                    Featured Showcase
                  </a>
                </li>
                <li>
                  <a href="/#collections" className="hover:text-[#D4AF37] transition-colors py-0.5 inline-block">
                    Curated Collections
                  </a>
                </li>
                <li>
                  <a href="/#bestsellers" className="hover:text-[#D4AF37] transition-colors py-0.5 inline-block">
                    Bestselling Fragrances
                  </a>
                </li>
                <li>
                  <a href="/#story" className="hover:text-[#D4AF37] transition-colors py-0.5 inline-block">
                    Our Heritage & Story
                  </a>
                </li>
                <li>
                  <a href="/#advisory" className="hover:text-[#D4AF37] transition-colors py-0.5 inline-block">
                    Bespoke Scent Advisory
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Copyright Notice */}
      <div className="border-t border-[#D4AF37]/20 bg-[#050505] py-5 sm:py-6 px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8C8376] text-center sm:text-left">
          <p>© {new Date().getFullYear()} I.K.K Perfume · All Rights Reserved.</p>
          <p className="font-kufi text-[10px] text-[#D4AF37]">
            Inspired by haute oriental perfumery traditions.
          </p>
        </div>
      </div>
    </footer>
  );
}
