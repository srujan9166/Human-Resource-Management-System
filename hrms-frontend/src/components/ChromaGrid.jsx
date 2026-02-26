import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './ChromaGrid.css'

export default function ChromaGrid({
  items = [],
  radius = 280,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
  className = '',
}) {
  const containerRef = useRef(null)
  const setX = useRef(null)
  const setY = useRef(null)
  const pos  = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    setX.current = gsap.quickSetter(el, '--mouse-x', 'px')
    setY.current = gsap.quickSetter(el, '--mouse-y', 'px')

    const onMove = e => {
      const rect = el.getBoundingClientRect()
      const nx = e.clientX - rect.left
      const ny = e.clientY - rect.top
      gsap.to(pos.current, {
        x: nx, y: ny, duration: damping, ease,
        onUpdate: () => {
          setX.current(pos.current.x)
          setY.current(pos.current.y)
        }
      })
    }
    const onLeave = () => {
      gsap.to(el, { '--spot-opacity': 0, duration: fadeOut, ease })
    }
    const onEnter = () => {
      gsap.to(el, { '--spot-opacity': 1, duration: 0.3, ease })
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('mouseenter', onEnter)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('mouseenter', onEnter)
    }
  }, [damping, ease, fadeOut])

  // Animate cards in on mount
  useEffect(() => {
    if (!containerRef.current) return
    const cards = containerRef.current.querySelectorAll('.cg-card')
    gsap.fromTo(cards,
      { opacity: 0, y: 24, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out', delay: 0.1 }
    )
  }, [items])

  return (
    <div
      ref={containerRef}
      className={`cg-root ${className}`}
      style={{ '--r': `${radius}px`, '--spot-opacity': 0 }}
    >
      <div className="cg-spotlight" />
      <div className="cg-grid">
        {items.map((item, i) => (
          <div
            key={i}
            className="cg-card"
            style={{
              '--card-border': item.borderColor || '#2563eb',
              '--card-gradient': item.gradient || 'linear-gradient(145deg, #2563eb, #000)',
            }}
            onClick={() => item.url && window.open(item.url, '_blank')}
          >
            <div className="cg-card-glow" />
            <div className="cg-card-bg" />
            <div className="cg-card-content">
              <div className="cg-avatar-wrap">
                <img
                  src={item.image}
                  alt={item.title}
                  className="cg-avatar"
                  onError={e => { e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${item.title}` }}
                />
                <div className="cg-avatar-ring" />
              </div>
              <div className="cg-info">
                <div className="cg-name">{item.title}</div>
                <div className="cg-subtitle">{item.subtitle}</div>
                {item.handle && <div className="cg-handle">{item.handle}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
