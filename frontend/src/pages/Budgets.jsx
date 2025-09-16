import React, { useEffect, useState } from 'react'
import api from '../services/api.js'
import { handleAmountChange, isValidAmount, handleAmountPaste } from '../utils/inputValidation.js'
import { useNavigate } from 'react-router-dom'

export default function Budgets(){
  const [items, setItems] = useState([])
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7))
  const [form, setForm] = useState({ category:'Food', limit:'', month: new Date().toISOString().slice(0,7) })
  const [usage, setUsage] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const token = localStorage.getItem('jwt')
    console.log("Token value in budgets:", token)
    if(!token){
      navigate('/login')
      return
    }
    
    // Get user info from localStorage
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo))
      } catch (e) {
        console.error('Error parsing stored user info:', e)
      }
    }
  }, [navigate])

  async function load(){
    try {
      setLoading(true)
      const { data } = await api.get('/budgets')
      setItems(data.items || [])
      const u = await api.get('/budgets/usage/' + month)
      setUsage(u.data.usage || [])
    } catch (error) {
      console.error('Error loading budgets:', error)
      setItems([])
      setUsage([])
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(()=>{ load() }, [month])

  async function save(e){
    e.preventDefault()
    if (!form.limit || !form.category) return
    
    // Validate amount before submission
    if (!isValidAmount(form.limit)) {
      alert('Please enter a valid budget limit (positive number)')
      return
    }
    
    setSubmitting(true)
    try {
      await api.post('/budgets', { ...form, limit: Number(form.limit) })
      setForm({ ...form, limit:'' })
      load()
    } catch (error) {
      console.error('Error saving budget:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getTotalBudget = () => {
    return usage.reduce((sum, item) => sum + (item.limit || 0), 0)
  }

  const getTotalSpent = () => {
    return usage.reduce((sum, item) => sum + (item.spent || 0), 0)
  }

  const getRemainingBudget = () => {
    return getTotalBudget() - getTotalSpent()
  }

  const getBudgetUtilization = () => {
    if (getTotalBudget() === 0) return 0
    return (getTotalSpent() / getTotalBudget()) * 100
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.1 13.34L2 19.44L4.56 22L10.66 15.9L8.1 13.34ZM19.07 4.93C20.88 6.74 20.88 9.6 19.07 11.41L13.41 17.07C12.63 17.85 11.37 17.85 10.59 17.07L6.93 13.41C6.15 12.63 6.15 11.37 6.93 10.59L12.59 4.93C14.4 3.12 17.26 3.12 19.07 4.93Z" fill="currentColor"/>
        </svg>
      ),
      'Transport': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.92 6C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6ZM6.5 6.5H17.5L19 12H5L6.5 6.5ZM7 13.5C7.83 13.5 8.5 14.17 8.5 15S7.83 16.5 7 16.5 5.5 15.83 5.5 15 6.17 13.5 7 13.5ZM17 13.5C17.83 13.5 18.5 14.17 18.5 15S17.83 16.5 17 16.5 15.5 15.83 15.5 15 16.17 13.5 17 13.5Z" fill="currentColor"/>
        </svg>
      ),
      'Entertainment': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 3H3C1.9 3 1 3.9 1 5V19C1 20.1 1.9 21 3 21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3ZM21 19H3V5H21V19ZM8 15V9L13 12L8 15Z" fill="currentColor"/>
        </svg>
      ),
      'Shopping': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z" fill="currentColor"/>
        </svg>
      ),
      'Health': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      ),
      'Education': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" fill="currentColor"/>
        </svg>
      ),
      'Travel': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="currentColor"/>
        </svg>
      ),
      'Utilities': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 3V7H11V3H13ZM20 10H16V8H20V10ZM4 10H8V8H4V10ZM13 17V21H11V17H13ZM20 14H16V12H20V14ZM4 14H8V12H4V14ZM17 6H7C5.9 6 5 6.9 5 8V16C5 17.1 5.9 18 7 18H17C18.1 18 19 17.1 19 16V8C19 6.9 18.1 6 17 6ZM17 16H7V8H17V16Z" fill="currentColor"/>
        </svg>
      ),
      'Other': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C9.79 6 8 7.79 8 10S9.79 14 12 14 16 12.21 16 10 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10S10.9 8 12 8 14 8.9 14 10 13.1 12 12 12Z" fill="currentColor"/>
        </svg>
      )
    }
    return icons[category] || icons['Other']
  }

  const getProgressColor = (percent) => {
    if (percent >= 100) return '#ef4444'
    if (percent >= 80) return '#f59e0b'
    if (percent >= 60) return '#eab308'
    return '#10b981'
  }

  if (loading) {
    return (
      <div className="budgets-container">
        <div className="budgets-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading your budgets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="budgets-container">
      <div className="budgets-content">
        {/* Header Section */}
        <div className="budgets-header">
          <div className="header-info">
            <h1>Budget Management</h1>
            <p>Set limits and track your spending across categories</p>
          </div>
          <div className="summary-cards">
            <div className="summary-card total-budget">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="card-content">
                <h3>Total Budget</h3>
                <p className="amount">{formatCurrency(getTotalBudget())}</p>
              </div>
            </div>
            <div className="summary-card total-spent">
              <div className="card-icon">💸</div>
              <div className="card-content">
                <h3>Total Spent</h3>
                <p className="amount">{formatCurrency(getTotalSpent())}</p>
              </div>
            </div>
            <div className="summary-card remaining">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V16H7V10ZM11 6H13V16H11V6ZM15 8H17V16H15V8Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="card-content">
                <h3>Remaining</h3>
                <p className={`amount ${getRemainingBudget() >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(getRemainingBudget())}
                </p>
              </div>
            </div>
            <div className="summary-card utilization">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <h3>Utilization</h3>
                <p className="amount">{getBudgetUtilization().toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Set Budget Form */}
        <div className="set-budget-section">
          <div className="section-header">
            <h2>Set New Budget</h2>
            <p>Create spending limits for different categories</p>
          </div>
          <form onSubmit={save} className="budget-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input 
                  id="category"
                  placeholder="Enter category" 
                  value={form.category} 
                  onChange={e=>setForm({...form, category:e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="month">Month</label>
                <input 
                  id="month"
                  type="month" 
                  value={form.month} 
                  onChange={e=>setForm({...form, month:e.target.value})}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="limit">Budget Limit</label>
              <input 
                id="limit"
                type="text" 
                placeholder="Enter budget limit" 
                value={form.limit} 
                onChange={e => handleAmountChange(e, setForm, 'limit', form)}
                onKeyPress={e => {
                  // Prevent non-numeric characters except decimal point
                  if (!/[0-9.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                onPaste={handleAmountPaste}
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <>
                  <span className="btn-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
                    </svg>
                  </span>
                  <span>Set Budget</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Budget Usage Section */}
        <div className="budget-usage-section">
          <div className="section-header">
            <h2>Budget Usage</h2>
            <div className="month-selector">
              <label htmlFor="monthFilter">Select Month:</label>
              <input 
                id="monthFilter"
                type="month" 
                value={month} 
                onChange={e=>setMonth(e.target.value)} 
                className="month-input"
              />
            </div>
          </div>
          
          <div className="budget-usage-container">
            {usage && usage.length > 0 ? (
              <div className="budget-cards">
                {usage.map(budget => (
                  <div key={budget.category} className="budget-card">
                    <div className="budget-card-header">
                      <div className="category-info">
                        <span className="category-icon">{getCategoryIcon(budget.category)}</span>
                        <h3>{budget.category}</h3>
                      </div>
                      <div className="budget-status">
                        <span className={`status-badge ${budget.percent >= 100 ? 'over' : budget.percent >= 80 ? 'warning' : 'good'}`}>
                          {budget.percent >= 100 ? 'Over Budget' : budget.percent >= 80 ? 'Near Limit' : 'On Track'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="budget-amounts">
                      <div className="amount-row">
                        <span className="amount-label">Spent:</span>
                        <span className="amount-value spent">{formatCurrency(budget.spent || 0)}</span>
                      </div>
                      <div className="amount-row">
                        <span className="amount-label">Limit:</span>
                        <span className="amount-value limit">{formatCurrency(budget.limit || 0)}</span>
                      </div>
                      <div className="amount-row">
                        <span className="amount-label">Remaining:</span>
                        <span className={`amount-value ${(budget.limit - budget.spent) >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency((budget.limit || 0) - (budget.spent || 0))}
                        </span>
                      </div>
                    </div>
                    
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${Math.min(budget.percent || 0, 100)}%`,
                            backgroundColor: getProgressColor(budget.percent || 0)
                          }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        {Math.round(budget.percent || 0)}% used
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-budgets">
                <div className="no-budgets-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z" fill="currentColor"/>
                  </svg>
                </div>
                <h3>No Budgets Found</h3>
                <p>Create your first budget to start tracking your spending</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
