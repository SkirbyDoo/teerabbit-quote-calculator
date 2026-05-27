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
// Each design has its own print locations + per-location ink colors
// Total qty across all batches in the design determines price tier
// inkColorsPerLocation: { front: 2, back: 1, ... }
export function calculateBatchQuote({ batches, printLocations, inkColorsPerLocation, pricingData }) {
  const { screenTiers, settings } = pricingData

  if (!batches.length || !printLocations.length) return null

  const colorsPerLoc = {}
  for (const loc of printLocations) {
    colorsPerLoc[loc] = Math.max(1, inkColorsPerLocation?.[loc] || 1)
  }

  const totalQty = batches.reduce((sum, b) => sum + (b.qty || 0), 0)
  const minQty = settings.screen_print_min_qty || 36
  const belowMinimum = totalQty < minQty

  // Use minimum qty for grid lookup when below min — gives 36-pc pricing as estimate
  const lookupQty = belowMinimum ? minQty : totalQty

  // Print cost per shirt = sum of per-location lookup prices
  let printCostPerShirt = 0
  let gridLookupFailed = false
  const locBreakdown = []

  for (const loc of printLocations) {
    const colors = colorsPerLoc[loc]
    const locPrice = screenPrintLookup(colors, lookupQty, screenTiers)
    if (locPrice === null) { gridLookupFailed = true; break }
    printCostPerShirt += locPrice
    locBreakdown.push({ loc, colors, pricePerShirt: locPrice })
  }

  if (gridLookupFailed) return null

  // No setup fee — screen print pricing is all-in per the pricing tiers
  const setupFee = 0

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
    belowMinimum,
    minQty,
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
