import React, { useState } from 'react'
import VideoOverlay from '../../components/admin/VideoOverlay'
import FaceTimeline from '../../components/admin/FaceTimeline'
import RiskFlags from '../../components/admin/RiskFlags'

const ReviewDetail: React.FC = () => {
  const [decision, setDecision] = useState<'pending' | 'approved' | 'rejected'>('pending')

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Video Panel */}
          <div className="col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <VideoOverlay />
            </div>
          </div>
          
          {/* Review Panel */} 
          <div className="space-y-6">
            <RiskFlags />
            <FaceTimeline />
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold mb-4">Decision</h3>
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-3 rounded-lg">
                  ✓ Approve
                </button>
                <button className="w-full bg-red-600 text-white py-3 rounded-lg">
                  ✗ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewDetail
