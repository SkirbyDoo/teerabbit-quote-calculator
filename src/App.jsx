import { useState, useMemo } from 'react'
import { usePricingData } from './hooks/usePricingData'
import { calculateBatchQuote } from './utils/calculator'
import BatchBuilder from './components/BatchBuilder'
import BatchList from './components/BatchList'
import PrintSettings from './components/PrintSettings'
import EmailGate from './components/EmailGate'
import QuoteBreakdown from './components/QuoteBreakdown'
import AddMorePrompt from './components/AddMorePrompt'
import DesignTabs from './components/DesignTabs'

let _designCounter = 1
function makeDesign() {
  const num = _designCounter++
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

  const [designs,         setDesigns]         = useState(() => { const d = makeDesign(); return [d] })
  const [activeDesignId,  setActiveDesignId]   = useState(() => designs[0]?.id ?? null)
  const [lastAdded,       setLastAdded]        = useState(null)  // { batch, designId }
  const [gateOpen,        setGateOpen]         = useState(false)
  const [customer,        setCustomer]         = useState(null)

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

  // ── batch operations ──────────────────────────────────────────────────────
  function addBatch(batch) {
    setDesigns(prev => prev.map(d =>
      d.id === activeDesign.id
        ? { ...d, batches: [...d.batches, batch] }
        : d
    ))
    setLastAdded({ batch, designId: activeDesign.id })
  }

  function removeBatch(designId, batchId) {
    setDesigns(prev => prev.map(d =>
      d.id === designId
        ? { ...d, batches: d.batches.filter(b => b.id !== batchId) }
        : d
    ))
    if (lastAdded?.designId === designId) setLastAdded(null)
  }

  // ── design operations ─────────────────────────────────────────────────────
  function addNewDesign() {
    const d = makeDesign()
    setDesigns(prev => [...prev, d])
    setActiveDesignId(d.id)
    setLastAdded(null)
  }

  function switchDesign(id) {
    setActiveDesignId(id)
    setLastAdded(null)
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
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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

      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Design tabs — only shown when there are multiple designs */}
        {designs.length > 1 && (
          <DesignTabs
            designs={designs}
            activeId={activeDesign.id}
            onSelect={switchDesign}
            onAdd={addNewDesign}
          />
        )}

        {/* Step 1: Build Your Order */}
        <BatchBuilder garments={data.garments} onAdd={addBatch} />

        {/* Add More / New Design prompt */}
        {lastAdded && lastAdded.designId === activeDesign.id && (
          <AddMorePrompt
            batch={lastAdded.batch}
            designName={activeDesign.name}
            onAddMore={() => setLastAdded(null)}
            onNewDesign={addNewDesign}
          />
        )}

        {/* Step 2: Print Details (for the active design) */}
        <PrintSettings
          locations={activeDesign.printLocations}
          inkColorsPerLocation={activeDesign.inkColorsPerLocation}
          onLocationsChange={handleLocationsChange}
          onColorsChange={handleColorsChange}
        />

        {/* Step 3: Your Order (all designs) */}
        <BatchList
          designs={designs}
          activeDesignId={activeDesign.id}
          onRemoveBatch={removeBatch}
          onSwitchDesign={switchDesign}
        />

        {/* Get Quote bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              {totalQty === 0 ? (
                <p className="text-gray-400 text-sm">Add items above to build your order</p>
              ) : (
                <>
                  <p className="font-bold text-gray-800">
                    {totalQty} piece{totalQty !== 1 ? 's' : ''}
                    {designs.length > 1 && ` · ${designs.filter(d => d.batches.length > 0).length} designs`}
                  </p>
                  {totalQty < minQty ? (
                    <p className="text-xs text-amber-600 mt-0.5">
                      Add {minQty - totalQty} more piece{(minQty - totalQty) !== 1 ? 's' : ''} to meet the {minQty}-piece minimum
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 mt-0.5">✓ Meets screen print minimum</p>
                  )}
                </>
              )}
            </div>
            <button
              onClick={() => { setCustomer(null); setGateOpen(true) }}
              disabled={!readyForQuote}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-150
                ${readyForQuote
                  ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
            >
              Get My Quote →
            </button>
          </div>
        </div>

        {/* Full breakdown — revealed after email */}
        {customer && designQuotes.some(dq => dq.quote) && (
          <QuoteBreakdown
            designQuotes={designQuotes}
            customer={customer}
          />
        )}

      </main>

      {/* Email gate modal */}
      {gateOpen && (
        <EmailGate totalQty={totalQty} minQty={minQty} onSubmit={handleGateSubmit} />
      )}
    </div>
  )
}
