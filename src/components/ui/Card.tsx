import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-background-card border border-border rounded-xl shadow-lg shadow-black/20 p-6 ${className}`}>
      {children}
    </div>
  )
}
