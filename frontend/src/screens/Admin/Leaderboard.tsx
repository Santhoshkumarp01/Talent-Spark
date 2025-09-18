import React, { useState } from 'react'

const Leaderboard: React.FC = () => {
  const [ageFilter, setAgeFilter] = useState('all')
  const [genderFilter, setGenderFilter] = useState('all')

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Official Leaderboard</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex space-x-4 mb-6">
            <select 
              value={ageFilter} 
              onChange={(e) => setAgeFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Ages</option>
              <option value="13-15">13-15</option>
              <option value="16-18">16-18</option>
              <option value="19-25">19-25</option>
            </select>
            
            <select 
              value={genderFilter} 
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Age/Gender</th>
                <th className="px-4 py-3 text-left">Reps</th>
                <th className="px-4 py-3 text-left">Form Score</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-3 font-bold text-yellow-600">#1</td>
                <td className="px-4 py-3">User_2847</td>
                <td className="px-4 py-3">17M</td>
                <td className="px-4 py-3 font-bold">42</td>
                <td className="px-4 py-3">96%</td>
                <td className="px-4 py-3">Today</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
