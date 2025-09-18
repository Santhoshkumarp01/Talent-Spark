import React from 'react'

const FaceTimeline: React.FC = () => {
  const snapshots = [
    { time: '0:00', match: 98 },
    { time: '0:15', match: 95 },
    { time: '0:30', match: 97 },
    { time: '0:45', match: 0 }, // Missing face
    { time: '1:00', match: 96 }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-bold mb-4">👤 Face Timeline</h3>
      <div className="space-y-2">
        {snapshots.map((snap, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm font-mono">{snap.time}</span>
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${
                snap.match > 90 ? 'bg-green-500' : snap.match > 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm">{snap.match > 0 ? `${snap.match}%` : 'Missing'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FaceTimeline
