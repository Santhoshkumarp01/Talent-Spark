import React, { useState, useEffect } from 'react'
import { GameManager } from '../components/gamification/GameManager'

interface HomeProps {
  onNext: () => void
  onProfileUpdate: (data: any) => void
  onAdminAccess: () => void
  onLeaderboardAccess: () => void
  currentUser: string
}

const Home: React.FC<HomeProps> = ({ 
  onNext, 
  onProfileUpdate, 
  onAdminAccess, 
  onLeaderboardAccess,
  currentUser 
}) => {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showAdminButton, setShowAdminButton] = useState(false)
  const [userStats, setUserStats] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    // PWA Install Prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Show admin button after 3 seconds
    const showAdmin = () => setShowAdminButton(true)
    const adminTimer = setTimeout(showAdmin, 3000)
    
    const keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        showAdmin()
      }
      if (e.key === 'Escape' && showProfileModal) {
        setShowProfileModal(false)
      }
    }
    
    // Scroll tracking for parallax effects
    const handleScroll = () => {
      setScrollY(window.scrollY)
      
      // Update active section based on scroll
      const sections = ['hero', 'features', 'about', 'journey', 'achievements', 'stats']
      const scrollPosition = window.scrollY + 300
      
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('keydown', keyHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('keydown', keyHandler)
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(adminTimer)
    }
  }, [showProfileModal])

  // Load user stats when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const stats = GameManager.getUserStats(currentUser)
      setUserStats(stats)
    }
  }, [currentUser])

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
      setShowProfileModal(false)
      onNext()
    }
  }

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowProfileModal(false)
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  // Enhanced achievements data
  const achievements = [
    {
      title: "SIH 2025 Innovation",
      description: "Smart India Hackathon - Student Innovation Track for Sports Technology",
      icon: "🏆",
      date: "Current Project",
      type: "competition",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "FitnGro Launch Success",
      description: "Successfully developed and launched comprehensive fitness platform with real users",
      icon: "🚀",
      date: "2024",
      type: "product",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
    {
      title: "SIH 2024 Experience",
      description: "Valuable hackathon experience building solutions for real-world problems",
      icon: "💡",
      date: "2024",
      type: "hackathon",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      title: "Sports Excellence",
      description: "Competitive athletics background providing deep understanding of fitness needs",
      icon: "🥇",
      date: "2022-Present",
      type: "sports",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
      title: "AI Innovation Pioneer",
      description: "Integrating computer vision and biometric authentication in fitness verification",
      icon: "🤖",
      date: "2024-25",
      type: "technology",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    },
    {
      title: "Team Leadership",
      description: "Leading cross-functional team combining sports expertise with technical innovation",
      icon: "👥",
      date: "Ongoing",
      type: "leadership",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
    }
  ]

  // Your real journey milestones
  const journeyMilestones = [
    {
      year: "2022-23",
      title: "Sports Foundation & Team Formation",
      description: "Started competitive athletics journey while forming a passionate team of developers and sports enthusiasts. Combined love for sports with emerging interest in technology solutions.",
      icon: "🏃‍♂️",
      color: "#667eea",
      highlights: ["Competitive athletics training", "Team building", "Sports-tech vision"]
    },
    {
      year: "2023",
      title: "SIH 2024 Participation",
      description: "Participated in Smart India Hackathon 2024 as a team, gaining invaluable experience in building solutions for real-world problems and understanding the hackathon ecosystem.",
      icon: "🚀",
      color: "#f093fb",
      highlights: ["First SIH experience", "Team collaboration", "Problem-solving skills"]
    },
    {
      year: "2024",
      title: "FitnGro Development & Launch",
      description: "Developed and successfully launched FitnGro - our first comprehensive fitness platform. This project taught us the intricacies of fitness technology and user experience in sports applications.",
      icon: "💪",
      color: "#4facfe",
      highlights: ["Product development", "User research", "Market launch", "Fitness tech expertise"]
    },
    {
      year: "2024-25",
      title: "FitnGro Growth & Learning",
      description: "Scaled FitnGro platform, gathered user feedback, and identified key gaps in fitness verification systems. This real-world experience became the foundation for our next innovation.",
      icon: "📈",
      color: "#43e97b",
      highlights: ["Platform scaling", "User feedback analysis", "Market insights", "Technical refinement"]
    },
    {
      year: "2025",
      title: "SIH 2025 - TalentSpark Innovation",
      description: "Leveraging our FitnGro experience and sports background, we're developing TalentSpark for SIH 2025 Student Innovation track - revolutionizing sports verification in educational institutions.",
      icon: "🏆",
      color: "#fa709a",
      highlights: ["AI integration", "Biometric security", "Educational focus", "SIH 2025 innovation"]
    },
    {
      year: "Future",
      title: "Sports-Tech Revolution",
      description: "Vision to transform how athletic performance is verified and recognized across Indian educational institutions, building on our journey from athletes to innovators to changemakers.",
      icon: "🌟",
      color: "#a8edea",
      highlights: ["National scale impact", "Educational integration", "Sports ecosystem transformation"]
    }
  ]

  return (
    <div style={{
      background: `
        linear-gradient(135deg, 
          #667eea 0%, 
          #764ba2 25%, 
          #f093fb 50%, 
          #f5576c 75%, 
          #4facfe 100%
        )
      `,
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Enhanced animated background with better performance */}
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255,255,255,0.06) 0%, transparent 50%),
          radial-gradient(circle at 60% 60%, rgba(255,255,255,0.04) 0%, transparent 50%)
        `,
        transform: `translateY(${scrollY * 0.5}px)`,
        animation: 'floatingOrbs 8s ease-in-out infinite',
        zIndex: 0
      }} />

      {/* Navigation Bar - Modern glassmorphism design */}
      <nav style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '50px',
        padding: '0.8rem 2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '35px',
              height: '35px',
              background: 'linear-gradient(135deg, #667eea, #f093fb)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              🎯
            </div>
            <span style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              TalentSpark
            </span>
          </div>

          {/* Navigation Links */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            {[
              { id: 'hero', label: 'Home' },
              { id: 'features', label: 'Features' },
              { id: 'about', label: 'About' },
              { id: 'journey', label: 'Journey' },
              { id: 'achievements', label: 'Achievements' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeSection === item.id ? '#fff' : 'rgba(255,255,255,0.8)',
                  fontWeight: activeSection === item.id ? 'bold' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: '0.5rem 1rem',
                  borderRadius: '25px',
                  background: activeSection === item.id ? 'rgba(255,255,255,0.15)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.color = '#fff'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Admin Access Button */}
        {showAdminButton && (
          <button
            onClick={onAdminAccess}
            style={{
              position: 'fixed',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '0.8rem 1.2rem',
              borderRadius: '50px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              zIndex: 999,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            🏛️ Admin Panel
          </button>
        )}

        {/* PWA Install Banner - Enhanced design */}
        {showInstallPrompt && (
          <div style={{ 
            position: 'fixed',
            top: '5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
            borderRadius: '25px',
            padding: '1.5rem 2rem',
            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            zIndex: 998,
            backdropFilter: 'blur(20px)',
            maxWidth: '500px',
            width: '90%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  🚀
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                    Install TalentSpark PWA
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                    Offline AI fitness verification system
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleInstallPWA} style={{
                  background: 'rgba(255,255,255,0.9)', 
                  color: '#667eea', 
                  border: 'none',
                  padding: '0.6rem 1.2rem', 
                  borderRadius: '20px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}>
                  Install
                </button>
                <button onClick={() => setShowInstallPrompt(false)} style={{
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '0.6rem 1.2rem', 
                  borderRadius: '20px', 
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}>
                  Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section - Enhanced with better typography and spacing */}
        <section id="hero" style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '8rem 2rem 4rem',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '1200px', width: '100%' }}>
            {/* Animated logo with improved effects */}
            <div style={{
              width: '180px',
              height: '180px',
              margin: '0 auto 3rem',
              background: `
                linear-gradient(135deg, 
                  #667eea 0%, 
                  #764ba2 25%, 
                  #f093fb 50%, 
                  #f5576c 75%, 
                  #4facfe 100%
                )
              `,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `
                0 30px 60px rgba(0,0,0,0.3),
                0 0 0 1px rgba(255,255,255,0.2),
                inset 0 1px 0 rgba(255,255,255,0.3)
              `,
              animation: 'heroLogoFloat 3s ease-in-out infinite',
              position: 'relative'
            }}>
              <span style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>🎯</span>
              
              {/* Floating particles around logo */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: `${Math.random() * 8 + 4}px`,
                    height: `${Math.random() * 8 + 4}px`,
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '50%',
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `floatingParticle${i} ${3 + Math.random() * 2}s ease-in-out infinite`
                  }}
                />
              ))}
            </div>
            
            {/* Main headline with enhanced typography */}
            <h1 style={{
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              fontWeight: '900',
              color: 'white',
              marginBottom: '1.5rem',
              textShadow: '0 20px 40px rgba(0,0,0,0.4)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.05em',
              lineHeight: '0.9',
              background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              TALENT SPARK
            </h1>
            
            {/* Enhanced subheadline */}
            <p style={{
              fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
              color: 'rgba(255,255,255,0.95)',
              maxWidth: '900px',
              margin: '0 auto 2rem',
              fontWeight: '300',
              lineHeight: '1.4',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              Revolutionary AI-powered fitness verification system for Smart India Hackathon 2025
            </p>

            {/* Enhanced feature badges */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '4rem'
            }}>
              {[
                { icon: '🏆', text: 'SIH 2025', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
                { icon: '🤖', text: 'AI-Powered', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
                { icon: '🔒', text: 'Biometric Auth', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
                { icon: '⚡', text: 'Real-time', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
                { icon: '📱', text: 'PWA Ready', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' }
              ].map((feature, index) => (
                <div key={index} style={{
                  background: feature.gradient,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '50px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  animation: `featureBadge ${2 + index * 0.2}s ease-in-out infinite`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Enhanced CTA buttons with improved animations */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setShowProfileModal(true)}
                style={{
                  padding: '1.5rem 3rem',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)',
                  color: 'white',
                  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: 'translateY(0)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 30px 60px rgba(102, 126, 234, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.4)'
                }}
              >
                🚀 Start Verification
              </button>

              <button
                onClick={onLeaderboardAccess}
                style={{
                  padding: '1.5rem 3rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '50px',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  color: 'white',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                🏆 View Leaderboard
              </button>
            </div>

            {/* Scroll indicator */}
            <div style={{
              position: 'absolute',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              animation: 'scrollBounce 2s infinite',
              cursor: 'pointer'
            }}
            onClick={() => scrollToSection('features')}
            >
              <div style={{
                width: '2px',
                height: '40px',
                background: 'rgba(255,255,255,0.6)',
                margin: '0 auto 0.5rem',
                borderRadius: '2px'
              }} />
              <div style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Explore Features
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced with better visual hierarchy */}
        <section id="features" style={{
          padding: '8rem 2rem',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                fontWeight: '800',
                color: 'white',
                marginBottom: '1.5rem',
                textShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                🚀 Powerful Features
              </h2>
              <p style={{
                fontSize: '1.4rem',
                color: 'rgba(255,255,255,0.9)',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Cutting-edge technology meets practical fitness verification needs
              </p>
            </div>

            {/* Enhanced feature grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '2.5rem',
              marginBottom: '3rem'
            }}>
              {[
                {
                  icon: '🤖',
                  title: 'AI-Powered Verification',
                  description: 'Advanced machine learning algorithms analyze fitness performance with 99.9% accuracy using computer vision and pose estimation',
                  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  features: ['Real-time pose analysis', 'Movement pattern recognition', 'Performance scoring']
                },
                {
                  icon: '🔒',
                  title: 'Biometric Security',
                  description: 'Multi-layer authentication combining facial recognition, biometric verification, and encrypted data transmission',
                  gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  features: ['Face authentication', 'Secure data encryption', 'Anti-spoofing technology']
                },
                {
                  icon: '📊',
                  title: 'Real-time Analytics',
                  description: 'Comprehensive performance tracking with instant feedback, progress visualization, and detailed analytics dashboard',
                  gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  features: ['Live performance metrics', 'Progress tracking', 'Detailed reports']
                },
                {
                  icon: '🏆',
                  title: 'Gamified Experience',
                  description: 'Engaging achievement system with badges, leaderboards, milestones, and social features for motivation',
                  gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  features: ['Achievement badges', 'Global leaderboards', 'Progress milestones']
                },
                {
                  icon: '📱',
                  title: 'Cross-Platform PWA',
                  description: 'Progressive Web App working seamlessly across devices with offline capabilities and native app experience',
                  gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  features: ['Offline functionality', 'Cross-device sync', 'Native app feel']
                },
                {
                  icon: '⚡',
                  title: 'Lightning Performance',
                  description: 'Optimized algorithms ensuring instant verification, minimal latency, and smooth user experience',
                  gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  features: ['Sub-second processing', 'Minimal latency', 'Smooth interactions']
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '30px',
                    padding: '3rem 2.5rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.25)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  }}
                >
                  {/* Background gradient overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '4px',
                    background: feature.gradient,
                    borderRadius: '30px 30px 0 0'
                  }} />
                  
                  <div style={{
                    fontSize: '4rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }}>
                    {feature.icon}
                  </div>
                  
                  <h3 style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    {feature.title}
                  </h3>
                  
                  <p style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    {feature.description}
                  </p>
                  
                  {/* Feature highlights */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    {feature.features.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.95rem'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          background: feature.gradient,
                          borderRadius: '50%'
                        }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section - Enhanced storytelling */}
        <section id="about" style={{
          padding: '8rem 2rem',
          background: 'rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '5rem',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                  fontWeight: '800',
                  color: 'white',
                  marginBottom: '2rem',
                  textShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                  💡 About TalentSpark
                </h2>
                
                <div style={{
                  fontSize: '1.3rem',
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: '1.7',
                  marginBottom: '2rem'
                }}>
                  <p style={{ marginBottom: '1.5rem' }}>
                    TalentSpark represents the evolution of our sports-tech journey - from competitive athletics to launching FitnGro, and now revolutionizing fitness verification for educational institutions.
                  </p>
                  <p style={{ marginBottom: '1.5rem' }}>
                    Built for Smart India Hackathon 2025 Student Innovation track, our solution combines real-world experience from FitnGro's success with cutting-edge AI and biometric technologies.
                  </p>
                  <p>
                    We're not just building technology - we're creating the future of how athletic performance is verified, recognized, and celebrated in Indian educational institutions.
                  </p>
                </div>
                
                {/* Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '2rem',
                  marginBottom: '2rem'
                }}>
                  {[
                    { value: '99.9%', label: 'Accuracy' },
                    { value: '<1s', label: 'Processing' },
                    { value: '24/7', label: 'Availability' }
                  ].map((stat, index) => (
                    <div key={index} style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#43e97b',
                        marginBottom: '0.5rem'
                      }}>
                        {stat.value}
                      </div>
                      <div style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '1rem'
                      }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Interactive demo placeholder */}
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                borderRadius: '30px',
                padding: '4rem 3rem',
                border: '1px solid rgba(255,255,255,0.15)',
                textAlign: 'center',
                minHeight: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Animated background */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  background: 'linear-gradient(45deg, transparent 49%, rgba(255,255,255,0.05) 50%, transparent 51%)',
                  animation: 'shimmer 3s infinite'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    fontSize: '6rem', 
                    marginBottom: '2rem',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
                  }}>
                    🎬
                  </div>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}>
                    Interactive Demo
                  </h3>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '1.1rem',
                    lineHeight: '1.6'
                  }}>
                    Experience our AI-powered fitness verification system in action. Watch real-time pose analysis and performance scoring.
                  </p>
                  <button
                    onClick={() => setShowProfileModal(true)}
                    style={{
                      marginTop: '2rem',
                      background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                      border: 'none',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '25px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Try Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Journey Section - Your Real Story */}
        <section id="journey" style={{
          padding: '8rem 2rem',
          background: 'rgba(255,255,255,0.05)',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                fontWeight: '800',
                color: 'white',
                marginBottom: '1.5rem',
                textShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                🚀 My Journey
              </h2>
              <p style={{
                fontSize: '1.4rem',
                color: 'rgba(255,255,255,0.9)',
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                From competitive sports to FitnGro launch, SIH experiences, and now revolutionizing fitness verification for educational institutions
              </p>
            </div>

            {/* Enhanced timeline with your real journey */}
            <div style={{
              position: 'relative',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {/* Animated timeline line */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '0',
                bottom: '0',
                width: '4px',
                background: `
                  linear-gradient(to bottom, 
                    ${journeyMilestones[0].color} 0%,
                    ${journeyMilestones[1].color} 20%,
                    ${journeyMilestones[2].color} 40%,
                    ${journeyMilestones[3].color} 60%,
                    ${journeyMilestones[4].color} 80%,
                    ${journeyMilestones[5].color} 100%
                  )
                `,
                transform: 'translateX(-50%)',
                zIndex: 1,
                borderRadius: '2px',
                boxShadow: '0 0 20px rgba(255,255,255,0.3)'
              }} />

              {journeyMilestones.map((milestone, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: index === journeyMilestones.length - 1 ? '0' : '6rem',
                    position: 'relative',
                    flexDirection: index % 2 === 0 ? 'row' : 'row-reverse'
                  }}
                >
                  {/* Enhanced timeline node */}
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120px',
                    height: '120px',
                    background: `
                      linear-gradient(135deg, ${milestone.color}dd, ${milestone.color})
                    `,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    boxShadow: `
                      0 20px 40px ${milestone.color}40,
                      0 0 0 4px rgba(255,255,255,0.2),
                      inset 0 2px 0 rgba(255,255,255,0.3)
                    `,
                    zIndex: 2,
                    border: '3px solid rgba(255,255,255,0.2)',
                    animation: `nodeFloat${index} 4s ease-in-out infinite`
                  }}>
                    {milestone.icon}
                  </div>

                  {/* Enhanced content card with your story */}
                  <div style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '25px',
                    padding: '3.5rem 3rem',
                    width: 'calc(50% - 90px)',
                    marginLeft: index % 2 === 0 ? '0' : 'auto',
                    marginRight: index % 2 === 0 ? 'auto' : '0',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-15px)'
                    e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'
                  }}
                  >
                    {/* Card accent */}
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: index % 2 === 0 ? '0' : 'auto',
                      right: index % 2 === 0 ? 'auto' : '0',
                      width: '5px',
                      height: '100%',
                      background: `linear-gradient(to bottom, ${milestone.color}, ${milestone.color}aa)`
                    }} />
                    
                    <div style={{
                      color: milestone.color,
                      fontWeight: 'bold',
                      fontSize: '1.5rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        background: milestone.color,
                        borderRadius: '50%',
                        boxShadow: `0 0 10px ${milestone.color}`
                      }} />
                      {milestone.year}
                    </div>
                    
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.8rem',
                      fontWeight: 'bold',
                      marginBottom: '1.5rem',
                      lineHeight: '1.3'
                    }}>
                      {milestone.title}
                    </h3>
                    
                    <p style={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '1.1rem',
                      lineHeight: '1.7',
                      marginBottom: '2rem'
                    }}>
                      {milestone.description}
                    </p>
                    
                    {/* Key highlights */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '0.75rem'
                    }}>
                      {milestone.highlights.map((highlight, idx) => (
                        <div key={idx} style={{
                          background: `${milestone.color}15`,
                          border: `1px solid ${milestone.color}30`,
                          borderRadius: '15px',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.85rem',
                          color: 'rgba(255,255,255,0.9)',
                          textAlign: 'center',
                          fontWeight: '500'
                        }}>
                          {highlight}
                        </div>
                      ))}
                    </div>

                    {/* Special badges for key milestones */}
                    {index === 1 && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        🏆 SIH 2024
                      </div>
                    )}
                    
                    {index === 2 && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        🚀 Product Launch
                      </div>
                    )}
                    
                    {index === 4 && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'linear-gradient(135deg, #fa709a, #fee140)',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: 'white',
                        animation: 'pulse 2s infinite'
                      }}>
                        🔥 SIH 2025
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Journey Stats */}
            <div style={{
              marginTop: '6rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              textAlign: 'center'
            }}>
              {[
                { 
                  number: '2+', 
                  label: 'SIH Participations',
                  description: '2024 & 2025',
                  gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
                },
                { 
                  number: '1', 
                  label: 'Successful Launch',
                  description: 'FitnGro Platform',
                  gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)'
                },
                { 
                  number: '3+', 
                  label: 'Years in Sports',
                  description: 'Competitive Athletics',
                  gradient: 'linear-gradient(135deg, #f093fb, #f5576c)'
                },
                { 
                  number: '∞', 
                  label: 'Innovation Drive',
                  description: 'Continuous Learning',
                  gradient: 'linear-gradient(135deg, #fa709a, #fee140)'
                }
              ].map((stat, index) => (
                <div key={index} style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '2rem 1.5rem',
                  border: '1px solid rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)'
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                >
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    background: stat.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>
                    {stat.label}
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem'
                  }}>
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div style={{
              marginTop: '5rem',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '25px',
              padding: '3rem 2rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                🎯 The Journey Continues
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1.1rem',
                lineHeight: '1.6',
                maxWidth: '600px',
                margin: '0 auto 2rem'
              }}>
                From FitnGro to TalentSpark - each step has prepared us for this moment. 
                SIH 2025 Student Innovation track is where our sports passion meets cutting-edge technology.
              </p>
              <button
                onClick={() => setShowProfileModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #f093fb)',
                  border: 'none',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                🚀 Join Our Innovation Journey
              </button>
            </div>
          </div>
        </section>

        {/* Enhanced Achievement Showcase */}
        <section id="achievements" style={{
          padding: '8rem 2rem',
          background: 'rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                fontWeight: '800',
                color: 'white',
                marginBottom: '1.5rem',
                textShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                🏆 My Achievements
              </h2>
              <p style={{
                fontSize: '1.4rem',
                color: 'rgba(255,255,255,0.9)',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Milestones that shaped my journey in sports, technology, and innovation
              </p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem'
            }}>
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '25px',
                    padding: '2.5rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Background gradient */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    height: '4px',
                    background: achievement.gradient,
                    borderRadius: '25px 25px 0 0'
                  }} />
                  
                  <div style={{
                    fontSize: '4rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }}>
                    {achievement.icon}
                  </div>
                  
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    marginBottom: '0.75rem',
                    textAlign: 'center'
                  }}>
                    {achievement.title}
                  </h3>
                  
                  <p style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'center',
                    marginBottom: '1rem'
                  }}>
                    {achievement.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1.5rem'
                  }}>
                    <div style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      {achievement.date}
                    </div>
                    <div style={{
                      background: achievement.gradient,
                      padding: '0.3rem 0.8rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      {achievement.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced User Stats */}
        {userStats && (
          <section id="stats" style={{
            padding: '8rem 2rem',
            background: 'rgba(255,255,255,0.05)',
            position: 'relative'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h3 style={{
                color: 'white',
                textAlign: 'center',
                marginBottom: '3rem',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                textShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                👤 Your TalentSpark Profile
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem',
                textAlign: 'center'
              }}>
                {[
                  { 
                    value: `#${userStats.currentRank}`, 
                    label: 'Global Rank',
                    gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    icon: '🥇'
                  },
                  { 
                    value: userStats.totalPoints.toLocaleString(), 
                    label: 'Total Points',
                    gradient: 'linear-gradient(135deg, #00ff41, #00d4aa)',
                    icon: '⭐'
                  },
                  { 
                    value: userStats.badgesEarned.length, 
                    label: 'Badges Earned',
                    gradient: 'linear-gradient(135deg, #feca57, #ff9f43)',
                    icon: '🏅'
                  },
                  { 
                    value: userStats.totalAssessments, 
                    label: 'Tests Completed',
                    gradient: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                    icon: '✅'
                  }
                ].map((stat, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '25px',
                      padding: '2.5rem 1.5rem',
                      border: '1px solid rgba(255,255,255,0.15)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-10px)'
                      e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      right: '0',
                      height: '4px',
                      background: stat.gradient,
                      borderRadius: '25px 25px 0 0'
                    }} />
                    
                    <div style={{
                      fontSize: '2.5rem',
                      marginBottom: '1rem'
                    }}>
                      {stat.icon}
                    </div>
                    
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                      background: stat.gradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {stat.value}
                    </div>
                    
                    <div style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Enhanced Profile Modal */}
        {showProfileModal && (
          <div 
            style={{
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(15px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '2rem',
              boxSizing: 'border-box'
            }}
            onClick={handleModalBackdropClick}
          >
            <div style={{
              background: `
                linear-gradient(135deg, 
                  rgba(102, 126, 234, 0.15) 0%, 
                  rgba(240, 147, 251, 0.15) 100%
                )
              `,
              backdropFilter: 'blur(30px)',
              borderRadius: '35px',
              padding: '3rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 50px 100px rgba(0,0,0,0.5)',
              position: 'relative',
              animation: 'modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              {/* Enhanced close button */}
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '45px',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '1.3rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                  e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                }}
              >
                ✕
              </button>

              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '2.5rem',
                textAlign: 'center',
                textShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}>
                👤 Complete Your Profile
              </h2>
              
              <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Enhanced form fields */}
                {[
                  { label: '📝 Full Name', value: name, setter: setName, type: 'text', placeholder: 'Enter your full name' },
                  { label: '🎂 Age', value: age, setter: setAge, type: 'number', placeholder: 'Enter your age' }
                ].map((field, index) => (
                  <div key={index}>
                    <label style={{ 
                      display: 'block',
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '0.8rem',
                      fontSize: '1.1rem'
                    }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%',
                        padding: '1.2rem',
                        border: 'none',
                        borderRadius: '20px',
                        background: 'rgba(255,255,255,0.95)',
                        fontSize: '1.1rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        boxSizing: 'border-box',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)'
                      }}
                      onBlur={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                  </div>
                ))}

                {/* Gender Field */}
                <div>
                  <label style={{ 
                    display: 'block',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '0.8rem',
                    fontSize: '1.1rem'
                  }}>
                    👤 Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1.2rem',
                      border: 'none',
                      borderRadius: '20px',
                      background: 'rgba(255,255,255,0.95)',
                      fontSize: '1.1rem',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.transform = 'translateY(-2px)'
                      e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)'
                    }}
                    onBlur={(e) => {
                      e.target.style.transform = 'translateY(0)'
                      e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'
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
                  gap: '1.5rem' 
                }}>
                  {[
                    { label: '📏 Height (cm)', value: height, setter: setHeight, placeholder: '170' },
                    { label: '⚖️ Weight (kg)', value: weight, setter: setWeight, placeholder: '65' }
                  ].map((field, index) => (
                    <div key={index}>
                      <label style={{ 
                        display: 'block',
                        fontWeight: 'bold',
                        color: 'white',
                        marginBottom: '0.8rem',
                        fontSize: '1.1rem'
                      }}>
                        {field.label}
                      </label>
                      <input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        placeholder={field.placeholder}
                        style={{
                          width: '100%',
                          padding: '1.2rem',
                          border: 'none',
                          borderRadius: '20px',
                          background: 'rgba(255,255,255,0.95)',
                          fontSize: '1.1rem',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          boxSizing: 'border-box',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.transform = 'translateY(-2px)'
                          e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)'
                        }}
                        onBlur={(e) => {
                          e.target.style.transform = 'translateY(0)'
                          e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced submit button */}
              <button
                onClick={handleNext}
                disabled={!name || !age || !gender || !height || !weight}
                style={{
                  width: '100%',
                  marginTop: '2.5rem',
                  padding: '1.8rem',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  cursor: name && age && gender && height && weight ? 'pointer' : 'not-allowed',
                  background: name && age && gender && height && weight
                    ? 'linear-gradient(135deg, #667eea 0%, #f093fb 100%)'
                    : 'rgba(255,255,255,0.3)',
                  color: 'white',
                  boxShadow: name && age && gender && height && weight
                    ? '0 25px 50px rgba(102, 126, 234, 0.4)' 
                    : 'none',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  opacity: name && age && gender && height && weight ? 1 : 0.6,
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (name && age && gender && height && weight) {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 30px 60px rgba(102, 126, 234, 0.5)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (name && age && gender && height && weight) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                🔐 Next: Face Verification
              </button>

              {/* Enhanced helper text */}
              <div style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.95rem',
                marginTop: '2rem',
                lineHeight: '1.6',
                background: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '15px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                🔒 Your data is processed locally and secured with biometric authentication.
                <br />
                <strong>Smart India Hackathon 2025</strong> - Student Innovation Track
                <div style={{ fontSize: '0.85rem', marginTop: '1rem', opacity: 0.8 }}>
                  Press ESC to close • Built with privacy-first approach
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced CSS Animations */}
      <style>{`
        @keyframes floatingOrbs {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
          75% { transform: translateY(-25px) rotate(8deg); }
        }
        
        @keyframes heroLogoFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        
        @keyframes featureBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes scrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-15px); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes modalSlideIn {
          0% { 
            opacity: 0; 
            transform: translateY(50px) scale(0.9); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        ${[...Array(6)].map((_, i) => `
          @keyframes floatingParticle${i} {
            0%, 100% { 
              transform: translate(0, 0) rotate(0deg); 
              opacity: 0.6;
            }
            25% { 
              transform: translate(${10 + i * 5}px, -${15 + i * 3}px) rotate(90deg); 
              opacity: 1;
            }
            50% { 
              transform: translate(-${8 + i * 4}px, -${20 + i * 2}px) rotate(180deg); 
              opacity: 0.8;
            }
            75% { 
              transform: translate(-${12 + i * 3}px, ${5 + i * 2}px) rotate(270deg); 
              opacity: 0.9;
            }
          }
        `).join('')}
        
        ${journeyMilestones.map((_, i) => `
          @keyframes nodeFloat${i} {
            0%, 100% { transform: translateX(-50%) translateY(0px) scale(1); }
            50% { transform: translateX(-50%) translateY(-${5 + i * 2}px) scale(1.1); }
          }
        `).join('')}
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          font-family: system-ui, -apple-system, sans-serif;
        }
      `}</style>
    </div>
  )
}

export default Home
