import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllEmployees, getAllDepartments, getAllLeaves, getTodayLeaves } from '../services/api'
import Loader from '../components/Loader'
import ChromaGrid from '../components/ChromaGrid'

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!value) return
    const end = parseInt(value, 10)
    let start = 0
    const duration = 900
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display}</span>
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [todayLeaves, setTodayLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const isPrivileged = ['ADMIN','CEO','MANAGER'].includes(user?.role)
        if (!isPrivileged) { setStats({ employee: true }); setLoading(false); return }
        const emps = await getAllEmployees()
        const depts = await getAllDepartments()
        let leaves = { data: [] }
        let today  = { data: [] }
        if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
          leaves = await getAllLeaves()
          today  = await getTodayLeaves()
        }
        const empData = emps.data
        setEmployees(empData)
        setStats({
          totalEmployees:  empData.length,
          activeEmployees: empData.filter(e => e.status === 'ACTIVE').length,
          departments:     depts.data.length,
          pendingLeaves:   leaves.data.filter(l => l.leaveStatus === 'PENDING').length,
        })
        setTodayLeaves(today.data)
      } catch(err) { console.error(err) }
      finally { setLoading(false) }
    }
    if (user) load()
  }, [user])

  if (loading) return <Loader />

  const isPrivileged = ['ADMIN','CEO','MANAGER'].includes(user?.role)

  const PALETTE = [
    { color:'#2563eb', dir:'145deg' }, { color:'#06b6d4', dir:'210deg' },
    { color:'#8b5cf6', dir:'165deg' }, { color:'#f59e0b', dir:'195deg' },
    { color:'#22c55e', dir:'225deg' }, { color:'#f43f5e', dir:'135deg' },
  ]
  const chromaItems = employees.map((emp, i) => {
    const p = PALETTE[i % PALETTE.length]
    return {
      image:      emp.profilePhoto || `https://i.pravatar.cc/300?u=${emp.id || emp.employee_id || i}`,
      title:      emp.name,
      subtitle:   emp.designation || emp.role || 'Employee',
      handle:     `@${(emp.username || emp.email || emp.name || '').split('@')[0].toLowerCase().replace(/\s+/g, '.')}`,
      borderColor: p.color,
      gradient:   `linear-gradient(${p.dir}, ${p.color}, #050810)`,
      url:        null,
    }
  })

  const statCards = [
    { label:'Total Employees', value:stats?.totalEmployees, sub:`${stats?.activeEmployees} active`, icon:'👥', color:'blue',   delay:'0s' },
    { label:'Active Staff',    value:stats?.activeEmployees, sub:'currently working',              icon:'✅', color:'green',  delay:'0.07s' },
    { label:'Departments',     value:stats?.departments,     sub:'organizational units',           icon:'🏢', color:'orange', delay:'0.14s' },
    { label:'Pending Leaves',  value:stats?.pendingLeaves,   sub:'awaiting review',                icon:'⏳', color:'red',    delay:'0.21s' },
  ]

  return (
    <div>
      <div className="page-header fade-up">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      <div className="page-body">
        {isPrivileged && stats && !stats.error && (
          <>
            <div className="stats-grid">
              {statCards.map(s => (
                <div className="stat-card fade-up" key={s.label} style={{ animationDelay: s.delay }}>
                  <div className="stat-card-inner">
                    <div>
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-value"><AnimatedNumber value={s.value} /></div>
                      <div className="stat-change">{s.sub}</div>
                    </div>
                    <div className={`stat-icon-wrap ${s.color}`}>{s.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {chromaItems.length > 0 && (
              <div className="chroma-section fade-up" style={{ animationDelay:'0.28s' }}>
                <div className="chroma-section-title">
                  <span>👥</span> Employee Directory
                  <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text-muted)', fontFamily:'var(--font-body)', fontWeight:400 }}>
                    Hover to explore
                  </span>
                </div>
                <ChromaGrid items={chromaItems} radius={320} damping={0.45} />
              </div>
            )}

            <div className="card fade-up" style={{ animationDelay:'0.35s' }}>
              <div className="card-title">🏖️ Employees On Leave Today</div>
              {todayLeaves.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <p>All hands on deck — no approved leaves today</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Leave ID</th><th>Employee ID</th><th>Start Date</th><th>End Date</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {todayLeaves.map(l => (
                        <tr key={l.id}>
                          <td style={{color:'var(--text-muted)'}}>#{l.id}</td>
                          <td>EMP-{l.employeeId}</td>
                          <td>{l.startDate}</td>
                          <td>{l.endDate}</td>
                          <td><span className="badge badge-approved">{l.leaveStatus}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {!isPrivileged && (
          <div className="card fade-up">
            <div style={{ display:'flex', alignItems:'center', gap:18 }}>
              <div style={{
                width:64, height:64, borderRadius:18,
                background:'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.1))',
                border:'1px solid rgba(37,99,235,0.2)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:30, flexShrink:0
              }}>👋</div>
              <div>
                <div style={{ fontSize:20, fontWeight:800, fontFamily:'var(--font-head)', letterSpacing:'-0.3px' }}>
                  Welcome back, {user?.username?.split('@')[0]}!
                </div>
                <p style={{ color:'var(--text-dim)', fontSize:14, marginTop:4 }}>
                  You're logged in as an <strong style={{color:'var(--info)'}}>Employee</strong>.
                  Use <strong>My Leaves</strong> in the sidebar to manage leaves.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
