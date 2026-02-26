import React, { useEffect, useState, useCallback } from 'react'
import {
  getAllDepartments, createDepartment,
  getDepartmentEmployees, assignManagerToDepartment,
  getDepartmentPayroll
} from '../services/api'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import Loader from '../components/Loader'

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState(null)
  const [selected, setSelected]       = useState(null)
  const [deptEmployees, setDeptEmployees] = useState([])
  const [deptPayroll, setDeptPayroll]     = useState(null)
  const [createName, setCreateName]   = useState('')
  const [assignDeptId, setAssignDeptId]   = useState('')
  const [assignEmpId, setAssignEmpId]     = useState('')
  const [toast, setToast]             = useState(null)
  const [saving, setSaving]           = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await getAllDepartments(); setDepartments(r.data) }
    catch { setToast({ msg:'Failed to load', type:'error' }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openDetail = async dept => {
    setSelected(dept)
    const [emps, payroll] = await Promise.allSettled([
      getDepartmentEmployees(dept.department_id),
      getDepartmentPayroll(dept.department_id)
    ])
    setDeptEmployees(emps.status === 'fulfilled' ? emps.value.data : [])
    setDeptPayroll(payroll.status === 'fulfilled' ? payroll.value.data : null)
    setModal('detail')
  }

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await createDepartment({ name: createName })
      setToast({ msg:'Department created!', type:'success' })
      setModal(null); setCreateName(''); load()
    } catch { setToast({ msg:'Failed to create', type:'error' }) }
    finally { setSaving(false) }
  }

  const handleAssign = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await assignManagerToDepartment(assignDeptId, assignEmpId)
      setToast({ msg:'Manager assigned!', type:'success' })
      setModal(null); setAssignDeptId(''); setAssignEmpId(''); load()
    } catch { setToast({ msg:'Assignment failed', type:'error' }) }
    finally { setSaving(false) }
  }

  if (loading) return <Loader/>

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      <div className="page-header fade-up">
        <h1 className="page-title">Departments</h1>
        <p className="page-subtitle">{departments.length} departments</p>
      </div>

      <div className="page-body">
        <div className="content-topbar fade-up">
          <div/>
          <div style={{display:'flex',gap:12}}>
            <button className="btn btn-ghost" onClick={() => setModal('assign')}>Assign Manager</button>
            <button className="btn btn-primary" onClick={() => setModal('create')}>+ New Department</button>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16}}>
          {departments.map((dept, i) => (
            <div key={dept.department_id}
              className="card fade-up"
              style={{animationDelay:`${i*0.06}s`, cursor:'pointer', transition:'border-color 0.2s'}}
              onClick={() => openDetail(dept)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <span style={{
                  fontFamily:'var(--font-head)', fontSize:32, fontWeight:800,
                  color:'rgba(232,197,71,0.15)', lineHeight:1
                }}>◫</span>
                <span style={{fontSize:11,color:'var(--muted)',fontWeight:600}}>ID #{dept.department_id}</span>
              </div>
              <div style={{fontFamily:'var(--font-head)',fontSize:20,fontWeight:700,marginBottom:6}}>{dept.name}</div>
              <div style={{fontSize:13,color:'var(--muted)'}}>
                Manager ID: {dept.manager_id ? `EMP-${dept.manager_id}` : 'Unassigned'}
              </div>
              <div style={{fontSize:13,color:'var(--muted)',marginTop:4}}>
                {dept.employees?.length || 0} employees
              </div>
              <div style={{marginTop:14,fontSize:12,color:'var(--accent)'}}>Click to view details →</div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Dept Modal */}
      {modal === 'create' && (
        <Modal title="New Department" onClose={() => setModal(null)}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Department Name *</label>
              <input className="form-input" required value={createName}
                onChange={e => setCreateName(e.target.value)} placeholder="e.g. Engineering"/>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Manager Modal */}
      {modal === 'assign' && (
        <Modal title="Assign Manager to Department" onClose={() => setModal(null)}>
          <form onSubmit={handleAssign}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Department ID *</label>
                <input className="form-input" type="number" required value={assignDeptId}
                  onChange={e => setAssignDeptId(e.target.value)} placeholder="1"/>
              </div>
              <div className="form-group">
                <label className="form-label">Employee ID (Manager) *</label>
                <input className="form-input" type="number" required value={assignEmpId}
                  onChange={e => setAssignEmpId(e.target.value)} placeholder="2"/>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Assigning…' : 'Assign Manager'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detail Modal */}
      {modal === 'detail' && selected && (
        <Modal title={selected.name} onClose={() => setModal(null)}>
          <div style={{marginBottom:20}}>
            <p style={{color:'var(--muted)',fontSize:13}}>Department ID: #{selected.department_id}</p>
            <p style={{color:'var(--muted)',fontSize:13}}>
              Manager: {selected.manager_id ? `EMP-${selected.manager_id}` : 'Unassigned'}
            </p>
          </div>

          {deptPayroll && (
            <div style={{marginBottom:20}}>
              <div className="card-title">Payroll Summary</div>
              <div className="payroll-breakdown">
                <div className="payroll-item"><div className="payroll-item-label">Total Net</div>
                  <div className="payroll-item-value net" style={{fontSize:18}}>₹{deptPayroll.totalNetSalary?.toLocaleString('en-IN')}</div></div>
                <div className="payroll-item"><div className="payroll-item-label">Avg Net</div>
                  <div className="payroll-item-value" style={{fontSize:18}}>₹{deptPayroll.averageNetSalary?.toLocaleString('en-IN')}</div></div>
              </div>
            </div>
          )}

          <div className="card-title">Employees ({deptEmployees.length})</div>
          {deptEmployees.length === 0
            ? <p style={{color:'var(--muted)'}}>No employees</p>
            : deptEmployees.map(e => (
              <div key={e.employee_id} style={{
                display:'flex',justifyContent:'space-between',alignItems:'center',
                padding:'10px 0',borderBottom:'1px solid var(--border)'
              }}>
                <div>
                  <div style={{fontWeight:600}}>{e.name}</div>
                  <div style={{fontSize:12,color:'var(--muted)'}}>{e.designation}</div>
                </div>
                <span className={`badge badge-${e.status?.toLowerCase()}`}>{e.status}</span>
              </div>
            ))
          }
        </Modal>
      )}
    </div>
  )
}
