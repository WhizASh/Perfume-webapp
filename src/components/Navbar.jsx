import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

export default function Navbar({ count, onCartOpen }) {
  const [menu, setMenu] = useState(false);
  const { families } = useProducts();

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (menu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menu]);

  // Select top featured categories for quick nav (e.g. Woody, Floral, Oud, Attar)
  const navFamilies = families.filter((f) => f !== 'All').slice(0, 3);

  return (
    <>
      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 border-b-2 border-[#D4AF37]/40 bg-[#0D0C0A]/95 backdrop-blur-md text-[#F4EBD9]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 sm:px-6 md:px-8 py-2.5 sm:py-3.5">
          {/* Mobile Menu Button with ample touch target */}
          <button
            className="p-2 -ml-1.5 text-[#D4AF37] hover:text-white transition-colors md:hidden focus:outline-none"
            aria-label="Open menu"
            onClick={() => setMenu(true)}
          >
            <Menu size={22} />
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <img
              src="/logo.png"
              alt="I.K.K Perfume Logo"
              className="h-8.5 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105 shrink-0"
            />
            <div className="flex flex-col text-left">
              <span className="font-rakkas text-xl xs:text-2xl sm:text-3xl font-normal tracking-[0.04em] sm:tracking-[0.05em] text-[#F4EBD9] group-hover:text-[#D4AF37] transition-colors leading-tight">
                I.K.K PERFUME
              </span>
              <span className="font-kufi text-[7px] xs:text-[8px] sm:text-[9px] tracking-[0.22em] sm:tracking-[0.32em] text-[#D4AF37] uppercase font-bold">
                HAUTE PARFUMERIE & BOOKS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-7 lg:gap-8 text-[11px] font-semibold font-kufi tracking-[0.2em] text-[#E8DCC2] md:flex">
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `transition-colors hover:text-[#D4AF37] ${
                  isActive ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-0.5' : ''
                }`
              }
            >
              SHOP ALL
            </NavLink>

            {navFamilies.map((fam) => (
              <NavLink
                key={fam}
                to={`/shop?family=${encodeURIComponent(fam)}`}
                className="transition-colors hover:text-[#D4AF37] uppercase"
              >
                {fam}
              </NavLink>
            ))}

            <a href="/#story" className="transition-colors hover:text-[#D4AF37]">
              OUR STORY
            </a>
          </nav>

          {/* Action Icons (Search removed as requested, Shopping Bag preserved) */}
          <div className="flex items-center text-[#E8DCC2]">
            <button
              aria-label="Open shopping bag"
              onClick={onCartOpen}
              className="relative p-2 text-[#E8DCC2] hover:text-[#D4AF37] transition-colors focus:outline-none"
            >
              <ShoppingBag size={22} />
              {count > 0 && (
                <span className="absolute top-0.5 right-0.5 flex size-4.5 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-black text-black shadow-[0_0_10px_rgba(212,175,55,0.9)]">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer with Overlay - OUTSIDE header so backdrop-filter doesn't trap fixed position */}
      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMenu(false)}
          />

          {/* Slide-out Drawer */}
          <aside className="fixed inset-y-0 left-0 w-[300px] max-w-[85vw] border-r-2 border-[#D4AF37]/50 bg-[#0D0C0A] p-6 shadow-2xl flex flex-col justify-between text-[#F4EBD9] z-50 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b-2 border-[#D4AF37]/30 pb-4">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="I.K.K Logo" className="h-8 w-auto object-contain" />
                  <span className="font-rakkas text-xl text-[#F4EBD9]">I.K.K PERFUME</span>
                </div>
                <button
                  onClick={() => setMenu(false)}
                  className="p-1.5 text-[#D4AF37] hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-2 font-kufi text-xs uppercase tracking-[0.2em] text-[#E8DCC2]">
                <Link
                  onClick={() => setMenu(false)}
                  to="/shop"
                  className="flex items-center justify-between py-3 px-3 rounded hover:bg-[#D4AF37]/15 hover:text-[#D4AF37] transition-colors"
                >
                  <span>Shop All</span>
                  <span>→</span>
                </Link>

                {families.filter((f) => f !== 'All').map((fam) => (
                  <Link
                    key={fam}
                    onClick={() => setMenu(false)}
                    to={`/shop?family=${encodeURIComponent(fam)}`}
                    className="flex items-center justify-between py-3 px-3 rounded hover:bg-[#D4AF37]/15 hover:text-[#D4AF37] transition-colors"
                  >
                    <span>{fam} Collection</span>
                    <span>→</span>
                  </Link>
                ))}

                <a
                  onClick={() => setMenu(false)}
                  href="/#story"
                  className="flex items-center justify-between py-3 px-3 rounded hover:bg-[#D4AF37]/15 hover:text-[#D4AF37] transition-colors"
                >
                  <span>Our Story</span>
                  <span>→</span>
                </a>
              </nav>
            </div>

            <div className="border-t border-[#D4AF37]/25 pt-4 text-[10px] text-[#A39B8E] font-kufi">
              <p className="text-[#D4AF37] font-bold">HAUTE PARFUMERIE & BOOKS</p>
              <p className="mt-1">Handcrafted pure essences and sacred literature.</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
