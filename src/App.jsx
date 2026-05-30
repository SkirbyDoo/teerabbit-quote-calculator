import { useState, useMemo } from 'react'
import { usePricingData } from './hooks/usePricingData'
import { calculateBatchQuote } from './utils/calculator'
import OrderBuilder from './components/OrderBuilder'
import BatchList from './components/BatchList'
import EmailGate from './components/EmailGate'
import QuoteBreakdown from './components/QuoteBreakdown'
import DesignTabs from './components/DesignTabs'
import CompactCalculator from './components/CompactCalculator'

// createDesign uses a passed-in number so the counter lives in React state
// (avoids the module-level counter being stale after HMR)
function createDesign(num) {
  return {
    id: Date.now() + num,
    name: `Design ${num}`,
    printLocations: ['front'],
    inkColorsPerLocation: { front: 1 },
    batches: [],
  }
}

// ── Widget handoff (compact → full expand) ────────────────────────────────────
// When the compact widget's Expand button is clicked it saves current designs
// to localStorage then opens the full view in a new tab.  The full view reads
// that snapshot once on mount and removes it so it isn't replayed later.
let _handoffCache  // module-level so multiple useState() inits share one read
function _getHandoff() {
  if (_handoffCache === undefined) {
    // Never restore inside the compact widget itself
    const isCompact = new URLSearchParams(window.location.search).has('compact')
    if (isCompact) { _handoffCache = null; return null }
    try {
      const raw = localStorage.getItem('qqc_handoff')
      if (!raw) { _handoffCache = null; return null }
      localStorage.removeItem('qqc_handoff') // consume immediately
      _handoffCache = JSON.parse(raw)
    } catch { _handoffCache = null }
  }
  return _handoffCache
}

