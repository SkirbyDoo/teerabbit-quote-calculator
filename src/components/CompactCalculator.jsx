import { useState, useMemo } from 'react'
import { calculateBatchQuote } from '../utils/calculator'

const TYPE_ORDER   = ['T-Shirt', 'Hoodie', 'Tank Top', 'Long Sleeve', 'Crewneck', 'Polo']
const GENDER_ORDER = ['Unisex', "Women's", 'Youth', 'Kids']
const TIER_ORDER   = ['Budget', 'Standard', 'Premium']

const LOCATIONS = [
  { id: 'front',        label: 'Front' },
  { id: 'back',         label: 'Back'  },
  { id: 'left_sleeve',  label: 'L.Slv' },
  { id: 'right_sleeve', label: 'R.Slv' },
]

function sortByOrder(arr, order) {
  return [...arr].sort((a, b) => {
    const ai = order.indexOf(a), bi = order.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1; if (bi === -1) return -1
    return ai - bi
  })
}
function unique(arr) { return [...new Set(arr.filter(Boolean))] }

function Divider() { return <div className="border-t border-gray-100" /> }

function SectionLabel({ n, label, right }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 text-[10px] font-extrabold flex items-center justify-center shrink-0">
          {n}
        </span>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
      {right}
    </div>
  )
}

