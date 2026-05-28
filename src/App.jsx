import { useState, useMemo } from 'react'
import { usePricingData } from './hooks/usePricingData'
import { calculateBatchQuote } from './utils/calculator'
import OrderBuilder from './components/OrderBuilder'
import BatchList from './components/BatchList'
import EmailGate from './components/EmailGate'
import QuoteBreakdown from './components/QuoteBreakdown'
import DesignTabs from './components/DesignTabs'

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

export default function App() {
  const { data, loading, error } = usePricingData()

  const [designs,        setDesigns]        = useState(() => [createDesign(1)])
  const [activeDesignId, setActiveDesignId]  = useState(() => designs[0].id)
  const [nextDesignNum,  setNextDesignNum]   = useState(2)
  const [gateOpen,       setGateOpen]        = useState(false)
  const [customer,       setCustomer]        = useState(null)

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

  const readyForQuote = designs.some(d => d.batches.length > 0 && d.printLocations.length > 0)
  const grandTotal    = designQuotes.reduce((sum, dq) => dq.quote ? sum + dq.quote.total : sum, 0)

  // ── batch operations ──────────────────────────────────────────────────────
  function addBatch(batch) {
    setDesigns(prev => prev.map(d =>
      d.id === activeDesign.id
        ? { ...d, batches: [...d.batches, batch] }
        : d
    ))
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
    const d = createDesign(nextDesignNum)
    setNextDesignNum(n => n + 1)
    setDesigns(prev => [...prev, d])
    setActiveDesignId(d.id)
  }

  function deleteDesign(id) {
    const remaining = designs.filter(d => d.id !== id)
    if (!remaining.length) return          // safety: never delete the last design
    setDesigns(remaining)
    if (activeDesignId === id) setActiveDesignId(remaining[0].id)
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
    <div className="min-h-screen bg-gray-50">

      {/* Header — compact */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Tee<span className="text-brand-500">Rabbit</span>
            </h1>
            <p className="text-xs text-gray-400 -mt-0.5">Screen Print Quote Calculator</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Screen printing</p>
            <p className="text-xs font-semibold text-gray-600">36 pc minimum</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-3">

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

      </main>

      {/* Email gate modal */}
      {gateOpen && (
        <EmailGate totalQty={totalQty} minQty={minQty} onSubmit={handleGateSubmit} />
      )}
    </div>
  )
}
