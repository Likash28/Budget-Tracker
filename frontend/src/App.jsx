import React from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import Budgets from './pages/Budgets.jsx'
import Groups from './pages/Groups.jsx'
import Reports from './pages/Reports.jsx'
import { useState, useEffect } from 'react'
import { setToken, getToken } from './services/api.js'

export default function App(){
  const [tokenState, setTokenState] = useState(getToken())
  const [isScrolled, setIsScrolled] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function logout(){
    setToken('')
    setTokenState('')
    nav('/login')
  }

  return (
    <div>
      <nav className={`main-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-icon">💰</span>
            <span onClick={()=>nav('/')} className="brand-text">BudgetTracker</span>
          </div>
          <div className="nav-links">
            <NavLink to="/" className="nav-link">
              <span className="nav-icon">🏠</span>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/transactions" className="nav-link">
              <span className="nav-icon">💳</span>
              <span>Transactions</span>
            </NavLink>
            <NavLink to="/budgets" className="nav-link">
              <span className="nav-icon">🎯</span>
              <span>Budgets</span>
            </NavLink>
            <NavLink to="/groups" className="nav-link">
              <span className="nav-icon">👥</span>
              <span>Groups</span>
            </NavLink>
            <NavLink to="/reports" className="nav-link">
              <span className="nav-icon">📊</span>
              <span>Reports</span>
            </NavLink>
          </div>
          <div className="nav-auth">
            {!tokenState ? (
              <NavLink to="/login" className="auth-link login-link">
                <span className="auth-icon">🔑</span>
                <span>Login</span>
              </NavLink>
            ) : (
              <button onClick={logout} className="auth-link logout-link">
                <span className="auth-icon">🚪</span>
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/login" element={<Login onLogin={(t, userInfo)=>{ 
            setToken(t); 
            setTokenState(t); 
            if (userInfo) {
              localStorage.setItem('userInfo', JSON.stringify(userInfo));
            }
            nav('/'); 
          }} />} />
        </Routes>
      </div>
    </div>
  )
}
