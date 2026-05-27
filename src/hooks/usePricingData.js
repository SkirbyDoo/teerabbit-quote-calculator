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

        // Normalise all keys — trim whitespace from column names (e.g. " tier " → "tier")
        const normaliseRow = row =>
          Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim(), typeof v === 'string' ? v.trim() : v]))

        const normGarments = rawGarments.map(normaliseRow)

        setData({
          garments: normGarments
            // Drop blank rows (no name) and inactive rows (live === "FALSE")
            .filter(g => g.name && g.name !== '' && g.live !== 'FALSE')
            .map(g => ({
              ...g,
              base_price: parseFloat(g.base_price) || 0,
              // Support both old (category) and new (tier) column names
              tier: brandRules[g.brand?.trim().toLowerCase()] || g.tier || g.category,
              // Normalize apparel_type to canonical values
              apparel_type: (function(raw) {
                const v = (raw || '').trim()
                if (!v || v === 'Shirts' || v === 'T-Shirts' || v === 'T-Shirt') return 'T-Shirt'
                if (v === 'Hoodie' || v === 'Hoodies') return 'Hoodie'
                if (v === 'Tank Top' || v === 'Tank Tops' || v === 'Tank') return 'Tank Top'
                return v
              })(g.apparel_type),
              // gender column — may not exist in older sheets
              gender: g.gender || 'Unisex',
            })),

          screenTiers: parseScreenTiers(rawScreen),

          settings: Object.fromEntries(
            rawSettings.filter(r => r.key).map(r => {
              const raw = (r.value ?? '').toString().trim()
              const num = parseFloat(raw)
              // Keep string values (e.g. phone numbers) as strings, parse numbers
              return [r.key.trim(), isNaN(num) ? raw : num]
            })
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
