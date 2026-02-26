import React, { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('hrms_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback(async (username, password) => {
    const credentials = btoa(`${username}:${password}`)
    const headers = { Authorization: `Basic ${credentials}` }

    // Test credentials — will throw 401 if wrong
    await axios.get('/employees', { headers })

    let role = 'EMPLOYEE'
    if (username === 'admin') role = 'ADMIN'
    else if (username === 'ceo') role = 'CEO'
    else {
      try {
        await axios.get('/payroll/1', { headers })
        role = 'MANAGER'
      } catch { role = 'EMPLOYEE' }
    }

    const userData = { username, credentials, role }
    setUser(userData)
    sessionStorage.setItem('hrms_user', JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Basic ${credentials}`
    return userData
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem('hrms_user')
    delete axios.defaults.headers.common['Authorization']
  }, [])

  if (user && !axios.defaults.headers.common['Authorization']) {
    axios.defaults.headers.common['Authorization'] = `Basic ${user.credentials}`
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
