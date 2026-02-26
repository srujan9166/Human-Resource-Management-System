import axios from 'axios'

// ── Employees ────────────────────────────────────────
export const getAllEmployees          = ()           => axios.get('/employees')
export const getEmployeeById         = (id)         => axios.get(`/employees/${id}`)
export const createEmployee          = (data)       => axios.post('/employees/create', data)
export const updateEmployee          = (id, data)   => axios.put(`/employees/${id}`, data)
export const deleteEmployee          = (id)         => axios.delete(`/employees/${id}`)
export const createManager           = (data)       => axios.post('/employees/createManager', data)

// ── Departments ──────────────────────────────────────
export const getAllDepartments        = ()              => axios.get('/department/departments')
export const getDepartmentById        = (id)            => axios.get(`/department/${id}`)
export const createDepartment         = (data)          => axios.post('/department/create', data)
export const getDepartmentEmployees   = (id)            => axios.get(`/department/${id}/employees`)
export const createEmployeeInDept     = (id, data)      => axios.post(`/department/${id}/employees`, data)
export const assignManagerToDepartment = (deptId, empId) => axios.put(`/department/${deptId}/assign/${empId}`)

// ── Leaves ───────────────────────────────────────────
export const getAllLeaves     = ()     => axios.get('/leaves/allLeaves')
export const getAllApproved   = ()     => axios.get('/leaves/allApproved')
export const getTodayLeaves   = ()     => axios.get('/leaves/active-today')
export const getMyLeaveStatus = ()     => axios.get('/leaves/leaveStatus')
export const getLeaveSummary  = (id)   => axios.get(`/leaves/${id}/leaves/summary`)
export const createLeave      = (data) => axios.post('/leaves/leaveRequest', data)
export const approveLeave     = (id)   => axios.put(`/leaves/${id}/approve`)
export const rejectLeave      = (id)   => axios.put(`/leaves/${id}/reject`)

// ── Payroll ──────────────────────────────────────────
export const getEmployeePayroll   = (id)     => axios.get(`/payroll/${id}`)
export const getDepartmentPayroll = (deptId) => axios.get(`/payroll/department/${deptId}`)

// ── Reports ──────────────────────────────────────────
export const getReportSummary         = ()          => axios.get('/report/summary')
export const getTopEarners            = (limit = 5) => axios.get(`/report/top-earn?limit=${limit}`)
export const getRecentJoiners         = (months = 6) => axios.get(`/report/recent-join?months=${months}`)
export const getDepartmentHeadCount   = ()          => axios.get('/report/department-headcount')
export const getLeaveTypeStats        = ()          => axios.get('/report/leave-type-stats')
export const getSalaryByDepartment    = ()          => axios.get('/report/salary-by-department')
export const getStatusDistribution    = ()          => axios.get('/report/status-distribution')
export const getSalaryPartition       = ()          => axios.get('/report/salary-partition')
export const getHighSalaryDepartments = (threshold) => axios.get(`/report/high-salary-departments?threshold=${threshold}`)
