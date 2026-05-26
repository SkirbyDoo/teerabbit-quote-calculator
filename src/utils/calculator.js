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
// All batches share the same print (same locations + same color count)
// Total qty across all batches determines the price tier
export function calculateBatchQuote({ batches, printLocations, numColors, pricingData }) {
  const { screenTiers, settings } = pricingData

  if (!batches.length || !printLocations.length || numColors < 1) return null

  const totalQty = batches.reduce((sum, b) => sum + (b.qty || 0), 0)
  if (totalQty < (settings.screen_print_min_qty || 36)) return { belowMinimum: true, totalQty, minQty: settings.screen_print_min_qty || 36 }

  // Price per shirt for ONE location at this qty + color count
  const pricePerLocation = screenPrintLookup(numColors, totalQty, screenTiers)
  if (pricePerLocation === null) return { belowMinimum: true, totalQty, minQty: screenTiers.quantities?.[0] || 36 }

  const printCostPerShirt = pricePerLocation * printLocations.length

  // One-time setup fee: colors × locations × fee_per_color
  const setupFee = numColors * printLocations.length * (settings.screen_print_setup_fee_per_color || 25)

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
    pricePerLocation,
    setupFee,
    lines,
    subtotal,
    total,
    pricePerShirt: total / totalQty,
  }
}
