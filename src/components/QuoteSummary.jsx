import { buildSizeBreakdown } from '../utils/calculator'

export default function QuoteSummary({ quote, garment, quantities, inkColors, printLocations, pricingData }) {
  const isReady = quote && garment && pricingData

  if (!isReady) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Your Quote</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Complete the steps on the left<br />to see your live quote.</p>
        </div>
      </div>
    )
  }

  const breakdown = buildSizeBreakdown(
    quantities, garment, inkColors, printLocations, pricingData,
    quote.method === 'Screen Print' ? 'Screen Print' : 'DTF',
    quote.tier,
    quote.printCostPerShirt
  )

  const isDTF = quote.method !== 'Screen Print'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
      <h2 className="text-lg font-bold text-gray-800 mb-1">Your Quote</h2>

      {/* Method badge */}
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
        isDTF
          ? 'bg-blue-50 text-blue-700'
          : 'bg-green-50 text-green-700'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isDTF ? 'bg-blue-500' : 'bg-green-500'}`} />
        {quote.method}
      </div>

      {/* DTF switch notice */}
      {quote.switchReason && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Switched to DTF: </span>
            {quote.switchReason}
          </p>
        </div>
      )}

      {/* Garment */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Garment</p>
        <p className="text-sm font-semibold text-gray-800">{garment.name}</p>
        <p className="text-xs text-gray-500">{garment.brand} · from ${garment.base_price.toFixed(2)}/ea</p>
      </div>

      {/* Print locations */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Print Locations</p>
        {printLocations.map(loc => (
          <div key={loc} className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 capitalize">{loc.replace(/_/g, ' ')}</span>
            <span className="text-gray-500 text-xs">
              {inkColors[loc] || 1} color{(inkColors[loc] || 1) !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Size breakdown */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Size Breakdown</p>
        <div className="space-y-1">
          {breakdown.map(row => (
            <div key={row.size} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {row.size} × {row.qty}
                {row.upcharge > 0 && <span className="text-xs text-gray-400 ml-1">(+${row.upcharge.toFixed(2)} upcharge)</span>}
              </span>
              <span className="font-medium text-gray-800">${row.lineTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fees */}
      <div className="mb-4 pb-4 border-b border-gray-100 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shirt subtotal</span>
          <span className="text-gray-800">${quote.subtotal.toFixed(2)}</span>
        </div>
        {quote.setupFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Screen print setup fee</span>
            <span className="text-gray-800">${quote.setupFee.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-1 mb-6">
        <div className="flex justify-between">
          <span className="text-base font-bold text-gray-800">Total</span>
          <span className="text-xl font-extrabold text-brand-600">${quote.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-400">Per shirt (avg)</span>
          <span className="text-sm font-semibold text-gray-700">${quote.pricePerShirt.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-400">Total pieces</span>
          <span className="text-sm font-semibold text-gray-700">{quote.totalQty}</span>
        </div>
      </div>

      <button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-150 text-sm">
        Request This Quote
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Estimate only · final price confirmed at order
      </p>
    </div>
  )
}
