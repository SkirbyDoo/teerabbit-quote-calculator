const LOCATIONS = [
  { id: 'front',       label: 'Front' },
  { id: 'back',        label: 'Back' },
  { id: 'left_chest',  label: 'Left Chest' },
  { id: 'right_chest', label: 'Right Chest' },
  { id: 'left_sleeve', label: 'Left Sleeve' },
]

export default function PrintSettings({ locations, numColors, onLocationsChange, onColorsChange }) {
  function toggle(id) {
    locations.includes(id)
      ? onLocationsChange(locations.filter(l => l !== id))
      : onLocationsChange([...locations, id])
  }

  return (
    <div className="step-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="step-number">3</div>
        <h2 className="text-lg font-bold text-gray-800">Print Details</h2>
      </div>

      <div className="space-y-5">
        {/* Locations */}
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

        {/* Ink colors */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Ink Colors <span className="text-gray-300 font-normal normal-case">(same for all locations)</span>
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onColorsChange(Math.max(1, numColors - 1))}
              className="w-8 h-8 rounded-full border-2 border-gray-200 text-gray-500 flex items-center justify-center text-lg font-bold hover:border-brand-500 hover:text-brand-500 transition-colors"
            >−</button>
            <div className="text-center">
              <span className="text-2xl font-extrabold text-gray-800">{numColors}</span>
              <p className="text-xs text-gray-400 -mt-0.5">{numColors === 1 ? 'color' : 'colors'}</p>
            </div>
            <button
              onClick={() => onColorsChange(Math.min(13, numColors + 1))}
              className="w-8 h-8 rounded-full border-2 border-gray-200 text-gray-500 flex items-center justify-center text-lg font-bold hover:border-brand-500 hover:text-brand-500 transition-colors"
            >+</button>
          </div>
        </div>
      </div>

      {locations.length === 0 && (
        <p className="mt-4 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Select at least one print location to get a quote.
        </p>
      )}
    </div>
  )
}
