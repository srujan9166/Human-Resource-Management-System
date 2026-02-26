import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = {
  ADMIN:    ['dashboard','employees','departments','leaves','payroll','reports'],
  CEO:      ['dashboard','employees','departments','leaves','payroll','reports'],
  MANAGER:  ['dashboard','employees','departments','leaves','payroll','reports'],
  EMPLOYEE: ['dashboard','my-leaves'],
}

const NAV_ITEMS = [
  { key:'dashboard',   label:'Dashboard',   icon:'📊', path:'/' },
  { key:'employees',   label:'Employees',   icon:'👥', path:'/employees' },
  { key:'departments', label:'Departments', icon:'🏢', path:'/departments' },
  { key:'leaves',      label:'Leave Mgmt',  icon:'📋', path:'/leaves' },
  { key:'my-leaves',   label:'My Leaves',   icon:'🗓️', path:'/my-leaves' },
  { key:'payroll',     label:'Payroll',     icon:'💰', path:'/payroll' },
  { key:'reports',     label:'Reports',     icon:'📈', path:'/reports' },
]

const ROLE_COLORS = {
  ADMIN:'#2563eb', CEO:'#8b5cf6', MANAGER:'#f59e0b', EMPLOYEE:'#06b6d4'
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  const allowed    = NAV[user?.role] || []
  const items      = NAV_ITEMS.filter(i => allowed.includes(i.key))
  const initials   = user?.username?.slice(0, 2).toUpperCase() || '??'
  const roleColor  = ROLE_COLORS[user?.role] || '#06b6d4'

  return (
    <aside className="sidebar slide-in">
      <div className="sidebar-logo">
        <div className="logo-icon">W</div>
        <h1>Work<span>Force</span></h1>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar" style={{ background:`linear-gradient(135deg, ${roleColor}, #6e40c9)` }}>
          {initials}
        </div>
        <div className="user-role">{user?.role}</div>
        <div className="user-name" title={user?.username}>
          {user?.username?.length > 22 ? user.username.slice(0,22)+'…' : user?.username}
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-label">Menu</div>
          {items.map((item, i) => (
            <div
              key={item.key}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              style={{ animationDelay:`${i * 0.06}s` }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.key === 'reports' && (
                <span style={{
                  marginLeft:'auto', fontSize:9, fontWeight:700, letterSpacing:'0.06em',
                  textTransform:'uppercase', padding:'2px 6px', borderRadius:20,
                  background:'rgba(37,99,235,0.15)', color:'var(--accent-h)',
                  border:'1px solid rgba(37,99,235,0.25)'
                }}>NEW</span>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <span className="nav-icon">🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
