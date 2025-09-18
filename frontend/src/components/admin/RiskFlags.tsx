import React from 'react'

const RiskFlags: React.FC = () => {
  const flags = [
    { type: 'hash', status: 'pass', message: 'Content hash verified' },
    { type: 'face', status: 'warning', message: 'Face gaps detected' },
    { type: 'motion', status: 'pass', message: 'Natural movement' },
    { type: 'timestamp', status: 'pass', message: 'Timing consistent' }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-bold mb-4">🔍 Integrity Flags</h3>
      <div className="space-y-3">
        {flags.map((flag, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm">{flag.message}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              flag.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {flag.status === 'pass' ? '✓' : '⚠'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RiskFlags
