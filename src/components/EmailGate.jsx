import { useState } from 'react'

export default function EmailGate({ totalQty, minQty, onSubmit }) {
  const [email, setEmail] = useState('')
  const [name,  setName]  = useState('')
  const [error, setError] = useState('')

  const belowMin = totalQty < minQty

  function validate(e) {
    e.preventDefault()
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    onSubmit({ email: email.trim(), name: name.trim() })
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in">

        {belowMin ? (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Minimum not met</h2>
              <p className="text-gray-500 text-sm">
                Screen printing requires a minimum of <strong>{minQty} pieces</strong>.
                You currently have <strong>{totalQty}</strong>. Add more items and try again.
              </p>
            </div>
            <button onClick={() => onSubmit(null)} className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 transition-colors">
              Go Back
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Your quote is ready!</h2>
              <p className="text-gray-500 text-sm">Enter your email and we'll show your price instantly.</p>
            </div>

            <form onSubmit={validate} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${error ? 'border-red-300' : 'border-gray-200'}`}
                  autoFocus
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Show My Price →
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              No spam. We'll use your email to send your quote if you request it.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
