import { useState, useMemo } from 'react'
import { usePricingData } from './hooks/usePricingData'
import { calculateQuote } from './utils/calculator'
import GarmentPicker from './components/GarmentPicker'
import QuantitySelector from './components/QuantitySelector'
import PrintOptions from './components/PrintOptions'
import QuoteSummary from './components/QuoteSummary'
import { SHEET_ID } from './config'

const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
const defaultQuantities = Object.fromEntries(SIZES.map(s => [s, 0]))

export default function App() {
  const { data, loading, error } = usePricingData()

  const [selectedGarment, setSelectedGarment]       = useState(null)
  const [quantities, setQuantities]                  = useState(defaultQuantities)
  const [printLocations, setPrintLocations]          = useState(['front'])
  const [inkColorsPerLocation, setInkColorsPerLocation] = useState({ front: 1 })

  const quote = useMemo(() => {
    if (!data || !selectedGarment) return null
    return calculateQuote({
      garment: selectedGarment,
      quantities,
      printLocations,
      inkColorsPerLocation,
      pricingData: data,
    })
  }, [data, selectedGarment, quantities, printLocations, inkColorsPerLocation])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading pricing data…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
          <p className="text-red-700 font-semibold mb-2">Failed to load pricing data</p>
          <p className="text-red-500 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-3">Check your Google Sheet ID and sharing settings in <code className="bg-gray-100 px-1 rounded">src/config.js</code></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Tee<span className="text-brand-500">Rabbit</span>
            </h1>
            <p className="text-xs text-gray-400 -mt-0.5">Quick Quote Calculator</p>
          </div>
          {SHEET_ID === 'DEMO' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              <p className="text-xs text-amber-700 font-medium">Demo mode · <span className="font-normal">connect your Google Sheet in config.js</span></p>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: steps */}
          <div className="lg:col-span-2 space-y-6">
            <GarmentPicker
              garments={data.garments}
              selected={selectedGarment}
              onSelect={setSelectedGarment}
            />
            <QuantitySelector
              quantities={quantities}
              sizeUpcharges={data.sizeUpcharges}
              onChange={setQuantities}
            />
            <PrintOptions
              selectedLocations={printLocations}
              inkColors={inkColorsPerLocation}
              onLocationsChange={setPrintLocations}
              onInkColorsChange={setInkColorsPerLocation}
            />
          </div>

          {/* Right: quote */}
          <div className="lg:col-span-1">
            <QuoteSummary
              quote={quote}
              garment={selectedGarment}
              quantities={quantities}
              inkColors={inkColorsPerLocation}
              printLocations={printLocations}
              pricingData={data}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
