import { useState, useMemo } from 'react'
import { calculateBatchQuote } from '../utils/calculator'

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPE_ORDER   = ['T-Shirt', 'Hoodie', 'Tank Top', 'Long Sleeve', 'Crewneck', 'Polo']
const GENDER_ORDER = ['Unisex', "Women's", 'Youth', 'Kids']
const TIER_ORDER   = ['Budget', 'Standard', 'Premium']

const LOCATIONS = [
  { id: 'front',        label: 'Front' },
  { id: 'back',         label: 'Back' },
  { id: 'left_sleeve',  label: 'Left Sleeve' },
  { id: 'right_sleeve', label: 'Right Sleeve' },
]

const TIER_BADGE = {
  Budget:   'bg-green-50 text-green-700',
  Standard: 'bg-blue-50 text-blue-700',
  Premium:  'bg-brand-50 text-brand-700',
}

const QTY_MIN = 12
const QTY_MAX = 1000

// ── Helpers ───────────────────────────────────────────────────────────────────
function sortByOrder(values, order) {
  return [...values].sort((a, b) => {
    const ai = order.indexOf(a), bi = order.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

function unique(arr) { return [...new Set(arr.filter(Boolean))] }

function FilterBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all duration-100
        ${active
          ? 'border-brand-500 bg-brand-500 text-white'
          : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600'
        }`}
    >
      {label}
    </button>
  )
}

function StepLabel({ n, label }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-sm flex items-center justify-center font-extrabold flex-shrink-0">
        {n}
      </span>
      <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">{label}</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OrderBuilder({
  garments,
  activeDesign,
  pricingData,
  onAddBatch,
  onRemoveBatch,
  onLocationsChange,
  onColorsChange,
  onGetQuote,
  readyForQuote,
}) {
  const [type,     setType]     = useState(null)
  const [gender,   setGender]   = useState(null)
  const [tier,     setTier]     = useState(null)
  const [selected, setSelected] = useState(null)
  const [qty,      setQty]      = useState('36')   // start at minimum

  const { printLocations, inkColorsPerLocation, batches } = activeDesign

  // Phone number for large-order notice
  const phoneNumber = pricingData?.settings?.contact_phone

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

  // ── Quantity helpers ───────────────────────────────────────────────────────
  const pendingQty  = parseInt(qty) || 0
  const sliderValue = Math.min(Math.max(pendingQty || 36, QTY_MIN), QTY_MAX)
  const isLargeOrder = pendingQty >= QTY_MAX

  // ── Live pricing ───────────────────────────────────────────────────────────
  const previewBatches = useMemo(() => {
    if (activeGarment && pendingQty > 0) {
      return [...batches, { id: '__preview__', garment: activeGarment, qty: pendingQty }]
    }
    return batches
  }, [batches, activeGarment, pendingQty])

  const liveQuote = useMemo(() => {
    if (!previewBatches.length || !printLocations.length) return null
    return calculateBatchQuote({
      batches: previewBatches,
      printLocations,
      inkColorsPerLocation,
      pricingData,
    })
  }, [previewBatches, printLocations, inkColorsPerLocation, pricingData])

  // ── Handlers ───────────────────────────────────────────────────────────────
  function pickType(t)   { setType(p => p === t ? null : t); setGender(null); setTier(null); setSelected(null) }
  function pickGender(g) { setGender(p => p === g ? null : g); setTier(null); setSelected(null) }
  function pickTier(t)   { setTier(p => p === t ? null : t); setSelected(null) }

  function handleAdd() {
    if (!activeGarment || pendingQty < 12) return
    onAddBatch({
      type:    activeGarment.apparel_type,
      gender:  activeGarment.gender,
      tier:    activeGarment.tier,
      garment: activeGarment,
      qty:     pendingQty,
      id:      Date.now(),
    })
    // Reset everything so the form is clearly ready for the next garment group
    setType(null)
    setGender(null)
    setTier(null)
    setSelected(null)
    setQty('36')
  }

  function toggleLocation(id) {
    printLocations.includes(id)
      ? onLocationsChange(printLocations.filter(l => l !== id))
      : onLocationsChange([...printLocations, id])
  }

  function adjustColors(locId, delta) {
    const current = inkColorsPerLocation?.[locId] || 1
    onColorsChange(locId, Math.min(13, Math.max(1, current + delta)))
  }

  const canAdd = activeGarment && pendingQty >= 12

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Card header ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Build Your Order</h2>
        <span className="ml-auto text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
          {activeDesign.name}
        </span>
      </div>

      {/* ── Two-column body ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

        {/* ════ LEFT — Step 1: Select Apparel ════ */}
        <div className="p-4 space-y-4">

          <StepLabel n="1" label="Select Apparel" />

          {/* Progressive filters */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Type</p>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map(t => (
                  <FilterBtn key={t} label={t} active={type === t} onClick={() => pickType(t)} />
                ))}
              </div>
            </div>

            {type && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Style</p>
                <div className="flex flex-wrap gap-2">
                  {availableGenders.map(g => (
                    <FilterBtn key={g} label={g} active={gender === g} onClick={() => pickGender(g)} />
                  ))}
                </div>
              </div>
            )}

            {type && gender && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quality</p>
                <div className="flex flex-wrap gap-2">
                  {availableTiers.map(t => (
                    <FilterBtn key={t} label={t} active={tier === t} onClick={() => pickTier(t)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Garment card list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {type ? 'Choose Garment' : 'All Garments'}
              </p>
              <span className="text-xs text-gray-400">
                {filtered.length} option{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-5 text-sm text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                No garments match — try adjusting your filters.
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {filtered.map(g => {
                  const isSel = activeGarment?.id === g.id
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelected(g)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all duration-100
                        ${isSel
                          ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500/20'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSel ? 'text-brand-700' : 'text-gray-800'}`}>
                          {g.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {g.brand} · <span className="font-mono">{g.id}</span>
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
                        ${TIER_BADGE[g.tier] || 'bg-gray-100 text-gray-600'}`}>
                        {g.tier}
                      </span>
                      <span className={`text-sm font-bold flex-shrink-0 tabular-nums
                        ${isSel ? 'text-brand-600' : 'text-gray-700'}`}>
                        ${g.base_price.toFixed(2)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* In This Design */}
          {batches.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">In This Design</p>
              <div className="flex flex-col gap-1.5">
                {batches.map(b => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{b.garment.name}</p>
                      <p className="text-xs text-gray-400">
                        {b.qty} pc{b.qty !== 1 ? 's' : ''} · ${b.garment.base_price.toFixed(2)} blank
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveBatch(b.id)}
                      title="Remove"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ════ RIGHT — Steps 2 & 3 ════ */}
        <div className="p-4 flex flex-col gap-4">

          {/* ── Step 2: Quantity ── */}
          <div>
            <StepLabel n="2" label="Select Quantity" />

            {/* Selected garment chip */}
            {activeGarment ? (
              <div className="bg-brand-50 rounded-lg px-3 py-2 mb-3 border border-brand-100">
                <p className="text-sm font-semibold text-brand-800 truncate">{activeGarment.name}</p>
                <p className="text-xs text-brand-500">${activeGarment.base_price.toFixed(2)} blank</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 border border-dashed border-gray-200">
                <p className="text-sm text-gray-400">← Select a garment first</p>
              </div>
            )}

            {/* Slider */}
            <div className="mb-3">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xs text-gray-400 tabular-nums">{QTY_MIN}</span>
                <span className={`text-2xl font-extrabold tabular-nums leading-none
                  ${isLargeOrder ? 'text-amber-600' : 'text-gray-900'}`}>
                  {pendingQty > 0 ? pendingQty.toLocaleString() : '36'}
                  {isLargeOrder && '+'}
                </span>
                <span className="text-xs text-gray-400 tabular-nums">{QTY_MAX.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={QTY_MIN}
                max={QTY_MAX}
                step="1"
                value={sliderValue}
                onChange={e => setQty(e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-500
                           bg-gray-200"
              />
              <p className="text-xs text-gray-300 mt-1">36 pc minimum</p>
            </div>

            {/* Large-order callout */}
            {isLargeOrder && (
              <div className="mb-3 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Large order? Let's talk!</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    For 1,000+ pieces we offer custom pricing.
                    {phoneNumber
                      ? <> Call us: <a href={`tel:${phoneNumber}`} className="font-bold underline">{phoneNumber}</a></>
                      : <> Contact us for a custom quote.</>
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Exact qty input */}
            <input
              type="number"
              min="12"
              placeholder="e.g. 48"
              value={qty}
              onChange={e => setQty(e.target.value)}
              className="qty-input w-full"
            />
            {pendingQty > 0 && pendingQty < 12 && (
              <p className="text-xs text-amber-600 mt-1.5">Minimum 12 garments per group</p>
            )}
          </div>

          {/* ── Step 3: Print Details ── */}
          <div>
            <StepLabel n="3" label="Print Details" />

            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">Location(s)</p>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map(loc => {
                  const on = printLocations.includes(loc.id)
                  return (
                    <button
                      key={loc.id}
                      onClick={() => toggleLocation(loc.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all duration-100
                        ${on
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600'
                        }`}
                    >
                      {loc.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {printLocations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Ink colors (per location)</p>
                {printLocations.map(locId => {
                  const locLabel = LOCATIONS.find(l => l.id === locId)?.label || locId
                  const count = inkColorsPerLocation?.[locId] || 1
                  return (
                    <div
                      key={locId}
                      className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"
                    >
                      <span className="text-xs font-medium text-gray-700 flex-1 min-w-0 truncate">{locLabel}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => adjustColors(locId, -1)}
                          disabled={count <= 1}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors
                            ${count <= 1
                              ? 'border-gray-100 text-gray-200 cursor-default'
                              : 'border-gray-200 text-gray-500 hover:border-brand-500 hover:text-brand-500'
                            }`}
                        >−</button>
                        <span className="text-sm font-bold text-gray-800 w-5 text-center tabular-nums">{count}</span>
                        <button
                          onClick={() => adjustColors(locId, +1)}
                          disabled={count >= 13}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors
                            ${count >= 13
                              ? 'border-gray-100 text-gray-200 cursor-default'
                              : 'border-gray-200 text-gray-500 hover:border-brand-500 hover:text-brand-500'
                            }`}
                        >+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {printLocations.length === 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                Select at least one print location.
              </p>
            )}
          </div>

          {/* ── Add Garments / Add to Batch button ── */}
          <div>
            {activeGarment && pendingQty > 0 && pendingQty < 12 && (
              <p className="text-xs text-amber-600 mb-2">Minimum 12 garments per group</p>
            )}
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-150
                ${canAdd
                  ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {batches.length === 0 ? 'Add Garments' : 'Add to Batch'}
            </button>
            {canAdd && (
              <p className="text-xs text-gray-400 text-center mt-1">
                {batches.length === 0
                  ? `Starts batch for ${activeDesign.name} · ${activeGarment?.name} × ${pendingQty}`
                  : `Adds ${activeGarment?.name} × ${pendingQty} to ${activeDesign.name}'s batch`
                }
              </p>
            )}
          </div>

          {/* ── Live price panel ── */}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex flex-col gap-3">
              {liveQuote ? (
                <>
                  <div className="text-center pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-400 mb-0.5">Per piece</p>
                    <p className="text-3xl font-extrabold text-gray-900 tabular-nums leading-none">
                      ${liveQuote.pricePerShirt.toFixed(2)}
                    </p>
                    {liveQuote.belowMinimum && (
                      <p className="text-xs text-amber-600 mt-1.5">
                        * estimated at {liveQuote.minQty}-pc minimum pricing
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Garments + print</span>
                      <span className="tabular-nums">${liveQuote.subtotal.toFixed(2)}</span>
                    </div>
                    {liveQuote.setupFee > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span className="text-xs self-center">Screen setup</span>
                        <span className="tabular-nums">${liveQuote.setupFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-200">
                      <span>Subtotal</span>
                      <span className="tabular-nums text-brand-600">${liveQuote.total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {liveQuote.totalQty} piece{liveQuote.totalQty !== 1 ? 's' : ''}
                      {liveQuote.belowMinimum
                        ? ` · needs ${liveQuote.minQty - liveQuote.totalQty} more to meet ${liveQuote.minQty}-pc minimum`
                        : ' · ✓ meets minimum'
                      }
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-gray-400">
                    {!printLocations.length
                      ? 'Select a print location above'
                      : 'Select a garment and quantity'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ════ Step 4: Submit Quote — full-width footer ════ */}
      <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/60">
        <StepLabel n="4" label="Submit Quote" />
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            {readyForQuote ? (
              <p className="text-sm text-gray-500">
                Get Quote · enter your details to receive your full estimate and breakdown
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Add at least one garment with a print location to continue
              </p>
            )}
          </div>
          <button
            onClick={onGetQuote}
            disabled={!readyForQuote}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-150 flex-shrink-0
              ${readyForQuote
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            Get My Quote →
          </button>
        </div>
      </div>

    </div>
  )
}
