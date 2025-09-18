import React from 'react'

const VideoOverlay: React.FC = () => {
  return (
    <div className="relative">
      <video 
        controls 
        className="w-full rounded-lg bg-gray-900"
        style={{ aspectRatio: '16/9' }}
      >
        <source src="/demo-squat.webm" type="video/webm" />
      </video>
      
      {/* Rep Timeline Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg">
        <div className="flex justify-between text-sm mb-2">
          <span>Rep Timeline</span>
          <span>25 reps detected</span>
        </div>
        <div className="w-full bg-gray-600 h-2 rounded">
          <div className="bg-blue-500 h-2 rounded" style={{width: '75%'}}></div>
        </div>
      </div>
    </div>
  )
}

export default VideoOverlay
