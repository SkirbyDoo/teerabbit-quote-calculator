const TIER_COLORS = {
  Budget:   'bg-gray-100 text-gray-600',
  Standard: 'bg-blue-50 text-blue-700',
  Premium:  'bg-brand-50 text-brand-700',
}

export default function BatchList({ batches, onRemove }) {
  if (!batches.length) return (
    <div className="step-card">
      <div className="flex items-center gap-3 mb-2">
        <div className="step-number">2</div>
        <h2 className="text-lg font-bold text-gray-800">Your Order</h2>
      </div>
      <p className="text-sm text-gray-400 text-center py-8">
        Add items above to build your order.
      </p>
    </div>
  )

  const totalPieces = batches.reduce((sum, b) => sum + b.qty, 0)

  return (
    <div className="step-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="step-number">2</div>
          <h2 className="text-lg font-bold text-gray-800">Your Order</h2>
        </div>
        <span className="text-sm font-semibold text-gray-500">
          {totalPieces} piece{totalPieces !== 1 ? 's' : ''} total
        </span>
      </div>

      <div className="space-y-3">
        {batches.map((b, i) => (
          <div key={b.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold text-gray-700">{b.type}</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">{b.gender}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[b.tier] || 'bg-gray-100 text-gray-600'}`}>
                  {b.tier}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{b.garment.name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-gray-800">{b.qty} pcs</p>
              <p className="text-xs text-gray-400">${b.garment.base_price.toFixed(2)}/ea blank</p>
            </div>
            <button
              onClick={() => onRemove(b.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
              title="Remove"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