export default function CompactCalculator({
  garments,
  designs,
  activeDesignId,
  pricingData,
  onAddBatch,
  onRemoveBatch,
  onLocationsChange,
  onColorsChange,
  onGetQuote,
  onSelectDesign,
  onAddDesign,
  onDeleteDesign,
  readyForQuote,
  belowMinDesigns = [],
  minQty = 36,
  onExpand,          // opens full view
  businessName,
}) {
  const [type,     setType]     = useState(null)
  const [gender,   setGender]   = useState(null)
  const [tier,     setTier]     = useState(null)
  const [selected, setSelected] = useState(null)
  const [qty,      setQty]      = useState('36')

  const activeDesign = designs.find(d => d.id === activeDesignId) || designs[0]
  const { printLocations, inkColorsPerLocation, batches } = activeDesign

  // ── Filter derivation ──────────────────────────────────────────────────────
  const availableTypes = useMemo(() =>
    sortByOrder(unique(garments.map(g => g.apparel_type)), TYPE_ORDER), [garments])

  const availableGenders = useMemo(() =>
    sortByOrder(unique(
      garments.filter(g => !type || g.apparel_type === type).map(g => g.gender)
    ), GENDER_ORDER), [garments, type])

  const availableTiers = useMemo(() =>
    sortByOrder(unique(
      garments
        .filter(g => (!type || g.apparel_type === type) && (!gender || g.gender === gender))
        .map(g => g.tier)
    ), TIER_ORDER), [garments, type, gender])

  const filtered = useMemo(() =>
    garments.filter(g =>
      (!type   || g.apparel_type === type) &&
      (!gender || g.gender === gender) &&
      (!tier   || g.tier === tier)
    ), [garments, type, gender, tier])

  const activeGarment = useMemo(() => {
    if (selected && filtered.find(g => g.id === selected.id)) return selected
    if (filtered.length === 1) return filtered[0]
    return null
  }, [filtered, selected])

  // ── Qty ────────────────────────────────────────────────────────────────────
  const pendingQty  = parseInt(qty) || 0
  const sliderValue = Math.min(Math.max(pendingQty || minQty, minQty), 999)
  const canAdd      = activeGarment && pendingQty >= minQty

  function step(delta) {
    setQty(q => String(Math.min(999, Math.max(minQty, (parseInt(q) || minQty) + delta))))
  }

  // ── Live pricing ───────────────────────────────────────────────────────────
  const previewBatches = useMemo(() => {
    if (activeGarment && pendingQty > 0)
      return [...batches, { id: '__preview__', garment: activeGarment, qty: pendingQty }]
    return batches
  }, [batches, activeGarment, pendingQty])

  const liveQuote = useMemo(() => {
    if (!previewBatches.length || !printLocations.length) return null
    return calculateBatchQuote({ batches: previewBatches, printLocations, inkColorsPerLocation, pricingData })
  }, [previewBatches, printLocations, inkColorsPerLocation, pricingData])

  // ── Grand total across ALL confirmed designs ───────────────────────────────
  const allConfirmedQuotes = useMemo(() =>
    designs.map(d => ({
      id: d.id,
      name: d.name,
      quote: (d.batches.length && d.printLocations.length)
        ? calculateBatchQuote({
            batches: d.batches,
            printLocations: d.printLocations,
            inkColorsPerLocation: d.inkColorsPerLocation,
            pricingData,
          })
        : null,
    }))
  , [designs, pricingData])

  const confirmedGrandTotal = useMemo(() =>
    allConfirmedQuotes.reduce((sum, dq) => dq.quote ? sum + dq.quote.total : sum, 0)
  , [allConfirmedQuotes])

  const quotedDesignCount = allConfirmedQuotes.filter(dq => dq.quote).length

  // ── Handlers ───────────────────────────────────────────────────────────────
  function toggleLocation(id) {
    if (batches.length > 0) return
    printLocations.includes(id)
      ? onLocationsChange(printLocations.filter(l => l !== id))
      : onLocationsChange([...printLocations, id])
  }

  function adjustColors(locId, delta) {
    if (batches.length > 0) return
    const c = inkColorsPerLocation?.[locId] || 1
    onColorsChange(locId, Math.min(13, Math.max(1, c + delta)))
  }

  function handleAdd() {
    if (!canAdd) return
    onAddBatch({ type: activeGarment.apparel_type, gender: activeGarment.gender,
      tier: activeGarment.tier, garment: activeGarment, qty: pendingQty, id: Date.now() })
    setType(null); setGender(null); setTier(null); setSelected(null); setQty('36')
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col"
      style={{ width: 300, minWidth: 300, maxWidth: 300, height: 500, overflow: 'hidden' }}
    >

      {/* ── Mini design tabs + expand ── */}
      {/* Outer row: flex with Expand pinned to the right, never scrolling away */}
      <div className="flex items-center border-b border-gray-100 shrink-0 pl-2 pr-1 pt-2 pb-1.5">

        {/* Scrollable tabs + New — takes remaining width, scrolls internally */}
        <div className="flex items-center gap-1 flex-1 min-w-0" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
          {designs.map(d => {
            const isActive = d.id === activeDesignId
            const qty      = d.batches.reduce((s, b) => s + b.qty, 0)
            return (
              <div
                key={d.id}
                className={`flex items-center rounded-lg border shrink-0 transition-colors
                  ${isActive ? 'border-brand-500 bg-brand-500' : 'border-gray-200 bg-white hover:border-brand-300'}`}
              >
                <button
                  onClick={() => onSelectDesign(d.id)}
                  className="pl-2 pr-1 py-1 flex items-center gap-1"
                >
                  <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-600'}`}>
                    {d.name}
                  </span>
                  {qty > 0 && (
                    <span className={`text-[10px] ${isActive ? 'text-brand-100' : 'text-gray-400'}`}>
                      {qty}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onDeleteDesign(d.id)}
                  className={`mr-1 w-4 h-4 rounded-full flex items-center justify-center transition-colors
                    ${isActive ? 'text-white/70 hover:bg-white/20' : 'text-gray-300 hover:text-red-400'}`}
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}

          {/* Add design */}
          <button
            onClick={onAddDesign}
            className="shrink-0 px-2 py-1 rounded-lg text-xs font-semibold border border-dashed border-gray-200 text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
          >
            + New
          </button>
        </div>

        {/* Expand — always visible, never scrolls away */}
        <button
          onClick={onExpand}
          className="shrink-0 ml-1 flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-brand-600 border border-gray-200 rounded-lg px-2 py-1 hover:border-brand-300 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
          </svg>
          Expand
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">

        {/* Step 1 — Garment */}
        <div className="px-3 pt-2.5 pb-2">
          <SectionLabel n="1" label="Select Garment" />

          <div className="grid grid-cols-3 gap-1 mb-2">
            {[
              { label: 'Type',    value: type,   opts: availableTypes,   set: v => { setType(v); setGender(null); setTier(null); setSelected(null) } },
              { label: 'Style',   value: gender, opts: availableGenders, set: v => { setGender(v); setTier(null); setSelected(null) } },
              { label: 'Quality', value: tier,   opts: availableTiers,   set: v => { setTier(v); setSelected(null) } },
            ].map(({ label, value, opts, set }) => (
              <select
                key={label}
                value={value || ''}
                onChange={e => set(e.target.value || null)}
                className="text-xs border border-gray-200 rounded-lg px-1.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-brand-400 cursor-pointer"
              >
                <option value="">{label}</option>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden" style={{ maxHeight: 108 }}>
            <div className="overflow-y-auto overflow-x-hidden" style={{ maxHeight: 108 }}>
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">No matches</p>
              ) : filtered.map(g => {
                const isSel = activeGarment?.id === g.id
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelected(g)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left border-b border-gray-100 last:border-0 transition-colors
                      ${isSel ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="text-xs font-medium truncate flex-1 mr-2">{g.name}</span>
                    <span className="text-xs font-bold shrink-0 tabular-nums">${g.base_price.toFixed(2)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <Divider />

        {/* Step 2 — Quantity (compact inline stepper) */}
        <div className="px-3 py-2.5">
          <SectionLabel n="2" label="Quantity" />
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => step(-12)}
              className="w-7 h-7 rounded-lg border-2 border-gray-200 text-gray-500 font-bold hover:border-brand-400 hover:text-brand-600 flex items-center justify-center shrink-0 transition-colors"
            >−</button>
            <input
              type="number"
              min={minQty}
              value={qty}
              onChange={e => setQty(e.target.value)}
              className="w-16 text-center text-sm font-extrabold text-gray-900 border border-gray-200 rounded-lg py-1 focus:outline-none focus:border-brand-400 tabular-nums"
            />
            <button
              onClick={() => step(+12)}
              className="w-7 h-7 rounded-lg border-2 border-gray-200 text-gray-500 font-bold hover:border-brand-400 hover:text-brand-600 flex items-center justify-center shrink-0 transition-colors"
            >+</button>
          </div>
          <input
            type="range" min={minQty} max="999" step="1"
            value={sliderValue}
            onChange={e => setQty(e.target.value)}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-brand-500 bg-gray-200 mt-2"
          />
          <p className="text-[10px] text-gray-400 text-center mt-0.5">{minQty} pc minimum</p>
        </div>

        <Divider />

        {/* Step 3 — Print */}
        <div className="px-3 py-2.5">
          <SectionLabel
            n="3"
            label="Print Details"
            right={batches.length > 0 && (
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Locked</span>
            )}
          />

          <div className="flex gap-1 mb-2">
            {LOCATIONS.map(loc => {
              const on     = printLocations.includes(loc.id)
              const locked = batches.length > 0
              return (
                <button
                  key={loc.id}
                  onClick={() => toggleLocation(loc.id)}
                  disabled={locked}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-semibold border-2 transition-colors
                    ${locked
                      ? on ? 'border-brand-400 bg-brand-400 text-white opacity-60 cursor-default'
                           : 'border-gray-100 bg-gray-50 text-gray-300 cursor-default'
                      : on ? 'border-brand-500 bg-brand-500 text-white'
                           : 'border-gray-200 bg-white text-gray-500 hover:border-brand-300 hover:text-brand-600'
                    }`}
                >
                  {loc.label}
                </button>
              )
            })}
          </div>

          {printLocations.length > 0 ? (
            <div className="space-y-1">
              {printLocations.map(locId => {
                const locLabel = LOCATIONS.find(l => l.id === locId)?.label || locId
                const count    = inkColorsPerLocation?.[locId] || 1
                const locked   = batches.length > 0
                return (
                  <div key={locId} className="flex items-center justify-between bg-gray-50 rounded-lg px-2.5 py-1">
                    <span className="text-xs text-gray-600 font-medium">{locLabel}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustColors(locId, -1)}
                        disabled={locked || count <= 1}
                        className={`w-5 h-5 rounded border text-xs font-bold flex items-center justify-center transition-colors
                          ${locked || count <= 1
                            ? 'border-gray-100 text-gray-300 cursor-default'
                            : 'border-gray-200 text-gray-500 hover:border-brand-400 hover:text-brand-500'}`}
                      >−</button>
                      <span className="text-xs font-bold text-gray-800 w-5 text-center tabular-nums">{count}c</span>
                      <button
                        onClick={() => adjustColors(locId, +1)}
                        disabled={locked || count >= 13}
                        className={`w-5 h-5 rounded border text-xs font-bold flex items-center justify-center transition-colors
                          ${locked || count >= 13
                            ? 'border-gray-100 text-gray-300 cursor-default'
                            : 'border-gray-200 text-gray-500 hover:border-brand-400 hover:text-brand-500'}`}
                      >+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
              Select at least one print location
            </p>
          )}
        </div>

        {/* Add to batch */}
        <div className="px-3 pb-2">
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-colors
              ${canAdd
                ? 'bg-gray-800 hover:bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {batches.length === 0 ? '+ Add Garments' : '+ Add to Batch'}
          </button>
        </div>

        {/* ── Order summary (per active design) ── */}
        {batches.length > 0 && (
          <>
            <Divider />
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">This Design</p>
                <p className="text-[10px] text-gray-400 tabular-nums">
                  {batches.reduce((s, b) => s + b.qty, 0)} pc
                </p>
              </div>
              <div className="space-y-1">
                {batches.map(b => (
                  <div key={b.id} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1.5">
                    <span className="text-xs text-gray-700 font-medium truncate flex-1">{b.garment.name}</span>
                    <span className="text-xs font-bold text-brand-600 tabular-nums shrink-0">{b.qty}×</span>
                    <button
                      onClick={() => onRemoveBatch(b.id)}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>

      {/* ── Sticky footer ── */}
      <div className="border-t border-gray-100 bg-gray-50/80 px-3 py-2 shrink-0">
        {liveQuote && !liveQuote.belowMinimum ? (
          <div className="mb-2 space-y-1">
            {/* Per piece + this design subtotal */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-gray-400 leading-none">Per piece</p>
                <p className="text-lg font-extrabold text-gray-900 leading-tight tabular-nums">
                  ${liveQuote.pricePerShirt.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 leading-none">
                  {quotedDesignCount > 1 ? activeDesign.name : 'Subtotal'}
                </p>
                <p className="text-sm font-bold text-brand-600 tabular-nums">${liveQuote.total.toFixed(2)}</p>
              </div>
            </div>
            {/* Grand total row — only when 2+ designs have confirmed batches */}
            {quotedDesignCount > 1 && (
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                  {quotedDesignCount} designs · order total
                </p>
                <p className="text-sm font-extrabold text-gray-900 tabular-nums">
                  ${confirmedGrandTotal.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        ) : liveQuote?.belowMinimum ? (
          <p className="text-[10px] text-red-500 mb-2 text-center font-semibold">
            {liveQuote.minQty - liveQuote.totalQty} more pcs needed to meet minimum
          </p>
        ) : (
          <p className="text-[10px] text-gray-400 mb-2 text-center">
            {!printLocations.length ? 'Select a print location above' : 'Choose a garment + quantity'}
          </p>
        )}
        <button
          onClick={onGetQuote}
          disabled={!readyForQuote || belowMinDesigns.length > 0}
          className={`w-full py-2 rounded-xl text-sm font-bold transition-colors
            ${readyForQuote && belowMinDesigns.length === 0
              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          Get My Quote →
        </button>
      </div>

    </div>
  )
}
