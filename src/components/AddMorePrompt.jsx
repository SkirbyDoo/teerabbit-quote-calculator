export default function AddMorePrompt({ batch, designName, onAddMore, onNewDesign }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <p className="text-sm font-semibold text-green-800">
              {batch.qty} × {batch.type} ({batch.gender} · {batch.tier}) added to {designName}
            </p>
          </div>
          <p className="text-xs text-green-600 ml-7">Would you like to add more items to this design, or start a new one?</p>
        </div>
        <div className="flex gap-2 flex-wrap ml-7 sm:ml-0">
          <button
            onClick={onAddMore}
            className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-green-300 text-green-700 hover:bg-green-100 transition-colors"
          >
            Add more to {designName}
          </button>
          <button
            onClick={onNewDesign}
            className="px-4 py-2 rounded-xl text-sm font-semibold border-2 border-brand-300 text-brand-600 hover:bg-brand-50 transition-colors"
          >
            + Start a new design
          </button>
        </div>
      </div>
    </div>
  )
}
