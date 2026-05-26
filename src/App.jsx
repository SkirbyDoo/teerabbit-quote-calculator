import { useState, useMemo } from 'react'
import { usePricingData } from './hooks/usePricingData'
import { calculateBatchQuote } from './utils/calculator'
import BatchBuilder from './components/BatchBuilder'
import BatchList from './components/BatchList'
import PrintSettings from './components/PrintSettings'
import EmailGate from './components/EmailGate'
import QuoteBreakdown from './components/QuoteBreakdown'

export default function App() {
  const { data, loading, error } = usePricingData()

  const [batches,              setBatches]              = useState([])
  const [printLocations,       setPrintLocations]       = useState(['front'])
  const [inkColorsPerLocation, setInkColorsPerLocation] = useState({ front: 1 })
  const [gateOpen,             setGateOpen]             = useState(false)
  const [customer,             setCustomer]             = useState(null)

  // Design locks once the first batch is added
  const designLocked = batches.length > 0

  const totalQty = batches.reduce((sum, b) => sum + b.qty, 0)
  const minQty   = data?.settings?.screen_print_min_qty || 36

  const quote = useMemo(() => {
    if (!data || !batches.length || !printLocations.length) return null
    return calculateBatchQuote({ batches, printLocations, inkColorsPerLocation, pricingData: data })
  }, [data, batches, printLocations, inkColorsPerLocation])

  function addBatch(batch)  { setBatches(prev => [...prev, batch]) }
  function removeBatch(id)  { setBatches(prev => prev.filter(b => b.id !== id)) }

  // When a location is toggled, keep inkColorsPerLocation in sync
  function handleLocationsChange(newLocations) {
    setPrintLocations(newLocations)
    setInkColorsPerLocation(prev => {
      const next = {}
      for (const loc of newLocations) {
        next[loc] = prev[loc] || 1
      }
      return next
    })
  }

  // Update color count for a single location
  function handleColorsChange(locationId, count) {
    setInkColorsPerLocation(prev => ({ ...prev, [locationId]: count }))
  }

  function handleGateSubmit(result) {
    setGateOpen(false)
    if (result) setCustomer(result)
  }

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

  const readyForQuote = batches.length > 0 && printLocations.length > 0

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

        <BatchBuilder garments={data.garments} onAdd={addBatch} />
        <BatchList    batches={batches}         onRemove={removeBatch} />
        <PrintSettings
          locations={printLocations}
          inkColorsPerLocation={inkColorsPerLocation}
          onLocationsChange={handleLocationsChange}
          onColorsChange={handleColorsChange}
          locked={designLocked}
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
                    {totalQty} piece{totalQty !== 1 ? 's' : ''} · {printLocations.length} location{printLocations.length !== 1 ? 's' : ''}
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
        {customer && quote && !quote.belowMinimum && (
          <QuoteBreakdown
            quote={quote}
            printLocations={printLocations}
            inkColorsPerLocation={inkColorsPerLocation}
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
