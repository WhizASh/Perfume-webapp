import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';

export default function Navbar({ count, onCartOpen }) {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q');
    navigate('/shop?q=' + encodeURIComponent(q || ''));
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#581F2A] px-3 py-2 text-center text-[10px] tracking-[.16em] text-[#F7F1E8]">
        COMPLIMENTARY SHIPPING ON ORDERS OVER ₹2,999 
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-[#e6d9c9] bg-[#F7F1E8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <button
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>

          <Link to="/" className="text-center">
            <div className="font-editorial text-2xl font-semibold tracking-[.12em] text-[#581F2A] md:text-3xl">
              I.K.K PERFUME
            </div>
            <div className="text-[9px] tracking-[.3em] text-[#8c7044]">
              THE ART OF PERFUMERY
            </div>
          </Link>

          <nav className="hidden gap-8 text-xs font-semibold tracking-[.13em] md:flex">
            <NavLink to="/shop">SHOP ALL</NavLink>
            <NavLink to="/shop?family=Woody">WOODY</NavLink>
            <NavLink to="/shop?family=Floral">FLORAL</NavLink>
            <a href="/#story">OUR STORY</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              aria-label="Search products"
              onClick={() => setSearch(!search)}
            >
              <Search size={19} />
            </button>

            <button
              aria-label="Open shopping bag"
              onClick={onCartOpen}
              className="relative"
            >
              <ShoppingBag size={19} />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-[#581F2A] px-1.5 text-[10px] text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {menu && (
          <nav className="flex flex-col gap-4 border-t px-5 py-5 text-sm md:hidden">
            <Link onClick={() => setMenu(false)} to="/shop">
              Shop all
            </Link>
            <Link onClick={() => setMenu(false)} to="/shop?family=Woody">
              Woody
            </Link>
            <Link onClick={() => setMenu(false)} to="/shop?family=Floral">
              Floral
            </Link>
            <a onClick={() => setMenu(false)} href="/#story">
              Our story
            </a>
          </nav>
        )}

        {/* Search Bar Dropdown */}
        {search && (
          <form
            className="mx-auto max-w-7xl px-5 pb-4"
            onSubmit={handleSearchSubmit}
          >
            <input
              autoFocus
              name="q"
              placeholder="Search fragrances..."
              className="w-full border border-[#cdbfae] bg-white p-3 outline-[#581F2A]"
            />
          </form>
        )}
      </header>
    </>
  );
}
