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
  const [vendorData, setVendorData] = useState({ name: 'Vendor', cuisine: 'Local Store', waitTime: 15, rating: 4.8, reviews: 100 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { itemCount, total, items: cartItems, clearCart } = useCart();

  // Persist vendorId so Navbar Menu link always works
  useEffect(() => {
    if (vendorIdFromQuery) setActiveVendorId(vendorIdFromQuery);
    
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
        const [menuRes, vendorRes] = await Promise.all([
          api.get(`/menus/${vendorIdFromQuery}`),
          api.get(`/vendors/${vendorIdFromQuery}`)
        ]);
        setItems(menuRes.data.data);
        setVendorData({
          name: vendorRes.data.data.outletName || vendorRes.data.data.name,
          cuisine: vendorRes.data.data.address?.split('\n')[0] || '',
          waitTime: vendorRes.data.data.averagePrepTime || 15,
          rating: 4.8,
          reviews: 124
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
            <div className="inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
              <span>📱</span>
              <span>Scanned via QR</span>
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
    </div>
  );
}
