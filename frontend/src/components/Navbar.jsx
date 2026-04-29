import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { itemCount, openCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const isMenuPage = location.pathname === '/menu';

  // Do not show navbar on admin pages as they have their own sidebar
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'vendor') return '/vendor/dashboard';
    return '/menu';
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mt-4 flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-xl shadow-black/5 dark:shadow-black/40 transition-colors duration-300">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 select-none">
            <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
              Queue
            </span>
            <span className="text-xl font-black tracking-tight text-[#d4ff00] drop-shadow-[0_0_2px_rgba(212,255,0,0.5)] dark:drop-shadow-none">
              Less
            </span>
          </Link>

          {/* Nav Links — desktop */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              {/* Customer Specific */}
              {user.role === 'customer' && (
                <>
                  <Link
                    to="/"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/'
                        ? 'text-[#8cb800] dark:text-[#d4ff00]'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/menu"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/menu'
                        ? 'text-[#8cb800] dark:text-[#d4ff00]'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Menu
                  </Link>
                  <Link
                    to="/order-status"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/order-status')
                        ? 'text-[#8cb800] dark:text-[#d4ff00]'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Your Order
                  </Link>
                </>
              )}

              {/* Vendor Specific */}
              {user.role === 'vendor' && (
                <>
                  <Link
                    to="/vendor/dashboard"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname.includes('dashboard')
                        ? 'text-[#8cb800] dark:text-[#d4ff00]'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/vendor/menu"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/vendor/menu'
                        ? 'text-[#8cb800] dark:text-[#d4ff00]'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Manage Menu
                  </Link>
                </>
              )}

              {/* Admin Specific */}
              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname.includes('dashboard')
                      ? 'text-[#8cb800] dark:text-[#d4ff00]'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user && itemCount > 0 && (
              <button
                onClick={() => navigate('/cart')}
                className="relative flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 text-zinc-900 dark:text-white px-3 py-2 rounded-xl text-sm font-medium transition-all"
                aria-label="Open cart"
              >
                <span>🛒</span>
                <span className="flex items-center gap-1">
                  <span className="text-zinc-400">·</span>
                  <span className="text-[#8cb800] dark:text-[#d4ff00] font-bold">{itemCount}</span>
                </span>
              </button>
            )}

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="hidden sm:inline-flex items-center px-4 py-2 bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/20"
              >
                Log Out
              </button>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:inline-flex items-center px-4 py-2 bg-[#d4ff00] text-black text-sm font-bold rounded-xl hover:bg-[#c0e600] transition-colors shadow-sm"
              >
                Join Now
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
