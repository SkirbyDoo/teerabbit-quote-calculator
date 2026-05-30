import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { SHEET_ID, SHEET_NAMES, sheetUrl, SETTINGS_OVERRIDES } from '../config'
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

          settings: (() => {
            // gviz uses the sheet's row 1 as CSV column headers. If A1/B1 are
            // multi-line cells, gviz collapses each cell's lines into one
            // space-separated string, giving garbled column names like
            // "key business_name contact_email contact_phone" instead of "key".
            //
            // We handle BOTH the clean format and the garbled format:
            //   Clean   → columns are named "key" and "value"
            //   Garbled → columns are named with space-joined cell contents

            const colNames = rawSettings.length > 0 ? Object.keys(rawSettings[0]) : []
            const keyColName = colNames[0] ?? 'key'
            const valColName = colNames[1] ?? 'value'
            const isGarbled  = keyColName !== 'key' || valColName !== 'value'

            // ── 1. Parse every data row using actual column names (by index) ──
            const fromRows = Object.fromEntries(
              rawSettings
                .filter(r => {
                  const k = (r[keyColName] ?? '').toString().trim()
                  return k.length > 0 && k.length < 80 && !k.startsWith('Important')
                })
                .map(r => {
                  const rawKey = r[keyColName].trim()
                  const raw    = (r[valColName] ?? '').toString().trim()
                  const num    = Number(raw)
                  return [rawKey, raw === '' ? '' : isNaN(num) ? raw : num]
                })
            )

            // ── 2. If garbled, recover text settings from the column names ──
            // The garbled column name encodes: "key business_name contact_email …"
            // The garbled value  name encodes: "value Your Shop Name me@… 123-…"
            const fromHeader = {}
            if (isGarbled) {
              const hKeys = keyColName.split(/\s+/)
                .filter(t => /^[a-z][a-z0-9_]*$/.test(t) && t !== 'key')
              const hVals = valColName.split(/\s+/).filter(t => t !== 'value')

              const emailVal = hVals.find(t => /@/.test(t)) || ''
              const phoneVal = hVals.find(t => /^\+?[\d][\d\-\.\(\)]{5,}$/.test(t)) || ''
              const used     = new Set([emailVal, phoneVal].filter(Boolean))
              const bizName  = hVals.filter(t => !used.has(t)).join(' ')

              for (const key of hKeys) {
                if      (key === 'contact_email') fromHeader[key] = emailVal
                else if (key === 'contact_phone') fromHeader[key] = phoneVal
                else if (key === 'business_name') fromHeader[key] = bizName
              }
            }

            // fromRows wins over fromHeader (in case user already fixed some rows)
            const fromSheet = { ...fromHeader, ...fromRows }

            const merged = { ...fromSheet }
            Object.entries(SETTINGS_OVERRIDES).forEach(([k, v]) => {
              if (v !== '' && v != null && (merged[k] === '' || merged[k] == null)) {
                merged[k] = v
              }
            })
            return merged
          })(),
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
