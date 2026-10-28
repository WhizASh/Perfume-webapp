import { Link } from 'react-router-dom';

export default function Footer() {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert('Newsletter signup is a demo. Connect an email service to enable it.');
  };

  return (
    <footer className="bg-[#29211F] px-6 py-16 text-[#F7F1E8]">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
        {/* Brand Info */}
        <div>
          <h2 className="font-editorial text-3xl">I.K.K PERFUME</h2>
          <p className="mt-3 max-w-xs text-sm leading-7 text-[#d9cbbb]">
            An exploration of fine fragrances and the art of self-expression.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="mb-4 text-xs tracking-[.2em] text-[#B99A5F]">
            EXPLORE
          </h3>
          <Link className="mb-3 block text-sm hover:text-[#B99A5F]" to="/shop">
            All fragrances
          </Link>
          <Link
            className="mb-3 block text-sm hover:text-[#B99A5F]"
            to="/shop?family=Oud"
          >
            Oud collection
          </Link>
          <a href="/#story" className="block text-sm hover:text-[#B99A5F]">
            Our story
          </a>
          <Link to="/admin" className="mt-3 block text-xs text-[#8C7044] hover:text-[#B99A5F]">
            Admin Portal ↗
          </Link>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3 className="mb-4 text-xs tracking-[.2em] text-[#B99A5F]">
            STAY IN THE KNOW
          </h3>
          <p className="mb-3 text-sm text-[#d9cbbb]">
            Join our newsletter for new collections.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
            <input
              required
              type="email"
              aria-label="Email"
              placeholder="Email address"
              className="min-w-0 flex-1 border border-[#74635b] bg-transparent px-3 py-2 text-sm focus:border-[#B99A5F] focus:outline-none"
            />
            <button className="bg-[#B99A5F] px-4 py-2 text-xs font-semibold text-[#29211F] hover:bg-[#a88a4e]">
              JOIN
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Notice */}
      <div className="mx-auto mt-14 max-w-7xl border-t border-[#74635b] pt-5 text-xs text-[#bcaea4]">
        © {new Date().getFullYear()} I.K.K Perfume · storefront. Product
        information is illustrative.
      </div>
    </footer>
  );
}
