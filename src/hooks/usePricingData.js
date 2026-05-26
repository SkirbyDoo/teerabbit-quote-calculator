import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { SHEET_ID, SHEET_NAMES, sheetUrl } from '../config'
import { DEMO_DATA } from '../utils/demoData'

async function fetchSheet(tabName) {
  const res = await fetch(sheetUrl(tabName))
  if (!res.ok) throw new Error(`Failed to fetch tab "${tabName}" (HTTP ${res.status})`)
  const text = await res.text()
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
      error: reject,
    })
  })
}

// Parse the screen print grid:
// Header: "Colors" | "" | "36" | "48" | "72" | ... | "10000"
// Rows:  "1 Color" | "" | "$5.78" | "$3.75" | ...
// → { quantities: [36,48,...], prices: { 1:[5.78,3.75,...], 2:[...], ... } }
function parseScreenTiers(rows) {
  if (!rows.length) return { quantities: [], prices: {} }

  const allHeaders = Object.keys(rows[0])
  // Keep only headers that are positive integers (qty breakpoints)
  const qtyHeaders = allHeaders.filter(h => /^\d+$/.test(h.trim()) && parseInt(h) > 0)

  const prices = {}
  rows.forEach(row => {
    const colorStr = (row['Colors'] || row['colors'] || '').trim()
    if (!colorStr) return
    const colorNum = parseInt(colorStr) // "1 Color" → 1, "13 Color" → 13
    if (isNaN(colorNum) || colorNum < 1) return

    prices[colorNum] = qtyHeaders.map(h => {
      const raw = (row[h] || '').replace(/[$,\s]/g, '')
      return parseFloat(raw) || 0
    })
  })

  // Drop qty columns where every price is 0 (e.g. blank "10000" column)
  const validIndices = qtyHeaders
    .map((h, i) => ({ h, i }))
    .filter(({ i }) => Object.values(prices).some(row => row[i] > 0))

  return {
    quantities: validIndices.map(({ h }) => parseInt(h)),
    prices: Object.fromEntries(
      Object.entries(prices).map(([color, row]) => [
        parseInt(color),
        validIndices.map(({ i }) => row[i]),
      ])
    ),
  }
}

export function usePricingData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (SHEET_ID === 'DEMO') {
      setData(DEMO_DATA)
      setLoading(false)
      return
    }

    async function load() {
      try {
        const [rawGarments, rawScreen, rawDtf, rawSizes, rawSettings, rawBrandRules] =
          await Promise.all([
            fetchSheet(SHEET_NAMES.garments),
            fetchSheet(SHEET_NAMES.screenTiers),
            fetchSheet(SHEET_NAMES.dtfPricing),
            fetchSheet(SHEET_NAMES.sizeUpcharges),
            fetchSheet(SHEET_NAMES.settings),
            fetchSheet(SHEET_NAMES.brandRules),
          ])

        // Build brand → forced_category lookup from Brand Rules tab
        const brandRules = Object.fromEntries(
          rawBrandRules
            .filter(r => r.brand_or_style && r.forced_category)
            .map(r => [r.brand_or_style.trim().toLowerCase(), r.forced_category.trim()])
        )

        setData({
          // Apply brand rules: override category if the brand has a rule
          garments: rawGarments.map(g => ({
            ...g,
            base_price: parseFloat(g.base_price) || 0,
            category: brandRules[g.brand?.trim().toLowerCase()] || g.category,
          })),

          screenTiers: parseScreenTiers(rawScreen),

          dtfPricing: rawDtf.map(t => ({
            min_qty: parseInt(t.min_qty),
            max_qty: parseInt(t.max_qty),
            price_per_location: parseFloat(t.price_per_location),
          })),

          sizeUpcharges: Object.fromEntries(
            rawSizes.map(r => [r.size?.trim(), parseFloat(r.upcharge) || 0])
          ),

          settings: Object.fromEntries(
            rawSettings
              .filter(r => r.key && r.value !== undefined)
              .map(r => [r.key.trim(), parseFloat(r.value)])
          ),
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { data, loading, error }
}
