const LOCATION_LABELS = {
  front: 'Front', back: 'Back', left_chest: 'Left Chest',
  right_chest: 'Right Chest', left_sleeve: 'Left Sleeve',
}

function DesignSection({ design, quote }) {
  return (
    <div>
      {/* Print details for this design */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Print Details</p>
        <div className="space-y-1.5">
          {design.printLocations.map(loc => {
            const colors = design.inkColorsPerLocation?.[loc] || 1
            return (
              <div key={loc} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">{LOCATION_LABELS[loc] || loc}</span>
                <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium">
                  {colors} color{colors !== 1 ? 's' : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Line items */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Items</p>
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

      {/* Subtotals */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Garment + print subtotal</span>
          <span>${quote.subtotal.toFixed(2)}</span>
        </div>
        {quote.setupFee > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Screen setup
              {quote.locBreakdown?.length > 0 && (
                <span className="text-gray-400">
                  {' '}({quote.locBreakdown.map(l =>
                    `${l.colors}c × ${LOCATION_LABELS[l.loc] || l.loc}`
                  ).join(' + ')})
                </span>
              )}
            </span>
            <span>${quote.setupFee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm text-gray-800 pt-1.5 border-t border-gray-100">
          <span>{design.name} subtotal</span>
          <span>${quote.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default function QuoteBreakdown({ designQuotes, customer }) {
  const validDesigns = designQuotes.filter(dq => dq.quote)
  if (!validDesigns.length) return null

  const grandTotal  = validDesigns.reduce((sum, dq) => sum + dq.quote.total, 0)
  const totalQty    = validDesigns.reduce((sum, dq) => sum + dq.quote.totalQty, 0)
  const anyBelowMin = validDesigns.some(dq => dq.quote.belowMinimum)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-brand-100 p-6 mt-6 ring-2 ring-brand-500/20">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-700">Screen Print Quote</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">${grandTotal.toFixed(2)}</h2>
          <p className="text-sm text-gray-500">
            ${(grandTotal / totalQty).toFixed(2)}/shirt avg · {totalQty} pieces
            {validDesigns.length > 1 && ` · ${validDesigns.length} designs`}
          </p>
        </div>
        {customer?.name && (
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">{customer.name}</p>
            <p className="text-xs text-gray-400">{customer.email}</p>
          </div>
        )}
      </div>

      {/* Below minimum notice */}
      {anyBelowMin && (
        <div className="mb-5 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          </svg>
          <p className="text-xs text-amber-700">
            Some designs are below the {validDesigns.find(dq => dq.quote.belowMinimum)?.quote.minQty}-piece minimum.
            Pricing is based on minimum tier rates.
          </p>
        </div>
      )}

      {/* Per-design sections */}
      <div className="space-y-6">
        {validDesigns.map((dq, i) => (
          <div key={dq.id}>
            {validDesigns.length > 1 && (
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                {dq.name}
              </h3>
            )}
            <DesignSection design={dq} quote={dq.quote} />
          </div>
        ))}
      </div>

      {/* Grand total (only shown when multiple designs) */}
      {validDesigns.length > 1 && (
        <div className="flex justify-between font-bold text-base text-gray-900 pt-4 mt-4 border-t border-gray-100">
          <span>Grand Total</span>
          <span className="text-brand-600 text-xl">${grandTotal.toFixed(2)}</span>
        </div>
      )}

      {/* Single design total */}
      {validDesigns.length === 1 && (
        <div className="flex justify-between font-bold text-base text-gray-900 pt-3 mt-3 border-t border-gray-100">
          <span>Total</span>
          <span className="text-brand-600 text-xl">${grandTotal.toFixed(2)}</span>
        </div>
      )}

      {/* CTA */}
      <button className="w-full mt-6 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl transition-colors text-sm">
        Request This Order →
      </button>
      <p className="text-xs text-gray-400 text-center mt-3">
        Estimate only · final price confirmed at order · does not include shipping or tax
      </p>
    </div>
  )
}
