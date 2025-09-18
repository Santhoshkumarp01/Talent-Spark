import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
}

const Card: React.FC<CardProps> = ({ children, className = '', glow = true }) => {
  const baseClasses = "bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl"
  const glowClasses = glow ? "shadow-xl shadow-blue-500/10" : "shadow-lg"

  return (
    <div className={`${baseClasses} ${glowClasses} ${className}`}>
      {children}
    </div>
  )
}

export default Card
