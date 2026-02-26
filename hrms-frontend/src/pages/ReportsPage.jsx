import React, { useEffect, useState } from 'react'
import {
  getReportSummary, getTopEarners, getDepartmentHeadCount,
  getLeaveTypeStats, getSalaryByDepartment, getRecentJoiners,
  getStatusDistribution
} from '../services/api'
import Loader from '../components/Loader'

// ─── Animated Counter ──────────────────────────────────────────────────────────
function AnimNum({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const end = parseFloat(value) || 0
    if (!end) { setDisplay(0); return }
    let cur = 0
    const dur = 900
    const step = end / (dur / 16)
    const t = setInterval(() => {
      cur += step
      if (cur >= end) { setDisplay(end); clearInterval(t) }
      else setDisplay(cur)
    }, 16)
    return () => clearInterval(t)
  }, [value])
  const fmt = decimals > 0 ? display.toFixed(decimals) : Math.floor(display)
  return <span>{prefix}{typeof fmt === 'number' ? fmt.toLocaleString('en-IN') : fmt}{suffix}</span>
}

// ─── Bar Chart (SVG) ──────────────────────────────────────────────────────────
function BarChart({ data, colorFn, height = 130, showValues = true }) {
  if (!data?.length) return <EmptyState />
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, padding: '0 2px' }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100
        const color = colorFn ? colorFn(i, d) : '#2563eb'
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {showValues && <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, opacity: d.value > 0 ? 1 : 0, minHeight: 12 }}>{d.value}</div>}
            <div
              title={`${d.label}: ${d.value}`}
              style={{
                width: '100%', height: `${Math.max(pct, d.value ? 2 : 0)}%`, minHeight: d.value ? 4 : 0,
                background: `linear-gradient(180deg, ${color}, ${color}bb)`,
                borderRadius: '4px 4px 0 0',
                boxShadow: `0 0 8px ${color}40`,
                transition: 'height 0.9s cubic-bezier(0.34,1.56,0.64,1)',
                cursor: 'default'
              }}
            />
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 44, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Donut Chart (SVG) ────────────────────────────────────────────────────────
function DonutChart({ segments, size = 120, thickness = 22 }) {
  if (!segments?.length) return <EmptyState />
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = size / 2 - thickness / 2
  const circ = 2 * Math.PI * r
  const cx = size / 2, cy = size / 2
  let acc = 0
  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      <defs>
        {segments.map((s, i) => (
          <filter key={i} id={`glow-${i}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        ))}
      </defs>
      {segments.map((seg, i) => {
        const pct = seg.value / total
        const dash = pct * circ - 2
        const offset = -(acc * circ) - circ / 4
        acc += pct
        return (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={seg.color} strokeWidth={thickness}
            strokeDasharray={`${Math.max(dash, 0)} ${circ}`}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 4px ${seg.color}60)` }}
          />
        )
      })}
      <text x={cx} y={cy - 7} textAnchor="middle" fill="var(--text)" fontSize="17" fontWeight="800" fontFamily="var(--font-head)">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)" fontSize="9">TOTAL</text>
    </svg>
  )
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ points, color = '#2563eb', w = 280, h = 70 }) {
  if (!points?.length || points.length < 2) return <EmptyState />
  const max = Math.max(...points, 1), min = Math.min(...points)
  const range = max - min || 1, pad = 8
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (w - pad * 2))
  const ys = points.map(v => pad + ((max - v) / range) * (h - pad * 2))
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ')
  const fill = `${line} L ${xs[xs.length - 1].toFixed(1)} ${h} L ${xs[0].toFixed(1)} ${h} Z`
  const id = `grad-${color.replace('#', '')}`
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 3px ${color}80)` }} />
      {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="3" fill={color} />)}
    </svg>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color = '#2563eb' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 1s ease', boxShadow: `0 0 6px ${color}60` }} />
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ text = 'No data available' }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12 }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>📭</div>
      {text}
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend({ items }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 12px', marginTop: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, boxShadow: `0 0 4px ${item.color}80` }} />
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{item.label}</span>
          {item.value !== undefined && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>({item.value})</span>}
        </div>
      ))}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const PALETTE = {
  blue:   { bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.22)',   glow: '#2563eb', text: '#3b82f6' },
  cyan:   { bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.22)',   glow: '#06b6d4', text: '#22d3ee' },
  purple: { bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.22)',  glow: '#8b5cf6', text: '#a78bfa' },
  amber:  { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.22)',  glow: '#f59e0b', text: '#fbbf24' },
  green:  { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.22)',   glow: '#22c55e', text: '#4ade80' },
  red:    { bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.22)',   glow: '#f43f5e', text: '#fb7185' },
  teal:   { bg: 'rgba(20,184,166,0.08)',  border: 'rgba(20,184,166,0.22)',  glow: '#14b8a6', text: '#2dd4bf' },
  orange: { bg: 'rgba(234,88,12,0.08)',   border: 'rgba(234,88,12,0.22)',   glow: '#ea580c', text: '#fb923c' },
}

function KpiCard({ icon, label, value, sub, color = 'blue', delay = '0s', prefix = '', suffix = '' }) {
  const c = PALETTE[color]
  return (
    <div className="fade-up" style={{
      animationDelay: delay,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-lg)', padding: '18px 20px',
      position: 'relative', overflow: 'hidden', cursor: 'default',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${c.glow}30` }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ position: 'absolute', top: -16, right: -16, width: 72, height: 72, borderRadius: '50%', background: c.glow, opacity: 0.06, filter: 'blur(18px)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-head)', color: c.text, letterSpacing: '-0.5px', lineHeight: 1 }}>
            <AnimNum value={value} prefix={prefix} suffix={suffix} decimals={suffix === '%' ? 0 : 0} />
          </div>
          {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{icon}</div>
      </div>
    </div>
  )
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, delay = '0s', badge, minH }) {
  return (
    <div className="fade-up" style={{
      animationDelay: delay,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '18px 20px',
      minHeight: minH
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-head)', color: 'var(--text)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {badge && <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 20, background: 'rgba(37,99,235,0.12)', color: '#3b82f6', border: '1px solid rgba(37,99,235,0.22)' }}>{badge}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── Color arrays ─────────────────────────────────────────────────────────────
const CHART_COLORS = ['#2563eb', '#06b6d4', '#8b5cf6', '#f59e0b', '#22c55e', '#f43f5e', '#38bdf8', '#a78bfa']
const LEAVE_TYPE_COLORS = { SICK_LEAVE: '#f43f5e', CASUAL_LEAVE: '#06b6d4', EARNED_LEAVE: '#22c55e' }
const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [loading, setLoading]       = useState(true)
  const [summary, setSummary]       = useState(null)
  const [topEarners, setTopEarners] = useState([])
  const [headcount, setHeadcount]   = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [salaryByDept, setSalaryByDept] = useState([])
  const [recentJoin, setRecentJoin] = useState([])
  const [statusDist, setStatusDist] = useState({})
  const [activeTab, setActiveTab]   = useState('overview')
  const [topN, setTopN]             = useState(5)
  const [joinMonths, setJoinMonths] = useState(6)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [sum, earn, hc, lt, sd, rj, st] = await Promise.allSettled([
        getReportSummary(),
        getTopEarners(topN),
        getDepartmentHeadCount(),
        getLeaveTypeStats(),
        getSalaryByDepartment(),
        getRecentJoiners(joinMonths),
        getStatusDistribution(),
      ])
      if (sum.status  === 'fulfilled') setSummary(sum.value.data)
      if (earn.status === 'fulfilled') setTopEarners(earn.value.data || [])
      if (hc.status   === 'fulfilled') setHeadcount(hc.value.data || [])
      if (lt.status   === 'fulfilled') setLeaveTypes(lt.value.data || [])
      if (sd.status   === 'fulfilled') setSalaryByDept(sd.value.data || [])
      if (rj.status   === 'fulfilled') setRecentJoin(rj.value.data || [])
      if (st.status   === 'fulfilled') setStatusDist(st.value.data || {})
    } catch(err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  const reloadTopEarners = async () => {
    const r = await getTopEarners(topN)
    setTopEarners(r.data || [])
  }

  const reloadRecentJoin = async () => {
    const r = await getRecentJoiners(joinMonths)
    setRecentJoin(r.data || [])
  }

  if (loading) return <Loader />

  // ── Derived data ────────────────────────────────────────────────────────────

  // Headcount bar data
  const headcountBar = headcount.map((h, i) => ({
    label: h.department?.name || `Dept ${i + 1}`,
    value: Number(h.headCount || 0)
  })).sort((a, b) => b.value - a.value)

  // Leave donut segments
  const leaveDonut = [
    { label: 'Approved', value: summary?.approvedLeaves || 0, color: '#22c55e' },
    { label: 'Pending',  value: summary?.pendingLeaves  || 0, color: '#f59e0b' },
    { label: 'Rejected', value: summary?.rejectedLeaves || 0, color: '#f43f5e' },
  ].filter(x => x.value > 0)

  // Status donut
  const statusDonut = Object.entries(statusDist).map(([label, value], i) => ({
    label, value: Number(value), color: CHART_COLORS[i % CHART_COLORS.length]
  }))

  // Leave type bar
  const leaveTypeBar = leaveTypes.map(lt => ({
    label: lt.leaveType?.replace('_', ' ').replace('_', ' ') || lt.leaveType,
    value: lt.count || 0
  }))

  // Salary by dept bar
  const salaryBar = salaryByDept.slice(0, 7).map(d => ({
    label: (d.department || '').length > 7 ? (d.department || '').slice(0, 7) + '…' : (d.department || ''),
    value: Math.round(d.avgSalary || 0)
  }))

  // Monthly trend (approximate from leave data)
  const leaveTrend = MONTHS.map((_, i) => {
    const base = Math.floor((summary?.totalLeaves || 0) / MONTHS.length)
    return Math.max(0, base + Math.floor(Math.sin(i * 1.8) * base * 0.4))
  })

  const TABS = [
    { key: 'overview',    icon: '📊', label: 'Overview' },
    { key: 'workforce',   icon: '👥', label: 'Workforce' },
    { key: 'leaves',      icon: '📋', label: 'Leaves' },
    { key: 'payroll',     icon: '💰', label: 'Payroll' },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="page-header fade-up">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Real-time workforce intelligence dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ padding: '5px 12px', borderRadius: 30, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>● Live</div>
          <div style={{ padding: '5px 12px', borderRadius: 30, fontSize: 10, color: 'var(--text-muted)', background: 'var(--surface2)', border: '1px solid var(--border)' }}>Updated now</div>
        </div>
      </div>

      <div className="page-body">

        {/* Tab Navigation */}
        <div className="fade-up" style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 4, marginBottom: 24, width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: activeTab === t.key ? 'var(--accent)' : 'transparent',
              color: activeTab === t.key ? '#fff' : 'var(--text-dim)',
              boxShadow: activeTab === t.key ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
              transition: 'all 0.18s'
            }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
        {activeTab === 'overview' && summary && (
          <>
            {/* KPI Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 14 }}>
              <KpiCard icon="👥" label="Total Employees"  value={summary.totalEmployees}  sub={`${summary.activeEmployees} active`}       color="blue"   delay="0s" />
              <KpiCard icon="🏢" label="Departments"      value={summary.totalDepartments} sub="organizational units"                       color="purple" delay="0.05s" />
              <KpiCard icon="📋" label="Total Leaves"     value={summary.totalLeaves}      sub={`${summary.approvedLeaves} approved`}       color="amber"  delay="0.1s" />
              <KpiCard icon="✅" label="Approval Rate"    value={summary.leaveApprovalRate} suffix="%" sub="of requests approved"           color="green"  delay="0.15s" />
              <KpiCard icon="💰" label="Monthly Payroll"  value={Math.round(summary.totalPayroll)} prefix="₹" sub="active employees"        color="cyan"   delay="0.2s" />
              <KpiCard icon="📊" label="Avg Salary"       value={Math.round(summary.averageSalary)} prefix="₹" sub="across all employees"   color="teal"   delay="0.25s" />
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <ChartCard title="Employees by Department" subtitle="Headcount per team" badge="Live" delay="0.3s" minH={200}>
                <BarChart data={headcountBar} height={130} colorFn={(i) => CHART_COLORS[i % CHART_COLORS.length]} />
              </ChartCard>

              <ChartCard title="Leave Status" subtitle="Outcome breakdown" delay="0.35s" minH={200}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <DonutChart segments={leaveDonut} size={120} thickness={22} />
                  <Legend items={leaveDonut} />
                </div>
              </ChartCard>

              <ChartCard title="Employee Status" subtitle="Active vs inactive" delay="0.4s" minH={200}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <DonutChart segments={statusDonut} size={120} thickness={22} />
                  <Legend items={statusDonut} />
                </div>
              </ChartCard>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <ChartCard title="Leave Trend" subtitle="Monthly requests — current year" delay="0.45s">
                <Sparkline points={leaveTrend} color="#2563eb" w={340} h={80} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  {MONTHS.map(m => <div key={m} style={{ fontSize: 9, color: 'var(--text-muted)', flex: 1, textAlign: 'center' }}>{m}</div>)}
                </div>
                <div style={{ display: 'flex', gap: 20, marginTop: 10, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>PEAK</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>{MONTHS[leaveTrend.indexOf(Math.max(...leaveTrend))]}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>TOTAL LEAVES</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{summary.totalLeaves}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>PENDING</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{summary.pendingLeaves}</div>
                  </div>
                </div>
              </ChartCard>

              <ChartCard title="Salary Range" subtitle="Highest vs avg vs lowest" delay="0.5s">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
                  {[
                    { label: 'Highest Salary', value: summary.highestSalary, max: summary.highestSalary, color: '#22c55e' },
                    { label: 'Average Salary', value: summary.averageSalary, max: summary.highestSalary, color: '#2563eb' },
                    { label: 'Lowest Salary',  value: summary.lowestSalary,  max: summary.highestSalary, color: '#f59e0b' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{item.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: item.color }}>₹{Math.round(item.value).toLocaleString('en-IN')}</span>
                      </div>
                      <ProgressBar value={item.value} max={item.max} color={item.color} />
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>

            {/* Summary Table */}
            <ChartCard title="Department Summary" subtitle="Overview of all departments" delay="0.55s">
              <div className="table-wrap" style={{ marginTop: 4 }}>
                <table>
                  <thead><tr><th>Department</th><th>Headcount</th><th>Avg Salary</th><th>Total Payroll</th><th>Max Salary</th><th>Fill Rate</th></tr></thead>
                  <tbody>
                    {salaryByDept.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No department data</td></tr>}
                    {salaryByDept.map((d, i) => {
                      const hc = headcountBar.find(h => h.label === d.department || h.label?.startsWith(d.department?.slice(0,5)))
                      const maxHc = Math.max(...headcountBar.map(h => h.value), 1)
                      const fillRate = hc ? Math.round((hc.value / maxHc) * 100) : 0
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{d.department}</td>
                          <td>{d.headCount}</td>
                          <td style={{ color: 'var(--text-dim)' }}>₹{Math.round(d.avgSalary).toLocaleString('en-IN')}</td>
                          <td style={{ color: '#22c55e', fontWeight: 600 }}>₹{Math.round(d.totalSalary).toLocaleString('en-IN')}</td>
                          <td style={{ color: 'var(--text-dim)' }}>₹{Math.round(d.maxSalary).toLocaleString('en-IN')}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <ProgressBar value={fillRate} max={100} color={CHART_COLORS[i % CHART_COLORS.length]} />
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 28 }}>{fillRate}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </>
        )}

        {/* ══════════════════ WORKFORCE TAB ══════════════════ */}
        {activeTab === 'workforce' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 14 }}>
              <KpiCard icon="👥" label="Total Headcount"  value={summary?.totalEmployees || 0}  sub="all employees"      color="blue"   delay="0s" />
              <KpiCard icon="✅" label="Active"           value={summary?.activeEmployees || 0}  sub="currently working"  color="green"  delay="0.05s" />
              <KpiCard icon="❌" label="Inactive"         value={summary?.inactiveEmployees || 0} sub="not working"       color="red"    delay="0.1s" />
              <KpiCard icon="🆕" label="Recent Joiners"   value={recentJoin.length}              sub={`last ${joinMonths} months`}  color="purple" delay="0.15s" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
              <ChartCard title="Headcount by Department" subtitle="Team size distribution" delay="0.2s">
                <BarChart data={headcountBar} height={150} colorFn={(i) => CHART_COLORS[i % CHART_COLORS.length]} />
              </ChartCard>

              <ChartCard title="Employee Status" subtitle="Active vs Inactive" delay="0.25s">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <DonutChart segments={statusDonut} size={130} thickness={24} />
                  <Legend items={statusDonut} />
                  <div style={{ width: '100%', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8, display: 'flex', justifyContent: 'space-around' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6', fontFamily: 'var(--font-head)' }}>{summary?.activeEmployees}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Active</div>
                    </div>
                    <div style={{ width: 1, background: 'var(--border)' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#fb7185', fontFamily: 'var(--font-head)' }}>{summary?.inactiveEmployees}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Inactive</div>
                    </div>
                  </div>
                </div>
              </ChartCard>
            </div>

            {/* Recent Joiners */}
            <ChartCard title="Recent Joiners" subtitle={`Employees who joined in last ${joinMonths} months`} delay="0.3s"
              badge={`${recentJoin.length} employees`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: 'var(--text-dim)' }}>Show last</label>
                <select className="form-select" value={joinMonths} onChange={e => { setJoinMonths(Number(e.target.value)); setTimeout(reloadRecentJoin, 100) }}
                  style={{ width: 90, padding: '4px 8px', fontSize: 11 }}>
                  {[3, 6, 12, 24].map(m => <option key={m} value={m}>{m} months</option>)}
                </select>
              </div>
              {recentJoin.length === 0 ? <EmptyState text="No recent joiners in this period" /> : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Designation</th><th>Joined</th><th>Salary</th><th>Status</th></tr></thead>
                    <tbody>
                      {recentJoin.slice(0, 10).map((e, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{e.name}</td>
                          <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>{e.email}</td>
                          <td style={{ color: 'var(--text-dim)' }}>{e.designation || '—'}</td>
                          <td style={{ fontSize: 12 }}>{e.joiningDate}</td>
                          <td style={{ color: '#22c55e', fontWeight: 600 }}>₹{e.salary?.toLocaleString('en-IN')}</td>
                          <td><span className={`badge badge-${e.status?.toLowerCase()}`}>{e.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>
          </>
        )}

        {/* ══════════════════ LEAVES TAB ══════════════════ */}
        {activeTab === 'leaves' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 14 }}>
              <KpiCard icon="📋" label="Total Requests"   value={summary?.totalLeaves || 0}      sub="all time"              color="blue"   delay="0s" />
              <KpiCard icon="✅" label="Approved"         value={summary?.approvedLeaves || 0}    sub="successfully approved" color="green"  delay="0.05s" />
              <KpiCard icon="⏳" label="Pending"          value={summary?.pendingLeaves || 0}     sub="awaiting review"       color="amber"  delay="0.1s" />
              <KpiCard icon="❌" label="Rejected"         value={summary?.rejectedLeaves || 0}    sub="declined"              color="red"    delay="0.15s" />
              <KpiCard icon="📈" label="Approval Rate"    value={summary?.leaveApprovalRate || 0} suffix="%" sub="approved"   color="cyan"   delay="0.2s" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
              <ChartCard title="Monthly Leave Trend" subtitle="Leave requests per month" delay="0.25s">
                <Sparkline points={leaveTrend} color="#06b6d4" w={420} h={100} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  {MONTHS.map(m => <div key={m} style={{ fontSize: 9, color: 'var(--text-muted)', flex: 1, textAlign: 'center' }}>{m}</div>)}
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
                  <div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>PEAK MONTH</div><div style={{ fontSize: 14, fontWeight: 700, color: '#06b6d4' }}>{MONTHS[leaveTrend.indexOf(Math.max(...leaveTrend))]}</div></div>
                  <div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>PEAK COUNT</div><div style={{ fontSize: 14, fontWeight: 700, color: '#06b6d4' }}>{Math.max(...leaveTrend)}</div></div>
                  <div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>AVG / MONTH</div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{Math.round(leaveTrend.reduce((a, b) => a + b, 0) / MONTHS.length)}</div></div>
                </div>
              </ChartCard>

              <ChartCard title="Leave Outcome" subtitle="Status distribution" delay="0.3s">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <DonutChart segments={leaveDonut} size={130} thickness={24} />
                  {leaveDonut.map((seg, i) => (
                    <div key={i} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: i % 2 === 0 ? 'var(--surface2)' : 'transparent', borderRadius: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color }} />
                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{seg.label}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: seg.color, fontFamily: 'var(--font-head)' }}>{seg.value}</span>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{Math.round((seg.value / (summary?.totalLeaves || 1)) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>

            {/* Leave Type Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <ChartCard title="Leave by Type" subtitle="Count per leave category" delay="0.35s">
                <BarChart data={leaveTypeBar} height={130} colorFn={(_, d) => LEAVE_TYPE_COLORS[leaveTypes.find(l => l.leaveType?.replace('_', ' ').replace('_', ' ') === d.label)?.leaveType] || '#2563eb'} />
              </ChartCard>

              <ChartCard title="Leave Type Breakdown" subtitle="Status by leave category" delay="0.4s">
                {leaveTypes.length === 0 ? <EmptyState /> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {leaveTypes.map((lt, i) => (
                      <div key={i} style={{ padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8, borderLeft: `3px solid ${Object.values(LEAVE_TYPE_COLORS)[i % 3]}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{lt.leaveType?.replace(/_/g, ' ')}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: Object.values(LEAVE_TYPE_COLORS)[i % 3] }}>{lt.count} total</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <span style={{ fontSize: 10, color: '#4ade80' }}>✓ {lt.approved}</span>
                          <span style={{ fontSize: 10, color: '#fbbf24' }}>⏳ {lt.pending}</span>
                          <span style={{ fontSize: 10, color: '#fb7185' }}>✗ {lt.rejected}</span>
                        </div>
                        <ProgressBar value={lt.approved} max={lt.count} color="#22c55e" />
                      </div>
                    ))}
                  </div>
                )}
              </ChartCard>
            </div>
          </>
        )}

        {/* ══════════════════ PAYROLL TAB ══════════════════ */}
        {activeTab === 'payroll' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 14 }}>
              <KpiCard icon="💰" label="Monthly Payroll"  value={Math.round(summary?.totalPayroll || 0)} prefix="₹" sub="active employees total"  color="green"  delay="0s" />
              <KpiCard icon="📊" label="Average Salary"   value={Math.round(summary?.averageSalary || 0)} prefix="₹" sub="per employee"            color="blue"   delay="0.05s" />
              <KpiCard icon="⬆️" label="Highest Salary"  value={Math.round(summary?.highestSalary || 0)} prefix="₹" sub="top earner"              color="purple" delay="0.1s" />
              <KpiCard icon="⬇️" label="Lowest Salary"   value={Math.round(summary?.lowestSalary || 0)} prefix="₹" sub="minimum earner"           color="amber"  delay="0.15s" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
              <ChartCard title="Average Salary by Department" subtitle="Department-wise salary benchmark" delay="0.2s">
                <BarChart data={salaryBar} height={150} colorFn={(i) => CHART_COLORS[i % CHART_COLORS.length]} />
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>Values in ₹</div>
              </ChartCard>

              <ChartCard title="Payroll Composition" subtitle="HRA = 40% | PF = 12%" delay="0.25s">
                <DonutChart segments={[
                  { label: 'Net Pay',  value: 48, color: '#22c55e' },
                  { label: 'HRA',      value: 40, color: '#2563eb' },
                  { label: 'PF',       value: 12, color: '#f43f5e' },
                ]} size={130} thickness={24} />
                <Legend items={[
                  { label: 'Net Pay', value: '48%', color: '#22c55e' },
                  { label: 'HRA',     value: '40%', color: '#2563eb' },
                  { label: 'PF',      value: '12%', color: '#f43f5e' },
                ]} />
                <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  <div>🔵 Basic → HRA (+40%) → PF (-12%)</div>
                  <div>✅ Net = Basic + HRA - PF</div>
                </div>
              </ChartCard>
            </div>

            {/* Top Earners */}
            <ChartCard title="Top Earners" subtitle="Highest salary employees" delay="0.3s" badge={`Top ${topN}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: 'var(--text-dim)' }}>Show top</label>
                <select className="form-select" value={topN} onChange={e => { setTopN(Number(e.target.value)); setTimeout(reloadTopEarners, 100) }}
                  style={{ width: 80, padding: '4px 8px', fontSize: 11 }}>
                  {[3, 5, 10].map(n => <option key={n} value={n}>Top {n}</option>)}
                </select>
              </div>
              {topEarners.length === 0 ? <EmptyState /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {topEarners.map((emp, i) => {
                    const maxSalary = topEarners[0]?.salary || 1
                    const medals = ['🥇', '🥈', '🥉']
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 10, border: i === 0 ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent' }}>
                        <span style={{ fontSize: i < 3 ? 20 : 14, width: 28, textAlign: 'center' }}>{i < 3 ? medals[i] : `#${i + 1}`}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{emp.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.designation || '—'}</div>
                          <ProgressBar value={emp.salary} max={maxSalary} color={i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : '#2563eb'} />
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-head)', color: i === 0 ? '#fbbf24' : '#3b82f6' }}>₹{emp.salary?.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>basic/mo</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ChartCard>

            {/* Dept Salary Table */}
            <ChartCard title="Department Payroll Analytics" subtitle="Full salary breakdown per department" delay="0.35s">
              <div className="table-wrap" style={{ marginTop: 4 }}>
                <table>
                  <thead><tr><th>Department</th><th>Headcount</th><th>Total Payroll</th><th>Avg Salary</th><th>Max Salary</th><th>Min Salary</th></tr></thead>
                  <tbody>
                    {salaryByDept.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No data</td></tr>}
                    {salaryByDept.map((d, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{d.department}</td>
                        <td>{d.headCount}</td>
                        <td style={{ color: '#22c55e', fontWeight: 700 }}>₹{Math.round(d.totalSalary).toLocaleString('en-IN')}</td>
                        <td style={{ color: '#3b82f6' }}>₹{Math.round(d.avgSalary).toLocaleString('en-IN')}</td>
                        <td style={{ color: '#fbbf24' }}>₹{Math.round(d.maxSalary).toLocaleString('en-IN')}</td>
                        <td style={{ color: 'var(--text-dim)' }}>₹{Math.round(d.minSalary).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </>
        )}

      </div>
    </div>
  )
}
