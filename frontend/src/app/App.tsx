import React, { useState, useEffect } from 'react' // ✅ This must be at the very top
import Home from '../screens/Home'
import FaceCapture from '../screens/FaceCapture'
import WorkoutSelection from '../screens/WorkoutSelection'
import VideoUpload from '../screens/VideoUpload'
import Review from '../screens/Review'
import Sync from '../screens/Sync'
import Dashboard from "../screens/Admin/Dashboard";  // ✅ Correct path


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

  // Handle admin route via hash
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash
      
      if (hash === '#admin') {
        setCurrentScreen('admin')
      } else if (hash === '' || hash === '#') {
        if (currentScreen === 'admin') {
          setCurrentScreen('home')
        }
      }
    }
    
    checkHash()
    window.addEventListener('hashchange', checkHash)
    
    return () => {
      window.removeEventListener('hashchange', checkHash)
    }
  }, [currentScreen])

  const navigateTo = (screen: Screen) => {
    if (screen === 'admin') {
      window.location.hash = '#admin'
    } else if (screen === 'home') {
      window.location.hash = ''
    }
    setCurrentScreen(screen)
  }

  const resetApp = () => {
    setProfileData({
      name: '',
      age: 0,
      gender: '',
      height: 0,
      weight: 0
    })
    setFaceData('')
    setSelectedWorkout('squats')
    setAnalysisResults(null)
    navigateTo('home')
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <Home 
            onNext={() => navigateTo('faceCapture')} 
            onProfileUpdate={setProfileData}
            onAdminAccess={() => navigateTo('admin')}
          />
        )
        
      case 'faceCapture':
        return (
          <FaceCapture 
            onNext={() => navigateTo('workoutSelection')} 
            onBack={() => navigateTo('home')} 
            onFaceCapture={setFaceData} 
            profileData={profileData} 
          />
        )
        
      case 'workoutSelection':
        return (
          <WorkoutSelection 
            onNext={() => navigateTo('videoUpload')} 
            onBack={() => navigateTo('faceCapture')} 
            onWorkoutSelect={setSelectedWorkout} 
          />
        )
        
      case 'videoUpload':
        return (
          <VideoUpload 
            onNext={() => navigateTo('review')} 
            onBack={() => navigateTo('workoutSelection')} 
            selectedWorkout={selectedWorkout} 
            faceData={faceData} 
            onAnalysisComplete={setAnalysisResults} 
          />
        )
        
      case 'review':
        return (
          <Review 
            onNext={() => navigateTo('sync')} 
            onBack={() => navigateTo('videoUpload')} 
            analysisResults={analysisResults} 
            profileData={profileData} 
            selectedWorkout={selectedWorkout} 
          />
        )
        
      case 'sync':
        return (
          <Sync 
            onBack={resetApp}
            onHome={resetApp}
            submissionData={{ 
              profileData, 
              faceData, 
              selectedWorkout, 
              analysisResults 
            }} 
          />
        )
        
      case 'admin':
        return (
          <Dashboard 
            onBack={() => navigateTo('home')} 
          />
        )
        
      default:
        return (
          <Home 
            onNext={() => navigateTo('faceCapture')} 
            onProfileUpdate={setProfileData}
            onAdminAccess={() => navigateTo('admin')}
          />
        )
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {renderScreen()}
    </div>
  )
}

export default App
