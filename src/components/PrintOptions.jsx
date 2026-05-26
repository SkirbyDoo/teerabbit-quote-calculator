const LOCATIONS = [
  { id: 'front',        label: 'Front Center' },
  { id: 'back',         label: 'Back Center' },
  { id: 'left_chest',   label: 'Left Chest' },
  { id: 'right_chest',  label: 'Right Chest' },
  { id: 'left_sleeve',  label: 'Left Sleeve' },
  { id: 'right_sleeve', label: 'Right Sleeve' },
]

const MAX_COLORS = 8

export default function PrintOptions({ selectedLocations, inkColors, onLocationsChange, onInkColorsChange }) {
  function toggleLocation(id) {
    if (selectedLocations.includes(id)) {
      onLocationsChange(selectedLocations.filter(l => l !== id))
    } else {
      onLocationsChange([...selectedLocations, id])
    }
  }

  function setColors(locationId, val) {
    const num = Math.min(MAX_COLORS, Math.max(1, parseInt(val) || 1))
    onInkColorsChange({ ...inkColors, [locationId]: num })
  }

  return (
    <div className="step-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="step-number">3</div>
        <h2 className="text-lg font-bold text-gray-800">Print Locations & Colors</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LOCATIONS.map(loc => {
          const checked = selectedLocations.includes(loc.id)
          return (
            <div key={loc.id}>
              <button
                onClick={() => toggleLocation(loc.id)}
                className={`location-checkbox w-full ${checked ? 'checked' : 'unchecked'}`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                  checked ? 'bg-brand-500' : 'border-2 border-gray-300'
                }`}>
                  {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">{loc.label}</span>
              </button>

              {checked && (
                <div className="mt-2 ml-4 flex items-center gap-3">
                  <span className="text-xs text-gray-500">Ink colors:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setColors(loc.id, (inkColors[loc.id] || 1) - 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center text-sm hover:border-brand-500 hover:text-brand-500 transition-colors"
                    >−</button>
                    <span className="w-6 text-center text-sm font-bold text-gray-800">
                      {inkColors[loc.id] || 1}
                    </span>
                    <button
                      onClick={() => setColors(loc.id, (inkColors[loc.id] || 1) + 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center text-sm hover:border-brand-500 hover:text-brand-500 transition-colors"
                    >+</button>
                  </div>
                  <span className="text-xs text-gray-400">
                    {inkColors[loc.id] === 1 || !inkColors[loc.id] ? '(1 color)' : `(${inkColors[loc.id]} colors)`}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedLocations.length === 0 && (
        <p className="mt-4 text-sm text-gray-400 text-center">Select at least one print location to get a quote.</p>
      )}
    </div>
  )
}
