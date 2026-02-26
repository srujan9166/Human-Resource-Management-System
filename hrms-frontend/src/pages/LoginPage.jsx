import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) { setError('Please enter both username and password.'); return }
    setError(''); setLoading(true)
    try { await login(username.trim(), password); navigate('/') }
    catch { setError('Invalid credentials. Please check and try again.') }
    finally { setLoading(false) }
  }

  const features = [
    { icon:'🧑‍💼', text:'Manage employees & departments' },
    { icon:'📋', text:'Track and approve leave requests' },
    { icon:'💰', text:'View payroll & salary breakdowns' },
    { icon:'📊', text:'Real-time dashboard & analytics' },
  ]

  return (
    <div className="login-page">
      <div className="login-grid fade-up">

        {/* Left branding */}
        <div className="login-left">
          <div className="login-brand-wrap">
            <div className="login-brand-icon">W</div>
            <div className="login-brand">Work<span>Force</span></div>
            <div className="login-tagline">
              Human Resource Management System<br/>
              Sign in to access your workspace
            </div>
          </div>

          <div className="login-features">
            {features.map((f, i) => (
              <div key={f.text} className="login-feature-item" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="login-right">
          <div style={{ marginBottom: 32 }}>
            <h2 className="login-heading">Welcome back</h2>
            <p className="login-sub">Enter your credentials to sign in</p>
          </div>

          {error && <div className="login-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Username / Email</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:15, pointerEvents:'none', opacity:0.4 }}>👤</span>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError('') }}
                  style={{ paddingLeft:38 }}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:15, pointerEvents:'none', opacity:0.4 }}>🔒</span>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  style={{ paddingLeft:38, paddingRight:44 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:15, opacity:0.4, transition:'opacity 0.15s', padding:4 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop:28, padding:'14px 16px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>
            <div style={{ fontWeight:600, color:'var(--text-dim)', marginBottom:4 }}>🔑 Need help signing in?</div>
            Contact your system administrator for credentials.
          </div>
        </div>

      </div>
    </div>
  )
}
