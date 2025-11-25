'use client'

import React, { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  opacity: number
}

interface ParticleSystemConfig {
  count: number
  speed: number
  lifetime: number
  size: number
  color: string
  blur?: number
  density?: 'sparse' | 'medium' | 'dense'
}

export const useParticleSystem = (canvasRef: React.RefObject<HTMLCanvasElement>, config: ParticleSystemConfig) => {
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match container
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    updateCanvasSize()

    const densityMap = { sparse: 30, medium: 60, dense: 100 }
    const initialCount = config.count || densityMap[config.density || 'medium']

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = Array.from({ length: initialCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        life: 0,
        maxLife: config.lifetime,
        size: config.size + (Math.random() - 0.5) * config.size * 0.3,
        opacity: Math.random() * 0.6 + 0.2,
      }))
    }

    initParticles()

    const animate = () => {
      // Clear with slight fade for trail effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fillRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio)

      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life += 1
        particle.opacity = Math.cos((particle.life / particle.maxLife) * Math.PI) * 0.8

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width / devicePixelRatio
        if (particle.x > canvas.width / devicePixelRatio) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height / devicePixelRatio
        if (particle.y > canvas.height / devicePixelRatio) particle.y = 0

        // Draw particle
        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = config.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Add glow effect
        ctx.shadowColor = config.color
        ctx.shadowBlur = config.blur || 8
        ctx.restore()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => updateCanvasSize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [canvasRef, config])
}

export const ParticleCanvas: React.FC<{
  config: ParticleSystemConfig
  className?: string
}> = ({ config, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useParticleSystem(canvasRef, config)

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ filter: `blur(${config.blur || 0}px)` }}
    />
  )
}

export const AmbientParticles: React.FC<{ variant?: 'light' | 'dark' | 'accent' }> = ({
  variant = 'accent',
}) => {
  const colorMap = {
    light: 'rgba(255, 255, 255, 0.6)',
    dark: 'rgba(0, 0, 0, 0.3)',
    accent: 'rgba(59, 130, 246, 0.4)',
  }

  return (
    <ParticleCanvas
      config={{
        count: 40,
        speed: 0.3,
        lifetime: 120,
        size: 2,
        color: colorMap[variant],
        blur: 2,
        density: 'sparse',
      }}
    />
  )
}
