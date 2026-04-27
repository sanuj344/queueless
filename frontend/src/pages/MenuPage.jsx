import { useState } from 'react';
import { vendor, menuItems, categories } from '../data/mockData';
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';
import Badge from '../components/Badge';
import Button from '../components/Button';
import QuantityStepper from '../components/QuantityStepper';
import CartDrawer from '../components/CartDrawer';

function MenuItem({ item }) {
  const { addItem, increment, decrement, getItemQuantity } = useCart();
  const qty = getItemQuantity(item.id);

  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
      {/* Veg/Non-veg indicator */}
      <div className="shrink-0 mt-1">
        <div
          className={[
            'w-5 h-5 rounded border-2 flex items-center justify-center',
            item.veg ? 'border-emerald-500' : 'border-red-500',
          ].join(' ')}
        >
          <div
            className={[
              'w-2 h-2 rounded-full',
              item.veg ? 'bg-emerald-500' : 'bg-red-500',
            ].join(' ')}
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">{item.name}</h3>
          {item.popular && (
            <Badge variant="neon">
              <span className="text-[10px]">★ Popular</span>
            </Badge>
          )}
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-zinc-900 dark:text-white font-bold">{formatCurrency(item.price)}</span>
            <span className="text-xs text-zinc-600">· {item.prepTime} min</span>
          </div>

          {qty === 0 ? (
            <Button
              size="sm"
              onClick={() => addItem(item)}
              className="shrink-0"
            >
              + Add
            </Button>
          ) : (
            <QuantityStepper
              quantity={qty}
              onIncrement={() => increment(item.id)}
              onDecrement={() => decrement(item.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const { itemCount, total, openCart } = useCart();

  const filtered =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pb-32 sm:pb-24 transition-colors duration-300">

      {/* ─── Vendor Card ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-6">
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4ff00]/20 to-[#d4ff00]/5 border border-[#d4ff00]/20 flex items-center justify-center text-2xl shrink-0">
                🍽
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                  {vendor.name}
                </h1>
                <p className="text-sm text-zinc-500">{vendor.cuisine}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <Badge variant="green">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Open
                  </Badge>
                  <span className="text-xs text-zinc-500">
                    ⏱ {vendor.waitTime} min wait
                  </span>
                  <span className="text-xs text-zinc-500">
                    ⭐ {vendor.rating} ({vendor.reviews})
                  </span>
                </div>
              </div>
            </div>

            {/* QR badge */}
            <div className="inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
              <span>📱</span>
              <span>Scanned via QR</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Category Pills ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
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
      </div>

      {/* ─── Menu Items ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <p className="text-xs text-zinc-600 mb-4 font-medium uppercase tracking-wider">
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* ─── Sticky Cart Bar (mobile) ─── */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 px-4 pb-4 pt-2 sm:hidden">
          <button
            onClick={openCart}
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
