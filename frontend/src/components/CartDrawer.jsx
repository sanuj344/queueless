import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import QuantityStepper from './QuantityStepper';
import Button from './Button';
import CheckoutModal from './CheckoutModal';

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    itemCount,
    subtotal,
    total,
    increment,
    decrement,
    removeItem,
    openCheckout,
  } = useCart();

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <div className="fixed bottom-0 inset-x-0 z-50 sm:right-0 sm:inset-x-auto sm:left-auto sm:top-0 sm:w-[420px] flex flex-col bg-white dark:bg-zinc-900 border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-none shadow-2xl max-h-[90vh] sm:max-h-screen">
            {/* Handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Your Cart</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-5xl mb-4">🛒</div>
                  <p className="text-zinc-400 font-medium">Your cart is empty</p>
                  <p className="text-zinc-600 text-sm mt-1">Add items from the menu</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800"
                  >
                    {/* Veg/Non-veg dot */}
                    <div className="shrink-0">
                      <div
                        className={[
                          'w-5 h-5 rounded border-2 flex items-center justify-center',
                          item.veg
                            ? 'border-emerald-500'
                            : 'border-red-500',
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

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{formatCurrency(item.price)} each</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <QuantityStepper
                        quantity={item.quantity}
                        onIncrement={() => increment(item.id)}
                        onDecrement={() => decrement(item.id)}
                        size="sm"
                      />
                      <span className="w-14 text-right text-sm font-bold text-zinc-900 dark:text-white tabular-nums">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-zinc-900 dark:text-white font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => {
                    openCheckout();
                  }}
                >
                  Proceed to Checkout — {formatCurrency(total)}
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <CheckoutModal />
    </>
  );
}
