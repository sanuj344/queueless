/**
 * Format a number as INR currency string
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate cart subtotal
 * @param {Array} items
 * @returns {number}
 */
export function calcSubtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Calculate platform fee (5%)
 * @param {number} subtotal
 * @returns {number}
 */
export function calcFee(subtotal) {
  return Math.round(subtotal * 0.05);
}

/**
 * Calculate GST (5%)
 * @param {number} subtotal
 * @returns {number}
 */
export function calcTax(subtotal) {
  return Math.round(subtotal * 0.05);
}
