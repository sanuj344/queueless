import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import Button from '../components/Button';
import Card from '../components/Card';
import QuantityStepper from '../components/QuantityStepper';
import CheckoutModal from '../components/CheckoutModal';

export default function CartPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    items, 
    subtotal, 
    total, 
    fee, 
    tax, 
    increment, 
    decrement, 
    removeItem, 
    openCheckout 
  } = useCart();

  const vendorId = searchParams.get('vendorId') || items[0]?.vendorId;

  console.log('vendorId:', vendorId);
  console.log('cart items:', items);

  if (!vendorId && (!items || items.length === 0)) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-28 px-4 flex flex-col items-center text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Invalid Access</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Please scan a valid QR code to view the menu and your cart.</p>
        <Link to="/" className="mt-6 text-[#8cb800] dark:text-[#d4ff00] font-bold underline">Go to Home</Link>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-28 px-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-3xl mb-6">
          🛒
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Your cart is empty</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Add some delicious items from the menu to get started.</p>
        <Link 
          to={`/menu?vendorId=${vendorId}`} 
          className="mt-8 px-8 py-3 bg-[#8cb800] dark:bg-[#d4ff00] text-white dark:text-black font-black rounded-2xl shadow-lg"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pb-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black tracking-tight">Your Cart</h1>
          <Link 
            to={`/menu?vendorId=${vendorId}`} 
            className="text-sm font-bold text-[#8cb800] dark:text-[#d4ff00] flex items-center gap-2"
          >
            ← Add more items
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-zinc-900 dark:text-white">{item.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{formatCurrency(item.price)} each</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <QuantityStepper 
                    quantity={item.quantity}
                    onIncrement={() => increment(item.id)}
                    onDecrement={() => decrement(item.id)}
                  />
                  <div className="text-right min-w-[80px]">
                    <p className="font-black text-zinc-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</p>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-[10px] uppercase font-black text-red-500 mt-1 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-28">
              <h2 className="text-lg font-bold mb-4">Summary</h2>
              <div className="space-y-3 text-sm border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Platform Fee</span>
                  <span className="text-[#8cb800] dark:text-[#d4ff00] font-black">{formatCurrency(fee)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">GST (5%)</span>
                    <span className="font-bold">{formatCurrency(tax)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-lg font-black mb-6">
                <span>Total</span>
                <span className="text-[#8cb800] dark:text-[#d4ff00]">{formatCurrency(total)}</span>
              </div>
              
              <Button fullWidth size="xl" onClick={openCheckout}>
                Proceed to Checkout
              </Button>
              
              <p className="text-[10px] text-zinc-400 text-center mt-4 uppercase tracking-widest font-black">
                OTP verification next
              </p>
            </Card>
          </div>
        </div>
      </div>
      
      <CheckoutModal />
    </div>
  );
}
