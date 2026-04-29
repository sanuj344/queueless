import { createContext, useContext, useReducer } from 'react';
import { calcSubtotal, calcFee, calcTax } from '../utils/formatCurrency';

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

  const subtotal = calcSubtotal(state.items);
  const fee = calcFee(subtotal);
  const tax = calcTax(subtotal);
  const total = subtotal + fee + tax;
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

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
        subtotal,
        fee,
        tax,
        total,
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
