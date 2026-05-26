// Built-in demo data — used when SHEET_ID is set to 'DEMO'
// v2 garment structure: apparel_type + gender + tier

export const DEMO_DATA = {
  garments: [
    // ── T-Shirts · Unisex ──────────────────────────────────────────────────
    { id: '5000',   name: 'Gildan Heavy Cotton Tee',           brand: 'Gildan',          apparel_type: 'T-Shirt', gender: 'Unisex',   tier: 'Budget',   base_price: 5.34 },
    { id: '2000',   name: 'Gildan Ultra Cotton Tee',           brand: 'Gildan',          apparel_type: 'T-Shirt', gender: 'Unisex',   tier: 'Standard', base_price: 5.79 },
    { id: '3001',   name: 'Bella Canvas Unisex Jersey Tee',    brand: 'Bella Canvas',    apparel_type: 'T-Shirt', gender: 'Unisex',   tier: 'Premium',  base_price: 6.95 },

    // ── T-Shirts · Women's ─────────────────────────────────────────────────
    { id: 'LPC61',  name: "P&C Ladies Cotton Tee",             brand: 'Port & Company',  apparel_type: 'T-Shirt', gender: "Women's",  tier: 'Budget',   base_price: 5.63 },
    { id: 'PC54',   name: 'P&C Lightweight Cotton Tee',        brand: 'Port & Company',  apparel_type: 'T-Shirt', gender: "Women's",  tier: 'Standard', base_price: 6.00 },
    { id: '6004',   name: 'Bella Canvas Womens Relaxed Tee',   brand: 'Bella Canvas',    apparel_type: 'T-Shirt', gender: "Women's",  tier: 'Premium',  base_price: 7.50 },

    // ── T-Shirts · Youth ──────────────────────────────────────────────────
    { id: '5000B',  name: 'Gildan Youth Cotton Tee',           brand: 'Gildan',          apparel_type: 'T-Shirt', gender: 'Youth',    tier: 'Budget',   base_price: 5.28 },
    { id: 'PC54Y',  name: 'P&C Youth Cotton Tee 5.5 oz',       brand: 'Port & Company',  apparel_type: 'T-Shirt', gender: 'Youth',    tier: 'Standard', base_price: 5.69 },
    { id: 'PC61Y',  name: 'P&C Youth Cotton Tee 6.1 oz',       brand: 'Port & Company',  apparel_type: 'T-Shirt', gender: 'Youth',    tier: 'Premium',  base_price: 6.36 },

    // ── Hoodies · Unisex ──────────────────────────────────────────────────
    { id: '18500',  name: 'Gildan Heavy Blend Hoodie',          brand: 'Gildan',          apparel_type: 'Hoodie',  gender: 'Unisex',   tier: 'Budget',   base_price: 12.50 },
    { id: '18500',  name: 'Hanes Ecosmart Pullover Hoodie',     brand: 'Hanes',           apparel_type: 'Hoodie',  gender: 'Unisex',   tier: 'Standard', base_price: 15.00 },
    { id: '3719',   name: 'Bella Canvas Unisex Sponge Hoodie',  brand: 'Bella Canvas',    apparel_type: 'Hoodie',  gender: 'Unisex',   tier: 'Premium',  base_price: 22.00 },

    // ── Hoodies · Youth ───────────────────────────────────────────────────
    { id: '18500B', name: 'Gildan Youth Heavy Blend Hoodie',    brand: 'Gildan',          apparel_type: 'Hoodie',  gender: 'Youth',    tier: 'Budget',   base_price: 11.00 },

    // ── Tank Tops · Unisex ────────────────────────────────────────────────
    { id: '2200',   name: 'Gildan Ultra Cotton Tank',           brand: 'Gildan',          apparel_type: 'Tank Top', gender: 'Unisex',  tier: 'Budget',   base_price: 4.50 },
    { id: '3480',   name: 'Bella Canvas Unisex Jersey Tank',    brand: 'Bella Canvas',    apparel_type: 'Tank Top', gender: 'Unisex',  tier: 'Premium',  base_price: 6.25 },

    // ── Tank Tops · Women's ───────────────────────────────────────────────
    { id: '8800',   name: 'Gildan Performance Ladies Tank',     brand: 'Gildan',          apparel_type: 'Tank Top', gender: "Women's", tier: 'Budget',   base_price: 4.75 },
    { id: '8803',   name: 'Bella Canvas Womens Flowy Tank',     brand: 'Bella Canvas',    apparel_type: 'Tank Top', gender: "Women's", tier: 'Premium',  base_price: 7.25 },
  ],

  // Screen print price grid — price per shirt PER LOCATION
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

  settings: {
    screen_print_setup_fee_per_color: 25.00,
    screen_print_min_qty: 36,
    screen_print_max_colors: 13,
  },
}
