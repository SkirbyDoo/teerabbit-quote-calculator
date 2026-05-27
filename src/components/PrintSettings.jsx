const LOCATIONS = [
  { id: 'front',       label: 'Front' },
  { id: 'back',        label: 'Back' },
  { id: 'left_chest',  label: 'Left Chest' },
  { id: 'right_chest', label: 'Right Chest' },
  { id: 'left_sleeve', label: 'Left Sleeve' },
]

export default function PrintSettings({
  locations,
  inkColorsPerLocation,
  onLocationsChange,
  onColorsChange,  // (locationId, newCount) => void
}) {
  function toggle(id) {
    locations.includes(id)
      ? onLocationsChange(locations.filter(l => l !== id))
      : onLocationsChange([...locations, id])
  }

  function setColors(loc, delta) {
    const current = inkColorsPerLocation?.[loc] || 1
    const next = Math.min(13, Math.max(1, current + delta))
    onColorsChange(loc, next)
  }

  return (
    <div className="step-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="step-number">2</div>
        <h2 className="text-lg font-bold text-gray-800">Print Details</h2>
      </div>

      <div className="space-y-5">
        {/* Print Locations */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Print Location(s)</p>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map(loc => {
              const on = locations.includes(loc.id)
              return (
                <button
                  key={loc.id}
                  onClick={() => toggle(loc.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all duration-100
                    ${on
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600'
                    }`}
                >
                  {loc.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Per-location ink color steppers */}
        {locations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Ink Colors <span className="text-gray-300 font-normal normal-case">(per location)</span>
            </p>
            <div className="space-y-3">
              {locations.map(locId => {
                const locLabel = LOCATIONS.find(l => l.id === locId)?.label || locId
                const count = inkColorsPerLocation?.[locId] || 1
                return (
                  <div key={locId} className="flex items-center justify-between gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                    <span className="text-sm font-medium text-gray-700 min-w-0 flex-1">{locLabel}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setColors(locId, -1)}
                        disabled={count <= 1}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-base font-bold transition-colors
                          ${count <= 1
                            ? 'border-gray-100 text-gray-200 cursor-default'
                            : 'border-gray-200 text-gray-500 hover:border-brand-500 hover:text-brand-500'
                          }`}
                      >−</button>
                      <div className="text-center w-10">
                        <span className="text-lg font-extrabold text-gray-800">{count}</span>
                        <p className="text-xs text-gray-400 -mt-0.5 leading-none">{count === 1 ? 'color' : 'colors'}</p>
                      </div>
                      <button
                        onClick={() => setColors(locId, +1)}
                        disabled={count >= 13}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-base font-bold transition-colors
                          ${count >= 13
                            ? 'border-gray-100 text-gray-200 cursor-default'
                            : 'border-gray-200 text-gray-500 hover:border-brand-500 hover:text-brand-500'
                          }`}
                      >+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {locations.length === 0 && (
        <p className="mt-4 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Select at least one print location to get a quote.
        </p>
      )}
    </div>
  )
}
