import React, { useState } from 'react'
import { getEmployeePayroll, getDepartmentPayroll, getAllDepartments } from '../services/api'
import Toast from '../components/Toast'

export default function PayrollPage() {
  const [mode, setMode]         = useState('employee')  // 'employee' | 'department'
  const [empId, setEmpId]       = useState('')
  const [deptId, setDeptId]     = useState('')
  const [empData, setEmpData]   = useState(null)
  const [deptData, setDeptData] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [toast, setToast]       = useState(null)

  const fetchEmp = async e => {
    e.preventDefault(); setLoading(true); setEmpData(null)
    try { const r = await getEmployeePayroll(empId); setEmpData(r.data) }
    catch { setToast({ msg:'Employee not found or access denied', type:'error' }) }
    finally { setLoading(false) }
  }

  const fetchDept = async e => {
    e.preventDefault(); setLoading(true); setDeptData(null)
    try { const r = await getDepartmentPayroll(deptId); setDeptData(r.data) }
    catch { setToast({ msg:'Department not found or access denied', type:'error' }) }
    finally { setLoading(false) }
  }

  return (
    <div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      <div className="page-header fade-up">
        <h1 className="page-title">Payroll</h1>
        <p className="page-subtitle">Salary breakdown and department payroll reports</p>
      </div>

      <div className="page-body">
        {/* Mode toggle */}
        <div style={{display:'flex',gap:8,marginBottom:24}} className="fade-up">
          <button className={`btn ${mode==='employee'?'btn-primary':'btn-ghost'}`}
            onClick={() => setMode('employee')}>◈ Employee Payroll</button>
          <button className={`btn ${mode==='department'?'btn-primary':'btn-ghost'}`}
            onClick={() => setMode('department')}>◫ Department Payroll</button>
        </div>

        {/* Employee lookup */}
        {mode === 'employee' && (
          <div className="fade-up">
            <div className="card" style={{marginBottom:24}}>
              <div className="card-title">Employee Salary Breakdown</div>
              <form onSubmit={fetchEmp} style={{display:'flex',gap:12,alignItems:'flex-end'}}>
                <div className="form-group" style={{flex:1,marginBottom:0}}>
                  <label className="form-label">Employee ID</label>
                  <input className="form-input" type="number" required value={empId}
                    onChange={e => setEmpId(e.target.value)} placeholder="e.g. 1"/>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '…' : 'Calculate'}
                </button>
              </form>
            </div>

            {empData && (
              <div className="card fade-up">
                <div style={{marginBottom:20}}>
                  <div style={{fontFamily:'var(--font-head)',fontSize:22,fontWeight:700}}>{empData.employeeName}</div>
                  <div style={{color:'var(--muted)',fontSize:14}}>{empData.designation} · EMP-{empData.employeeId}</div>
                </div>

                <div className="payroll-breakdown">
                  <div className="payroll-item">
                    <div className="payroll-item-label">Basic Salary</div>
                    <div className="payroll-item-value">₹{empData.basicSalary?.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="payroll-item">
                    <div className="payroll-item-label">HRA (40%)</div>
                    <div className="payroll-item-value">₹{empData.hra?.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="payroll-item deduct">
                    <div className="payroll-item-label">PF Deduction (12%)</div>
                    <div className="payroll-item-value">−₹{empData.pfDeduction?.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="payroll-item net">
                    <div className="payroll-item-label">Net Salary</div>
                    <div className="payroll-item-value">₹{empData.netSalary?.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div style={{
                  background:'var(--surface2)', borderRadius:'var(--radius)',
                  padding:'14px 18px', fontSize:13, color:'var(--muted)',
                  display:'flex',gap:20
                }}>
                  <span>Formula: Basic + HRA − PF</span>
                  <span style={{color:'var(--accent)'}}>
                    ₹{empData.basicSalary?.toLocaleString('en-IN')} + ₹{empData.hra?.toLocaleString('en-IN')} − ₹{empData.pfDeduction?.toLocaleString('en-IN')} = ₹{empData.netSalary?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Department lookup */}
        {mode === 'department' && (
          <div className="fade-up">
            <div className="card" style={{marginBottom:24}}>
              <div className="card-title">Department Payroll Report</div>
              <form onSubmit={fetchDept} style={{display:'flex',gap:12,alignItems:'flex-end'}}>
                <div className="form-group" style={{flex:1,marginBottom:0}}>
                  <label className="form-label">Department ID</label>
                  <input className="form-input" type="number" required value={deptId}
                    onChange={e => setDeptId(e.target.value)} placeholder="e.g. 1"/>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '…' : 'Generate Report'}
                </button>
              </form>
            </div>

            {deptData && (
              <div className="fade-up">
                <div className="card" style={{marginBottom:16}}>
                  <div style={{fontFamily:'var(--font-head)',fontSize:22,fontWeight:700,marginBottom:16}}>
                    {deptData.departmentName}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12}}>
                    {[
                      { label:'Total Basic',   val: deptData.totalBasicSalary },
                      { label:'Total HRA',     val: deptData.totalHra },
                      { label:'Total PF',      val: deptData.totalPfDeduction, deduct:true },
                      { label:'Total Net',     val: deptData.totalNetSalary,   net:true },
                      { label:'Average Net',   val: deptData.averageNetSalary },
                    ].map(item => (
                      <div key={item.label} className={`payroll-item ${item.net?'net':''} ${item.deduct?'deduct':''}`}>
                        <div className="payroll-item-label">{item.label}</div>
                        <div className="payroll-item-value" style={{fontSize:18}}>
                          {item.deduct ? '−' : ''}₹{item.val?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">Individual Breakdown ({deptData.employeePayrolls?.length} active)</div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Employee</th><th>Designation</th><th>Basic</th><th>HRA</th><th>PF</th><th>Net</th></tr>
                      </thead>
                      <tbody>
                        {deptData.employeePayrolls?.map(emp => (
                          <tr key={emp.employeeId}>
                            <td>
                              <div style={{fontWeight:600}}>{emp.employeeName}</div>
                              <div style={{fontSize:12,color:'var(--muted)'}}>EMP-{emp.employeeId}</div>
                            </td>
                            <td style={{color:'var(--muted)',fontSize:13}}>{emp.designation}</td>
                            <td>₹{emp.basicSalary?.toLocaleString('en-IN')}</td>
                            <td>₹{emp.hra?.toLocaleString('en-IN')}</td>
                            <td style={{color:'var(--danger)'}}>₹{emp.pfDeduction?.toLocaleString('en-IN')}</td>
                            <td style={{color:'var(--accent)',fontWeight:700}}>₹{emp.netSalary?.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
