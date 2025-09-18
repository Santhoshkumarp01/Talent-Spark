import React, { useState, useEffect } from 'react'
import Home from '../screens/Home'
import FaceCapture from '../screens/FaceCapture'
import WorkoutSelection from '../screens/WorkoutSelection'
import VideoUpload from '../screens/VideoUpload'
import Review from '../screens/Review'
import Sync from '../screens/Sync'
import AdminDashboard from '../screens/AdminDashboard'

type Screen = 'home' | 'faceCapture' | 'workoutSelection' | 'videoUpload' | 'review' | 'sync' | 'admin'

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')
  const [profileData, setProfileData] = useState({
    name: '',
    age: 0,
    gender: '',
    height: 0,
    weight: 0
  })
  const [faceData, setFaceData] = useState<string>('')
  const [selectedWorkout, setSelectedWorkout] = useState<'squats' | 'pushups'>('squats')
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  // Check URL hash for admin access
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setCurrentScreen('admin')
      }
    }
    
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  const navigateTo = (screen: Screen) => {
    if (screen === 'admin') {
      window.location.hash = '#admin'
    } else {
      window.location.hash = ''
    }
    setCurrentScreen(screen)
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNext={() => navigateTo('faceCapture')} onProfileUpdate={setProfileData} />
      case 'faceCapture':
        return <FaceCapture onNext={() => navigateTo('workoutSelection')} onBack={() => navigateTo('home')} onFaceCapture={setFaceData} profileData={profileData} />
      case 'workoutSelection':
        return <WorkoutSelection onNext={() => navigateTo('videoUpload')} onBack={() => navigateTo('faceCapture')} onWorkoutSelect={setSelectedWorkout} />
      case 'videoUpload':
        return <VideoUpload onNext={() => navigateTo('review')} onBack={() => navigateTo('workoutSelection')} selectedWorkout={selectedWorkout} faceData={faceData} onAnalysisComplete={setAnalysisResults} />
      case 'review':
        return <Review onNext={() => navigateTo('sync')} onBack={() => navigateTo('videoUpload')} analysisResults={analysisResults} profileData={profileData} selectedWorkout={selectedWorkout} />
      case 'sync':
        return <Sync onBack={() => navigateTo('home')} submissionData={{ profileData, faceData, selectedWorkout, analysisResults }} />
      case 'admin':
        return <AdminDashboard onBack={() => navigateTo('home')} />
      default:
        return <Home onNext={() => navigateTo('faceCapture')} onProfileUpdate={setProfileData} />
    }
  }

  return <div style={{ minHeight: '100vh' }}>{renderScreen()}</div>
}

export default App
