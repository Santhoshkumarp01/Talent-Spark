import React, { useState, useEffect } from 'react'

interface HomeProps {
  onNext: () => void
  onProfileUpdate: (data: any) => void
  onAdminAccess: () => void
}

const Home: React.FC<HomeProps> = ({ onNext, onProfileUpdate, onAdminAccess }) => {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showAdminButton, setShowAdminButton] = useState(false)

  useEffect(() => {
    // PWA Install Prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Show admin button after 3 seconds or on key press
    const showAdmin = () => setShowAdminButton(true)
    
    const adminTimer = setTimeout(showAdmin, 3000)
    
    const keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        showAdmin()
      }
    }
    
    window.addEventListener('keydown', keyHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('keydown', keyHandler)
      clearTimeout(adminTimer)
    }
  }, [])

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShowInstallPrompt(false)
    setDeferredPrompt(null)
  }

  const handleNext = () => {
    if (name && age && gender && height && weight) {
      onProfileUpdate({ 
        name: name.trim(),
        age: parseInt(age), 
        gender, 
        height: parseInt(height), 
        weight: parseInt(weight) 
      })
      onNext()
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '2rem'
    }}>
      {/* Admin Access Button */}
      {showAdminButton && (
        <button
          onClick={onAdminAccess}
          onDoubleClick={onAdminAccess}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.8rem 1.2rem',
            borderRadius: '15px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            zIndex: 1000,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          🏛️ Admin Panel
        </button>
      )}

      {/* PWA Install Banner */}
      {showInstallPrompt && (
        <div style={{ 
          background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
          borderRadius: '20px',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(255,107,107,0.3)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '2rem', marginRight: '1rem' }}>🚀</span>
              <div>
                <div style={{ 
                  fontWeight: 'bold', 
                  color: 'white', 
                  fontSize: '1.1rem' 
                }}>
                  Install Talent Spark PWA
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '0.9rem' 
                }}>
                  Offline AI fitness verification system
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleInstallPWA} style={{
                background: 'rgba(255,255,255,0.9)', 
                color: '#ff6b6b', 
                border: 'none',
                padding: '0.5rem 1rem', 
                borderRadius: '10px', 
                fontWeight: 'bold', 
                cursor: 'pointer'
              }}>
                Install
              </button>
              <button onClick={() => setShowInstallPrompt(false)} style={{
                background: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                border: 'none',
                padding: '0.5rem 1rem', 
                borderRadius: '10px', 
                cursor: 'pointer'
              }}>
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 2rem',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <span style={{ fontSize: '3rem' }}>🎯</span>
        </div>
        
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '900',
          color: 'white',
          marginBottom: '1rem',
          textShadow: '0 10px 20px rgba(0,0,0,0.2)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          TALENT SPARK
        </h1>
        
        <p style={{
          fontSize: '1.3rem',
          color: 'rgba(255,255,255,0.9)',
          maxWidth: '600px',
          margin: '0 auto',
          fontWeight: '300',
          lineHeight: '1.6'
        }}>
          🔐 Secure AI-powered fitness verification with face authentication
        </p>

        {/* Stats/Info Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🤖</div>
            <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
              AI Analysis
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</div>
            <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Face Verified
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Real-time Stats
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(20px)',
        borderRadius: '30px',
        padding: '2.5rem',
        maxWidth: '500px',
        margin: '0 auto',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '2rem',
          textAlign: 'center',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          👤 Your Profile
        </h2>
        
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Name Field */}
          <div>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.5rem',
              fontSize: '1rem'
            }}>
              📝 Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '1rem',
                border: 'none',
                borderRadius: '15px',
                background: 'rgba(255,255,255,0.9)',
                fontSize: '1.1rem',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Age Field */}
          <div>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.5rem',
              fontSize: '1rem'
            }}>
              🎂 Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              style={{
                width: '100%',
                padding: '1rem',
                border: 'none',
                borderRadius: '15px',
                background: 'rgba(255,255,255,0.9)',
                fontSize: '1.1rem',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Gender Field */}
          <div>
            <label style={{ 
              display: 'block',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.5rem',
              fontSize: '1rem'
            }}>
              👤 Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: 'none',
                borderRadius: '15px',
                background: 'rgba(255,255,255,0.9)',
                fontSize: '1.1rem',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Select Gender</option>
              <option value="male">🧑 Male</option>
              <option value="female">👩 Female</option>
            </select>
          </div>

          {/* Height and Weight */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem' 
          }}>
            <div>
              <label style={{ 
                display: 'block',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '0.5rem',
                fontSize: '1rem'
              }}>
                📏 Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '15px',
                  background: 'rgba(255,255,255,0.9)',
                  fontSize: '1.1rem',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '0.5rem',
                fontSize: '1rem'
              }}>
                ⚖️ Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="65"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '15px',
                  background: 'rgba(255,255,255,0.9)',
                  fontSize: '1.1rem',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleNext}
          disabled={!name || !age || !gender || !height || !weight}
          style={{
            width: '100%',
            marginTop: '2rem',
            padding: '1.5rem',
            border: 'none',
            borderRadius: '20px',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            cursor: name && age && gender && height && weight ? 'pointer' : 'not-allowed',
            background: name && age && gender && height && weight
              ? 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)'
              : 'rgba(255,255,255,0.3)',
            color: 'white',
            boxShadow: name && age && gender && height && weight
              ? '0 20px 40px rgba(0,210,255,0.4)' 
              : 'none',
            transition: 'all 0.3s ease',
            opacity: name && age && gender && height && weight ? 1 : 0.6
          }}
        >
          🔐 Next: Face Verification
        </button>

        {/* Helper Text */}
        <p style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.9rem',
          marginTop: '1rem',
          lineHeight: '1.4'
        }}>
          Your data is processed locally and secured with face authentication.
          {!showAdminButton && (
            <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Press Ctrl+Shift+A for admin access
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

export default Home
