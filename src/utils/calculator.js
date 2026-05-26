// Look up screen print price per shirt for ONE location
function screenPrintLookup(numColors, totalQty, screenTiers) {
  const { quantities, prices } = screenTiers
  const colors = Math.min(numColors, Object.keys(prices).length)
  const row = prices[colors]
  if (!row) return null

  let colIndex = -1
  for (let i = 0; i < quantities.length; i++) {
    if (totalQty >= quantities[i]) colIndex = i
  }
  if (colIndex === -1) return null
  return row[colIndex]
}

// v2: batch-based screen print calculation
// All batches share the same print design (same locations, per-location ink color counts)
// Total qty across all batches determines the price tier
// inkColorsPerLocation: { front: 2, back: 1, left_chest: 1, ... }
export function calculateBatchQuote({ batches, printLocations, inkColorsPerLocation, pricingData }) {
  const { screenTiers, settings } = pricingData

  if (!batches.length || !printLocations.length) return null

  // Ensure every location has at least 1 color
  const colorsPerLoc = {}
  for (const loc of printLocations) {
    colorsPerLoc[loc] = Math.max(1, inkColorsPerLocation?.[loc] || 1)
  }

  const totalQty = batches.reduce((sum, b) => sum + (b.qty || 0), 0)
  if (totalQty < (settings.screen_print_min_qty || 36)) {
    return { belowMinimum: true, totalQty, minQty: settings.screen_print_min_qty || 36 }
  }

  // Print cost per shirt = sum of per-location lookup prices
  let printCostPerShirt = 0
  let gridLookupFailed = false
  const locBreakdown = []

  for (const loc of printLocations) {
    const colors = colorsPerLoc[loc]
    const locPrice = screenPrintLookup(colors, totalQty, screenTiers)
    if (locPrice === null) { gridLookupFailed = true; break }
    printCostPerShirt += locPrice
    locBreakdown.push({ loc, colors, pricePerShirt: locPrice })
  }

  if (gridLookupFailed) {
    return { belowMinimum: true, totalQty, minQty: screenTiers.quantities?.[0] || 36 }
  }

  // Setup fee: sum of (colors × fee_per_color) per location
  const feePerColor = settings.screen_print_setup_fee_per_color || 25
  const setupFee = printLocations.reduce((sum, loc) => sum + colorsPerLoc[loc] * feePerColor, 0)

  // Per-batch line items
  const lines = batches
    .filter(b => b.qty > 0 && b.garment)
    .map(b => {
      const unitPrice = b.garment.base_price + printCostPerShirt
      return {
        ...b,
        printCostPerShirt,
        unitPrice,
        lineTotal: b.qty * unitPrice,
      }
    })

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0)
  const total = subtotal + setupFee

  return {
    belowMinimum: false,
    totalQty,
    printCostPerShirt,
    locBreakdown,
    setupFee,
    lines,
    subtotal,
    total,
    pricePerShirt: total / totalQty,
  }
}
