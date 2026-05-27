const LOCATION_SHORT = {
  front: 'Front', back: 'Back',
  left_sleeve: 'L.Sleeve', right_sleeve: 'R.Sleeve',
}

export default function DesignTabs({ designs, activeId, onSelect, onAdd }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Designs</p>

        {designs.map(d => {
          const totalQty = d.batches.reduce((sum, b) => sum + b.qty, 0)
          const isActive = d.id === activeId
          const locSummary = d.printLocations.map(l => LOCATION_SHORT[l] || l).join(' · ')
          return (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold border-2 transition-all duration-100 text-left
                ${isActive
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600'
                }`}
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
