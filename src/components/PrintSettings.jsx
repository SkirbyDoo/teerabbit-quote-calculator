const LOCATIONS = [
  { id: 'front',       label: 'Front' },
  { id: 'back',        label: 'Back' },
  { id: 'left_chest',  label: 'Left Chest' },
  { id: 'right_chest', label: 'Right Chest' },
  { id: 'left_sleeve', label: 'Left Sleeve' },
]

// LockIcon SVG
function LockIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

export default function PrintSettings({
  locations,
  inkColorsPerLocation,
  onLocationsChange,
  onColorsChange,   // (locationId, newCount) => void
  locked,
}) {
  function toggle(id) {
    if (locked) return
    locations.includes(id)
      ? onLocationsChange(locations.filter(l => l !== id))
      : onLocationsChange([...locations, id])
  }

  function setColors(loc, delta) {
    if (locked) return
    const current = inkColorsPerLocation?.[loc] || 1
    const next = Math.min(13, Math.max(1, current + delta))
    onColorsChange(loc, next)
  }

  return (
    <div className="step-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="step-number">3</div>
        <h2 className="text-lg font-bold text-gray-800">Print Details</h2>
        {locked && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            <LockIcon className="w-3.5 h-3.5" />
            Locked
          </span>
        )}
      </div>

      {locked && (
        <div className="mb-5 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
          <LockIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>Your design is locked. Remove all items from your order to change print locations or colors.</span>
        </div>
      )}

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
                  disabled={locked}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all duration-100
                    ${on
                      ? locked
                        ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-default'
                        : 'border-brand-500 bg-brand-500 text-white'
                      : locked
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-default'
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
                        disabled={locked || count <= 1}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-base font-bold transition-colors
                          ${locked || count <= 1
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
                        disabled={locked || count >= 13}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-base font-bold transition-colors
                          ${locked || count >= 13
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

      {locations.length === 0 && !locked && (
        <p className="mt-4 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Select at least one print location to get a quote.
        </p>
      )}
    </div>
  )
}
