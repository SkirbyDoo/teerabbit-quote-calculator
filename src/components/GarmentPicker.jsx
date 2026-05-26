// Categories shown in this order; any unlisted categories appear at the end
const CATEGORY_ORDER = ['Budget', 'Standard', 'Premium', 'Hoodie', 'Youth', 'Ladies']

export default function GarmentPicker({ garments, selected, onSelect }) {
  // Collect all categories that actually exist in the data
  const allCategories = [...new Set(garments.map(g => g.category).filter(Boolean))]
  const orderedCategories = [
    ...CATEGORY_ORDER.filter(c => allCategories.includes(c)),
    ...allCategories.filter(c => !CATEGORY_ORDER.includes(c)),
  ]

  const grouped = orderedCategories.reduce((acc, cat) => {
    const items = garments.filter(g => g.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  return (
    <div className="step-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="step-number">1</div>
        <h2 className="text-lg font-bold text-gray-800">Choose a Garment</h2>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-5 last:mb-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{category}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map(g => (
              <button
                key={g.id}
                onClick={() => onSelect(g)}
                className={`garment-card text-left ${selected?.id === g.id ? 'selected' : 'unselected'}`}
              >
                <div className="w-full h-16 rounded-lg bg-gray-100 mb-3 flex items-center justify-center overflow-hidden">
                  <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4l2 2-6 3-6-3 2-2H7L2 8l3 2 1-1v9h12v-9l1 1 3-2-5-4h-1z"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{g.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{g.brand} · <span className="font-mono">{g.id}</span></p>
                <p className="text-sm font-bold text-brand-600 mt-1">from ${g.base_price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
