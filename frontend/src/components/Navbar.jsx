import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CustomerLoginModal from './CustomerLoginModal';

export default function Navbar() {
  const { itemCount, openCart } = useCart();
  const { customer, user, isAuthenticated, logout, role, activeVendorId } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);


  // Admin pages have their own sidebar
  if (location.pathname.startsWith('/admin')) return null;

  const menuLink = activeVendorId ? `/menu?vendorId=${activeVendorId}` : '/menu';

  const navLinkClass = (active) =>
    `text-sm font-bold transition-colors ${
      active ? 'text-[#d4ff00]' : 'text-zinc-400 hover:text-white'
    }`;

  const mobileNavLinkClass = (active) =>
    `text-base font-bold transition-colors p-3 rounded-xl ${
      active ? 'bg-[#d4ff00]/10 text-[#d4ff00]' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-white'
    }`;


  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mt-4 flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-xl shadow-black/5 dark:shadow-black/40 transition-colors duration-300">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 select-none">
              <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Qz</span>
              <span className="text-xl font-black tracking-tight text-[#d4ff00] drop-shadow-[0_0_2px_rgba(212,255,0,0.5)] dark:drop-shadow-none">aam</span>
            </Link>

            {/* Nav Links — desktop (role priority: customer > vendor > admin > guest) */}
            <div className="hidden md:flex items-center gap-6">
              {customer ? (
                <>
                  <Link to="/" className={navLinkClass(location.pathname === '/')}>Home</Link>
                  <Link to={menuLink} className={navLinkClass(location.pathname === '/menu')}>Menu</Link>
                  <Link to="/wallet" className={navLinkClass(location.pathname === '/wallet')}>Wallet</Link>
                  <Link to="/refer" className={navLinkClass(location.pathname === '/refer')}>Referral</Link>
                  <button 
                    onClick={() => {
                      const lastOrderId = localStorage.getItem('ql_last_order_id');
                      navigate(lastOrderId ? `/order-status/${lastOrderId}` : '/order-status');
                    }} 
                    className={navLinkClass(location.pathname.startsWith('/order-status'))}
                  >
                    Your Order
                  </button>
                </>
              ) : role === 'vendor' ? (
                <>
                  <Link to="/vendor/dashboard" className={navLinkClass(location.pathname.includes('/vendor/dashboard'))}>Dashboard</Link>
                  {user?.vendorType === 'salon' ? (
                    <Link to="/vendor/services" className={navLinkClass(location.pathname === '/vendor/services')}>Manage Services</Link>
                  ) : (
                    <Link to="/vendor/menu" className={navLinkClass(location.pathname === '/vendor/menu')}>Manage Menu</Link>
                  )}
                  <Link to="/wallet" className={navLinkClass(location.pathname === '/wallet')}>Wallet</Link>
                  <Link to="/refer" className={navLinkClass(location.pathname === '/refer')}>Referral</Link>
                </>
              ) : role === 'admin' ? (
                <Link to="/admin/dashboard" className={navLinkClass(location.pathname.includes('dashboard'))}>Dashboard</Link>
              ) : (
                <Link to="/" className={navLinkClass(location.pathname === '/')}>Home</Link>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {/* Cart button — always visible when items exist */}
              {itemCount > 0 && (
                <button
                  onClick={openCart}
                  className="relative flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white px-3 py-2 rounded-xl text-sm font-medium transition-all group"
                  aria-label="Open cart"
                >
                  <span className="group-hover:scale-110 transition-transform">🛒</span>
                  <span className="flex items-center gap-1">
                    <span className="text-zinc-400">·</span>
                    <span className="text-[#8cb800] dark:text-[#d4ff00] font-bold">{itemCount}</span>
                  </span>
                </button>
              )}

              {/* Customer: profile avatar + dropdown + logout button */}
              {customer ? (
                <div className="flex items-center gap-2 ml-1">
                  {/* Avatar with dropdown */}
                  <div className="relative">
                    <div 
                      onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
                      className="w-10 h-10 rounded-full bg-[#d4ff00] text-black font-black flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(212,255,0,0.3)] hover:scale-105 transition-all select-none"
                    >
                      {customer.name?.charAt(0).toUpperCase()}
                    </div>
                    {isDropdownOpen && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs font-black text-[#8cb800] dark:text-[#d4ff00] uppercase tracking-widest mb-1">Guest Session</p>
                        <p className="font-bold text-zinc-900 dark:text-white truncate">{customer.name}</p>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{customer.phone}</p>
                      </div>
                      <Link
                        to="/your-orders"
                        className="block px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        📋 View All Orders
                      </Link>
                      <Link
                        to="/wallet"
                        className="block px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        💳 My Wallet
                      </Link>
                      <Link
                        to="/refer"
                        className="block px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        🎁 Refer & Earn
                      </Link>
                      <button
                        onClick={() => {
                          localStorage.removeItem('ql_customer');
                          localStorage.removeItem('ql_last_order_id');
                          window.location.href = '/';
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-zinc-100 dark:border-zinc-800"
                      >
                        Logout
                      </button>
                    </div>
                    )}
                  </div>

                  {/* Dedicated logout button */}
                  <button
                    onClick={() => {
                      localStorage.removeItem('ql_customer');
                      localStorage.removeItem('ql_last_order_id');
                      window.location.href = '/';
                    }}
                    className="hidden sm:flex px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-3">
                  <Link 
                    to="/vendor/profile"
                    className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 font-black flex items-center justify-center cursor-pointer hover:border-[#d4ff00] hover:text-[#d4ff00] transition-all select-none overflow-hidden"
                    title="Vendor Profile"
                  >
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'V'
                    )}
                  </Link>

                  <button
                    onClick={logout}
                    className="inline-flex items-center px-4 py-2 bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/20"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCustomerLogin(true)}
                    className="hidden sm:inline-flex items-center px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
                  >
                    Customer Login
                  </button>
                  <Link
                    to="/auth"
                    className="hidden sm:inline-flex items-center px-4 py-2 bg-[#d4ff00] text-black text-sm font-bold rounded-xl hover:bg-[#c0e600] transition-colors shadow-sm"
                  >
                    Business Login
                  </Link>
                </div>
              )}

              {/* Hamburger Toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white transition-all active:scale-95"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                )}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="md:hidden mt-2 mx-auto max-w-7xl px-2"
            >
              <div className="flex flex-col gap-1 p-3 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-black/90 backdrop-blur-2xl shadow-2xl shadow-black/20 animate-in slide-in-from-top-4 duration-300">
                {customer ? (
                  <>
                    <Link to="/" className={mobileNavLinkClass(location.pathname === '/')}>Home</Link>
                    <Link to={menuLink} className={mobileNavLinkClass(location.pathname === '/menu')}>Menu</Link>
                    <Link to="/wallet" className={mobileNavLinkClass(location.pathname === '/wallet')}>Wallet</Link>
                    <Link to="/refer" className={mobileNavLinkClass(location.pathname === '/refer')}>Referral</Link>
                    <Link to="/your-orders" className={mobileNavLinkClass(location.pathname === '/your-orders')}>Your Orders</Link>
                    <button
                      onClick={() => {
                        localStorage.removeItem('ql_customer');
                        localStorage.removeItem('ql_last_order_id');
                        window.location.href = '/';
                      }}
                      className="text-left text-base font-bold text-red-500 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 mt-2 border-t border-zinc-100 dark:border-zinc-800"
                    >
                      Logout
                    </button>
                  </>
                ) : role === 'vendor' ? (
                  <>
                    <Link to="/vendor/dashboard" className={mobileNavLinkClass(location.pathname.includes('/vendor/dashboard'))}>Dashboard</Link>
                    {user?.vendorType === 'salon' ? (
                      <Link to="/vendor/services" className={mobileNavLinkClass(location.pathname === '/vendor/services')}>Manage Services</Link>
                    ) : (
                      <Link to="/vendor/menu" className={mobileNavLinkClass(location.pathname === '/vendor/menu')}>Manage Menu</Link>
                    )}
                    <Link to="/wallet" className={mobileNavLinkClass(location.pathname === '/wallet')}>Wallet</Link>
                    <Link to="/refer" className={mobileNavLinkClass(location.pathname === '/refer')}>Referral</Link>
                    <Link to="/vendor/profile" className={mobileNavLinkClass(location.pathname === '/vendor/profile')}>Profile & Settings</Link>
                    <button
                      onClick={logout}
                      className="text-left text-base font-bold text-red-500 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 mt-2 border-t border-zinc-100 dark:border-zinc-800"
                    >
                      Logout
                    </button>
                  </>
                ) : role === 'admin' ? (
                  <>
                    <Link to="/admin/dashboard" className={mobileNavLinkClass(location.pathname.includes('dashboard'))}>Dashboard</Link>
                    <button
                      onClick={logout}
                      className="text-left text-base font-bold text-red-500 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 mt-2 border-t border-zinc-100 dark:border-zinc-800"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/" className={mobileNavLinkClass(location.pathname === '/')}>Home</Link>
                    <button
                      onClick={() => setShowCustomerLogin(true)}
                      className="text-left text-base font-bold text-zinc-900 dark:text-white p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Customer Login
                    </button>
                    <Link to="/auth" className="text-base font-black text-black bg-[#d4ff00] p-3 rounded-xl text-center mt-2 shadow-lg shadow-[#d4ff00]/20 active:scale-95 transition-transform">
                      Business Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

      </header>

      <CustomerLoginModal 
        isOpen={showCustomerLogin} 
        onClose={() => setShowCustomerLogin(false)} 
        isCheckoutFlow={false}
      />

    </>
  );
}
