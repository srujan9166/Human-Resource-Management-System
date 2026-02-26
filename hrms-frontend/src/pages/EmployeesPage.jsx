import React, { useEffect, useState, useCallback } from 'react'
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee, createManager } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import Loader from '../components/Loader'

const EMPTY_FORM = { name:'', email:'', designation:'', joiningDate:'', salary:'', status:'ACTIVE', department_id:'' }
const EMPTY_MANAGER_FORM = { name:'', email:'', salary:'', joiningDate:'', status:'ACTIVE' }

export default function EmployeesPage() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)   // 'create' | 'edit'
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editId, setEditId]       = useState(null)
  const [toast, setToast]         = useState(null)
  const [search, setSearch]       = useState('')
  const [saving, setSaving]       = useState(false)
  const [managerForm, setManagerForm] = useState(EMPTY_MANAGER_FORM)

  const canEdit = ['ADMIN','CEO','MANAGER'].includes(user?.role)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await getAllEmployees(); setEmployees(r.data) }
    catch { setToast({ msg:'Failed to load employees', type:'error' }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setModal('form') }
  const openCreateManager = () => { setManagerForm(EMPTY_MANAGER_FORM); setModal('manager') }
  const openEdit   = emp => {
    setForm({
      name: emp.name, email: emp.email,
      designation: emp.designation || '',
      joiningDate: emp.joiningDate || '',
      salary: emp.salary, status: emp.status,
      department_id: emp.department_id || ''
    })
    setEditId(emp.employee_id)
    setModal('form')
  }

  const handleManagerSubmit = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await createManager({ ...managerForm, designation: 'Manager', salary: Number(managerForm.salary) })
      setToast({ msg: 'Manager created successfully!', type:'success' })
      setModal(null); load()
    } catch (err) {
      setToast({ msg: err?.response?.data?.message || 'Failed to create manager', type:'error' })
    } finally { setSaving(false) }
  }

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editId) await updateEmployee(editId, form)
      else        await createEmployee(form)
      setToast({ msg: editId ? 'Employee updated!' : 'Employee created!', type:'success' })
      setModal(null); load()
    } catch { setToast({ msg:'Operation failed', type:'error' }) }
    finally { setSaving(false) }
  }

  const handleDelete = async emp => {
    if (!confirm(`Set ${emp.name} as INACTIVE?`)) return
    try {
      await deleteEmployee(emp.employee_id)
      setToast({ msg:'Employee set to INACTIVE', type:'success' }); load()
    } catch { setToast({ msg:'Delete failed', type:'error' }) }
  }

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.designation?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Loader/>

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      <div className="page-header fade-up">
        <h1 className="page-title">Employees</h1>
        <p className="page-subtitle">{employees.length} total · {employees.filter(e=>e.status==='ACTIVE').length} active</p>
      </div>

      <div className="page-body">
        <div className="content-topbar fade-up">
          <input
            className="form-input" style={{maxWidth:300}}
            placeholder="Search by name, email, role…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {canEdit && (
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-primary" onClick={openCreate}>+ New Employee</button>
              {user?.role === 'CEO' && (
                <button className="btn btn-primary" style={{background:'var(--purple,#9f79e8)'}} onClick={openCreateManager}>+ Create Manager</button>
              )}
            </div>
          )}
        </div>

        <div className="card fade-up">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Email</th><th>Designation</th>
                  <th>Salary</th><th>Joining Date</th><th>Status</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan="8" style={{textAlign:'center',color:'var(--muted)',padding:40}}>No employees found</td></tr>
                )}
                {filtered.map(emp => (
                  <tr key={emp.employee_id}>
                    <td style={{color:'var(--muted)'}}>#{emp.employee_id}</td>
                    <td><strong>{emp.name}</strong></td>
                    <td style={{color:'var(--muted)',fontSize:13}}>{emp.email}</td>
                    <td>{emp.designation || '—'}</td>
                    <td>₹{emp.salary?.toLocaleString('en-IN')}</td>
                    <td style={{fontSize:13}}>{emp.joiningDate || '—'}</td>
                    <td>
                      <span className={`badge badge-${emp.status?.toLowerCase()}`}>{emp.status}</span>
                    </td>
                    {canEdit && (
                      <td>
                        <div style={{display:'flex',gap:8}}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(emp)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp)}>Deactivate</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal === 'form' && (
        <Modal title={editId ? 'Edit Employee' : 'New Employee'} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" required value={form.name}
                  onChange={e => setForm({...form, name:e.target.value})} placeholder="John Doe"/>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" required value={form.email}
                  onChange={e => setForm({...form, email:e.target.value})} placeholder="john@company.com"/>
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input className="form-input" value={form.designation}
                  onChange={e => setForm({...form, designation:e.target.value})} placeholder="Software Engineer"/>
              </div>
              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input className="form-input" type="date" value={form.joiningDate}
                  onChange={e => setForm({...form, joiningDate:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Salary (₹) *</label>
                <input className="form-input" type="number" required value={form.salary}
                  onChange={e => setForm({...form, salary:e.target.value})} placeholder="50000"/>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status}
                  onChange={e => setForm({...form, status:e.target.value})}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department ID</label>
                <input className="form-input" type="number" value={form.department_id}
                  onChange={e => setForm({...form, department_id:e.target.value})} placeholder="1"/>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editId ? 'Update' : 'Create Employee'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'manager' && (
        <Modal title="Create Manager" onClose={() => setModal(null)}>
          <form onSubmit={handleManagerSubmit}>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" required value={managerForm.name}
                  onChange={e => setManagerForm({...managerForm, name:e.target.value})} placeholder="Jane Smith"/>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" required value={managerForm.email}
                  onChange={e => setManagerForm({...managerForm, email:e.target.value})} placeholder="jane@company.com"/>
              </div>
              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input className="form-input" type="date" value={managerForm.joiningDate}
                  onChange={e => setManagerForm({...managerForm, joiningDate:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Salary (₹) *</label>
                <input className="form-input" type="number" required value={managerForm.salary}
                  onChange={e => setManagerForm({...managerForm, salary:e.target.value})} placeholder="80000"/>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={managerForm.status}
                  onChange={e => setManagerForm({...managerForm, status:e.target.value})}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Creating…' : 'Create Manager'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
