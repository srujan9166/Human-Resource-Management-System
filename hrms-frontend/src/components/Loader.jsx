import React from 'react'

export default function Loader() {
  return (
    <div className="loader">
      <div className="spinner" />
      <span style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-head)', letterSpacing: '0.5px' }}>
        Loading…
      </span>
    </div>
  )
}
