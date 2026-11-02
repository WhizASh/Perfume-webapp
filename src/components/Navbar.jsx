import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X, Sparkles } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

export default function Navbar({ count, onCartOpen }) {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const navigate = useNavigate();
  const { families } = useProducts();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q');
    navigate('/shop?q=' + encodeURIComponent(q || ''));
    setSearch(false);
  };

  // Select top featured categories for quick nav (e.g. Woody, Floral, Oud, Attar)
  const navFamilies = families.filter((f) => f !== 'All').slice(0, 3);

  return (
    <>
      {/* Announcement Bar */}
      <div className="border-b border-[#D4AF37]/15 bg-[#0F0F0F] px-4 py-2 text-center text-[10.5px] font-medium tracking-[0.22em] text-[#E5C378]">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles size={11} className="text-[#D4AF37]" />
          COMPLIMENTARY ROYAL SHIPPING ON ORDERS OVER ₹2,999 · 100% AUTHENTIC LUXURY
          <Sparkles size={11} className="text-[#D4AF37]" />
        </span>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-[#D4AF37]/20 bg-[#0A0A0A]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          {/* Mobile Menu Button */}
          <button
            className="text-zinc-300 hover:text-[#D4AF37] md:hidden"
            aria-label="Open menu"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="text-center group">
            <div className="font-editorial text-2xl font-bold tracking-[0.16em] text-[#F5F5F7] group-hover:text-[#D4AF37] md:text-3xl transition-colors">
              I.K.K PERFUME
            </div>
            <div className="text-[8.5px] tracking-[0.35em] text-[#D4AF37] uppercase font-semibold">
              HAUTE PARFUMERIE & ATTARS
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-8 text-[11px] font-semibold tracking-[0.2em] text-zinc-300 md:flex">
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `transition-colors hover:text-[#D4AF37] ${
                  isActive ? 'text-[#D4AF37] border-b border-[#D4AF37] pb-0.5' : ''
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

          {/* Action Icons */}
          <div className="flex items-center gap-5 text-zinc-300">
            <button
              aria-label="Search fragrances"
              onClick={() => setSearch(!search)}
              className="transition-colors hover:text-[#D4AF37]"
            >
              <Search size={20} />
            </button>

            <button
              aria-label="Open shopping bag"
              onClick={onCartOpen}
              className="relative transition-colors hover:text-[#D4AF37]"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex size-4.5 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-black shadow-[0_0_8px_rgba(212,175,55,0.7)]">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menu && (
          <nav className="flex flex-col gap-4 border-t border-[#D4AF37]/20 bg-[#121212] px-6 py-6 text-xs uppercase tracking-[0.18em] text-zinc-200 md:hidden">
            <Link
              onClick={() => setMenu(false)}
              to="/shop"
              className="hover:text-[#D4AF37]"
            >
              Shop All
            </Link>
            {navFamilies.map((fam) => (
              <Link
                key={fam}
                onClick={() => setMenu(false)}
                to={`/shop?family=${encodeURIComponent(fam)}`}
                className="hover:text-[#D4AF37]"
              >
                {fam} Collection
              </Link>
            ))}
            <a
              onClick={() => setMenu(false)}
              href="/#story"
              className="hover:text-[#D4AF37]"
            >
              Our Story
            </a>
            <Link
              onClick={() => setMenu(false)}
              to="/admin"
              className="text-[#D4AF37] pt-2 border-t border-[#D4AF37]/20"
            >
              Admin Dashboard ↗
            </Link>
          </nav>
        )}

        {/* Expandable Search Input Dropdown */}
        {search && (
          <form
            className="border-t border-[#D4AF37]/20 bg-[#121212] px-5 py-3 shadow-xl"
            onSubmit={handleSearchSubmit}
          >
            <div className="mx-auto flex max-w-3xl items-center gap-3">
              <Search size={17} className="text-[#D4AF37]" />
              <input
                autoFocus
                name="q"
                placeholder="Search scents, notes (e.g. Oud, Saffron, Rose)..."
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearch(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </form>
        )}
      </header>
    </>
  );
}
