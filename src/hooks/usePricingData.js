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
      complete: r => resolve(r.data),
      error: reject,
    })
  })
}

// Parse the color × qty screen print grid
// Header: "Colors" | "" | "36" | "48" | ... | "5000"
// Rows:   "1 Color" | "" | "$5.78" | ...
function parseScreenTiers(rows) {
  if (!rows.length) return { quantities: [], prices: {} }
  const qtyHeaders = Object.keys(rows[0]).filter(h => /^\d+$/.test(h.trim()) && parseInt(h) > 0)
  const prices = {}

  rows.forEach(row => {
    const colorNum = parseInt(row['Colors'] || row['colors'] || '')
    if (isNaN(colorNum) || colorNum < 1) return
    prices[colorNum] = qtyHeaders.map(h => parseFloat((row[h] || '').replace(/[$,\s]/g, '')) || 0)
  })

  // Drop columns where all prices are 0 (e.g. blank 10000 column)
  const validIdx = qtyHeaders
    .map((h, i) => ({ h, i }))
    .filter(({ i }) => Object.values(prices).some(row => row[i] > 0))

  return {
    quantities: validIdx.map(({ h }) => parseInt(h)),
    prices: Object.fromEntries(
      Object.entries(prices).map(([c, row]) => [parseInt(c), validIdx.map(({ i }) => row[i])])
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
        const [rawGarments, rawScreen, rawSettings, rawBrandRules] = await Promise.all([
          fetchSheet(SHEET_NAMES.garments),
          fetchSheet(SHEET_NAMES.screenTiers),
          fetchSheet(SHEET_NAMES.settings),
          fetchSheet(SHEET_NAMES.brandRules),
        ])

        // Brand rules: brand → forced tier
        const brandRules = Object.fromEntries(
          rawBrandRules
            .filter(r => r.brand_or_style && r.forced_category)
            .map(r => [r.brand_or_style.trim().toLowerCase(), r.forced_category.trim()])
        )

        setData({
          garments: rawGarments.map(g => ({
            ...g,
            base_price: parseFloat(g.base_price) || 0,
            // Support both old (category) and new (tier) column names
            tier: brandRules[g.brand?.trim().toLowerCase()] || g.tier || g.category,
            // Support both old (Shirts) and new (T-Shirt/Hoodie/Tank Top) apparel_type
            apparel_type: g.apparel_type === 'Shirts' ? 'T-Shirt' : (g.apparel_type || 'T-Shirt'),
            // gender column — may not exist in older sheets
            gender: g.gender || 'Unisex',
          })),

          screenTiers: parseScreenTiers(rawScreen),

          settings: Object.fromEntries(
            rawSettings.filter(r => r.key).map(r => [r.key.trim(), parseFloat(r.value)])
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
