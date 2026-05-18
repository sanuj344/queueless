import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import Button from '../components/Button';
import QuantityStepper from '../components/QuantityStepper';
import CartDrawer from '../components/CartDrawer';
import Spinner from '../components/Spinner';
import SalonBookingPage from './SalonBookingPage';
import toast from 'react-hot-toast';

function MenuItem({ item }) {
  const { addItem, increment, decrement, getItemQuantity } = useCart();
  const qty = getItemQuantity(item.id);

  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:scale-[1.01] group shadow-sm">
      <div className="shrink-0 mt-1">
        <div className="w-5 h-5 rounded border-2 border-emerald-500 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h3 className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">{item.name}</h3>
          <span className="text-xs font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md shrink-0">
            {item.prepTime || 10} min
          </span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-2">{item.description || item.category}</p>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-zinc-900 dark:text-white font-bold">{formatCurrency(item.price)}</span>
          {qty === 0 ? (
            <Button size="sm" onClick={() => addItem(item)} className="shrink-0">+ Add</Button>
          ) : (
            <QuantityStepper quantity={qty} onIncrement={() => increment(item.id)} onDecrement={() => decrement(item.id)} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vendorIdFromQuery = searchParams.get('vendorId');
  const { setActiveVendorId } = useAuth();

  const [items, setItems] = useState([]);
  const [vendorData, setVendorData] = useState({ name: 'Vendor', cuisine: 'Local Store', waitTime: 15, rating: '0.0', reviews: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { itemCount, total, items: cartItems, clearCart } = useCart();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/menu?vendorId=${vendorIdFromQuery}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("✅ Menu link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
      toast.error("Failed to copy link");
    }
  };

  const handleShareClick = async () => {
    const shareUrl = `${window.location.origin}/menu?vendorId=${vendorIdFromQuery}`;
    const shareText = `Check out the menu of ${vendorData.name} on Qzaam! 🍽️`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: vendorData.name,
          text: shareText,
          url: shareUrl
        });
        toast.success("✅ Menu shared successfully!");
      } catch (err) {
        console.log('Native share failed or cancelled', err);
        if (err.name !== 'AbortError') {
          setIsShareModalOpen(true);
        }
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  // Persist vendorId so Navbar Menu link always works
  useEffect(() => {
    if (vendorIdFromQuery) {
      setActiveVendorId(vendorIdFromQuery);
      localStorage.setItem("ql_vendor", vendorIdFromQuery);
    }
    
    // Safety check: if cart has items from a different vendor, clear it to prevent order mismatch
    if (cartItems && cartItems.length > 0 && vendorIdFromQuery) {
      const cartVendorId = cartItems[0]?.vendorId;
      if (cartVendorId && cartVendorId !== vendorIdFromQuery) {
        clearCart();
      }
    }
  }, [vendorIdFromQuery, setActiveVendorId, cartItems, clearCart]);

  useEffect(() => {
    if (!vendorIdFromQuery) {
      setError('No vendor selected. Please scan a valid QR code.');
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [menuRes, vendorRes, reviewsRes] = await Promise.all([
          api.get(`/menus/${vendorIdFromQuery}`),
          api.get(`/vendors/${vendorIdFromQuery}`),
          api.get(`/reviews/vendor/${vendorIdFromQuery}`).catch(() => ({ data: { avgRating: '0.0', totalReviews: 0 } }))
        ]);
        setItems(menuRes.data.data);
        setVendorData({
          id: vendorRes.data.data.id,
          name: vendorRes.data.data.outletName || vendorRes.data.data.name,
          outletName: vendorRes.data.data.outletName || vendorRes.data.data.name,
          address: vendorRes.data.data.address || '',
          mobile: vendorRes.data.data.mobile || '',
          cuisine: vendorRes.data.data.address?.split('\n')[0] || '',
          waitTime: vendorRes.data.data.averagePrepTime || 15,
          rating: reviewsRes.data.avgRating || '0.0',
          reviews: reviewsRes.data.totalReviews || 0,
          vendorType: vendorRes.data.data.vendorType || 'food'
        });
      } catch {
        setError('Failed to fetch menu or store details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [vendorIdFromQuery]);

  if (isLoading) return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  // Salon vendor → hand off to SalonBookingPage
  if (!error && vendorData.vendorType === 'salon') {
    return <SalonBookingPage vendor={vendorData} vendorId={vendorIdFromQuery} />;
  }

  if (error || !vendorIdFromQuery) return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 px-4 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-3xl mb-6">🏪</div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Vendor not found</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs leading-relaxed">
        {error || 'No vendor selected. Please scan a valid store QR code.'}
      </p>
      <Link to="/" className="mt-8">
        <Button variant="outline" size="lg">Return Home</Button>
      </Link>
    </div>
  );

  const categories = ['All', ...new Set((items || []).map((i) => i.category))];
  const filtered = activeCategory === 'All' ? (items || []) : (items || []).filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pb-32 sm:pb-24 transition-colors duration-300">
      {/* ─── Vendor Header ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-6">
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4ff00]/20 to-[#d4ff00]/5 border border-[#d4ff00]/20 flex items-center justify-center text-2xl shrink-0">
                🍽
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                  {vendorData.name}
                </h1>
                <p className="text-sm text-zinc-500">{vendorData.cuisine}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <Badge variant="green">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Open
                  </Badge>
                  <span className="text-xs text-zinc-500">⏱ {vendorData.waitTime} min wait</span>
                  <span className="text-xs text-zinc-500">⭐ {vendorData.rating} ({vendorData.reviews})</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
                <span>📱</span>
                <span>Scanned via QR</span>
              </div>
              <button
                onClick={handleShareClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
              >
                <span>📤</span>
                <span>Share Menu</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Menu Content ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">🍽️</div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Menu not available</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">This vendor hasn't added any items yet.</p>
          </div>
        ) : (
          <>
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    'shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all',
                    activeCategory === cat
                      ? 'bg-[#8cb800] dark:bg-[#d4ff00] text-white dark:text-black shadow-[0_0_20px_rgba(140,184,0,0.2)] dark:shadow-[0_0_20px_rgba(212,255,0,0.2)]'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700',
                  ].join(' ')}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Item List */}
            <p className="text-xs text-zinc-600 mb-4 font-medium uppercase tracking-wider">
              {filtered.length} item{filtered.length !== 1 ? 's' : ''} in {activeCategory}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.length === 0 ? (
                <div className="py-20 text-center col-span-full">
                  <p className="text-zinc-500 font-medium">No items found in this category.</p>
                </div>
              ) : (
                filtered.map((item) => (
                  <MenuItem key={item.id} item={item} />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Sticky Cart Bar (mobile) */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 px-4 pb-4 pt-2 sm:hidden animate-in slide-in-from-bottom-full duration-300">
          <button
            onClick={() => navigate(`/cart?vendorId=${vendorIdFromQuery}`)}
            className="w-full flex items-center justify-between bg-[#8cb800] dark:bg-[#d4ff00] text-white dark:text-black rounded-2xl px-5 py-4 font-bold shadow-[0_0_30px_rgba(140,184,0,0.25)] dark:shadow-[0_0_30px_rgba(212,255,0,0.25)]"
          >
            <div className="flex items-center gap-3">
              <span className="bg-white dark:bg-black text-[#8cb800] dark:text-[#d4ff00] text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
              <span>View Cart</span>
            </div>
            <span>{formatCurrency(total)}</span>
          </button>
        </div>
      )}

      <CartDrawer />

      {/* ─── Modern Share Modal ─── */}
      {isShareModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden transition-all transform scale-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Decorative Gradient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-[#8cb800]/10 to-[#8cb800]/2 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center mt-2 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#8cb800]/10 dark:bg-[#d4ff00]/10 border border-[#8cb800]/20 dark:border-[#d4ff00]/20 flex items-center justify-center text-2xl mb-3 shadow-inner">
                📤
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">Share Menu</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[240px]">
                Share this delicious menu with your friends and family!
              </p>
            </div>

            {/* Vendor Live Preview Box */}
            <div className="mb-6 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8cb800]/20 to-[#8cb800]/5 border border-[#8cb800]/20 flex items-center justify-center text-lg shrink-0">
                🍽
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                  {vendorData.name}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {vendorData.cuisine || 'Local Store'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest block">
                  Active Menu
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5 font-semibold">
                  ⭐ {vendorData.rating}
                </span>
              </div>
            </div>

            {/* Quick Share Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* WhatsApp Button */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out the menu of ${vendorData.name} on Qzaam! 🍽️\nBrowse and order directly: ${window.location.origin}/menu?vendorId=${vendorIdFromQuery}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer text-center gap-1"
              >
                <span className="text-2xl">💬</span>
                <span>WhatsApp</span>
              </a>

              {/* Telegram Button */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  `${window.location.origin}/menu?vendorId=${vendorIdFromQuery}`
                )}&text=${encodeURIComponent(
                  `Check out the menu of ${vendorData.name} on Qzaam! 🍽️`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer text-center gap-1"
              >
                <span className="text-2xl">✈️</span>
                <span>Telegram</span>
              </a>
            </div>

            {/* Copy Link Input Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">
                Direct Link
              </label>
              <div className="flex gap-2 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/menu?vendorId=${vendorIdFromQuery}`}
                  className="w-full bg-transparent text-xs text-zinc-600 dark:text-zinc-400 rounded-xl px-2.5 outline-none select-all truncate font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-[#8cb800] dark:bg-[#d4ff00] hover:bg-[#7ba200] dark:hover:bg-[#c2eb00] text-white dark:text-black font-black text-xs rounded-xl px-4 py-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer shadow-md"
                >
                  {copied ? 'Copied! ✅' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
