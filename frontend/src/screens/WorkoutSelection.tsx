import React, { useState } from 'react'

interface WorkoutSelectionProps {
  onNext: () => void
  onBack: () => void
  onWorkoutSelect: (workout: 'squats' | 'pushups' | 'situps' | 'vertical-jumps' | 'shuttle-run' | 'endurance-runs') => void
}

const WorkoutSelection: React.FC<WorkoutSelectionProps> = ({ onNext, onBack, onWorkoutSelect }) => {
  const [selectedWorkout, setSelectedWorkout] = useState<'squats' | 'pushups' | 'situps' | 'vertical-jumps' | 'shuttle-run' | 'endurance-runs' | null>(null)

  const workouts = [
    {
      id: 'squats' as const,
      name: 'Squats',
      icon: '🏋️‍♀️',
      description: 'Lower body strength assessment',
      difficulty: 'Beginner to Advanced',
      duration: '2-5 minutes',
      muscles: 'Legs, Glutes, Core'
    },
    {
      id: 'pushups' as const,
      name: 'Push-ups',
      icon: '💪',
      description: 'Upper body strength assessment',
      difficulty: 'Beginner to Advanced',
      duration: '2-5 minutes',
      muscles: 'Chest, Arms, Core'
    },
    {
      id: 'situps' as const,
      name: 'Sit-ups',
      icon: '🏃',
      description: 'Core strength assessment',
      difficulty: 'Beginner to Advanced',
      duration: '2-5 minutes',
      muscles: 'Abs, Core, Hip Flexors'
    },
    {
      id: 'vertical-jumps' as const,
      name: 'Vertical Jumps',
      icon: '⬆️‍♀️',
      description: 'Explosive power assessment',
      difficulty: 'Intermediate to Advanced',
      duration: '1-3 minutes',
      muscles: 'Legs, Glutes, Calves, Core'
    },
    {
      id: 'shuttle-run' as const,
      name: 'Shuttle Run',
      icon: '🏃‍♂️',
      description: 'Agility and speed assessment',
      difficulty: 'Intermediate to Advanced',
      duration: '1-4 minutes',
      muscles: 'Full Body, Cardio, Coordination'
    },
    {
      id: 'endurance-runs' as const,
      name: 'Endurance Runs',
      icon: '🏃‍♀️',
      description: 'Cardiovascular endurance assessment',
      difficulty: 'Beginner to Advanced',
      duration: '3-10 minutes',
      muscles: 'Full Body, Cardio, Stamina'
    }
  ]

  const handleWorkoutSelect = (workoutId: 'squats' | 'pushups' | 'situps' | 'vertical-jumps' | 'shuttle-run' | 'endurance-runs') => {
    setSelectedWorkout(workoutId)
    onWorkoutSelect(workoutId)
  }

  const handleNext = () => {
    if (selectedWorkout) {
      onNext()
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
          border: 'none', padding: '0.8rem 1.2rem', borderRadius: '15px',
          color: 'white', fontSize: '1rem', cursor: 'pointer'
        }}>
          <span>←</span> Back
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
          🏋️ Select Workout
        </h1>
        <div style={{ width: '100px' }} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
          borderRadius: '20px', padding: '1.5rem', maxWidth: '600px', margin: '0 auto',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <p style={{ color: 'white', fontSize: '1.2rem', margin: 0, lineHeight: '1.6' }}>
            Choose the exercise you want to perform. Our AI will analyze your video for proper form and count reps.
          </p>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem',
        maxWidth: '1400px',
        margin: '0 auto 3rem'
      }}>
        {workouts.map((workout) => (
          <div
            key={workout.id}
            onClick={() => handleWorkoutSelect(workout.id)}
            style={{
              background: selectedWorkout === workout.id 
                ? 'rgba(255,255,255,0.25)' 
                : 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '25px',
              padding: '2rem',
              cursor: 'pointer',
              border: selectedWorkout === workout.id 
                ? '3px solid rgba(0,255,65,0.6)' 
                : '1px solid rgba(255,255,255,0.2)',
              boxShadow: selectedWorkout === workout.id 
                ? '0 20px 40px rgba(0,255,65,0.3)' 
                : '0 20px 40px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              transform: selectedWorkout === workout.id ? 'translateY(-5px)' : 'none',
              position: 'relative'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {workout.icon}
            </div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.8rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem' 
            }}>
              {workout.name}
            </h3>
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '1.1rem', 
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              {workout.description}
            </p>
            
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '0.9rem', 
                marginBottom: '0.5rem' 
              }}>
                <strong>Difficulty:</strong> {workout.difficulty}
              </div>
              <div style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '0.9rem', 
                marginBottom: '0.5rem' 
              }}>
                <strong>Duration:</strong> {workout.duration}
              </div>
              <div style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '0.9rem' 
              }}>
                <strong>Muscles:</strong> {workout.muscles}
              </div>
            </div>

            {selectedWorkout === workout.id && (
              <div style={{
                marginTop: '1rem',
                background: 'rgba(0,255,65,0.2)',
                border: '1px solid rgba(0,255,65,0.4)',
                borderRadius: '10px',
                padding: '0.5rem',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}>
                ✓ Selected
              </div>
            )}
            
            {/* Special indicators for workout types */}
            {workout.id === 'vertical-jumps' && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)',
                color: 'white',
                padding: '0.3rem 0.8rem',
                borderRadius: '15px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                POWER
              </div>
            )}
            
            {workout.id === 'shuttle-run' && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                color: 'white',
                padding: '0.3rem 0.8rem',
                borderRadius: '15px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                AGILITY
              </div>
            )}
            
            {workout.id === 'endurance-runs' && (
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'linear-gradient(135deg, #fa709a, #fee140)',
                color: 'white',
                padding: '0.3rem 0.8rem',
                borderRadius: '15px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                NEW
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleNext}
          disabled={!selectedWorkout}
          style={{
            background: selectedWorkout
              ? 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)'
              : 'rgba(255,255,255,0.3)',
            color: 'white',
            border: 'none',
            padding: '1.2rem 2.5rem',
            borderRadius: '25px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: selectedWorkout ? 'pointer' : 'not-allowed',
            boxShadow: selectedWorkout ? '0 20px 40px rgba(0,210,255,0.4)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          📹 Upload Video
        </button>
      </div>
    </div>
  )
}

export default WorkoutSelection