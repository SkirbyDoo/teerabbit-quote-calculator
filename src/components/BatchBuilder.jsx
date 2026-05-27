import { useState, useMemo } from 'react'

// Preferred display order — unknowns appended after
const TYPE_ORDER   = ['T-Shirt', 'Hoodie', 'Tank Top', 'Long Sleeve', 'Crewneck', 'Polo']
const GENDER_ORDER = ['Unisex', "Women's", 'Youth', 'Kids']
const TIER_ORDER   = ['Budget', 'Standard', 'Premium']

function sortByOrder(values, order) {
  return [...values].sort((a, b) => {
    const ai = order.indexOf(a), bi = order.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1; if (bi === -1) return -1
    return ai - bi
  })
}

function unique(arr) { return [...new Set(arr.filter(Boolean))] }

const TIER_BADGE = {
  Budget:   'bg-green-50 text-green-700',
  Standard: 'bg-blue-50 text-blue-700',
  Premium:  'bg-brand-50 text-brand-700',
}

function FilterBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all duration-100
        ${active
          ? 'border-brand-500 bg-brand-500 text-white'
          : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600'
        }`}
    >
      {label}
    </button>
  )
}

export default function BatchBuilder({ garments, onAdd }) {
  const [type,     setType]     = useState(null)
  const [gender,   setGender]   = useState(null)
  const [tier,     setTier]     = useState(null)
  const [selected, setSelected] = useState(null)
  const [qty,      setQty]      = useState('')

  // Derive filter options from sheet data
  const availableTypes = useMemo(() =>
    sortByOrder(unique(garments.map(g => g.apparel_type)), TYPE_ORDER), [garments])

  const availableGenders = useMemo(() =>
    sortByOrder(unique(
      garments.filter(g => !type || g.apparel_type === type).map(g => g.gender)
    ), GENDER_ORDER), [garments, type])

  const availableTiers = useMemo(() =>
    sortByOrder(unique(
      garments
        .filter(g => (!type || g.apparel_type === type) && (!gender || g.gender === gender))
        .map(g => g.tier)
    ), TIER_ORDER), [garments, type, gender])

  // Filtered garment list — shows all when no filters applied
  const filtered = useMemo(() =>
    garments.filter(g =>
      (!type   || g.apparel_type === type) &&
      (!gender || g.gender === gender) &&
      (!tier   || g.tier === tier)
    ), [garments, type, gender, tier])

  // Keep selection valid as filters change; auto-select if only one match
  const activeGarment = useMemo(() => {
    if (selected && filtered.find(g => g.id === selected.id)) return selected
    if (filtered.length === 1) return filtered[0]
    return null
  }, [filtered, selected])

  function pickType(t)   { setType(p => p === t ? null : t); setGender(null); setTier(null); setSelected(null) }
  function pickGender(g) { setGender(p => p === g ? null : g); setTier(null); setSelected(null) }
  function pickTier(t)   { setTier(p => p === t ? null : t); setSelected(null) }

  function handleAdd() {
    if (!activeGarment || !qty || parseInt(qty) < 1) return
    onAdd({
      type:    activeGarment.apparel_type,
      gender:  activeGarment.gender,
      tier:    activeGarment.tier,
      garment: activeGarment,
      qty:     parseInt(qty),
      id:      Date.now(),
    })
    setSelected(null)
    setQty('')
    // Keep filters so adding another similar garment is fast
  }

  const canAdd = activeGarment && qty && parseInt(qty) >= 1

  return (
    <div className="step-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="step-number">1</div>
        <h2 className="text-lg font-bold text-gray-800">Build Your Order</h2>
      </div>

      {/* ── Filters ── */}
      <div className="space-y-3 mb-5">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Apparel Type</p>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map(t => (
              <FilterBtn key={t} label={t} active={type === t} onClick={() => pickType(t)} />
            ))}
          </div>
        </div>

        {type && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Style</p>
            <div className="flex flex-wrap gap-2">
              {availableGenders.map(g => (
                <FilterBtn key={g} label={g} active={gender === g} onClick={() => pickGender(g)} />
              ))}
            </div>
          </div>
        )}

        {type && gender && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quality</p>
            <div className="flex flex-wrap gap-2">
              {availableTiers.map(t => (
                <FilterBtn key={t} label={t} active={tier === t} onClick={() => pickTier(t)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Garment list ── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {type ? 'Select Garment' : 'All Garments'}
          </p>
          <span className="text-xs text-gray-400">
            {filtered.length} option{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
            No garments match — try adjusting your filters.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
            {filtered.map(g => {
              const isSel = activeGarment?.id === g.id
              return (
                <button
                  key={g.id}
                  onClick={() => setSelected(g)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all duration-100
                    ${isSel
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSel ? 'text-brand-700' : 'text-gray-800'}`}>
                      {g.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {g.brand} · <span className="font-mono">{g.id}</span>
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${TIER_BADGE[g.tier] || 'bg-gray-100 text-gray-600'}`}>
                    {g.tier}
                  </span>
                  <span className={`text-sm font-bold flex-shrink-0 tabular-nums ${isSel ? 'text-brand-600' : 'text-gray-700'}`}>
                    ${g.base_price.toFixed(2)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Qty + Add ── */}
      {activeGarment && (
        <div className="flex items-end gap-3 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quantity</p>
            <input
              type="number"
              min="1"
              placeholder="e.g. 48"
              value={qty}
              onChange={e => setQty(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canAdd && handleAdd()}
              className="qty-input w-28"
              autoFocus
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 mb-0.5
              ${canAdd
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add to Order
          </button>
        </div>
      )}
    </div>
  )
}
