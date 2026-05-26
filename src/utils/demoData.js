// Built-in demo data — used when SHEET_ID is set to 'DEMO'
// Replace with your real Google Sheet once configured.

export const DEMO_DATA = {
  garments: [
    { id: 'g1', name: 'Heavy Cotton Tee',        brand: 'Gildan',        category: 'Standard', base_price: 3.50 },
    { id: 'g2', name: 'Unisex Jersey Tee',        brand: 'Bella+Canvas',  category: 'Premium',  base_price: 6.25 },
    { id: 'g3', name: 'CVC Crew Tee',             brand: 'Next Level',    category: 'Premium',  base_price: 6.75 },
    { id: 'g4', name: 'Essential Tee',            brand: 'Port & Company',category: 'Budget',   base_price: 2.75 },
    { id: 'g5', name: 'Unisex Lightweight Hoodie',brand: 'Bella+Canvas',  category: 'Hoodie',   base_price: 18.00 },
    { id: 'g6', name: 'Heavy Blend Hoodie',       brand: 'Gildan',        category: 'Hoodie',   base_price: 12.50 },
  ],

  // Screen print price grid — price per shirt PER LOCATION
  // Row = # ink colors (1–13), Column = quantity breakpoint (use highest breakpoint <= totalQty)
  screenTiers: {
    quantities: [36, 48, 72, 144, 250, 500, 1000, 2500, 5000],
    prices: {
       1: [5.78, 3.75, 2.45, 2.07, 1.91, 1.73, 1.61, 1.49, 1.41],
       2: [8.72, 5.33, 3.69, 2.83, 2.26, 2.03, 1.83, 1.65, 1.49],
       3: [11.66, 6.93, 4.91, 3.47, 2.77, 2.33, 2.05, 1.80, 1.59],
       4: [14.60, 8.55, 6.14, 4.25, 3.15, 2.64, 2.27, 1.94, 1.68],
       5: [17.56, 10.14, 7.33, 4.87, 3.52, 2.94, 2.51, 2.11, 1.77],
       6: [20.49, 11.71, 8.47, 5.62, 4.00, 3.22, 2.72, 2.25, 1.85],
       7: [23.44, 13.33, 9.69, 6.28, 4.39, 3.54, 2.94, 2.41, 1.93],
       8: [26.38, 14.94, 10.90, 7.03, 4.76, 3.85, 3.15, 2.55, 2.04],
       9: [29.32, 16.55, 12.13, 7.67, 5.15, 4.16, 3.38, 2.69, 2.13],
      10: [32.26, 18.14, 13.35, 8.44, 5.64, 4.45, 3.61, 2.85, 2.21],
      11: [35.21, 19.75, 14.48, 9.08, 6.02, 4.75, 3.82, 2.99, 2.29],
      12: [38.15, 21.35, 15.71, 9.85, 6.41, 5.06, 4.06, 3.15, 2.40],
      13: [41.10, 22.95, 16.91, 10.47, 6.89, 5.34, 4.26, 3.29, 2.49],
    },
  },

  dtfPricing: [
    { min_qty: 1,  max_qty: 35,   price_per_location: 6.00 },
    { min_qty: 36, max_qty: 47,   price_per_location: 5.00 },
    { min_qty: 48, max_qty: 71,   price_per_location: 4.00 },
    { min_qty: 72, max_qty: 9999, price_per_location: 3.50 },
  ],

  sizeUpcharges: {
    'S': 0, 'M': 0, 'L': 0, 'XL': 0, '2XL': 2.00, '3XL': 3.00, '4XL': 4.00,
  },

  settings: {
    screen_print_setup_fee_per_color: 25.00, // one-time per color per location
    screen_print_min_qty: 36,
    screen_print_min_order: 150.00,
    screen_print_max_colors: 13,            // above this → "call for pricing"
  },
}
