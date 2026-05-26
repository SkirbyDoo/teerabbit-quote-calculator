const LOCATION_LABELS = {
  front:       'Front',
  back:        'Back',
  left_chest:  'Left Chest',
  right_chest: 'Right Chest',
  left_sleeve: 'Left Sleeve',
}

export default function QuoteBreakdown({ quote, printLocations, inkColorsPerLocation, customer }) {
  if (!quote || quote.belowMinimum) return null

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-brand-100 p-6 mt-6 ring-2 ring-brand-500/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-700">Screen Print Quote</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            ${quote.total.toFixed(2)}
          </h2>
          <p className="text-sm text-gray-500">
            ${quote.pricePerShirt.toFixed(2)}/shirt avg · {quote.totalQty} pieces
          </p>
        </div>
        {customer?.name && (
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">{customer.name}</p>
            <p className="text-xs text-gray-400">{customer.email}</p>
          </div>
        )}
      </div>

      {/* Print details — per-location color counts */}
      <div className="mb-5 pb-5 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Print Details</p>
        <div className="space-y-1.5">
          {printLocations.map(loc => {
            const colors = inkColorsPerLocation?.[loc] || 1
            return (
              <div key={loc} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">
                  {LOCATION_LABELS[loc] || loc}
                </span>
                <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium">
                  {colors} color{colors !== 1 ? 's' : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Line items */}
      <div className="mb-5 pb-5 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Order Breakdown</p>
        <div className="space-y-3">
          {quote.lines.map((line, i) => (
            <div key={i} className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{line.garment.name}</p>
                <p className="text-xs text-gray-400">
                  {line.type} · {line.gender} · {line.tier} ·{' '}
                  ${line.garment.base_price.toFixed(2)} blank + ${line.printCostPerShirt.toFixed(2)} print
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-sm font-bold text-gray-900">${line.lineTotal.toFixed(2)}</p>
                <p className="text-xs text-gray-400">{line.qty} × ${line.unitPrice.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Garment + print subtotal</span>
          <span>${quote.subtotal.toFixed(2)}</span>
        </div>
        {quote.setupFee > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Screen setup fee
              {quote.locBreakdown?.length > 0 && (
                <span className="text-gray-400">
                  {' '}({quote.locBreakdown.map(l =>
                    `${l.colors} color${l.colors !== 1 ? 's' : ''} × ${LOCATION_LABELS[l.loc] || l.loc}`
                  ).join(' + ')})
                </span>
              )}
            </span>
            <span>${quote.setupFee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
          <span>Total</span>
          <span className="text-brand-600 text-xl">${quote.total.toFixed(2)}</span>
        </div>
      </div>

      {/* CTA */}
      <button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl transition-colors text-sm">
        Request This Order →
      </button>
      <p className="text-xs text-gray-400 text-center mt-3">
        Estimate only · final price confirmed at order · does not include shipping or tax
      </p>
    </div>
  )
}
