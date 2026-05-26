// ─── Google Sheets Configuration ────────────────────────────────────────────
// Sheet: https://docs.google.com/spreadsheets/d/1H4GSOZJAFsVJUs31-O7ftsPHjmRRdAZJdTjmfkfDtD0
//
// Tab names must match exactly what's in the spreadsheet.
// To update pricing: edit the sheet — changes reflect on next page load.
// ─────────────────────────────────────────────────────────────────────────────

export const SHEET_ID = '1H4GSOZJAFsVJUs31-O7ftsPHjmRRdAZJdTjmfkfDtD0'

export const SHEET_NAMES = {
  garments:      'Teerabbit Garments',
  screenTiers:   'Screen Print Tiers',
  dtfPricing:    'DTF Pricing',
  sizeUpcharges: 'Size Upcharges',
  settings:      'Settings',
  brandRules:    'Brand Rules',
}

// Uses the gviz/tq endpoint — works by tab name, no GID needed
export const sheetUrl = (tabName) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`
