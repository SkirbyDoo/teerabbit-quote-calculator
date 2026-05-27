const TIER_COLORS = {
  Budget:   'bg-gray-100 text-gray-600',
  Standard: 'bg-blue-50 text-blue-700',
  Premium:  'bg-brand-50 text-brand-700',
}

const LOCATION_LABELS = {
  front: 'Front', back: 'Back', left_chest: 'Left Chest',
  right_chest: 'Right Chest', left_sleeve: 'Left Sleeve',
}

export default function BatchList({ designs, activeDesignId, onRemoveBatch, onSwitchDesign }) {
  const hasAnyBatches = designs.some(d => d.batches.length > 0)

  if (!hasAnyBatches) return (
    <div className="step-card">
      <div className="flex items-center gap-3 mb-2">
        <div className="step-number">3</div>
        <h2 className="text-lg font-bold text-gray-800">Your Order</h2>
      </div>
      <p className="text-sm text-gray-400 text-center py-8">
        Add items above to build your order.
      </p>
    </div>
  )

  const totalPieces = designs.reduce((sum, d) => sum + d.batches.reduce((s, b) => s + b.qty, 0), 0)

  return (
    <div className="step-card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="step-number">3</div>
          <h2 className="text-lg font-bold text-gray-800">Your Order</h2>
        </div>
        <span className="text-sm font-semibold text-gray-500">
          {totalPieces} piece{totalPieces !== 1 ? 's' : ''} total
        </span>
      </div>

      <div className="space-y-5">
        {designs.filter(d => d.batches.length > 0).map(design => (
          <div key={design.id}>
            {/* Design header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-bold ${design.id === activeDesignId ? 'text-brand-600' : 'text-gray-700'}`}>
                  {design.name}
                </span>
                <span className="text-xs text-gray-400">
                  {design.printLocations.map(l => LOCATION_LABELS[l] || l).join(' · ')}
                  {design.printLocations.map(l => {
                    const c = design.inkColorsPerLocation?.[l] || 1
                    return ` (${c}c)`
                  }).join('')}
                </span>
              </div>
              {design.id === activeDesignId ? (
                <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                  Editing
                </span>
              ) : (
                <button
                  onClick={() => onSwitchDesign(design.id)}
                  className="text-xs text-brand-500 hover:text-brand-600 font-semibold flex-shrink-0"
                >
                  Switch to edit
                </button>
              )}
            </div>

            {/* Batches for this design */}
            <div className="space-y-2">
              {design.batches.map(b => (
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
                    onClick={() => onRemoveBatch(design.id, b.id)}
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
        ))}
      </div>
    </div>
  )
}
