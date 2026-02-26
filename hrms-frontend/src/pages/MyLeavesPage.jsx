import React, { useEffect, useState } from 'react'
import { getMyLeaveStatus, createLeave } from '../services/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import Loader from '../components/Loader'

const EMPTY = { startDate: '', endDate: '', leaveType: 'SICK_LEAVE', reason: '' }

const TYPE_LABELS = {
  SICK_LEAVE:   { label: 'Sick Leave',   icon: '🤒', color: '#f85149' },
  CASUAL_LEAVE: { label: 'Casual Leave', icon: '🏖️', color: '#58a6ff' },
  EARNED_LEAVE: { label: 'Earned Leave', icon: '🌟', color: '#3fb950' },
}

export default function MyLeavesPage() {
  const [leaves, setLeaves]   = useState([])   // now a list, not a single object
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(EMPTY)
  const [toast, setToast]     = useState(null)
  const [saving, setSaving]   = useState(false)
  const [filter, setFilter]   = useState('ALL')

  const load = async () => {
    setLoading(true)
    try {
      const r = await getMyLeaveStatus()
      // backend now returns List<LeaveResponseDTO>
      setLeaves(Array.isArray(r.data) ? r.data : [])
    } catch {
      setLeaves([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await createLeave(form)
      setToast({ msg: 'Leave request submitted!', type: 'success' })
      setModal(false); setForm(EMPTY); load()
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Failed to submit leave', type: 'error' })
    } finally { setSaving(false) }
  }

  const filtered = filter === 'ALL' ? leaves : leaves.filter(l => l.leaveStatus === filter)

  const counts = {
    total:    leaves.length,
    approved: leaves.filter(l => l.leaveStatus === 'APPROVED').length,
    pending:  leaves.filter(l => l.leaveStatus === 'PENDING').length,
    rejected: leaves.filter(l => l.leaveStatus === 'REJECTED').length,
  }

  if (loading) return <Loader />

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header fade-up">
        <h1 className="page-title">My Leaves</h1>
        <p className="page-subtitle">Apply and track all your leave requests</p>
      </div>

      <div className="page-body">
        {/* Summary stats */}
        <div className="stats-grid fade-up" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            { label: 'Total Applied', val: counts.total,    iconWrap: 'blue',   icon: '📋' },
            { label: 'Approved',      val: counts.approved, iconWrap: 'green',  icon: '✅' },
            { label: 'Pending',       val: counts.pending,  iconWrap: 'orange', icon: '⏳' },
            { label: 'Rejected',      val: counts.rejected, iconWrap: 'red',    icon: '❌' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card-inner">
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.val}</div>
                </div>
                <div className={`stat-icon-wrap ${s.iconWrap}`} style={{ fontSize: 20 }}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="content-topbar fade-up">
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
              <button key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            + Apply for Leave
          </button>
        </div>

        {/* Leave list */}
        <div className="card fade-up">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>{leaves.length === 0 ? 'No leave records yet. Apply for your first leave!' : 'No leaves match this filter.'}</p>
            </div>
          ) : (
            filtered.map((leave, i) => {
              const typeInfo = TYPE_LABELS[leave.leaveType] || { label: leave.leaveType, icon: '📄', color: 'var(--text-dim)' }
              const days = leave.startDate && leave.endDate
                ? Math.abs(new Date(leave.endDate) - new Date(leave.startDate)) / 86400000 + 1
                : '?'
              return (
                <div key={leave.id} className="leave-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${typeInfo.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, flexShrink: 0
                    }}>{typeInfo.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{typeInfo.label}</div>
                      <div className="leave-date-range">
                        <span>{leave.startDate}</span>
                        <span className="leave-arrow">→</span>
                        <span>{leave.endDate}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({days} day{days !== 1 ? 's' : ''})</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{leave.id}</span>
                    <span className={`badge badge-${leave.leaveStatus?.toLowerCase()}`}>
                      {leave.leaveStatus}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {modal && (
        <Modal title="Apply for Leave" onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input className="form-input" type="date" required value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input className="form-input" type="date" required value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Leave Type *</label>
              <select className="form-select" value={form.leaveType}
                onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                <option value="SICK_LEAVE">🤒 Sick Leave</option>
                <option value="CASUAL_LEAVE">🏖️ Casual Leave</option>
                <option value="EARNED_LEAVE">🌟 Earned Leave</option>
              </select>
            </div>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Reason (optional)</label>
              <input className="form-input" value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="Brief reason for leave…" />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
