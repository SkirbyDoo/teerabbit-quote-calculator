const LOCATION_SHORT = {
  front: 'Front', back: 'Back',
  left_sleeve: 'L.Sleeve', right_sleeve: 'R.Sleeve',
}

export default function DesignTabs({ designs, activeId, onSelect, onAdd, onDelete }) {
  const canDelete = designs.length > 1

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Designs</p>

        {designs.map(d => {
          const totalQty = d.batches.reduce((sum, b) => sum + b.qty, 0)
          const isActive = d.id === activeId
          const locSummary = d.printLocations.map(l => LOCATION_SHORT[l] || l).join(' · ')

          return (
            <div
              key={d.id}
              className={`flex items-center rounded-lg border-2 transition-all duration-100
                ${isActive
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600'
                }`}
            >
              {/* Clickable name area */}
              <button
                onClick={() => onSelect(d.id)}
                className="flex items-center pl-3 pr-2 py-1 text-sm font-semibold text-left gap-0"
              >
                <span>{d.name}</span>
                {totalQty > 0 && (
                  <span className={`ml-1.5 text-xs font-normal ${isActive ? 'text-brand-100' : 'text-gray-400'}`}>
                    {totalQty} pcs
                  </span>
                )}
                {locSummary && (
                  <span className={`ml-1 text-xs font-normal ${isActive ? 'text-brand-200' : 'text-gray-300'}`}>
                    · {locSummary}
                  </span>
                )}
              </button>

              {/* Delete button — only shown when 2+ designs */}
              {canDelete && (
                <button
                  onClick={() => onDelete(d.id)}
                  title={`Delete ${d.name}`}
                  className={`mr-1.5 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0
                    ${isActive
                      ? 'text-brand-200 hover:bg-white/25 hover:text-white'
                      : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
                    }`}
                >
                  ×
                </button>
              )}
            </div>
          )
        })}

        <button
          onClick={onAdd}
          className="px-3 py-1 rounded-lg text-sm font-semibold border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
        >
          + New design
        </button>
      </div>
    </div>
  )
}
