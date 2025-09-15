import React, { useEffect, useState } from 'react'
import api from '../services/api.js'
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
      'Food': '🍽️',
      'Transport': '🚗',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Health': '🏥',
      'Education': '📚',
      'Travel': '✈️',
      'Utilities': '⚡',
      'Other': '📦'
    }
    return icons[category] || '📦'
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
              <div className="card-icon">💰</div>
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
              <div className="card-icon">📊</div>
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
                type="number" 
                placeholder="Enter budget limit" 
                value={form.limit} 
                onChange={e=>setForm({...form, limit:e.target.value})}
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <>
                  <span className="btn-icon">🎯</span>
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
                <div className="no-budgets-icon">🎯</div>
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
