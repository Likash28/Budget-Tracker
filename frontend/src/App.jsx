import React from 'react'
import { NavLink, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  
  // Check if user is on login page
  const isLoginPage = location.pathname === '/login'
  
  // Check if user is on a protected route
  const isProtectedRoute = !isLoginPage

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Redirect to login if user is not authenticated and trying to access protected routes
  useEffect(() => {
    if (!tokenState && isProtectedRoute) {
      nav('/login')
    }
  }, [tokenState, isProtectedRoute, nav])

  // Manage body classes based on navbar visibility
  useEffect(() => {
    if (isLoginPage || !tokenState) {
      document.body.classList.add('no-navbar')
      document.body.classList.remove('auth-page')
    } else {
      document.body.classList.remove('no-navbar')
      document.body.classList.remove('auth-page')
    }
    
    return () => {
      document.body.classList.remove('no-navbar')
      document.body.classList.remove('auth-page')
    }
  }, [isLoginPage, tokenState])

  function logout(){
    setToken('')
    setTokenState('')
    nav('/login')
  }

  return (
    <div>
      {/* Only show navbar if user is logged in and not on login page */}
      {tokenState && !isLoginPage && (
        <nav className={`main-navbar ${isScrolled ? 'scrolled' : ''}`}>
          <div className="nav-container">
            <div className="nav-brand">
              <span className="brand-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="url(#gradient1)"/>
                  <path d="M19 15L19.5 18L22 18.5L19.5 19L19 22L18.5 19L16 18.5L18.5 18L19 15Z" fill="url(#gradient2)"/>
                  <path d="M5 11L5.5 13L7 13.5L5.5 14L5 16L4.5 14L3 13.5L4.5 13L5 11Z" fill="url(#gradient3)"/>
                  <defs>
                    <linearGradient id="gradient1" x1="12" y1="2" x2="12" y2="16" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#667eea"/>
                      <stop offset="1" stopColor="#764ba2"/>
                    </linearGradient>
                    <linearGradient id="gradient2" x1="19" y1="15" x2="19" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#f093fb"/>
                      <stop offset="1" stopColor="#f5576c"/>
                    </linearGradient>
                    <linearGradient id="gradient3" x1="5" y1="11" x2="5" y2="16" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#4facfe"/>
                      <stop offset="1" stopColor="#00f2fe"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <span onClick={()=>nav('/')} className="brand-text">BudgetTracker</span>
            </div>
            <div className="nav-links">
              <NavLink to="/" className="nav-link">
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
                  </svg>
                </span>
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/transactions" className="nav-link">
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V8H20V18ZM20 6H4V6H20V6Z" fill="currentColor"/>
                  </svg>
                </span>
                <span>Transactions</span>
              </NavLink>
              <NavLink to="/budgets" className="nav-link">
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
                  </svg>
                </span>
                <span>Budgets</span>
              </NavLink>
              <NavLink to="/groups" className="nav-link">
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 4C18.21 4 20 5.79 20 8S18.21 12 16 12 12 10.21 12 8 13.79 4 16 4ZM16 10C17.1 10 18 9.1 18 8S17.1 6 16 6 14 6.9 14 8 14.9 10 16 10ZM8 4C10.21 4 12 5.79 12 8S10.21 12 8 12 4 10.21 4 8 5.79 4 8 4ZM8 10C9.1 10 10 9.1 10 8S9.1 6 8 6 6 6.9 6 8 6.9 10 8 10ZM8 14C5.33 14 0 15.34 0 18V20H2V18C2 16.45 4.42 15 8 15S14 16.45 14 18V20H16V18C16 15.34 10.67 14 8 14ZM16 14C13.33 14 8 15.34 8 18V20H24V18C24 15.34 18.67 14 16 14Z" fill="currentColor"/>
                  </svg>
                </span>
                <span>Groups</span>
              </NavLink>
              <NavLink to="/reports" className="nav-link">
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V16H7V10ZM11 6H13V16H11V6ZM15 8H17V16H15V8Z" fill="currentColor"/>
                  </svg>
                </span>
                <span>Reports</span>
              </NavLink>
            </div>
            <div className="nav-auth">
              <button onClick={logout} className="auth-link logout-link">
                <span className="auth-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
                  </svg>
                </span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </nav>
      )}
      
      <div className={tokenState && !isLoginPage ? "container" : ""}>
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
