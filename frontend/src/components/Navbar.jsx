import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { itemCount, openCart } = useCart();
  const location = useLocation();
  const isMenuPage = location.pathname === '/menu';

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-xl shadow-black/40">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 select-none">
            <span className="text-xl font-black tracking-tight text-white">
              Queue
            </span>
            <span className="text-xl font-black tracking-tight text-[#d4ff00]">
              Less
            </span>
          </Link>

          {/* Nav Links — desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-[#d4ff00]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/menu'
                  ? 'text-[#d4ff00]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Menu
            </Link>
            <Link
              to="/order-status"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/order-status'
                  ? 'text-[#d4ff00]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Your Order
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isMenuPage && (
              <button
                onClick={openCart}
                className="relative flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-white px-3 py-2 rounded-xl text-sm font-medium transition-all"
                aria-label="Open cart"
              >
                <span>🛒</span>
                {itemCount > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="text-zinc-400">·</span>
                    <span className="text-[#d4ff00] font-bold">{itemCount}</span>
                  </span>
                )}
              </button>
            )}

            <Link
              to="/menu"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-[#d4ff00] text-black text-sm font-bold rounded-xl hover:bg-[#c0e600] transition-colors"
            >
              Scan & Order
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