export default function App() {
  const { data, loading, error } = usePricingData()

  // ?compact in the URL = standalone popup mode (no header, just the widget)
  const isEmbedMode = new URLSearchParams(window.location.search).has('compact')

  const [designs,        setDesigns]        = useState(() => {
    const h = _getHandoff()
    return h?.designs?.length ? h.designs : [createDesign(1)]
  })
  const [activeDesignId, setActiveDesignId]  = useState(() => {
    const h = _getHandoff()
    if (h?.activeDesignId && designs.find(d => d.id === h.activeDesignId)) return h.activeDesignId
    return designs[0].id
  })
  const [nextDesignNum,  setNextDesignNum]   = useState(() => {
    const h = _getHandoff()
    return h?.designs?.length ? h.designs.length + 1 : 2
  })
  const [gateOpen,       setGateOpen]        = useState(false)
  const [customer,       setCustomer]        = useState(null)
  const [compactMode,    setCompactMode]     = useState(false)

  const activeDesign = designs.find(d => d.id === activeDesignId) || designs[0]
  const minQty       = data?.settings?.screen_print_min_qty || 36
  const totalQty     = designs.reduce((sum, d) => sum + d.batches.reduce((s, b) => s + b.qty, 0), 0)

  // Per-design quotes
  const designQuotes = useMemo(() => {
    if (!data) return []
    return designs.map(d => ({
      id: d.id,
      name: d.name,
      printLocations: d.printLocations,
      inkColorsPerLocation: d.inkColorsPerLocation,
      quote: (d.batches.length && d.printLocations.length)
        ? calculateBatchQuote({
            batches: d.batches,
            printLocations: d.printLocations,
            inkColorsPerLocation: d.inkColorsPerLocation,
            pricingData: data,
          })
        : null,
    }))
  }, [designs, data])

  const readyForQuote    = designs.some(d => d.batches.length > 0 && d.printLocations.length > 0)
  const grandTotal       = designQuotes.reduce((sum, dq) => dq.quote ? sum + dq.quote.total : sum, 0)
  const belowMinDesigns  = designs.filter(d => {
    const qty = d.batches.reduce((sum, b) => sum + b.qty, 0)
    return d.batches.length > 0 && qty < minQty
  })

  // ── batch operations ──────────────────────────────────────────────────────
  function addBatch(batch) {
    setDesigns(prev => prev.map(d => {
      if (d.id !== activeDesign.id) return d
      // If same garment already in this batch, combine qty instead of adding a new row
      const existing = d.batches.find(b => b.garment.id === batch.garment.id)
      if (existing) {
        return {
          ...d,
          batches: d.batches.map(b =>
            b.garment.id === batch.garment.id
              ? { ...b, qty: b.qty + batch.qty }
              : b
          ),
        }
      }
      return { ...d, batches: [...d.batches, batch] }
    }))
  }

  function removeBatch(designId, batchId) {
    setDesigns(prev => prev.map(d =>
      d.id === designId
        ? { ...d, batches: d.batches.filter(b => b.id !== batchId) }
        : d
    ))
  }

  // ── design operations ─────────────────────────────────────────────────────
  function addNewDesign() {
    // Always use current count + 1 so number matches position, not a stale counter
    const num = designs.length + 1
    const d = createDesign(num)
    setNextDesignNum(num + 1)
    setDesigns(prev => [...prev, d])
    setActiveDesignId(d.id)
  }

  function deleteDesign(id) {
    const remaining = designs.filter(d => d.id !== id)
    if (!remaining.length) {
      // Last design — reset to a fresh blank Design 1 instead of blocking
      const fresh = createDesign(1)
      setDesigns([fresh])
      setNextDesignNum(2)
      setActiveDesignId(fresh.id)
      return
    }
    // Renumber sequentially so deleting Design 1 promotes Design 2 → Design 1, etc.
    const renumbered = remaining.map((d, i) => ({ ...d, name: `Design ${i + 1}` }))
    setDesigns(renumbered)
    setNextDesignNum(renumbered.length + 1)
    if (activeDesignId === id) setActiveDesignId(renumbered[0].id)
  }

  function switchDesign(id) {
    setActiveDesignId(id)
  }

  // ── print settings for active design ─────────────────────────────────────
  function handleLocationsChange(locs) {
    setDesigns(prev => prev.map(d =>
      d.id === activeDesign.id
        ? {
            ...d,
            printLocations: locs,
            inkColorsPerLocation: Object.fromEntries(
              locs.map(l => [l, d.inkColorsPerLocation[l] || 1])
            ),
          }
        : d
    ))
  }

  function handleColorsChange(loc, count) {
    setDesigns(prev => prev.map(d =>
      d.id === activeDesign.id
        ? { ...d, inkColorsPerLocation: { ...d.inkColorsPerLocation, [loc]: count } }
        : d
    ))
  }

  function handleGateSubmit(result) {
    setGateOpen(false)
    if (result) setCustomer(result)
  }

  // ── loading / error states ────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading pricing…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
        <p className="text-red-700 font-semibold mb-1">Failed to load pricing data</p>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">

      {/* Header — hidden in embed/popup mode */}
      {!isEmbedMode && <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left — shop name */}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight truncate">
              {data.settings?.business_name || 'TeeRabbit'}
            </h1>
            <p className="text-xs text-gray-400 -mt-0.5 hidden sm:block">Screen Print Quote Calculator</p>
          </div>

          {/* Right — contact info + compact toggle */}
          <div className="text-right shrink-0 flex flex-col items-end gap-1">
            <p className="text-xs text-gray-400 hidden sm:block">Screen printing · 36 pc minimum</p>
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              {data.settings?.contact_phone && (
                <a
                  href={`tel:${data.settings.contact_phone}`}
                  className="text-xs font-semibold text-gray-600 hover:text-brand-600 transition-colors"
                >
                  {data.settings.contact_phone}
                </a>
              )}
              {data.settings?.contact_email && (
                <a
                  href={`mailto:${data.settings.contact_email}`}
                  className="hidden sm:inline text-xs font-semibold text-gray-600 hover:text-brand-600 transition-colors"
                >
                  {data.settings.contact_email}
                </a>
              )}
              {/* Compact / Full toggle */}
              <button
                onClick={() => setCompactMode(v => !v)}
                title={compactMode ? 'Full view' : 'Widget preview'}
                className="ml-1 flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-brand-600 transition-colors border border-gray-200 rounded-lg px-2 py-1 hover:border-brand-300"
              >
                {compactMode ? (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                    </svg>
                    Full
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    </svg>
                    Widget
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>}

      {/* ── Compact widget view (preview toggle OR embed URL) ── */}
      {(compactMode || isEmbedMode) && (
        <main className="flex items-start justify-center py-8 px-4 min-h-[calc(100vh-57px)] bg-gray-100">
          <CompactCalculator
            garments={data.garments}
            designs={designs}
            activeDesignId={activeDesignId}
            pricingData={data}
            onAddBatch={addBatch}
            onRemoveBatch={batchId => removeBatch(activeDesign.id, batchId)}
            onLocationsChange={handleLocationsChange}
            onColorsChange={handleColorsChange}
            onGetQuote={() => { setCustomer(null); setGateOpen(true) }}
            onSelectDesign={switchDesign}
            onAddDesign={addNewDesign}
            onDeleteDesign={deleteDesign}
            readyForQuote={readyForQuote}
            belowMinDesigns={belowMinDesigns}
            minQty={minQty}
            onExpand={isEmbedMode
              // In embed mode → hand off state via localStorage, then open full view in a new window
              ? () => {
                  try {
                    localStorage.setItem('qqc_handoff', JSON.stringify({ designs, activeDesignId }))
                  } catch {}
                  window.open(window.location.origin + window.location.pathname, '_blank')
                }
              // In preview toggle → just switch back (React state is preserved)
              : () => setCompactMode(false)
            }
            businessName={data.settings?.business_name}
          />
        </main>
      )}

      {/* ── Full view ── */}
      {!compactMode && !isEmbedMode && <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-3">

        {/* Design tabs — always visible so user can add a new design */}
        <DesignTabs
          designs={designs}
          activeId={activeDesign.id}
          onSelect={switchDesign}
          onAdd={addNewDesign}
          onDelete={deleteDesign}
        />

        {/* Build Your Order */}
        <OrderBuilder
          garments={data.garments}
          activeDesign={activeDesign}
          pricingData={data}
          onAddBatch={addBatch}
          onRemoveBatch={batchId => removeBatch(activeDesign.id, batchId)}
          onLocationsChange={handleLocationsChange}
          onColorsChange={handleColorsChange}
          onGetQuote={() => { setCustomer(null); setGateOpen(true) }}
          readyForQuote={readyForQuote}
          belowMinDesigns={belowMinDesigns}
          minQty={minQty}
        />

        {/* Your Order Summary */}
        <BatchList
          designs={designs}
          activeDesignId={activeDesign.id}
          onRemoveBatch={removeBatch}
          onSwitchDesign={switchDesign}
          grandTotal={grandTotal}
          designQuotes={designQuotes}
        />

        {/* Full breakdown — revealed after email */}
        {customer && designQuotes.some(dq => dq.quote) && (
          <QuoteBreakdown
            designQuotes={designQuotes}
            customer={customer}
          />
        )}

        {/* Tips */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Good to Know</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Order more to save more — higher quantities reduce cost per item',
              'Limit colors per side for best pricing',
              'White garments cost less than colored ones',
              'Extended sizes (XXL+) have additional costs not shown here, but will appear in your full quote',
              'Rush options available — ask us about turnaround times',
              'Tax added at checkout',
            ].map(tip => (
              <div key={tip} className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-brand-400 font-bold mt-0.5 flex-shrink-0">–</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

      </main>}

      {/* Email gate modal */}
      {gateOpen && (
        <EmailGate totalQty={totalQty} minQty={minQty} onSubmit={handleGateSubmit} />
      )}
    </div>
  )
}
