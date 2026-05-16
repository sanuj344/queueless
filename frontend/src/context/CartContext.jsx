import { createContext, useContext, useReducer, useEffect } from 'react';
import { calcSubtotal } from '../utils/formatCurrency';
import api from '../utils/api';

const CartContext = createContext(null);

const initialState = {
  items: [],
  isOpen: false,
  isCheckoutOpen: false,
};

// Lazy initializer to load from localStorage
const init = (initial) => {
  try {
    const saved = localStorage.getItem('ql_cart');
    if (saved) {
      const parsedItems = JSON.parse(saved);
      if (Array.isArray(parsedItems)) {
        return { ...initial, items: parsedItems };
      }
    }
  } catch (e) {
    console.error('Failed to parse cart from localStorage:', e);
  }
  return initial;
};

function cartReducer(state, action) {
  let newState;
  const currentItems = state.items || [];

  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = currentItems.find((i) => i.id === action.item.id);
      if (existing) {
        newState = {
          ...state,
          items: currentItems.map((i) =>
            i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      } else {
        newState = { ...state, items: [...currentItems, { ...action.item, quantity: 1 }] };
      }
      break;
    }
    case 'REMOVE_ITEM':
      newState = { ...state, items: currentItems.filter((i) => i.id !== action.id) };
      break;
    case 'INCREMENT':
      newState = {
        ...state,
        items: currentItems.map((i) =>
          i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
      break;
    case 'DECREMENT': {
      const item = currentItems.find((i) => i.id === action.id);
      if (item?.quantity === 1) {
        newState = { ...state, items: currentItems.filter((i) => i.id !== action.id) };
      } else {
        newState = {
          ...state,
          items: currentItems.map((i) =>
            i.id === action.id ? { ...i, quantity: i.quantity - 1 } : i
          ),
        };
      }
      break;
    }
    case 'CLEAR_CART':
      newState = { ...state, items: [] };
      break;
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    case 'OPEN_CHECKOUT':
      return { ...state, isCheckoutOpen: true };
    case 'CLOSE_CHECKOUT':
      return { ...state, isCheckoutOpen: false };
    default:
      return state;
  }
  
  // Save items to localStorage on modification
  if (newState && newState.items !== state.items) {
    localStorage.setItem('ql_cart', JSON.stringify(newState.items));
  }
  return newState || state;
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, init);
  const [backendTotals, setBackendTotals] = useReducer(
    (s, a) => ({ ...s, ...a }),
    { subtotal: 0, platformFee: 0, tax: 0, deliveryFee: 0, finalTotal: 0 }
  );

  const subtotal = calcSubtotal(state.items);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  // Fetch backend totals whenever subtotal changes
  useEffect(() => {
    if (state.items.length === 0) {
      setBackendTotals({ subtotal: 0, platformFee: 0, tax: 0, deliveryFee: 0, finalTotal: 0 });
      return;
    }

    const vendorId = state.items[0]?.vendorId;
    if (!vendorId) return;

    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/orders/calculate-total', {
          subtotal,
          vendorId
        });
        if (res.data.success) {
          setBackendTotals(res.data.data);
          console.log('[DEBUG] Backend Totals Fetched:', res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch backend totals:', err);
      }
    }, 100); // Small debounce

    return () => clearTimeout(timer);
  }, [subtotal, state.items]);

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', id });
  const increment = (id) => dispatch({ type: 'INCREMENT', id });
  const decrement = (id) => dispatch({ type: 'DECREMENT', id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const openCart = () => dispatch({ type: 'OPEN_CART' });
  const closeCart = () => dispatch({ type: 'CLOSE_CART' });
  const openCheckout = () => dispatch({ type: 'OPEN_CHECKOUT' });
  const closeCheckout = () => dispatch({ type: 'CLOSE_CHECKOUT' });

  const getItemQuantity = (id) => {
    const item = state.items.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        isCheckoutOpen: state.isCheckoutOpen,
        subtotal: backendTotals.subtotal,
        fee: backendTotals.platformFee,
        tax: backendTotals.tax,
        deliveryFee: backendTotals.deliveryFee,
        total: backendTotals.finalTotal,
        itemCount,
        addItem,
        removeItem,
        increment,
        decrement,
        clearCart,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
