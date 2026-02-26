import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage      from './pages/LoginPage'
import Dashboard      from './pages/Dashboard'
import EmployeesPage  from './pages/EmployeesPage'
import DepartmentsPage from './pages/DepartmentsPage'
import LeavesPage     from './pages/LeavesPage'
import MyLeavesPage   from './pages/MyLeavesPage'
import PayrollPage    from './pages/PayrollPage'
import ReportsPage    from './pages/ReportsPage'
import Sidebar        from './components/Sidebar'

function PrivateLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar/>
      <main className="main-content">{children}</main>
    </div>
  )
}

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace/>
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace/>
  return <PrivateLayout>{children}</PrivateLayout>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/"/> : <LoginPage/>}/>

      <Route path="/" element={
        <ProtectedRoute><Dashboard/></ProtectedRoute>
      }/>
      <Route path="/employees" element={
        <ProtectedRoute roles={['ADMIN','CEO','MANAGER']}><EmployeesPage/></ProtectedRoute>
      }/>
      <Route path="/departments" element={
        <ProtectedRoute roles={['ADMIN','CEO','MANAGER']}><DepartmentsPage/></ProtectedRoute>
      }/>
      <Route path="/leaves" element={
        <ProtectedRoute roles={['ADMIN','CEO','MANAGER']}><LeavesPage/></ProtectedRoute>
      }/>
      <Route path="/my-leaves" element={
        <ProtectedRoute roles={['EMPLOYEE']}><MyLeavesPage/></ProtectedRoute>
      }/>
      <Route path="/payroll" element={
        <ProtectedRoute roles={['ADMIN','CEO','MANAGER']}><PayrollPage/></ProtectedRoute>
      }/>
      <Route path="/reports" element={
        <ProtectedRoute roles={['ADMIN','CEO','MANAGER']}><ReportsPage/></ProtectedRoute>
      }/>

      <Route path="*" element={<Navigate to="/"/>}/>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
    </AuthProvider>
  )
}
