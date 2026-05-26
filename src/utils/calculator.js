// Look up the screen print price per shirt for ONE location
// given a color count and total quantity, using the grid in pricingData.screenTiers
function screenPrintLookup(colors, totalQty, screenTiers) {
  const { quantities, prices } = screenTiers
  const clampedColors = Math.min(colors, Object.keys(prices).length)
  const row = prices[clampedColors]
  if (!row) return null

  // Find the highest breakpoint that totalQty meets or exceeds
  let colIndex = -1
  for (let i = 0; i < quantities.length; i++) {
    if (totalQty >= quantities[i]) colIndex = i
  }
  if (colIndex === -1) return null // below minimum qty
  return row[colIndex]
}

export function calculateQuote({ garment, quantities, printLocations, inkColorsPerLocation, pricingData }) {
  const { screenTiers, dtfPricing, sizeUpcharges, settings } = pricingData

  const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
  const totalQty = SIZES.reduce((sum, s) => sum + (quantities[s] || 0), 0)

  if (totalQty === 0 || !garment || printLocations.length === 0) return null

  const numLocations = printLocations.length
  const maxColors = settings.screen_print_max_colors || Object.keys(screenTiers.prices || {}).length || 13

  // Check if any location exceeds the max supported color count
  const colorsExceeded = printLocations.some(loc => (inkColorsPerLocation[loc] || 1) > maxColors)

  // ── Attempt screen print ────────────────────────────────────────────────────
  // Conditions: meets min qty setting AND qty is within the pricing grid AND colors not exceeded
  const meetsSettingsMinQty = totalQty >= (settings.screen_print_min_qty || 0)
  let screenResult = null

  if (meetsSettingsMinQty && !colorsExceeded) {
    // Look up price for each location from the grid
    let printCostPerShirt = 0
    let gridLookupFailed = false

    for (const loc of printLocations) {
      const colors = inkColorsPerLocation[loc] || 1
      const locPrice = screenPrintLookup(colors, totalQty, screenTiers)
      if (locPrice === null) { gridLookupFailed = true; break }
      printCostPerShirt += locPrice
    }

    if (!gridLookupFailed) {
      const setupFee = printLocations.reduce((sum, loc) =>
        sum + (inkColorsPerLocation[loc] || 1) * (settings.screen_print_setup_fee_per_color || 0), 0)

      let shirtSubtotal = 0
      SIZES.forEach(size => {
        const qty = quantities[size] || 0
        if (!qty) return
        shirtSubtotal += qty * (garment.base_price + (sizeUpcharges[size] || 0) + printCostPerShirt)
      })

      screenResult = {
        method: 'Screen Print',
        subtotal: shirtSubtotal,
        setupFee,
        total: shirtSubtotal + setupFee,
        pricePerShirt: (shirtSubtotal + setupFee) / totalQty,
        printCostPerShirt,
        totalQty,
      }
    }
  }

  // ── Return screen print if it meets the order minimum ──────────────────────
  const meetsMinOrder = screenResult && screenResult.total >= (settings.screen_print_min_order || 0)
  if (screenResult && meetsMinOrder) {
    return { ...screenResult, switchReason: null }
  }

  // ── DTF fallback ─────────────────────────────────────────────────────────────
  const dtfTier = dtfPricing.find(t => totalQty >= t.min_qty && totalQty <= t.max_qty)
  if (!dtfTier) return null

  let dtfSubtotal = 0
  SIZES.forEach(size => {
    const qty = quantities[size] || 0
    if (!qty) return
    dtfSubtotal += qty * (garment.base_price + (sizeUpcharges[size] || 0) + dtfTier.price_per_location * numLocations)
  })

  // Determine why we switched to DTF
  const gridMin = screenTiers.quantities?.[0] || settings.screen_print_min_qty || 36
  const switchReason = colorsExceeded
    ? `More than ${maxColors} colors — please call for a custom quote`
    : !meetsSettingsMinQty || !screenResult
    ? `Minimum ${gridMin} pcs required for screen printing`
    : `Order total doesn't meet the $${(settings.screen_print_min_order || 150).toFixed(0)} screen print minimum`

  return {
    method: 'DTF (Direct-to-Film)',
    subtotal: dtfSubtotal,
    setupFee: 0,
    total: dtfSubtotal,
    pricePerShirt: dtfSubtotal / totalQty,
    tier: dtfTier,
    totalQty,
    switchReason,
  }
}

export function buildSizeBreakdown(quantities, garment, inkColorsPerLocation, printLocations, pricingData, method, tier, printCostPerShirt) {
  const { sizeUpcharges } = pricingData
  const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

  return SIZES
    .filter(s => quantities[s] > 0)
    .map(size => {
      const qty = quantities[size]
      const upcharge = sizeUpcharges[size] || 0
      const printCost = method === 'Screen Print'
        ? printCostPerShirt
        : tier.price_per_location * printLocations.length

      const unitPrice = garment.base_price + upcharge + printCost
      return { size, qty, unitPrice, lineTotal: qty * unitPrice, upcharge }
    })
}
