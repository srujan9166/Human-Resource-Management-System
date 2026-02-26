import React, { useEffect, useState, useCallback } from 'react'
import { getAllLeaves, approveLeave, rejectLeave, getLeaveSummary } from '../services/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import Loader from '../components/Loader'

export default function LeavesPage() {
  const [leaves, setLeaves]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('ALL')
  const [toast, setToast]         = useState(null)
  const [summaryId, setSummaryId] = useState('')
  const [summary, setSummary]     = useState(null)
  const [modalSummary, setModalSummary] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await getAllLeaves(); setLeaves(r.data) }
    catch { setToast({ msg:'Failed to load leaves', type:'error' }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleApprove = async id => {
    try { await approveLeave(id); setToast({ msg:'Leave approved!', type:'success' }); load() }
    catch { setToast({ msg:'Failed', type:'error' }) }
  }
  const handleReject = async id => {
    try { await rejectLeave(id); setToast({ msg:'Leave rejected', type:'success' }); load() }
    catch { setToast({ msg:'Failed', type:'error' }) }
  }
  const handleSummary = async e => {
    e.preventDefault()
    try {
      const r = await getLeaveSummary(summaryId)
      setSummary(r.data); setModalSummary(true)
    } catch { setToast({ msg:'No summary found for that ID', type:'error' }) }
  }

  const filtered = leaves.filter(l => filter === 'ALL' || l.leaveStatus === filter)

  if (loading) return <Loader/>

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      <div className="page-header fade-up">
        <h1 className="page-title">Leave Management</h1>
        <p className="page-subtitle">{leaves.length} total · {leaves.filter(l=>l.leaveStatus==='PENDING').length} pending</p>
      </div>

      <div className="page-body">
        {/* Summary lookup */}
        <div className="card fade-up" style={{marginBottom:20}}>
          <div className="card-title">◎ Employee Leave Summary</div>
          <form onSubmit={handleSummary} style={{display:'flex',gap:12,alignItems:'flex-end'}}>
            <div className="form-group" style={{flex:1,marginBottom:0}}>
              <label className="form-label">Employee ID</label>
              <input className="form-input" type="number" value={summaryId}
                onChange={e => setSummaryId(e.target.value)} placeholder="Enter employee ID…" required/>
            </div>
            <button type="submit" className="btn btn-ghost">View Summary</button>
          </form>
        </div>

        <div className="content-topbar fade-up">
          <div style={{display:'flex',gap:8}}>
            {['ALL','PENDING','APPROVED','REJECTED'].map(f => (
              <button key={f}
                className={`btn btn-sm ${filter===f ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        <div className="card fade-up">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Emp ID</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan="6" style={{textAlign:'center',color:'var(--muted)',padding:40}}>No leaves found</td></tr>
                )}
                {filtered.map(leave => (
                  <tr key={leave.id}>
                    <td style={{color:'var(--muted)'}}>#{leave.id}</td>
                    <td>EMP-{leave.employeeId}</td>
                    <td>{leave.startDate}</td>
                    <td>{leave.endDate}</td>
                    <td><span className={`badge badge-${leave.leaveStatus?.toLowerCase()}`}>{leave.leaveStatus}</span></td>
                    <td>
                      {leave.leaveStatus === 'PENDING' ? (
                        <div style={{display:'flex',gap:8}}>
                          <button className="btn btn-success btn-sm" onClick={() => handleApprove(leave.id)}>Approve</button>
                          <button className="btn btn-danger btn-sm"  onClick={() => handleReject(leave.id)}>Reject</button>
                        </div>
                      ) : (
                        <span style={{color:'var(--muted)',fontSize:13}}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalSummary && summary && (
        <Modal title={`Leave Summary — EMP-${summary.employeeId}`} onClose={() => setModalSummary(false)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
            {[
              { label:'Total Leaves',   val: summary.totalLeaves,    color:'var(--text)' },
              { label:'Total Days',     val: summary.totalLeaveDays, color:'var(--text)' },
              { label:'Approved',       val: summary.approvedLeaves, color:'var(--success)' },
              { label:'Rejected',       val: summary.rejectedLeaves, color:'var(--danger)' },
              { label:'Pending',        val: summary.pendingLeaves,  color:'var(--warning)' },
            ].map(item => (
              <div key={item.label} className="payroll-item">
                <div className="payroll-item-label">{item.label}</div>
                <div className="payroll-item-value" style={{fontSize:28,color:item.color}}>{item.val}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
