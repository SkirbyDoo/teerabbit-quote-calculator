import { useState } from 'react'

const TYPES   = ['T-Shirt', 'Hoodie', 'Tank Top']
const GENDERS = ['Unisex', "Women's", 'Youth']
const TIERS   = ['Budget', 'Standard', 'Premium']

function OptionBtn({ label, active, onClick }) {
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
  const [type,   setType]   = useState(null)
  const [gender, setGender] = useState(null)
  const [tier,   setTier]   = useState(null)
  const [qty,    setQty]    = useState('')

  // Find available options based on what's in the garments list
  const availableTypes   = TYPES.filter(t => garments.some(g => g.apparel_type === t))
  const availableGenders = GENDERS.filter(g => !type   || garments.some(gar => gar.apparel_type === type && gar.gender === g))
  const availableTiers   = TIERS.filter(t =>  (!type   || garments.some(g => g.apparel_type === type && g.tier === t)) &&
                                               (!gender || garments.some(g => g.apparel_type === type && g.gender === gender && g.tier === t)))

  // The matched garment for this selection
  const match = (type && gender && tier)
    ? garments.find(g => g.apparel_type === type && g.gender === gender && g.tier === tier)
    : null

  function reset() {
    setType(null); setGender(null); setTier(null); setQty('')
  }

  function handleAdd() {
    if (!match || !qty || parseInt(qty) < 1) return
    onAdd({ type, gender, tier, garment: match, qty: parseInt(qty), id: Date.now() })
    reset()
  }

  const canAdd = match && qty && parseInt(qty) >= 1

  return (
    <div className="step-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="step-number">1</div>
        <h2 className="text-lg font-bold text-gray-800">Build Your Order</h2>
      </div>

      <div className="space-y-4">
        {/* Apparel Type */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Apparel Type</p>
          <div className="flex flex-wrap gap-2">
            {availableTypes.map(t => (
              <OptionBtn key={t} label={t} active={type === t}
                onClick={() => { setType(t); setGender(null); setTier(null) }} />
            ))}
          </div>
        </div>

        {/* Gender */}
        {type && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Style</p>
            <div className="flex flex-wrap gap-2">
              {availableGenders.map(g => (
                <OptionBtn key={g} label={g} active={gender === g}
                  onClick={() => { setGender(g); setTier(null) }} />
              ))}
            </div>
          </div>
        )}

        {/* Tier */}
        {type && gender && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quality</p>
            <div className="flex flex-wrap gap-2">
              {availableTiers.map(t => (
                <OptionBtn key={t} label={t} active={tier === t} onClick={() => setTier(t)} />
              ))}
            </div>
          </div>
        )}

        {/* Matched garment preview */}
        {match && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4l2 2-6 3-6-3 2-2H7L2 8l3 2 1-1v9h12v-9l1 1 3-2-5-4h-1z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{match.name}</p>
              <p className="text-xs text-gray-400">{match.brand} · <span className="font-mono">{match.id}</span> · <span className="text-brand-600 font-semibold">${match.base_price.toFixed(2)}/ea blank</span></p>
            </div>
          </div>
        )}

        {/* Qty + Add */}
        {match && (
          <div className="flex items-center gap-3 pt-1">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quantity</p>
              <input
                type="number"
                min="1"
                placeholder="e.g. 48"
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="qty-input w-24"
              />
            </div>
            <div className="pt-6">
              <button
                onClick={handleAdd}
                disabled={!canAdd}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150
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
          </div>
        )}
      </div>
    </div>
  )
}
