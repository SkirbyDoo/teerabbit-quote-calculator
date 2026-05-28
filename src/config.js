// ─── Google Sheets Configuration ────────────────────────────────────────────
// Sheet: https://docs.google.com/spreadsheets/d/1H4GSOZJAFsVJUs31-O7ftsPHjmRRdAZJdTjmfkfDtD0
//
// Tab names must match exactly what's in the spreadsheet.
// To update pricing: edit the sheet — changes reflect on next page load.
// ─────────────────────────────────────────────────────────────────────────────

export const SHEET_ID = '1H4GSOZJAFsVJUs31-O7ftsPHjmRRdAZJdTjmfkfDtD0'

export const SHEET_NAMES = {
  garments:      'Garments',
  screenTiers:   'Screen Print Tiers',
  dtfPricing:    'DTF Pricing',
  sizeUpcharges: 'Size Upcharges',
  settings:      'Settings',
  brandRules:    'Brand Rules',
}

// Uses the gviz/tq endpoint — works by tab name, no GID needed
// cache param busts Google's server-side cache so new sheet values appear immediately
export const sheetUrl = (tabName) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&cache=${Date.now()}`

// ─── Settings overrides ───────────────────────────────────────────────────────
// IMPORTANT: Google's gviz API infers a column type from the first values it
// sees. Because the Settings sheet has numeric values (36, 0, 13) in the
// "value" column before the text rows, gviz types that column as "number" and
// silently drops any non-numeric cell values — including contact_email and
// contact_phone — returning null/empty instead of the actual text.
//
// TWO ways to fix this:
//
// Option A (recommended — no code changes needed after setup):
//   Create a .env.local file in the project root with:
//     VITE_CONTACT_EMAIL=orders@teerabbit.com
//     VITE_CONTACT_PHONE=(555) 123-4567
//
// Option B (edit here directly):
//   Fill in the strings below.
//
// Option C (sheet-side fix, no code changes):
//   In the Settings Google Sheet, move the contact_email and contact_phone
//   rows to be the FIRST rows under the header (before the numeric rows).
//   This causes gviz to type column B as "string" and all values come through.
// ──────────────────────────────────────────────────────────────────────────────
export const SETTINGS_OVERRIDES = {
  contact_email: import.meta.env.VITE_CONTACT_EMAIL || '',
  contact_phone: import.meta.env.VITE_CONTACT_PHONE || '',
}
