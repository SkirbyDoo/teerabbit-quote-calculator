const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

export default function QuantitySelector({ quantities, sizeUpcharges, onChange }) {
  const total = SIZES.reduce((sum, s) => sum + (quantities[s] || 0), 0)

  function handleChange(size, val) {
    const num = Math.max(0, parseInt(val) || 0)
    onChange({ ...quantities, [size]: num })
  }

  return (
    <div className="step-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="step-number">2</div>
        <h2 className="text-lg font-bold text-gray-800">Enter Quantities</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {SIZES.map(size => (
                <th key={size} className="pb-2 text-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase">{size}</span>
                  {sizeUpcharges[size] > 0 && (
                    <span className="block text-xs text-brand-500 font-medium">
                      +${sizeUpcharges[size].toFixed(2)}
                    </span>
                  )}
                </th>
              ))}
              <th className="pb-2 text-center">
                <span className="text-xs font-semibold text-gray-500 uppercase">Total</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {SIZES.map(size => (
                <td key={size} className="px-1 text-center">
                  <input
                    type="number"
                    min="0"
                    value={quantities[size] || ''}
                    placeholder="0"
                    onChange={e => handleChange(size, e.target.value)}
                    className="qty-input"
                  />
                </td>
              ))}
              <td className="px-1 text-center">
                <div className="w-16 mx-auto py-2 text-sm font-bold text-gray-800 bg-gray-50 rounded-lg text-center border border-gray-200">
                  {total}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <p className="mt-3 text-sm text-gray-500 text-right">
          {total} piece{total !== 1 ? 's' : ''} total
        </p>
      )}
    </div>
  )
}
