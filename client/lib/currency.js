/**
 * Shared AED Currency Utility
 * Ensures all monetary amounts are displayed consistently in UAE Dirhams (AED)
 * without altering backend numeric data.
 */
export function formatAED(amount, options = {}) {
  if (amount === undefined || amount === null || amount === '') return 'AED 0';
  const num = Number(amount);
  if (isNaN(num)) return 'AED 0';
  const formatted = num.toLocaleString('en-AE', {
    maximumFractionDigits: options.decimals !== undefined ? options.decimals : 0,
    minimumFractionDigits: options.minimumFractionDigits || 0,
  });
  return `AED ${formatted}`;
}

export function parseAED(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/[^0-9.-]/g, '');
  const val = Number(cleaned);
  return isNaN(val) ? 0 : val;
}

export default formatAED;

